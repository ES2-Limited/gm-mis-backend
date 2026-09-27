import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { Permissions } from '../auth/permissions.decorator';

@Controller('translate')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Permissions('case_intake')
export class TextTranslationController {
  constructor(private readonly config: ConfigService) {}

  @Post()
  async translate(
    @Body() body: { text?: string; source?: string; target?: string },
  ) {
    const text = (body?.text || '').trim();
    if (!text) throw new BadRequestException('No text to translate');

    const key = this.config.get<string>('SPITCH_API_KEY');
    if (!key) {
      throw new HttpException('Translation is not configured', 503);
    }
    const base =
      this.config.get<string>('SPITCH_BASE_URL') || 'https://api.spi-tch.com/v1';

    const payload: Record<string, string> = {
      text,
      target: body.target || 'en',
    };
    if (body.source) payload.source = body.source.slice(0, 2);

    let data: any = {};
    try {
      const res = await fetch(`${base}/translate`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new HttpException(
          data?.message || data?.error || 'Translation failed',
          res.status,
        );
      }
    } catch (e) {
      if (e instanceof HttpException) throw e;
      throw new HttpException('Could not reach the translation service', 502);
    }
    return { text: (data?.text || '').trim() };
  }
}
