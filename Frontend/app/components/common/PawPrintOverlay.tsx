// app/components/common/PawPrintOverlay.tsx
'use client';

import React, { useEffect, useState } from 'react';

interface Paw {
  id: number;
  top: number;
  left: number;
  size: number;
  rotation: number;
}

interface PawPrintOverlayProps {
  count?: number;
  maxSize?: number;
  minSize?: number;
  opacity?: number;
  maxRotation?: number;
  safeAreaPx?: number;
}

const PawPrintOverlay: React.FC<PawPrintOverlayProps> = ({
  count = 10,
  maxSize = 60,
  minSize = 30,
  opacity = 0.15,
  maxRotation = 45,
  safeAreaPx = 40,
}) => {
  const [paws, setPaws] = useState<Paw[]>([]);

  useEffect(() => {
    const newPaws: Paw[] = [];
    for (let i = 0; i < count; i++) {
      newPaws.push({
        id: i,
        top: Math.random() * (window.innerHeight - safeAreaPx * 2) + safeAreaPx,
        left: Math.random() * (window.innerWidth - safeAreaPx * 2) + safeAreaPx,
        size: Math.random() * (maxSize - minSize) + minSize,
        rotation: Math.random() * maxRotation * (Math.random() > 0.5 ? 1 : -1),
      });
    }
    setPaws(newPaws);
  }, [count, maxSize, minSize, maxRotation, safeAreaPx]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      {paws.map(paw => (
        <svg
          key={paw.id}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 512 512"
          fill="currentColor"
          style={{
            position: 'absolute',
            top: paw.top,
            left: paw.left,
            width: paw.size,
            height: paw.size,
            opacity: opacity,
            transform: `rotate(${paw.rotation}deg)`,
          }}
          className="text-amber-900"
        >
          <path d="M256 0c-43.9 0-79.6 35.7-79.6 79.6 0 20.3 7.8 39.2 21.6 53.4C175.7 151 143 173.8 126 205.8 81.3 227 49.3 260.6 32 300.7 11.2 347.1 0 399.7 0 454.4c0 32.1 26 58.4 58.4 58.4H453.6c32.4 0 58.4-26.3 58.4-58.4 0-54.7-11.2-107.3-32-153.7-17.3-40.1-49..." />
        </svg>
      ))}
    </div>
  );
};

export default PawPrintOverlay;
