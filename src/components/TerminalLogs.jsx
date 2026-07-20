import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Shield, RefreshCw, AlertTriangle } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
export default function TerminalLogs() {
  const [logs, setLogs] = useState([
    { time: '04:11:01', type: 'SYSTEM', msg: 'Telemetry C-Engine initialization sequence started...' },
    { time: '04:11:02', type: 'SUCCESS', msg: 'Kernel hooks attached successfully onto port 5173.' },
    { time: '04:11:05', type: 'INFO', msg: 'Buffer pool allocated (512MB) - Cache synchronization active.' }
  ]);
  
  const terminalEndRef = useRef(null);

  // Realtime loop to inject random backend logs dynamically
  useEffect(() => {
    const logPool = [
      { type: 'SYSTEM', msg: 'CPU core load balanced dynamically across threads [14/16].' },
      { type: 'SUCCESS', msg: 'Inbound packet validation successful. Packet loss: 0.002%.' },
      { type: 'INFO', msg: 'Database handshake renewed. Query throughput stable at 2400ms.' },
      { type: 'WARNING', msg: 'High memory chunk requested by garbage collector—flushing tables.' },
      { type: 'CRITICAL', msg: 'Anomalous request payload detected from secure firewall node!' }
    ];

    const interval = setInterval(() => {
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];
      const randomLog = logPool[Math.floor(Math.random() * logPool.length)];
      
      setLogs(prev => [...prev, { time: timeStr, ...randomLog }].slice(-50)); // Keep last 50 logs
    }, 2800);

    return () => clearInterval(interval);
  }, []);

  // Auto scroll to bottom when new log appends
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
<>
    

    
    <div className="border border-slate-800 bg-slate-900/60 rounded-2xl p-5 flex flex-col h-[350px] shadow-2xl relative overflow-hidden backdrop-blur-md">
      
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-emerald-400" />
          <h2 className="text-xs font-bold text-white tracking-wider uppercase font-mono">
            C-Engine Live Diagnostics Output
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">Stream: Active</span>
        </div>
      </div>

      {/* Terminal Screen Area */}
      <div className="flex-1 overflow-y-auto font-mono text-xs space-y-2 pr-2 scrollbar-thin scrollbar-thumb-slate-800">
        {logs.map((log, index) => {
          let color = 'text-slate-400';
          if (log.type === 'SUCCESS') color = 'text-emerald-400 font-medium';
          if (log.type === 'WARNING') color = 'text-amber-400';
          if (log.type === 'CRITICAL') color = 'text-rose-500 font-bold animate-pulse';
          if (log.type === 'SYSTEM') color = 'text-cyan-400';

          return (
            <div key={index} className="flex items-start gap-3 border-b border-slate-950/20 py-0.5 hover:bg-slate-800/20 px-1 rounded transition-colors">
              <span className="text-slate-600 select-none">[{log.time}]</span>
              <span className={`uppercase font-bold text-[10px] tracking-wider px-1.5 py-0.2 rounded bg-slate-950/40 border border-slate-800/40 min-w-[70px] text-center ${color}`}>
                {log.type}
              </span>
              <span className="text-slate-300 flex-1">{log.msg}</span>
            </div>
          );
        })}
        <div ref={terminalEndRef} />
      </div>

    </div>

</>
  );
}