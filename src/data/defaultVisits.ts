import { VisitDataStore } from '../types/wedding';

export const defaultWeddingVisits: VisitDataStore = {
  totalVisits: 1,
  byDate: {
    [new Date().toISOString().slice(0, 10)]: 1,
  },
  byMonth: {
    [new Date().toISOString().slice(0, 7)]: 1,
  },
  byYear: {
    [new Date().toISOString().slice(0, 4)]: 1,
  },
  recentVisits: [
    {
      id: 'visit-init',
      timestamp: new Date().toISOString(),
      date: new Date().toISOString().slice(0, 10),
      month: new Date().toISOString().slice(0, 7),
      year: new Date().toISOString().slice(0, 4),
      page: '/',
      device: 'desktop',
    },
  ],
};
