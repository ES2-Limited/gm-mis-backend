import {
  IsString,
  IsOptional,
  IsEmail,
  IsIn,
  IsInt,
  Min,
  Max,
  IsArray,
  Matches,
} from 'class-validator';
import { ROLES, MODULES, FUNCTIONS } from '../../../common/rbac';

export class CreateUserDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsEmail({}, { message: 'A valid email address is required' })
  email: string;

  @IsString()
  @Matches(/\d[\d\s-]{8,}/, { message: 'A valid phone number is required' })
  phone: string;

  @IsIn(ROLES as unknown as string[])
  role: string;

  @IsOptional()
  @IsIn(FUNCTIONS as unknown as string[])
  specialty?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  tier?: number;

  @IsOptional()
  @IsString()
  scope?: string;

  @IsOptional()
  @IsString()
  lga?: string;

  @IsOptional()
  @IsString()
  community?: string;

  @IsOptional()
  @IsIn(['active', 'suspended'])
  status?: string;

  @IsOptional()
  @IsArray()
  @IsIn(MODULES as unknown as string[], { each: true })
  permissions?: string[];

  @IsOptional()
  @IsString()
  password?: string;
}
