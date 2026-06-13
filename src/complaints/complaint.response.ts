import { Complaint, ComplaintStatus } from '@prisma/client';

export interface ComplaintResponse {
  id: string;
  serviceId: string;
  createdById: string;
  reason: string;
  description: string;
  status: string;
  assignedToId: string | null;
  resolvedAt: string | null;
  resolutionNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

export function mapComplaintResponse(complaint: Complaint): ComplaintResponse {
  return {
    id: complaint.id,
    serviceId: complaint.serviceRequestId,
    createdById: complaint.createdById,
    reason: complaint.reason,
    description: complaint.description,
    status: complaint.status.toLowerCase(),
    assignedToId: complaint.assignedToId,
    resolvedAt: complaint.resolvedAt?.toISOString() ?? null,
    resolutionNotes: complaint.resolutionNotes,
    createdAt: complaint.createdAt.toISOString(),
    updatedAt: complaint.updatedAt.toISOString(),
  };
}

export function toDbComplaintStatus(status: string): ComplaintStatus {
  return status.toUpperCase() as ComplaintStatus;
}
