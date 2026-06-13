import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CatalogsModule } from './catalogs/catalogs.module';
import { CertificationsModule } from './certifications/certifications.module';
import { validateEnv } from './config/env.validation';
import { GuidesModule } from './guides/guides.module';
import { HealthModule } from './health/health.module';
import { PrismaModule } from './prisma/prisma.module';
import { TouristsModule } from './tourists/tourists.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    PrismaModule,
    HealthModule,
    UsersModule,
    AuthModule,
    TouristsModule,
    GuidesModule,
    CertificationsModule,
    CatalogsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
