import { ServiceRequest, TourSession } from '@prisma/client';
import { toApiPricingMode, toApiServiceStatus } from './service-status.mapper';

export interface ServiceRequestResponse {
  id: string;
  touristId: string;
  guideId: string;
  guideName: string | null;
  city: string;
  meetingPoint: string;
  scheduledAt: string | null;
  requestedAt: string;
  status: string;
  pricingMode: string;
  estimatedDurationHours: number | null;
  routeTitle: string | null;
  estimatedPrice: number;
  notes: string | null;
  expiresAt: string;
  acceptedAt: string | null;
  rejectedAt: string | null;
  cancelledAt: string | null;
  completedAt: string | null;
  cancellationReason: string | null;
  cancellationNotes: string | null;
  rejectionReason: string | null;
  tourSession: TourSessionResponse | null;
  createdAt: string;
  updatedAt: string;
}

export interface TourSessionResponse {
  id: string;
  serviceRequestId: string;
  startedAt: string | null;
  endedAt: string | null;
  status: string;
  routeSummary: string | null;
}

type ServiceRequestWithRelations = ServiceRequest & {
  guide?: {
    user?: {
      fullName: string;
    };
  };
  tourSession?: TourSession | null;
};

export function mapServiceRequestResponse(
  serviceRequest: ServiceRequestWithRelations,
): ServiceRequestResponse {
  return {
    id: serviceRequest.id,
    touristId: serviceRequest.touristId,
    guideId: serviceRequest.guideId,
    guideName: serviceRequest.guide?.user?.fullName ?? null,
    city: serviceRequest.city,
    meetingPoint: serviceRequest.meetingPoint,
    scheduledAt: serviceRequest.scheduledAt?.toISOString() ?? null,
    requestedAt: serviceRequest.requestedAt.toISOString(),
    status: toApiServiceStatus(serviceRequest.status),
    pricingMode: toApiPricingMode(serviceRequest.pricingMode),
    estimatedDurationHours: serviceRequest.estimatedDurationHours
      ? Number(serviceRequest.estimatedDurationHours)
      : null,
    routeTitle: serviceRequest.routeTitle,
    estimatedPrice: Number(serviceRequest.estimatedPrice),
    notes: serviceRequest.notes,
    expiresAt: serviceRequest.expiresAt.toISOString(),
    acceptedAt: serviceRequest.acceptedAt?.toISOString() ?? null,
    rejectedAt: serviceRequest.rejectedAt?.toISOString() ?? null,
    cancelledAt: serviceRequest.cancelledAt?.toISOString() ?? null,
    completedAt: serviceRequest.completedAt?.toISOString() ?? null,
    cancellationReason: serviceRequest.cancellationReason,
    cancellationNotes: serviceRequest.cancellationNotes,
    rejectionReason: serviceRequest.rejectionReason,
    tourSession: serviceRequest.tourSession
      ? mapTourSessionResponse(serviceRequest.tourSession)
      : null,
    createdAt: serviceRequest.createdAt.toISOString(),
    updatedAt: serviceRequest.updatedAt.toISOString(),
  };
}

function mapTourSessionResponse(session: TourSession): TourSessionResponse {
  return {
    id: session.id,
    serviceRequestId: session.serviceRequestId,
    startedAt: session.startedAt?.toISOString() ?? null,
    endedAt: session.endedAt?.toISOString() ?? null,
    status: toApiServiceStatus(session.status),
    routeSummary: session.routeSummary,
  };
}
