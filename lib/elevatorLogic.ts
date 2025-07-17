import { Elevator, FloorCall, LogEntry } from '../types/elevator';

export const FLOORS = 10;
export const ELEVATOR_COUNT = 4;
export const MOVE_TIME = 10000; // 10 seconds in milliseconds
export const LOAD_TIME = 10000; // 10 seconds in milliseconds

export function createInitialElevators(): Elevator[] {
  return Array.from({ length: ELEVATOR_COUNT }, (_, i) => ({
    id: i + 1,
    currentFloor: 1,
    direction: 'idle' as const,
    isMoving: false,
    isLoading: false,
    destinationFloors: new Set(),
    passengers: 0,
  }));
}

export function findBestElevator(elevators: Elevator[], call: FloorCall): Elevator | null {
  const availableElevators = elevators.filter(elevator => 
    !elevator.isMoving && !elevator.isLoading
  );

  if (availableElevators.length === 0) return null;

  // Find elevator going in the same direction and can pick up
  const sameDirectionElevators = availableElevators.filter(elevator => {
    if (elevator.direction === 'idle') return true;
    if (elevator.direction === call.direction) {
      if (call.direction === 'up') {
        return elevator.currentFloor <= call.floor;
      } else {
        return elevator.currentFloor >= call.floor;
      }
    }
    return false;
  });

  if (sameDirectionElevators.length > 0) {
    // Find closest elevator
    return sameDirectionElevators.reduce((closest, current) => {
      const closestDistance = Math.abs(closest.currentFloor - call.floor);
      const currentDistance = Math.abs(current.currentFloor - call.floor);
      return currentDistance < closestDistance ? current : closest;
    });
  }

  // Find closest idle elevator
  return availableElevators.reduce((closest, current) => {
    const closestDistance = Math.abs(closest.currentFloor - call.floor);
    const currentDistance = Math.abs(current.currentFloor - call.floor);
    return currentDistance < closestDistance ? current : closest;
  });
}

export function generateRandomCall(): FloorCall {
  const floor = Math.floor(Math.random() * FLOORS) + 1;
  const direction = Math.random() > 0.5 ? 'up' : 'down';
  
  // Adjust direction based on floor constraints
  const adjustedDirection = floor === 1 ? 'up' : floor === FLOORS ? 'down' : direction;
  
  return {
    floor,
    direction: adjustedDirection,
    timestamp: Date.now(),
  };
}

export function shouldElevatorStop(elevator: Elevator, floor: number, pendingCalls: FloorCall[]): boolean {
  // Stop if this is a destination floor
  if (elevator.destinationFloors.has(floor)) {
    return true;
  }

  // Stop if there's a pending call on this floor going in the same direction
  return pendingCalls.some(call => 
    call.floor === floor && 
    call.assignedElevator === elevator.id &&
    (elevator.direction === 'idle' || call.direction === elevator.direction)
  );
}

export function getNextDestination(elevator: Elevator, pendingCalls: FloorCall[]): number | null {
  const relevantCalls = pendingCalls.filter(call => call.assignedElevator === elevator.id);
  const allDestinations = new Set([...elevator.destinationFloors, ...relevantCalls.map(call => call.floor)]);

  if (allDestinations.size === 0) return null;

  const destinations = Array.from(allDestinations).sort((a, b) => a - b);

  if (elevator.direction === 'up' || elevator.direction === 'idle') {
    const upDestinations = destinations.filter(floor => floor > elevator.currentFloor);
    if (upDestinations.length > 0) return upDestinations[0];
  }

  if (elevator.direction === 'down' || elevator.direction === 'idle') {
    const downDestinations = destinations.filter(floor => floor < elevator.currentFloor);
    if (downDestinations.length > 0) return downDestinations[downDestinations.length - 1];
  }

  return destinations[0];
}

export function createLogEntry(
  type: LogEntry['type'],
  message: string,
  elevatorId?: number,
  floor?: number
): LogEntry {
  return {
    id: `${Date.now()}-${Math.random()}`,
    timestamp: Date.now(),
    type,
    message,
    elevatorId,
    floor,
  };
}