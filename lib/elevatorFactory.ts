/**
 * Factory class for creating elevator system entities
 * Centralizes object creation and ensures consistency
 * Implements factory pattern for maintainable object creation
 * 
 * @author Tarang Shah
 * @version 1.0.0
 */

import { Elevator, FloorCall, LogEntry } from '@/types/elevator';
import { SYSTEM_CONFIG, ELEVATOR_STATES, CALL_DIRECTIONS, LOG_TYPES } from './constants';

export class ElevatorFactory {
  private static callIdCounter = 0;

  /**
   * Creates initial elevator configuration
   * All elevators start at ground floor in idle state
   * 
   * @returns Array of elevators in initial state
   */
  static createInitialElevators(): Elevator[] {
    return Array.from({ length: SYSTEM_CONFIG.BUILDING.ELEVATOR_COUNT }, (_, index) => ({
      id: index + 1,
      currentFloor: 1, // All elevators start at ground floor
      direction: ELEVATOR_STATES.IDLE,
      isMoving: false,
      isLoading: false,
      destinationFloors: new Set<number>(),
      passengers: 0,
      lastActivity: Date.now(),
    }));
  }

  /**
   * Generates a random floor call for simulation
   * Ensures valid floor ranges and direction constraints
   * 
   * @returns A random floor call with unique ID
   */
  static generateRandomCall(): FloorCall {
    const floor = Math.floor(Math.random() * SYSTEM_CONFIG.BUILDING.FLOORS) + 1;
    let direction = Math.random() > 0.5 ? CALL_DIRECTIONS.UP : CALL_DIRECTIONS.DOWN;
    
    // Adjust direction based on floor constraints
    if (floor === 1) direction = CALL_DIRECTIONS.UP;
    if (floor === SYSTEM_CONFIG.BUILDING.FLOORS) direction = CALL_DIRECTIONS.DOWN;
    
    return {
      id: `call-${++this.callIdCounter}-${Date.now()}`,
      floor,
      direction,
      timestamp: Date.now(),
    };
  }

  /**
   * Creates a floor call with specific parameters
   * Used for manual call generation
   * 
   * @param floor - The floor number
   * @param direction - The call direction
   * @returns A floor call with unique ID
   */
  static createFloorCall(floor: number, direction: 'up' | 'down'): FloorCall {
    // Validate inputs
    if (floor < 1 || floor > SYSTEM_CONFIG.BUILDING.FLOORS) {
      throw new Error(`Invalid floor: ${floor}. Must be between 1 and ${SYSTEM_CONFIG.BUILDING.FLOORS}`);
    }

    if (floor === 1 && direction === 'down') {
      throw new Error('Cannot go down from ground floor');
    }

    if (floor === SYSTEM_CONFIG.BUILDING.FLOORS && direction === 'up') {
      throw new Error('Cannot go up from top floor');
    }

    return {
      id: `call-${++this.callIdCounter}-${Date.now()}`,
      floor,
      direction,
      timestamp: Date.now(),
    };
  }

  /**
   * Creates a log entry for system events
   * Includes proper formatting and validation
   * 
   * @param type - Type of log entry
   * @param message - Log message
   * @param elevatorId - Optional elevator ID
   * @param floor - Optional floor number
   * @returns Formatted log entry
   */
  static createLogEntry(
    type: LogEntry['type'],
    message: string,
    elevatorId?: number,
    floor?: number
  ): LogEntry {
    return {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      type,
      message,
      elevatorId,
      floor,
    };
  }

  /**
   * Generates random passenger destinations for an elevator
   * Ensures destinations are different from current floor
   * 
   * @param currentFloor - The floor where passengers are boarding
   * @param maxDestinations - Maximum number of destinations to generate
   * @returns Set of destination floors
   */
  static generatePassengerDestinations(currentFloor: number, maxDestinations: number = 3): Set<number> {
    const destinations = new Set<number>();
    const numDestinations = Math.floor(Math.random() * maxDestinations) + 1;
    
    for (let i = 0; i < numDestinations; i++) {
      let destination: number;
      let attempts = 0;
      
      do {
        destination = Math.floor(Math.random() * SYSTEM_CONFIG.BUILDING.FLOORS) + 1;
        attempts++;
      } while ((destination === currentFloor || destinations.has(destination)) && attempts < 10);
      
      if (attempts < 10) {
        destinations.add(destination);
      }
    }
    
    return destinations;
  }

  /**
   * Creates initial system state
   * 
   * @returns Initial elevator system state
   */
  static createInitialSystemState() {
    return {
      elevators: this.createInitialElevators(),
      pendingCalls: [],
      logs: [],
      isSimulationRunning: false,
      systemStartTime: Date.now(),
      totalCallsProcessed: 0,
    };
  }
}