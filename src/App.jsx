import React, { useState } from 'react';
import Sidebar from './components/Sidebar'; 
import MetricsGrid from './components/MetricsGrid'; 
import TerminalLogs from './components/TerminalLogs'; 
import CpuMetrics from './components/CpuMetrics';
import Alerts from './components/Alerts';
import Settings from './components/Settings';
import DatabaseView from './components/DatabaseView';

export default function App() {
  const [activeTab, setActiveTab] = useState('Dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'Dashboard':
        return <MetricsGrid />;
      case 'C-Engine Logs':
        return <TerminalLogs />;
      case 'CPU Metrics':
        return <CpuMetrics/> ;

      case 'Alerts':
      return <Alerts/> ;  

      case 'Settings':
        return <Settings/> ;
       
       case 'Database':
        return <DatabaseView/> ;
      default:
        return <MetricsGrid />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#000000] text-white font-sans antialiased select-none">
      {/* Sidebar Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Panel Box */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto">
        
        {/* 🔥 RESTORED HEADER SECTION (System Monitor + Connected Banner) */}
        <header className="flex items-center justify-between px-6 pt-8 pb-2">
          <div>
            <h2 className="text-white text-3xl font-bold tracking-tight">System Monitor</h2>
            <p className="text-slate-400 text-sm mt-1 font-medium">
              Real-time health and connection metrics from the C-engine
            </p>
          </div>
          
          {/* Status Capsule Indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/40 border border-slate-800 rounded-lg">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-semibold text-slate-300 tracking-wide">
              Connected to localhost
            </span>
          </div>
        </header>

        {/* Dynamic Route Content Viewer */}
        <main className="flex-1">
          {renderContent()}
        </main>

      </div>
    </div>
  );
}