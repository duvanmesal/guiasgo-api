import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { TouristsController } from './tourists.controller';
import { TouristsService } from './tourists.service';

@Module({
  imports: [UsersModule],
  controllers: [TouristsController],
  providers: [TouristsService],
})
export class TouristsModule {}
