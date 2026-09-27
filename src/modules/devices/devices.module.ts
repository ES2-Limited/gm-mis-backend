import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Device } from './entities/device.entity';
import { ActivationCode } from './entities/activation-code.entity';
import { DevicesService } from './devices.service';
import { ActivationService } from './activation.service';
import { DevicesController, DeviceActivationController } from './devices.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Device, ActivationCode]), UsersModule],
  controllers: [DevicesController, DeviceActivationController],
  providers: [DevicesService, ActivationService],
})
export class DevicesModule {}
