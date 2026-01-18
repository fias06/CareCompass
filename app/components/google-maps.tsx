'use client';

import { useEffect, useRef } from 'react';

interface GoogleMapsProps {
  hospitals: Array<{
    id: string;
    name: string;
    lat: number;
    lng: number;
    type: 'emergency' | 'urgent_care' | 'clinic';
    phone: string;
    distance: number;
    eta: number;
  }>;
  onMarkerClick?: (hospitalId: string) => void;
}

export function GoogleMaps({ hospitals, onMarkerClick }: GoogleMapsProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<Map<string, google.maps.Marker>>(new Map());

  useEffect(() => {
    // Check if Google Maps API is loaded
    if (!window.google?.maps) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        initializeMap();
      };
      document.head.appendChild(script);
    } else {
      initializeMap();
    }

    function initializeMap() {
      if (!mapRef.current) return;

      // Center on Montreal
      const center = { lat: 45.5017, lng: -73.5673 };

      // Create map
      const map = new google.maps.Map(mapRef.current, {
        zoom: 12,
        center: center,
        styles: [
          {
            featureType: 'water',
            elementType: 'geometry',
            stylers: [{ color: '#e9f4ff' }],
          },
          {
            featureType: 'landscape',
            elementType: 'geometry',
            stylers: [{ color: '#f5f5f5' }],
          },
        ],
      });

      mapInstanceRef.current = map;

      // Clear existing markers
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current.clear();

      // Add markers for each hospital
      hospitals.forEach(hospital => {
        const icon = getMarkerIcon(hospital.type);
        const marker = new google.maps.Marker({
          position: { lat: hospital.lat, lng: hospital.lng },
          map: map,
          title: hospital.name,
          icon: icon,
          scale: 1.5,
        });

        // Create info window content
        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="padding: 10px; font-family: Arial, sans-serif; color: black;">
              <h3 style="margin: 0 0 5px 0; font-size: 14px; font-weight: bold; color: black;">${hospital.name}</h3>
              <p style="margin: 3px 0; font-size: 12px; color: black;">
                <strong>Distance:</strong> ${hospital.distance} km<br/>
                <strong>ETA:</strong> ${hospital.eta} min<br/>
                <strong>Phone:</strong> <a href="tel:${hospital.phone}" style="color: #0066cc;">${hospital.phone}</a>
              </p>
            </div>
          `,
        });

        marker.addListener('click', () => {
          // Close all other info windows
          document.querySelectorAll<HTMLElement>('.gm-style-iw').forEach(iw => {
            iw.style.display = 'none';
          });
          infoWindow.open(map, marker);
          if (onMarkerClick) {
            onMarkerClick(hospital.id);
          }
        });

        markersRef.current.set(hospital.id, marker);
      });

      // Fit bounds to all markers
      if (hospitals.length > 0) {
        const bounds = new google.maps.LatLngBounds();
        hospitals.forEach(hospital => {
          bounds.extend({ lat: hospital.lat, lng: hospital.lng });
        });
        map.fitBounds(bounds);
      }
    }

    function getMarkerIcon(type: string): string {
      switch (type) {
        case 'emergency':
          return 'http://maps.google.com/mapfiles/ms/icons/red-dot.png';
        case 'urgent_care':
          return 'http://maps.google.com/mapfiles/ms/icons/orange-dot.png';
        case 'clinic':
          return 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png';
        default:
          return 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png';
      }
    }

    return () => {
      // Cleanup
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current.clear();
    };
  }, [hospitals, onMarkerClick]);

  return (
    <div
      ref={mapRef}
      style={{
        width: '100%',
        height: '400px',
        borderRadius: '12px',
        overflow: 'hidden',
      }}
    />
  );
}

declare global {
  interface Window {
    google?: {
      maps: any;
    };
  }
}
