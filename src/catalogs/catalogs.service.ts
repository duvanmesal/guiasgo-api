import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CityResponse,
  CountryResponse,
  LanguageResponse,
  mapCity,
  mapCountry,
  mapLanguage,
  mapSpecialty,
  SpecialtyResponse,
} from './catalog.response';

@Injectable()
export class CatalogsService {
  constructor(private readonly prisma: PrismaService) {}

  async listCountries(): Promise<CountryResponse[]> {
    const countries = await this.prisma.country.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });

    return countries.map(mapCountry);
  }

  async listCities(countryCode?: string): Promise<CityResponse[]> {
    const cities = await this.prisma.city.findMany({
      where: {
        isActive: true,
        country: countryCode
          ? {
              code: countryCode.trim().toUpperCase(),
            }
          : undefined,
      },
      orderBy: { name: 'asc' },
    });

    return cities.map(mapCity);
  }

  async listLanguages(): Promise<LanguageResponse[]> {
    const languages = await this.prisma.language.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });

    return languages.map(mapLanguage);
  }

  async listSpecialties(): Promise<SpecialtyResponse[]> {
    const specialties = await this.prisma.specialty.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });

    return specialties.map(mapSpecialty);
  }
}
