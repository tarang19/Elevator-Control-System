/**
 * Core service class that manages the elevator control system
 * Handles all business logic for elevator operations, dispatch, and state management
 * Implements the main control loop and system orchestration
 * 
 * @author Tarang Shah
 * @version 1.0.0
 */

import { Elevator, FloorCall, LogEntry, ElevatorSystemState } from '@/types/elevator';
import { ElevatorDispatcher } from '@/lib/elevatorDispatch';
import { ElevatorFactory } from '@/lib/elevatorFactory';
import { SYSTEM_CONFIG, ELEVATOR_STATES, LOG_TYPES } from '@/lib/constants';

export class ElevatorControlService {
  private state: ElevatorSystemState;
  private logCallback?: (log: LogEntry) => void;
  private stateChangeCallback?: () => void;

  constructor() {
    this.state = ElevatorFactory.createInitialSystemState();
    this.addLog(LOG_TYPES.SYSTEM, 'Elevator control system initialized');
  }

  /**
   * Sets callback for log events
   * @param callback - Function to call when new log entries are created
   */
  setLogCallback(callback: (log: LogEntry) => void): void {
    this.logCallback = callback;
  }

  /**
   * Sets callback for state changes
   * @param callback - Function to call when state changes
   */
  setStateChangeCallback(callback: () => void): void {
    this.stateChangeCallback = callback;
  }

  /**
   * Gets current system state (immutable copy)
   * @returns Current elevator system state
   */
  getState(): ElevatorSystemState {
    return {
      ...this.state,
      elevators: this.state.elevators.map(elevator => ({
        ...elevator,
        destinationFloors: new Set(elevator.destinationFloors),
      })),
      pendingCalls: [...this.state.pendingCalls],
      logs: [...this.state.logs],
    };
  }

  /**
   * Adds a new floor call to the system
   * Implements the dispatch algorithm to assign calls to elevators
   * 
   * @param call - The floor call to add
   */
  addFloorCall(call: FloorCall): void {
    try {
      const bestElevator = ElevatorDispatcher.findBestElevator(this.state.elevators, call);
      
      if (!bestElevator) {
        this.addLog(
          LOG_TYPES.SYSTEM, 
          `No available elevator for call on floor ${call.floor} going ${call.direction}. Call queued.`
        );
        this.state.pendingCalls.push(call);
        return;
      }

      const assignedCall = { ...call, assignedElevator: bestElevator.id };
      this.state.pendingCalls.push(assignedCall);
      
      this.addLog(
        LOG_TYPES.CALL, 
        `Floor ${call.floor} ${call.direction} call assigned to Elevator ${bestElevator.id}`,
        bestElevator.id,
        call.floor
      );

      this.notifyStateChange();
    } catch (error) {
      this.addLog(LOG_TYPES.SYSTEM, `Error processing floor call: ${error}`);
    }
  }

  /**
   * Processes elevator logic - main control loop
   * Should be called periodically to update elevator states
   * Handles elevator movement, stops, and passenger operations
   */
  processElevatorLogic(): void {
    try {
      this.state.elevators.forEach(elevator => {
        if (elevator.isMoving || elevator.isLoading) {
          return; // Skip elevators that are busy
        }

        this.handleElevatorAtFloor(elevator);
        this.moveElevatorToNextDestination(elevator);
      });

      // Reassign unassigned calls to available elevators
      this.reassignUnassignedCalls();
    } catch (error) {
      this.addLog(LOG_TYPES.SYSTEM, `Error in elevator logic processing: ${error}`);
    }
  }

  /**
   * Reassigns calls that couldn't be assigned initially
   */
  private reassignUnassignedCalls(): void {
    const unassignedCalls = this.state.pendingCalls.filter(call => !call.assignedElevator);
    
    unassignedCalls.forEach(call => {
      const bestElevator = ElevatorDispatcher.findBestElevator(this.state.elevators, call);
      if (bestElevator) {
        const callIndex = this.state.pendingCalls.findIndex(c => c.id === call.id);
        if (callIndex !== -1) {
          this.state.pendingCalls[callIndex] = { ...call, assignedElevator: bestElevator.id };
          this.addLog(
            LOG_TYPES.SYSTEM,
            `Reassigned floor ${call.floor} ${call.direction} call to Elevator ${bestElevator.id}`,
            bestElevator.id,
            call.floor
          );
        }
      }
    });
  }

  /**
   * Handles elevator operations when stopped at a floor
   * Processes both passenger dropoffs and pickups
   * 
   * @param elevator - The elevator to process
   */
  private handleElevatorAtFloor(elevator: Elevator): void {
    const currentFloor = elevator.currentFloor;
    
    if (!ElevatorDispatcher.shouldElevatorStop(elevator, currentFloor, this.state.pendingCalls)) {
      return;
    }

    // Handle passenger dropoff first
    if (elevator.destinationFloors.has(currentFloor)) {
      this.handlePassengerDropoff(elevator, currentFloor);
    }

    // Handle passenger pickup
    const pickupCall = this.state.pendingCalls.find(call => 
      call.floor === currentFloor && call.assignedElevator === elevator.id
    );
    
    if (pickupCall) {
      this.handlePassengerPickup(elevator, currentFloor, pickupCall);
    }
  }

  /**
   * Handles passenger dropoff at current floor
   * Updates elevator state and logs the event
   * 
   * @param elevator - The elevator
   * @param floor - The current floor
   */
  private handlePassengerDropoff(elevator: Elevator, floor: number): void {
    elevator.destinationFloors.delete(floor);
    elevator.passengers = elevator.destinationFloors.size;
    elevator.lastActivity = Date.now();
    
    this.addLog(
      LOG_TYPES.DROPOFF,
      `Elevator ${elevator.id} passengers disembarked at floor ${floor}`,
      elevator.id,
      floor
    );

    // Set to idle if no more destinations
    if (elevator.destinationFloors.size === 0) {
      elevator.direction = ELEVATOR_STATES.IDLE;
      this.addLog(
        LOG_TYPES.SYSTEM,
        `Elevator ${elevator.id} is now idle at floor ${floor}`,
        elevator.id,
        floor
      );
    }

    this.notifyStateChange();
  }

  /**
   * Handles passenger pickup at current floor
   * Simulates loading time and generates passenger destinations
   * 
   * @param elevator - The elevator
   * @param floor - The current floor
   * @param call - The floor call being serviced
   */
  private handlePassengerPickup(elevator: Elevator, floor: number, call: FloorCall): void {
    elevator.isLoading = true;
    elevator.lastActivity = Date.now();
    
    this.addLog(
      LOG_TYPES.PICKUP,
      `Elevator ${elevator.id} loading passengers at floor ${floor}`,
      elevator.id,
      floor
    );

    // Remove the completed call
    this.state.pendingCalls = this.state.pendingCalls.filter(c => c.id !== call.id);
    this.state.totalCallsProcessed++;

    this.notifyStateChange();

    // Simulate loading time (as per requirements: 10 seconds)
    setTimeout(() => {
      if (elevator.isLoading) { // Check if elevator is still in loading state
        const destinations = ElevatorFactory.generatePassengerDestinations(floor);
        elevator.destinationFloors = new Set([...elevator.destinationFloors, ...destinations]);
        elevator.passengers = elevator.destinationFloors.size;
        elevator.isLoading = false;
        
        this.addLog(
          LOG_TYPES.SYSTEM,
          `Elevator ${elevator.id} finished loading. New destinations: ${Array.from(destinations).join(', ')}`,
          elevator.id,
          floor
        );

        this.notifyStateChange();
      }
    }, SYSTEM_CONFIG.TIMING.LOADING_DURATION_MS);
  }

  /**
   * Moves elevator to its next destination
   * Implements the up/down algorithm logic
   * 
   * @param elevator - The elevator to move
   */
  private moveElevatorToNextDestination(elevator: Elevator): void {
    const nextDestination = ElevatorDispatcher.getNextDestination(elevator, this.state.pendingCalls);
    
    if (!nextDestination || nextDestination === elevator.currentFloor) {
      if (elevator.direction !== ELEVATOR_STATES.IDLE) {
        elevator.direction = ELEVATOR_STATES.IDLE;
        this.addLog(
          LOG_TYPES.SYSTEM,
          `Elevator ${elevator.id} is now idle at floor ${elevator.currentFloor}`,
          elevator.id,
          elevator.currentFloor
        );
        this.notifyStateChange();
      }
      return;
    }

    this.moveElevator(elevator, nextDestination);
  }

  /**
   * Initiates elevator movement to target floor
   * Simulates movement time and updates elevator state
   * 
   * @param elevator - The elevator to move
   * @param targetFloor - The destination floor
   */
  private moveElevator(elevator: Elevator, targetFloor: number): void {
    const direction = targetFloor > elevator.currentFloor 
      ? ELEVATOR_STATES.MOVING_UP 
      : ELEVATOR_STATES.MOVING_DOWN;
    
    elevator.isMoving = true;
    elevator.direction = direction;
    elevator.lastActivity = Date.now();
    
    this.addLog(
      LOG_TYPES.MOVEMENT,
      `Elevator ${elevator.id} moving ${direction} from floor ${elevator.currentFloor} to floor ${targetFloor}`,
      elevator.id
    );

    this.notifyStateChange();

    // Simulate movement time (as per requirements: 10 seconds per floor)
    setTimeout(() => {
      if (elevator.isMoving) { // Check if elevator is still moving
        elevator.currentFloor = targetFloor;
        elevator.isMoving = false;
        
        this.addLog(
          LOG_TYPES.MOVEMENT,
          `Elevator ${elevator.id} arrived at floor ${targetFloor}`,
          elevator.id,
          targetFloor
        );

        this.notifyStateChange();
      }
    }, SYSTEM_CONFIG.TIMING.MOVE_DURATION_MS);
  }

  /**
   * Generates a random floor call for simulation
   */
  generateRandomCall(): void {
    try {
      const call = ElevatorFactory.generateRandomCall();
      this.addFloorCall(call);
    } catch (error) {
      this.addLog(LOG_TYPES.SYSTEM, `Error generating random call: ${error}`);
    }
  }

  /**
   * Toggles simulation state
   */
  toggleSimulation(): void {
    this.state.isSimulationRunning = !this.state.isSimulationRunning;
    
    this.addLog(
      LOG_TYPES.SYSTEM,
      `Simulation ${this.state.isSimulationRunning ? 'started' : 'stopped'}`
    );

    this.notifyStateChange();
  }

  /**
   * Clears all logs while preserving system state
   */
  clearLogs(): void {
    this.state.logs = [];
    this.addLog(LOG_TYPES.SYSTEM, 'System logs cleared');
    this.notifyStateChange();
  }

  /**
   * Gets system performance metrics
   */
  getSystemMetrics() {
    const now = Date.now();
    const uptime = now - this.state.systemStartTime;
    
    return {
      uptime,
      totalCallsProcessed: this.state.totalCallsProcessed,
      pendingCalls: this.state.pendingCalls.length,
      activeElevators: this.state.elevators.filter(e => e.isMoving || e.isLoading).length,
      idleElevators: this.state.elevators.filter(e => e.direction === ELEVATOR_STATES.IDLE).length,
    };
  }

  /**
   * Adds a log entry to the system with console output
   * Implements the console logging requirement
   * 
   * @param type - Type of log entry
   * @param message - Log message
   * @param elevatorId - Optional elevator ID
   * @param floor - Optional floor number
   */
  private addLog(
    type: LogEntry['type'],
    message: string,
    elevatorId?: number,
    floor?: number
  ): void {
    const logEntry = ElevatorFactory.createLogEntry(type, message, elevatorId, floor);
    
    // Maintain log size limit to prevent memory issues
    if (this.state.logs.length >= SYSTEM_CONFIG.UI.MAX_LOG_ENTRIES) {
      this.state.logs = this.state.logs.slice(-SYSTEM_CONFIG.UI.MAX_LOG_ENTRIES + 1);
    }
    
    this.state.logs.push(logEntry);
    
    // Console logging as required in specifications
    const timestamp = new Date(logEntry.timestamp).toLocaleTimeString();
    const elevatorInfo = elevatorId ? ` [Elevator ${elevatorId}]` : '';
    const floorInfo = floor ? ` [Floor ${floor}]` : '';
    console.log(`[${timestamp}]${elevatorInfo}${floorInfo} ${message}`);
    
    if (this.logCallback) {
      this.logCallback(logEntry);
    }
  }

  /**
   * Notifies subscribers of state changes
   */
  private notifyStateChange(): void {
    if (this.stateChangeCallback) {
      this.stateChangeCallback();
    }
  }
}