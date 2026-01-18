'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { elevenLabsVoice } from '../lib/elevenlabs';
import { GoogleMaps } from '../components/google-maps';

interface Hospital {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  type: 'emergency' | 'urgent_care' | 'clinic';
  phone: string;
  distance: number;
  eta: number;
  rating: number;
  services: string[];
  waitTime: number;
}

const HOSPITALS: Hospital[] = [
  {
    id: 'royal-victoria',
    name: 'Royal Victoria Hospital',
    address: '687 Pine Avenue W, Montreal, QC H3A 1A1',
    lat: 45.5020,
    lng: -73.5791,
    type: 'emergency',
    phone: '+1-514-934-1934',
    distance: 0.6,
    eta: 4,
    rating: 4.4,
    services: ['Emergency', 'Trauma', 'Cardiology', 'Neurology'],
    waitTime: 45,
  },
  {
    id: 'mcgill-health',
    name: 'McGill Health Centre',
    address: '1025 Pine Avenue W, Montreal, QC',
    lat: 45.4950,
    lng: -73.5650,
    type: 'emergency',
    phone: '+1-514-398-4343',
    distance: 1.5,
    eta: 8,
    rating: 4.5,
    services: ['Emergency', 'Surgery', 'Pediatrics'],
    waitTime: 35,
  },
  {
    id: 'jewish-general',
    name: 'Jewish General Hospital',
    address: '3755 Côte-Sainte-Catherine Rd, Montreal, QC',
    lat: 45.4870,
    lng: -73.6120,
    type: 'emergency',
    phone: '+1-514-340-8222',
    distance: 2.1,
    eta: 12,
    rating: 4.3,
    services: ['Emergency', 'Oncology', 'Orthopedics'],
    waitTime: 50,
  },
  {
    id: 'hopital-general',
    name: 'Hôpital Général de Montréal',
    address: '1650 Cedar Avenue, Montreal, QC',
    lat: 45.5090,
    lng: -73.5750,
    type: 'urgent_care',
    phone: '+1-514-934-8084',
    distance: 0.9,
    eta: 5,
    rating: 4.2,
    services: ['Urgent Care', 'Minor Injuries', 'Flu Shots'],
    waitTime: 25,
  },
  {
    id: 'hopital-saint-luc',
    name: 'Hôpital Saint-Luc',
    address: '1058 Saint-Denis, Montreal, QC',
    lat: 45.5140,
    lng: -73.5680,
    type: 'urgent_care',
    phone: '+1-514-890-8000',
    distance: 1.2,
    eta: 7,
    rating: 4.0,
    services: ['Urgent Care', 'Walk-in', 'Prescriptions'],
    waitTime: 20,
  },
  {
    id: 'mcgill-clinic',
    name: 'McGill Clinic Downtown',
    address: '750 Boulevard René-Lévesque W, Montreal, QC',
    lat: 45.5030,
    lng: -73.5780,
    type: 'clinic',
    phone: '+1-514-398-6000',
    distance: 0.8,
    eta: 5,
    rating: 4.3,
    services: ['General Practice', 'Vaccinations', 'Check-ups'],
    waitTime: 15,
  },
  {
    id: 'downtown-clinic',
    name: 'Downtown Medical Clinic',
    address: '1200 McGill College Ave, Montreal, QC',
    lat: 45.5080,
    lng: -73.5720,
    type: 'clinic',
    phone: '+1-514-397-7777',
    distance: 1.3,
    eta: 8,
    rating: 4.1,
    services: ['General Medicine', 'Lab Work', 'Consultations'],
    waitTime: 10,
  },
];

export default function EmergencyMap() {
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [filter, setFilter] = useState<'all' | 'emergency' | 'urgent_care' | 'clinic'>('all');
  const [speaking, setSpeaking] = useState(false);
  const hospitalListRef = useRef<HTMLDivElement>(null);

  const filteredHospitals = HOSPITALS.filter(
    (h) => filter === 'all' || h.type === filter
  ).sort((a, b) => a.distance - b.distance);

  // Scroll selected hospital into view when clicked from list or map
  useEffect(() => {
    if (selectedHospital) {
      const hospitalElement = document.getElementById(`hospital-${selectedHospital.id}`);
      if (hospitalElement && hospitalListRef.current) {
        hospitalElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [selectedHospital]);

  // Handle marker click from map - select hospital in list
  const handleMarkerClick = (hospitalId: string) => {
    const hospital = filteredHospitals.find((h) => h.id === hospitalId);
    if (hospital) {
      setSelectedHospital(hospital);
    }
  };

  const handleSpeak = async (text: string) => {
    setSpeaking(true);
    try {
      await elevenLabsVoice.speak(text);
    } catch (error) {
      console.error('Speech error:', error);
    } finally {
      setSpeaking(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="text-gray-600 hover:text-gray-900">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">Hospital Map</h1>
            </div>
            <p className="text-sm text-gray-600">Montreal Area</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Map */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden h-[600px] border border-gray-200">
              {/* Reuse GoogleMaps component - same as triage-results page */}
              {!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? (
                // Fallback UI when API key is missing
                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-8 text-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Hospital Map</h3>
                  <p className="text-gray-600 mb-1">View the hospital list on the right to see details about nearby medical facilities.</p>
                  <p className="text-sm text-gray-500 mt-2">(Interactive Google Map requires NEXT_PUBLIC_GOOGLE_MAPS_API_KEY)</p>
                </div>
              ) : (
                <GoogleMaps
                  hospitals={filteredHospitals.map((h) => ({
                    id: h.id,
                    name: h.name,
                    lat: h.lat,
                    lng: h.lng,
                    type: h.type,
                    phone: h.phone,
                    distance: h.distance,
                    eta: h.eta,
                  }))}
                  onMarkerClick={handleMarkerClick}
                />
              )}
            </div>

            {/* Legend */}
            <div className="mt-6 bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Legend</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-red-500"></div>
                  <span className="text-sm text-gray-700">Emergency Room</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-orange-500"></div>
                  <span className="text-sm text-gray-700">Urgent Care</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-500"></div>
                  <span className="text-sm text-gray-700">Clinic</span>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                <span className="text-sm text-gray-700">Your Location (McGill)</span>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Hospitals List */}
          <div className="space-y-6">
            {/* Filter Buttons */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Filter by Type</h3>
              <div className="space-y-2">
                {[
                  { key: 'all', label: 'All Hospitals' },
                  { key: 'emergency', label: 'Emergency' },
                  { key: 'urgent_care', label: 'Urgent Care' },
                  { key: 'clinic', label: 'Clinics' },
                ].map((option) => (
                  <button
                    key={option.key}
                    onClick={() => setFilter(option.key as any)}
                    className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all ${
                      filter === option.key
                        ? 'bg-blue-500 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Hospitals List */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900">Nearby Hospitals</h3>
                <p className="text-sm text-gray-600 mt-1">{filteredHospitals.length} found</p>
              </div>

              <div ref={hospitalListRef} className="max-h-[600px] overflow-y-auto">
                {filteredHospitals.map((hospital) => (
                  <div
                    key={hospital.id}
                    id={`hospital-${hospital.id}`}
                    onClick={() => setSelectedHospital(hospital)}
                    className={`p-4 border-b cursor-pointer transition-all ${
                      selectedHospital?.id === hospital.id
                        ? 'bg-blue-50 border-l-4 border-l-blue-500'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-bold text-gray-900 text-sm">{hospital.name}</h4>
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded-full ${
                          hospital.type === 'emergency'
                            ? 'bg-red-100 text-red-700'
                            : hospital.type === 'urgent_care'
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {hospital.type === 'emergency' ? 'ER' : hospital.type === 'urgent_care' ? 'Urgent' : 'Clinic'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-600">
                        <p>{hospital.distance} km • {hospital.eta} min</p>
                        <p>Wait: {hospital.waitTime} min</p>
                      </div>
                      <div className="text-xs text-gray-600">
                        {hospital.rating.toFixed(1)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Selected Hospital Details */}
        {selectedHospital && (
          <div className="mt-8 bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-8">
              <h2 className="text-3xl font-bold mb-2">{selectedHospital.name}</h2>
              <p className="text-blue-100">{selectedHospital.address}</p>
            </div>

            <div className="p-8">
              <div className="grid md:grid-cols-4 gap-8 mb-8">
                <div>
                  <p className="text-sm text-gray-600 font-semibold">DISTANCE</p>
                  <p className="text-3xl font-bold text-gray-900">{selectedHospital.distance} km</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-semibold">ETA</p>
                  <p className="text-3xl font-bold text-gray-900">{selectedHospital.eta} min</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-semibold">WAIT TIME</p>
                  <p className="text-3xl font-bold text-gray-900">{selectedHospital.waitTime} min</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-semibold">RATING</p>
                  <p className="text-3xl font-bold text-gray-900">{selectedHospital.rating.toFixed(1)}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h4 className="text-lg font-bold text-gray-900 mb-4">Services</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedHospital.services.map((service) => (
                      <span
                        key={service}
                        className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full"
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-bold text-gray-900 mb-4">Contact & Directions</h4>
                  <div className="space-y-3">
                    <a
                      href={`tel:${selectedHospital.phone}`}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773c.32.588.902 1.33 1.901 2.329s1.74 1.581 2.328 1.901l.773-1.548a1 1 0 011.06-.54l4.435.74a1 1 0 01.836.986V17a2 2 0 01-2 2h-2.5A8.5 8.5 0 013.5 2.5V0z" />
                      </svg>
                      {selectedHospital.phone}
                    </a>
                    <a
                      href={`https://www.google.com/maps/search/${encodeURIComponent(selectedHospital.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-all"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      Get Directions
                    </a>
                  </div>
                </div>
              </div>

              {/* Voice Button */}
              <button
                onClick={() => {
                  const info = `${selectedHospital.name} is ${selectedHospital.distance} kilometers away, approximately ${selectedHospital.eta} minutes drive time. They have ${selectedHospital.services.length} main services including ${selectedHospital.services.slice(0, 2).join(' and ')}. Current wait time is ${selectedHospital.waitTime} minutes.`;
                  handleSpeak(info);
                }}
                disabled={speaking}
                className="mt-4 flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-all disabled:opacity-50"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                  <path d="M3 20h14a2 2 0 002-2V4a2 2 0 00-2-2H3a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                {speaking ? 'Speaking...' : 'Hear Hospital Info'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
