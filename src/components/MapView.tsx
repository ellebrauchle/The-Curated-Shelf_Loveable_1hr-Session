import { useEffect, useRef } from "react";
import type { Item } from "@/lib/store";

export function MapView({ items }: { items: Item[] }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let map: import("leaflet").Map | undefined;
    let cancelled = false;
    import("leaflet").then((L) => {
      if (cancelled || !ref.current) return;
      const pts = items.filter((i) => i.lat != null && i.lng != null);
      map = L.map(ref.current, { scrollWheelZoom: false });
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);
      const color = getComputedStyle(document.documentElement).getPropertyValue("--primary") || "red";
      const markers = pts.map((p) =>
        L.circleMarker([p.lat!, p.lng!], { radius: 9, color, fillColor: color, fillOpacity: 0.85, weight: 2 })
          .bindPopup(`<strong>${p.title}</strong><br/>${p.address ?? ""}`)
          .addTo(map!),
      );
      if (markers.length) map.fitBounds(L.featureGroup(markers).getBounds().pad(0.3));
      else map.setView([40.73, -73.99], 11);
    });
    return () => {
      cancelled = true;
      map?.remove();
    };
  }, [items]);
  return <div ref={ref} className="h-80 w-full border border-foreground md:h-96" />;
}
