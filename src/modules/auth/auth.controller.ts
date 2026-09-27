import { Controller, Post, Get, Body, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { PinLoginDto, SetPinDto } from './dto/pin.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
  login(@Body() dto: LoginDto, @Req() req: any) {
    return this.auth.login(dto, req.ip);
  }

  @Post('pin-login')
  pinLogin(@Body() dto: PinLoginDto, @Req() req: any) {
    return this.auth.pinLogin(dto.email, dto.pin, req.ip);
  }

  @Post('set-pin')
  @UseGuards(JwtAuthGuard)
  setPin(@Body() dto: SetPinDto, @Req() req: any) {
    return this.auth.setPin(req.user.sub, dto.pin);
  }

  @Post('refresh')
  refresh(@Body('refreshToken') refreshToken: string) {
    return this.auth.refresh(refreshToken);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@Req() req: any) {
    return req.user;
  }
}
