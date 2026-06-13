import { ServicePricingMode, ServiceStatus } from '@prisma/client';

export const API_SERVICE_STATUSES = [
  'requested',
  'accepted',
  'guide_on_way',
  'meeting_point',
  'in_progress',
  'completed',
  'cancelled_by_tourist',
  'cancelled_by_guide',
  'rejected_by_guide',
  'expired',
  'reported',
] as const;

export type ApiServiceStatus = (typeof API_SERVICE_STATUSES)[number];

export function toApiServiceStatus(status: ServiceStatus): ApiServiceStatus {
  return status.toLowerCase() as ApiServiceStatus;
}

export function toDbServiceStatus(status: ApiServiceStatus): ServiceStatus {
  return status.toUpperCase() as ServiceStatus;
}

export function toApiPricingMode(mode: ServicePricingMode): string {
  return mode.toLowerCase();
}

export function toDbPricingMode(mode: string): ServicePricingMode {
  return mode.toUpperCase() as ServicePricingMode;
}
