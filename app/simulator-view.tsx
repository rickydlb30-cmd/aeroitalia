'use client';

import { useMemo } from 'react';
import MapGL, { Marker, NavigationControl } from 'react-map-gl/mapbox';
import {
  SIMULATOR_FACILITIES,
  getSimulatorSummary,
  type SimulatorFacility,
} from '@/lib/simulator-data';

interface SimulatorViewProps {
  token: string;
  fleetByCountry: Record<string, { ng: number; max: number; total: number }>;
}

export default function SimulatorView({ token, fleetByCountry }: SimulatorViewProps) {
  const summary = useMemo(() => getSimulatorSummary(), []);

  const totalFleet = Object.values(fleetByCountry).reduce((s, c) => s + c.total, 0);
  const targetCapture = Math.round(totalFleet * 0.015);
  const aircraftPerSim = totalFleet > 0 ? Math.round(totalFleet / summary.totalSimulators) : 0;

  return (
    <div className="flex-1 overflow-auto bg-[#0a0a0a]">
      {/* Header */}
      <div className="p-4 border-b border-[#222222]">
        <div className="text-sm font-semibold text-[#e5e5e5] mb-1">
          Level D Flight Simulator — Competitive Landscape
        </div>
        <div className="text-xs text-[#888]">
          Boeing 737 NG/MAX full-flight simulators across EU, North Africa &amp; Turkey
        </div>
      </div>

      {/* KPI cards */}
      <div className="p-4 border-b border-[#222222]">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          <div className="bg-[#111111] border border-[#222222] rounded-lg p-3">
            <div className="text-[10px] uppercase tracking-wider text-[#888] mb-1">Facilities</div>
            <div className="font-mono text-2xl font-semibold">{summary.totalFacilities}</div>
          </div>
          <div className="bg-[#111111] border border-[#222222] rounded-lg p-3">
            <div className="text-[10px] uppercase tracking-wider text-[#888] mb-1">Simulators</div>
            <div className="font-mono text-2xl font-semibold text-[#22c55e]">{summary.totalSimulators}</div>
          </div>
          <div className="bg-[#111111] border border-[#222222] rounded-lg p-3">
            <div className="text-[10px] uppercase tracking-wider text-[#888] mb-1">Countries</div>
            <div className="font-mono text-2xl font-semibold">{Object.keys(summary.byCountry).length}</div>
          </div>
          <div className="bg-[#111111] border border-[#222222] rounded-lg p-3">
            <div className="text-[10px] uppercase tracking-wider text-[#888] mb-1">NG-Only Sims</div>
            <div className="font-mono text-2xl font-semibold text-[#3b82f6]">{summary.ngOnly}</div>
          </div>
          <div className="bg-[#111111] border border-[#222222] rounded-lg p-3">
            <div className="text-[10px] uppercase tracking-wider text-[#888] mb-1">MAX-Capable</div>
            <div className="font-mono text-2xl font-semibold text-[#f97316]">{summary.maxCapable}</div>
          </div>
          <div className="bg-[#111111] border border-[#222222] rounded-lg p-3">
            <div className="text-[10px] uppercase tracking-wider text-[#888] mb-1">AC / Sim Ratio</div>
            <div className="font-mono text-2xl font-semibold">{aircraftPerSim}:1</div>
          </div>
        </div>
      </div>

      {/* Market opportunity callout */}
      <div className="px-4 pt-4">
        <div className="bg-[#22c55e]/10 border border-[#22c55e]/30 rounded-lg p-3">
          <div className="text-xs font-semibold text-[#22c55e] mb-1">Market Opportunity</div>
          <div className="text-xs text-[#aaa] leading-relaxed">
            With <span className="font-mono font-semibold text-[#e5e5e5]">{totalFleet.toLocaleString()}</span> Boeing 737s
            in the region served by only <span className="font-mono font-semibold text-[#e5e5e5]">{summary.totalSimulators}</span> Level D
            simulators ({aircraftPerSim} aircraft per simulator), the target capture of{' '}
            <span className="font-mono font-semibold text-[#e5e5e5]">~{targetCapture}</span> aircraft (1.5% fleet share)
            would place a new entrant among the top training providers. Key gaps: Southern/Eastern Mediterranean,
            Italy, and dedicated MAX capacity.
          </div>
        </div>
      </div>

      {/* Simulator map */}
      {token && (
        <div className="p-4 border-b border-[#222222]">
          <div className="text-[10px] uppercase tracking-wider text-[#888] mb-2">Simulator Locations</div>
          <div className="h-[400px] rounded-lg overflow-hidden border border-[#222]">
            <SimulatorMap facilities={SIMULATOR_FACILITIES} token={token} />
          </div>
        </div>
      )}

      {/* Facility table */}
      <div className="border-b border-[#222222]">
        <div className="px-4 pt-4 pb-2">
          <div className="text-[10px] uppercase tracking-wider text-[#888]">All Facilities</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-[#888] text-left border-b border-[#222]">
                <th className="px-4 py-2.5 font-medium">Operator</th>
                <th className="px-4 py-2.5 font-medium">Location</th>
                <th className="px-4 py-2.5 font-medium">Country</th>
                <th className="px-4 py-2.5 font-medium">Type</th>
                <th className="px-4 py-2.5 font-medium text-center">Sims</th>
                <th className="px-4 py-2.5 font-medium">Certification</th>
                <th className="px-4 py-2.5 font-medium">Notes</th>
              </tr>
            </thead>
            <tbody>
              {SIMULATOR_FACILITIES.map((f) => (
                <tr key={f.id} className="border-b border-[#1a1a1a] hover:bg-[#111]">
                  <td className="px-4 py-2.5 font-semibold text-[#e5e5e5]">{f.operator}</td>
                  <td className="px-4 py-2.5 text-[#ccc]">{f.location}</td>
                  <td className="px-4 py-2.5 text-[#aaa]">{f.country}</td>
                  <td className="px-4 py-2.5">
                    <span
                      className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                        f.aircraftType === '737 NG'
                          ? 'bg-[#3b82f6]/15 text-[#3b82f6]'
                          : f.aircraftType === '737 MAX'
                            ? 'bg-[#f97316]/15 text-[#f97316]'
                            : 'bg-[#22c55e]/15 text-[#22c55e]'
                      }`}
                    >
                      {f.aircraftType}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-center font-mono font-semibold">{f.simulatorCount}</td>
                  <td className="px-4 py-2.5 text-[#aaa]">
                    <span className={`${f.certification === 'EASA Level D' ? 'text-[#22c55e]' : 'text-[#888]'}`}>
                      {f.certification}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-[#666] max-w-[200px] truncate">{f.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
        {/* By Country */}
        <div className="p-4 border-b lg:border-b-0 lg:border-r border-[#222222]">
          <div className="text-[10px] uppercase tracking-wider text-[#888] mb-3">Simulators by Country</div>
          <div className="space-y-1">
            {Object.entries(summary.byCountry)
              .sort((a, b) => b[1].simulators - a[1].simulators)
              .map(([country, data]) => {
                const fleet = fleetByCountry[country];
                return (
                  <div key={country} className="flex items-center justify-between text-xs px-2 py-1.5 rounded hover:bg-[#111]">
                    <span className="text-[#ccc]">{country}</span>
                    <span className="font-mono shrink-0 flex items-center gap-3">
                      <span className="text-[#22c55e]">{data.simulators} sim{data.simulators !== 1 ? 's' : ''}</span>
                      <span className="text-[#888]">{data.facilities} loc</span>
                      {fleet && (
                        <span className="text-[#555]">{fleet.total} ac</span>
                      )}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>

        {/* By Operator */}
        <div className="p-4">
          <div className="text-[10px] uppercase tracking-wider text-[#888] mb-3">By Operator</div>
          <div className="space-y-1">
            {summary.topOperators.map(({ operator, simulators }) => (
              <div key={operator} className="flex items-center justify-between text-xs px-2 py-1.5 rounded hover:bg-[#111]">
                <span className="text-[#ccc] truncate mr-2">{operator}</span>
                <span className="font-mono shrink-0 text-[#22c55e]">
                  {simulators} sim{simulators !== 1 ? 's' : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Gap analysis */}
      <div className="p-4 border-t border-[#222222]">
        <div className="text-[10px] uppercase tracking-wider text-[#888] mb-3">Coverage Gap Analysis</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.entries(fleetByCountry)
            .filter(([country]) => !summary.byCountry[country])
            .sort((a, b) => b[1].total - a[1].total)
            .slice(0, 12)
            .map(([country, fleet]) => (
              <div key={country} className="bg-[#111] border border-[#222] rounded-lg p-2.5 flex items-center justify-between">
                <div>
                  <div className="text-xs text-[#ccc]">{country}</div>
                  <div className="text-[10px] text-[#888]">No local simulator</div>
                </div>
                <div className="font-mono text-sm font-semibold text-[#f97316]">{fleet.total} ac</div>
              </div>
            ))}
        </div>
        <div className="text-[10px] text-[#555] mt-2">
          Countries with 737 fleet but no local Level D simulator — potential underserved markets
        </div>
      </div>
    </div>
  );
}

function SimulatorMap({ facilities, token }: { facilities: SimulatorFacility[]; token: string }) {
  return (
    <MapGL
      initialViewState={{
        latitude: 42,
        longitude: 15,
        zoom: 3.2,
      }}
      style={{ width: '100%', height: '100%' }}
      mapStyle="mapbox://styles/mapbox/dark-v11"
      mapboxAccessToken={token}
      attributionControl={false}
    >
      <NavigationControl position="top-right" showCompass={false} />

      {facilities.map((f) => {
        const color =
          f.aircraftType === '737 NG'
            ? '#3b82f6'
            : f.aircraftType === '737 MAX'
              ? '#f97316'
              : '#22c55e';
        const size = 16 + f.simulatorCount * 8;

        return (
          <Marker key={f.id} latitude={f.lat} longitude={f.lng} anchor="center">
            <div className="group relative cursor-pointer">
              {/* Marker */}
              <div
                className="rounded-sm flex items-center justify-center border transition-transform hover:scale-125"
                style={{
                  width: size,
                  height: size,
                  backgroundColor: `${color}30`,
                  borderColor: color,
                  boxShadow: `0 0 12px ${color}40`,
                }}
              >
                <span className="font-mono font-bold text-white" style={{ fontSize: Math.max(9, size / 3) }}>
                  {f.simulatorCount}
                </span>
              </div>

              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50 pointer-events-none">
                <div className="bg-[#1a1a1a] border border-[#333] rounded-lg shadow-xl p-2.5 min-w-[180px] whitespace-nowrap">
                  <div className="font-semibold text-xs text-[#e5e5e5]">{f.operator}</div>
                  <div className="text-[10px] text-[#aaa] mt-0.5">{f.location}, {f.country}</div>
                  <div className="flex items-center gap-2 mt-1.5 text-[10px]">
                    <span
                      className={`px-1.5 py-0.5 rounded font-semibold ${
                        f.aircraftType === '737 NG'
                          ? 'bg-[#3b82f6]/15 text-[#3b82f6]'
                          : f.aircraftType === '737 MAX'
                            ? 'bg-[#f97316]/15 text-[#f97316]'
                            : 'bg-[#22c55e]/15 text-[#22c55e]'
                      }`}
                    >
                      {f.aircraftType}
                    </span>
                    <span className="text-[#888]">{f.simulatorCount} sim{f.simulatorCount !== 1 ? 's' : ''}</span>
                    <span className="text-[#22c55e]">{f.certification}</span>
                  </div>
                  {f.notes && <div className="text-[10px] text-[#666] mt-1">{f.notes}</div>}
                </div>
              </div>
            </div>
          </Marker>
        );
      })}

      {/* Legend */}
      <div className="absolute bottom-3 left-3 bg-[#111]/90 border border-[#333] rounded-lg p-2.5 text-[10px] backdrop-blur-sm">
        <div className="text-[#888] font-semibold mb-1.5 uppercase tracking-wider">Simulator Types</div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#3b82f6] inline-block" />
            <span className="text-[#aaa]">737 NG</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#f97316] inline-block" />
            <span className="text-[#aaa]">737 MAX</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#22c55e] inline-block" />
            <span className="text-[#aaa]">Both</span>
          </div>
        </div>
        <div className="text-[#666] mt-1">Square size = simulator count</div>
      </div>
    </MapGL>
  );
}
