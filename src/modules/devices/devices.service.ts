import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Device } from './entities/device.entity';

export interface DeviceActor {
  name?: string;
  email?: string;
  role?: string;
  tier?: number | null;
  scope?: string;
  lga?: string;
  isSuperAdmin?: boolean;
}

export interface HeartbeatDto {
  deviceId: string;
  platform?: string;
  osVersion?: string;
  appVersion?: string;
  synced?: boolean;
  maxOfflineDays?: number;
}

@Injectable()
export class DevicesService {
  constructor(
    @InjectRepository(Device) private readonly repo: Repository<Device>,
  ) {}

  async heartbeat(actor: DeviceActor, dto: HeartbeatDto): Promise<Device> {
    const now = new Date();
    let d = await this.repo.findOne({ where: { deviceId: dto.deviceId } });
    if (!d) {
      d = this.repo.create({ deviceId: dto.deviceId, firstSeenAt: now, heartbeats: 0 });
    }
    d.userEmail = actor.email ?? d.userEmail;
    d.userName = actor.name ?? d.userName;
    d.role = actor.role ?? d.role;
    d.tier = actor.tier ?? d.tier;
    d.state = actor.scope ?? d.state;
    d.lga = actor.lga ?? d.lga;
    if (dto.platform) d.platform = dto.platform;
    if (dto.osVersion) d.osVersion = dto.osVersion;
    if (dto.appVersion) d.appVersion = dto.appVersion;
    if (dto.maxOfflineDays != null) d.maxOfflineDays = dto.maxOfflineDays;
    d.lastSeenAt = now;
    if (dto.synced) d.lastSyncAt = now;
    d.heartbeats = (d.heartbeats ?? 0) + 1;
    return this.repo.save(d);
  }

  async list(actor: DeviceActor): Promise<Device[]> {
    const scoped =
      !actor.isSuperAdmin && actor.scope && actor.scope !== 'All states';
    return this.repo.find({
      where: scoped ? { state: actor.scope } : {},
      order: { lastSeenAt: 'DESC' },
    });
  }
}
