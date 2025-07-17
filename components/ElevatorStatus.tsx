'use client';

/**
 * Elevator status dashboard component
 * Displays detailed information about each elevator
 * Responsive design with proper status indicators
 * 
 * @author Tarang Shah
 * @version 1.0.0
 */

import { Elevator } from '@/types/elevator';
import { ELEVATOR_STATES } from '@/lib/constants';

interface ElevatorStatusProps {
  elevators: Elevator[];
}

export function ElevatorStatus({ elevators }: ElevatorStatusProps) {
  const getStatusText = (elevator: Elevator) => {
    if (elevator.isLoading) return 'Loading passengers';
    if (elevator.isMoving) return `Moving ${elevator.direction === ELEVATOR_STATES.MOVING_UP ? 'up' : 'down'}`;
    if (elevator.direction === ELEVATOR_STATES.IDLE) return 'Idle';
    return `Ready to go ${elevator.direction}`;
  };

  const getStatusColor = (elevator: Elevator) => {
    if (elevator.isLoading) return 'text-yellow-600 bg-yellow-50';
    if (elevator.isMoving) return 'text-blue-600 bg-blue-50';
    if (elevator.direction === ELEVATOR_STATES.IDLE) return 'text-gray-600 bg-gray-50';
    return 'text-green-600 bg-green-50';
  };

  const getStatusIcon = (elevator: Elevator) => {
    if (elevator.isLoading) return '⏳';
    if (elevator.isMoving) return elevator.direction === ELEVATOR_STATES.MOVING_UP ? '⬆️' : '⬇️';
    if (elevator.direction === ELEVATOR_STATES.IDLE) return '⏸️';
    return '✅';
  };

  return (
    <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg border border-gray-200">
      <h2 className="text-xl sm:text-2xl font-bold mb-6 text-gray-800">Elevator Status</h2>
      
      <div className="space-y-4">
        {elevators.map(elevator => (
          <div key={elevator.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 gap-2">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <span className="text-2xl">{getStatusIcon(elevator)}</span>
                Elevator {elevator.id}
              </h3>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(elevator)} border`}>
                {getStatusText(elevator)}
              </span>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              <div className="bg-white p-2 rounded border">
                <span className="font-medium text-gray-800 block">Floor</span>
                <span className="text-lg font-bold text-blue-600">{elevator.currentFloor}</span>
              </div>
              
              <div className="bg-white p-2 rounded border">
                <span className="font-medium text-gray-800 block">Direction</span>
                <span className="capitalize text-gray-600">{elevator.direction}</span>
              </div>
              
              <div className="bg-white p-2 rounded border">
                <span className="font-medium text-gray-800 block">Passengers</span>
                <span className="text-lg font-bold text-green-600">{elevator.passengers}</span>
              </div>
              
              <div className="bg-white p-2 rounded border">
                <span className="font-medium text-gray-800 block">Destinations</span>
                <span className="text-gray-600">
                  {elevator.destinationFloors.size > 0 
                    ? Array.from(elevator.destinationFloors).sort((a, b) => a - b).join(', ')
                    : 'None'
                  }
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}