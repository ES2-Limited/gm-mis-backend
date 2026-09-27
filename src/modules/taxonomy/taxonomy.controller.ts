import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { TaxonomyService } from './taxonomy.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { Permissions } from '../auth/permissions.decorator';

@Controller('taxonomy')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class TaxonomyController {
  constructor(private readonly taxonomy: TaxonomyService) {}

  @Get()
  findAll() {
    return this.taxonomy.findAll();
  }

  @Post()
  @Permissions('settings')
  create(@Body() dto: CreateCategoryDto) {
    return this.taxonomy.create(dto);
  }

  @Patch(':id')
  @Permissions('settings')
  update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.taxonomy.update(id, dto);
  }

  @Delete(':id')
  @Permissions('settings')
  remove(@Param('id') id: string) {
    return this.taxonomy.remove(id);
  }
}
