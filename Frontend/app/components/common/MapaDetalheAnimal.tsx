'use client';

import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconUrl: markerIcon.src,
  iconRetinaUrl: markerIcon2x.src,
  shadowUrl: markerShadow.src,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
});


interface MapaDetalheProps {
  latitude: number;
  longitude: number;
}

export default function MapaDetalheAnimal({ latitude, longitude }: MapaDetalheProps) {
  const position: [number, number] = [latitude, longitude];

  return (
    <MapContainer
      key={`${latitude}-${longitude}`} 
      center={position}
      zoom={16}
      style={{ height: '100%', width: '100%', borderRadius: 'inherit' }} // Herda o border-radius do container
      scrollWheelZoom={false}
      dragging={false}
      zoomControl={false}
      className="z-0"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      <Marker position={position} />
    </MapContainer>
  );
}
