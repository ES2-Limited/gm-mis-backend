import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createHash, randomBytes } from 'crypto';
import { IntegrationKey } from './integration-key.entity';
import { CoverageState } from '../coverage/entities/coverage.entities';
import { Category } from '../taxonomy/entities/category.entity';

const sha256 = (s: string) => createHash('sha256').update(s).digest('hex');

@Injectable()
export class IntegrationService {
  constructor(
    @InjectRepository(IntegrationKey) private readonly repo: Repository<IntegrationKey>,
    @InjectRepository(CoverageState) private readonly states: Repository<CoverageState>,
    @InjectRepository(Category) private readonly categories: Repository<Category>,
  ) {}

  async schema() {
    const states = (await this.states.find({ where: { active: true }, order: { name: 'ASC' } })).map((s) => s.name);
    const cats = (await this.categories.find({ order: { sortOrder: 'ASC' } })).map((c) => ({
      id: c.id,
      name: c.name,
      domain: (c as any).domain ?? 'Other',
      subgroups: c.subgroups ?? [],
    }));
    return {
      endpoint: 'POST /api/integration/cases',
      auth: 'Header: x-api-key: <your key>',
      fields: {
        required: ['category', 'state', 'description'],
        optional: ['subcategory', 'lga', 'community', 'priority', 'anonymous', 'complainant', 'phone', 'email', 'lat', 'lng', 'narrative'],
      },
      priorities: ['low', 'medium', 'high'],
      states,
      categories: cats,
      note: "channel is set to 'self_service' automatically; the case is routed to Level 2 (State PIU). category must be one of the values below (its domain is derived automatically); subcategory must be one of that category's sub-groups.",
    };
  }

  async generate(actorName: string | undefined, label: string) {
    const clean = (label || '').trim();
    if (!clean) throw new BadRequestException('A channel name is required.');
    const raw = 'spin_live_' + randomBytes(24).toString('hex');
    const rec = this.repo.create({
      label: clean,
      prefix: raw.slice(0, 18),
      keyHash: sha256(raw),
      createdBy: actorName ?? null,
    });
    const saved = await this.repo.save(rec);

    return { key: raw, ...this.present(saved) };
  }

  async list() {
    const rows = await this.repo.find({ order: { createdAt: 'DESC' } });
    return rows.map((r) => this.present(r));
  }

  async resolveCategory(input?: string): Promise<string> {
    const v = (input || '').trim();
    if (!v) throw new BadRequestException('category is required.');
    let cat = await this.categories.findOne({ where: { name: v } });
    if (!cat && /^[0-9a-f-]{36}$/i.test(v)) {
      cat = await this.categories.findOne({ where: { id: v } });
    }
    if (!cat) throw new BadRequestException('Unknown category — GET /integration/schema for valid categories (id + name).');
    return cat.name;
  }

  async validState(input?: string): Promise<string> {
    const v = (input || '').trim();
    const s = v ? await this.states.findOne({ where: { name: v } }) : null;
    if (!s) throw new BadRequestException('Unknown state — GET /integration/schema for valid states.');
    return s.name;
  }

  async revoke(id: string) {
    const rec = await this.repo.findOne({ where: { id } });
    if (!rec) throw new NotFoundException('Key not found.');
    rec.revoked = true;
    return this.present(await this.repo.save(rec));
  }

  async verify(raw?: string): Promise<IntegrationKey> {
    const key = (raw || '').trim();
    if (!key.startsWith('spin_live_')) throw new UnauthorizedException('Missing or invalid API key.');
    const rec = await this.repo.findOne({ where: { prefix: key.slice(0, 18) } });
    if (!rec || rec.revoked || rec.keyHash !== sha256(key)) {
      throw new UnauthorizedException('Invalid or revoked API key.');
    }
    rec.lastUsedAt = new Date();
    rec.requests = (rec.requests ?? 0) + 1;
    await this.repo.save(rec);
    return rec;
  }

  private present(r: IntegrationKey) {
    return {
      id: r.id,
      label: r.label,
      prefix: r.prefix,
      scope: r.scope,
      createdBy: r.createdBy,
      lastUsedAt: r.lastUsedAt,
      requests: r.requests,
      revoked: r.revoked,
      createdAt: r.createdAt,
    };
  }
}
