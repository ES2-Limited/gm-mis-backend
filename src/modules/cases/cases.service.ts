import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Case } from './entities/case.entity';
import { Category } from '../taxonomy/entities/category.entity';
import { User } from '../users/entities/user.entity';
import { SettingsService } from '../settings/settings.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AuditService } from '../audit/audit.service';
import { defaultPermissions, tierLabel, maxTierFor, StateModel } from '../../common/rbac';
import {
  CreateCaseDto, AddNoteDto, AssignDto, StatusDto,
  EscalateDto, CorrectiveActionDto, AppealDto, SatisfactionDto, ReferDto,
} from './dto/case.dto';

export interface Actor { id?: string; name: string; role?: string; scope?: string; tier?: number; isSuperAdmin?: boolean; permissions?: string[] }

function entryTierFor(actor?: Actor): number {
  return /Community Grievance Focal/i.test(actor?.role || '') ? 1 : 2;
}

const DAY = 86400000;
const now = () => new Date();
const iso = () => new Date().toISOString();
const rid = (p: string) => `${p}-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e4).toString(36)}`;
const TIER_DAYS_DEFAULT: Record<string, number | null> = { '1': 7, '2': 14, '3': 20, '4': 30 };

const FLOW_NEXT: Record<string, string[]> = {
  received: ['acknowledged'],
  acknowledged: ['screening'],
  screening: ['under_investigation'], // "Project Related" advances; "Not Project Related" closes
  assigned: ['under_investigation'], // legacy escape hatch for any pre-migration case
  under_investigation: ['resolved'],
  escalated: ['under_investigation'], // the higher level takes ownership and works it
  referred: ['closed'], // GBV/SEA-SH: handed to an external body, then closed out
  resolved: ['closed'],
  closed: [], // terminal
};

const OPEN_STATUSES = ['received', 'acknowledged', 'screening', 'assigned', 'under_investigation', 'escalated', 'referred'];
const isOpenStatus = (s: string) => OPEN_STATUSES.includes(s);

function escalationTargets(tier: number, model: StateModel): number[] {
  if (tier === 1) return [2];
  if (model === 2) return tier === 2 ? [3] : [];
  if (tier === 2) return [3, 4];
  if (tier === 3) return [4];
  return [];
}

function returnTargets(tier: number): number[] {
  const out: number[] = [];
  for (let t = 2; t < tier; t++) out.push(t);
  return out;
}

@Injectable()
export class CasesService {
  constructor(
    @InjectRepository(Case) private readonly repo: Repository<Case>,
    @InjectRepository(Category) private readonly categories: Repository<Category>,
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly settings: SettingsService,
    private readonly notifications: NotificationsService,
    private readonly audit: AuditService,
  ) {}

  private async findRestrictedOwner(state: string): Promise<string | null> {
    const candidates = await this.users.find({ where: { tier: 2, status: 'active' } });
    const owner = candidates.find((u) => {
      const inScope = u.scope === 'All states' || u.scope === state;

      const perms = Array.isArray(u.permissions) ? u.permissions : defaultPermissions(u.role);
      return inScope && perms.includes('restricted');
    });
    return owner?.name || null;
  }

  private async findLevel2Owner(state: string): Promise<string | null> {
    const candidates = await this.users.find({ where: { tier: 2, status: 'active' } });
    const inScope = (u: any) => u.scope === 'All states' || u.scope === state;
    const owner =
      candidates.find((u) => inScope(u) && /SPMU Admin/i.test(u.role || '')) ||
      candidates.find((u) => inScope(u));
    return owner?.name || null;
  }

  private logAudit(actor: Actor | undefined, action: string, label: string, target: string, detail?: string, severity?: string) {
    void this.audit.log(
      { name: actor?.name || 'System', role: actor?.role, scope: actor?.scope },
      action,
      { label, target, detail, severity },
    );
  }

  private async modelFor(state: string): Promise<StateModel> {
    const models = (await this.settings.get('stateModels')) as Record<string, number> | null;
    return models && models[state] === 2 ? 2 : 1;
  }

  private tierName(level: number, model: StateModel = 1) {
    return tierLabel(level, model);
  }

  private async tierDays(): Promise<Record<string, number | null>> {
    return (await this.settings.get('tierDays')) || TIER_DAYS_DEFAULT;
  }

  private async due(tier: number, since: Date): Promise<Date | null> {
    const max = (await this.tierDays())[String(tier)];
    return max ? new Date(since.getTime() + max * DAY) : null;
  }

  private async meta(category: string) {
    const c = await this.categories.findOne({ where: { name: category } });
    return {
      lead: c?.lead || null,
      priority: c?.priority || 'medium',
      startLevel: c?.startLevel || 1,
      restricted: c?.restricted || false,
    };
  }

  private async nextCode(state: string): Promise<string> {
    const st = state.slice(0, 3).toUpperCase();
    const d = now();
    const yymm = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, '0')}`;
    const seq = (await this.repo.count({ where: { state } })) + 1;
    return `SPIN-${st}-${yymm}-${String(seq).padStart(3, '0')}`;
  }

  private push(c: Case, type: string, note: string, by?: string) {
    c.activity = [...(c.activity || []), { type, note, by, at: iso() }];
  }

  private actorLevel(actor?: Actor): number | null {
    if (!actor) return null;
    if (actor.isSuperAdmin || !actor.scope || actor.scope === 'All states') return 4;
    return actor.tier ?? null;
  }

  private assertCanWork(actor: Actor | undefined, c: Case) {

    if (actor && c.assignedOfficer && c.assignedOfficer === actor.name) return;
    const federal =
      !!actor && (actor.isSuperAdmin || !actor.scope || actor.scope === 'All states');
    const lvl = this.actorLevel(actor);
    const inState = federal || actor?.scope === c.state;
    if (lvl != null && lvl === c.tier && inState) return;
    throw new ForbiddenException(
      `This case is being worked at Level ${c.tier}. Only that level can act on it.`,
    );
  }

  private resumeTarget(c: Case): string {
    const esc = (c.escalations || []) as Array<{ stageBefore?: string }>;
    let stage: string | undefined;
    for (let i = esc.length - 1; i >= 0; i--) {
      if (esc[i].stageBefore) {
        stage = esc[i].stageBefore;
        break;
      }
    }
    if (!stage) {
      const types = new Set((c.activity || []).map((a) => a.type));
      stage = types.has('under_investigation') ? 'under_investigation' : 'screening';
    }
    return stage === 'under_investigation' || stage === 'assigned'
      ? 'under_investigation'
      : 'screening';
  }

  async createCase(dto: CreateCaseDto, actor?: Actor) {
    const m = await this.meta(dto.category);
    const tierSince = now();
    const anonymous = !!dto.anonymous;

    const state =
      actor && !actor.isSuperAdmin && actor.scope && actor.scope !== 'All states'
        ? actor.scope
        : dto.state;
    const registeredBy = actor
      ? `${actor.name}${actor.role ? ' · ' + actor.role : ''}`
      : `Self-service · ${dto.channel || 'web'}`;

    const restrictedOwner = m.restricted ? await this.findRestrictedOwner(state) : null;

    const level2Owner = !actor && !m.restricted ? await this.findLevel2Owner(state) : null;
    const owner = restrictedOwner ?? level2Owner;

    const tier = m.restricted ? 2 : entryTierFor(actor);

    const c = this.repo.create({
      code: await this.nextCode(state),
      complainant: anonymous ? 'Anonymous' : dto.complainant || 'Unknown',
      phone: anonymous ? null : dto.phone || null,
      email: anonymous ? null : dto.email || null,
      anonymous,
      state,
      lga: dto.lga || null,
      community: dto.community || null,
      lat: dto.lat ?? null,
      lng: dto.lng ?? null,
      category: dto.category,
      subcategory: dto.subcategory || null,
      channel: dto.channel || (actor ? 'back_office' : 'self_service'),
      channelDetail: dto.channelDetail || null,
      priority: dto.priority || m.priority,

      status: m.restricted || actor || level2Owner ? 'acknowledged' : 'received',
      tier,
      tierSince,
      responsibleUnit: m.restricted
        ? `SEA/SH Focal Person · ${state}`
        : `Level ${tier} GRC · ${state}`,
      assignedOfficer: owner,
      narrative: dto.narrative || null,
      description: dto.description,
      dueAt: await this.due(tier, tierSince),
      notes: [],
      correctiveActions: [],
      appeals: [],
      escalations: [],
      activity: [],
      registeredBy,
    });
    this.push(c, 'received', `Grievance received via ${c.channel}`, registeredBy);
    if (m.restricted) {
      this.push(
        c,
        'acknowledged',
        restrictedOwner
          ? `Confidential SEA/SH case routed to ${restrictedOwner} (Level 2 focal person)`
          : 'Confidential SEA/SH case routed to the Level 2 SEA/SH desk',
        registeredBy,
      );
    } else if (actor) {
      this.push(c, 'acknowledged', 'Acknowledged at intake by the registering officer', registeredBy);
    } else if (level2Owner) {
      this.push(c, 'acknowledged',
        `Self-service case routed to ${level2Owner} (Level 2 — State PIU)`, registeredBy);
    }
    const saved = await this.repo.save(c);
    this.logAudit(actor, 'case_created', 'Registered case', saved.code, `${saved.category} · ${saved.state}`, m.restricted ? 'high' : undefined);
    if (owner) await this.notifications.notifyAssignment(saved, owner).catch(() => undefined);

    if (actor && !m.restricted && dto.screening) {
      return this.screen(saved.id, actor, dto.screening, dto.screeningReason, dto.legacy, dto.legacyReferral);
    }
    return this.present(saved);
  }

  private scoped(user: Actor) {
    const qb = this.repo.createQueryBuilder('c').orderBy('c.created_at', 'DESC');
    if (!user.isSuperAdmin && user.scope && user.scope !== 'All states') {
      qb.where('c.state = :state', { state: user.scope });
    }
    return qb;
  }

  private canSeeRestricted(user: Actor): boolean {
    return !!user.isSuperAdmin || (user.permissions || []).includes('restricted');
  }

  private async restrictedCategoryNames(): Promise<string[]> {
    const rows = await this.categories.find({ where: { restricted: true } });
    return rows.map((r) => r.name);
  }

  private async isRestrictedCase(c: Case): Promise<boolean> {
    return (await this.restrictedCategoryNames()).includes(c.category);
  }

  private readonly REFERRAL_ONLY_MSG =
    'Confidential SEA/SH & GBV cases follow the referral pathway — they are not screened, investigated, or escalated. Use “Refer to a body” instead.';

  private async applyConfidentiality(qb: any, user: Actor): Promise<string[]> {
    const names = await this.restrictedCategoryNames();
    if (!this.canSeeRestricted(user) && names.length) {
      qb.andWhere('c.category NOT IN (:...restrictedNames)', { restrictedNames: names });
    }
    return names;
  }

  async findAll(user: Actor, filters: { status?: string; state?: string; category?: string; channel?: string; q?: string; restricted?: boolean } = {}) {
    const qb = this.scoped(user);
    const restrictedNames = await this.applyConfidentiality(qb, user);

    if (filters.restricted && this.canSeeRestricted(user) && restrictedNames.length) {
      qb.andWhere('c.category IN (:...onlyRestricted)', { onlyRestricted: restrictedNames });
    }
    if (filters.status) qb.andWhere('c.status = :status', { status: filters.status });
    if (filters.state) qb.andWhere('c.state = :s', { s: filters.state });
    if (filters.category) qb.andWhere('c.category = :cat', { cat: filters.category });
    if (filters.channel) qb.andWhere('c.channel = :ch', { ch: filters.channel });
    if (filters.q) qb.andWhere('(c.code ILIKE :q OR c.complainant ILIKE :q)', { q: `%${filters.q}%` });
    const rows = await qb.getMany();
    return rows.map((c) => this.present(c));
  }

  async findOne(id: string, user: Actor) {
    const qb = this.scoped(user).andWhere('c.id = :id', { id });
    await this.applyConfidentiality(qb, user);
    const c = await qb.getOne();
    if (!c) throw new NotFoundException('Case not found');
    return this.present(c);
  }

  private isOverdue(c: Case) {
    if (['resolved', 'closed'].includes(c.status)) return false;
    return !!c.dueAt && new Date(c.dueAt) < now();
  }

  private present(c: Case) {
    return { ...c, overdue: this.isOverdue(c) };
  }

  private async getRaw(id: string) {
    const c = await this.repo.findOne({ where: { id } });
    if (!c) throw new NotFoundException('Case not found');
    return c;
  }

  async setStatus(id: string, dto: StatusDto, actor: Actor) {
    const c = await this.getRaw(id);
    this.assertCanWork(actor, c);

    if (await this.isRestrictedCase(c) && !(c.status === 'referred' && dto.status === 'closed')) {
      throw new BadRequestException(this.REFERRAL_ONLY_MSG);
    }

    const allowed = c.status === 'escalated' ? [this.resumeTarget(c)] : FLOW_NEXT[c.status] || [];
    if (!allowed.includes(dto.status)) {
      throw new BadRequestException(
        `Cannot move a case from "${c.status}" to "${dto.status}". The next allowed step is ${
          allowed.length ? allowed.map((s) => `"${s}"`).join(' or ') : 'none — this case is closed'
        }.`,
      );
    }

    const remark = (dto.note || '').trim();
    if (dto.status === 'resolved' && !remark) {
      throw new BadRequestException('Add a resolution remark — describe how this grievance was resolved.');
    }

    if (dto.status === 'under_investigation' && c.status === 'screening') c.screening = 'project_related';
    const from = c.status;
    c.status = dto.status;
    if (['resolved', 'closed'].includes(dto.status) && !c.resolvedAt) c.resolvedAt = now();
    if (remark) {
      c.notes = [...(c.notes || []), { id: rid('n'), body: remark, by: actor.name, role: actor.role, at: iso(), status: dto.status }];
    }
    this.push(c, dto.status, remark ? `Marked ${dto.status}: ${remark}` : `Status set to ${dto.status}`, actor.name);
    const saved = await this.repo.save(c);
    void from;
    this.logAudit(actor, 'case_status', 'Changed case status', saved.code, `Status → ${dto.status}${remark ? ` (${remark})` : ''}`);
    return this.present(saved);
  }

  async screen(
    id: string,
    actor: Actor,
    decision?: string,
    reason?: string,
    legacy?: boolean,
    legacyReferral?: string,
  ) {
    const c = await this.getRaw(id);
    this.assertCanWork(actor, c);
    if (await this.isRestrictedCase(c)) {
      throw new BadRequestException(this.REFERRAL_ONLY_MSG);
    }
    if (!['acknowledged', 'screening'].includes(c.status)) {
      throw new BadRequestException(
        isOpenStatus(c.status)
          ? 'This case has already passed screening.'
          : 'This case is closed.',
      );
    }

    c.legacy = !!legacy;
    const notRelated = decision === 'not_project_related';
    if (notRelated) {
      const why = (reason || '').trim();
      if (!why) throw new BadRequestException('A reason is required to mark a case Not Project Related.');
      c.screening = 'not_project_related';
      if (c.legacy) this.push(c, 'screening', 'Flagged as a Legacy grievance (predates SPIN)', actor.name);
      this.push(c, 'screening', 'Screened — Not project related', actor.name);
      c.status = 'closed';
      if (!c.resolvedAt) c.resolvedAt = now();
      c.notes = [...(c.notes || []), { id: rid('n'), body: `Not project related: ${why}`, by: actor.name, role: actor.role, at: iso() }];
      this.push(c, 'closed', `Closed — Not project related: ${why}`, actor.name);
      const saved = await this.repo.save(c);
      this.logAudit(actor, 'case_status', 'Screened — closed (not project related)', saved.code, why);
      return this.present(saved);
    }

    c.screening = 'project_related';
    this.push(c, 'screening', 'Screened — Project related', actor.name);

    if (c.legacy) {
      const to = (legacyReferral || '').trim();
      if (!to) {
        throw new BadRequestException('This is a legacy grievance — name the institution/authority it is referred to.');
      }
      this.push(c, 'screening', 'Legacy grievance (predates SPIN)', actor.name);
      c.referrals = [
        ...(c.referrals || []),
        { id: rid('r'), body: to, bodyType: 'Legacy — appropriate authority', reason: `Legacy grievance referred to ${to}`, consent: null, by: actor.name, at: iso() },
      ];
      c.notes = [...(c.notes || []), { id: rid('n'), body: `Legacy grievance — referred to: ${to}`, by: actor.name, role: actor.role, at: iso() }];
      c.status = 'closed';
      if (!c.resolvedAt) c.resolvedAt = now();
      this.push(c, 'closed', `Closed — Legacy grievance, referred to ${to}`, actor.name);
      const saved = await this.repo.save(c);
      this.logAudit(actor, 'case_status', 'Screened — legacy grievance (referred out)', saved.code, to);
      return this.present(saved);
    }

    c.status = 'under_investigation';
    this.push(c, 'under_investigation', 'Moved to investigation', actor.name);
    const saved = await this.repo.save(c);
    this.logAudit(actor, 'case_status', 'Screened — project related', saved.code, 'Moved to investigation');
    return this.present(saved);
  }

  async markNotRelated(id: string, actor: Actor, reason?: string) {
    const c = await this.getRaw(id);
    this.assertCanWork(actor, c);
    if (await this.isRestrictedCase(c)) {
      throw new BadRequestException(this.REFERRAL_ONLY_MSG);
    }
    const SCREENED_ONWARD = ['screening', 'assigned', 'under_investigation', 'escalated'];
    if (!SCREENED_ONWARD.includes(c.status)) {
      throw new BadRequestException(
        c.status === 'received' || c.status === 'acknowledged'
          ? 'A case can only be marked Not Project Related once it has been screened.'
          : 'This case is already closed.',
      );
    }
    const why = (reason || '').trim();
    if (!why) {
      throw new BadRequestException('A reason is required to mark a case Not Project Related.');
    }
    c.screening = 'not_project_related';
    c.status = 'closed';
    if (!c.resolvedAt) c.resolvedAt = now();
    c.notes = [...(c.notes || []), { id: rid('n'), body: `Not project related: ${why}`, by: actor.name, role: actor.role, at: iso() }];
    this.push(c, 'closed', `Closed — Not project related: ${why}`, actor.name);
    const saved = await this.repo.save(c);
    this.logAudit(actor, 'case_status', 'Closed case (not project related)', saved.code, why);
    return this.present(saved);
  }

  async assign(id: string, dto: AssignDto, actor: Actor) {
    const c = await this.getRaw(id);
    c.assignedOfficer = dto.officer;

    if (c.status === 'screening' || c.status === 'escalated') {
      c.screening = c.screening || 'project_related';
      c.status = 'assigned';
    }
    this.push(c, 'assigned', `Assigned to ${dto.officer}`, actor.name);
    const saved = await this.repo.save(c);
    await this.notifications.notifyAssignment(saved, dto.officer);
    this.logAudit(actor, 'case_assigned', 'Assigned case', saved.code, `Assigned to ${dto.officer}`);
    return this.present(saved);
  }

  async escalate(id: string, dto: EscalateDto, actor: Actor) {
    const c = await this.getRaw(id);
    this.assertCanWork(actor, c);
    if (await this.isRestrictedCase(c)) {
      throw new BadRequestException(this.REFERRAL_ONLY_MSG);
    }
    if (!isOpenStatus(c.status)) {
      throw new BadRequestException('A closed case cannot be moved.');
    }
    if (c.status === 'received') {
      throw new BadRequestException('Acknowledge the case before moving it.');
    }

    const model = await this.modelFor(c.state);
    const up = escalationTargets(c.tier, model);
    const down = returnTargets(c.tier);
    const allowed = [...up, ...down];
    if (allowed.length === 0) {
      throw new BadRequestException('This case cannot be moved to another level.');
    }
    const toTier = dto.toTier != null ? Math.trunc(dto.toTier) : up[0];
    if (!allowed.includes(toTier)) {
      throw new BadRequestException(
        `A Level ${c.tier} case can move to ${allowed.map((l) => `Level ${l}`).join(', ')}.`,
      );
    }

    const reason = (dto.reason || '').trim();
    if (!reason) {
      throw new BadRequestException('Add a note explaining why you are moving this case to another level.');
    }
    return this.present(
      await this.doEscalate(c, reason, actor.name, toTier, dto.toOfficer),
    );
  }

  private async doEscalate(c: Case, reason: string, by: string, toTier?: number, toOfficer?: string) {
    const model = await this.modelFor(c.state);
    const from = c.tier;

    const to = toTier != null ? toTier : Math.min(maxTierFor(model), c.tier + 1);
    if (to === from) return c;
    const goingUp = to > from;
    const owner = (toOfficer || '').trim() || null;

    const stageBefore = c.status === 'escalated' ? this.resumeTarget(c) : c.status;
    c.escalations = [...(c.escalations || []), { id: rid('e'), from, to, reason, by, at: iso(), to_officer: owner, stageBefore }];
    c.tier = to;
    c.tierSince = now();
    c.dueAt = await this.due(to, c.tierSince);
    c.assignedOfficer = owner;
    c.responsibleUnit = `Level ${to} GRC · ${c.state}`;
    c.status = 'escalated';
    if (reason === 'sla_breach') c.autoEscalated = true;
    const verb = goingUp ? 'Escalated' : 'Returned';
    this.push(c, 'escalated', `${verb} to Level ${to} — ${this.tierName(to, model)}${owner ? ` · ${owner} now handles it` : ''} (${reason})`, by);
    const saved = await this.repo.save(c);
    if (owner) await this.notifications.notifyAssignment(saved, owner).catch(() => undefined);
    await this.notifications.notifyEscalation(saved);
    if (reason === 'sla_breach') await this.notifications.notifySlaBreach(saved);
    void this.audit.log({ name: by }, 'case_escalated', { label: `${verb} case`, target: saved.code, detail: `To Level ${to} — ${this.tierName(to, model)} (${reason})`, severity: reason === 'sla_breach' ? 'high' : 'normal' });
    return saved;
  }

  async refer(id: string, dto: ReferDto, actor: Actor) {
    const c = await this.getRaw(id);
    this.assertCanWork(actor, c);
    if (!this.canSeeRestricted(actor)) {
      throw new ForbiddenException('You are not cleared to refer this case.');
    }
    if (!isOpenStatus(c.status)) {
      throw new BadRequestException('A closed case cannot be referred.');
    }
    const body = (dto.body || '').trim();
    const reason = (dto.reason || '').trim();
    if (!body) throw new BadRequestException('Choose the body you are referring this case to.');
    if (!reason) throw new BadRequestException('Add a note describing the referral.');

    const riskLevel = (dto.riskLevel || '').trim();
    if (!riskLevel) throw new BadRequestException('Record the immediate safety check before referring.');
    if (dto.consent !== true) {
      throw new BadRequestException('The survivor must give informed consent before a referral can be made.');
    }
    c.referrals = [
      ...(c.referrals || []),
      {
        id: rid('r'),
        body,
        bodyType: dto.bodyType || null,
        reason,
        consent: true,
        riskLevel,
        safetyNote: (dto.safetyNote || '').trim() || null,
        by: actor.name,
        at: iso(),
      },
    ];
    c.status = 'referred';
    c.assignedOfficer = body;
    this.push(c, 'referred', `Referred to ${body}${dto.bodyType ? ` (${dto.bodyType})` : ''} — ${reason}`, actor.name);
    const saved = await this.repo.save(c);
    void this.audit.log(
      { name: actor.name, role: actor.role, scope: actor.scope },
      'case_referred',
      { label: 'Referred case', target: saved.code, detail: `To ${body}`, severity: 'high' },
    );
    return this.present(saved);
  }

  async addNote(id: string, dto: AddNoteDto, actor: Actor) {
    const c = await this.getRaw(id);
    this.assertCanWork(actor, c);

    c.notes = [...(c.notes || []), { id: rid('n'), body: dto.body.trim(), by: actor.name, role: actor.role, at: iso(), status: c.status }];
    this.push(c, 'note', `Note added`, actor.name);
    return this.present(await this.repo.save(c));
  }

  async saveInvestigation(id: string, data: Record<string, any>, actor: Actor) {
    const c = await this.getRaw(id);
    this.assertCanWork(actor, c);
    if (await this.isRestrictedCase(c)) {
      throw new BadRequestException(this.REFERRAL_ONLY_MSG);
    }

    if (c.status !== 'assigned' && c.status !== 'under_investigation') {
      throw new BadRequestException('Investigation can only be recorded once the case is assigned.');
    }
    c.investigation = { ...data, by: actor.name, at: iso() };
    if (c.status === 'assigned') c.status = 'under_investigation';
    this.push(c, 'investigation', 'Investigation record saved', actor.name);
    return this.present(await this.repo.save(c));
  }

  async addCorrectiveAction(id: string, dto: CorrectiveActionDto, actor: Actor) {
    const c = await this.getRaw(id);
    this.assertCanWork(actor, c);
    c.correctiveActions = [...(c.correctiveActions || []), { id: rid('ca'), ...dto, status: 'open', completedAt: null }];
    this.push(c, 'corrective', `Corrective action: ${dto.action}`, actor.name);
    return this.present(await this.repo.save(c));
  }

  async toggleCorrectiveAction(id: string, actionId: string) {
    const c = await this.getRaw(id);
    c.correctiveActions = (c.correctiveActions || []).map((a) =>
      a.id === actionId ? { ...a, status: a.status === 'open' ? 'closed' : 'open', completedAt: a.status === 'open' ? iso() : null } : a,
    );
    return this.present(await this.repo.save(c));
  }

  async addAppeal(id: string, dto: AppealDto, actor: Actor) {
    const c = await this.getRaw(id);
    const ref = `APL-${(c.code || '').replace(/[^0-9]/g, '').slice(-4) || '0001'}-${(c.appeals?.length || 0) + 1}`;
    c.appeals = [...(c.appeals || []), { id: rid('a'), ref, grounds: dto.grounds, desiredOutcome: dto.desiredOutcome, by: actor.name, at: iso(), decision: null }];
    this.push(c, 'appealed', `Appeal ${ref} submitted`, actor.name);
    await this.repo.save(c);
    return this.present(await this.doEscalate(c, 'appeal', actor.name));
  }

  async recordSatisfaction(id: string, dto: SatisfactionDto, actor: Actor) {
    const c = await this.getRaw(id);

    if (c.status !== 'resolved') {
      throw new BadRequestException('A case can only be closed from the Resolved stage.');
    }

    const appealDays = Number((await this.settings.get('appealDays')) ?? 14);
    if (appealDays > 0 && c.resolvedAt) {
      const windowEnd = new Date(c.resolvedAt).getTime() + appealDays * DAY;
      if (Date.now() < windowEnd) {
        throw new BadRequestException(
          `This case can only be closed after the ${appealDays}-day appeal window (closes ${new Date(windowEnd).toISOString().slice(0, 10)}).`,
        );
      }
    }
    c.satisfaction = { rating: dto.rating, comment: dto.comment || '', by: actor.name, at: iso() };
    c.status = 'closed';
    if (!c.resolvedAt) c.resolvedAt = now();
    this.push(c, 'closed', `Closed — complainant ${dto.rating}`, actor.name);
    return this.present(await this.repo.save(c));
  }

  async runAutoEscalation() {
    const open = await this.repo
      .createQueryBuilder('c')
      .where('c.status NOT IN (:...done)', { done: ['resolved', 'closed'] })
      .andWhere('c.due_at IS NOT NULL AND c.due_at < now()')
      .andWhere('c.tier < 4')
      .getMany();
    let n = 0;
    for (const c of open) {
      const model = await this.modelFor(c.state);
      if (c.tier >= maxTierFor(model)) continue;
      await this.doEscalate(c, 'sla_breach', 'System');
      n++;
    }
    return { escalated: n };
  }

  async stats(user: Actor) {
    const qb = this.scoped(user);
    await this.applyConfidentiality(qb, user);
    const rows = await qb.getMany();
    const open = rows.filter((c) => !['resolved', 'closed'].includes(c.status));
    const breached = open.filter((c) => this.isOverdue(c));
    const resolved = rows.filter((c) => c.resolvedAt);
    const group = (key: keyof Case) => {
      const m: Record<string, number> = {};
      rows.forEach((c) => { const k = String(c[key]); m[k] = (m[k] || 0) + 1; });
      return m;
    };
    const avgRes = resolved.length
      ? Math.round(
          (resolved.reduce((a, c) => a + (new Date(c.resolvedAt!).getTime() - new Date(c.createdAt).getTime()) / DAY, 0) / resolved.length) * 10,
        ) / 10
      : null;
    return {
      total: rows.length,
      open: open.length,
      breached: breached.length,
      resolved: resolved.length,
      resolutionRate: rows.length ? Math.round((resolved.length / rows.length) * 100) : 0,
      avgResolutionDays: avgRes,
      byStatus: group('status'),
      byCategory: group('category'),
      byState: group('state'),
      byChannel: group('channel'),
      byPriority: group('priority'),
    };
  }
}
