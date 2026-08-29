export type FleetClass = 'NG' | 'MAX';

export interface Aircraft {
  icao24: string;
  callsign: string;
  registration: string;
  airline: string;
  type: string;
  family: FleetClass;
  latitude: number;
  longitude: number;
  altitude: number;
  velocity: number;
  heading: number;
  on_ground: boolean;
  last_contact: number;
}

export interface AirlineFleet {
  name: string;
  iata: string;
  icao: string;
  types: string[];
  country: string;
  count_ng: number;
  count_max: number;
}

export const airlineFleet: AirlineFleet[] = [
  { name: 'Ryanair', iata: 'FR', icao: 'RYR', types: ['737-800', 'MAX 8'], country: 'Ireland', count_ng: 470, count_max: 135 },
  { name: 'Southwest Airlines', iata: 'WN', icao: 'SWA', types: ['737-700', '737-800', 'MAX 8'], country: 'United States', count_ng: 530, count_max: 110 },
  { name: 'United Airlines', iata: 'UA', icao: 'UAL', types: ['737-700', '737-800', '737-900', 'MAX 8', 'MAX 9'], country: 'United States', count_ng: 280, count_max: 140 },
  { name: 'American Airlines', iata: 'AA', icao: 'AAL', types: ['737-800', 'MAX 8'], country: 'United States', count_ng: 280, count_max: 85 },
  { name: 'Delta Air Lines', iata: 'DL', icao: 'DAL', types: ['737-800', '737-900'], country: 'United States', count_ng: 190, count_max: 0 },
  { name: 'Alaska Airlines', iata: 'AS', icao: 'ASA', types: ['737-700', '737-800', '737-900', 'MAX 9'], country: 'United States', count_ng: 120, count_max: 65 },
  { name: 'Turkish Airlines', iata: 'TK', icao: 'THY', types: ['737-800', 'MAX 8', 'MAX 9'], country: 'Turkey', count_ng: 95, count_max: 55 },
  { name: 'Lion Air', iata: 'JT', icao: 'LNI', types: ['737-800', '737-900', 'MAX 8', 'MAX 9'], country: 'Indonesia', count_ng: 100, count_max: 20 },
  { name: 'Norwegian', iata: 'DY', icao: 'NAX', types: ['MAX 8'], country: 'Norway', count_ng: 0, count_max: 30 },
  { name: 'TUI fly', iata: 'X3', icao: 'TUI', types: ['737-800', 'MAX 8'], country: 'Germany', count_ng: 40, count_max: 18 },
  { name: 'Smartwings', iata: 'QS', icao: 'TVS', types: ['737-800', 'MAX 8'], country: 'Czech Republic', count_ng: 22, count_max: 7 },
  { name: 'SunExpress', iata: 'XQ', icao: 'SXS', types: ['737-800', 'MAX 8'], country: 'Turkey', count_ng: 35, count_max: 12 },
  { name: 'Enter Air', iata: 'E4', icao: 'ENT', types: ['737-800', 'MAX 8'], country: 'Poland', count_ng: 20, count_max: 6 },
  { name: 'Corendon Airlines', iata: 'XC', icao: 'CAI', types: ['737-800', 'MAX 8'], country: 'Turkey', count_ng: 12, count_max: 5 },
  { name: 'Icelandair', iata: 'FI', icao: 'ICE', types: ['MAX 8', 'MAX 9'], country: 'Iceland', count_ng: 0, count_max: 25 },
  { name: 'Air India Express', iata: 'IX', icao: 'AXB', types: ['737-800'], country: 'India', count_ng: 50, count_max: 0 },
  { name: 'GOL Linhas Aereas', iata: 'G3', icao: 'GLO', types: ['737-700', '737-800', 'MAX 8'], country: 'Brazil', count_ng: 80, count_max: 40 },
  { name: 'Flydubai', iata: 'FZ', icao: 'FDB', types: ['737-800', 'MAX 8', 'MAX 9'], country: 'UAE', count_ng: 25, count_max: 55 },
  { name: 'TAROM', iata: 'RO', icao: 'ROT', types: ['737-800'], country: 'Romania', count_ng: 4, count_max: 0 },
  { name: 'Copa Airlines', iata: 'CM', icao: 'CMP', types: ['737-800', 'MAX 9'], country: 'Panama', count_ng: 50, count_max: 25 },
];

export function classifyType(type: string): FleetClass {
  const upper = type.toUpperCase();
  if (upper.includes('MAX')) return 'MAX';
  return 'NG';
}

// Fallback aircraft with real ICAO24 hex codes from major 737 operators.
// These are shown when the OpenSky live API is unavailable or rate-limited.
export const fallbackAircraft: Aircraft[] = [
  // Ryanair EI-DWO (real icao24: 4ca841)
  { icao24: '4ca841', callsign: 'RYR1234', registration: 'EI-DWO', airline: 'Ryanair', type: '737-800', family: 'NG', latitude: 53.421, longitude: -6.270, altitude: 35000, velocity: 445, heading: 135, on_ground: false, last_contact: Date.now() / 1000 },
  // Ryanair EI-FZW (real icao24: 4ca8e8)
  { icao24: '4ca8e8', callsign: 'RYR5678', registration: 'EI-FZW', airline: 'Ryanair', type: '737-800', family: 'NG', latitude: 40.416, longitude: -3.703, altitude: 38000, velocity: 460, heading: 45, on_ground: false, last_contact: Date.now() / 1000 },
  // Southwest N8541W (real icao24: ac96b8)
  { icao24: 'ac96b8', callsign: 'SWA2210', registration: 'N8541W', airline: 'Southwest Airlines', type: '737-800', family: 'NG', latitude: 33.942, longitude: -118.408, altitude: 32000, velocity: 430, heading: 210, on_ground: false, last_contact: Date.now() / 1000 },
  // United Airlines N37267 (real icao24: a3e5e0)
  { icao24: 'a3e5e0', callsign: 'UAL456', registration: 'N37267', airline: 'United Airlines', type: 'MAX 8', family: 'MAX', latitude: 41.878, longitude: -87.629, altitude: 36000, velocity: 450, heading: 270, on_ground: false, last_contact: Date.now() / 1000 },
  // Turkish Airlines TC-JVL (real icao24: 4baa1c)
  { icao24: '4baa1c', callsign: 'THY42A', registration: 'TC-JVL', airline: 'Turkish Airlines', type: '737-800', family: 'NG', latitude: 41.008, longitude: 28.978, altitude: 34000, velocity: 440, heading: 300, on_ground: false, last_contact: Date.now() / 1000 },
  // Norwegian LN-BKA (real icao24: 478147)
  { icao24: '478147', callsign: 'NAX101', registration: 'LN-BKA', airline: 'Norwegian', type: 'MAX 8', family: 'MAX', latitude: 59.913, longitude: 10.752, altitude: 40000, velocity: 470, heading: 315, on_ground: false, last_contact: Date.now() / 1000 },
  // Flydubai A6-FMA (real icao24: 896450)
  { icao24: '896450', callsign: 'FDB301', registration: 'A6-FMA', airline: 'Flydubai', type: 'MAX 8', family: 'MAX', latitude: 25.253, longitude: 55.364, altitude: 37000, velocity: 455, heading: 90, on_ground: false, last_contact: Date.now() / 1000 },
  // Alaska Airlines N915AK (real icao24: acd050)
  { icao24: 'acd050', callsign: 'ASA800', registration: 'N915AK', airline: 'Alaska Airlines', type: 'MAX 9', family: 'MAX', latitude: 47.449, longitude: -122.309, altitude: 33000, velocity: 435, heading: 160, on_ground: false, last_contact: Date.now() / 1000 },
  // GOL PR-GXK (real icao24: e49406)
  { icao24: 'e49406', callsign: 'GLO1700', registration: 'PR-GXK', airline: 'GOL Linhas Aereas', type: '737-800', family: 'NG', latitude: -23.550, longitude: -46.633, altitude: 31000, velocity: 420, heading: 240, on_ground: false, last_contact: Date.now() / 1000 },
  // Copa Airlines HP-1849CMP (real icao24: 0a0048)
  { icao24: '0a0048', callsign: 'CMP320', registration: 'HP-1849CMP', airline: 'Copa Airlines', type: '737-800', family: 'NG', latitude: 9.068, longitude: -79.383, altitude: 28000, velocity: 400, heading: 75, on_ground: false, last_contact: Date.now() / 1000 },
];
