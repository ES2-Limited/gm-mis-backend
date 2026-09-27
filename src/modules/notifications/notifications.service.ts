import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { User } from '../users/entities/user.entity';
import { MailService } from '../mail/mail.service';

export interface Recipient { name: string; scope?: string; isSuperAdmin?: boolean }

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification) private readonly repo: Repository<Notification>,
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly mail: MailService,
  ) {}

  create(data: Partial<Notification>) {
    return this.repo.save(this.repo.create(data));
  }

  private scope(user: Recipient) {
    const qb = this.repo.createQueryBuilder('n');
    if (!user.isSuperAdmin) {
      qb.where(
        '(n.recipientName = :name OR (n.recipientScope IS NOT NULL AND n.recipientScope = :scope))',
        { name: user.name, scope: user.scope || '—' },
      );
    }
    return qb;
  }

  list(user: Recipient) {
    return this.scope(user).orderBy('n.created_at', 'DESC').take(60).getMany();
  }

  unreadCount(user: Recipient) {
    return this.scope(user).andWhere('n.read = false').getCount();
  }

  async markRead(id: string) {
    await this.repo.update({ id }, { read: true });
    return { id, read: true };
  }

  async markAllRead(user: Recipient) {
    if (user.isSuperAdmin) {
      await this.repo.createQueryBuilder().update().set({ read: true }).where('read = false').execute();
    } else {
      await this.repo
        .createQueryBuilder()
        .update()
        .set({ read: true })
        .where('read = false AND (recipientName = :name OR recipientScope = :scope)', {
          name: user.name,
          scope: user.scope || '—',
        })
        .execute();
    }
    return { ok: true };
  }

  async notifyAssignment(c: any, officerName: string) {
    await this.create({
      recipientName: officerName,
      type: 'assigned',
      title: `New case assigned — ${c.code}`,
      body: `${c.category} · ${c.lga ? c.lga + ', ' : ''}${c.state}`,
      caseId: c.id,
      caseCode: c.code,
      severity: c.priority === 'high' ? 'high' : 'normal',
    });
    const officer = await this.users.findOne({ where: { name: officerName, status: 'active' } });
    if (officer?.email) {
      this.mail.sendCaseAssigned(officer.email, officerName, c).catch(() => undefined);
    }
  }

  notifyEscalation(c: any) {
    return this.create({
      recipientScope: c.state,
      type: 'escalation',
      title: `Case escalated to Level ${c.tier} — ${c.code}`,
      body: `${c.category} · ${c.state} · now with ${c.responsibleUnit}`,
      caseId: c.id,
      caseCode: c.code,
      severity: c.tier >= 4 ? 'high' : 'normal',
    });
  }

  notifySlaBreach(c: any) {
    return this.create({
      recipientScope: c.state,
      type: 'sla_breach',
      title: `SLA breached — ${c.code}`,
      body: `${c.category} · ${c.state} · due ${c.dueAt ? new Date(c.dueAt).toDateString() : '—'}`,
      caseId: c.id,
      caseCode: c.code,
      severity: 'high',
    });
  }
}
