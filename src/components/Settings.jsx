import React, { useState } from 'react';
import { Settings as SettingsIcon, Database, RefreshCw, BellRing, Shield, Terminal, Save, Check } from 'lucide-react';
import { db } from "../config/firebase";
import { ref, set } from 'firebase/database';


export default function Settings() {
  const [saved, setSaved] = useState(false);

  // Settings State
  const [syncInterval, setSyncInterval] = useState('2');
  const [enableLogs, setEnableLogs] = useState(true);
  const [autoAlerts, setAutoAlerts] = useState(true);
  const [firebaseUrl, setFirebaseUrl] = useState('https://telemetry-backend-5425a-default-rtdb.firebaseio.com');
  const [dataMode, setDataMode] = useState('live'); // 'live' or 'simulated'


const handleSave = () => {
    const configRef = ref(db, 'config');
    
    set(configRef, {
      sync_interval: parseInt(syncInterval),
      data_mode: dataMode,
      updated_at: new Date().toISOString()
    }).then(() => {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }).catch(err => console.error("Config save error:", err));
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      
      {/* Header Banner */}
      <div className="flex items-center justify-between bg-slate-900/50 border border-slate-800 p-5 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400">
            <SettingsIcon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-white text-lg font-bold">Engine & Telemetry Settings</h3>
            <p className="text-slate-400 text-xs mt-0.5">Configure C-Engine synchronization, thresholds, and data stream parameters</p>
          </div>
        </div>

        <button 
          onClick={handleSave}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold px-4 py-2 rounded-lg text-xs transition-all active:scale-95"
        >
          {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? 'Changes Saved!' : 'Save Configurations'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* 1. Sync & Data Stream Settings */}
        <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-slate-200">
            <RefreshCw className="w-4 h-4 text-emerald-400" />
            <h4 className="font-semibold text-sm">Synchronization & Stream</h4>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Telemtry Fetch Interval (Seconds)</label>
              <select 
                value={syncInterval}
                onChange={(e) => setSyncInterval(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="1">1 Second (Ultra Fast / High Overhead)</option>
                <option value="2">2 Seconds (Standard Kernel Default)</option>
                <option value="5">5 Seconds (Balanced Mode)</option>
                <option value="10">10 Seconds (Power Saving)</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Data Source Mode</label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => setDataMode('live')}
                  className={`p-2.5 rounded-lg border text-center transition-all ${
                    dataMode === 'live' 
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 font-bold' 
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  Live C-Engine
                </button>
                <button
                  type="button"
                  onClick={() => setDataMode('simulated')}
                  className={`p-2.5 rounded-lg border text-center transition-all ${
                    dataMode === 'simulated' 
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 font-bold' 
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  Simulated Stream
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Firebase & Backend Connection */}
        <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-slate-200">
            <Database className="w-4 h-4 text-blue-400" />
            <h4 className="font-semibold text-sm">Firebase RTDB Endpoint</h4>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Database Instance URL</label>
              <input 
                type="text"
                value={firebaseUrl}
                onChange={(e) => setFirebaseUrl(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-slate-300 font-mono focus:outline-none focus:border-blue-500 text-[11px]"
              />
            </div>

            <div className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-lg">
              <span className="text-slate-500 block text-[10px] font-mono uppercase">Node Path</span>
              <span className="text-emerald-400 font-mono text-xs">/telemetry.json</span>
            </div>
          </div>
        </div>

        {/* 3. Terminal & Logging Controls */}
        <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-slate-200">
            <Terminal className="w-4 h-4 text-purple-400" />
            <h4 className="font-semibold text-sm">Diagnostics & Logs</h4>
          </div>

          <div className="flex items-center justify-between text-xs py-1">
            <div>
              <p className="text-slate-200 font-medium">Real-time Terminal Streaming</p>
              <p className="text-slate-500 text-[11px]">Stream stdout/stderr logs into C-Engine Logs screen</p>
            </div>
            <input 
              type="checkbox"
              checked={enableLogs}
              onChange={(e) => setEnableLogs(e.target.checked)}
              className="w-4 h-4 accent-purple-500 cursor-pointer"
            />
          </div>
        </div>

        {/* 4. Automated Alert Rules */}
        <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-slate-200">
            <BellRing className="w-4 h-4 text-amber-400" />
            <h4 className="font-semibold text-sm">Alert Rules Engine</h4>
          </div>

          <div className="flex items-center justify-between text-xs py-1">
            <div>
              <p className="text-slate-200 font-medium">Auto-incident Logging</p>
              <p className="text-slate-500 text-[11px]">Automatically flag breaches when metrics cross bounds</p>
            </div>
            <input 
              type="checkbox"
              checked={autoAlerts}
              onChange={(e) => setAutoAlerts(e.target.checked)}
              className="w-4 h-4 accent-amber-500 cursor-pointer"
            />
          </div>
        </div>

      </div>

    </div>
  );
}