import { LocationSource } from '@prisma/client';
import { mapLocationResponse } from './location.response';

describe('mapLocationResponse', () => {
  it('serializes location source in lowercase', () => {
    const updatedAt = new Date('2026-06-13T01:00:00.000Z');

    expect(
      mapLocationResponse({
        id: 'location-1',
        userId: 'user-1',
        latitude: 10.4,
        longitude: -75.5,
        accuracy: 12,
        source: LocationSource.MOCK,
        createdAt: updatedAt,
        updatedAt,
      }),
    ).toEqual({
      id: 'location-1',
      userId: 'user-1',
      latitude: 10.4,
      longitude: -75.5,
      accuracy: 12,
      source: 'mock',
      updatedAt: '2026-06-13T01:00:00.000Z',
    });
  });
});
