'use client';

import { useMemo } from 'react';
import MapGL, { Marker, NavigationControl } from 'react-map-gl/mapbox';
import type { InventoryAircraft } from '@/lib/aircraft-db';

/** Country name → approximate centroid lat/lon for map plotting */
const COUNTRY_COORDS: Record<string, { lat: number; lng: number }> = {
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

interface CountryCluster {
  country: string;
  lat: number;
  lng: number;
  total: number;
  ng: number;
  max: number;
  airlines: string[];
}

interface InventoryMapProps {
  fleet: InventoryAircraft[];
  token: string;
  search: string;
}

export default function InventoryMap({ fleet, token, search }: InventoryMapProps) {
  const clusters = useMemo(() => {
    const map = new Map<string, CountryCluster>();
    for (const ac of fleet) {
      const coords = COUNTRY_COORDS[ac.country];
      if (!coords) continue;
      let cluster = map.get(ac.country);
      if (!cluster) {
        cluster = {
          country: ac.country,
          lat: coords.lat,
          lng: coords.lng,
          total: 0,
          ng: 0,
          max: 0,
          airlines: [],
        };
        map.set(ac.country, cluster);
      }
      cluster.total++;
      if (ac.family === 'NG') cluster.ng++;
      else cluster.max++;
      if (!cluster.airlines.includes(ac.airline)) {
        cluster.airlines.push(ac.airline);
      }
    }
    // Sort airlines by implied fleet size (most common first)
    for (const c of map.values()) {
      c.airlines.sort();
    }
    return Array.from(map.values()).sort((a, b) => b.total - a.total);
  }, [fleet]);

  const maxFleet = clusters.length > 0 ? clusters[0].total : 1;

  return (
    <div className="w-full h-full relative">
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

        {clusters.map((cluster) => {
          // Scale bubble size: min 28px, max 80px
          const scale = Math.sqrt(cluster.total / maxFleet);
          const size = Math.max(28, Math.round(scale * 80));
          const ngPct = (cluster.ng / cluster.total) * 100;

          return (
            <Marker
              key={cluster.country}
              latitude={cluster.lat}
              longitude={cluster.lng}
              anchor="center"
            >
              <div className="group relative cursor-pointer">
                {/* Bubble marker with NG/MAX pie proportions */}
                <div
                  className="rounded-full flex items-center justify-center border border-[#ffffff20] shadow-lg shadow-black/40 transition-transform hover:scale-110"
                  style={{
                    width: size,
                    height: size,
                    background: `conic-gradient(
                      #3b82f6 0% ${ngPct}%,
                      #f97316 ${ngPct}% 100%
                    )`,
                    opacity: 0.85,
                  }}
                >
                  {/* Inner circle with count */}
                  <div
                    className="rounded-full bg-[#111]/90 flex items-center justify-center"
                    style={{
                      width: size - 8,
                      height: size - 8,
                    }}
                  >
                    <span className="font-mono font-bold text-white" style={{ fontSize: Math.max(10, size / 4) }}>
                      {cluster.total}
                    </span>
                  </div>
                </div>

                {/* Country label below marker */}
                <div className="absolute left-1/2 -translate-x-1/2 mt-1 whitespace-nowrap text-center pointer-events-none">
                  <span className="text-[10px] font-semibold text-[#ccc] bg-[#111]/80 px-1.5 py-0.5 rounded">
                    {cluster.country}
                  </span>
                </div>

                {/* Hover tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50 pointer-events-none">
                  <div className="bg-[#1a1a1a] border border-[#333] rounded-lg shadow-xl p-3 min-w-[180px] max-w-[240px]">
                    <div className="font-semibold text-sm text-[#e5e5e5] mb-1.5">{cluster.country}</div>
                    <div className="grid grid-cols-3 gap-2 text-xs mb-2">
                      <div>
                        <div className="text-[#888]">Total</div>
                        <div className="font-mono font-semibold">{cluster.total}</div>
                      </div>
                      <div>
                        <div className="text-[#3b82f6]">NG</div>
                        <div className="font-mono font-semibold text-[#3b82f6]">{cluster.ng}</div>
                      </div>
                      <div>
                        <div className="text-[#f97316]">MAX</div>
                        <div className="font-mono font-semibold text-[#f97316]">{cluster.max}</div>
                      </div>
                    </div>
                    <div className="text-[10px] text-[#888] border-t border-[#333] pt-1.5">
                      <div className="font-semibold text-[#aaa] mb-0.5">
                        {cluster.airlines.length} airline{cluster.airlines.length !== 1 ? 's' : ''}
                      </div>
                      <div className="text-[#777] leading-relaxed">
                        {cluster.airlines.slice(0, 6).join(', ')}
                        {cluster.airlines.length > 6 && ` +${cluster.airlines.length - 6} more`}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Marker>
          );
        })}
      </MapGL>

      {/* Legend overlay */}
      <div className="absolute bottom-3 left-3 bg-[#111]/90 border border-[#333] rounded-lg p-2.5 text-[10px] backdrop-blur-sm">
        <div className="text-[#888] font-semibold mb-1.5 uppercase tracking-wider">Fleet Distribution</div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#3b82f6] inline-block" />
            <span className="text-[#aaa]">737 NG</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#f97316] inline-block" />
            <span className="text-[#aaa]">737 MAX</span>
          </div>
        </div>
        <div className="text-[#666] mt-1">Bubble size = fleet count</div>
        {search && <div className="text-[#888] mt-0.5">Filtered view</div>}
      </div>
    </div>
  );
}
