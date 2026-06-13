import { GuideProfile, GuideVerificationStatus, Prisma } from '@prisma/client';

export interface GuideProfileResponse {
  id: string;
  userId: string;
  bio: string;
  city: string;
  languages: string[];
  specialties: string[];
  hourlyRate: number;
  supportsHourly: boolean;
  supportsRoute: boolean;
  rating: number;
  reviewCount: number;
  isAvailable: boolean;
  verificationStatus: string;
  isVerified: boolean;
  yearsExperience: number;
  latitude: number | null;
  longitude: number | null;
  createdAt: string;
  updatedAt: string;
}

export function toApiGuideVerificationStatus(
  status: GuideVerificationStatus,
): string {
  return status.toLowerCase();
}

export function mapGuideProfileResponse(
  profile: GuideProfile,
): GuideProfileResponse {
  return {
    id: profile.id,
    userId: profile.userId,
    bio: profile.bio,
    city: profile.city,
    languages: profile.languages,
    specialties: profile.specialties,
    hourlyRate: Number(profile.hourlyRate),
    supportsHourly: profile.supportsHourly,
    supportsRoute: profile.supportsRoute,
    rating: Number(profile.ratingAvg),
    reviewCount: profile.reviewCount,
    isAvailable: profile.isAvailable,
    verificationStatus: toApiGuideVerificationStatus(
      profile.verificationStatus,
    ),
    isVerified: profile.verificationStatus === GuideVerificationStatus.APPROVED,
    yearsExperience: profile.yearsExperience,
    latitude: profile.latitude,
    longitude: profile.longitude,
    createdAt: profile.createdAt.toISOString(),
    updatedAt: profile.updatedAt.toISOString(),
  };
}

export function toDbGuideVerificationStatus(
  status: string,
): GuideVerificationStatus {
  return status.toUpperCase() as GuideVerificationStatus;
}

export function toDecimal(value: number): Prisma.Decimal {
  return new Prisma.Decimal(value);
}
