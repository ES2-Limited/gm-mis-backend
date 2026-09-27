import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

@Injectable()
export class TaxonomyService {
  constructor(@InjectRepository(Category) private readonly repo: Repository<Category>) {}

  findAll() {
    return this.repo.find({ order: { sortOrder: 'ASC', name: 'ASC' } });
  }

  async create(dto: CreateCategoryDto) {
    const name = dto.name.trim();
    if (await this.repo.findOne({ where: { name } })) {
      throw new ConflictException('That category already exists');
    }
    const count = await this.repo.count();
    const cat = this.repo.create({
      name,
      domain: dto.domain || 'Other',
      description: dto.description || 'Custom category added by administrator.',
      subgroups: dto.subgroups || [],
      responsible: dto.responsible || ['Determined during screening'],
      lead: dto.lead || null,
      route: dto.route || [],
      priority: dto.priority || 'medium',
      restricted: false,
      startLevel: dto.startLevel || 1,
      custom: true,
      sortOrder: 100 + count,
    });
    return this.repo.save(cat);
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const cat = await this.repo.findOne({ where: { id } });
    if (!cat) throw new NotFoundException('Category not found');
    if (dto.domain !== undefined) cat.domain = dto.domain || 'Other';
    if (dto.description !== undefined) cat.description = dto.description;
    if (dto.subgroups !== undefined) cat.subgroups = dto.subgroups;
    if (dto.responsible !== undefined) cat.responsible = dto.responsible;
    if (dto.lead !== undefined) cat.lead = dto.lead || null;
    if (dto.route !== undefined) cat.route = dto.route;
    if (dto.priority !== undefined) cat.priority = dto.priority;
    if (dto.startLevel !== undefined) cat.startLevel = dto.startLevel;
    return this.repo.save(cat);
  }

  async remove(id: string) {
    const cat = await this.repo.findOne({ where: { id } });
    if (!cat) throw new NotFoundException('Category not found');
    if (!cat.custom) {
      throw new BadRequestException('Framework categories cannot be removed');
    }
    await this.repo.remove(cat);
    return { id };
  }
}
