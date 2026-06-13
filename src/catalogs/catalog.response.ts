import { City, Country, Language, Specialty } from '@prisma/client';

export interface CountryResponse {
  id: string;
  name: string;
  code: string;
}

export interface CityResponse {
  id: string;
  countryId: string;
  name: string;
  slug: string;
  latitude: number | null;
  longitude: number | null;
}

export interface LanguageResponse {
  id: string;
  name: string;
  code: string;
}

export interface SpecialtyResponse {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

export function mapCountry(country: Country): CountryResponse {
  return {
    id: country.id,
    name: country.name,
    code: country.code,
  };
}

export function mapCity(city: City): CityResponse {
  return {
    id: city.id,
    countryId: city.countryId,
    name: city.name,
    slug: city.slug,
    latitude: city.latitude,
    longitude: city.longitude,
  };
}

export function mapLanguage(language: Language): LanguageResponse {
  return {
    id: language.id,
    name: language.name,
    code: language.code,
  };
}

export function mapSpecialty(specialty: Specialty): SpecialtyResponse {
  return {
    id: specialty.id,
    name: specialty.name,
    slug: specialty.slug,
    description: specialty.description,
  };
}
