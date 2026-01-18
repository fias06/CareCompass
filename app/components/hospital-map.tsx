'use client';

import { useEffect, useRef } from 'react';

interface Hospital {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: 'emergency' | 'urgent_care' | 'clinic';
  phone: string;
  distance: number;
  eta: number;
}

interface HospitalMapProps {
  hospitals: Hospital[];
  onMarkerClick?: (hospitalId: string) => void;
}

export function HospitalMap({ hospitals, onMarkerClick }: HospitalMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    if (!mapContainerRef.current || hospitals.length === 0) return;

    // Calculate center point
    const centerLat = hospitals.reduce((sum, h) => sum + h.lat, 0) / hospitals.length;
    const centerLng = hospitals.reduce((sum, h) => sum + h.lng, 0) / hospitals.length;

    // Create map container HTML
    const mapHTML = `
      <div id="map" style="width: 100%; height: 100%; position: relative; border-radius: 12px; overflow: hidden;">
        <svg style="width: 100%; height: 100%; background: linear-gradient(135deg, #e9f4ff 0%, #f5f5f5 100%);">
          <!-- Grid lines for map background -->
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e0e0e0" stroke-width="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          <!-- Hospitals markers -->
          ${hospitals.map((h, i) => {
            const color = h.type === 'emergency' ? '#ef4444' : h.type === 'urgent_care' ? '#f97316' : '#eab308';
            const x = ((h.lng - centerLng) * 100 + 50) * (mapContainerRef.current?.offsetWidth || 400) / 100;
            const y = ((h.lat - centerLat) * 100 + 50) * (mapContainerRef.current?.offsetHeight || 400) / 100;
            
            return `
              <g class="hospital-marker" data-id="${h.id}" style="cursor: pointer;">
                <circle cx="${x}" cy="${y}" r="20" fill="${color}" opacity="0.9" stroke="white" stroke-width="2"/>
                <text x="${x}" y="${y + 5}" text-anchor="middle" font-size="12" fill="white" font-weight="bold">${i + 1}</text>
              </g>
            `;
          }).join('')}
        </svg>
        
        <!-- Legend -->
        <div style="position: absolute; bottom: 16px; left: 16px; background: white; padding: 12px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); font-size: 12px;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
            <div style="width: 12px; height: 12px; background: #ef4444; border-radius: 50%;"></div>
            <span>Emergency</span>
          </div>
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
            <div style="width: 12px; height: 12px; background: #f97316; border-radius: 50%;"></div>
            <span>Urgent Care</span>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="width: 12px; height: 12px; background: #eab308; border-radius: 50%;"></div>
            <span>Clinic</span>
          </div>
        </div>
        
        <!-- Info box -->
        <div style="position: absolute; top: 16px; left: 16px; background: white; padding: 12px 16px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); font-size: 12px; font-weight: 600;">
          ${hospitals.length} facilities nearby
        </div>
      </div>
    `;

    mapContainerRef.current.innerHTML = mapHTML;

    // Add click handlers to markers
    const markers = mapContainerRef.current.querySelectorAll('.hospital-marker');
    markers.forEach((marker) => {
      marker.addEventListener('click', () => {
        const hospitalId = marker.getAttribute('data-id');
        if (hospitalId && onMarkerClick) {
          onMarkerClick(hospitalId);
        }
      });
    });

  }, [hospitals, onMarkerClick]);

  return (
    <div
      ref={mapContainerRef}
      style={{
        width: '100%',
        height: '100%',
        minHeight: '400px',
        borderRadius: '12px',
        overflow: 'hidden',
      }}
    />
  );
}
