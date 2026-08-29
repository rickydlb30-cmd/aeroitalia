'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Plane,
  ChevronLeft,
  ChevronRight,
  Search,
  Radio,
  AlertTriangle,
  Menu,
  X,
} from 'lucide-react';
import 'mapbox-gl/dist/mapbox-gl.css';
import {
  airlineFleet,
  classifyType,
  type Aircraft,
  type FleetClass,
} from '@/lib/fleet-data';

// Lazy-load map components so the page still renders without mapbox
import dynamic from 'next/dynamic';

const MapView = dynamic(() => import('./map-view'), { ssr: false });

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

interface FlightResponse {
  source: string;
  flights: Aircraft[];
  refreshedAt: string;
  rateLimited: boolean;
}

export default function Dashboard() {
  const [aircraft, setAircraft] = useState<Aircraft[]>([]);
  const [selected, setSelected] = useState<Aircraft | null>(null);
  const [filterType, setFilterType] = useState<'all' | FleetClass>('all');
  const [filterAirline, setFilterAirline] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<string>('--');
  const [source, setSource] = useState<string>('--');
  const [flyTo, setFlyTo] = useState<{ lat: number; lng: number } | null>(null);

  const fetchFlights = useCallback(async () => {
    try {
      const res = await fetch('/api/flights');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: FlightResponse = await res.json();
      setAircraft(data.flights);
      setSource(data.source);
      setLastRefresh(
        new Date(data.refreshedAt).toLocaleTimeString('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
      setError(data.rateLimited ? 'Using fallback data' : null);
      setLoading(false);
    } catch {
      setError('Fetch failed -- retaining last data');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFlights();
    const interval = setInterval(fetchFlights, 10000);
    return () => clearInterval(interval);
  }, [fetchFlights]);

  const filtered = useMemo(() => {
    return aircraft.filter((a) => {
      if (filterType !== 'all' && a.family !== filterType) return false;
      if (filterAirline !== 'all' && a.airline !== filterAirline) return false;
      if (
        searchQuery &&
        !a.callsign.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !a.registration.toLowerCase().includes(searchQuery.toLowerCase())
      )
        return false;
      return true;
    });
  }, [aircraft, filterType, filterAirline, searchQuery]);

  const airborne = aircraft.filter((a) => !a.on_ground);
  const ngCount = airborne.filter((a) => a.family === 'NG').length;
  const maxCount = airborne.filter((a) => a.family === 'MAX').length;
  const airlinesWithFlights = new Set(airborne.map((a) => a.airline)).size;

  const uniqueAirlines = useMemo(() => {
    const set = new Set(aircraft.map((a) => a.airline));
    return Array.from(set).sort();
  }, [aircraft]);

  const airlineCounts = useMemo(() => {
    const counts: Record<string, { ng: number; max: number }> = {};
    for (const a of aircraft) {
      if (!counts[a.airline]) counts[a.airline] = { ng: 0, max: 0 };
      if (a.family === 'NG') counts[a.airline].ng++;
      else counts[a.airline].max++;
    }
    return Object.entries(counts).sort(
      (a, b) => b[1].ng + b[1].max - (a[1].ng + a[1].max)
    );
  }, [aircraft]);

  function handleSelectAircraft(ac: Aircraft) {
    setSelected(ac);
    setFlyTo({ lat: ac.latitude, lng: ac.longitude });
    setMobileSidebarOpen(false);
  }

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Filters */}
      <div className="p-3 border-b border-[#222222] space-y-2">
        <div className="flex gap-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as 'all' | FleetClass)}
            className="flex-1 bg-[#0a0a0a] border border-[#222222] text-[#e5e5e5] text-xs px-2 py-1.5 rounded focus:outline-none focus:border-[#444]"
          >
            <option value="all">All Types</option>
            <option value="NG">737 NG</option>
            <option value="MAX">737 MAX</option>
          </select>
          <select
            value={filterAirline}
            onChange={(e) => setFilterAirline(e.target.value)}
            className="flex-1 bg-[#0a0a0a] border border-[#222222] text-[#e5e5e5] text-xs px-2 py-1.5 rounded focus:outline-none focus:border-[#444]"
          >
            <option value="all">All Airlines</option>
            {uniqueAirlines.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#888]" />
          <input
            type="text"
            placeholder="Search callsign or reg..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0a0a0a] border border-[#222222] text-[#e5e5e5] text-xs pl-7 pr-2 py-1.5 rounded placeholder:text-[#555] focus:outline-none focus:border-[#444]"
          />
        </div>
      </div>

      {/* Fleet summary */}
      <div className="p-3 border-b border-[#222222]">
        <div className="text-[10px] uppercase tracking-wider text-[#888] mb-1.5">
          Fleet Summary
        </div>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div>
            <div className="font-mono text-lg font-semibold">{aircraft.length}</div>
            <div className="text-[#888]">Total</div>
          </div>
          <div>
            <div className="font-mono text-lg font-semibold text-[#3b82f6]">
              {aircraft.filter((a) => a.family === 'NG').length}
            </div>
            <div className="text-[#888]">NG</div>
          </div>
          <div>
            <div className="font-mono text-lg font-semibold text-[#f97316]">
              {aircraft.filter((a) => a.family === 'MAX').length}
            </div>
            <div className="text-[#888]">MAX</div>
          </div>
        </div>
      </div>

      {/* Airline breakdown */}
      <div className="p-3 border-b border-[#222222]">
        <div className="text-[10px] uppercase tracking-wider text-[#888] mb-1.5">
          By Airline
        </div>
        <div className="space-y-1">
          {airlineCounts.map(([airline, counts]) => (
            <div
              key={airline}
              className="flex items-center justify-between text-xs cursor-pointer hover:bg-[#1a1a1a] px-1.5 py-1 rounded"
              onClick={() =>
                setFilterAirline(filterAirline === airline ? 'all' : airline)
              }
            >
              <span
                className={
                  filterAirline === airline ? 'text-[#e5e5e5]' : 'text-[#aaa]'
                }
              >
                {airline}
              </span>
              <span className="font-mono text-[#888]">
                {counts.ng > 0 && (
                  <span className="text-[#3b82f6]">{counts.ng}</span>
                )}
                {counts.ng > 0 && counts.max > 0 && (
                  <span className="text-[#444]">/</span>
                )}
                {counts.max > 0 && (
                  <span className="text-[#f97316]">{counts.max}</span>
                )}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Aircraft list */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-3">
          <div className="text-[10px] uppercase tracking-wider text-[#888] mb-1.5">
            Aircraft ({filtered.length})
          </div>
          <div className="space-y-0.5">
            {filtered.map((ac) => (
              <button
                key={ac.icao24}
                onClick={() => handleSelectAircraft(ac)}
                className={`w-full text-left px-2 py-1.5 rounded text-xs border-l-2 transition-colors ${
                  selected?.icao24 === ac.icao24
                    ? 'bg-[#1a1a1a]'
                    : 'hover:bg-[#1a1a1a]'
                } ${
                  ac.family === 'NG'
                    ? 'border-l-[#3b82f6]'
                    : 'border-l-[#f97316]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-semibold">
                    {ac.callsign}
                  </span>
                  <span className="font-mono text-[#888] text-[11px]">
                    {ac.on_ground ? 'GND' : `FL${Math.round(ac.altitude / 100)}`}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[#888] text-[11px]">
                  <span>
                    {ac.airline} -- {ac.type}
                  </span>
                  <span className="font-mono">{ac.registration}</span>
                </div>
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="text-[#555] text-xs py-4 text-center">
                No aircraft match filters
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden">
      {/* Top stats bar */}
      <div className="h-12 bg-[#111111] border-b border-[#222222] flex items-center px-3 gap-4 shrink-0 z-20">
        {/* Mobile menu toggle */}
        <button
          className="lg:hidden text-[#888] hover:text-[#e5e5e5]"
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        >
          {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Desktop sidebar toggle */}
        <button
          className="hidden lg:flex text-[#888] hover:text-[#e5e5e5]"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? (
            <ChevronLeft className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>

        <div className="flex items-center gap-1.5">
          <Plane className="w-4 h-4 text-[#888]" />
          <span className="text-sm font-semibold hidden sm:inline">737 EU Tracker</span>
        </div>

        <div className="h-5 w-px bg-[#222]" />

        <div className="flex items-center gap-3 text-xs">
          <div className="font-mono">
            <span className="text-[#888]">Airborne </span>
            <span className="font-semibold">{airborne.length}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#3b82f6] inline-block" />
            <span className="font-mono">
              <span className="text-[#888]">NG </span>
              <span className="font-semibold">{ngCount}</span>
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#f97316] inline-block" />
            <span className="font-mono">
              <span className="text-[#888]">MAX </span>
              <span className="font-semibold">{maxCount}</span>
            </span>
          </div>
          <div className="font-mono hidden md:block">
            <span className="text-[#888]">Airlines </span>
            <span className="font-semibold">{airlinesWithFlights}</span>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-3 text-xs">
          {error && (
            <div className="flex items-center gap-1 text-[#b8860b]">
              <AlertTriangle className="w-3 h-3" />
              <span className="hidden sm:inline">{error}</span>
            </div>
          )}
          <div className="flex items-center gap-1 font-mono text-[#888]">
            <Radio className="w-3 h-3" />
            <span className="hidden sm:inline">{source}</span>
          </div>
          <div className="font-mono text-[#888]">{lastRefresh}</div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Desktop sidebar */}
        {sidebarOpen && (
          <div className="hidden lg:flex w-80 bg-[#111111] border-r border-[#222222] flex-col overflow-hidden shrink-0">
            {sidebarContent}
          </div>
        )}

        {/* Mobile sidebar overlay */}
        {mobileSidebarOpen && (
          <>
            <div
              className="lg:hidden fixed inset-0 bg-black/60 z-30"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <div className="lg:hidden fixed left-0 top-12 bottom-0 w-80 max-w-[85vw] bg-[#111111] border-r border-[#222222] z-40 flex flex-col overflow-hidden">
              {sidebarContent}
            </div>
          </>
        )}

        {/* Map area */}
        <div className="flex-1 relative">
          {loading && aircraft.length === 0 ? (
            <div className="flex items-center justify-center h-full text-[#888] text-sm">
              Loading flight data...
            </div>
          ) : MAPBOX_TOKEN ? (
            <MapView
              aircraft={filtered}
              selected={selected}
              onSelect={(ac) => {
                setSelected(ac);
              }}
              flyTo={flyTo}
              onFlyToComplete={() => setFlyTo(null)}
              token={MAPBOX_TOKEN}
            />
          ) : (
            <NoMapFallback aircraft={filtered} onSelect={handleSelectAircraft} />
          )}
        </div>
      </div>
    </div>
  );
}

function NoMapFallback({
  aircraft,
  onSelect,
}: {
  aircraft: Aircraft[];
  onSelect: (ac: Aircraft) => void;
}) {
  return (
    <div className="h-full flex flex-col bg-[#0a0a0a]">
      <div className="p-4 border-b border-[#222222]">
        <div className="text-sm text-[#888] mb-1">
          Configure <code className="text-[#aaa] bg-[#1a1a1a] px-1.5 py-0.5 rounded text-xs">NEXT_PUBLIC_MAPBOX_TOKEN</code> for map display
        </div>
        <div className="text-xs text-[#555]">
          Showing tabular fallback -- {aircraft.length} aircraft
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-[#888] text-left border-b border-[#222]">
              <th className="px-3 py-2 font-medium">Callsign</th>
              <th className="px-3 py-2 font-medium">Airline</th>
              <th className="px-3 py-2 font-medium">Type</th>
              <th className="px-3 py-2 font-medium">Reg</th>
              <th className="px-3 py-2 font-medium text-right">Alt (ft)</th>
              <th className="px-3 py-2 font-medium text-right">Spd (kts)</th>
              <th className="px-3 py-2 font-medium text-right">Hdg</th>
              <th className="px-3 py-2 font-medium text-right">Lat</th>
              <th className="px-3 py-2 font-medium text-right">Lon</th>
            </tr>
          </thead>
          <tbody>
            {aircraft.map((ac) => (
              <tr
                key={ac.icao24}
                onClick={() => onSelect(ac)}
                className="border-b border-[#1a1a1a] hover:bg-[#111] cursor-pointer"
              >
                <td className="px-3 py-2 font-mono font-semibold">{ac.callsign}</td>
                <td className="px-3 py-2">{ac.airline}</td>
                <td className="px-3 py-2">
                  <span
                    className={
                      ac.family === 'NG' ? 'text-[#3b82f6]' : 'text-[#f97316]'
                    }
                  >
                    {ac.type}
                  </span>
                </td>
                <td className="px-3 py-2 font-mono">{ac.registration}</td>
                <td className="px-3 py-2 font-mono text-right">
                  {ac.on_ground ? 'GND' : ac.altitude.toLocaleString()}
                </td>
                <td className="px-3 py-2 font-mono text-right">{ac.velocity}</td>
                <td className="px-3 py-2 font-mono text-right">{ac.heading.toFixed(0)}</td>
                <td className="px-3 py-2 font-mono text-right">{ac.latitude.toFixed(3)}</td>
                <td className="px-3 py-2 font-mono text-right">{ac.longitude.toFixed(3)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
