/**
 * Server-side module that provides the Boeing 737 NG/MAX aircraft database.
 *
 * The data is pre-built at build time by scripts/fetch-aircraft-db.mjs which
 * downloads the OpenSky CSV (~60 MB), filters for 737 typecodes, and writes
 * a compact JSON file at lib/aircraft-data.json (~200 KB). This module just
 * reads that JSON — no runtime CSV fetching needed.
 */

import aircraftDataRaw from './aircraft-data.json';

export interface AircraftInfo {
  registration: string;
  airline: string;
  type: string;
  typecode: string;
  family: 'NG' | 'MAX';
}

// ── Load pre-built database from JSON ─────────────────────────────────────

// The JSON uses short keys for compactness: r=registration, a=airline, t=type, c=typecode, f=family
const aircraftData = aircraftDataRaw as Record<
  string,
  { r: string; a: string; t: string; c: string; f: 'NG' | 'MAX' }
>;

let cachedDb: Map<string, AircraftInfo> | null = null;

function buildDb(): Map<string, AircraftInfo> {
  const db = new Map<string, AircraftInfo>();
  for (const [icao24, entry] of Object.entries(aircraftData)) {
    db.set(icao24, {
      registration: entry.r,
      airline: entry.a,
      type: entry.t,
      typecode: entry.c,
      family: entry.f,
    });
  }
  console.log(`[aircraft-db] Loaded ${db.size} Boeing 737 aircraft from pre-built database`);
  return db;
}

/**
 * Returns a Map of icao24 → AircraftInfo for all known 737 NG/MAX aircraft.
 * Data is loaded from the pre-built JSON file (generated at build time).
 */
export async function getAircraftDb(): Promise<Map<string, AircraftInfo>> {
  if (!cachedDb) {
    cachedDb = buildDb();
  }
  return cachedDb;
}

export function classifyTypecode(tc: string): 'NG' | 'MAX' {
  const upper = tc.toUpperCase();
  if (upper === 'B37M' || upper === 'B38M' || upper === 'B39M' || upper === 'B3XM') {
    return 'MAX';
  }
  return 'NG';
}

// ── Inventory types and helpers ────────────────────────────────────────────

export interface InventoryAircraft {
  icao24: string;
  registration: string;
  airline: string;
  type: string;
  typecode: string;
  family: 'NG' | 'MAX';
  country: string;
}

const REG_PREFIX_TO_COUNTRY: [string, string][] = [
  // EU / EEA / UK
  ['EI-', 'Ireland'],
  ['D-', 'Germany'],
  ['G-', 'United Kingdom'],
  ['F-', 'France'],
  ['EC-', 'Spain'],
  ['I-', 'Italy'],
  ['PH-', 'Netherlands'],
  ['OE-', 'Austria'],
  ['OH-', 'Finland'],
  ['SE-', 'Sweden'],
  ['LN-', 'Norway'],
  ['OY-', 'Denmark'],
  ['CS-', 'Portugal'],
  ['SX-', 'Greece'],
  ['9H-', 'Malta'],
  ['HA-', 'Hungary'],
  ['OK-', 'Czech Republic'],
  ['SP-', 'Poland'],
  ['YR-', 'Romania'],
  ['LZ-', 'Bulgaria'],
  ['ES-', 'Estonia'],
  ['YL-', 'Latvia'],
  ['LY-', 'Lithuania'],
  ['OM-', 'Slovakia'],
  ['S5-', 'Slovenia'],
  ['9A-', 'Croatia'],
  ['OO-', 'Belgium'],
  ['LX-', 'Luxembourg'],
  ['5B-', 'Cyprus'],
  ['TF-', 'Iceland'],
  ['HB-', 'Switzerland'],
  ['TC-', 'Turkey'],
  // North Africa
  ['TS-', 'Tunisia'],
  ['SU-', 'Egypt'],
  ['7T-', 'Algeria'],
  ['CN-', 'Morocco'],
  ['5A-', 'Libya'],
];

// Sort by prefix length descending so longer prefixes match first
const SORTED_PREFIXES = [...REG_PREFIX_TO_COUNTRY].sort(
  (a, b) => b[0].length - a[0].length,
);

export function getCountryFromRegistration(reg: string): string {
  const upper = reg.toUpperCase();
  for (const [prefix, country] of SORTED_PREFIXES) {
    if (upper.startsWith(prefix)) return country;
  }
  return '';
}

const VALID_COUNTRIES = new Set(REG_PREFIX_TO_COUNTRY.map(([, c]) => c));

/**
 * Returns the full EU + North Africa 737 fleet inventory from the OpenSky
 * aircraft database, filtered by registration prefix.
 */
export async function getEUNorthAfricaFleet(): Promise<InventoryAircraft[]> {
  const db = await getAircraftDb();
  const fleet: InventoryAircraft[] = [];

  for (const [icao24, info] of db) {
    if (!info.registration) continue;
    const country = getCountryFromRegistration(info.registration);
    if (!country || !VALID_COUNTRIES.has(country)) continue;

    fleet.push({
      icao24,
      registration: info.registration,
      airline: info.airline || 'Unknown',
      type: info.type,
      typecode: info.typecode,
      family: info.family,
      country,
    });
  }

  fleet.sort((a, b) => {
    const airlineCmp = a.airline.localeCompare(b.airline);
    if (airlineCmp !== 0) return airlineCmp;
    return a.registration.localeCompare(b.registration);
  });

  return fleet;
}
