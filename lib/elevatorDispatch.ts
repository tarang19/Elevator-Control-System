/**
 * Elevator dispatch algorithm implementation
 * Implements the core logic for assigning calls to elevators
 * 
 * Algorithm Strategy:
 * 1. Prefer elevators already moving in the same direction that can pick up the call
 * 2. Fall back to idle elevators
 * 3. Choose the closest available elevator
 * 4. Implement up/down algorithm - continue in direction until no more destinations
 * 
 * @author Tarang Shah
 * @version 1.0.0
 */

import { Elevator, FloorCall } from '@/types/elevator';
import { SYSTEM_CONFIG, ELEVATOR_STATES } from './constants';

export class ElevatorDispatcher {
  /**
   * Finds the best available elevator for a floor call
   * Uses a scoring system to determine optimal assignment
   * 
   * @param elevators - Array of all elevators
   * @param call - The floor call to assign
   * @returns The best elevator or null if none available
   */
  static findBestElevator(elevators: Elevator[], call: FloorCall): Elevator | null {
    const availableElevators = elevators.filter(elevator => 
      !elevator.isMoving && !elevator.isLoading
    );

    if (availableElevators.length === 0) {
      return null;
    }

    // Score each elevator based on multiple factors
    const scoredElevators = availableElevators.map(elevator => ({
      elevator,
      score: this.calculateElevatorScore(elevator, call),
    }));

    // Sort by score (higher is better) and return the best
    scoredElevators.sort((a, b) => b.score - a.score);
    return scoredElevators[0].elevator;
  }

  /**
   * Calculates a score for an elevator based on its suitability for a call
   * Higher scores indicate better matches
   * 
   * @param elevator - The elevator to score
   * @param call - The call to evaluate against
   * @returns Numerical score (higher is better)
   */
  private static calculateElevatorScore(elevator: Elevator, call: FloorCall): number {
    let score = 0;
    const distance = Math.abs(elevator.currentFloor - call.floor);

    // Prefer closer elevators (max 100 points)
    score += Math.max(0, 100 - distance * 10);

    // Prefer elevators moving in the same direction (50 points)
    if (elevator.direction === call.direction) {
      score += 50;
    }

    // Prefer idle elevators over those changing direction (25 points)
    if (elevator.direction === ELEVATOR_STATES.IDLE) {
      score += 25;
    }

    // Prefer elevators that can pick up without changing direction
    if (this.canPickupWithoutDirectionChange(elevator, call)) {
      score += 75;
    }

    // Slight preference for less busy elevators
    score -= elevator.destinationFloors.size * 5;

    return score;
  }

  /**
   * Determines if an elevator can pick up a call without changing direction
   * 
   * @param elevator - The elevator to check
   * @param call - The call to evaluate
   * @returns True if pickup is possible without direction change
   */
  private static canPickupWithoutDirectionChange(elevator: Elevator, call: FloorCall): boolean {
    if (elevator.direction === ELEVATOR_STATES.IDLE) return true;
    
    if (elevator.direction === call.direction) {
      return call.direction === ELEVATOR_STATES.MOVING_UP 
        ? elevator.currentFloor <= call.floor
        : elevator.currentFloor >= call.floor;
    }
    
    return false;
  }

  /**
   * Determines if an elevator should stop at a given floor
   * Checks for both passenger dropoffs and assigned pickups
   * 
   * @param elevator - The elevator to check
   * @param floor - The floor to check
   * @param pendingCalls - All pending calls
   * @returns True if the elevator should stop
   */
  static shouldElevatorStop(elevator: Elevator, floor: number, pendingCalls: FloorCall[]): boolean {
    // Stop for passenger dropoff
    if (elevator.destinationFloors.has(floor)) {
      return true;
    }

    // Stop for assigned pickup calls in compatible direction
    return pendingCalls.some(call => 
      call.floor === floor && 
      call.assignedElevator === elevator.id &&
      this.isCallCompatibleWithDirection(call, elevator.direction)
    );
  }

  /**
   * Checks if a call is compatible with the elevator's current direction
   * 
   * @param call - The call to check
   * @param elevatorDirection - The elevator's current direction
   * @returns True if compatible
   */
  private static isCallCompatibleWithDirection(call: FloorCall, elevatorDirection: ElevatorDirection): boolean {
    return elevatorDirection === ELEVATOR_STATES.IDLE || call.direction === elevatorDirection;
  }

  /**
   * Gets the next destination floor for an elevator
   * Implements the up/down algorithm - continue in current direction until no more destinations
   * 
   * @param elevator - The elevator to get destination for
   * @param pendingCalls - All pending calls
   * @returns Next floor to visit or null if no destinations
   */
  static getNextDestination(elevator: Elevator, pendingCalls: FloorCall[]): number | null {
    const assignedCalls = pendingCalls.filter(call => call.assignedElevator === elevator.id);
    const allDestinations = new Set([
      ...elevator.destinationFloors, 
      ...assignedCalls.map(call => call.floor)
    ]);

    if (allDestinations.size === 0) return null;

    const destinations = Array.from(allDestinations).sort((a, b) => a - b);

    // For idle elevators, always go to the nearest destination
    if (elevator.direction === ELEVATOR_STATES.IDLE) {
      const currentFloor = elevator.currentFloor;
      return destinations.reduce((closest, floor) => 
        Math.abs(floor - currentFloor) < Math.abs(closest - currentFloor) ? floor : closest
      );
    }

    // Continue in current direction first (up/down algorithm)
    if (elevator.direction === ELEVATOR_STATES.MOVING_UP) {
      const upDestinations = destinations.filter(floor => floor > elevator.currentFloor);
      if (upDestinations.length > 0) return upDestinations[0];
    }

    if (elevator.direction === ELEVATOR_STATES.MOVING_DOWN) {
      const downDestinations = destinations.filter(floor => floor < elevator.currentFloor);
      if (downDestinations.length > 0) return downDestinations[downDestinations.length - 1];
    }

    // If no destinations in current direction, go to nearest
    const currentFloor = elevator.currentFloor;
    return destinations.reduce((closest, floor) => 
      Math.abs(floor - currentFloor) < Math.abs(closest - currentFloor) ? floor : closest
    );
  }
}