'use client';

import { useMemo } from 'react';
import MapGL, { Marker, NavigationControl } from 'react-map-gl/mapbox';
import {
  SIMULATOR_FACILITIES,
  getSimulatorSummary,
} from '@/lib/simulator-data';

interface StrategyViewProps {
  token: string;
  fleetByCountry: Record<string, { ng: number; max: number; total: number }>;
  fleetByAirline: Record<string, { ng: number; max: number; total: number; types: string[] }>;
  totalFleet: number;
  totalNG: number;
  totalMAX: number;
}

/** Country centroids for the opportunity map */
const COORDS: Record<string, { lat: number; lng: number }> = {
  Ireland: { lat: 53.35, lng: -6.26 },
  Germany: { lat: 51.17, lng: 10.45 },
  'United Kingdom': { lat: 51.51, lng: -0.13 },
  France: { lat: 48.86, lng: 2.35 },
  Spain: { lat: 40.42, lng: -3.7 },
  Italy: { lat: 41.9, lng: 12.5 },
  Netherlands: { lat: 52.37, lng: 4.9 },
  Austria: { lat: 48.21, lng: 16.37 },
  Finland: { lat: 60.17, lng: 24.94 },
  Sweden: { lat: 59.33, lng: 18.07 },
  Norway: { lat: 59.91, lng: 10.75 },
  Denmark: { lat: 55.68, lng: 12.57 },
  Portugal: { lat: 38.72, lng: -9.14 },
  Greece: { lat: 37.97, lng: 23.73 },
  Malta: { lat: 35.9, lng: 14.51 },
  Hungary: { lat: 47.5, lng: 19.04 },
  'Czech Republic': { lat: 50.08, lng: 14.44 },
  Poland: { lat: 52.23, lng: 21.01 },
  Romania: { lat: 44.43, lng: 26.1 },
  Bulgaria: { lat: 42.7, lng: 23.32 },
  Estonia: { lat: 59.44, lng: 24.75 },
  Latvia: { lat: 56.95, lng: 24.11 },
  Lithuania: { lat: 54.69, lng: 25.28 },
  Slovakia: { lat: 48.15, lng: 17.11 },
  Slovenia: { lat: 46.05, lng: 14.51 },
  Croatia: { lat: 45.81, lng: 15.98 },
  Belgium: { lat: 50.85, lng: 4.35 },
  Luxembourg: { lat: 49.61, lng: 6.13 },
  Cyprus: { lat: 35.17, lng: 33.36 },
  Iceland: { lat: 64.13, lng: -21.9 },
  Switzerland: { lat: 47.38, lng: 8.54 },
  Turkey: { lat: 39.93, lng: 32.86 },
  Tunisia: { lat: 36.81, lng: 10.18 },
  Egypt: { lat: 30.04, lng: 31.24 },
  Algeria: { lat: 36.75, lng: 3.06 },
  Morocco: { lat: 33.97, lng: -6.85 },
  Libya: { lat: 32.9, lng: 13.18 },
};

export default function StrategyView({
  token,
  fleetByCountry,
  fleetByAirline,
  totalFleet,
  totalNG,
  totalMAX,
}: StrategyViewProps) {
  const simSummary = useMemo(() => getSimulatorSummary(), []);

  const targetCapture = Math.round(totalFleet * 0.015);
  const aircraftPerSim = totalFleet > 0 ? Math.round(totalFleet / simSummary.totalSimulators) : 0;

  // Countries with fleet but no simulator
  const underserved = useMemo(() => {
    return Object.entries(fleetByCountry)
      .filter(([country]) => !simSummary.byCountry[country])
      .sort((a, b) => b[1].total - a[1].total);
  }, [fleetByCountry, simSummary]);

  const underservedFleet = underserved.reduce((s, [, d]) => s + d.total, 0);

  // Top airlines by fleet size
  const topAirlines = useMemo(() => {
    return Object.entries(fleetByAirline)
      .sort((a, b) => b[1].total - a[1].total)
      .slice(0, 10);
  }, [fleetByAirline]);

  // MAX growth rate
  const maxPct = totalFleet > 0 ? ((totalMAX / totalFleet) * 100).toFixed(1) : '0';

  return (
    <div className="flex-1 overflow-auto bg-[#0a0a0a]">
      {/* Hero section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#3b82f6]/10 via-transparent to-[#f97316]/10" />
        <div className="relative px-6 py-10 md:px-12 md:py-16 max-w-5xl mx-auto">
          <div className="text-[10px] uppercase tracking-[0.2em] text-[#22c55e] font-semibold mb-3">
            Market Intelligence Brief
          </div>
          <h1 className="text-2xl md:text-4xl font-bold text-[#e5e5e5] leading-tight mb-4">
            Boeing 737 Pilot Training<br />
            <span className="text-[#22c55e]">Market Opportunity</span>
          </h1>
          <p className="text-sm md:text-base text-[#888] max-w-2xl leading-relaxed">
            The EU &amp; North Africa region operates{' '}
            <span className="text-[#e5e5e5] font-semibold">{totalFleet.toLocaleString()}</span> Boeing 737
            aircraft across{' '}
            <span className="text-[#e5e5e5] font-semibold">{Object.keys(fleetByCountry).length}</span> countries
            and{' '}
            <span className="text-[#e5e5e5] font-semibold">{Object.keys(fleetByAirline).length}+</span> airlines
            — served by only{' '}
            <span className="text-[#22c55e] font-semibold">{simSummary.totalSimulators}</span> Level D full-flight simulators.
            This creates a structural supply-demand imbalance in the pilot training market.
          </p>
        </div>
      </div>

      {/* Core thesis */}
      <div className="border-t border-b border-[#222222] bg-[#111111]">
        <div className="max-w-5xl mx-auto px-6 md:px-12 py-8">
          <div className="text-[10px] uppercase tracking-[0.2em] text-[#888] font-semibold mb-4">
            The Thesis
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="text-3xl md:text-4xl font-mono font-bold text-[#3b82f6]">
                {aircraftPerSim}:1
              </div>
              <div className="text-xs text-[#aaa]">Aircraft-to-Simulator Ratio</div>
              <div className="text-[11px] text-[#666] leading-relaxed">
                Each Level D simulator services ~{aircraftPerSim} aircraft in the region.
                Industry benchmark is 80-100:1 for optimal training capacity.
                The current ratio signals undersupply.
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl md:text-4xl font-mono font-bold text-[#f97316]">
                1.5%
              </div>
              <div className="text-xs text-[#aaa]">Target Fleet Capture</div>
              <div className="text-[11px] text-[#666] leading-relaxed">
                Capturing just 1.5% of the regional fleet ({targetCapture} aircraft worth of
                pilot training contracts) would generate sustainable revenue as a new
                market entrant with a single simulator facility.
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl md:text-4xl font-mono font-bold text-[#22c55e]">
                {underserved.length}
              </div>
              <div className="text-xs text-[#aaa]">Underserved Countries</div>
              <div className="text-[11px] text-[#666] leading-relaxed">
                {underserved.length} countries operate 737s but have zero local Level D simulators,
                forcing airlines to send pilots abroad for training — a cost and logistics
                pain point that creates opportunity.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fleet composition */}
      <div className="max-w-5xl mx-auto px-6 md:px-12 py-8">
        <div className="text-[10px] uppercase tracking-[0.2em] text-[#888] font-semibold mb-4">
          Fleet Composition
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-[#111] border border-[#222] rounded-lg p-4">
            <div className="text-2xl font-mono font-bold">{totalFleet.toLocaleString()}</div>
            <div className="text-xs text-[#888] mt-1">Total Fleet</div>
          </div>
          <div className="bg-[#111] border border-[#222] rounded-lg p-4">
            <div className="text-2xl font-mono font-bold text-[#3b82f6]">{totalNG.toLocaleString()}</div>
            <div className="text-xs text-[#888] mt-1">737 NG ({((totalNG / totalFleet) * 100).toFixed(0)}%)</div>
          </div>
          <div className="bg-[#111] border border-[#222] rounded-lg p-4">
            <div className="text-2xl font-mono font-bold text-[#f97316]">{totalMAX.toLocaleString()}</div>
            <div className="text-xs text-[#888] mt-1">737 MAX ({maxPct}%)</div>
          </div>
          <div className="bg-[#111] border border-[#222] rounded-lg p-4">
            <div className="text-2xl font-mono font-bold text-[#22c55e]">{targetCapture}</div>
            <div className="text-xs text-[#888] mt-1">1.5% Target Capture</div>
          </div>
        </div>

        {/* NG/MAX split bar */}
        <div className="mb-2">
          <div className="flex h-5 rounded-full overflow-hidden border border-[#333]">
            <div
              className="bg-[#3b82f6] flex items-center justify-center text-[10px] font-mono font-semibold text-white"
              style={{ width: `${(totalNG / totalFleet) * 100}%` }}
            >
              NG {((totalNG / totalFleet) * 100).toFixed(0)}%
            </div>
            <div
              className="bg-[#f97316] flex items-center justify-center text-[10px] font-mono font-semibold text-white"
              style={{ width: `${(totalMAX / totalFleet) * 100}%` }}
            >
              MAX {maxPct}%
            </div>
          </div>
        </div>
        <div className="text-[10px] text-[#555]">
          The MAX fleet is growing as airlines take delivery of new orders — creating demand for MAX-specific simulator capacity,
          currently served by only {simSummary.maxCapable} simulators in the region.
        </div>
      </div>

      {/* Opportunity map */}
      {token && (
        <div className="border-t border-[#222222]">
          <div className="max-w-5xl mx-auto px-6 md:px-12 py-8">
            <div className="text-[10px] uppercase tracking-[0.2em] text-[#888] font-semibold mb-4">
              Supply vs. Demand — Geographic View
            </div>
            <div className="h-[450px] rounded-lg overflow-hidden border border-[#222]">
              <OpportunityMap
                fleetByCountry={fleetByCountry}
                simByCountry={simSummary.byCountry}
                token={token}
              />
            </div>
            <div className="flex items-center gap-4 mt-3 text-[10px] text-[#888]">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full border-2 border-[#f97316] bg-[#f97316]/20 inline-block" />
                Fleet only (no simulator)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full border-2 border-[#22c55e] bg-[#22c55e]/20 inline-block" />
                Fleet + Simulator
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-sm border border-[#22c55e] bg-[#22c55e]/30 inline-block" />
                Simulator facility
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Key customers */}
      <div className="border-t border-[#222222] bg-[#111111]">
        <div className="max-w-5xl mx-auto px-6 md:px-12 py-8">
          <div className="text-[10px] uppercase tracking-[0.2em] text-[#888] font-semibold mb-4">
            Top 10 Target Airlines by Fleet Size
          </div>
          <div className="space-y-2">
            {topAirlines.map(([airline, counts], i) => {
              const pct = (counts.total / totalFleet) * 100;
              return (
                <div key={airline} className="flex items-center gap-3">
                  <div className="w-6 text-right font-mono text-[10px] text-[#555]">{i + 1}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-[#ccc]">{airline}</span>
                      <span className="font-mono text-xs text-[#888]">
                        {counts.total} aircraft
                        {counts.ng > 0 && <span className="text-[#3b82f6] ml-2">NG:{counts.ng}</span>}
                        {counts.max > 0 && <span className="text-[#f97316] ml-2">MAX:{counts.max}</span>}
                      </span>
                    </div>
                    <div className="h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
                      <div className="h-full rounded-full flex">
                        {counts.ng > 0 && (
                          <div
                            className="bg-[#3b82f6] h-full"
                            style={{ width: `${(counts.ng / totalFleet) * 100 * (100 / pct)}%` }}
                          />
                        )}
                        {counts.max > 0 && (
                          <div
                            className="bg-[#f97316] h-full"
                            style={{ width: `${(counts.max / totalFleet) * 100 * (100 / pct)}%` }}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="w-12 text-right font-mono text-[10px] text-[#666]">{pct.toFixed(1)}%</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Underserved markets */}
      <div className="border-t border-[#222222]">
        <div className="max-w-5xl mx-auto px-6 md:px-12 py-8">
          <div className="text-[10px] uppercase tracking-[0.2em] text-[#888] font-semibold mb-2">
            Underserved Markets — No Local Simulator
          </div>
          <div className="text-[11px] text-[#666] mb-4">
            These {underserved.length} countries operate{' '}
            <span className="text-[#e5e5e5] font-semibold">{underservedFleet.toLocaleString()}</span> Boeing 737s
            but have no local Level D simulator. Airlines must ferry pilots to training centers in France, Netherlands,
            Turkey, or the UK — adding cost, downtime, and scheduling friction.
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {underserved.map(([country, data]) => (
              <div
                key={country}
                className="bg-[#111] border border-[#f97316]/30 rounded-lg p-3 flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-semibold text-[#ccc]">{country}</div>
                  <div className="text-[10px] text-[#888] mt-0.5">
                    {data.ng > 0 && <span className="text-[#3b82f6]">NG:{data.ng} </span>}
                    {data.max > 0 && <span className="text-[#f97316]">MAX:{data.max}</span>}
                  </div>
                </div>
                <div className="font-mono text-lg font-bold text-[#f97316]">{data.total}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Competitive landscape summary */}
      <div className="border-t border-[#222222] bg-[#111111]">
        <div className="max-w-5xl mx-auto px-6 md:px-12 py-8">
          <div className="text-[10px] uppercase tracking-[0.2em] text-[#888] font-semibold mb-4">
            Competitive Landscape
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="text-xs font-semibold text-[#ccc] mb-3">Existing Operators</div>
              <div className="space-y-1.5">
                {simSummary.topOperators.map(({ operator, simulators }) => (
                  <div key={operator} className="flex items-center justify-between text-xs bg-[#0a0a0a] rounded px-3 py-2">
                    <span className="text-[#aaa]">{operator}</span>
                    <span className="font-mono text-[#22c55e] font-semibold">{simulators} sim{simulators > 1 ? 's' : ''}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold text-[#ccc] mb-3">Key Observations</div>
              <div className="space-y-3 text-[11px] text-[#888] leading-relaxed">
                <div className="flex gap-2">
                  <span className="text-[#22c55e] font-bold shrink-0">1.</span>
                  <span>
                    <strong className="text-[#ccc]">NG dominance:</strong> {simSummary.ngOnly} of {simSummary.totalSimulators} simulators
                    are NG-only. As MAX deliveries accelerate (Aeroitalia, Ryanair, Turkish), MAX training demand
                    will outpace current MAX-capable capacity ({simSummary.maxCapable} sims).
                  </span>
                </div>
                <div className="flex gap-2">
                  <span className="text-[#22c55e] font-bold shrink-0">2.</span>
                  <span>
                    <strong className="text-[#ccc]">Geographic concentration:</strong> Training capacity clusters in
                    Western/Northern Europe (France, Netherlands, UK) and Turkey. Southern and Eastern Mediterranean
                    markets (Italy, Egypt, Poland, Romania) are underserved despite large fleets.
                  </span>
                </div>
                <div className="flex gap-2">
                  <span className="text-[#22c55e] font-bold shrink-0">3.</span>
                  <span>
                    <strong className="text-[#ccc]">CAE dominance:</strong> CAE controls the majority of European
                    737 simulator capacity. A new entrant with strategic positioning (e.g., Southern Europe / Mediterranean)
                    could capture traffic from airlines currently sending pilots North.
                  </span>
                </div>
                <div className="flex gap-2">
                  <span className="text-[#22c55e] font-bold shrink-0">4.</span>
                  <span>
                    <strong className="text-[#ccc]">Recurrent training cycle:</strong> Every 737 pilot requires
                    Level D simulator time every 6-12 months. With ~{(totalFleet * 2.5).toLocaleString()} active pilots
                    (est. 2.5 pilots/aircraft), this creates a recurring demand floor independent of new deliveries.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom line */}
      <div className="border-t border-[#222222]">
        <div className="max-w-5xl mx-auto px-6 md:px-12 py-10">
          <div className="bg-gradient-to-r from-[#22c55e]/10 to-[#3b82f6]/10 border border-[#22c55e]/30 rounded-xl p-6 md:p-8">
            <div className="text-[10px] uppercase tracking-[0.2em] text-[#22c55e] font-semibold mb-3">
              Bottom Line
            </div>
            <div className="text-sm md:text-base text-[#ccc] leading-relaxed max-w-3xl">
              A single Level D simulator facility positioned in an underserved Mediterranean market
              (Italy, Greece/Cyprus corridor, or Egypt) could capture{' '}
              <span className="font-semibold text-[#e5e5e5]">{targetCapture}+ aircraft</span> worth
              of recurring training contracts. The {aircraftPerSim}:1 aircraft-to-simulator ratio,
              combined with accelerating MAX deliveries creating type-specific training demand,
              presents a clear structural opportunity for a new entrant.
            </div>
            <div className="mt-4 flex items-center gap-4 text-[10px] text-[#666]">
              <span>Data: OpenSky Network Aircraft Database</span>
              <span>|</span>
              <span>Simulators: CAE, HAVELSAN, BAA Training, public sources</span>
              <span>|</span>
              <span>Updated: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function OpportunityMap({
  fleetByCountry,
  simByCountry,
  token,
}: {
  fleetByCountry: Record<string, { ng: number; max: number; total: number }>;
  simByCountry: Record<string, { facilities: number; simulators: number }>;
  token: string;
}) {
  return (
    <MapGL
      initialViewState={{ latitude: 42, longitude: 15, zoom: 3.2 }}
      style={{ width: '100%', height: '100%' }}
      mapStyle="mapbox://styles/mapbox/dark-v11"
      mapboxAccessToken={token}
      attributionControl={false}
    >
      <NavigationControl position="top-right" showCompass={false} />

      {/* Fleet circles */}
      {Object.entries(fleetByCountry).map(([country, data]) => {
        const coords = COORDS[country];
        if (!coords) return null;
        const hasSim = !!simByCountry[country];
        const maxFleet = Math.max(...Object.values(fleetByCountry).map(d => d.total));
        const scale = Math.sqrt(data.total / maxFleet);
        const size = Math.max(18, Math.round(scale * 60));
        const color = hasSim ? '#22c55e' : '#f97316';

        return (
          <Marker key={`fleet-${country}`} latitude={coords.lat} longitude={coords.lng} anchor="center">
            <div className="group relative">
              <div
                className="rounded-full flex items-center justify-center transition-transform hover:scale-110"
                style={{
                  width: size,
                  height: size,
                  backgroundColor: `${color}20`,
                  border: `2px solid ${color}`,
                  opacity: 0.8,
                }}
              >
                <span className="font-mono font-bold text-white" style={{ fontSize: Math.max(9, size / 4) }}>
                  {data.total}
                </span>
              </div>
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50 pointer-events-none">
                <div className="bg-[#1a1a1a] border border-[#333] rounded-lg shadow-xl p-2.5 min-w-[140px] whitespace-nowrap">
                  <div className="font-semibold text-xs text-[#e5e5e5]">{country}</div>
                  <div className="text-[10px] text-[#aaa] mt-1">
                    {data.total} aircraft • {hasSim ? `${simByCountry[country].simulators} sim(s)` : 'No local simulator'}
                  </div>
                </div>
              </div>
            </div>
          </Marker>
        );
      })}

      {/* Simulator squares */}
      {SIMULATOR_FACILITIES.map((f) => (
        <Marker key={`sim-${f.id}`} latitude={f.lat} longitude={f.lng} anchor="center">
          <div
            className="rounded-sm border border-[#22c55e]"
            style={{
              width: 8 + f.simulatorCount * 4,
              height: 8 + f.simulatorCount * 4,
              backgroundColor: '#22c55e30',
              boxShadow: '0 0 8px #22c55e40',
            }}
          />
        </Marker>
      ))}
    </MapGL>
  );
}
