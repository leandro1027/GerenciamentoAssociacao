// Ficheiro: /components/common/MapaGeralComunitarios.tsx
'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { AnimalComunitario } from '@/types';
import { useEffect } from 'react';

// Componente interno para ajustar o mapa (sem alterações)
const MapUpdater = ({ animais }: { animais: AnimalComunitario[] }) => {
  const map = useMap(); 

  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 100);

    if (animais.length === 0) return;

    const bounds = L.latLngBounds(animais.map(animal => [animal.latitude, animal.longitude]));
    
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [map, animais]);

  return null;
}

interface MapaGeralProps {
  animais: AnimalComunitario[];
}

export default function MapaGeralComunitarios({ animais }: MapaGeralProps) {
  return (
    <MapContainer 
      style={{ height: '100%', width: '100%', borderRadius: '12px' }}
      className="z-0"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      {animais.map((animal) => {
        const customIcon = new L.Icon({
          iconUrl: `${process.env.NEXT_PUBLIC_API_BASE_URL}${animal.imageUrl}`,
          iconSize: [45, 45],
          iconAnchor: [22, 45],
          popupAnchor: [0, -45],
          className: 'mapa-animal-icon'
        });

        return (
          <Marker 
            key={animal.id} 
            position={[animal.latitude, animal.longitude]}
            icon={customIcon}
          >
            {/* --- CONTEÚDO DO POPUP ADICIONADO AQUI --- */}
            <Popup>
              <div style={{ textAlign: 'center', width: '150px' }}>
                <img 
                  src={`${process.env.NEXT_PUBLIC_API_BASE_URL}${animal.imageUrl}`} 
                  alt={animal.nomeTemporario}
                  style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '8px', margin: '0 auto' }}
                />
                <h4 style={{ margin: '8px 0 0 0', fontWeight: 'bold', fontSize: '16px' }}>
                  {animal.nomeTemporario}
                </h4>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', whiteSpace: 'normal' }}>
                  {animal.enderecoCompleto}
                </p>
              </div>
            </Popup>
          </Marker>
        );
      })}

      <MapUpdater animais={animais} />

    </MapContainer>
  );
}