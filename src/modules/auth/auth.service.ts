import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { AuditService } from '../audit/audit.service';
import { LoginDto } from './dto/login.dto';

const REFRESH_TTL_DEFAULT = '60d';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
    private readonly audit: AuditService,
    private readonly config: ConfigService,
  ) {}

  private issueTokens(user: any) {
    const permissions = this.users.effectivePermissions(user);
    const accessToken = this.jwt.sign({
      sub: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      scope: user.scope,
      lga: user.lga,
      community: user.community,
      tier: user.tier,
      specialty: user.specialty,
      isSuperAdmin: user.isSuperAdmin,
      pinSet: !!user.pinHash,
      permissions,
    });
    const refreshToken = this.jwt.sign(
      { sub: user.id, type: 'refresh' },
      {
        expiresIn:
          this.config.get<string>('JWT_REFRESH_EXPIRES_IN') || REFRESH_TTL_DEFAULT,
      },
    );
    return { accessToken, refreshToken, permissions };
  }

  private publicUser(user: any, permissions: any) {
    return {
      id: user.id,
      name: user.name,
      title: user.title,
      email: user.email,
      role: user.role,
      scope: user.scope,
      lga: user.lga,
      community: user.community,
      tier: user.tier,
      specialty: user.specialty,
      status: user.status,
      isSuperAdmin: user.isSuperAdmin,
      pinSet: !!user.pinHash,
      permissions,
    };
  }

  async login(dto: LoginDto, ip?: string) {
    const user = await this.users.findByEmail(dto.email.trim());
    if (!user) throw new UnauthorizedException('No account found with that email address.');
    if (user.status !== 'active') {
      throw new UnauthorizedException('This account is suspended. Contact the FPMU administrator.');
    }
    const ok = user.passwordHash && (await bcrypt.compare(dto.password, user.passwordHash));
    if (!ok) throw new UnauthorizedException('Incorrect password. Please try again.');

    await this.audit.log(
      { name: user.name, role: user.role, scope: user.scope, ip },
      'login',
      { label: 'Signed in', detail: `Signed in from ${ip || 'unknown IP'}` },
    );

    const { accessToken, refreshToken, permissions } = this.issueTokens(user);
    return { accessToken, refreshToken, user: this.publicUser(user, permissions) };
  }

  async setPin(userId: string, pin: string) {
    return this.users.setPin(userId, pin);
  }

  async pinLogin(email: string, pin: string, ip?: string) {
    const user = await this.users.findByEmail((email || '').trim());
    if (!user || user.status !== 'active') {
      throw new UnauthorizedException('No active account found for that email.');
    }
    if (!user.pinHash) {
      throw new UnauthorizedException('No PIN set for this account yet. Sign in with your password.');
    }
    const now = Date.now();
    if (user.pinLockedUntil && new Date(user.pinLockedUntil).getTime() > now) {
      throw new UnauthorizedException('Too many wrong PINs. Try again later, or sign in with your password.');
    }
    const ok = await bcrypt.compare(pin || '', user.pinHash);
    if (!ok) {
      const attempts = (user.pinAttempts || 0) + 1;
      const lock = attempts >= 5;
      await this.users.recordPinFailure(
        user.id,
        lock ? 0 : attempts,
        lock ? new Date(now + 15 * 60 * 1000) : null,
      );
      throw new UnauthorizedException(
        lock
          ? 'Too many wrong PINs — locked for 15 minutes. Use your password.'
          : `Incorrect PIN. ${5 - attempts} attempt${5 - attempts === 1 ? '' : 's'} left.`,
      );
    }
    await this.users.resetPinAttempts(user.id);
    await this.audit.log(
      { name: user.name, role: user.role, scope: user.scope, ip },
      'login',
      { label: 'Signed in (PIN)', detail: `PIN sign-in from ${ip || 'unknown IP'}` },
    );
    const { accessToken, refreshToken, permissions } = this.issueTokens(user);
    return { accessToken, refreshToken, user: this.publicUser(user, permissions) };
  }

  async refresh(refreshToken: string) {
    if (!refreshToken) throw new UnauthorizedException('Missing refresh token.');
    let payload: any;
    try {
      payload = this.jwt.verify(refreshToken);
    } catch {
      throw new UnauthorizedException('Your session has expired. Please sign in again.');
    }
    if (payload?.type !== 'refresh' || !payload?.sub) {
      throw new UnauthorizedException('Invalid session token.');
    }
    let user: any;
    try {
      user = await this.users.findOne(payload.sub);
    } catch {
      throw new UnauthorizedException('This account is no longer active. Please sign in again.');
    }
    if (!user || user.status !== 'active') {
      throw new UnauthorizedException('This account is no longer active. Please sign in again.');
    }
    const { accessToken, refreshToken: rotated } = this.issueTokens(user);
    return { accessToken, refreshToken: rotated };
  }
}
