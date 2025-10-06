// Ficheiro: /components/common/MapaDeSelecao.tsx

'use client';

import { useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Corrige um problema comum com o ícone padrão do Leaflet no Next.js
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon.src,
    shadowUrl: iconShadow.src,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;


// Define as propriedades que o componente vai receber
interface MapaDeSelecaoProps {
  position: [number, number]; // Posição atual/inicial do pino
  onPositionChange: (position: { lat: number; lng: number }) => void; // Função para notificar a mudança
}

export default function MapaDeSelecao({ position, onPositionChange }: MapaDeSelecaoProps) {
  const markerRef = useRef<L.Marker>(null);

  // Otimização para os eventos do marcador
  const eventHandlers = useMemo(
    () => ({
      // Evento disparado ao soltar o pino
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const { lat, lng } = marker.getLatLng();
          onPositionChange({ lat, lng }); // Envia a nova posição para o componente pai
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
      // A 'key' força o mapa a recentralizar quando a posição de edição muda
      key={position.toString()}
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