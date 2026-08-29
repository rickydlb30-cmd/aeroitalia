'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import MapGL, { Marker, Popup, NavigationControl } from 'react-map-gl/mapbox';
import type { Aircraft } from '@/lib/fleet-data';

interface MapViewProps {
  aircraft: Aircraft[];
  selected: Aircraft | null;
  onSelect: (ac: Aircraft) => void;
  flyTo: { lat: number; lng: number } | null;
  onFlyToComplete: () => void;
  token: string;
}

export default function MapView({
  aircraft,
  selected,
  onSelect,
  flyTo,
  onFlyToComplete,
  token,
}: MapViewProps) {
  const [viewState, setViewState] = useState({
    latitude: 46,
    longitude: 10,
    zoom: 4,
  });
  const [popupAircraft, setPopupAircraft] = useState<Aircraft | null>(null);
  const didFlyRef = useRef<string | null>(null);

  useEffect(() => {
    if (flyTo) {
      const key = `${flyTo.lat}-${flyTo.lng}`;
      if (didFlyRef.current !== key) {
        didFlyRef.current = key;
        setViewState({
          latitude: flyTo.lat,
          longitude: flyTo.lng,
          zoom: 7,
        });
        onFlyToComplete();
      }
    }
  }, [flyTo, onFlyToComplete]);

  const handleMarkerClick = useCallback(
    (ac: Aircraft) => {
      setPopupAircraft(ac);
      onSelect(ac);
    },
    [onSelect]
  );

  return (
    <MapGL
      {...viewState}
      onMove={(evt) => setViewState(evt.viewState)}
      style={{ width: '100%', height: '100%' }}
      mapStyle="mapbox://styles/mapbox/dark-v11"
      mapboxAccessToken={token}
      attributionControl={false}
    >
      <NavigationControl position="top-right" showCompass={false} />

      {aircraft.map((ac) => (
        <Marker
          key={ac.icao24}
          latitude={ac.latitude}
          longitude={ac.longitude}
          anchor="center"
          onClick={(e) => {
            e.originalEvent.stopPropagation();
            handleMarkerClick(ac);
          }}
        >
          <div
            className="relative cursor-pointer group"
            title={`${ac.callsign} - ${ac.airline} ${ac.type}`}
          >
            {/* Aircraft dot */}
            <div
              className={`w-3 h-3 rounded-full border border-[#0a0a0a] ${
                ac.family === 'NG' ? 'bg-[#3b82f6]' : 'bg-[#f97316]'
              } ${
                selected?.icao24 === ac.icao24
                  ? 'ring-2 ring-white/40 w-4 h-4'
                  : ''
              }`}
            />
            {/* Heading indicator */}
            {!ac.on_ground && (
              <div
                className="absolute w-0.5 h-3 left-1/2 -translate-x-1/2 origin-bottom"
                style={{
                  transform: `translateX(-50%) rotate(${ac.heading}deg)`,
                  bottom: '50%',
                }}
              >
                <div
                  className={`w-full h-full ${
                    ac.family === 'NG' ? 'bg-[#3b82f6]/60' : 'bg-[#f97316]/60'
                  }`}
                />
              </div>
            )}
          </div>
        </Marker>
      ))}

      {popupAircraft && (
        <Popup
          latitude={popupAircraft.latitude}
          longitude={popupAircraft.longitude}
          anchor="bottom"
          onClose={() => setPopupAircraft(null)}
          closeOnClick={false}
          offset={12}
        >
          <div className="space-y-1.5 min-w-[180px]">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-sm">
                {popupAircraft.callsign}
              </span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                  popupAircraft.family === 'NG'
                    ? 'bg-[#3b82f6]/20 text-[#3b82f6]'
                    : 'bg-[#f97316]/20 text-[#f97316]'
                }`}
              >
                {popupAircraft.family}
              </span>
            </div>
            <div className="text-[11px] text-[#aaa]">
              {popupAircraft.airline} -- {popupAircraft.type}
            </div>
            <div className="text-[11px] font-mono text-[#aaa]">
              {popupAircraft.registration}
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[11px] pt-1 border-t border-[#222]">
              <div className="text-[#666]">ALT</div>
              <div className="text-right font-mono">
                {popupAircraft.on_ground
                  ? 'GND'
                  : `${popupAircraft.altitude.toLocaleString()} ft`}
              </div>
              <div className="text-[#666]">SPD</div>
              <div className="text-right font-mono">
                {popupAircraft.velocity} kts
              </div>
              <div className="text-[#666]">HDG</div>
              <div className="text-right font-mono">
                {popupAircraft.heading.toFixed(0)}&deg;
              </div>
              <div className="text-[#666]">POS</div>
              <div className="text-right font-mono text-[10px]">
                {popupAircraft.latitude.toFixed(3)}, {popupAircraft.longitude.toFixed(3)}
              </div>
            </div>
          </div>
        </Popup>
      )}
    </MapGL>
  );
}
