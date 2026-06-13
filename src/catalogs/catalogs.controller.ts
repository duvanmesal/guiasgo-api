import { Controller, Get, Query } from '@nestjs/common';
import {
  CityResponse,
  CountryResponse,
  LanguageResponse,
  SpecialtyResponse,
} from './catalog.response';
import { CatalogsService } from './catalogs.service';

@Controller('catalogs')
export class CatalogsController {
  constructor(private readonly catalogsService: CatalogsService) {}

  @Get('countries')
  listCountries(): Promise<CountryResponse[]> {
    return this.catalogsService.listCountries();
  }

  @Get('cities')
  listCities(@Query('countryCode') countryCode?: string): Promise<CityResponse[]> {
    return this.catalogsService.listCities(countryCode);
  }

  @Get('languages')
  listLanguages(): Promise<LanguageResponse[]> {
    return this.catalogsService.listLanguages();
  }

  @Get('specialties')
  listSpecialties(): Promise<SpecialtyResponse[]> {
    return this.catalogsService.listSpecialties();
  }
}
