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

/** SVG airplane icon — rotates to heading, colored by family */
function AircraftIcon({
  ac,
  isSelected,
}: {
  ac: Aircraft;
  isSelected: boolean;
}) {
  const color = ac.family === 'NG' ? '#3b82f6' : '#f97316';
  const glowColor = ac.family === 'NG' ? '#3b82f680' : '#f9731680';
  const size = isSelected ? 28 : 20;
  const isFlying = !ac.on_ground;

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size + 16, height: size + 16 }}
    >
      {/* Pulse ring animation for airborne aircraft */}
      {isFlying && (
        <>
          <div
            className="absolute rounded-full animate-ping"
            style={{
              width: size + 8,
              height: size + 8,
              backgroundColor: `${color}15`,
              border: `1px solid ${color}30`,
              animationDuration: '3s',
            }}
          />
          <div
            className="absolute rounded-full"
            style={{
              width: size + 4,
              height: size + 4,
              background: `radial-gradient(circle, ${color}20 0%, transparent 70%)`,
            }}
          />
        </>
      )}

      {/* Aircraft SVG */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        style={{
          transform: `rotate(${ac.heading}deg)`,
          filter: isSelected
            ? `drop-shadow(0 0 6px ${glowColor}) drop-shadow(0 0 12px ${glowColor})`
            : `drop-shadow(0 0 3px ${glowColor})`,
          transition: 'transform 1s ease-out, filter 0.3s ease',
        }}
      >
        {/* Aircraft body - top-down view pointing UP (north=0deg) */}
        <path
          d="M12 2 L14 8 L20 13 L20 14.5 L14 12 L14 18 L16.5 20 L16.5 21.5 L12 20 L7.5 21.5 L7.5 20 L10 18 L10 12 L4 14.5 L4 13 L10 8 Z"
          fill={color}
          stroke={isSelected ? '#fff' : `${color}cc`}
          strokeWidth={isSelected ? 1 : 0.5}
          strokeLinejoin="round"
        />
      </svg>

      {/* Speed trail / contrail for fast aircraft */}
      {isFlying && ac.velocity > 200 && (
        <div
          className="absolute"
          style={{
            width: 2,
            height: Math.min(ac.velocity / 15, 30),
            background: `linear-gradient(to bottom, ${color}60, transparent)`,
            transformOrigin: 'top center',
            transform: `rotate(${ac.heading + 180}deg)`,
            top: '50%',
            left: '50%',
            marginLeft: -1,
          }}
        />
      )}
    </div>
  );
}

/** Ground aircraft icon — smaller, dimmer, no animation */
function GroundIcon({ ac, isSelected }: { ac: Aircraft; isSelected: boolean }) {
  const color = ac.family === 'NG' ? '#3b82f6' : '#f97316';
  return (
    <div className="flex items-center justify-center" style={{ width: 16, height: 16 }}>
      <div
        className="rounded-full"
        style={{
          width: isSelected ? 10 : 7,
          height: isSelected ? 10 : 7,
          backgroundColor: `${color}80`,
          border: isSelected ? `2px solid ${color}` : `1px solid ${color}60`,
          boxShadow: isSelected ? `0 0 8px ${color}60` : 'none',
          transition: 'all 0.3s ease',
        }}
      />
    </div>
  );
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
    [onSelect],
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

      {aircraft.map((ac) => {
        const isSelected = selected?.icao24 === ac.icao24;
        return (
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
              className="cursor-pointer"
              title={`${ac.callsign} - ${ac.airline} ${ac.type}`}
            >
              {ac.on_ground ? (
                <GroundIcon ac={ac} isSelected={isSelected} />
              ) : (
                <AircraftIcon ac={ac} isSelected={isSelected} />
              )}
            </div>
          </Marker>
        );
      })}

      {popupAircraft && (
        <Popup
          latitude={popupAircraft.latitude}
          longitude={popupAircraft.longitude}
          anchor="bottom"
          onClose={() => setPopupAircraft(null)}
          closeOnClick={false}
          offset={16}
        >
          <div className="space-y-1.5 min-w-[200px]">
            {/* Header with aircraft silhouette */}
            <div className="flex items-start justify-between">
              <div>
                <div className="font-mono font-bold text-sm">
                  {popupAircraft.callsign}
                </div>
                <div className="text-[11px] text-[#aaa]">
                  {popupAircraft.airline}
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold ${
                    popupAircraft.family === 'NG'
                      ? 'bg-[#3b82f6]/20 text-[#3b82f6]'
                      : 'bg-[#f97316]/20 text-[#f97316]'
                  }`}
                >
                  {popupAircraft.type}
                </span>
              </div>
            </div>

            {/* Aircraft silhouette */}
            <div className="flex items-center justify-center py-1">
              <AircraftSilhouette family={popupAircraft.family} />
            </div>

            <div className="text-[11px] font-mono text-[#aaa] text-center">
              {popupAircraft.registration}
            </div>

            <div className="grid grid-cols-4 gap-1 text-[10px] pt-1.5 border-t border-[#222]">
              <div className="text-center">
                <div className="text-[#666] mb-0.5">ALT</div>
                <div className="font-mono font-semibold">
                  {popupAircraft.on_ground
                    ? 'GND'
                    : `${(popupAircraft.altitude / 1000).toFixed(1)}k`}
                </div>
              </div>
              <div className="text-center">
                <div className="text-[#666] mb-0.5">SPD</div>
                <div className="font-mono font-semibold">
                  {popupAircraft.velocity}
                </div>
              </div>
              <div className="text-center">
                <div className="text-[#666] mb-0.5">HDG</div>
                <div className="font-mono font-semibold">
                  {popupAircraft.heading.toFixed(0)}&deg;
                </div>
              </div>
              <div className="text-center">
                <div className="text-[#666] mb-0.5">FL</div>
                <div className="font-mono font-semibold">
                  {popupAircraft.on_ground
                    ? '--'
                    : Math.round(popupAircraft.altitude / 100)}
                </div>
              </div>
            </div>

            <div className="text-[10px] font-mono text-[#555] text-center pt-0.5">
              {popupAircraft.latitude.toFixed(4)}, {popupAircraft.longitude.toFixed(4)}
            </div>
          </div>
        </Popup>
      )}
    </MapGL>
  );
}

/** Side-view aircraft silhouette SVG for popups and inventory */
export function AircraftSilhouette({
  family,
  size = 120,
}: {
  family: 'NG' | 'MAX';
  size?: number;
}) {
  const color = family === 'NG' ? '#3b82f6' : '#f97316';
  const bgColor = family === 'NG' ? '#3b82f610' : '#f9731610';

  return (
    <svg
      width={size}
      height={size * 0.35}
      viewBox="0 0 200 70"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background glow */}
      <ellipse cx="100" cy="40" rx="90" ry="25" fill={bgColor} />

      {/* Fuselage */}
      <path
        d="M10 38 Q10 32, 20 30 L170 28 Q185 28, 192 32 Q195 34, 195 36 Q195 38, 192 40 Q185 44, 170 44 L20 42 Q10 42, 10 38 Z"
        fill={`${color}30`}
        stroke={color}
        strokeWidth="1.5"
      />

      {/* Cockpit windows */}
      <path
        d="M185 33 Q188 32, 191 33"
        stroke={`${color}cc`}
        strokeWidth="1"
        fill="none"
      />
      <path
        d="M186 35 Q189 34, 192 35"
        stroke={`${color}cc`}
        strokeWidth="1"
        fill="none"
      />

      {/* Wing */}
      <path
        d="M85 36 L60 58 Q58 60, 62 60 L120 60 Q124 60, 122 58 L105 36"
        fill={`${color}25`}
        stroke={color}
        strokeWidth="1"
      />

      {/* Tail / vertical stabilizer */}
      <path
        d="M22 30 L15 12 Q14 8, 18 8 L30 10 Q32 10, 32 14 L30 28"
        fill={`${color}25`}
        stroke={color}
        strokeWidth="1"
      />

      {/* Horizontal stabilizer */}
      <path
        d="M18 34 L8 48 Q6 50, 10 50 L35 48 Q38 48, 36 46 L25 34"
        fill={`${color}20`}
        stroke={color}
        strokeWidth="0.8"
      />

      {/* Engine 1 (under wing) */}
      <ellipse
        cx="78"
        cy="56"
        rx="8"
        ry="4.5"
        fill={`${color}35`}
        stroke={color}
        strokeWidth="0.8"
      />

      {/* Engine 2 (under wing) */}
      <ellipse
        cx="112"
        cy="56"
        rx="8"
        ry="4.5"
        fill={`${color}35`}
        stroke={color}
        strokeWidth="0.8"
      />

      {/* Window line */}
      <line
        x1="35"
        y1="33"
        x2="175"
        y2="31"
        stroke={`${color}40`}
        strokeWidth="0.5"
        strokeDasharray="2 3"
      />

      {/* MAX winglet distinction */}
      {family === 'MAX' && (
        <>
          {/* Split-tip winglets */}
          <path
            d="M60 58 L55 52 Q54 50, 56 50 L60 54"
            fill={`${color}40`}
            stroke={color}
            strokeWidth="0.8"
          />
          <path
            d="M122 58 L127 52 Q128 50, 126 50 L122 54"
            fill={`${color}40`}
            stroke={color}
            strokeWidth="0.8"
          />

          {/* LEAP-1B engine (larger nacelles) */}
          <path
            d="M70 56 Q70 52, 74 52"
            stroke={`${color}60`}
            strokeWidth="0.6"
            fill="none"
          />
          <path
            d="M104 56 Q104 52, 108 52"
            stroke={`${color}60`}
            strokeWidth="0.6"
            fill="none"
          />
        </>
      )}

      {/* Type label */}
      <text
        x="100"
        y="22"
        textAnchor="middle"
        fill={color}
        fontSize="9"
        fontFamily="monospace"
        fontWeight="bold"
        opacity="0.7"
      >
        {family === 'NG' ? '737 NG' : '737 MAX'}
      </text>
    </svg>
  );
}
