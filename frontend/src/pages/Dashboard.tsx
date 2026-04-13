import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Popup, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import {
  FileText,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ChevronRight,
  Loader2,
  AlertCircle,
  MapPin,
  TrendingUp,
  Leaf,
  Activity,
  Calendar,
  Filter,
} from 'lucide-react';

// --- TYPESCRIPT INTERFACES ---

interface Submission {
  id: string;
  time: string;           // ISO timestamp string from backend e.g. "2026-04-13T14:32:00Z"
  location: string;       // May be empty — we'll reverse-geocode from coordinates
  status: 'Healthy' | 'Moisture Stress' | 'Pest Alert' | 'High Damage';
  coordinates: [number, number];
  cropStage?: string;
}

interface EnrichedSubmission extends Submission {
  resolvedLocation: string;
  formattedTime: string;
}

// --- HELPERS ---

/** Format ISO timestamp → "13 Apr 2026, 2:32 PM" */
function formatTime(raw: string): string {
  if (!raw) return '—';
  const d = new Date(raw);
  if (isNaN(d.getTime())) return raw; // Already formatted string from backend — use as-is
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

/** Reverse-geocode [lat, lng] → human-readable place name using Nominatim (free, no key) */
async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=14`,
      { headers: { 'Accept-Language': 'en' } }
    );
    const data = await res.json();
    const a = data.address || {};
    // Build concise label: village/suburb + district/state
    const place =
      a.village || a.suburb || a.town || a.city_district || a.city || a.county || '';
    const district = a.state_district || a.county || a.state || '';
    return [place, district].filter(Boolean).join(', ') || data.display_name?.split(',')[0] || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  } catch {
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
}

// --- STATUS CONFIG ---
const statusConfig = {
  Healthy: {
    color: '#10b981',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-700',
    badge: 'bg-emerald-100 text-emerald-700',
    dot: '#10b981',
    label: 'Healthy',
  },
  'Moisture Stress': {
    color: '#f59e0b',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-700',
    badge: 'bg-amber-100 text-amber-700',
    dot: '#f59e0b',
    label: 'Moisture Stress',
  },
  'Pest Alert': {
    color: '#f43f5e',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    text: 'text-rose-700',
    badge: 'bg-rose-100 text-rose-700',
    dot: '#f43f5e',
    label: 'Pest Alert',
  },
  'High Damage': {
    color: '#dc2626',
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-700',
    badge: 'bg-red-100 text-red-700',
    dot: '#dc2626',
    label: 'High Damage',
  },
};

const Dashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([19.1825, 73.1841]);
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [submissions, setSubmissions] = useState<EnrichedSubmission[]>([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('http://localhost:8000/api/user/dashboard', {
          cache: 'no-store',
        });
        const backendData = await response.json();

        if (backendData.userCenter) setMapCenter(backendData.userCenter);

        const rawSubs: Submission[] = backendData.submissions || [];

        // Enrich with formatted time — geocoding happens separately below
        const enriched: EnrichedSubmission[] = rawSubs.map((s) => ({
          ...s,
          formattedTime: formatTime(s.time),
          resolvedLocation: s.location || `${s.coordinates[0].toFixed(4)}, ${s.coordinates[1].toFixed(4)}`,
        }));

        setSubmissions(enriched);

        // Now reverse-geocode all entries that lack a location label
        // Rate-limit: Nominatim requires max 1 req/sec
        for (let i = 0; i < enriched.length; i++) {
          const sub = enriched[i];
          if (!sub.location || sub.location.trim() === '') {
            if (i > 0) await new Promise((r) => setTimeout(r, 1100)); // 1.1s gap
            const resolved = await reverseGeocode(sub.coordinates[0], sub.coordinates[1]);
            setSubmissions((prev) =>
              prev.map((s) => (s.id === sub.id ? { ...s, resolvedLocation: resolved } : s))
            );
          }
        }
      } catch (err) {
        console.error('Backend connection failed:', err);
        setError('Could not connect to the CROPIC servers.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserData();
  }, []);

  // ── Computed stats from actual submission data (never trust backend % blindly) ──
  const totalAnalyzed = submissions.length;
  const healthyCount = submissions.filter((s) => s.status === 'Healthy').length;
  const alertCount = submissions.filter(
    (s) => s.status === 'Pest Alert' || s.status === 'High Damage'
  ).length;
  const healthyPercentage =
    totalAnalyzed > 0 ? Math.round((healthyCount / totalAnalyzed) * 100) : 0;

  const filteredSubmissions =
    selectedFilter === 'All'
      ? submissions
      : submissions.filter((s) => s.status === selectedFilter);

  // --- LOADING STATE ---
  if (isLoading) {
    return (
      <div className="flex-1 min-h-screen bg-[#F4F6F0] flex flex-col items-center justify-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-lg">
          <Leaf className="w-7 h-7 text-white animate-pulse" />
        </div>
        <div className="text-center">
          <h2 className="text-lg font-bold text-slate-800 tracking-tight">Loading Field Data</h2>
          <p className="text-slate-500 text-sm mt-1">Syncing your crop reports…</p>
        </div>
        <Loader2 className="w-5 h-5 text-emerald-500 animate-spin" />
      </div>
    );
  }

  // --- ERROR STATE ---
  if (error) {
    return (
      <div className="flex-1 min-h-screen bg-[#F4F6F0] flex flex-col items-center justify-center text-center px-6 gap-4">
        <div className="w-14 h-14 bg-rose-100 text-rose-500 rounded-2xl flex items-center justify-center">
          <AlertCircle className="w-7 h-7" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-800">Connection Error</h2>
          <p className="text-slate-500 text-sm mt-1">{error}</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-medium text-sm hover:bg-slate-800 transition-colors"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  // --- MAIN DASHBOARD ---
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        .cropic-dash { font-family: 'DM Sans', sans-serif; }
        .mono { font-family: 'DM Mono', monospace; }

        .stat-card {
          background: white;
          border-radius: 20px;
          border: 1px solid #e8ede6;
          padding: 24px;
          position: relative;
          overflow: hidden;
          transition: box-shadow 0.2s, transform 0.2s;
        }
        .stat-card:hover { box-shadow: 0 8px 32px rgba(0,0,0,0.08); transform: translateY(-1px); }

        .stat-card::before {
          content: '';
          position: absolute;
          top: 0; right: 0;
          width: 80px; height: 80px;
          border-radius: 0 20px 0 80px;
          opacity: 0.06;
        }
        .stat-card.blue::before { background: #2563eb; }
        .stat-card.green::before { background: #10b981; }
        .stat-card.amber::before { background: #f59e0b; }

        .upload-row {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px 16px;
          border-radius: 14px;
          cursor: pointer;
          transition: background 0.15s;
          border: 1px solid transparent;
        }
        .upload-row:hover { background: #f8faf6; border-color: #e0e8da; }

        .status-pill {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 3px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.02em;
        }
        .status-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .filter-btn {
          padding: 5px 14px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s;
          border: 1.5px solid #e0e8da;
          background: white;
          color: #64748b;
        }
        .filter-btn.active {
          background: #1a3a2a;
          border-color: #1a3a2a;
          color: white;
        }

        .map-wrapper { border-radius: 0 0 20px 20px; overflow: hidden; }
        .section-card {
          background: white;
          border-radius: 20px;
          border: 1px solid #e8ede6;
          overflow: hidden;
        }
        .section-header {
          padding: 20px 24px;
          border-bottom: 1px solid #f0f4ee;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
      `}</style>

      <div className="cropic-dash flex-1 min-h-screen overflow-y-auto" style={{ background: '#F4F6F0' }}>
        <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">

          {/* ── PAGE HEADER ── */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Field Dashboard</h1>
              <p className="text-slate-500 text-sm mt-0.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            {submissions.length > 0 && (
              <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2">
                <Activity className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700 text-sm font-semibold">
                  {submissions.length} submission{submissions.length !== 1 ? 's' : ''} tracked
                </span>
              </div>
            )}
          </div>

          {/* ── KPI CARDS ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Total Analyzed */}
            <div className="stat-card blue">
              <div className="flex items-start justify-between mb-5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <span className="mono text-xs text-slate-400 font-medium">TOTAL</span>
              </div>
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest mb-1">Analyses</p>
              <p className="text-4xl font-bold text-slate-900 mono">{totalAnalyzed}</p>
              <p className="text-xs text-slate-400 mt-2">crop images submitted</p>
            </div>

            {/* Health Score */}
            <div className="stat-card green">
              <div className="flex items-start justify-between mb-5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                </div>
                <span className="mono text-xs text-slate-400 font-medium">SCORE</span>
              </div>
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest mb-1">Field Health</p>
              <div className="flex items-end gap-2">
                <p className="text-4xl font-bold text-slate-900 mono">{healthyPercentage}%</p>
                {healthyPercentage >= 50 && (
                  <TrendingUp className="w-5 h-5 text-emerald-500 mb-1.5" />
                )}
              </div>
              {/* Mini health bar */}
              <div className="mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${healthyPercentage}%`,
                    background: healthyPercentage >= 70 ? '#10b981' : healthyPercentage >= 40 ? '#f59e0b' : '#f43f5e',
                  }}
                />
              </div>
            </div>

            {/* Active Alerts */}
            <div className="stat-card amber">
              <div className="flex items-start justify-between mb-5">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                </div>
                <span className="mono text-xs text-slate-400 font-medium">ALERTS</span>
              </div>
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest mb-1">Active Alerts</p>
              <p className="text-4xl font-bold text-slate-900 mono">{alertCount}</p>
              <p className="text-xs text-slate-400 mt-2">
                {alertCount === 0 ? 'No issues detected' : 'require attention'}
              </p>
            </div>
          </div>

          {/* ── MAIN GRID ── */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

            {/* MAP — 3 cols */}
            <div className="lg:col-span-3 section-card" style={{ minHeight: 460 }}>
              <div className="section-header">
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <h2 className="font-bold text-slate-800">Geospatial Footprint</h2>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />Healthy</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />Stress</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-400 inline-block" />Alert</span>
                </div>
              </div>
              <div className="map-wrapper" style={{ height: 400 }}>
                {submissions.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3">
                    <MapPin className="w-10 h-10 opacity-30" />
                    <p className="text-sm font-medium">No field locations yet</p>
                    <p className="text-xs opacity-70">Upload a crop image to see it here</p>
                  </div>
                ) : (
                  <MapContainer
                    center={mapCenter}
                    zoom={13}
                    scrollWheelZoom={true}
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      attribution='&copy; OpenStreetMap'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {submissions.map((sub) => {
                      const cfg = statusConfig[sub.status];
                      return (
                        <CircleMarker
                          key={sub.id}
                          center={sub.coordinates}
                          pathOptions={{
                            color: cfg.color,
                            fillColor: cfg.color,
                            fillOpacity: 0.75,
                            weight: 2,
                          }}
                          radius={10}
                        >
                          <Popup>
                            <div style={{ fontFamily: 'DM Sans, sans-serif', minWidth: 160 }}>
                              <p style={{ fontWeight: 700, marginBottom: 4 }}>Report #{sub.id}</p>
                              <p style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>{sub.resolvedLocation}</p>
                              <p style={{ fontSize: 11, color: '#94a3b8', marginBottom: 6 }}>{sub.formattedTime}</p>
                              <span style={{
                                display: 'inline-block',
                                padding: '2px 10px',
                                borderRadius: 20,
                                fontSize: 11,
                                fontWeight: 600,
                                background: cfg.color + '22',
                                color: cfg.color,
                              }}>
                                {sub.status}
                              </span>
                              {sub.cropStage && (
                                <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 6 }}>{sub.cropStage}</p>
                              )}
                            </div>
                          </Popup>
                        </CircleMarker>
                      );
                    })}
                  </MapContainer>
                )}
              </div>
            </div>

            {/* UPLOAD HISTORY — 2 cols */}
            <div className="lg:col-span-2 section-card flex flex-col">
              <div className="section-header">
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-slate-500" />
                  <h2 className="font-bold text-slate-800">Upload History</h2>
                </div>
                <span className="mono text-xs text-slate-400 bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg">
                  {submissions.length} total
                </span>
              </div>

              {/* Filter bar */}
              {submissions.length > 0 && (
                <div className="px-4 py-3 border-b border-slate-50 flex items-center gap-2 flex-wrap">
                  <Filter className="w-3.5 h-3.5 text-slate-400" />
                  {['All', 'Healthy', 'Moisture Stress', 'Pest Alert', 'High Damage'].map((f) => (
                    <button
                      key={f}
                      className={`filter-btn ${selectedFilter === f ? 'active' : ''}`}
                      onClick={() => setSelectedFilter(f)}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              )}

              <div className="flex-1 overflow-y-auto p-4">
                {submissions.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3 py-12">
                    <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center">
                      <FileText className="w-6 h-6 opacity-40" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold text-slate-600">No submissions yet</p>
                      <p className="text-xs text-slate-400 mt-1">Upload a crop image to get started</p>
                    </div>
                  </div>
                ) : filteredSubmissions.length === 0 ? (
                  <div className="py-10 text-center text-slate-400">
                    <p className="text-sm font-medium">No {selectedFilter} submissions</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredSubmissions.map((submission) => {
                      const cfg = statusConfig[submission.status];
                      return (
                        <div key={submission.id} className="upload-row group">
                          {/* Status icon */}
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold"
                            style={{
                              background: cfg.color + '15',
                              border: `1.5px solid ${cfg.color}40`,
                              color: cfg.color,
                            }}
                          >
                            {submission.status === 'Healthy' ? (
                              <Leaf className="w-4 h-4" />
                            ) : (
                              <AlertTriangle className="w-4 h-4" />
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm font-bold text-slate-800 mono">#{submission.id}</p>
                              <span
                                className="status-pill"
                                style={{
                                  background: cfg.color + '18',
                                  color: cfg.color,
                                }}
                              >
                                <span className="status-dot" style={{ background: cfg.color }} />
                                {cfg.label}
                              </span>
                            </div>
                            <div className="flex flex-col gap-0.5 text-xs text-slate-400">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3 flex-shrink-0" />
                                {submission.formattedTime}
                              </span>
                              {submission.resolvedLocation && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3 flex-shrink-0" />
                                  <span className="truncate">{submission.resolvedLocation}</span>
                                </span>
                              )}
                            </div>
                          </div>

                          <ChevronRight className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Summary footer */}
              {submissions.length > 0 && (
                <div className="p-4 border-t border-slate-50 grid grid-cols-2 gap-3">
                  <div className="bg-emerald-50 rounded-xl p-3 text-center">
                    <p className="text-2xl font-bold text-emerald-700 mono">{healthyCount}</p>
                    <p className="text-xs text-emerald-600 font-medium mt-0.5">Healthy</p>
                  </div>
                  <div className="bg-rose-50 rounded-xl p-3 text-center">
                    <p className="text-2xl font-bold text-rose-700 mono">{alertCount}</p>
                    <p className="text-xs text-rose-600 font-medium mt-0.5">Alerts</p>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;