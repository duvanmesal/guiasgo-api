import { ConflictException } from '@nestjs/common';
import { ServiceStatus, UserRole } from '@prisma/client';
import { ServiceStateMachine } from './service-state-machine';

describe('ServiceStateMachine', () => {
  const stateMachine = new ServiceStateMachine();

  it('allows a guide to accept a requested service', () => {
    expect(() =>
      stateMachine.assertTransition(
        ServiceStatus.REQUESTED,
        ServiceStatus.ACCEPTED,
        UserRole.GUIDE,
      ),
    ).not.toThrow();
  });

  it('rejects invalid backwards transitions', () => {
    expect(() =>
      stateMachine.assertTransition(
        ServiceStatus.COMPLETED,
        ServiceStatus.IN_PROGRESS,
        UserRole.GUIDE,
      ),
    ).toThrow(ConflictException);
  });

  it('rejects guide-only transitions for tourists', () => {
    expect(() =>
      stateMachine.assertTransition(
        ServiceStatus.REQUESTED,
        ServiceStatus.ACCEPTED,
        UserRole.TOURIST,
      ),
    ).toThrow(ConflictException);
  });
});
