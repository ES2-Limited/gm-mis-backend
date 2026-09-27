import { Module } from '@nestjs/common';
import { TranscriptionController } from './transcription.controller';
import { TextTranslationController } from './translation.controller';

@Module({
  controllers: [TranscriptionController, TextTranslationController],
})
export class TranscriptionModule {}
