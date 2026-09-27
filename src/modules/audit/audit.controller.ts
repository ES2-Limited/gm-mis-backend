import { Controller, Get, Post, Query, Body, Req, UseGuards } from '@nestjs/common';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { Permissions } from '../auth/permissions.decorator';

@Controller('audit')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AuditController {
  constructor(private readonly audit: AuditService) {}

  @Get()
  @Permissions('audit')
  list(
    @Query('action') action?: string,
    @Query('q') q?: string,
    @Query('highOnly') highOnly?: string,
  ) {
    return this.audit.find({ action, q, highOnly: highOnly === 'true' });
  }

  @Post()
  log(
    @Req() req: any,
    @Body() body: { action: string; label?: string; target?: string; detail?: string; severity?: string },
  ) {
    const u = req.user;
    return this.audit.log(
      { name: u?.name || 'Unknown', role: u?.role, scope: u?.scope, ip: req.ip },
      body.action,
      body,
    );
  }
}
