// app/components/common/PawPrintOverlay.tsx
'use client';

import { useEffect } from 'react';

interface PawPrintOverlayProps {
  count?: number;
  maxSize?: number;
  minSize?: number;
  opacity?: number;
}

export default function PawPrintOverlay({
  count = 10,
  maxSize = 60,
  minSize = 30,
  opacity = 0.1,
}: PawPrintOverlayProps) {
  useEffect(() => {
    const container = document.getElementById("paw-overlay");
    if (!container) return;

    container.innerHTML = "";

    for (let i = 0; i < count; i++) {
      const img = document.createElement("img");
      img.src = "/patinhas.png"; // ✅ agora pega direto da pasta public
      img.alt = "Patinha";
      img.className = "absolute opacity-20 pointer-events-none select-none";
      img.style.width = `${Math.floor(Math.random() * (maxSize - minSize) + minSize)}px`;
      img.style.top = `${Math.random() * 100}%`;
      img.style.left = `${Math.random() * 100}%`;
      img.style.opacity = `${opacity}`;
      img.style.transform = `rotate(${Math.random() * 360}deg)`;
      container.appendChild(img);
    }
  }, [count, maxSize, minSize, opacity]);

  return (
    <div
      id="paw-overlay"
      className="fixed inset-0 -z-10 overflow-hidden pointer-events-none"
    ></div>
  );
}
