import 'reflect-metadata';
import { config } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';
import { User } from '../modules/users/entities/user.entity';
import { Category } from '../modules/taxonomy/entities/category.entity';
import { CoverageState, CoverageLga, Community } from '../modules/coverage/entities/coverage.entities';
import { AppSetting } from '../modules/settings/entities/app-setting.entity';
import { AuditLog } from '../modules/audit/entities/audit-log.entity';
import { Case } from '../modules/cases/entities/case.entity';
import { Notification } from '../modules/notifications/entities/notification.entity';
import { OtpCode } from '../modules/otp/entities/otp-code.entity';
import { Device } from '../modules/devices/entities/device.entity';
import { ActivationCode } from '../modules/devices/entities/activation-code.entity';
import { IntegrationKey } from '../modules/integration/integration-key.entity';

config();

const useSsl = (process.env.DB_SSL ?? 'true') === 'true';

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '25060', 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  ssl: useSsl ? { rejectUnauthorized: false } : false,
  entities: [User, Category, CoverageState, CoverageLga, Community, AppSetting, AuditLog, Case, Notification, OtpCode, Device, ActivationCode, IntegrationKey],
  migrations: [__dirname + '/migrations/*.{ts,js}'],
  synchronize: false,
  logging: ['error', 'warn'],
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
