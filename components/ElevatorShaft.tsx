'use client';

/**
 * Main building visualization component
 * Displays the elevator shaft with all floors and elevators
 * Responsive design with proper accessibility
 * 
 * @author Tarang Shah
 * @version 1.0.0
 */

import { Elevator } from '@/types/elevator';
import { SYSTEM_CONFIG } from '@/lib/constants';
import { ElevatorCar } from './ui/ElevatorCar';
import { FloorCallButtons } from './ui/FloorCallButtons';

interface ElevatorShaftProps {
  elevators: Elevator[];
  onFloorCall: (floor: number, direction: 'up' | 'down') => void;
}

export function ElevatorShaft({ elevators, onFloorCall }: ElevatorShaftProps) {
  return (
    <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg border border-gray-200">
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-center text-gray-800 mb-2">
          Building Layout
        </h2>
        <p className="text-sm text-gray-600 text-center">
          {SYSTEM_CONFIG.BUILDING.FLOORS} floors • {SYSTEM_CONFIG.BUILDING.ELEVATOR_COUNT} elevators
        </p>
      </div>
      
      {/* Header - responsive grid */}
      <div className="grid grid-cols-6 gap-2 sm:gap-3 mb-4 pb-2 border-b border-gray-200">
        <div className="text-center font-semibold text-gray-700 text-sm">Floor</div>
        {elevators.map(elevator => (
          <div key={elevator.id} className="text-center font-semibold text-gray-700 text-xs sm:text-sm">
            E{elevator.id}
          </div>
        ))}
        <div className="text-center font-semibold text-gray-700 text-sm">Call</div>
      </div>

      {/* Floor rows - responsive spacing */}
      <div className="space-y-2 sm:space-y-3">
        {Array.from({ length: SYSTEM_CONFIG.BUILDING.FLOORS }, (_, i) => SYSTEM_CONFIG.BUILDING.FLOORS - i).map(floor => (
          <div key={floor} className="grid grid-cols-6 gap-2 sm:gap-3 items-center">
            <div className="text-center font-bold text-base sm:text-lg bg-gradient-to-r from-gray-100 to-gray-50 rounded-lg p-2 sm:p-3 border border-gray-200">
              {floor}
            </div>
            
            {elevators.map(elevator => (
              <div key={elevator.id} className="flex justify-center">
                <ElevatorCar 
                  elevator={elevator} 
                  isAtFloor={elevator.currentFloor === floor} 
                />
              </div>
            ))}
            
            <div className="flex justify-center">
              <FloorCallButtons floor={floor} onFloorCall={onFloorCall} />
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Legend:</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-300 rounded border"></div>
            <span>Idle</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded border"></div>
            <span>Moving</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-400 rounded border"></div>
            <span>Loading</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded border"></div>
            <span>Ready</span>
          </div>
        </div>
      </div>
    </div>
  );
}