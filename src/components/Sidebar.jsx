import React, { useState } from 'react';
import { 
  Activity, 
  LayoutDashboard, 
  Cpu, 
  Terminal, 
  Settings, 
  ShieldAlert,
  Database,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'C-Engine Logs', icon: Terminal },
    { name: 'CPU Metrics', icon: Cpu },
    { name: 'Database', icon: Database },
    { name: 'Alerts', icon: ShieldAlert },
    { name: 'Settings', icon: Settings },
  ];

  return (
    <aside 
      className={`${
        collapsed ? 'w-20' : 'w-64'
      } h-screen bg-[#000000] border-r border-slate-800 flex flex-col justify-between p-4 transition-all duration-300 relative shrink-0`}
    >
      {/* 🟢 Toggle Button: Border par sleek overlay */}
      <button 
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-7 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white p-1 rounded-full transition-colors z-50 cursor-pointer shadow-lg"
        title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
      >
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>

      <div className="space-y-6">
        {/* Brand Header */}
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'} px-2 py-3 transition-all`}>
          <Activity className="h-8 w-8 text-emerald-400 animate-pulse shrink-0" />
          {!collapsed && (
            <div className="overflow-hidden">
              <h1 className="font-bold text-lg text-white leading-none">TelemetryC</h1>
              <span className="text-xs text-slate-500 font-medium tracking-wider">v1.0.0 (Beta)</span>
            </div>
          )}
        </div>

        {/* Menu Items */}
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.name;
            return (
              <button
                key={item.name}
                onClick={() => setActiveTab(item.name)}
                title={collapsed ? item.name : ''}
                className={`w-full flex items-center ${
                  collapsed ? 'justify-center px-0' : 'gap-3 px-4'
                } py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  isActive 
                    ? 'bg-emerald-500/10 text-[#10b981] border border-emerald-500/20' 
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent'
                }`}
              >
                {/* Dynamic Icon Highlighter */}
                <Icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-[#10b981]' : 'text-slate-400'}`} />
                {!collapsed && <span className="truncate">{item.name}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Status */}
      <div className={`bg-slate-950/60 border border-slate-800/60 rounded-xl p-3 flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
        <div className="flex items-center gap-2">
          {/* Engine Active Dot matching the custom mint color */}
          <span className="h-2 w-2 rounded-full bg-[#10b981] relative flex shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10b981] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10b981]"></span>
          </span>
          {!collapsed && <span className="text-xs font-semibold text-slate-400">ENGINE ACTIVE</span>}
        </div>
        {!collapsed && <span className="text-[10px] text-slate-600 font-mono">PORT 5173</span>}
      </div>
    </aside>
  );
}