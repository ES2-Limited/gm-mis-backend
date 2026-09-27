import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { CasesService } from './cases.service';
import { CreateCaseDto } from './dto/case.dto';
import { ApiKeyGuard } from './api-key.guard';

@Controller('intake')
@UseGuards(ApiKeyGuard)
export class IntakeController {
  constructor(private readonly cases: CasesService) {}

  @Post()
  submit(@Body() dto: CreateCaseDto) {

    return this.cases.createCase(dto);
  }
}
