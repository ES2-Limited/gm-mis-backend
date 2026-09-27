import {
  Controller, Get, Post, Patch, Param, Body, Query, Req, UseGuards,
} from '@nestjs/common';
import { CasesService, Actor } from './cases.service';
import {
  CreateCaseDto, AddNoteDto, AssignDto, StatusDto,
  EscalateDto, CorrectiveActionDto, AppealDto, SatisfactionDto, ReferDto,
} from './dto/case.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { Permissions } from '../auth/permissions.decorator';

const actorOf = (req: any): Actor => ({
  id: req.user?.sub,
  name: req.user?.name || 'Unknown',
  role: req.user?.role,
  scope: req.user?.scope,
  tier: req.user?.tier,
  isSuperAdmin: req.user?.isSuperAdmin,
  permissions: req.user?.permissions || [],
});

@Controller('cases')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Permissions('cases')
export class CasesController {
  constructor(private readonly cases: CasesService) {}

  @Get()
  findAll(
    @Req() req: any,
    @Query('status') status?: string,
    @Query('state') state?: string,
    @Query('category') category?: string,
    @Query('channel') channel?: string,
    @Query('q') q?: string,
    @Query('restricted') restricted?: string,
  ) {
    return this.cases.findAll(actorOf(req), { status, state, category, channel, q, restricted: restricted === 'true' });
  }

  @Get('stats')
  stats(@Req() req: any) {
    return this.cases.stats(actorOf(req));
  }

  @Post('run-auto-escalation')
  @Permissions('settings')
  runAuto() {
    return this.cases.runAutoEscalation();
  }

  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) {
    return this.cases.findOne(id, actorOf(req));
  }

  @Post()
  @Permissions('case_intake')
  create(@Req() req: any, @Body() dto: CreateCaseDto) {
    return this.cases.createCase(dto, actorOf(req));
  }

  @Patch(':id/status')
  status(@Req() req: any, @Param('id') id: string, @Body() dto: StatusDto) {
    return this.cases.setStatus(id, dto, actorOf(req));
  }

  @Patch(':id/assign')
  assign(@Req() req: any, @Param('id') id: string, @Body() dto: AssignDto) {
    return this.cases.assign(id, dto, actorOf(req));
  }

  @Post(':id/screening')
  screen(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: { decision?: string; reason?: string; legacy?: boolean; legacyReferral?: string },
  ) {
    return this.cases.screen(id, actorOf(req), body?.decision, body?.reason, body?.legacy, body?.legacyReferral);
  }

  @Post(':id/not-related')
  notRelated(@Req() req: any, @Param('id') id: string, @Body() body: { reason?: string }) {
    return this.cases.markNotRelated(id, actorOf(req), body?.reason);
  }

  @Post(':id/escalate')
  escalate(@Req() req: any, @Param('id') id: string, @Body() dto: EscalateDto) {
    return this.cases.escalate(id, dto, actorOf(req));
  }

  @Post(':id/refer')
  refer(@Req() req: any, @Param('id') id: string, @Body() dto: ReferDto) {
    return this.cases.refer(id, dto, actorOf(req));
  }

  @Post(':id/notes')
  note(@Req() req: any, @Param('id') id: string, @Body() dto: AddNoteDto) {
    return this.cases.addNote(id, dto, actorOf(req));
  }

  @Post(':id/investigation')
  investigation(@Req() req: any, @Param('id') id: string, @Body() body: Record<string, any>) {
    return this.cases.saveInvestigation(id, body, actorOf(req));
  }

  @Post(':id/corrective-actions')
  corrective(@Req() req: any, @Param('id') id: string, @Body() dto: CorrectiveActionDto) {
    return this.cases.addCorrectiveAction(id, dto, actorOf(req));
  }

  @Patch(':id/corrective-actions/:actionId/toggle')
  toggleCorrective(@Param('id') id: string, @Param('actionId') actionId: string) {
    return this.cases.toggleCorrectiveAction(id, actionId);
  }

  @Post(':id/appeals')
  appeal(@Req() req: any, @Param('id') id: string, @Body() dto: AppealDto) {
    return this.cases.addAppeal(id, dto, actorOf(req));
  }

  @Post(':id/satisfaction')
  satisfaction(@Req() req: any, @Param('id') id: string, @Body() dto: SatisfactionDto) {
    return this.cases.recordSatisfaction(id, dto, actorOf(req));
  }
}
