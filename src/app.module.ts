import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from './database/data-source';
import { MailModule } from './modules/mail/mail.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { TaxonomyModule } from './modules/taxonomy/taxonomy.module';
import { CoverageModule } from './modules/coverage/coverage.module';
import { SettingsModule } from './modules/settings/settings.module';
import { AuditModule } from './modules/audit/audit.module';
import { CasesModule } from './modules/cases/cases.module';
import { InsightsModule } from './modules/insights/insights.module';
import { TranscriptionModule } from './modules/transcription/transcription.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { OtpModule } from './modules/otp/otp.module';
import { DevicesModule } from './modules/devices/devices.module';
import { IntegrationModule } from './modules/integration/integration.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(dataSourceOptions),
    MailModule,
    AuditModule,
    NotificationsModule,
    UsersModule,
    AuthModule,
    TaxonomyModule,
    CoverageModule,
    SettingsModule,
    CasesModule,
    InsightsModule,
    TranscriptionModule,
    OtpModule,
    DevicesModule,
    IntegrationModule,
  ],
})
export class AppModule {}
