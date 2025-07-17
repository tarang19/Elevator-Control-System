'use client';

/**
 * Custom hook that manages the elevator system state and provides interface methods
 * Handles the integration between the service layer and React components
 * Implements proper cleanup and error handling for production use
 * 
 * @author Tarang Shah
 * @version 1.0.0
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { ElevatorSystemState, FloorCall } from '@/types/elevator';
import { ElevatorControlService } from '@/services/ElevatorControlService';
import { ElevatorFactory } from '@/lib/elevatorFactory';
import { SYSTEM_CONFIG } from '@/lib/constants';

export function useElevatorSystem() {
  const serviceRef = useRef<ElevatorControlService>();
  const logicIntervalRef = useRef<NodeJS.Timeout>();
  const randomCallIntervalRef = useRef<NodeJS.Timeout>();
  
  const [state, setState] = useState<ElevatorSystemState>(() => {
    const service = new ElevatorControlService();
    serviceRef.current = service;
    return service.getState();
  });

  const [error, setError] = useState<string | null>(null);

  // Update state when service state changes
  const updateState = useCallback(() => {
    try {
      if (serviceRef.current) {
        setState(serviceRef.current.getState());
        setError(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      console.error('Error updating elevator system state:', err);
    }
  }, []);

  // Set up service callbacks
  useEffect(() => {
    if (serviceRef.current) {
      serviceRef.current.setLogCallback(() => {
        updateState();
      });
      
      serviceRef.current.setStateChangeCallback(() => {
        updateState();
      });
    }
  }, [updateState]);

  // Main elevator logic processing interval
  useEffect(() => {
    logicIntervalRef.current = setInterval(() => {
      try {
        if (serviceRef.current) {
          serviceRef.current.processElevatorLogic();
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error in elevator logic');
        console.error('Error in elevator logic processing:', err);
      }
    }, SYSTEM_CONFIG.SIMULATION.LOGIC_INTERVAL_MS);

    return () => {
      if (logicIntervalRef.current) {
        clearInterval(logicIntervalRef.current);
      }
    };
  }, []);

  // Random call generation when simulation is running
  useEffect(() => {
    if (randomCallIntervalRef.current) {
      clearInterval(randomCallIntervalRef.current);
    }

    if (state.isSimulationRunning) {
      randomCallIntervalRef.current = setInterval(() => {
        try {
          if (Math.random() < SYSTEM_CONFIG.SIMULATION.RANDOM_CALL_PROBABILITY) {
            serviceRef.current?.generateRandomCall();
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Error generating random call');
          console.error('Error generating random call:', err);
        }
      }, SYSTEM_CONFIG.SIMULATION.RANDOM_CALL_INTERVAL_MS);
    }

    return () => {
      if (randomCallIntervalRef.current) {
        clearInterval(randomCallIntervalRef.current);
      }
    };
  }, [state.isSimulationRunning]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (logicIntervalRef.current) {
        clearInterval(logicIntervalRef.current);
      }
      if (randomCallIntervalRef.current) {
        clearInterval(randomCallIntervalRef.current);
      }
    };
  }, []);

  // Interface methods with error handling
  const handleFloorCall = useCallback((floor: number, direction: 'up' | 'down') => {
    try {
      const call = ElevatorFactory.createFloorCall(floor, direction);
      serviceRef.current?.addFloorCall(call);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Invalid floor call';
      setError(errorMessage);
      console.error('Error handling floor call:', err);
    }
  }, []);

  const generateRandomCall = useCallback(() => {
    try {
      serviceRef.current?.generateRandomCall();
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error generating call';
      setError(errorMessage);
      console.error('Error generating random call:', err);
    }
  }, []);

  const toggleSimulation = useCallback(() => {
    try {
      serviceRef.current?.toggleSimulation();
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error toggling simulation';
      setError(errorMessage);
      console.error('Error toggling simulation:', err);
    }
  }, []);

  const clearLogs = useCallback(() => {
    try {
      serviceRef.current?.clearLogs();
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error clearing logs';
      setError(errorMessage);
      console.error('Error clearing logs:', err);
    }
  }, []);

  const getSystemMetrics = useCallback(() => {
    try {
      return serviceRef.current?.getSystemMetrics() || null;
    } catch (err) {
      console.error('Error getting system metrics:', err);
      return null;
    }
  }, []);

  return {
    ...state,
    error,
    handleFloorCall,
    generateRandomCall,
    toggleSimulation,
    clearLogs,
    getSystemMetrics,
  };
}