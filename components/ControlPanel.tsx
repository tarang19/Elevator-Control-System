'use client';

/**
 * System control panel component
 * Provides controls for simulation and system management
 * Includes system metrics and status information
 * 
 * @author Tarang Shah
 * @version 1.0.0
 */

import { FloorCall } from '@/types/elevator';
import { useState, useEffect } from 'react';

interface ControlPanelProps {
  isSimulationRunning: boolean;
  pendingCalls: FloorCall[];
  onToggleSimulation: () => void;
  onGenerateCall: () => void;
  onClearLogs: () => void;
  getSystemMetrics?: () => any;
  error?: string | null;
}

export function ControlPanel({
  isSimulationRunning,
  pendingCalls,
  onToggleSimulation,
  onGenerateCall,
  onClearLogs,
  getSystemMetrics,
  error,
}: ControlPanelProps) {
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    if (getSystemMetrics) {
      const interval = setInterval(() => {
        setMetrics(getSystemMetrics());
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [getSystemMetrics]);

  const formatUptime = (uptime: number) => {
    const seconds = Math.floor(uptime / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  return (
    <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg border border-gray-200">
      <h2 className="text-xl sm:text-2xl font-bold mb-6 text-gray-800">System Control Panel</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm font-medium">⚠️ {error}</p>
        </div>
      )}
      
      <div className="space-y-6">
        {/* Control Buttons */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={onToggleSimulation}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-sm hover:shadow-md active:scale-95 ${
              isSimulationRunning
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-emerald-500 hover:bg-emerald-600 text-white'
            }`}
            aria-label={isSimulationRunning ? 'Stop simulation' : 'Start simulation'}
          >
            {isSimulationRunning ? '⏹️ Stop Simulation' : '▶️ Start Simulation'}
          </button>
          
          <button
            onClick={onGenerateCall}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-all duration-200 shadow-sm hover:shadow-md active:scale-95"
            aria-label="Generate random elevator call"
          >
            🎲 Generate Random Call
          </button>
          
          <button
            onClick={onClearLogs}
            className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-semibold transition-all duration-200 shadow-sm hover:shadow-md active:scale-95"
            aria-label="Clear system logs"
          >
            🗑️ Clear Logs
          </button>
        </div>

        {/* System Metrics */}
        {metrics && (
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="font-semibold mb-3 text-gray-800">System Metrics</h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-sm">
              <div className="bg-white p-2 rounded border text-center">
                <div className="font-medium text-gray-600">Uptime</div>
                <div className="text-lg font-bold text-blue-600">{formatUptime(metrics.uptime)}</div>
              </div>
              <div className="bg-white p-2 rounded border text-center">
                <div className="font-medium text-gray-600">Calls Processed</div>
                <div className="text-lg font-bold text-green-600">{metrics.totalCallsProcessed}</div>
              </div>
              <div className="bg-white p-2 rounded border text-center">
                <div className="font-medium text-gray-600">Pending</div>
                <div className="text-lg font-bold text-orange-600">{metrics.pendingCalls}</div>
              </div>
              <div className="bg-white p-2 rounded border text-center">
                <div className="font-medium text-gray-600">Active</div>
                <div className="text-lg font-bold text-purple-600">{metrics.activeElevators}</div>
              </div>
              <div className="bg-white p-2 rounded border text-center">
                <div className="font-medium text-gray-600">Idle</div>
                <div className="text-lg font-bold text-gray-600">{metrics.idleElevators}</div>
              </div>
            </div>
          </div>
        )}
        
        {/* Pending Calls */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h3 className="font-semibold mb-3 text-gray-800">Pending Floor Calls</h3>
          {pendingCalls.length === 0 ? (
            <div className="text-center py-4">
              <div className="text-2xl mb-2">✅</div>
              <p className="text-gray-500 text-sm italic">No pending calls</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {pendingCalls.map((call) => (
                <div key={call.id} className="flex items-center gap-2 text-sm bg-white p-2 rounded border shadow-sm">
                  <span className="font-medium text-gray-800">Floor {call.floor}</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    call.direction === 'up' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {call.direction === 'up' ? '↑ UP' : '↓ DOWN'}
                  </span>
                  {call.assignedElevator && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-medium">
                      → Elevator {call.assignedElevator}
                    </span>
                  )}
                  <span className="text-xs text-gray-500 ml-auto">
                    {new Date(call.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}