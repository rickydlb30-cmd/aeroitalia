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
  { name: 'Turkish Airlines', iata: 'TK', icao: 'THY', types: ['737-800', 'MAX 8', 'MAX 9'], country: 'Turkey', count_ng: 95, count_max: 55 },
  { name: 'Pegasus Airlines', iata: 'PC', icao: 'PGT', types: ['737-800', 'MAX 8'], country: 'Turkey', count_ng: 45, count_max: 30 },
  { name: 'SunExpress', iata: 'XQ', icao: 'SXS', types: ['737-800', 'MAX 8'], country: 'Turkey', count_ng: 35, count_max: 12 },
  { name: 'Corendon Airlines', iata: 'XC', icao: 'CAI', types: ['737-800', 'MAX 8'], country: 'Turkey', count_ng: 12, count_max: 5 },
  { name: 'Norwegian', iata: 'DY', icao: 'NAX', types: ['MAX 8'], country: 'Norway', count_ng: 0, count_max: 30 },
  { name: 'SAS', iata: 'SK', icao: 'SAS', types: ['737-700', '737-800'], country: 'Sweden', count_ng: 30, count_max: 0 },
  { name: 'TUI fly', iata: 'X3', icao: 'TUI', types: ['737-800', 'MAX 8'], country: 'Germany', count_ng: 40, count_max: 18 },
  { name: 'Transavia', iata: 'HV', icao: 'TRA', types: ['737-700', '737-800'], country: 'Netherlands', count_ng: 45, count_max: 0 },
  { name: 'KLM', iata: 'KL', icao: 'KLM', types: ['737-700', '737-800'], country: 'Netherlands', count_ng: 30, count_max: 0 },
  { name: 'Smartwings', iata: 'QS', icao: 'TVS', types: ['737-800', 'MAX 8'], country: 'Czech Republic', count_ng: 22, count_max: 7 },
  { name: 'Enter Air', iata: 'E4', icao: 'ENT', types: ['737-800', 'MAX 8'], country: 'Poland', count_ng: 20, count_max: 6 },
  { name: 'LOT Polish Airlines', iata: 'LO', icao: 'LOT', types: ['737-800', 'MAX 8'], country: 'Poland', count_ng: 12, count_max: 6 },
  { name: 'Buzz', iata: 'RR', icao: 'RYS', types: ['737-800', 'MAX 8'], country: 'Poland', count_ng: 25, count_max: 15 },
  { name: 'Icelandair', iata: 'FI', icao: 'ICE', types: ['MAX 8', 'MAX 9'], country: 'Iceland', count_ng: 0, count_max: 25 },
  { name: 'EgyptAir', iata: 'MS', icao: 'MSR', types: ['737-800'], country: 'Egypt', count_ng: 18, count_max: 0 },
  { name: 'Royal Air Maroc', iata: 'AT', icao: 'RAM', types: ['737-700', '737-800', 'MAX 8'], country: 'Morocco', count_ng: 20, count_max: 4 },
  { name: 'Tunisair', iata: 'TU', icao: 'TAR', types: ['737-600'], country: 'Tunisia', count_ng: 8, count_max: 0 },
  { name: 'Air Algerie', iata: 'AH', icao: 'DAH', types: ['737-600', '737-700', '737-800'], country: 'Algeria', count_ng: 24, count_max: 0 },
  { name: 'TAROM', iata: 'RO', icao: 'ROT', types: ['737-800'], country: 'Romania', count_ng: 4, count_max: 0 },
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
  // Turkish Airlines TC-JVL (real icao24: 4baa1c)
  { icao24: '4baa1c', callsign: 'THY42A', registration: 'TC-JVL', airline: 'Turkish Airlines', type: '737-800', family: 'NG', latitude: 41.008, longitude: 28.978, altitude: 34000, velocity: 440, heading: 300, on_ground: false, last_contact: Date.now() / 1000 },
  // Norwegian LN-BKA (real icao24: 478147)
  { icao24: '478147', callsign: 'NAX101', registration: 'LN-BKA', airline: 'Norwegian', type: 'MAX 8', family: 'MAX', latitude: 59.913, longitude: 10.752, altitude: 40000, velocity: 470, heading: 315, on_ground: false, last_contact: Date.now() / 1000 },
  // Pegasus Airlines TC-NBM (real icao24: 4bae4a)
  { icao24: '4bae4a', callsign: 'PGT201', registration: 'TC-NBM', airline: 'Pegasus Airlines', type: '737-800', family: 'NG', latitude: 39.925, longitude: 32.866, altitude: 36000, velocity: 450, heading: 180, on_ground: false, last_contact: Date.now() / 1000 },
  // SunExpress TC-SNP (real icao24: 4bb3c0)
  { icao24: '4bb3c0', callsign: 'SXS710', registration: 'TC-SNP', airline: 'SunExpress', type: '737-800', family: 'NG', latitude: 36.899, longitude: 30.714, altitude: 33000, velocity: 430, heading: 270, on_ground: false, last_contact: Date.now() / 1000 },
  // EgyptAir SU-GEH (real icao24: 010079)
  { icao24: '010079', callsign: 'MSR785', registration: 'SU-GEH', airline: 'EgyptAir', type: '737-800', family: 'NG', latitude: 30.047, longitude: 31.233, altitude: 31000, velocity: 420, heading: 45, on_ground: false, last_contact: Date.now() / 1000 },
  // Royal Air Maroc CN-RGG (real icao24: 060100)
  { icao24: '060100', callsign: 'RAM605', registration: 'CN-RGG', airline: 'Royal Air Maroc', type: '737-800', family: 'NG', latitude: 33.573, longitude: -7.589, altitude: 35000, velocity: 440, heading: 0, on_ground: false, last_contact: Date.now() / 1000 },
  // Icelandair TF-ICY (real icao24: 4f0200)
  { icao24: '4f0200', callsign: 'ICE432', registration: 'TF-ICY', airline: 'Icelandair', type: 'MAX 8', family: 'MAX', latitude: 64.130, longitude: -21.940, altitude: 39000, velocity: 460, heading: 120, on_ground: false, last_contact: Date.now() / 1000 },
  // TUI fly D-ATUJ (real icao24: 3c6750)
  { icao24: '3c6750', callsign: 'TUI88K', registration: 'D-ATUJ', airline: 'TUI fly', type: '737-800', family: 'NG', latitude: 51.289, longitude: 6.766, altitude: 37000, velocity: 450, heading: 200, on_ground: false, last_contact: Date.now() / 1000 },
];
