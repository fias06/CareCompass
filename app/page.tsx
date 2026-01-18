"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to AI triage on page load
    router.push("/ai-triage");
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.5 1.5H5.75A2.25 2.25 0 003.5 3.75v12.5A2.25 2.25 0 005.75 18.5h8.5a2.25 2.25 0 002.25-2.25V6.5m-11-5v5m0 0h5" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-gray-900">CareCompass</h1>
            </div>
            <p className="text-sm text-gray-600">AI-Powered Medical Triage</p>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div>
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Smart Medical <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Triage</span>
            </h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Get instant AI-powered assessment of your symptoms and find the right healthcare facility near you in Montreal. Fast, accurate, and always safe.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/ai-triage"
                className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-bold text-lg hover:shadow-lg hover:scale-105 transition-all"
              >
                <span className="text-2xl mr-3">🚑</span>
                Start AI Triage
              </Link>
              <Link
                href="/emergency-map"
                className="inline-flex items-center justify-center px-8 py-4 bg-white border-2 border-purple-600 text-purple-600 rounded-xl font-bold text-lg hover:bg-purple-50 transition-all"
              >
                <span className="text-2xl mr-3">🗺️</span>
                Browse Hospitals
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mt-12">
              <div>
                <p className="text-3xl font-bold text-blue-600">9+</p>
                <p className="text-gray-600 text-sm mt-1">Montreal Hospitals</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-purple-600">&lt;5s</p>
                <p className="text-gray-600 text-sm mt-1">AI Assessment</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-pink-600">24/7</p>
                <p className="text-gray-600 text-sm mt-1">Available</p>
              </div>
            </div>
          </div>

          {/* Right - Illustration */}
          <div className="relative">
            <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl p-12 shadow-2xl">
              <div className="space-y-6">
                {/* Chat Example */}
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <div className="flex gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">A</div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">CareCompass AI</p>
                      <p className="text-sm text-gray-600 mt-1">What symptoms are you experiencing?</p>
                    </div>
                  </div>
                </div>

                {/* Score Badge */}
                <div className="bg-gradient-to-r from-orange-400 to-red-500 rounded-2xl p-6 shadow-lg text-white">
                  <p className="text-sm font-medium mb-2">Assessment Complete</p>
                  <div className="flex items-end gap-2">
                    <span className="text-5xl font-bold">4</span>
                    <span className="text-lg font-semibold mb-1">/5</span>
                  </div>
                  <p className="text-sm mt-3 opacity-90">⚠️ Requires Attention Fast</p>
                </div>

                {/* Hospital Card */}
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <p className="text-xs text-gray-500 font-semibold mb-2">RECOMMENDED</p>
                  <p className="font-bold text-gray-900">Royal Victoria Hospital</p>
                  <p className="text-sm text-gray-600 mt-2">0.6 km • 4 mins</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">How It Works</h3>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white text-2xl font-bold mb-4">
                1
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">Describe Symptoms</h4>
              <p className="text-gray-600">Chat with our AI assistant and describe your symptoms in detail. It listens and learns.</p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 text-white text-2xl font-bold mb-4">
                2
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">Get AI Score</h4>
              <p className="text-gray-600">Advanced AI analyzes your case and assigns an urgency score from 1 to 5.</p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-pink-600 text-white text-2xl font-bold mb-4">
                3
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">Find Hospital</h4>
              <p className="text-gray-600">Instantly get recommendations for the nearest suitable hospital based on your score.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Urgency Scale */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h3 className="text-3xl font-bold text-gray-900 mb-12">Urgency Levels</h3>
        
        <div className="grid md:grid-cols-5 gap-4">
          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">1-2</div>
            <h4 className="font-bold text-gray-900 mb-2">Mild</h4>
            <p className="text-sm text-gray-600">Clinic visit</p>
          </div>

          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 text-center">
            <div className="text-4xl font-bold text-yellow-600 mb-2">3</div>
            <h4 className="font-bold text-gray-900 mb-2">Moderate</h4>
            <p className="text-sm text-gray-600">Urgent Care</p>
          </div>

          <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-6 text-center">
            <div className="text-4xl font-bold text-orange-600 mb-2">4</div>
            <h4 className="font-bold text-gray-900 mb-2">Attention</h4>
            <p className="text-sm text-gray-600">Fast action needed</p>
          </div>

          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 text-center">
            <div className="text-4xl font-bold text-red-600 mb-2">5</div>
            <h4 className="font-bold text-gray-900 mb-2">Urgent</h4>
            <p className="text-sm text-gray-600">Emergency services</p>
          </div>

          <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-6 text-center">
            <div className="text-4xl font-bold text-gray-600 mb-2">?</div>
            <h4 className="font-bold text-gray-900 mb-2">Unsure</h4>
            <p className="text-sm text-gray-600">Talk to AI</p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-4xl font-bold text-white mb-6">Ready to Get Help?</h3>
          <p className="text-xl text-blue-100 mb-8">Start your AI-powered health assessment now. Quick, accurate, and safe.</p>
          
          <Link
            href="/ai-triage"
            className="inline-flex items-center justify-center px-10 py-4 bg-white text-blue-600 rounded-xl font-bold text-lg hover:shadow-lg hover:scale-105 transition-all"
          >
            <span className="text-2xl mr-3">🚑</span>
            Begin Triage Now
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-bold mb-4">CareCompass</h4>
              <p className="text-sm text-gray-400">AI-powered medical triage for Montreal</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/ai-triage" className="hover:text-white">AI Triage</Link></li>
                <li><Link href="/emergency-map" className="hover:text-white">Hospital Map</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Coverage</h4>
              <p className="text-sm text-gray-400">9 Montreal hospitals</p>
              <p className="text-sm text-gray-400">24/7 Available</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Disclaimer</h4>
              <p className="text-sm text-gray-400">For informational use only. Always consult medical professionals.</p>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2026 CareCompass. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
