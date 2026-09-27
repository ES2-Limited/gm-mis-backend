import {
  IsString,
  IsOptional,
  IsBoolean,
  IsIn,
  IsNumber,
  IsEmail,
} from 'class-validator';

const CHANNELS = ['back_office', 'self_service', 'cgfp', 'whatsapp', 'web', 'phone', 'walk_in', 'field', 'sms', 'email', 'other'];
const PRIORITIES = ['low', 'medium', 'high'];

export class CreateCaseDto {
  @IsString()
  category: string;

  @IsOptional() @IsString()
  subcategory?: string;

  @IsString()
  state: string;

  @IsOptional() @IsString()
  lga?: string;

  @IsOptional() @IsString()
  community?: string;

  @IsString()
  description: string;

  @IsOptional() @IsString()
  narrative?: string;

  @IsOptional() @IsIn(PRIORITIES)
  priority?: string;

  @IsOptional() @IsIn(CHANNELS)
  channel?: string;

  @IsOptional() @IsString()
  channelDetail?: string;

  @IsOptional() @IsBoolean()
  anonymous?: boolean;

  @IsOptional() @IsString()
  complainant?: string;

  @IsOptional() @IsString()
  phone?: string;

  @IsOptional() @IsEmail()
  email?: string;

  @IsOptional() @IsNumber()
  lat?: number;

  @IsOptional() @IsNumber()
  lng?: number;

  @IsOptional() @IsIn(['project_related', 'not_project_related'])
  screening?: string;

  @IsOptional() @IsString()
  screeningReason?: string;

  @IsOptional() @IsBoolean()
  legacy?: boolean;

  @IsOptional() @IsString()
  legacyReferral?: string;
}

export class AddNoteDto {
  @IsString()
  body: string;
}

export class AssignDto {
  @IsString()
  officer: string;
}

export class StatusDto {
  @IsString()
  status: string;

  @IsOptional() @IsString()
  note?: string;
}

export class ScreeningDto {
  @IsIn(['eligible', 'referred', 'rejected'])
  outcome: string;
}

export class EscalateDto {
  @IsOptional() @IsString()
  reason?: string;

  @IsOptional() @IsNumber()
  toTier?: number;

  @IsOptional() @IsString()
  toOfficer?: string;
}

export class ReferDto {
  @IsString()
  body: string;

  @IsOptional() @IsString()
  bodyType?: string;

  @IsString()
  reason: string;

  @IsString()
  riskLevel: string;

  @IsOptional() @IsString()
  safetyNote?: string;

  @IsBoolean()
  consent: boolean;
}

export class CorrectiveActionDto {
  @IsString()
  action: string;

  @IsOptional() @IsString()
  responsible?: string;

  @IsOptional() @IsString()
  dueDate?: string;
}

export class AppealDto {
  @IsString()
  grounds: string;

  @IsOptional() @IsString()
  desiredOutcome?: string;
}

export class SatisfactionDto {
  @IsString()
  rating: string;

  @IsOptional() @IsString()
  comment?: string;
}
