import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IntegrationKey } from './integration-key.entity';
import { CoverageState } from '../coverage/entities/coverage.entities';
import { Category } from '../taxonomy/entities/category.entity';
import { IntegrationService } from './integration.service';
import { IntegrationController } from './integration.controller';
import { CasesModule } from '../cases/cases.module';

@Module({
  imports: [TypeOrmModule.forFeature([IntegrationKey, CoverageState, Category]), CasesModule],
  controllers: [IntegrationController],
  providers: [IntegrationService],
})
export class IntegrationModule {}
