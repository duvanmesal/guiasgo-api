import { ConflictException, Injectable } from '@nestjs/common';
import { ServiceStatus, UserRole } from '@prisma/client';

const TRANSITIONS: Record<ServiceStatus, ServiceStatus[]> = {
  REQUESTED: [
    ServiceStatus.ACCEPTED,
    ServiceStatus.REJECTED_BY_GUIDE,
    ServiceStatus.CANCELLED_BY_TOURIST,
    ServiceStatus.EXPIRED,
    ServiceStatus.REPORTED,
  ],
  ACCEPTED: [
    ServiceStatus.GUIDE_ON_WAY,
    ServiceStatus.CANCELLED_BY_TOURIST,
    ServiceStatus.CANCELLED_BY_GUIDE,
    ServiceStatus.REPORTED,
  ],
  GUIDE_ON_WAY: [
    ServiceStatus.MEETING_POINT,
    ServiceStatus.CANCELLED_BY_GUIDE,
    ServiceStatus.REPORTED,
  ],
  MEETING_POINT: [
    ServiceStatus.IN_PROGRESS,
    ServiceStatus.CANCELLED_BY_TOURIST,
    ServiceStatus.CANCELLED_BY_GUIDE,
    ServiceStatus.REPORTED,
  ],
  IN_PROGRESS: [ServiceStatus.COMPLETED, ServiceStatus.REPORTED],
  COMPLETED: [ServiceStatus.REPORTED],
  CANCELLED_BY_TOURIST: [],
  CANCELLED_BY_GUIDE: [],
  REJECTED_BY_GUIDE: [],
  EXPIRED: [],
  REPORTED: [],
};

const ROLE_TRANSITIONS: Partial<Record<ServiceStatus, UserRole[]>> = {
  ACCEPTED: [UserRole.GUIDE],
  REJECTED_BY_GUIDE: [UserRole.GUIDE],
  GUIDE_ON_WAY: [UserRole.GUIDE],
  MEETING_POINT: [UserRole.GUIDE],
  IN_PROGRESS: [UserRole.GUIDE],
  COMPLETED: [UserRole.GUIDE],
  CANCELLED_BY_TOURIST: [UserRole.TOURIST],
  CANCELLED_BY_GUIDE: [UserRole.GUIDE],
  REPORTED: [UserRole.TOURIST, UserRole.GUIDE, UserRole.ADMIN, UserRole.SUPPORT],
};

@Injectable()
export class ServiceStateMachine {
  assertTransition(
    current: ServiceStatus,
    next: ServiceStatus,
    role: UserRole,
  ): void {
    if (!TRANSITIONS[current].includes(next)) {
      throw new ConflictException(
        `Cannot transition service from ${current} to ${next}`,
      );
    }

    const allowedRoles = ROLE_TRANSITIONS[next];

    if (allowedRoles && !allowedRoles.includes(role)) {
      throw new ConflictException(`Role ${role} cannot set status ${next}`);
    }
  }
}
