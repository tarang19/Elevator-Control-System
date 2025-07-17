'use client';

/**
 * System activity log component
 * Displays real-time system events with filtering and formatting
 * Implements proper scrolling and performance optimization
 * 
 * @author Tarang Shah
 * @version 1.0.0
 */

import { LogEntry } from '@/types/elevator';
import { LOG_TYPES } from '@/lib/constants';
import { useState, useMemo, useEffect } from 'react';

interface ActivityLogProps {
  logs: LogEntry[];
}

function ClientTime({ timestamp }: { timestamp: number }) {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    setTime(new Date(timestamp).toLocaleTimeString());
  }, [timestamp]);

  if (!time) return null; // Or a placeholder

  return <span className="text-xs text-gray-500 font-mono">{time}</span>;
}

export function ActivityLog({ logs }: ActivityLogProps) {
  const [filterType, setFilterType] = useState<string>('all');

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const getLogColor = (type: LogEntry['type']) => {
    switch (type) {
      case LOG_TYPES.CALL: return 'text-blue-600 bg-blue-50 border-blue-200';
      case LOG_TYPES.PICKUP: return 'text-green-600 bg-green-50 border-green-200';
      case LOG_TYPES.DROPOFF: return 'text-purple-600 bg-purple-50 border-purple-200';
      case LOG_TYPES.MOVEMENT: return 'text-gray-600 bg-gray-50 border-gray-200';
      case LOG_TYPES.SYSTEM: return 'text-orange-600 bg-orange-50 border-orange-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getLogIcon = (type: LogEntry['type']) => {
    switch (type) {
      case LOG_TYPES.CALL: return '📞';
      case LOG_TYPES.PICKUP: return '🚪';
      case LOG_TYPES.DROPOFF: return '🚶';
      case LOG_TYPES.MOVEMENT: return '🔄';
      case LOG_TYPES.SYSTEM: return '⚙️';
      default: return '•';
    }
  };

  const filteredLogs = useMemo(() => {
    if (filterType === 'all') return logs;
    return logs.filter(log => log.type === filterType);
  }, [logs, filterType]);

  const logTypes = [
    { value: 'all', label: 'All Events', count: logs.length },
    { value: LOG_TYPES.CALL, label: 'Calls', count: logs.filter(l => l.type === LOG_TYPES.CALL).length },
    { value: LOG_TYPES.MOVEMENT, label: 'Movement', count: logs.filter(l => l.type === LOG_TYPES.MOVEMENT).length },
    { value: LOG_TYPES.PICKUP, label: 'Pickups', count: logs.filter(l => l.type === LOG_TYPES.PICKUP).length },
    { value: LOG_TYPES.DROPOFF, label: 'Dropoffs', count: logs.filter(l => l.type === LOG_TYPES.DROPOFF).length },
    { value: LOG_TYPES.SYSTEM, label: 'System', count: logs.filter(l => l.type === LOG_TYPES.SYSTEM).length },
  ];

  return (
    <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg border border-gray-200">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">System Activity Log</h2>
        
        <div className="flex flex-wrap gap-2">
          {logTypes.map(type => (
            <button
              key={type.value}
              onClick={() => setFilterType(type.value)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                filterType === type.value
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {type.label} ({type.count})
            </button>
          ))}
        </div>
      </div>
      
      <div className="h-64 sm:h-96 overflow-y-auto space-y-2 bg-gray-50 rounded-lg p-4 border border-gray-200">
        {filteredLogs.slice().reverse().map(log => (
          <div key={log.id} className={`border-l-4 pl-4 py-2 bg-white rounded-r-lg shadow-sm border ${getLogColor(log.type)}`}>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-lg">{getLogIcon(log.type)}</span>
              <ClientTime timestamp={log.timestamp} />
              {log.elevatorId && (
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-medium">
                  Elevator {log.elevatorId}
                </span>
              )}
              {log.floor && (
                <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded font-medium">
                  Floor {log.floor}
                </span>
              )}
            </div>
            <p className={`text-sm ${getLogColor(log.type).split(' ')[0]} leading-relaxed`}>
              {log.message}
            </p>
          </div>
        ))}
        
        {filteredLogs.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <div className="text-4xl mb-2">📝</div>
            <p className="text-lg font-medium mb-1">No activity logged yet</p>
            <p className="text-sm">Start the simulation or generate calls to see system activity</p>
          </div>
        )}
      </div>
    </div>
  );
}