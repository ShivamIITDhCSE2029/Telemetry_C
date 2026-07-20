import React, { useState, useEffect } from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle2, Sliders, Bell, XCircle } from 'lucide-react';
import { db } from "../config/firebase";
import { ref, onValue } from 'firebase/database';

export default function Alerts() {
  // Threshold Settings State
  const [cpuThreshold, setCpuThreshold] = useState(80);
  const [ramThreshold, setRamThreshold] = useState(85);
  
  // Realtime Live Data State
  const [liveCpu, setLiveCpu] = useState(0);
  const [liveRam, setLiveRam] = useState(0);

  // Dynamic Alerts List State
  const [alerts, setAlerts] = useState([
    { id: 'ALT-101', type: 'RESOLVED', metric: 'Network Latency', message: 'Network throughput dropped below 500Mbps', time: '10 mins ago' },
    { id: 'ALT-102', type: 'WARNING', metric: 'Context Switches', message: 'High thread contention detected (>2,000 /s)', time: '2 mins ago' },
  ]);

  // Firebase Realtime Monitoring for Threshold Breaches
  useEffect(() => {
    const telemetryRef = ref(db, 'telemetry');
    const unsubscribe = onValue(telemetryRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const target = data.telemetry ? data.telemetry : data;

        const currentCpu = target.cpu_usage_percent || 0;
        const currentRam = target.ram_used_percent || 0;

        setLiveCpu(currentCpu);
        setLiveRam(currentRam);

        // Auto-Trigger Live Alert if Threshold Breached
        if (currentCpu > cpuThreshold) {
          const newAlert = {
            id: `ALT-${Math.floor(100 + Math.random() * 900)}`,
            type: 'CRITICAL',
            metric: 'CPU Spike',
            message: `Kernel CPU Load breached ${cpuThreshold}% threshold (Current: ${currentCpu.toFixed(1)}%)`,
            time: 'Just now'
          };

          setAlerts(prev => {
            if (prev[0]?.metric !== 'CPU Spike' || prev[0]?.type !== 'CRITICAL') {
              return [newAlert, ...prev];
            }
            return prev;
          });
        }
      }
    });
    return () => unsubscribe();
  }, [cpuThreshold]);

  const dismissAlert = (id) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  const criticalCount = alerts.filter(a => a.type === 'CRITICAL').length;
  const warningCount = alerts.filter(a => a.type === 'WARNING').length;

  return (
    <div className="p-6 space-y-6">

      {/* Summary Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Critical System Incidents</p>
            <h3 className="text-rose-400 text-2xl font-bold mt-1">{criticalCount} Active</h3>
          </div>
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Warnings & Thresholds</p>
            <h3 className="text-amber-400 text-2xl font-bold mt-1">{warningCount} Pending</h3>
          </div>
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Engine Health Score</p>
            <h3 className="text-emerald-400 text-2xl font-bold mt-1">
              {criticalCount > 0 ? '78% Degraded' : '98% Optimal'}
            </h3>
          </div>
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Realtime Threshold Rules Configurator */}
      <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Sliders className="w-4 h-4 text-emerald-400" />
          <h3 className="text-slate-200 font-semibold text-sm">Dynamic Alert Threshold Rules</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          {/* CPU Slider */}
          <div className="space-y-2 bg-slate-900/40 border border-slate-800/80 p-4 rounded-lg">
            <div className="flex justify-between text-slate-300">
              <span>CPU Max Load Threshold</span>
              <span className="text-emerald-400 font-mono font-bold">{cpuThreshold}%</span>
            </div>
            <input 
              type="range" 
              min="10" 
              max="95" 
              value={cpuThreshold} 
              onChange={(e) => setCpuThreshold(Number(e.target.value))}
              className="w-full accent-emerald-500 bg-slate-800 rounded-lg cursor-pointer h-2"
            />
            <p className="text-slate-500 text-[11px]">Current Engine CPU: <span className="text-slate-300">{liveCpu.toFixed(1)}%</span></p>
          </div>

          {/* RAM Slider */}
          <div className="space-y-2 bg-slate-900/40 border border-slate-800/80 p-4 rounded-lg">
            <div className="flex justify-between text-slate-300">
              <span>RAM Used Threshold</span>
              <span className="text-blue-400 font-mono font-bold">{ramThreshold}%</span>
            </div>
            <input 
              type="range" 
              min="30" 
              max="98" 
              value={ramThreshold} 
              onChange={(e) => setRamThreshold(Number(e.target.value))}
              className="w-full accent-blue-500 bg-slate-800 rounded-lg cursor-pointer h-2"
            />
            <p className="text-slate-500 text-[11px]">Current System RAM: <span className="text-slate-300">{liveRam.toFixed(1)}%</span></p>
          </div>
        </div>
      </div>

      {/* Live Incident Log Table */}
      <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-purple-400" />
            <h3 className="text-slate-200 font-semibold text-sm">System Incidents & Audit Log</h3>
          </div>
          <span className="text-slate-500 text-xs font-mono">{alerts.length} Total Logged Events</span>
        </div>

        <div className="space-y-3 font-mono text-xs">
          {alerts.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              No active alerts. System running smoothly! 🎉
            </div>
          ) : (
            alerts.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-slate-900/60 border border-slate-800/60 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    item.type === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                    item.type === 'WARNING' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                    'bg-slate-800 text-slate-400'
                  }`}>
                    {item.type}
                  </span>
                  <div>
                    <p className="text-slate-200 font-sans font-medium">{item.metric} - <span className="text-slate-400 text-xs font-mono">{item.message}</span></p>
                    <p className="text-slate-500 text-[10px] mt-0.5">{item.id} • {item.time}</p>
                  </div>
                </div>

                <button 
                  onClick={() => dismissAlert(item.id)}
                  className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                  title="Dismiss Event"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}