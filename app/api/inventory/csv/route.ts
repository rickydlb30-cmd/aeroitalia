import { NextResponse } from 'next/server';
import { getEUNorthAfricaFleet } from '@/lib/aircraft-db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const fleet = await getEUNorthAfricaFleet();

    // Build CSV with headers
    const headers = [
      'ICAO24 Hex',
      'Registration',
      'Airline/Operator',
      'Aircraft Type',
      'ICAO Typecode',
      'Family',
      'Country',
    ];

    const rows = fleet.map(ac => [
      ac.icao24,
      ac.registration,
      `"${(ac.airline || 'Unknown').replace(/"/g, '""')}"`,
      ac.type,
      ac.typecode,
      ac.family,
      ac.country,
    ].join(','));

    const csv = [headers.join(','), ...rows].join('\n');

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="boeing-737-eu-north-africa-fleet.csv"',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (err) {
    console.error('[inventory/csv] Error generating CSV:', err);
    return NextResponse.json(
      { error: 'Failed to generate CSV' },
      { status: 500 },
    );
  }
}
