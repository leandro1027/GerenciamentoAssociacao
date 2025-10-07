// Ficheiro: /components/common/MapaDetalheAnimal.tsx
'use client';

import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon.src,
    shadowUrl: iconShadow.src,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface MapaDetalheProps {
  latitude: number;
  longitude: number;
}

export default function MapaDetalheAnimal({ latitude, longitude }: MapaDetalheProps) {
  const position: [number, number] = [latitude, longitude];

  return (
    <MapContainer 
      center={position} 
      zoom={16} // --- ATUALIZADO: Zoom mais próximo ---
      style={{ height: '100%', width: '100%', borderRadius: '12px' }}
      scrollWheelZoom={false}
      dragging={false}
      zoomControl={false}
      className="z-0" // Adicionado para garantir que não sobreponha outros elementos
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      <Marker position={position} />
    </MapContainer>
  );
}