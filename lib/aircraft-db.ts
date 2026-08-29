/**
 * Server-side module that downloads and caches the OpenSky aircraft database,
 * filtered to Boeing 737 NG and MAX variants.
 *
 * The CSV (~60 MB) is streamed and parsed line-by-line to avoid holding the
 * entire file in memory as a string. The resulting Map is cached for 24 h.
 */

export interface AircraftInfo {
  registration: string;
  airline: string;
  type: string;
  typecode: string;
  family: 'NG' | 'MAX';
}

// ── Typecode mappings ──────────────────────────────────────────────────────

const TYPECODE_TO_NAME: Record<string, string> = {
  B736: '737-600',
  B737: '737-700',
  B738: '737-800',
  B739: '737-900',
  B37M: 'MAX 7',
  B38M: 'MAX 8',
  B39M: 'MAX 9',
  B3XM: 'MAX 10',
};

const VALID_TYPECODES = new Set(Object.keys(TYPECODE_TO_NAME));

export function classifyTypecode(tc: string): 'NG' | 'MAX' {
  const upper = tc.toUpperCase();
  if (upper === 'B37M' || upper === 'B38M' || upper === 'B39M' || upper === 'B3XM') {
    return 'MAX';
  }
  return 'NG';
}

// ── Cache state ────────────────────────────────────────────────────────────

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const CSV_URL =
  'https://opensky-network.org/datasets/metadata/aircraftDatabase.csv';

let cachedDb: Map<string, AircraftInfo> | null = null;
let cachedAt = 0;
let fetchInProgress: Promise<Map<string, AircraftInfo>> | null = null;

// ── CSV field indices (from the header row) ────────────────────────────────
// icao24(0), registration(1), manufacturericao(2), manufacturername(3),
// model(4), typecode(5), serialnumber(6), linenumber(7), icaoaircrafttype(8),
// operator(9), ...

function parseCSVLine(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++; // skip escaped quote
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      fields.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  fields.push(current);
  return fields;
}

async function fetchAndParse(): Promise<Map<string, AircraftInfo>> {
  const db = new Map<string, AircraftInfo>();

  try {
    const res = await fetch(CSV_URL, {
      headers: { Accept: 'text/csv' },
      redirect: 'follow',
    });

    if (!res.ok || !res.body) {
      console.warn(
        `[aircraft-db] Failed to fetch OpenSky CSV: ${res.status} ${res.statusText}`,
      );
      return db;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let partial = '';
    let headerSkipped = false;

    // Column indices resolved from header
    let colIcao24 = 0;
    let colRegistration = 1;
    let colTypecode = 5;
    let colOperator = 9;

    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;

      partial += decoder.decode(value, { stream: true });
      const lines = partial.split('\n');
      // Keep last (possibly incomplete) line for next chunk
      partial = lines.pop() ?? '';

      for (const rawLine of lines) {
        const line = rawLine.trimEnd();
        if (!line) continue;

        if (!headerSkipped) {
          // Resolve column indices from the actual header so we're resilient
          // to column reordering.
          const hdr = parseCSVLine(line);
          const idx = (name: string) => {
            const i = hdr.findIndex(
              (h) => h.trim().toLowerCase() === name.toLowerCase(),
            );
            return i === -1 ? undefined : i;
          };
          colIcao24 = idx('icao24') ?? 0;
          colRegistration = idx('registration') ?? 1;
          colTypecode = idx('typecode') ?? 5;
          colOperator = idx('operator') ?? 9;
          headerSkipped = true;
          continue;
        }

        const fields = parseCSVLine(line);
        const typecode = (fields[colTypecode] ?? '').trim().toUpperCase();
        if (!VALID_TYPECODES.has(typecode)) continue;

        const icao24 = (fields[colIcao24] ?? '').trim().toLowerCase();
        if (!icao24) continue;

        const registration = (fields[colRegistration] ?? '').trim();
        const operator = (fields[colOperator] ?? '').trim();

        db.set(icao24, {
          registration,
          airline: operator,
          type: TYPECODE_TO_NAME[typecode] ?? typecode,
          typecode,
          family: classifyTypecode(typecode),
        });
      }
    }

    // Handle any remaining partial line
    if (partial.trim()) {
      const fields = parseCSVLine(partial.trim());
      const typecode = (fields[colTypecode] ?? '').trim().toUpperCase();
      if (VALID_TYPECODES.has(typecode)) {
        const icao24 = (fields[colIcao24] ?? '').trim().toLowerCase();
        if (icao24) {
          const registration = (fields[colRegistration] ?? '').trim();
          const operator = (fields[colOperator] ?? '').trim();
          db.set(icao24, {
            registration,
            airline: operator,
            type: TYPECODE_TO_NAME[typecode] ?? typecode,
            typecode,
            family: classifyTypecode(typecode),
          });
        }
      }
    }

    console.log(`[aircraft-db] Loaded ${db.size} Boeing 737 aircraft from OpenSky`);
  } catch (err) {
    console.warn('[aircraft-db] Error fetching OpenSky CSV:', err);
  }

  return db;
}

/**
 * Returns a Map of icao24 → AircraftInfo for all known 737 NG/MAX aircraft.
 * The data is fetched from OpenSky on first call, then cached for 24 hours.
 * If the fetch fails, returns an empty map (callers should fall back to
 * `fallbackAircraft`).
 */
export async function getAircraftDb(): Promise<Map<string, AircraftInfo>> {
  const now = Date.now();

  if (cachedDb && now - cachedAt < CACHE_TTL_MS) {
    return cachedDb;
  }

  // Avoid duplicate concurrent fetches
  if (!fetchInProgress) {
    fetchInProgress = fetchAndParse()
      .then((db) => {
        cachedDb = db;
        cachedAt = Date.now();
        fetchInProgress = null;
        return db;
      })
      .catch((err) => {
        console.warn('[aircraft-db] Fetch failed, returning empty map:', err);
        fetchInProgress = null;
        return new Map<string, AircraftInfo>();
      });
  }

  return fetchInProgress;
}
