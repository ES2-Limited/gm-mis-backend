import { Controller, Get, Post, Body, Param, Req, Headers, UseGuards } from '@nestjs/common';
import { IntegrationService } from './integration.service';
import { CasesService } from '../cases/cases.service';
import { CreateCaseDto } from '../cases/dto/case.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { Permissions } from '../auth/permissions.decorator';

@Controller('integration')
export class IntegrationController {
  constructor(
    private readonly integ: IntegrationService,
    private readonly cases: CasesService,
  ) {}

  @Get('keys')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('sharing')
  listKeys() {
    return this.integ.list();
  }

  @Post('keys')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('sharing')
  createKey(@Req() req: any, @Body() body: { label: string }) {
    return this.integ.generate(req.user?.name, body?.label);
  }

  @Post('keys/:id/revoke')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('sharing')
  revokeKey(@Param('id') id: string) {
    return this.integ.revoke(id);
  }

  @Get('schema')
  async schema(@Headers('x-api-key') key: string) {
    await this.integ.verify(key);
    return this.integ.schema();
  }

  @Post('cases')
  async createCase(@Headers('x-api-key') key: string, @Body() dto: CreateCaseDto) {
    const k = await this.integ.verify(key);

    const category = await this.integ.resolveCategory(dto.category);
    const state = await this.integ.validState(dto.state);
    const saved = await this.cases.createCase(
      { ...dto, category, state, channel: 'self_service', channelDetail: k.label } as CreateCaseDto,
      undefined,
    );
    return { ok: true, code: saved.code, id: saved.id, status: saved.status };
  }
}
