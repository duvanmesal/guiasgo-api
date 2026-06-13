import { Review } from '@prisma/client';

export interface ReviewResponse {
  id: string;
  serviceId: string;
  reviewerId: string;
  reviewedUserId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
}

export function mapReviewResponse(review: Review): ReviewResponse {
  return {
    id: review.id,
    serviceId: review.serviceRequestId,
    reviewerId: review.reviewerId,
    reviewedUserId: review.reviewedUserId,
    rating: review.rating,
    comment: review.comment,
    createdAt: review.createdAt.toISOString(),
  };
}
