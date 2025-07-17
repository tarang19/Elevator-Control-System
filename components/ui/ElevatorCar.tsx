'use client';

/**
 * Reusable elevator car visualization component
 * Displays elevator state with appropriate styling and animations
 * 
 * @author Tarang Shah
 * @version 1.0.0
 */

import { Elevator } from '@/types/elevator';
import { ELEVATOR_STATES } from '@/lib/constants';

interface ElevatorCarProps {
  elevator: Elevator;
  isAtFloor: boolean;
}

export function ElevatorCar({ elevator, isAtFloor }: ElevatorCarProps) {
  const getElevatorColor = () => {
    if (!isAtFloor) return 'bg-gray-100 border-gray-200';
    
    if (elevator.isLoading) return 'bg-yellow-400 border-yellow-500 animate-pulse';
    if (elevator.isMoving) return 'bg-blue-500 border-blue-600';
    if (elevator.direction === ELEVATOR_STATES.IDLE) return 'bg-gray-300 border-gray-400';
    return 'bg-green-500 border-green-600';
  };

  const getDirectionIndicator = () => {
    if (!isAtFloor || elevator.direction === ELEVATOR_STATES.IDLE) return null;
    
    return (
      <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-white border border-gray-300 flex items-center justify-center">
        <span className="text-xs font-bold text-gray-700">
          {elevator.direction === ELEVATOR_STATES.MOVING_UP ? '↑' : '↓'}
        </span>
      </div>
    );
  };

  const getStatusText = () => {
    if (!isAtFloor) return '';
    
    if (elevator.isLoading) return 'Loading';
    if (elevator.isMoving) return 'Moving';
    if (elevator.passengers > 0) return `${elevator.passengers}`;
    return 'Empty';
  };

  return (
    <div className="relative">
      <div
        className={`
          w-12 h-8 rounded-lg border-2 transition-all duration-300 
          flex items-center justify-center relative
          ${getElevatorColor()}
          ${isAtFloor ? 'shadow-md' : 'opacity-30'}
        `}
        role="img"
        aria-label={`Elevator ${elevator.id} ${isAtFloor ? `at floor ${elevator.currentFloor}` : 'not at this floor'}`}
      >
        <span className="text-xs font-bold text-white">
          {elevator.id}
        </span>
        
        {getDirectionIndicator()}
      </div>
      
      {isAtFloor && (
        <div className="absolute -bottom-5 left-1/2 transform -translate-x-1/2">
          <span className="text-xs text-gray-600 font-medium whitespace-nowrap">
            {getStatusText()}
          </span>
        </div>
      )}
    </div>
  );
}