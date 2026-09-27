import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';

const HIGH = new Set([
  'access_restricted',
  'view_restricted_case',
  'insights_denied',
  'access_denied',
  'user_removed',
]);

export interface ActorContext {
  name: string;
  role?: string;
  scope?: string;
  ip?: string;
}

@Injectable()
export class AuditService {
  constructor(@InjectRepository(AuditLog) private readonly repo: Repository<AuditLog>) {}

  log(
    actor: ActorContext,
    action: string,
    opts: { label?: string; target?: string; detail?: string; severity?: string } = {},
  ) {
    const entry = this.repo.create({
      at: new Date(),
      actor: actor.name,
      role: actor.role || null,
      scope: actor.scope || null,
      action,
      label: opts.label || action,
      target: opts.target || null,
      detail: opts.detail || null,
      ip: actor.ip || null,
      severity: opts.severity || (HIGH.has(action) ? 'high' : 'normal'),
    });
    return this.repo.save(entry);
  }

  async find(filter: { action?: string; q?: string; highOnly?: boolean; limit?: number }) {
    const qb = this.repo.createQueryBuilder('a').orderBy('a.at', 'DESC').take(filter.limit || 500);
    if (filter.action) qb.andWhere('a.action = :action', { action: filter.action });
    if (filter.highOnly) qb.andWhere("a.severity = 'high'");
    if (filter.q) {
      qb.andWhere(
        '(a.actor ILIKE :q OR a.label ILIKE :q OR a.target ILIKE :q OR a.detail ILIKE :q OR a.scope ILIKE :q)',
        { q: `%${filter.q}%` },
      );
    }
    return qb.getMany();
  }
}
