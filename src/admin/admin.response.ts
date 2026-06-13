import { mapGuideCertificationResponse } from '../certifications/certification.response';
import { mapComplaintResponse } from '../complaints/complaint.response';
import { mapGuideProfileResponse } from '../guides/guide-profile.response';
import { mapUserResponse } from '../users/user-response';

export interface AdminSummaryResponse {
  users: {
    total: number;
    active: number;
    suspended: number;
  };
  guides: {
    total: number;
    pending: number;
    inReview: number;
    approved: number;
    rejected: number;
  };
  services: {
    total: number;
    requested: number;
    inProgress: number;
    completed: number;
    reported: number;
    cancelled: number;
  };
  complaints: {
    open: number;
    inReview: number;
    resolved: number;
  };
}

export interface AdminListResponse<T> {
  items: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export type AdminUserResponse = ReturnType<typeof mapUserResponse>;
export type AdminGuideResponse = ReturnType<typeof mapGuideProfileResponse>;
export type AdminCertificationResponse = ReturnType<
  typeof mapGuideCertificationResponse
>;
export type AdminComplaintResponse = ReturnType<typeof mapComplaintResponse>;

export {
  mapUserResponse,
  mapGuideProfileResponse,
  mapGuideCertificationResponse,
  mapComplaintResponse,
};

export function buildAdminSummary(
  users: { total: number; active: number; suspended: number },
  guides: {
    total: number;
    pending: number;
    inReview: number;
    approved: number;
    rejected: number;
  },
  services: {
    total: number;
    requested: number;
    inProgress: number;
    completed: number;
    reported: number;
    cancelled: number;
  },
  complaints: {
    open: number;
    inReview: number;
    resolved: number;
  },
): AdminSummaryResponse {
  return {
    users,
    guides,
    services,
    complaints,
  };
}
