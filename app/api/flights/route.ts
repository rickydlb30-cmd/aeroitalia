import { NextResponse } from 'next/server';
import { fallbackAircraft, type Aircraft } from '@/lib/fleet-data';
import { getAircraftDb } from '@/lib/aircraft-db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const headers: Record<string, string> = {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
  };

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const url = 'https://opensky-network.org/api/states/all?lamin=25&lamax=72&lomin=-15&lomax=45';

    const fetchHeaders: Record<string, string> = {};
    const username = process.env.OPENSKY_USERNAME;
    const password = process.env.OPENSKY_PASSWORD;
    if (username && password) {
      fetchHeaders['Authorization'] = 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64');
    }

    const response = await fetch(url, {
      headers: fetchHeaders,
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (response.status === 429) {
      return NextResponse.json(
        {
          source: 'fallback',
          flights: fallbackAircraft,
          refreshedAt: new Date().toISOString(),
          rateLimited: true,
        },
        { headers }
      );
    }

    if (!response.ok) {
      throw new Error(`OpenSky returned ${response.status}`);
    }

    const data = await response.json();
    const states: unknown[][] = data.states || [];

    const aircraftDb = await getAircraftDb();
    const flights: Aircraft[] = [];

    for (const sv of states) {
      const icao24 = (sv[0] as string)?.toLowerCase();
      const match = aircraftDb.get(icao24);
      if (!match) continue;

      const callsign = ((sv[1] as string) || '').trim();
      const longitude = sv[5] as number | null;
      const latitude = sv[6] as number | null;
      const altitude = sv[7] as number | null;
      const onGround = sv[8] as boolean;
      const velocity = sv[9] as number | null;
      const heading = sv[10] as number | null;
      const lastContact = sv[4] as number;

      if (latitude == null || longitude == null) continue;

      flights.push({
        icao24,
        callsign: callsign || icao24.toUpperCase(),
        registration: match.registration,
        airline: match.airline,
        type: match.type,
        family: match.family,
        latitude,
        longitude,
        altitude: altitude != null ? Math.round(altitude * 3.28084) : 0,
        velocity: velocity != null ? Math.round(velocity * 1.94384) : 0,
        heading: heading ?? 0,
        on_ground: onGround,
        last_contact: lastContact,
      });
    }

    return NextResponse.json(
      {
        source: 'opensky',
        flights,
        refreshedAt: new Date().toISOString(),
        rateLimited: false,
      },
      { headers }
    );
  } catch {
    return NextResponse.json(
      {
        source: 'fallback',
        flights: fallbackAircraft,
        refreshedAt: new Date().toISOString(),
        rateLimited: true,
      },
      { headers }
    );
  }
}
