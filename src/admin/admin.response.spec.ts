import { buildAdminSummary } from './admin.response';

describe('buildAdminSummary', () => {
  it('keeps admin dashboard counters grouped by domain', () => {
    expect(
      buildAdminSummary(
        { total: 4, active: 3, suspended: 1 },
        { total: 2, pending: 1, inReview: 0, approved: 1, rejected: 0 },
        {
          total: 5,
          requested: 1,
          inProgress: 1,
          completed: 2,
          reported: 1,
          cancelled: 0,
        },
        { open: 1, inReview: 2, resolved: 3 },
      ),
    ).toEqual({
      users: { total: 4, active: 3, suspended: 1 },
      guides: { total: 2, pending: 1, inReview: 0, approved: 1, rejected: 0 },
      services: {
        total: 5,
        requested: 1,
        inProgress: 1,
        completed: 2,
        reported: 1,
        cancelled: 0,
      },
      complaints: { open: 1, inReview: 2, resolved: 3 },
    });
  });
});
