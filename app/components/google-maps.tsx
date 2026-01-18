'use client';

import { useEffect, useRef } from 'react';

// McGill University default location
const MCGILL_LOCATION = { lat: 45.5047, lng: -73.5771 };

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
  userLocation?: { lat: number; lng: number } | null;
}

// Global flag to prevent multiple script loads
let googleMapsScriptLoading = false;
let googleMapsScriptLoaded = false;
const googleMapsCallbacks: (() => void)[] = [];

function loadGoogleMapsScript(callback: () => void) {
  // If already loaded, call callback immediately
  if (googleMapsScriptLoaded && window.google?.maps) {
    callback();
    return;
  }

  // Add callback to queue
  googleMapsCallbacks.push(callback);

  // If already loading, just wait for it
  if (googleMapsScriptLoading) {
    return;
  }

  // Check if script tag already exists
  const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
  if (existingScript) {
    // Script exists, wait for it to load
    if (window.google?.maps) {
      googleMapsScriptLoaded = true;
      googleMapsCallbacks.forEach(cb => cb());
      googleMapsCallbacks.length = 0;
    } else {
      existingScript.addEventListener('load', () => {
        googleMapsScriptLoaded = true;
        googleMapsCallbacks.forEach(cb => cb());
        googleMapsCallbacks.length = 0;
      });
    }
    return;
  }

  // Start loading
  googleMapsScriptLoading = true;
  const script = document.createElement('script');
  script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`;
  script.async = true;
  script.defer = true;
  script.onload = () => {
    googleMapsScriptLoaded = true;
    googleMapsScriptLoading = false;
    googleMapsCallbacks.forEach(cb => cb());
    googleMapsCallbacks.length = 0;
  };
  document.head.appendChild(script);
}

export function GoogleMaps({ hospitals, onMarkerClick, userLocation }: GoogleMapsProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<Map<string, google.maps.Marker>>(new Map());
  const userMarkerRef = useRef<google.maps.Marker | null>(null);

  useEffect(() => {
    loadGoogleMapsScript(() => {
      initializeMap();
    });

    function initializeMap() {
      if (!mapRef.current) return;

      // Use user location or default to McGill University
      const center = userLocation || MCGILL_LOCATION;

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

      // Add user location marker
      if (userMarkerRef.current) {
        userMarkerRef.current.setMap(null);
      }
      userMarkerRef.current = new google.maps.Marker({
        position: center,
        map: map,
        title: 'Your Location',
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#4285F4',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 3,
        },
        zIndex: 1000,
      });

      // Fit bounds to all markers including user location
      if (hospitals.length > 0) {
        const bounds = new google.maps.LatLngBounds();
        bounds.extend(center); // Include user location
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
      if (userMarkerRef.current) {
        userMarkerRef.current.setMap(null);
        userMarkerRef.current = null;
      }
    };
  }, [hospitals, onMarkerClick, userLocation]);

  return (
    <div
      ref={mapRef}
      style={{
        width: '100%',
        height: '100%',
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
