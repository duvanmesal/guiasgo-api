import { Module } from '@nestjs/common';
import { GuidesModule } from '../guides/guides.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [GuidesModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
