"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";

// Dynamically import react-leaflet components to avoid SSR issues
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false },
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false },
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  {
    ssr: false,
  },
);
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
});

import L from "leaflet";

type Ward = {
  name: string;
  latitude: number;
  longitude: number;
};

export default function FindCentreWithMap({
  wards,
  userLocation,
  highlight,
}: {
  wards: Ward[];
  userLocation?: { lat: number; lng: number } | null;
  highlight?: Ward[] | undefined;
}) {
  useEffect(() => {
    // ensure leaflet css is loaded client-side
    const id = "leaflet-styles";
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      link.integrity = "sha256-o9N1jGMVb2Xn6r0v+0f5PZlH+g0b+7Fv5x1rI0yE5fM=";
      link.crossOrigin = "";
      document.head.appendChild(link);
    }

    // fix default icon paths
    // cast to any to avoid TypeScript errors when @types/leaflet aren't installed
    try {
      // @ts-ignore
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      // @ts-ignore
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });
    } catch (e) {
      // noop
    }
  }, []);

  const center: [number, number] =
    userLocation && wards && wards.length > 0
      ? [userLocation.lat, userLocation.lng]
      : wards && wards.length > 0
        ? [wards[0].latitude, wards[0].longitude]
        : [9.082, 8.6753];

  const MapC: any = MapContainer as any;
  const Tile: any = TileLayer as any;
  const Mark: any = Marker as any;
  const Pop: any = Popup as any;

  return (
    <MapC center={center} zoom={12} style={{ height: 480, width: "100%" }}>
      <Tile
        {...({
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        } as any)}
      />

      {wards.map((w) => (
        <Mark key={w.name} position={[w.latitude, w.longitude]}>
          <Pop>
            <div className="font-medium">{w.name}</div>
            <a
              className="text-sm text-primary underline"
              href={`https://www.google.com/maps/search/?api=1&query=${w.latitude},${w.longitude}`}
              target="_blank"
              rel="noreferrer"
            >
              Open in Google Maps
            </a>
          </Pop>
        </Mark>
      ))}
    </MapC>
  );
}
