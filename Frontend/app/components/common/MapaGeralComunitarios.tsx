// Ficheiro: /components/common/MapaGeralComunitarios.tsx
'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { AnimalComunitario } from '@/types';

// Define as propriedades que o componente vai receber
interface MapaGeralProps {
  animais: AnimalComunitario[];
}

export default function MapaGeralComunitarios({ animais }: MapaGeralProps) {
  // Posição inicial do mapa
  const initialPosition: [number, number] = [-26.24, -50.28]; 

  return (
    <MapContainer 
      center={initialPosition} 
      zoom={14} 
      style={{ height: '600px', width: '100%', borderRadius: '12px', zIndex: 0 }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      {/* Itera sobre cada animal para criar um marcador personalizado */}
      {animais.map((animal) => {
        // --- AQUI ESTÁ A MÁGICA ---
        // Cria um ícone personalizado usando a imagem do animal
        const customIcon = new L.Icon({
          iconUrl: `${process.env.NEXT_PUBLIC_API_BASE_URL}${animal.imageUrl}`,
          iconSize: [45, 45], // Tamanho do ícone no mapa
          iconAnchor: [22, 45], // Ponto do ícone que corresponde à localização
          popupAnchor: [0, -45], // Onde o popup deve abrir em relação ao ícone
          className: 'mapa-animal-icon' // Classe CSS para estilização extra
        });

        return (
          <Marker 
            key={animal.id} 
            position={[animal.latitude, animal.longitude]}
            icon={customIcon} // Usa o ícone personalizado
          >
            <Popup>
              <div style={{ textAlign: 'center' }}>
                <img 
                  src={`${process.env.NEXT_PUBLIC_API_BASE_URL}${animal.imageUrl}`} 
                  alt={animal.nomeTemporario}
                  style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px', margin: '0 auto' }}
                />
                <h4 style={{ margin: '8px 0 0 0', fontWeight: 'bold' }}>{animal.nomeTemporario}</h4>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px' }}>{animal.enderecoCompleto}</p>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}