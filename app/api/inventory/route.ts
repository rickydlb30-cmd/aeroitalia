import { NextResponse } from 'next/server';
import { getEUNorthAfricaFleet } from '@/lib/aircraft-db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const fleet = await getEUNorthAfricaFleet();

    let totalNG = 0;
    let totalMAX = 0;
    const byCountry: Record<string, { ng: number; max: number; total: number }> = {};
    const byAirline: Record<string, { ng: number; max: number; total: number; types: string[] }> = {};
    const byType: Record<string, number> = {};

    for (const ac of fleet) {
      if (ac.family === 'NG') totalNG++;
      else totalMAX++;

      // By country
      if (!byCountry[ac.country]) byCountry[ac.country] = { ng: 0, max: 0, total: 0 };
      byCountry[ac.country].total++;
      if (ac.family === 'NG') byCountry[ac.country].ng++;
      else byCountry[ac.country].max++;

      // By airline
      if (!byAirline[ac.airline]) byAirline[ac.airline] = { ng: 0, max: 0, total: 0, types: [] };
      byAirline[ac.airline].total++;
      if (ac.family === 'NG') byAirline[ac.airline].ng++;
      else byAirline[ac.airline].max++;
      if (!byAirline[ac.airline].types.includes(ac.type)) {
        byAirline[ac.airline].types.push(ac.type);
      }

      // By type
      byType[ac.type] = (byType[ac.type] || 0) + 1;
    }

    return NextResponse.json(
      {
        fleet,
        summary: {
          total: fleet.length,
          totalNG,
          totalMAX,
        },
        byCountry,
        byAirline,
        byType,
      },
      {
        headers: {
          'Cache-Control': 'public, max-age=3600',
        },
      },
    );
  } catch (err) {
    console.error('[inventory] Error building fleet inventory:', err);
    return NextResponse.json(
      { error: 'Failed to build fleet inventory' },
      { status: 500 },
    );
  }
}
