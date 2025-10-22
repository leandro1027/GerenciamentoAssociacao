'use client';

import { useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon.src,
    shadowUrl: iconShadow.src,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

interface MapaDeSelecaoProps {
  position: [number, number];
  onPositionChange: (position: { lat: number; lng: number }) => void;
}

export default function MapaDeSelecao({ position, onPositionChange }: MapaDeSelecaoProps) {
  const markerRef = useRef<L.Marker>(null);

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const { lat, lng } = marker.getLatLng();
          onPositionChange({ lat, lng });
        }
      },
    }),
    [onPositionChange],
  );

  return (
    <MapContainer
      center={position}
      zoom={15}
      style={{ height: '300px', width: '100%', borderRadius: '8px', zIndex: 0 }}
      key={position.toString()} // Força a re-renderização se a posição inicial mudar
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <Marker
        draggable={true}
        eventHandlers={eventHandlers}
        position={position}
        ref={markerRef}
      />
    </MapContainer>
  );
}