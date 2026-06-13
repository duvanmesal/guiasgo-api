import { ConfigService } from '@nestjs/config';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

const DEFAULT_CORS_ORIGINS = [
  'http://localhost:8100',
  'http://localhost:4200',
  'capacitor://localhost',
  'ionic://localhost',
];

export function getCorsOptions(configService: ConfigService): CorsOptions {
  const configuredOrigins = configService.get<string>('CORS_ORIGINS');
  const origins = configuredOrigins
    ? configuredOrigins.split(',').map((origin) => origin.trim())
    : DEFAULT_CORS_ORIGINS;

  return {
    origin: origins,
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  };
}
