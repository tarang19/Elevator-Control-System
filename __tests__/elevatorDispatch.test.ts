/**
 * Test suite for elevator dispatch algorithm
 * Validates core business logic and edge cases
 * 
 * @author Tarang Shah
 * @version 1.0.0
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ElevatorDispatcher } from '@/lib/elevatorDispatch';
import { ElevatorFactory } from '@/lib/elevatorFactory';
import { SYSTEM_CONFIG, ELEVATOR_STATES } from '@/lib/constants';
import { Elevator, FloorCall } from '@/types/elevator';

describe('ElevatorDispatcher', () => {
  let elevators: Elevator[];
  let testCall: FloorCall;

  beforeEach(() => {
    elevators = ElevatorFactory.createInitialElevators();
    testCall = ElevatorFactory.createFloorCall(5, 'up');
  });

  describe('findBestElevator', () => {
    it('should return null when no elevators are available', () => {
      elevators.forEach(elevator => {
        elevator.isMoving = true;
      });

      const result = ElevatorDispatcher.findBestElevator(elevators, testCall);
      expect(result).toBeNull();
    });

    it('should prefer closer elevators', () => {
      elevators[0].currentFloor = 4; // Closer to floor 5
      elevators[1].currentFloor = 8; // Further from floor 5

      const result = ElevatorDispatcher.findBestElevator(elevators, testCall);
      expect(result?.id).toBe(1);
    });

    it('should prefer elevators moving in the same direction', () => {
      elevators[0].currentFloor = 3;
      elevators[0].direction = ELEVATOR_STATES.MOVING_UP;
      elevators[1].currentFloor = 4;
      elevators[1].direction = ELEVATOR_STATES.MOVING_DOWN;

      const upCall = ElevatorFactory.createFloorCall(5, 'up');
      const result = ElevatorDispatcher.findBestElevator(elevators, upCall);
      expect(result?.id).toBe(1);
    });

    it('should handle edge case of top floor down call', () => {
      const topFloorCall = ElevatorFactory.createFloorCall(10, 'down');
      const result = ElevatorDispatcher.findBestElevator(elevators, topFloorCall);
      expect(result).not.toBeNull();
    });
  });

  describe('shouldElevatorStop', () => {
    it('should stop for passenger dropoff', () => {
      elevators[0].destinationFloors.add(5);
      
      const result = ElevatorDispatcher.shouldElevatorStop(elevators[0], 5, []);
      expect(result).toBe(true);
    });

    it('should stop for assigned pickup calls', () => {
      const assignedCall = { ...testCall, assignedElevator: 1 };
      
      const result = ElevatorDispatcher.shouldElevatorStop(elevators[0], 5, [assignedCall]);
      expect(result).toBe(true);
    });

    it('should not stop for unassigned calls', () => {
      const result = ElevatorDispatcher.shouldElevatorStop(elevators[0], 5, [testCall]);
      expect(result).toBe(false);
    });
  });

  describe('getNextDestination', () => {
    it('should return null when no destinations exist', () => {
      const result = ElevatorDispatcher.getNextDestination(elevators[0], []);
      expect(result).toBeNull();
    });

    it('should continue in current direction (up)', () => {
      elevators[0].currentFloor = 3;
      elevators[0].direction = ELEVATOR_STATES.MOVING_UP;
      elevators[0].destinationFloors.add(5);
      elevators[0].destinationFloors.add(2);

      const result = ElevatorDispatcher.getNextDestination(elevators[0], []);
      expect(result).toBe(5); // Should go up first
    });

    it('should continue in current direction (down)', () => {
      elevators[0].currentFloor = 7;
      elevators[0].direction = ELEVATOR_STATES.MOVING_DOWN;
      elevators[0].destinationFloors.add(5);
      elevators[0].destinationFloors.add(9);

      const result = ElevatorDispatcher.getNextDestination(elevators[0], []);
      expect(result).toBe(5); // Should go down first
    });

    it('should handle idle elevator by going to nearest destination', () => {
      elevators[0].currentFloor = 5;
      elevators[0].direction = ELEVATOR_STATES.IDLE;
      elevators[0].destinationFloors.add(3);
      elevators[0].destinationFloors.add(8);

      const result = ElevatorDispatcher.getNextDestination(elevators[0], []);
      expect(result).toBe(3); // Closer destination
    });
  });
});

describe('ElevatorFactory', () => {
  describe('createFloorCall', () => {
    it('should create valid floor calls', () => {
      const call = ElevatorFactory.createFloorCall(5, 'up');
      expect(call.floor).toBe(5);
      expect(call.direction).toBe('up');
      expect(call.id).toBeDefined();
      expect(call.timestamp).toBeDefined();
    });

    it('should throw error for invalid floor', () => {
      expect(() => ElevatorFactory.createFloorCall(0, 'up')).toThrow();
      expect(() => ElevatorFactory.createFloorCall(11, 'up')).toThrow();
    });

    it('should throw error for invalid direction from ground floor', () => {
      expect(() => ElevatorFactory.createFloorCall(1, 'down')).toThrow();
    });

    it('should throw error for invalid direction from top floor', () => {
      expect(() => ElevatorFactory.createFloorCall(10, 'up')).toThrow();
    });
  });

  describe('generatePassengerDestinations', () => {
    it('should generate valid destinations', () => {
      const destinations = ElevatorFactory.generatePassengerDestinations(5);
      expect(destinations.size).toBeGreaterThan(0);
      expect(destinations.has(5)).toBe(false); // Should not include current floor
    });

    it('should respect maximum destinations limit', () => {
      const destinations = ElevatorFactory.generatePassengerDestinations(5, 2);
      expect(destinations.size).toBeLessThanOrEqual(2);
    });
  });
});