import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Case } from './entities/case.entity';
import { Category } from '../taxonomy/entities/category.entity';
import { User } from '../users/entities/user.entity';
import { CasesService } from './cases.service';
import { CasesController } from './cases.controller';
import { IntakeController } from './intake.controller';
import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [TypeOrmModule.forFeature([Case, Category, User]), SettingsModule],
  controllers: [CasesController, IntakeController],
  providers: [CasesService],
  exports: [CasesService],
})
export class CasesModule {}
