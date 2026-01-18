"use client";

import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
                <svg
                  className="w-5 h-5 text-gray-900"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </div>
              <h1 className="text-xl font-semibold text-gray-900">CareCompass</h1>
            </div>
            <p className="text-sm text-gray-500">AI-Powered Medical Triage</p>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-3xl mx-auto space-y-8">
          {/* Badge */}
          <div className="flex justify-center">
            <span className="px-4 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-900 border border-gray-200">
              AI-Powered Triage
            </span>
          </div>

          {/* Headline */}
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-gray-900">
            Smart Medical Triage
          </h2>

          {/* Subhead */}
          <p className="text-base md:text-lg text-gray-600 leading-relaxed">
            Get instant AI-powered assessment of your symptoms and find the right healthcare facility near you in Montreal. Fast, accurate, and always safe.
          </p>

          {/* Primary CTA */}
          <div className="flex justify-center gap-4 pt-4">
            <Link
              href="/ai-triage"
              className="inline-flex items-center justify-center px-8 py-3 bg-gray-900 text-white rounded-full font-medium hover:bg-gray-800 transition-colors"
            >
              Start AI Triage
            </Link>
            <Link
              href="/emergency-map"
              className="inline-flex items-center justify-center px-8 py-3 bg-white text-gray-900 rounded-full font-medium border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Browse Hospitals
            </Link>
          </div>
        </div>
      </div>

      {/* Role Selection Section */}
      <div className="bg-gray-50 border-y border-gray-200 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-2xl font-semibold text-gray-900 text-center mb-10">Who are you?</h3>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Patient Card */}
            <Link
              href="/ai-triage"
              className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto">
                  <svg
                    className="w-8 h-8 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <h4 className="text-xl font-semibold text-gray-900">I'm a Patient</h4>
                <p className="text-sm text-gray-600">
                  Get AI-powered symptom assessment and find the nearest appropriate care facility.
                </p>
              </div>
            </Link>

            {/* Hospital/Staff Card */}
            <Link
              href="/hospital"
              className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                  <svg
                    className="w-8 h-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
                <h4 className="text-xl font-semibold text-gray-900">I'm a Hospital / Staff</h4>
                <p className="text-sm text-gray-600">
                  Access hospital dashboard and staff tools for managing patient triage.
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-2xl font-semibold text-gray-900 text-center mb-12">How It Works</h3>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600 font-semibold text-lg">
                1
              </div>
              <h4 className="text-lg font-semibold text-gray-900">Describe Symptoms</h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                Chat with our AI assistant and describe your symptoms in detail. It listens and learns.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 text-purple-600 font-semibold text-lg">
                2
              </div>
              <h4 className="text-lg font-semibold text-gray-900">Get AI Score</h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                Advanced AI analyzes your case and assigns an urgency score from 1 to 5.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-pink-100 text-pink-600 font-semibold text-lg">
                3
              </div>
              <h4 className="text-lg font-semibold text-gray-900">Find Hospital</h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                Instantly get recommendations for the nearest suitable hospital based on your score.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* How CareCompass Helps (In Practice) Section */}
      <div className="bg-gray-50 border-y border-gray-200 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-2xl font-semibold text-gray-900 text-center mb-12">How CareCompass Helps</h3>
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* Faster Decisions Card */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm relative">
              <span className="absolute top-4 right-4 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                Patients
              </span>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Faster Decisions</h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                Reduce uncertainty during urgent moments.
              </p>
            </div>

            {/* Smarter Routing Card */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm relative">
              <span className="absolute top-4 right-4 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                Routing
              </span>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Smarter Routing</h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                Match urgency with the right facility.
              </p>
            </div>

            {/* Better Prepared Hospitals Card */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm relative">
              <span className="absolute top-4 right-4 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                Hospitals
              </span>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Better Prepared Hospitals</h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                Hospitals see what's coming before patients arrive.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h4 className="font-semibold mb-3 text-gray-900">CareCompass</h4>
              <p className="text-sm text-gray-600">AI-powered medical triage for Montreal</p>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-gray-900">Quick Links</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/ai-triage" className="hover:text-gray-900">AI Triage</Link></li>
                <li><Link href="/emergency-map" className="hover:text-gray-900">Hospital Map</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-gray-900">Disclaimer</h4>
              <p className="text-sm text-gray-600">
                For informational use only. Always consult medical professionals.
              </p>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-8 text-center text-sm text-gray-600">
            <p>&copy; 2026 CareCompass. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
