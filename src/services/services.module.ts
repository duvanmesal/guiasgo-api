import { Module } from '@nestjs/common';
import { ServicesController } from './services.controller';
import { ServicesService } from './services.service';
import { ServiceStateMachine } from './service-state-machine';

@Module({
  controllers: [ServicesController],
  providers: [ServicesService, ServiceStateMachine],
  exports: [ServicesService],
})
export class ServicesModule {}
