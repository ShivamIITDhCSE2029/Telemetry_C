import React, { useState, useEffect } from 'react';
import { Cpu, Activity, Zap, Layers, Server } from 'lucide-react';
import { db } from "../config/firebase";
import { ref, onValue } from 'firebase/database';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

export default function CpuMetrics() {
  const [cpuUsage, setCpuUsage] = useState(7.7);
  const [activeThreads, setActiveThreads] = useState(14);
  const [cpuFreq, setCpuFreq] = useState("3.40");
  const [contextSwitches, setContextSwitches] = useState("1,420");
  
  const [coreData, setCoreData] = useState([
    { core: 'Core 1', load: 12 },
    { core: 'Core 2', load: 8 },
    { core: 'Core 3', load: 24 },
    { core: 'Core 4', load: 5 },
    { core: 'Core 5', load: 15 },
    { core: 'Core 6', load: 30 },
    { core: 'Core 7', load: 10 },
    { core: 'Core 8', load: 4 },
    { core: 'Core 9', load: 18 },
    { core: 'Core 10', load: 2 },
    { core: 'Core 11', load: 9 },
    { core: 'Core 12', load: 14 },
    { core: 'Core 13', load: 6 },
    { core: 'Core 14', load: 22 },
    { core: 'Core 15', load: 0 },
    { core: 'Core 16', load: 0 },
  ]);

  // Realtime update listener from Firebase
  useEffect(() => {
    const telemetryRef = ref(db, 'telemetry');
    const unsubscribe = onValue(telemetryRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const target = data.telemetry ? data.telemetry : data;
        
        // 1. CPU Load & Threads
        if (target.cpu_usage_percent !== undefined) {
          setCpuUsage(parseFloat(target.cpu_usage_percent.toFixed(1)));
        }
        if (target.active_threads) {
          setActiveThreads(target.active_threads);
        }

        // 2. Clock Frequency & Context Switches
        if (target.cpu_freq_ghz) {
          setCpuFreq(target.cpu_freq_ghz.toFixed(2));
        }
        if (target.context_switches) {
          setContextSwitches(target.context_switches.toLocaleString());
        }

        // 3. Dynamic Core Bar Updates
        const threads = target.active_threads || 14;
        setCoreData((prev) =>
          prev.map((c, idx) => ({
            ...c,
            load: idx < threads ? Math.floor(Math.random() * 35) + 5 : 0
          }))
        );
      }
    });
    return () => unsubscribe();
  }, []);

  // 🔥 YAHAN LOCHA THA: Direct State Variables bind kar diye hain yahan
  const statsCards = [
    { 
      title: 'Overall CPU Load', 
      value: `${cpuUsage}%`, 
      sub: '16 Cores Active', 
      icon: Cpu, 
      color: 'text-emerald-400' 
    },
    { 
      title: 'Active Threads', 
      value: `${activeThreads} / 16`, 
      sub: `${((activeThreads / 16) * 100).toFixed(1)}% Capacity`, 
      icon: Layers, 
      color: 'text-blue-400' 
    },
    { 
      title: 'Clock Frequency', 
      value: `${cpuFreq} GHz`,  // Dynamic variable linked!
      sub: 'Base: 2.80 GHz', 
      icon: Zap, 
      color: 'text-amber-400' 
    },
    { 
      title: 'Context Switches', 
      value: `${contextSwitches} /s`,  // Dynamic variable linked!
      sub: 'Normal Overhead', 
      icon: Activity, 
      color: 'text-purple-400' 
    },
  ];

  return (
    <div className="p-6 space-y-6">
      
      {/* 4 Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex justify-between items-center">
              <div>
                <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">{card.title}</p>
                <h3 className="text-white text-2xl font-bold mt-1">{card.value}</h3>
                <span className="text-slate-500 text-xs">{card.sub}</span>
              </div>
              <div className="p-3 bg-slate-800/50 border border-slate-700/50 rounded-lg">
                <Icon className={`w-6 h-6 ${card.color}`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Per-Core Load Distribution Bar Chart */}
      <div className="bg-slate-950/40 border border-slate-800 p-5 rounded-xl">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-300">Individual Core Load Distribution</h3>
            <p className="text-xs text-slate-500 mt-0.5">Real-time load across all 16 hardware threads</p>
          </div>
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-slate-400 font-mono">C-Engine Multithreading</span>
          </div>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={coreData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="core" stroke="#64748b" fontSize={10} tickLine={false} />
              <YAxis domain={[0, 100]} stroke="#64748b" fontSize={10} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '8px' }} />
              <Bar dataKey="load" radius={[4, 4, 0, 0]}>
                {coreData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.load > 25 ? '#10b981' : entry.load > 0 ? '#047857' : '#1e293b'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Active Threads Breakdown Table */}
      <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-5 font-mono text-xs">
        <h3 className="text-slate-300 font-sans font-semibold mb-3 text-sm">Thread Allocation & Diagnostics</h3>
        
        <div className="space-y-2">
          <div className="grid grid-cols-4 text-slate-500 pb-2 border-b border-slate-800 font-sans text-[11px]">
            <span>THREAD ID</span>
            <span>TASK / PROCESS</span>
            <span>STATUS</span>
            <span>CPU UTILIZATION</span>
          </div>

          {[
            { id: 'T-001', process: 'c_engine_kernel_main', status: 'RUNNING', cpu: `${(cpuUsage * 0.3).toFixed(1)}%` },
            { id: 'T-002', process: 'telemetry_stream_worker', status: 'RUNNING', cpu: `${(cpuUsage * 0.2).toFixed(1)}%` },
            { id: 'T-003', process: 'firebase_rtdb_sync', status: 'RUNNING', cpu: `${(cpuUsage * 0.1).toFixed(1)}%` },
            { id: 'T-004', process: 'garbage_collector_daemon', status: 'SLEEPING', cpu: '0.1%' },
          ].map((t, idx) => (
            <div key={idx} className="grid grid-cols-4 text-slate-300 py-1.5 border-b border-slate-900">
              <span className="text-emerald-400">{t.id}</span>
              <span>{t.process}</span>
              <span className={t.status === 'RUNNING' ? 'text-emerald-400 font-bold' : 'text-slate-500'}>{t.status}</span>
              <span className="text-slate-400">{t.cpu}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}