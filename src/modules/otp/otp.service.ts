import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, IsNull } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { OtpCode } from './entities/otp-code.entity';
import { MailService } from '../mail/mail.service';
import { AuditService } from '../audit/audit.service';

export interface OtpActor {
  id: string;
  name: string;
  email?: string | null;
  role?: string;
  scope?: string;
  ip?: string;
}

const TTL_MIN = 10;
const GRANT_MIN = 30;
const MAX_ATTEMPTS = 5;

const purposeLabel = (p: string, ref?: string | null) =>
  p === 'restricted'
    ? 'the Restricted SEA/SH register'
    : `restricted case ${ref || ''}`.trim();

@Injectable()
export class OtpService {
  constructor(
    @InjectRepository(OtpCode) private readonly repo: Repository<OtpCode>,
    private readonly mail: MailService,
    private readonly audit: AuditService,
  ) {}

  private code6() {

    let s = '';
    for (let i = 0; i < 6; i++) s += Math.floor(Math.random() * 10);
    return s;
  }

  async request(actor: OtpActor, purpose: string, caseRef?: string) {
    if (!['restricted', 'case'].includes(purpose)) {
      throw new BadRequestException('Unknown access purpose');
    }
    if (!actor.email) {
      throw new BadRequestException('No email on file for this account — contact an administrator');
    }

    await this.repo.delete({ userId: actor.id, purpose, caseRef: caseRef ?? IsNull(), consumedAt: IsNull() });

    await this.repo.delete({ expiresAt: LessThan(new Date(Date.now() - 60 * 60 * 1000)) });

    const code = this.code6();
    const entry = this.repo.create({
      userId: actor.id,
      email: actor.email,
      purpose,
      caseRef: caseRef ?? null,
      codeHash: await bcrypt.hash(code, 10),
      expiresAt: new Date(Date.now() + TTL_MIN * 60 * 1000),
      consumedAt: null,
      attempts: 0,
    });
    await this.repo.save(entry);

    await this.mail.sendOtp(actor.email, actor.name, code, purposeLabel(purpose, caseRef), TTL_MIN);
    await this.audit.log(
      { name: actor.name, role: actor.role, scope: actor.scope, ip: actor.ip },
      'otp_issued',
      { label: 'Access code issued', target: caseRef || purpose, detail: `One-time code emailed for ${purposeLabel(purpose, caseRef)}`, severity: 'high' },
    );

    const masked = actor.email.replace(/^(.).*(@.*)$/, (_, a, b) => `${a}***${b}`);
    return { sent: true, email: masked, ttlMinutes: TTL_MIN };
  }

  async verify(actor: OtpActor, purpose: string, code: string, caseRef?: string) {
    const entry = await this.repo.findOne({
      where: { userId: actor.id, purpose, caseRef: caseRef ?? IsNull(), consumedAt: IsNull() },
      order: { createdAt: 'DESC' },
    });
    if (!entry || entry.expiresAt < new Date()) {
      throw new BadRequestException('That code has expired — request a new one');
    }
    if (entry.attempts >= MAX_ATTEMPTS) {
      await this.repo.delete({ id: entry.id });
      throw new BadRequestException('Too many attempts — request a new code');
    }
    const ok = await bcrypt.compare(String(code || '').trim(), entry.codeHash);
    if (!ok) {
      entry.attempts += 1;
      await this.repo.save(entry);
      throw new BadRequestException('Incorrect code');
    }
    entry.consumedAt = new Date();
    await this.repo.save(entry);

    await this.audit.log(
      { name: actor.name, role: actor.role, scope: actor.scope, ip: actor.ip },
      purpose === 'restricted' ? 'access_restricted' : 'view_restricted_case',
      {
        label: purpose === 'restricted' ? 'Opened restricted SEA/SH register' : 'Opened restricted case',
        target: caseRef || purpose,
        detail: 'Identity-verified via one-time access code; user accepted the liability disclaimer',
        severity: 'high',
      },
    );
    return { ok: true, grantMinutes: GRANT_MIN };
  }
}
