import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomInt } from 'crypto';
import { ActivationCode } from './entities/activation-code.entity';
import { UsersService } from '../users/users.service';
import { DeviceActor } from './devices.service';

@Injectable()
export class ActivationService {
  constructor(
    @InjectRepository(ActivationCode) private readonly repo: Repository<ActivationCode>,
    private readonly users: UsersService,
  ) {}

  private async newCode(): Promise<string> {
    for (let i = 0; i < 60; i++) {
      const code = String(randomInt(0, 100000)).padStart(5, '0');
      if (!(await this.repo.findOne({ where: { code } }))) return code;
    }
    throw new BadRequestException('Could not generate a unique code, try again.');
  }

  private federal(actor: DeviceActor): boolean {
    return !!actor.isSuperAdmin || !actor.scope || actor.scope === 'All states';
  }

  async issue(actor: DeviceActor, userId: string, maxOfflineDays?: number): Promise<ActivationCode> {
    const user = await this.users.findOne(userId);
    if (!user) throw new NotFoundException('User not found.');
    if (!user.email) throw new BadRequestException('That user has no email on file.');
    const offline = Math.max(1, Math.min(365, Math.round(Number(maxOfflineDays) || 10)));
    if (!this.federal(actor) && user.scope !== actor.scope) {
      throw new ForbiddenException(
        `You can only issue activation codes for ${actor.scope} officers.`,
      );
    }

    await this.repo.update(
      { userEmail: user.email, status: 'pending' } as any,
      { status: 'revoked' },
    );
    const entity: ActivationCode = this.repo.create({
      code: await this.newCode(),
      userId: user.id,
      userEmail: user.email,
      userName: user.name,
      state: user.scope,
      role: user.role,
      tier: (user as any).tier ?? null,
      issuedBy: actor.name ?? null,
      maxOfflineDays: offline,
      status: 'pending',
    });
    return this.repo.save(entity);
  }

  async list(actor: DeviceActor): Promise<ActivationCode[]> {
    const scoped = !this.federal(actor);
    return this.repo.find({
      where: scoped ? { state: actor.scope } : {},
      order: { createdAt: 'DESC' },
    });
  }

  async revoke(actor: DeviceActor, id: string): Promise<ActivationCode> {
    const code = await this.repo.findOne({ where: { id } });
    if (!code) throw new NotFoundException('Code not found.');
    if (!this.federal(actor) && code.state !== actor.scope) {
      throw new ForbiddenException('Out of your scope.');
    }
    code.status = 'revoked';
    return this.repo.save(code);
  }

  async activate(code: string, deviceId: string) {
    const c = code?.trim().toUpperCase();
    if (!c || !deviceId) throw new BadRequestException('Code and device are required.');
    const rec = await this.repo.findOne({ where: { code: c } });
    if (!rec) throw new BadRequestException('Invalid activation code.');
    if (rec.status === 'revoked') throw new BadRequestException('This code has been revoked.');
    if (rec.status === 'activated' && rec.deviceId !== deviceId) {
      throw new BadRequestException('This code is already in use on another phone.');
    }
    if (rec.status === 'pending') {
      rec.status = 'activated';
      rec.deviceId = deviceId;
      rec.activatedAt = new Date();
      await this.repo.save(rec);
    }

    return {
      email: rec.userEmail,
      name: rec.userName,
      state: rec.state,
      role: rec.role,
      tier: rec.tier,
      maxOfflineDays: rec.maxOfflineDays,
    };
  }
}
