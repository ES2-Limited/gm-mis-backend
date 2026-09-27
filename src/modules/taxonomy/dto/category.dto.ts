import { IsString, IsOptional, IsArray, IsInt, Min, Max, IsIn } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateCategoryDto {
  @IsString()
  name: string;

  @IsOptional() @IsIn(['Social', 'Environmental', 'Other'])
  domain?: string;

  @IsOptional() @IsString()
  description?: string;

  @IsOptional() @IsArray()
  subgroups?: string[];

  @IsOptional() @IsArray()
  responsible?: string[];

  @IsOptional() @IsString()
  lead?: string;

  @IsOptional() @IsArray()
  route?: string[];

  @IsOptional() @IsIn(['low', 'medium', 'high'])
  priority?: string;

  @IsOptional() @IsInt() @Min(1) @Max(5)
  startLevel?: number;
}

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}
