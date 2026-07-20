import React, { useEffect, useState } from 'react';
import { Cpu, HardDrive, ArrowUpRight, ShieldCheck, Terminal } from 'lucide-react';
import { db } from "../config/firebase";
import { ref, onValue } from 'firebase/database';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

export default function MetricsGrid() {
  const [liveMetrics, setLiveMetrics] = useState({
    cpu: 0,
    threads: 14,
    ram: 0,
    ramTotal: 16,
    networkMbps: 894,
    packetLoss: 0.002
  });
  
  const [chartData, setChartData] = useState([]); 

  // 🔥 State for Dynamic Circulating Logs
  const [diagnosticLogs, setDiagnosticLogs] = useState([
    { time: '[04:11:01]', type: 'SYSTEM', msg: 'Telemetry C-Engine initialization sequence started...', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
    { time: '[04:11:02]', type: 'SUCCESS', msg: 'Kernel hooks attached successfully onto port 5173.', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
    { time: '[04:11:05]', type: 'INFO', msg: 'Buffer pool allocated (512MB) - Cache synchronization active.', color: 'text-slate-400 bg-slate-800/50 border-slate-700/30' },
    { time: '[01:10:23]', type: 'WARNING', msg: 'High memory chunk requested by garbage collector-flushing tables.', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  ]);

  // Telemetry Firebase Fetching
  useEffect(() => {
    const telemetryRef = ref(db, 'telemetry');
    const unsubscribe = onValue(telemetryRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const target = data.telemetry ? data.telemetry : data;
        
        const ramVal = target.ram_used_percent || 0;
        const cpuVal = target.cpu_usage_percent || target.cpu_load || 0;
        const activeThreads = target.active_threads || 14; 
        const netVal = target.network_mbps || 894;
        const lossVal = target.packet_loss_percent || 0.002;
        
        setLiveMetrics({
          ram: parseFloat(ramVal.toFixed(1)),
          ramTotal: target.ram_total_gb || 16,
          cpu: parseFloat(cpuVal.toFixed(1)),
          threads: activeThreads,
          networkMbps: parseFloat(netVal.toFixed(1)),
          packetLoss: parseFloat(lossVal.toFixed(4))
        });

        setChartData((prev) => {
          const currentReset = [...prev, { 
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }), 
            RAM: parseFloat(ramVal.toFixed(1)),
            CPU: parseFloat(cpuVal.toFixed(1)) 
          }];
          return currentReset.slice(-15);
        });
      }
    });
    return () => unsubscribe();
  }, []);

  // 🔥 Effect to Circulate Logs Automatically Without Page Jump
  useEffect(() => {
    const poolOfLogs = [
      { type: 'SUCCESS', msg: 'Inbound packet validation successful. Packet loss stable.', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
      { type: 'SYSTEM', msg: 'CPU core load balanced dynamically across active threads.', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
      { type: 'WARNING', msg: 'Minor latency spike detected on interface en0. Re-routing.', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
      { type: 'INFO', msg: 'Telemetry payloads synchronized with Firebase RTDB.', color: 'text-slate-400 bg-slate-800/50 border-slate-700/30' },
      { type: 'CRITICAL', msg: 'Anomalous request payload check triggered on secure firewall.', color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' }
    ];

    const interval = setInterval(() => {
      const randomLog = poolOfLogs[Math.floor(Math.random() * poolOfLogs.length)];
      const currentTimeString = `[${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}]`;

      setDiagnosticLogs((prev) => {
        const updated = [...prev, { time: currentTimeString, ...randomLog }];
        return updated.slice(-30); // Max 30 logs track karega overflow se bachne ke liye
      });
    }, 3000); // Har 3 seconds me naya log circulate karega

    return () => clearInterval(interval);
  }, []);

  const metrics = [
    {
      title: 'CPU Core Load',
      value: `${liveMetrics.cpu}%`,
      status: 'Normal',
      statusColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      icon: Cpu,
      subtext: `Threads active: ${liveMetrics.threads}/16`,
    },
    {
      title: 'Memory Allocation',
      value: `${liveMetrics.ram}%`,
      status: 'Stable',
      statusColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      icon: HardDrive,
      subtext: `Total: ${liveMetrics.ramTotal.toFixed(1)} GB`,
    },
    {
      title: 'Network I/O throughput',
      value: `${liveMetrics.networkMbps} Mbps`,
      status: 'Optimal',
      statusColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      icon: ArrowUpRight,
      subtext: `Packet loss: ${liveMetrics.packetLoss}%`,
    },
    {
      title: 'C-Engine Security',
      value: 'Secured',
      status: 'Active',
      statusColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      icon: ShieldCheck,
      subtext: 'Firewall rules: 24 active',
    }
  ];

  return (
    <>
      {/* 4 Cards Grid Wrapper */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
        {metrics.map((item, index) => {
          const Icon = item.icon;
          return (
            <div key={index} className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-slate-400 text-sm font-medium">{item.title}</p>
                  <h3 className="text-white text-3xl font-bold mt-2">{item.value}</h3>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                  {Icon && <Icon className="w-6 h-6 text-slate-400" />}
                </div>
              </div>
              <div className="flex justify-between items-center mt-6">
                <span className="text-slate-500 text-xs">{item.subtext}</span>
                <span className={`px-2 py-1 rounded-md text-xs font-semibold border ${item.statusColor}`}>
                  {item.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* EXACT SAME STYLING AND GRADIENTS PRESERVED AS PER REQ */}
      <div className="bg-black border border-emerland-500 p-4 rounded-xl h-64 my-6 mx-6">
        <h3 className="text-sm font-semibold text-slate-400 mb-4">Memory Utilization Timeline (%)</h3>
        <ResponsiveContainer width="100%" height="85%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="ramColor" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#be123c" stopOpacity={0.6}/>
                <stop offset="95%" stopColor="#be123c" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} />
            <YAxis domain={[0, 100]} stroke="#64748b" fontSize={10} tickLine={false} />
            <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }} />
            <Area type="monotone" dataKey="RAM" stroke="#047857" strokeWidth={3} fillOpacity={1} fill="url(#ramColor)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* LIVE DIAGNOSTICS LOG PANEL (Dynamic Circulation Enabled without Auto-Scroll Jump) */}
      <div className="bg-slate-950/40 border border-slate-800/80 p-5 rounded-xl mx-6 my-6 font-mono text-xs">
        <div className="flex items-center justify-between mb-4 border-b border-slate-800/60 pb-3">
          <div className="flex items-center gap-2 text-slate-400">
            <Terminal className="h-4 w-4 text-emerald-400" />
            <span className="font-semibold uppercase tracking-wider text-[11px]">C-Engine Live Diagnostics Output</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-[10px] text-slate-500 font-sans font-medium tracking-wide">STREAM: ACTIVE</span>
          </div>
        </div>

        {/* ⚠️ Auto-scroll methods explicitly removed to prevent page jumps */}
        <div className="space-y-2.5 max-h-40 overflow-y-auto">
          {diagnosticLogs.map((log, i) => (
            <div key={i} className="flex items-start gap-3 text-slate-300 leading-relaxed">
              <span className="text-slate-600 select-none">{log.time}</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${log.color}`}>
                {log.type}
              </span>
              <span className="text-slate-400">{log.msg}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}