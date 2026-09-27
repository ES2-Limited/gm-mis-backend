import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const expected = this.config.get<string>('INTAKE_API_KEY');
    if (!expected) return true;
    const req = context.switchToHttp().getRequest();
    const provided = req.headers['x-api-key'];
    if (provided !== expected) throw new UnauthorizedException('Invalid intake API key');
    return true;
  }
}
