'use client';

/**
 * Reusable floor call button component
 * Handles floor call interactions with proper validation
 * 
 * @author Tarang Shah
 * @version 1.0.0
 */

import { SYSTEM_CONFIG } from '@/lib/constants';

interface FloorCallButtonsProps {
  floor: number;
  onFloorCall: (floor: number, direction: 'up' | 'down') => void;
}

export function FloorCallButtons({ floor, onFloorCall }: FloorCallButtonsProps) {
  const canGoUp = floor < SYSTEM_CONFIG.BUILDING.FLOORS;
  const canGoDown = floor > 1;

  const handleUpCall = () => {
    if (canGoUp) {
      onFloorCall(floor, 'up');
    }
  };

  const handleDownCall = () => {
    if (canGoDown) {
      onFloorCall(floor, 'down');
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <button
        onClick={handleUpCall}
        disabled={!canGoUp}
        className={`
          w-8 h-6 rounded text-xs font-bold transition-all duration-200
          ${canGoUp 
            ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm hover:shadow-md active:scale-95' 
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }
        `}
        aria-label={`Call elevator up from floor ${floor}`}
        title={canGoUp ? `Call elevator up from floor ${floor}` : 'Cannot go up from top floor'}
      >
        ↑
      </button>
      
      <button
        onClick={handleDownCall}
        disabled={!canGoDown}
        className={`
          w-8 h-6 rounded text-xs font-bold transition-all duration-200
          ${canGoDown 
            ? 'bg-red-500 hover:bg-red-600 text-white shadow-sm hover:shadow-md active:scale-95' 
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }
        `}
        aria-label={`Call elevator down from floor ${floor}`}
        title={canGoDown ? `Call elevator down from floor ${floor}` : 'Cannot go down from ground floor'}
      >
        ↓
      </button>
    </div>
  );
}