import { TouristProfile } from '@prisma/client';

export interface TouristProfileResponse {
  id: string;
  userId: string;
  nationality: string | null;
  preferredLanguage: string | null;
  emergencyContact: string | null;
  interests: string[];
  createdAt: string;
  updatedAt: string;
}

export function mapTouristProfileResponse(
  profile: TouristProfile,
): TouristProfileResponse {
  return {
    id: profile.id,
    userId: profile.userId,
    nationality: profile.nationality,
    preferredLanguage: profile.preferredLanguage,
    emergencyContact: profile.emergencyContact,
    interests: profile.interests,
    createdAt: profile.createdAt.toISOString(),
    updatedAt: profile.updatedAt.toISOString(),
  };
}
