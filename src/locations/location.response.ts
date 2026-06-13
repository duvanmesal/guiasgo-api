import { LocationSource, LocationUpdate } from '@prisma/client';

export interface LocationResponse {
  id: string;
  userId: string;
  latitude: number;
  longitude: number;
  accuracy: number | null;
  source: string;
  updatedAt: string;
}

export function mapLocationResponse(location: LocationUpdate): LocationResponse {
  return {
    id: location.id,
    userId: location.userId,
    latitude: location.latitude,
    longitude: location.longitude,
    accuracy: location.accuracy,
    source: location.source.toLowerCase(),
    updatedAt: location.updatedAt.toISOString(),
  };
}

export function toDbLocationSource(source: string): LocationSource {
  return source.toUpperCase() as LocationSource;
}
