-- CreateEnum
CREATE TYPE "ServiceStatus" AS ENUM ('REQUESTED', 'ACCEPTED', 'GUIDE_ON_WAY', 'MEETING_POINT', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED_BY_TOURIST', 'CANCELLED_BY_GUIDE', 'REJECTED_BY_GUIDE', 'EXPIRED', 'REPORTED');

-- CreateEnum
CREATE TYPE "ServicePricingMode" AS ENUM ('HOURLY', 'ROUTE');

-- CreateTable
CREATE TABLE "service_requests" (
    "id" TEXT NOT NULL,
    "touristId" TEXT NOT NULL,
    "guideId" TEXT NOT NULL,
    "cityId" TEXT,
    "city" TEXT NOT NULL,
    "meetingPoint" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3),
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "ServiceStatus" NOT NULL DEFAULT 'REQUESTED',
    "pricingMode" "ServicePricingMode" NOT NULL DEFAULT 'HOURLY',
    "estimatedDurationHours" DECIMAL(5,2),
    "routeTitle" TEXT,
    "estimatedPrice" DECIMAL(12,2) NOT NULL,
    "notes" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "cancellationReason" TEXT,
    "cancellationNotes" TEXT,
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tour_sessions" (
    "id" TEXT NOT NULL,
    "serviceRequestId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "status" "ServiceStatus" NOT NULL,
    "routeSummary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tour_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "service_requests_touristId_status_idx" ON "service_requests"("touristId", "status");

-- CreateIndex
CREATE INDEX "service_requests_guideId_status_idx" ON "service_requests"("guideId", "status");

-- CreateIndex
CREATE INDEX "service_requests_cityId_idx" ON "service_requests"("cityId");

-- CreateIndex
CREATE INDEX "service_requests_scheduledAt_idx" ON "service_requests"("scheduledAt");

-- CreateIndex
CREATE INDEX "service_requests_expiresAt_idx" ON "service_requests"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "tour_sessions_serviceRequestId_key" ON "tour_sessions"("serviceRequestId");

-- AddForeignKey
ALTER TABLE "service_requests" ADD CONSTRAINT "service_requests_touristId_fkey" FOREIGN KEY ("touristId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_requests" ADD CONSTRAINT "service_requests_guideId_fkey" FOREIGN KEY ("guideId") REFERENCES "guide_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_requests" ADD CONSTRAINT "service_requests_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "cities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tour_sessions" ADD CONSTRAINT "tour_sessions_serviceRequestId_fkey" FOREIGN KEY ("serviceRequestId") REFERENCES "service_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
