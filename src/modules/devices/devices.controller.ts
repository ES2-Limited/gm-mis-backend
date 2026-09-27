import { Controller, Get, Post, Body, Param, Req, UseGuards } from '@nestjs/common';
import { DevicesService, DeviceActor, HeartbeatDto } from './devices.service';
import { ActivationService } from './activation.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { Permissions } from '../auth/permissions.decorator';

const actorOf = (req: any): DeviceActor => ({
  name: req.user?.name,
  email: req.user?.email,
  role: req.user?.role,
  tier: req.user?.tier ?? null,
  scope: req.user?.scope,
  lga: req.user?.lga,
  isSuperAdmin: req.user?.isSuperAdmin === true,
});

@Controller('devices')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class DevicesController {
  constructor(
    private readonly devices: DevicesService,
    private readonly activation: ActivationService,
  ) {}

  @Post('heartbeat')
  heartbeat(@Req() req: any, @Body() dto: HeartbeatDto) {
    return this.devices.heartbeat(actorOf(req), dto);
  }

  @Get()
  @Permissions('devices')
  list(@Req() req: any) {
    return this.devices.list(actorOf(req));
  }

  @Get('activation-codes')
  @Permissions('settings')
  listCodes(@Req() req: any) {
    return this.activation.list(actorOf(req));
  }

  @Post('activation-codes')
  @Permissions('settings')
  issueCode(@Req() req: any, @Body() body: { userId: string; maxOfflineDays?: number }) {
    return this.activation.issue(actorOf(req), body?.userId, body?.maxOfflineDays);
  }

  @Post('activation-codes/:id/revoke')
  @Permissions('settings')
  revokeCode(@Req() req: any, @Param('id') id: string) {
    return this.activation.revoke(actorOf(req), id);
  }
}

@Controller('device-activation')
export class DeviceActivationController {
  constructor(private readonly activation: ActivationService) {}

  @Post()
  activate(@Body() body: { code: string; deviceId: string }) {
    return this.activation.activate(body?.code, body?.deviceId);
  }
}
