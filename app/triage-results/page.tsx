'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { GoogleMaps } from '../components/google-maps';
import { SpeakButton } from '../components/SpeakButton';
import type { SpeechPayload } from '../lib/voice/types';
import { toUrgencyScore } from '../lib/utils/urgency';

// McGill University default location
const MCGILL_LOCATION = { lat: 45.5047, lng: -73.5771 };

interface Hospital {
  id: string;
  name: string;
  type: 'emergency' | 'urgent_care' | 'clinic';
  lat: number;
  lng: number;
  distance: number;
  eta: number;
  rating: number;
  phone: string;
  address: string;
  services: string[];
  waitTime: number;
}

const HOSPITALS: Hospital[] = [
  {
    id: 'royal-victoria',
    name: 'Royal Victoria Hospital',
    type: 'emergency',
    lat: 45.502,
    lng: -73.5791,
    distance: 0.6,
    eta: 4,
    rating: 4.4,
    phone: '+1-514-934-1934',
    address: '687 Pine Avenue W, Montreal',
    services: ['Emergency', 'Trauma', 'Cardiology', 'Neurology'],
    waitTime: 45,
  },
  {
    id: 'mcgill-health',
    name: 'McGill Health Centre',
    type: 'emergency',
    lat: 45.495,
    lng: -73.565,
    distance: 1.5,
    eta: 8,
    rating: 4.5,
    phone: '+1-514-398-4343',
    address: '1025 Pine Avenue W, Montreal',
    services: ['Emergency', 'Surgery', 'Pediatrics'],
    waitTime: 35,
  },
  {
    id: 'jewish-general',
    name: 'Jewish General Hospital',
    type: 'emergency',
    lat: 45.487,
    lng: -73.612,
    distance: 2.1,
    eta: 12,
    rating: 4.3,
    phone: '+1-514-340-8222',
    address: '3755 Côte-Sainte-Catherine Rd, Montreal',
    services: ['Emergency', 'Oncology', 'Orthopedics'],
    waitTime: 50,
  },
  {
    id: 'hopital-general',
    name: 'Hôpital Général de Montréal',
    type: 'urgent_care',
    lat: 45.509,
    lng: -73.575,
    distance: 0.9,
    eta: 5,
    rating: 4.2,
    phone: '+1-514-934-8084',
    address: '1650 Cedar Avenue, Montreal',
    services: ['Urgent Care', 'Minor Injuries', 'Flu Shots'],
    waitTime: 25,
  },
  {
    id: 'hopital-saint-luc',
    name: 'Hôpital Saint-Luc',
    type: 'urgent_care',
    lat: 45.514,
    lng: -73.568,
    distance: 1.2,
    eta: 7,
    rating: 4.0,
    phone: '+1-514-890-8000',
    address: '1058 Saint-Denis, Montreal',
    services: ['Urgent Care', 'Walk-in', 'Prescriptions'],
    waitTime: 20,
  },
  {
    id: 'mcgill-clinic',
    name: 'McGill Clinic Downtown',
    type: 'clinic',
    lat: 45.503,
    lng: -73.578,
    distance: 0.8,
    eta: 5,
    rating: 4.3,
    phone: '+1-514-398-6000',
    address: '750 Boulevard René-Lévesque W, Montreal',
    services: ['General Practice', 'Vaccinations', 'Check-ups'],
    waitTime: 15,
  },
  {
    id: 'downtown-clinic',
    name: 'Downtown Medical Clinic',
    type: 'clinic',
    lat: 45.508,
    lng: -73.572,
    distance: 1.3,
    eta: 8,
    rating: 4.1,
    phone: '+1-514-397-7777',
    address: '1200 McGill College Ave, Montreal',
    services: ['General Medicine', 'Lab Work', 'Consultations'],
    waitTime: 10,
  },
];

const getSeverityInfo = (score: number) => {
  // SAFEGUARD: Default to lowest severity (1/Mild) for invalid scores, never default to Urgent (5)
  // This ensures parse failures or NaN don't display as maximum urgency
  const validScore = Number.isFinite(score) && score >= 1 && score <= 5 ? score : 1;
  
  if (validScore <= 2) {
    return {
      label: 'Mild',
      color: 'green',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-900',
      icon: '✓',
      description: 'Non-urgent care needed',
      recommendedType: 'clinic',
    };
  } else if (validScore === 3) {
    return {
      label: 'Moderate',
      color: 'yellow',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-900',
      icon: '!',
      description: 'Moderate care recommended',
      recommendedType: 'urgent_care',
    };
  } else if (validScore === 4) {
    return {
      label: 'Requires Attention',
      color: 'orange',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      textColor: 'text-orange-900',
      icon: '⚠',
      description: 'Fast attention needed',
      recommendedType: 'emergency',
    };
  } else {
    return {
      label: 'Urgent',
      color: 'red',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-900',
      icon: '🚨',
      description: 'Emergency services recommended - CALL 911',
      recommendedType: 'emergency',
    };
  }
};

const getRecommendedHospitals = (score: number): Hospital[] => {
  const filtered = HOSPITALS.filter((h) => {
    if (score <= 2) return h.type === 'clinic';
    if (score === 3) return h.type === 'urgent_care' || h.type === 'clinic';
    return h.type === 'emergency' || h.type === 'urgent_care';
  });

  // Sort by total time (ETA + wait time) - lowest total time first
  return filtered.sort((a, b) => (a.eta + a.waitTime) - (b.eta + b.waitTime));
};

function TriageResultsContent() {
  const searchParams = useSearchParams();
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  
  // Get user location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          // Default to McGill University if location denied
          setUserLocation(MCGILL_LOCATION);
        }
      );
    } else {
      // Default to McGill University if geolocation not supported
      setUserLocation(MCGILL_LOCATION);
    }
  }, []);
  
  // TEMP LOG: Raw query param
  const scoreParam = searchParams.get('score');
  console.log("INPUT_URGENCY_RAW", scoreParam, typeof scoreParam);
  
  // SAFEGUARD: Use strict urgency helper - never default to 5, always defaults to 1
  const score = toUrgencyScore(scoreParam, 1);
  
  // TEMP LOG: After validation
  console.log("COMPUTED_URGENCY", score, typeof score);
  
  const severity = getSeverityInfo(score);
  const hospitals = getRecommendedHospitals(score);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(hospitals[0] || null);

  // TEMP LOG: Before rendering badge
  console.log("BADGE_URGENCY", score, severity.label, typeof score);

  // SAFEGUARD: Reject invalid scores (should never happen with toUrgencyScore, but double-check)
  if (!Number.isFinite(score) || score < 1 || score > 5) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Score Received</h2>
          <p className="text-gray-600 mb-6">Please go back and complete the AI triage first.</p>
          <Link
            href="/ai-triage"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Back to Triage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Heart icon - matches landing page for visual consistency */}
              <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
                <svg
                  className="w-5 h-5 text-gray-900"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Triage Results</h1>
            </div>
            {/* Centered SpeakButton - Enhanced for primary control visibility */}
            {hospitals.length > 0 && hospitals[0] && (
              <div className="absolute left-1/2 transform -translate-x-1/2">
                <SpeakButton
                  payload={{
                    type: "recommendation_top",
                    locale: "en",
                    voice: "calm",
                    data: {
                      facilityName: hospitals[0].name,
                      facilityType: hospitals[0].type,
                      distanceKm: hospitals[0].distance,
                      etaMin: hospitals[0].eta,
                      waitMin: hospitals[0].waitTime,
                      address: hospitals[0].address,
                    },
                  }}
                  size="lg"
                  label="Play audio summary of facility recommendation"
                />
              </div>
            )}
            <Link href="/ai-triage" className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              New Assessment
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full px-2 lg:px-4 py-6">
        {/* 3-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch min-h-0 lg:h-[calc(100vh-140px)]">
          {/* Middle (Map) */}
          <div className="lg:col-span-7 order-1 lg:order-2 flex justify-center h-full min-h-0">
            <div className="w-full h-full min-h-0 flex flex-col">
              <div className="bg-white rounded-2xl shadow-lg p-6 h-full min-h-0 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Nearby Facilities</h3>
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full ${
                      score === 5
                        ? 'bg-red-100 text-red-700'
                        : score === 4
                        ? 'bg-orange-100 text-orange-700'
                        : score === 3
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {/* SAFEGUARD: Display computed severity label and validated score - never show invalid values as Urgent */}
                    {/* TEMP LOG removed after debugging */}
                    {severity.label} • {score}/5
                  </span>
                </div>

                <div className="w-full h-full min-h-0 overflow-hidden rounded-xl">
                  <div className="w-full h-full min-h-0">
                    <GoogleMaps
                      hospitals={hospitals}
                      onMarkerClick={(hospitalId) => {
                        const hospital = hospitals.find((h) => h.id === hospitalId);
                        if (hospital) setSelectedHospital(hospital);
                      }}
                      userLocation={userLocation}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Left - Recommended Facilities (scrollable) */}
          <div className="lg:col-span-3 order-2 lg:order-1 h-full min-h-0">
            <div className="bg-white rounded-2xl shadow-lg p-8 h-full min-h-0 flex flex-col">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Recommended Facilities</h3>

              <div className="flex-1 min-h-0 overflow-y-auto pr-6 space-y-4">
                {hospitals.map((hospital, index) => {
                  // Build TTS payload for top recommended facility (first in list)
                  const isTopFacility = index === 0;
                  const ttsPayload: SpeechPayload | null = isTopFacility
                    ? {
                        type: "recommendation_top",
                        locale: "en",
                        voice: "calm",
                        data: {
                          facilityName: hospital.name,
                          facilityType: hospital.type,
                          distanceKm: hospital.distance,
                          etaMin: hospital.eta,
                          waitMin: hospital.waitTime,
                          address: hospital.address,
                        },
                      }
                    : null;

                  return (
                    <div
                      key={hospital.id}
                      onClick={() => setSelectedHospital(hospital)}
                      className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedHospital?.id === hospital.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="text-lg font-bold text-gray-900 break-words">{hospital.name}</h4>
                            {isTopFacility && ttsPayload && (
                              <div onClick={(e) => e.stopPropagation()}>
                                <SpeakButton payload={ttsPayload} size="sm" />
                              </div>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1 break-words">{hospital.address}</p>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={i < Math.round(hospital.rating) ? '⭐' : '☆'} />
                          ))}
                        </div>
                      </div>

                    {/* FIX: force 2 columns on all widths so DISTANCE and ETA can never collide */}
                    <div className="grid grid-cols-2 gap-x-6 gap-y-4 mb-4">
                      <div className="min-w-0">
                        <p className="text-xs text-gray-600 font-semibold whitespace-nowrap">DISTANCE</p>
                        <p className="text-lg font-bold text-gray-900 whitespace-nowrap">{hospital.distance} km</p>
                      </div>

                      <div className="min-w-0 text-right">
                        <p className="text-xs text-gray-600 font-semibold whitespace-nowrap">ETA</p>
                        <p className="text-lg font-bold text-gray-900 whitespace-nowrap">{hospital.eta} min</p>
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs text-gray-600 font-semibold whitespace-nowrap">WAIT TIME</p>
                        <p className="text-lg font-bold text-gray-900 whitespace-nowrap">{hospital.waitTime} min</p>
                      </div>

                      <div className="min-w-0 text-right">
                        <p className="text-xs text-gray-600 font-semibold whitespace-nowrap">TYPE</p>
                        <p className="text-lg font-bold text-gray-900 capitalize whitespace-nowrap">
                          {hospital.type.replace('_', ' ')}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {hospital.services.slice(0, 3).map((service) => (
                        <span
                          key={service}
                          className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full"
                        >
                          {service}
                        </span>
                      ))}
                      {hospital.services.length > 3 && (
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">
                          +{hospital.services.length - 3} more
                        </span>
                      )}
                    </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="lg:col-span-2 order-3 h-full min-h-0">
            <div className="h-full min-h-0 overflow-y-auto space-y-6 pr-1">
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h4 className="text-lg font-bold text-gray-900 mb-4">Assessment Summary</h4>

                <div className="space-y-4 text-sm">
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-gray-600">Urgency Level</span>
                    <span className="font-bold text-gray-900 text-right">{severity.label}</span>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-gray-600">Score</span>
                    <span className="font-bold text-gray-900 text-right">{score}/5</span>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-gray-600">Recommended Facility</span>
                    <span className="font-bold text-gray-900 capitalize text-right">
                      {severity.recommendedType.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-gray-600">Closest Option</span>
                    <span className="font-bold text-gray-900 text-right">{hospitals[0]?.distance} km away</span>
                  </div>
                </div>
              </div>

              {selectedHospital && (
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h4 className="text-lg font-bold text-gray-900 mb-4">{selectedHospital.name}</h4>
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-gray-600 font-semibold mb-1">PHONE</p>
                      <a href={`tel:${selectedHospital.phone}`} className="text-blue-600 hover:underline font-medium">
                        {selectedHospital.phone}
                      </a>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-semibold mb-1">ADDRESS</p>
                      <p className="text-gray-900">{selectedHospital.address}</p>
                    </div>
                    <div className="pt-4">
                      <a
                        href={`https://www.google.com/maps/search/${encodeURIComponent(selectedHospital.address)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full block text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                      >
                        Get Directions
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {score === 5 && (
                <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8">
                  <h4 className="text-lg font-bold text-red-900 mb-4">🚨 Emergency Action</h4>
                  <a
                    href="tel:911"
                    className="w-full block text-center px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-bold text-lg mb-4"
                  >
                    Call 911
                  </a>
                  <p className="text-sm text-red-800">
                    Your symptoms require immediate emergency services. Please call 911 or your local emergency number.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TriageResults() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TriageResultsContent />
    </Suspense>
  );
}
