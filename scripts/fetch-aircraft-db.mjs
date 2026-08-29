#!/usr/bin/env node
/**
 * Build-time script: downloads the OpenSky aircraft database CSV (~60 MB),
 * filters for Boeing 737 NG and MAX typecodes, and writes the result as a
 * compact JSON file at lib/aircraft-data.json (~100-200 KB).
 *
 * Run before `next build` so the runtime code can import the JSON directly
 * instead of fetching the 60 MB CSV from a serverless function.
 */

import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const CSV_URL = 'https://opensky-network.org/datasets/metadata/aircraftDatabase.csv';

const TYPECODE_TO_NAME = {
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

function classifyTypecode(tc) {
  if (tc === 'B37M' || tc === 'B38M' || tc === 'B39M' || tc === 'B3XM') return 'MAX';
  return 'NG';
}

function parseCSVLine(line) {
  const fields = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
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

async function main() {
  // If aircraft-data.json already exists and has data, skip the download.
  // This avoids re-downloading 60 MB on every deploy when the file is committed.
  const outPath = resolve(__dirname, '../lib/aircraft-data.json');
  try {
    const { readFileSync, statSync } = await import('node:fs');
    const stat = statSync(outPath);
    if (stat.size > 10) {
      const existing = JSON.parse(readFileSync(outPath, 'utf8'));
      const count = Object.keys(existing).length;
      if (count > 0) {
        console.log(`[fetch-aircraft-db] aircraft-data.json already exists with ${count} aircraft, skipping download.`);
        console.log('[fetch-aircraft-db] Delete lib/aircraft-data.json to force re-download.');
        return;
      }
    }
  } catch {
    // File doesn't exist or isn't valid JSON — proceed with download
  }

  console.log('[fetch-aircraft-db] Downloading OpenSky aircraft database...');
  const start = Date.now();

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 120_000); // 2 min timeout

  let res;
  try {
    res = await fetch(CSV_URL, {
      headers: { Accept: 'text/csv' },
      redirect: 'follow',
      signal: controller.signal,
    });
  } catch (err) {
    console.error('[fetch-aircraft-db] Failed to fetch CSV:', err.message);
    console.log('[fetch-aircraft-db] Writing empty database file.');
    writeFileSync(resolve(__dirname, '../lib/aircraft-data.json'), '{}');
    process.exit(0);
  } finally {
    clearTimeout(timeout);
  }

  if (!res.ok) {
    console.error(`[fetch-aircraft-db] HTTP ${res.status} ${res.statusText}`);
    writeFileSync(resolve(__dirname, '../lib/aircraft-data.json'), '{}');
    process.exit(0);
  }

  const text = await res.text();
  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`[fetch-aircraft-db] Downloaded ${(text.length / 1e6).toFixed(1)} MB in ${elapsed}s`);

  const lines = text.split('\n');
  const header = parseCSVLine(lines[0]);

  // Resolve column indices
  const idx = (name) => {
    const i = header.findIndex((h) => h.trim().toLowerCase() === name.toLowerCase());
    return i === -1 ? undefined : i;
  };
  const colIcao24 = idx('icao24') ?? 0;
  const colRegistration = idx('registration') ?? 1;
  const colTypecode = idx('typecode') ?? 5;
  const colOperator = idx('operator') ?? 9;

  // Build the database: icao24 -> { r: registration, a: airline, t: type, c: typecode, f: family }
  // Using short keys to keep the JSON compact
  const db = {};
  let count = 0;

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trimEnd();
    if (!line) continue;

    const fields = parseCSVLine(line);
    const typecode = (fields[colTypecode] ?? '').trim().toUpperCase();
    if (!VALID_TYPECODES.has(typecode)) continue;

    const icao24 = (fields[colIcao24] ?? '').trim().toLowerCase();
    if (!icao24) continue;

    const registration = (fields[colRegistration] ?? '').trim();
    const operator = (fields[colOperator] ?? '').trim();

    db[icao24] = {
      r: registration,
      a: operator,
      t: TYPECODE_TO_NAME[typecode],
      c: typecode,
      f: classifyTypecode(typecode),
    };
    count++;
  }

  const json = JSON.stringify(db);
  writeFileSync(outPath, json);

  const sizeKB = (json.length / 1024).toFixed(0);
  console.log(`[fetch-aircraft-db] Wrote ${count} aircraft to aircraft-data.json (${sizeKB} KB)`);
}

main();
