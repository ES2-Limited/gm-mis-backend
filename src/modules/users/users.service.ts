import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  NATIONAL_ROLES,
  defaultPermissions,
  withImpliedModules,
  ModuleKey,
  MODULES,
} from '../../common/rbac';
import { MailService } from '../mail/mail.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly repo: Repository<User>,
    private readonly mail: MailService,
    private readonly config: ConfigService,
  ) {}

  private resolveScope(dto: { role: string; tier?: number; scope?: string }): string {
    const national = NATIONAL_ROLES.includes(dto.role as never) || dto.tier === 4;
    if (national) return 'All states';
    const state = (dto.scope || '').trim();
    if (!state || state === 'All states') {
      throw new BadRequestException('Select a state for this user');
    }
    return state;
  }

  effectivePermissions(user: User): ModuleKey[] {
    if (user.isSuperAdmin) return [...MODULES];
    return withImpliedModules(
      Array.isArray(user.permissions)
        ? (user.permissions as ModuleKey[])
        : defaultPermissions(user.role),
    );
  }

  private present(user: User) {
    const { passwordHash, ...rest } = user;
    void passwordHash;
    return { ...rest, effectivePermissions: this.effectivePermissions(user) };
  }

  async findAll(actor?: { role?: string; scope?: string }) {
    const users = await this.repo.find({ order: { createdAt: 'ASC' } });
    const federal = !actor?.scope || actor.scope === 'All states';
    const visible = federal ? users : users.filter((u) => u.scope === actor.scope);
    return visible.map((u) => this.present(u));
  }

  async findOne(id: string) {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return this.present(user);
  }

  async officersAt(tier?: number, state?: string) {
    const users = await this.repo.find({ order: { name: 'ASC' } });
    return users
      .filter((u) => u.status === 'active')
      .filter((u) => tier == null || u.tier === tier)
      .filter((u) => !state || u.scope === 'All states' || u.scope === state)
      .map((u) => ({
        id: u.id,
        name: u.name,
        role: u.role,
        tier: u.tier,
        scope: u.scope,
        lga: u.lga,
        community: u.community, // Level 3 focal persons are grouped by their ministry (community)
      }));
  }

  findByEmail(email: string): Promise<User | null> {
    return this.repo
      .createQueryBuilder('u')
      .addSelect('u.passwordHash')
      .addSelect('u.pinHash')
      .where('LOWER(u.email) = LOWER(:email)', { email })
      .getOne();
  }

  async setPin(userId: string, pin: string) {
    if (!/^\d{4}$/.test(pin || '')) {
      throw new BadRequestException('PIN must be exactly 4 digits');
    }
    const pinHash = await bcrypt.hash(pin, 10);
    await this.repo.update(userId, {
      pinHash,
      pinAttempts: 0,
      pinLockedUntil: null,
    });
    return { ok: true };
  }

  async recordPinFailure(userId: string, attempts: number, lockedUntil: Date | null) {
    await this.repo.update(userId, { pinAttempts: attempts, pinLockedUntil: lockedUntil });
  }

  async resetPinAttempts(userId: string) {
    await this.repo.update(userId, { pinAttempts: 0, pinLockedUntil: null });
  }

  async create(dto: CreateUserDto) {
    if (dto.email) {
      const existing = await this.repo.findOne({ where: { email: dto.email } });
      if (existing) throw new ConflictException('A user with that email already exists');
    }
    const scope = this.resolveScope(dto);
    const password = dto.password || this.config.get<string>('SEED_PASSWORD') || 'spin2026';
    const passwordHash = await bcrypt.hash(password, 10);

    const user = this.repo.create({
      name: dto.name.trim(),
      title: dto.title?.trim() || null,
      email: dto.email?.trim() || null,
      phone: dto.phone?.trim() || null,
      role: dto.role,
      specialty: dto.specialty || null,
      tier: dto.tier ?? null,
      scope,

      lga: scope === 'All states' ? null : dto.lga?.trim() || null,
      community: scope === 'All states' ? null : dto.community?.trim() || null,
      status: dto.status || 'active',
      permissions: dto.permissions ?? null,
      passwordHash,
    });
    const saved = await this.repo.save(user);

    if (saved.email) {
      this.mail
        .sendUserInvite(saved.email, saved.name, password)
        .catch(() => undefined);
    }
    return this.present(saved);
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    if (dto.email && dto.email !== user.email) {
      const existing = await this.repo.findOne({ where: { email: dto.email } });
      if (existing && existing.id !== id) {
        throw new ConflictException('A user with that email already exists');
      }
    }

    Object.assign(user, {
      name: dto.name?.trim() ?? user.name,
      title: dto.title !== undefined ? dto.title?.trim() || null : user.title,
      email: dto.email !== undefined ? dto.email?.trim() || null : user.email,
      phone: dto.phone !== undefined ? dto.phone?.trim() || null : user.phone,
      role: dto.role ?? user.role,
      specialty: dto.specialty !== undefined ? dto.specialty || null : user.specialty,
      tier: dto.tier !== undefined ? dto.tier ?? null : user.tier,
      status: dto.status ?? user.status,
      permissions: dto.permissions !== undefined ? dto.permissions ?? null : user.permissions,
    });
    user.scope = this.resolveScope({ role: user.role, tier: user.tier ?? undefined, scope: dto.scope ?? user.scope });

    if (user.scope === 'All states') {
      user.lga = null;
      user.community = null;
    } else {
      if (dto.lga !== undefined) user.lga = dto.lga?.trim() || null;
      if (dto.community !== undefined) user.community = dto.community?.trim() || null;
    }

    if (dto.password) user.passwordHash = await bcrypt.hash(dto.password, 10);

    const saved = await this.repo.save(user);
    return this.present(saved);
  }

  async setStatus(id: string, status: 'active' | 'suspended') {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    if (
      user.role === 'FPMU Admin' &&
      status === 'suspended' &&
      (await this.activeFpmuAdmins()) <= 1
    ) {
      throw new BadRequestException('Cannot suspend the last active FPMU Admin');
    }
    user.status = status;
    return this.present(await this.repo.save(user));
  }

  async remove(id: string) {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    if (user.role === 'FPMU Admin' && (await this.activeFpmuAdmins()) <= 1) {
      throw new BadRequestException('Cannot remove the last active FPMU Admin');
    }
    await this.repo.remove(user);
    return { id };
  }

  private activeFpmuAdmins(): Promise<number> {
    return this.repo.count({ where: { role: 'FPMU Admin', status: 'active' } });
  }
}
