/**
 * System constants for the elevator control system
 * Centralized configuration for easy maintenance and testing
 * 
 * @author Tarang Shah
 * @version 1.0.0
 */

export const SYSTEM_CONFIG = {
  BUILDING: {
    FLOORS: 10,
    ELEVATOR_COUNT: 4,
  },
  TIMING: {
    MOVE_DURATION_MS: 10000, // 10 seconds to move between floors (as per requirements)
    LOADING_DURATION_MS: 10000, // 10 seconds for passenger loading/unloading (as per requirements)
  },
  SIMULATION: {
    LOGIC_INTERVAL_MS: 1000, // Process elevator logic every second
    RANDOM_CALL_INTERVAL_MS: 5000, // Generate random calls every 5 seconds
    RANDOM_CALL_PROBABILITY: 0.3, // 30% chance of generating a call
  },
  UI: {
    MAX_LOG_ENTRIES: 100, // Prevent memory issues with unlimited logs
    ANIMATION_DURATION_MS: 300, // UI animation timing
  },
} as const;

export const ELEVATOR_STATES = {
  IDLE: 'idle',
  MOVING_UP: 'up',
  MOVING_DOWN: 'down',
} as const;

export const CALL_DIRECTIONS = {
  UP: 'up',
  DOWN: 'down',
} as const;

export const LOG_TYPES = {
  CALL: 'call',
  PICKUP: 'pickup',
  DROPOFF: 'dropoff',
  MOVEMENT: 'movement',
  SYSTEM: 'system',
} as const;