"use client";

import { useState } from "react";
import Link from "next/link";

// Data Models
type ERStatus = "Normal" | "Busy" | "Diverting";
type StaffingLevel = "Normal" | "Short-staffed" | "Critical";
type SuggestedCare = "ER" | "Urgent Care" | "Clinic";

interface HospitalStatusUpdate {
  id: string;
  createdAt: string;
  waitMinutes: number;
  occupancyPct: number;
  erStatus: ERStatus;
  staffing: StaffingLevel;
  notes?: string;
}

interface IncomingPatientReport {
  id: string;
  createdAt: string;
  symptoms: string[];
  freeText?: string;
  urgencyScore: 1 | 2 | 3 | 4 | 5;
  suggestedCare: SuggestedCare;
  seen: boolean;
}

// Mock initial patient reports
const MOCK_PATIENT_REPORTS: IncomingPatientReport[] = [
  {
    id: "1",
    createdAt: new Date(Date.now() - 10 * 60000).toISOString(), // 10 min ago
    symptoms: ["Chest pain", "Shortness of breath"],
    freeText: "Started about 30 minutes ago, getting worse",
    urgencyScore: 5,
    suggestedCare: "ER",
    seen: false,
  },
  {
    id: "2",
    createdAt: new Date(Date.now() - 25 * 60000).toISOString(), // 25 min ago
    symptoms: ["High fever", "Body aches"],
    freeText: "Fever 103°F for the past 4 hours",
    urgencyScore: 3,
    suggestedCare: "Urgent Care",
    seen: false,
  },
  {
    id: "3",
    createdAt: new Date(Date.now() - 45 * 60000).toISOString(), // 45 min ago
    symptoms: ["Sore throat", "Cough"],
    urgencyScore: 2,
    suggestedCare: "Clinic",
    seen: true,
  },
  {
    id: "4",
    createdAt: new Date(Date.now() - 75 * 60000).toISOString(), // 75 min ago
    symptoms: ["Severe headache", "Nausea"],
    freeText: "Migraine that won't go away",
    urgencyScore: 3,
    suggestedCare: "Urgent Care",
    seen: false,
  },
  {
    id: "5",
    createdAt: new Date(Date.now() - 120 * 60000).toISOString(), // 2 hours ago
    symptoms: ["Abdominal pain", "Dizziness"],
    urgencyScore: 4,
    suggestedCare: "ER",
    seen: false,
  },
];

function formatTimeAgo(timestamp: string): string {
  const now = new Date();
  const time = new Date(timestamp);
  const diffMs = now.getTime() - time.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function HospitalDashboard() {
  // Status Reporting State
  const [waitMinutes, setWaitMinutes] = useState<string>("");
  const [occupancyPct, setOccupancyPct] = useState<string>("50");
  const [erStatus, setErStatus] = useState<ERStatus>("Normal");
  const [staffing, setStaffing] = useState<StaffingLevel>("Normal");
  const [notes, setNotes] = useState<string>("");
  const [statusUpdates, setStatusUpdates] = useState<HospitalStatusUpdate[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);

  // Patient Reports State
  const [patientReports, setPatientReports] = useState<IncomingPatientReport[]>(MOCK_PATIENT_REPORTS);
  const [urgencyFilter, setUrgencyFilter] = useState<string>("All");
  const [timeFilter, setTimeFilter] = useState<string>("All");
  const [selectedPatient, setSelectedPatient] = useState<IncomingPatientReport | null>(null);

  const lastUpdate = statusUpdates.length > 0 
    ? statusUpdates[statusUpdates.length - 1].createdAt 
    : null;

  const handleStatusSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // TODO: POST to /api/hospital/status
    const update: HospitalStatusUpdate = {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      waitMinutes: parseInt(waitMinutes) || 0,
      occupancyPct: parseInt(occupancyPct) || 0,
      erStatus,
      staffing,
      notes: notes.trim() || undefined,
    };

    setStatusUpdates((prev) => [...prev, update]);
    setShowSuccess(true);
    
    // Reset form (keep some values)
    setWaitMinutes("");
    setNotes("");
    
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handlePatientClick = (patient: IncomingPatientReport) => {
    setSelectedPatient(patient);
  };

  const handleMarkAsSeen = (patientId: string) => {
    setPatientReports((prev) =>
      prev.map((p) => (p.id === patientId ? { ...p, seen: true } : p))
    );
    if (selectedPatient?.id === patientId) {
      setSelectedPatient({ ...selectedPatient, seen: true });
    }
  };

  const handleClosePatientDetail = () => {
    setSelectedPatient(null);
  };

  // Filter patient reports
  const filteredReports = patientReports.filter((report) => {
    // Urgency filter
    if (urgencyFilter === "4-5" && report.urgencyScore < 4) return false;
    if (urgencyFilter === "3" && report.urgencyScore !== 3) return false;
    if (urgencyFilter === "1-2" && report.urgencyScore > 2) return false;

    // Time filter
    if (timeFilter !== "All") {
      const now = new Date();
      const reportTime = new Date(report.createdAt);
      const diffMins = Math.floor((now.getTime() - reportTime.getTime()) / 60000);

      if (timeFilter === "15m" && diffMins > 15) return false;
      if (timeFilter === "1h" && diffMins > 60) return false;
      if (timeFilter === "4h" && diffMins > 240) return false;
    }

    return true;
  });

  const getUrgencyColor = (score: number) => {
    if (score <= 2) return "text-green-600 bg-green-50 border-green-200";
    if (score === 3) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    if (score === 4) return "text-orange-600 bg-orange-50 border-orange-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
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
            </Link>
            <h2 className="text-lg font-semibold text-gray-900">Hospital Dashboard</h2>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Last Updated Indicator */}
        {lastUpdate && (
          <div className="mb-6 text-sm text-gray-600 text-center">
            Last updated: {formatTimeAgo(lastUpdate)} ({formatTimestamp(lastUpdate)})
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column: Status Reporting */}
          <div className="space-y-8">
            {/* Report Status Card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Report Status</h3>
              <p className="text-sm text-gray-600 mb-6">
                Update 2–4 times per hour to keep recommendations accurate.
              </p>

              {showSuccess && (
                <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
                  ✓ Update published successfully
                </div>
              )}

              <form onSubmit={handleStatusSubmit} className="space-y-6">
                {/* Wait Time */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Wait Time (minutes)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={waitMinutes}
                    onChange={(e) => setWaitMinutes(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    required
                  />
                </div>

                {/* Capacity / Occupancy */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Capacity / Occupancy: {occupancyPct}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={occupancyPct}
                    onChange={(e) => setOccupancyPct(e.target.value)}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* ER Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    ER Status
                  </label>
                  <select
                    value={erStatus}
                    onChange={(e) => setErStatus(e.target.value as ERStatus)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  >
                    <option value="Normal">Normal</option>
                    <option value="Busy">Busy</option>
                    <option value="Diverting">Diverting</option>
                  </select>
                </div>

                {/* Staffing Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Staffing Level
                  </label>
                  <select
                    value={staffing}
                    onChange={(e) => setStaffing(e.target.value as StaffingLevel)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  >
                    <option value="Normal">Normal</option>
                    <option value="Short-staffed">Short-staffed</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Notes (optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
                    placeholder="Any additional information..."
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-gray-900 text-white rounded-full font-medium hover:bg-gray-800 transition-colors"
                >
                  Publish Update
                </button>
              </form>
            </div>

            {/* Recent Updates Timeline */}
            {statusUpdates.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Recent Updates</h3>
                <div className="space-y-4">
                  {[...statusUpdates].reverse().map((update) => (
                    <div
                      key={update.id}
                      className="border-l-2 border-gray-200 pl-4 pb-4 last:pb-0"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900">
                          {formatTimestamp(update.createdAt)}
                        </span>
                        <span className="text-xs text-gray-500">{formatTimeAgo(update.createdAt)}</span>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>Wait: {update.waitMinutes} min • Occupancy: {update.occupancyPct}%</p>
                        <p>ER: {update.erStatus} • Staffing: {update.staffing}</p>
                        {update.notes && (
                          <p className="text-gray-500 italic">"{update.notes}"</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Incoming Patients */}
          <div className="space-y-8">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Incoming Patients</h3>

              {/* Filters */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Urgency
                  </label>
                  <select
                    value={urgencyFilter}
                    onChange={(e) => setUrgencyFilter(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  >
                    <option value="All">All</option>
                    <option value="4-5">4–5 (Critical)</option>
                    <option value="3">3 (Moderate)</option>
                    <option value="1-2">1–2 (Mild)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Time Window
                  </label>
                  <select
                    value={timeFilter}
                    onChange={(e) => setTimeFilter(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  >
                    <option value="All">All</option>
                    <option value="15m">Last 15m</option>
                    <option value="1h">Last 1h</option>
                    <option value="4h">Last 4h</option>
                  </select>
                </div>
              </div>

              {/* Patient List */}
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {filteredReports.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-8">
                    No patient reports match the selected filters.
                  </p>
                ) : (
                  filteredReports.map((patient) => (
                    <button
                      key={patient.id}
                      onClick={() => handlePatientClick(patient)}
                      className={`w-full text-left p-4 rounded-xl border transition-colors ${
                        patient.seen
                          ? "border-gray-200 bg-gray-50 hover:bg-gray-100"
                          : "border-gray-300 bg-white hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold border ${getUrgencyColor(
                              patient.urgencyScore
                            )}`}
                          >
                            {patient.urgencyScore}/5
                          </span>
                          {!patient.seen && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                              New
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">{formatTimeAgo(patient.createdAt)}</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {patient.symptoms.map((symptom, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700"
                          >
                            {symptom}
                          </span>
                        ))}
                      </div>
                      <p className="text-xs text-gray-600">
                        Suggested: {patient.suggestedCare}
                      </p>
                    </button>
                  ))
                )}
              </div>

              {/* TODO: Subscribe to incoming triage reports via WebSocket or polling */}
            </div>
          </div>
        </div>
      </div>

      {/* Patient Detail Modal/Sidebar */}
      {selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-semibold text-gray-900">Patient Report Details</h3>
                <button
                  onClick={handleClosePatientDetail}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Urgency Score */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Urgency Score
                  </label>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-4 py-2 rounded-full text-lg font-bold border ${getUrgencyColor(
                        selectedPatient.urgencyScore
                      )}`}
                    >
                      {selectedPatient.urgencyScore}/5
                    </span>
                    <span className="text-sm text-gray-600">
                      {selectedPatient.urgencyScore <= 2
                        ? "Mild"
                        : selectedPatient.urgencyScore === 3
                        ? "Moderate"
                        : selectedPatient.urgencyScore === 4
                        ? "Requires Attention"
                        : "Emergency"}
                    </span>
                  </div>
                </div>

                {/* Suggested Care */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Suggested Care
                  </label>
                  <p className="text-lg font-semibold text-gray-900">{selectedPatient.suggestedCare}</p>
                </div>

                {/* Symptoms */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reported Symptoms
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {selectedPatient.symptoms.map((symptom, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 rounded-full text-sm bg-gray-100 text-gray-700"
                      >
                        {symptom}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Free Text / Notes */}
                {selectedPatient.freeText && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Patient Notes
                    </label>
                    <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
                      {selectedPatient.freeText}
                    </p>
                  </div>
                )}

                {/* Timestamp */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reported At
                  </label>
                  <p className="text-sm text-gray-600">
                    {formatTimestamp(selectedPatient.createdAt)} ({formatTimeAgo(selectedPatient.createdAt)})
                  </p>
                </div>

                {/* Actions */}
                {!selectedPatient.seen && (
                  <div className="pt-4 border-t border-gray-200">
                    <button
                      onClick={() => {
                        handleMarkAsSeen(selectedPatient.id);
                      }}
                      className="w-full px-6 py-3 bg-gray-900 text-white rounded-full font-medium hover:bg-gray-800 transition-colors"
                    >
                      Mark as Seen
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
