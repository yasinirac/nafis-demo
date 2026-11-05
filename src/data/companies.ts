import { fig } from './types';

/**
 * Companies and partners. Every organisation here is fictional.
 */

export const companies = {
  qasr: {
    name: 'Qasr Logistics',
    licences: [
      { id: 'LIC-SHJ-0417', name: 'Sharjah HQ' },
      { id: 'LIC-DXB-1182', name: 'Dubai branch' },
    ],
    licenceCount: fig(2, 'sample'),
    emiratis: fig(13, 'sample'),
    eqs: { band: 'B', score: fig(72, 'sample'), trend: 'Rising' },
    retention12: fig(78, 'sample'),
    sectorRetention12: fig(64, 'sample'),
  },
  wadi: {
    name: 'Wadi Trading Group',
  },
  duneCrest: {
    name: 'Dune Crest Facility Services LLC',
  },
  falak: {
    name: 'Falak HR Cloud',
  },
  gcu: {
    name: 'Gulf Coast University',
    college: 'College of Business',
  },
};
