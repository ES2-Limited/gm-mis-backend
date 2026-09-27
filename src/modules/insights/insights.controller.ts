import { Controller, Post, Body, Req, UseGuards, HttpException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { Permissions } from '../auth/permissions.decorator';
import { AuditService } from '../audit/audit.service';

@Controller('insights')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Permissions('insights')
export class InsightsController {
  constructor(
    private readonly config: ConfigService,
    private readonly audit: AuditService,
  ) {}

  @Post('chat')
  async chat(@Req() req: any, @Body() body: any) {
    const key = this.config.get<string>('DEEPSEEK_API_KEY');
    if (!key) throw new HttpException('Insights engine is not configured', 503);
    const model = body?.model || this.config.get<string>('DEEPSEEK_MODEL') || 'deepseek-chat';

    void this.audit.log(
      { name: req.user?.name || 'Unknown', role: req.user?.role, scope: req.user?.scope, ip: req.ip },
      'insights_used',
      { label: 'Used Insights', detail: typeof body?.purpose === 'string' ? body.purpose : 'Insights query' },
    );

    const res = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({ ...body, model }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new HttpException(data, res.status);
    return data;
  }
}
