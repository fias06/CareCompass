'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

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
    lat: 45.5020,
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
    lat: 45.4950,
    lng: -73.5650,
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
    lat: 45.4870,
    lng: -73.6120,
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
    lat: 45.5090,
    lng: -73.5750,
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
    lat: 45.5140,
    lng: -73.5680,
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
    lat: 45.5030,
    lng: -73.5780,
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
    lat: 45.5080,
    lng: -73.5720,
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
  if (score <= 2) {
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
  } else if (score === 3) {
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
  } else if (score === 4) {
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
  const severity = getSeverityInfo(score);
  
  // Filter hospitals by type
  let filtered = HOSPITALS.filter(h => {
    if (score <= 2) return h.type === 'clinic';
    if (score === 3) return h.type === 'urgent_care' || h.type === 'clinic';
    return h.type === 'emergency' || h.type === 'urgent_care';
  });

  // Sort by distance
  return filtered.sort((a, b) => a.distance - b.distance);
};

function TriageResultsContent() {
  const searchParams = useSearchParams();
  const score = searchParams.get('score') ? parseInt(searchParams.get('score')!) : null;
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);

  if (!score || score < 1 || score > 5) {
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

  const severity = getSeverityInfo(score);
  const hospitals = getRecommendedHospitals(score);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Triage Results</h1>
            </div>
            <Link
              href="/ai-triage"
              className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              New Assessment
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Severity Badge */}
        <div className={`${severity.bgColor} ${severity.borderColor} border-2 rounded-2xl p-8 mb-8`}>
          <div className="flex items-start gap-6">
            <div className={`text-5xl font-bold`}>{severity.icon}</div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className={`text-3xl font-bold ${severity.textColor}`}>{severity.label}</h2>
                <span className={`text-2xl font-bold ${severity.textColor}`}>{score}/5</span>
              </div>
              <p className={`text-lg ${severity.textColor} mb-2`}>{severity.description}</p>
              {score === 5 && (
                <div className="mt-4 flex items-center gap-2">
                  <div className="flex-1 bg-red-300 h-1 rounded-full"></div>
                  <span className="text-red-700 font-bold">EMERGENCY</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left - Hospital List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Recommended Hospitals</h3>
              
              <div className="space-y-4">
                {hospitals.map((hospital) => (
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
                      <div>
                        <h4 className="text-lg font-bold text-gray-900">{hospital.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{hospital.address}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={i < Math.round(hospital.rating) ? '⭐' : '☆'} />
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-600 font-semibold">DISTANCE</p>
                        <p className="text-lg font-bold text-gray-900">{hospital.distance} km</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 font-semibold">ETA</p>
                        <p className="text-lg font-bold text-gray-900">{hospital.eta} min</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 font-semibold">WAIT TIME</p>
                        <p className="text-lg font-bold text-gray-900">{hospital.waitTime} min</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 font-semibold">TYPE</p>
                        <p className="text-lg font-bold text-gray-900 capitalize">{hospital.type.replace('_', ' ')}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {hospital.services.slice(0, 3).map((service) => (
                        <span key={service} className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
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
                ))}
              </div>
            </div>
          </div>

          {/* Right - Details */}
          <div className="space-y-6">
            {/* Summary Card */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h4 className="text-lg font-bold text-gray-900 mb-4">Assessment Summary</h4>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Urgency Level</span>
                  <span className="font-bold text-gray-900">{severity.label}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Score</span>
                  <span className="font-bold text-gray-900">{score}/5</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Recommended Facility</span>
                  <span className="font-bold text-gray-900 capitalize">{severity.recommendedType.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Closest Option</span>
                  <span className="font-bold text-gray-900">{hospitals[0]?.distance} km away</span>
                </div>
              </div>
            </div>

            {/* Selected Hospital Details */}
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

            {/* Call Emergency */}
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
  );
}

export default function TriageResults() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TriageResultsContent />
    </Suspense>
  );
}
