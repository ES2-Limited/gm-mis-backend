import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppSetting } from './entities/app-setting.entity';

@Injectable()
export class SettingsService {
  constructor(@InjectRepository(AppSetting) private readonly repo: Repository<AppSetting>) {}

  async all(): Promise<Record<string, any>> {
    const rows = await this.repo.find();
    return rows.reduce((acc, r) => ({ ...acc, [r.key]: r.value }), {});
  }

  async get<T = any>(key: string): Promise<T | null> {
    const row = await this.repo.findOne({ where: { key } });
    return row ? (row.value as T) : null;
  }

  async set(key: string, value: any) {
    await this.repo.save(this.repo.create({ key, value }));
    return { key, value };
  }
}
