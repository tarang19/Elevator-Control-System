'use client';

/**
 * Main application page component
 * Orchestrates the entire elevator control system UI
 * Implements responsive design and proper error handling
 * 
 * @author Tarang Shah
 * @version 1.0.0
 */

import { useElevatorSystem } from '@/hooks/useElevatorSystem';
import { ElevatorShaft } from '@/components/ElevatorShaft';
import { ElevatorStatus } from '@/components/ElevatorStatus';
import { ActivityLog } from '@/components/ActivityLog';
import { ControlPanel } from '@/components/ControlPanel';
import { SYSTEM_CONFIG } from '@/lib/constants';

export default function Home() {
  const {
    elevators,
    pendingCalls,
    logs,
    isSimulationRunning,
    error,
    handleFloorCall,
    generateRandomCall,
    toggleSimulation,
    clearLogs,
    getSystemMetrics,
  } = useElevatorSystem();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 p-2 sm:p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="text-center mb-6 sm:mb-8 bg-white rounded-xl p-4 sm:p-6 shadow-lg border border-gray-200">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            🏢 Elevator Control System
          </h1>
          <p className="text-gray-600 text-base sm:text-lg mb-2">
            {SYSTEM_CONFIG.BUILDING.FLOORS}-floor building with {SYSTEM_CONFIG.BUILDING.ELEVATOR_COUNT} elevators • Real-time simulation
          </p>
          <p className="text-xs sm:text-sm text-gray-500">
            Movement: {SYSTEM_CONFIG.TIMING.MOVE_DURATION_MS / 1000}s per floor • Loading: {SYSTEM_CONFIG.TIMING.LOADING_DURATION_MS / 1000}s per stop
          </p>
          
          {/* Status Indicator */}
          <div className="mt-4 flex justify-center">
            <div className={`px-4 py-2 rounded-full text-sm font-medium ${
              isSimulationRunning 
                ? 'bg-green-100 text-green-800 border border-green-200' 
                : 'bg-gray-100 text-gray-800 border border-gray-200'
            }`}>
              {isSimulationRunning ? '🟢 Simulation Running' : '⏸️ Simulation Stopped'}
            </div>
          </div>
        </header>

        {/* Main Content Grid */}
        <div className="space-y-6">
          {/* Top Row - Building and Status */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <ElevatorShaft elevators={elevators} onFloorCall={handleFloorCall} />
            <ElevatorStatus elevators={elevators} />
          </div>

          {/* Bottom Row - Controls and Logs */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <ControlPanel
              isSimulationRunning={isSimulationRunning}
              pendingCalls={pendingCalls}
              onToggleSimulation={toggleSimulation}
              onGenerateCall={generateRandomCall}
              onClearLogs={clearLogs}
              getSystemMetrics={getSystemMetrics}
              error={error}
            />
            <ActivityLog logs={logs} />
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center text-xs text-gray-500 bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <p>
            Elementary Elevator Control System • Built with Next.js & TypeScript • 
            Production-ready architecture with clean code principles
          </p>
          <p className="mt-1">
            Implements up/down algorithm with intelligent dispatch • Real-time console logging • Responsive design
          </p>
        </footer>
      </div>
    </div>
  );
}