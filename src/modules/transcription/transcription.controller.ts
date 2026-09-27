import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  HttpException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { Permissions } from '../auth/permissions.decorator';

@Controller('transcribe')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Permissions('case_intake')
export class TranscriptionController {
  constructor(private readonly config: ConfigService) {}

  @Post()
  async transcribe(
    @Req() req: any,
    @Body() body: { audio?: string; mimeType?: string; language?: string },
  ) {
    void req;
    if (!body?.audio) throw new BadRequestException('No audio provided');
    const buffer = Buffer.from(body.audio, 'base64');
    if (!buffer.length) throw new BadRequestException('Empty audio');

    const mime = body.mimeType || 'audio/webm';
    const ext = mime.includes('mp4')
      ? 'mp4'
      : mime.includes('mpeg') || mime.includes('mp3')
        ? 'mp3'
        : mime.includes('wav')
          ? 'wav'
          : mime.includes('ogg')
            ? 'ogg'
            : 'webm';

    const provider = (
      this.config.get<string>('STT_PROVIDER') || 'openai'
    ).toLowerCase();

    return provider === 'spitch'
      ? this.viaSpitch(buffer, mime, ext, body.language)
      : this.viaOpenAICompatible(buffer, mime, ext, body.language);
  }

  private async viaSpitch(
    buffer: Buffer,
    mime: string,
    ext: string,
    language?: string,
  ) {
    const key = this.config.get<string>('SPITCH_API_KEY');
    if (!key) {
      throw new HttpException(
        'Voice transcription is not configured. Set SPITCH_API_KEY on the server.',
        503,
      );
    }
    const base =
      this.config.get<string>('SPITCH_BASE_URL') || 'https://api.spi-tch.com/v1';
    const model = this.config.get<string>('SPITCH_MODEL') || 'mansa_v1';

    const lang = (language || 'en').slice(0, 2);

    const form = new FormData();
    form.append('content', new Blob([new Uint8Array(buffer)], { type: mime }), `audio.${ext}`);
    form.append('language', lang);
    form.append('model', model);

    let data: any = {};
    try {
      const res = await fetch(`${base}/transcriptions`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}` },
        body: form,
      });
      data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new HttpException(
          data?.message || data?.error || 'Transcription failed',
          res.status,
        );
      }
    } catch (e) {
      if (e instanceof HttpException) throw e;
      throw new HttpException('Could not reach the transcription service', 502);
    }
    return { text: (data?.text || '').trim() };
  }

  private async viaOpenAICompatible(
    buffer: Buffer,
    mime: string,
    ext: string,
    language?: string,
  ) {
    const key = this.config.get<string>('STT_API_KEY');
    if (!key) {
      throw new HttpException(
        'Voice transcription is not configured. Set STT_API_KEY on the server.',
        503,
      );
    }
    const base =
      this.config.get<string>('STT_BASE_URL') || 'https://api.openai.com/v1';
    const model = this.config.get<string>('STT_MODEL') || 'whisper-1';

    const form = new FormData();
    form.append('file', new Blob([new Uint8Array(buffer)], { type: mime }), `audio.${ext}`);
    form.append('model', model);
    form.append('response_format', 'json');
    if (language) form.append('language', language);

    let data: any = {};
    try {
      const res = await fetch(`${base}/audio/transcriptions`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}` },
        body: form,
      });
      data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new HttpException(
          data?.error?.message || 'Transcription failed',
          res.status,
        );
      }
    } catch (e) {
      if (e instanceof HttpException) throw e;
      throw new HttpException('Could not reach the transcription service', 502);
    }
    return { text: (data?.text || '').trim() };
  }
}
