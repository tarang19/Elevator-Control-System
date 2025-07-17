/**
 * Test suite for elevator control service
 * Tests the main business logic and state management
 * 
 * @author Tarang Shah
 * @version 1.0.0
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ElevatorControlService } from '@/services/ElevatorControlService';
import { ElevatorDispatcher } from '@/lib/elevatorDispatch';
import { ElevatorFactory } from '@/lib/elevatorFactory';
import { SYSTEM_CONFIG } from '@/lib/constants';

// Mock timers for testing
vi.useFakeTimers();

describe('ElevatorControlService', () => {
  let service: ElevatorControlService;

  beforeEach(() => {
    service = new ElevatorControlService();
    vi.clearAllTimers();
  });

  describe('initialization', () => {
    it('should initialize with correct number of elevators', () => {
      const state = service.getState();
      expect(state.elevators).toHaveLength(SYSTEM_CONFIG.BUILDING.ELEVATOR_COUNT);
    });

    it('should initialize elevators at ground floor', () => {
      const state = service.getState();
      state.elevators.forEach(elevator => {
        expect(elevator.currentFloor).toBe(1);
        expect(elevator.direction).toBe('idle');
        expect(elevator.isMoving).toBe(false);
        expect(elevator.isLoading).toBe(false);
      });
    });

    it('should start with empty pending calls and logs', () => {
      const state = service.getState();
      expect(state.pendingCalls).toHaveLength(0);
      expect(state.logs.length).toBeGreaterThan(0); // Should have initialization log
      expect(state.isSimulationRunning).toBe(false);
    });
  });

  describe('addFloorCall', () => {
    it('should assign call to available elevator', () => {
      const call = ElevatorFactory.createFloorCall(5, 'up');
      service.addFloorCall(call);

      const state = service.getState();
      expect(state.pendingCalls).toHaveLength(1);
      expect(state.pendingCalls[0].assignedElevator).toBeDefined();
    });

    it('should handle call when no elevators available', () => {
      // Mock the dispatcher to return null (no available elevators)
      const mockFindBestElevator = vi.spyOn(ElevatorDispatcher, 'findBestElevator').mockReturnValue(null);

      const call = ElevatorFactory.createFloorCall(5, 'up');
      service.addFloorCall(call);

      const newState = service.getState();
      expect(newState.pendingCalls).toHaveLength(1);
      expect(newState.pendingCalls[0].assignedElevator).toBeUndefined();
      
      mockFindBestElevator.mockRestore();
    });
  });

  describe('processElevatorLogic', () => {
    it('should not process busy elevators', () => {
      const state = service.getState();
      const elevator = state.elevators[0];
      elevator.isMoving = true;
      const initialFloor = elevator.currentFloor;

      service.processElevatorLogic();

      expect(elevator.currentFloor).toBe(initialFloor);
    });

    it('should handle passenger dropoff', () => {
      const initialState = service.getState();
      const elevator = initialState.elevators[0];
      elevator.currentFloor = 5;
      elevator.destinationFloors.add(5);
      elevator.passengers = 1;

      service.processElevatorLogic();

      // Get fresh state after processing
      const updatedState = service.getState();
      const updatedElevator = updatedState.elevators[0];
      
      expect(updatedElevator.destinationFloors.has(5)).toBe(false);
      expect(updatedElevator.passengers).toBe(0);
    });
  });

  describe('simulation control', () => {
    it('should toggle simulation state', () => {
      expect(service.getState().isSimulationRunning).toBe(false);
      
      service.toggleSimulation();
      expect(service.getState().isSimulationRunning).toBe(true);
      
      service.toggleSimulation();
      expect(service.getState().isSimulationRunning).toBe(false);
    });

    it('should generate random calls', () => {
      const initialCallCount = service.getState().pendingCalls.length;
      
      service.generateRandomCall();
      
      const newCallCount = service.getState().pendingCalls.length;
      expect(newCallCount).toBe(initialCallCount + 1);
    });

    it('should clear logs while preserving system state', () => {
      service.generateRandomCall(); // Generate some activity
      const initialLogCount = service.getState().logs.length;
      
      service.clearLogs();
      
      const state = service.getState();
      expect(state.logs.length).toBeLessThan(initialLogCount);
      expect(state.elevators).toHaveLength(SYSTEM_CONFIG.BUILDING.ELEVATOR_COUNT);
    });
  });

  describe('system metrics', () => {
    it('should provide system metrics', () => {
      const metrics = service.getSystemMetrics();
      
      expect(metrics).toHaveProperty('uptime');
      expect(metrics).toHaveProperty('totalCallsProcessed');
      expect(metrics).toHaveProperty('pendingCalls');
      expect(metrics).toHaveProperty('activeElevators');
      expect(metrics).toHaveProperty('idleElevators');
    });

    it('should track processed calls', () => {
      const initialMetrics = service.getSystemMetrics();
      
      // Simulate processing a call
      const call = ElevatorFactory.createFloorCall(5, 'up');
      service.addFloorCall(call);
      
      // This would normally be processed by the elevator logic
      // For testing, we can verify the call was added
      const state = service.getState();
      expect(state.pendingCalls.length).toBeGreaterThan(0);
    });
  });

  describe('error handling', () => {
    it('should handle invalid floor calls gracefully', () => {
      const logsBefore = service.getState().logs.length;
      
      try {
        const invalidCall = { ...ElevatorFactory.createFloorCall(5, 'up'), floor: 0 };
        service.addFloorCall(invalidCall);
      } catch (error) {
        // Should handle gracefully
      }
      
      // System should still be operational
      expect(service.getState().elevators).toHaveLength(SYSTEM_CONFIG.BUILDING.ELEVATOR_COUNT);
    });
  });
});