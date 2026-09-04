/**
 * Boeing 737 Level D Full-Flight Simulator (FFS) competitive landscape data
 * for the EU, North Africa, and Mediterranean region.
 *
 * Sources: CAE, HAVELSAN, BAA Training, CasaAero, FlightSafety, AviSim,
 * Aviacom, Aerospace Experience, public press releases.
 */

export interface SimulatorFacility {
  id: string;
  operator: string;
  location: string;
  country: string;
  lat: number;
  lng: number;
  aircraftType: '737 NG' | '737 MAX' | '737 NG + MAX';
  simulatorCount: number;
  certification: 'EASA Level D' | 'National Level D' | 'Level C/D';
  notes: string;
}

export const SIMULATOR_FACILITIES: SimulatorFacility[] = [
  // France
  {
    id: 'cae-paris-orly',
    operator: 'CAE / Air France Training',
    location: 'Paris Orly',
    country: 'France',
    lat: 48.7262,
    lng: 2.3652,
    aircraftType: '737 NG',
    simulatorCount: 1,
    certification: 'EASA Level D',
    notes: 'CAE-deployed FFS; also trains African operators',
  },
  {
    id: 'baa-paris',
    operator: 'BAA Training France',
    location: 'Paris Orly',
    country: 'France',
    lat: 48.7235,
    lng: 2.3795,
    aircraftType: '737 NG',
    simulatorCount: 2,
    certification: 'EASA Level D',
    notes: 'Two 737 NG FFS units; EASA ATO',
  },

  // Spain
  {
    id: 'cae-madrid',
    operator: 'CAE Madrid',
    location: 'Madrid',
    country: 'Spain',
    lat: 40.4719,
    lng: -3.5626,
    aircraftType: '737 NG',
    simulatorCount: 1,
    certification: 'EASA Level D',
    notes: 'Part of CAE global training network',
  },
  {
    id: 'baa-lleida',
    operator: 'BAA Training Spain',
    location: 'Lleida-Alguaire',
    country: 'Spain',
    lat: 41.7281,
    lng: 0.5353,
    aircraftType: '737 NG',
    simulatorCount: 1,
    certification: 'EASA Level D',
    notes: 'EASA ATO; type rating & recurrent training',
  },

  // Netherlands
  {
    id: 'cae-amsterdam',
    operator: 'CAE Amsterdam',
    location: 'Amsterdam',
    country: 'Netherlands',
    lat: 52.3105,
    lng: 4.7683,
    aircraftType: '737 NG + MAX',
    simulatorCount: 2,
    certification: 'EASA Level D',
    notes: 'First 737 MAX FFS in Europe deployed here',
  },

  // United Kingdom
  {
    id: 'cae-gatwick',
    operator: 'CAE Gatwick',
    location: 'Gatwick',
    country: 'United Kingdom',
    lat: 51.1537,
    lng: -0.1821,
    aircraftType: '737 NG',
    simulatorCount: 1,
    certification: 'EASA Level D',
    notes: 'Part of CAE European network',
  },
  {
    id: 'aerospace-exp-uk',
    operator: 'Aerospace Experience',
    location: 'Cambridgeshire / West Sussex',
    country: 'United Kingdom',
    lat: 52.2053,
    lng: 0.1218,
    aircraftType: '737 NG',
    simulatorCount: 1,
    certification: 'EASA Level D',
    notes: 'Professional Level D simulator',
  },

  // Turkey
  {
    id: 'havelsan-thy-ankara',
    operator: 'HAVELSAN / Turkish Airlines',
    location: 'Ankara',
    country: 'Turkey',
    lat: 39.9334,
    lng: 32.8597,
    aircraftType: '737 NG + MAX',
    simulatorCount: 3,
    certification: 'EASA Level D',
    notes: 'Two 737 MAX FFS (EASA Level D certified 2024) + NG units',
  },
  {
    id: 'thy-istanbul',
    operator: 'Turkish Airlines Flight Academy',
    location: 'Istanbul',
    country: 'Turkey',
    lat: 41.2753,
    lng: 28.7519,
    aircraftType: '737 NG + MAX',
    simulatorCount: 2,
    certification: 'EASA Level D',
    notes: 'Largest 737 training hub in the region',
  },

  // Lithuania
  {
    id: 'aviacom-vilnius',
    operator: 'Aviacom Flight Academy',
    location: 'Vilnius (Paluknys)',
    country: 'Lithuania',
    lat: 54.4849,
    lng: 24.9888,
    aircraftType: '737 NG',
    simulatorCount: 1,
    certification: 'EASA Level D',
    notes: 'EASA ATO; 737 CL/NG Level D/G simulator',
  },

  // Iceland
  {
    id: 'cae-iceland',
    operator: 'CAE / Icelandair Training',
    location: 'Reykjavik',
    country: 'Iceland',
    lat: 63.9850,
    lng: -22.6056,
    aircraftType: '737 MAX',
    simulatorCount: 1,
    certification: 'EASA Level D',
    notes: '737 MAX training for Icelandair fleet',
  },

  // Morocco
  {
    id: 'casaaero-casablanca',
    operator: 'CasaAero',
    location: 'Casablanca',
    country: 'Morocco',
    lat: 33.3675,
    lng: -7.5898,
    aircraftType: '737 NG',
    simulatorCount: 1,
    certification: 'National Level D',
    notes: 'DAC Morocco qualified; type rating & recurrent training',
  },

  // Spain (Barcelona)
  {
    id: 'cae-barcelona',
    operator: 'CAE Barcelona',
    location: 'Barcelona',
    country: 'Spain',
    lat: 41.2974,
    lng: 2.0833,
    aircraftType: '737 NG',
    simulatorCount: 1,
    certification: 'EASA Level D',
    notes: 'CAE European training network',
  },
];

export interface SimulatorSummary {
  totalFacilities: number;
  totalSimulators: number;
  byCountry: Record<string, { facilities: number; simulators: number }>;
  ngOnly: number;
  maxCapable: number;
  topOperators: { operator: string; simulators: number }[];
}

export function getSimulatorSummary(): SimulatorSummary {
  const byCountry: Record<string, { facilities: number; simulators: number }> = {};
  const operatorCounts: Record<string, number> = {};
  let ngOnly = 0;
  let maxCapable = 0;

  for (const f of SIMULATOR_FACILITIES) {
    if (!byCountry[f.country]) byCountry[f.country] = { facilities: 0, simulators: 0 };
    byCountry[f.country].facilities++;
    byCountry[f.country].simulators += f.simulatorCount;

    if (!operatorCounts[f.operator]) operatorCounts[f.operator] = 0;
    operatorCounts[f.operator] += f.simulatorCount;

    if (f.aircraftType === '737 NG') ngOnly += f.simulatorCount;
    else maxCapable += f.simulatorCount;
  }

  const topOperators = Object.entries(operatorCounts)
    .map(([operator, simulators]) => ({ operator, simulators }))
    .sort((a, b) => b.simulators - a.simulators);

  return {
    totalFacilities: SIMULATOR_FACILITIES.length,
    totalSimulators: SIMULATOR_FACILITIES.reduce((sum, f) => sum + f.simulatorCount, 0),
    byCountry,
    ngOnly,
    maxCapable,
    topOperators,
  };
}
