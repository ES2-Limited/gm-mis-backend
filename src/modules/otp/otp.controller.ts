import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { OtpService, OtpActor } from './otp.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

class RequestOtpDto {
  @IsIn(['restricted', 'case'])
  purpose: string;

  @IsOptional() @IsString()
  caseRef?: string;
}

class VerifyOtpDto {
  @IsIn(['restricted', 'case'])
  purpose: string;

  @IsString()
  code: string;

  @IsOptional() @IsString()
  caseRef?: string;
}

const actorOf = (req: any): OtpActor => ({
  id: req.user?.sub,
  name: req.user?.name || 'Unknown',
  email: req.user?.email,
  role: req.user?.role,
  scope: req.user?.scope,
  ip: req.ip,
});

@Controller('otp')
@UseGuards(JwtAuthGuard)
export class OtpController {
  constructor(private readonly otp: OtpService) {}

  @Post('request')
  request(@Req() req: any, @Body() dto: RequestOtpDto) {
    return this.otp.request(actorOf(req), dto.purpose, dto.caseRef);
  }

  @Post('verify')
  verify(@Req() req: any, @Body() dto: VerifyOtpDto) {
    return this.otp.verify(actorOf(req), dto.purpose, dto.code, dto.caseRef);
  }
}
