/**
 * Type definitions for the elevator control system
 * Provides strong typing for all system entities
 * 
 * @author Tarang Shah
 * @version 1.0.0
 */

import { ELEVATOR_STATES, CALL_DIRECTIONS, LOG_TYPES } from '@/lib/constants';

export type ElevatorDirection = typeof ELEVATOR_STATES[keyof typeof ELEVATOR_STATES];
export type CallDirection = typeof CALL_DIRECTIONS[keyof typeof CALL_DIRECTIONS];
export type LogType = typeof LOG_TYPES[keyof typeof LOG_TYPES];

/**
 * Represents an elevator car in the system
 */
export interface Elevator {
  readonly id: number;
  currentFloor: number;
  direction: ElevatorDirection;
  isMoving: boolean;
  isLoading: boolean;
  destinationFloors: Set<number>;
  passengers: number;
  lastActivity: number; // Timestamp for performance monitoring
}

/**
 * Represents a floor call request
 */
export interface FloorCall {
  readonly id: string;
  readonly floor: number;
  readonly direction: CallDirection;
  readonly timestamp: number;
  assignedElevator?: number;
}

/**
 * Represents a system log entry
 */
export interface LogEntry {
  readonly id: string;
  readonly timestamp: number;
  readonly type: LogType;
  readonly message: string;
  readonly elevatorId?: number;
  readonly floor?: number;
}

/**
 * Complete system state interface
 */
export interface ElevatorSystemState {
  elevators: Elevator[];
  pendingCalls: FloorCall[];
  logs: LogEntry[];
  isSimulationRunning: boolean;
  systemStartTime: number;
  totalCallsProcessed: number;
}

/**
 * Performance metrics for monitoring
 */
export interface SystemMetrics {
  averageWaitTime: number;
  totalTrips: number;
  elevatorUtilization: Record<number, number>;
  peakFloorActivity: Record<number, number>;
}