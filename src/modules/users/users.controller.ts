import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { AuditService } from '../audit/audit.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Permissions } from '../auth/permissions.decorator';
import { PermissionsGuard } from '../auth/permissions.guard';
import { ROLES, FUNCTIONS, MODULES, GOVERNANCE_TIERS, ROLE_PERMISSIONS } from '../../common/rbac';

const actorOf = (req: any) => ({ name: req.user?.name || 'Unknown', role: req.user?.role, scope: req.user?.scope, ip: req.ip });

@Controller('users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Permissions('settings')
export class UsersController {
  constructor(
    private readonly users: UsersService,
    private readonly audit: AuditService,
  ) {}

  @Get('meta')
  meta() {
    return {
      roles: ROLES,
      functions: FUNCTIONS,
      modules: MODULES,
      tiers: GOVERNANCE_TIERS,
      rolePermissions: ROLE_PERMISSIONS,
    };
  }

  @Get()
  findAll(@Req() req: any) {
    return this.users.findAll(actorOf(req));
  }

  @Get('officers')
  @Permissions('cases')
  officers(@Query('tier') tier?: string, @Query('state') state?: string) {
    return this.users.officersAt(tier ? Number(tier) : undefined, state);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.users.findOne(id);
  }

  @Post()
  async create(@Req() req: any, @Body() dto: CreateUserDto) {
    const u = await this.users.create(dto);
    await this.audit.log(actorOf(req), 'user_created', { label: 'Created user', target: u.name, detail: `${u.role} · ${u.scope}` });
    return u;
  }

  @Patch(':id')
  async update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateUserDto) {
    const u = await this.users.update(id, dto);
    await this.audit.log(actorOf(req), 'user_updated', { label: 'Updated user', target: u.name, detail: `${u.role} · ${u.scope}` });
    return u;
  }

  @Patch(':id/status')
  async setStatus(@Req() req: any, @Param('id') id: string, @Body('status') status: 'active' | 'suspended') {
    const u = await this.users.setStatus(id, status);
    await this.audit.log(actorOf(req), status === 'suspended' ? 'user_suspended' : 'user_reactivated', { label: status === 'suspended' ? 'Suspended user' : 'Reactivated user', target: u.name });
    return u;
  }

  @Delete(':id')
  async remove(@Req() req: any, @Param('id') id: string) {
    const r = await this.users.remove(id);
    await this.audit.log(actorOf(req), 'user_removed', { label: 'Removed user', target: id, severity: 'high' });
    return r;
  }
}
