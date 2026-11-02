"use client";

import "leaflet/dist/leaflet.css";
import { MapPinHouse } from "lucide-react";
import { useEffect } from "react";
import { MapContainer, TileLayer, useMap, useMapEvents } from "react-leaflet";

export type LatLng = { lat: number; lng: number };

// Recentres the map when the address search picks a new location.
function FollowCenter({ center }: { center: LatLng }) {
  const map = useMap();
  useEffect(() => {
    const current = map.getCenter();
    if (
      Math.abs(current.lat - center.lat) > 1e-6 ||
      Math.abs(current.lng - center.lng) > 1e-6
    ) {
      map.setView([center.lat, center.lng], Math.max(map.getZoom(), 16));
    }
  }, [center, map]);
  return null;
}

function ReportCenter({ onChange }: { onChange: (value: LatLng) => void }) {
  useMapEvents({
    moveend(event) {
      const { lat, lng } = event.target.getCenter();
      onChange({ lat, lng });
    },
  });
  return null;
}

// The pin stays in the middle; the user drags the map underneath it.
export default function StationLocationMap({
  center,
  onChange,
}: {
  center: LatLng;
  onChange: (value: LatLng) => void;
}) {
  return (
    <div className="relative h-62.5 overflow-hidden rounded-xl border border-gray-200">
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={15}
        className="h-full! w-full"
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FollowCenter center={center} />
        <ReportCenter onChange={onChange} />
      </MapContainer>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 z-[500] flex -translate-x-1/2 -translate-y-full flex-col items-center"
      >
        <span className="bg-primary-500 flex size-12 items-center justify-center rounded-full text-white shadow-lg">
          <MapPinHouse size={22} />
        </span>
        <span className="border-t-primary-500 -mt-0.5 size-0 border-x-8 border-t-10 border-x-transparent" />
      </div>
      <p className="pointer-events-none absolute top-[62%] left-1/2 z-[500] -translate-x-1/2 rounded-full bg-black px-4 py-1.5 text-xs whitespace-nowrap text-white">
        Drag the map to place the pin where you want
      </p>
    </div>
  );
}
