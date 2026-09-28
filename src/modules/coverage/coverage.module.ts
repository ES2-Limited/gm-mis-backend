import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Community, CoverageLga, CoverageState } from './entities/coverage.entities';

@Module({
  imports: [TypeOrmModule.forFeature([CoverageState, CoverageLga, Community])],
  exports: [TypeOrmModule],
})
export class CoverageModule {}