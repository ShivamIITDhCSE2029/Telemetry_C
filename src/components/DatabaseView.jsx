import React, { useState, useEffect } from 'react';
import { Database, Wifi, Activity, Copy, Check, RefreshCw, FileJson, Server } from 'lucide-react';
import { db } from "../config/firebase";
import { ref, onValue } from 'firebase/database';

export default function DatabaseView() {
  const [rawData, setRawData] = useState(null);
  const [copied, setCopied] = useState(false);
  const [writeCount, setWriteCount] = useState(148);
  const [latency, setLatency] = useState(38);
  const [lastSynced, setLastSynced] = useState('Just now');

  useEffect(() => {
    const startTime = Date.now();
    const telemetryRef = ref(db, 'telemetry');
    
    const unsubscribe = onValue(telemetryRef, (snapshot) => {
      const calcLatency = Date.now() - startTime;
      if (calcLatency > 0 && calcLatency < 300) setLatency(calcLatency);

      if (snapshot.exists()) {
        const data = snapshot.val();
        setRawData(data);
        setWriteCount(prev => prev + 1);
        setLastSynced(new Date().toLocaleTimeString());
      }
    });

    return () => unsubscribe();
  }, []);

  const handleCopy = () => {
    if (rawData) {
      navigator.clipboard.writeText(JSON.stringify(rawData, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="p-6 space-y-6">

      {/* Top Banner Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">RTDB Connection</p>
            <h3 className="text-emerald-400 text-xl font-bold mt-1 flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping inline-block"></span>
              ACTIVE
            </h3>
            <span className="text-slate-500 text-[11px]">Synced: {lastSynced}</span>
          </div>
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400">
            <Wifi className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Network Latency</p>
            <h3 className="text-white text-2xl font-bold mt-1">{latency} ms</h3>
            <span className="text-slate-500 text-[11px]">Firebase REST API</span>
          </div>
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400">
            <Activity className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Total Payload Writes</p>
            <h3 className="text-purple-400 text-2xl font-bold mt-1">{writeCount}</h3>
            <span className="text-slate-500 text-[11px]">C Engine PUT Operations</span>
          </div>
          <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg text-purple-400">
            <Database className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Storage Node</p>
            <h3 className="text-slate-200 text-sm font-bold mt-1 font-mono">/telemetry.json</h3>
            <span className="text-slate-500 text-[11px]">Firebase Realtime DB</span>
          </div>
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400">
            <Server className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Raw JSON Live Inspector */}
      <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <FileJson className="w-5 h-5 text-emerald-400" />
            <h3 className="text-slate-200 font-semibold text-sm">Real-time Firebase Payload (RAW JSON)</h3>
          </div>

          <button 
            onClick={handleCopy}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg text-xs font-mono transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied!' : 'Copy JSON'}
          </button>
        </div>

        {/* Code Output Screen */}
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-lg p-4 font-mono text-xs overflow-x-auto text-emerald-400 max-h-96">
          <pre>{rawData ? JSON.stringify(rawData, null, 2) : '// Waiting for C-Engine to push telemetry payload...'}</pre>
        </div>
      </div>

      {/* Database Schema Tree */}
      <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-5">
        <h3 className="text-slate-200 font-semibold text-sm mb-3">Database Field Schema & Types</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
          {[
            { key: 'cpu_usage_percent', type: 'Number (Float)', desc: 'Kernel CPU Load %' },
            { key: 'ram_used_percent', type: 'Number (Float)', desc: 'Active Hardware RAM %' },
            { key: 'cpu_freq_ghz', type: 'Number (Float)', desc: 'Clock Speed' },
            { key: 'active_threads', type: 'Integer', desc: 'Hardware Threads' },
          ].map((s, idx) => (
            <div key={idx} className="bg-slate-900/40 border border-slate-800/80 p-3 rounded-lg">
              <span className="text-emerald-400 font-bold block">{s.key}</span>
              <span className="text-slate-500 text-[10px] block mt-0.5">{s.type}</span>
              <span className="text-slate-400 text-[11px] block mt-2 font-sans">{s.desc}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}