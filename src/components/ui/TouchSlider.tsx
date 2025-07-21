import React, { memo, useRef, useState, useEffect, useCallback } from 'react';

interface TouchSliderProps {
  id?: string;
  label?: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
  unit?: string;
  helperText?: string;
  className?: string;
}

const TouchSlider = memo(({
  id,
  label,
  value,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  unit = '',
  helperText,
  className = ''
}: TouchSliderProps) => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, value: 0 });

  const normalizedValue = Math.max(min, Math.min(max, value));
  const percentage = ((normalizedValue - min) / (max - min)) * 100;
  const isNegativeRange = min < 0;
  const zeroPosition = isNegativeRange ? Math.abs(min) / (max - min) * 100 : 0;

  const handleStart = useCallback((clientX: number) => {
    setIsDragging(true);
    setDragStart({ x: clientX, value: normalizedValue });
    
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(30);
    }
  }, [normalizedValue]);

  const handleMove = useCallback((clientX: number) => {
    if (!isDragging || !sliderRef.current) return;

    const slider = sliderRef.current;
    const rect = slider.getBoundingClientRect();
    const deltaX = clientX - dragStart.x;
    const deltaPercentage = (deltaX / rect.width) * 100;
    const deltaValue = (deltaPercentage / 100) * (max - min);
    
    let newValue = dragStart.value + deltaValue;
    
    // Round to step
    newValue = Math.round(newValue / step) * step;
    
    // Clamp to bounds
    newValue = Math.max(min, Math.min(max, newValue));
    
    if (newValue !== value) {
      onChange(newValue);
      
      // Light haptic feedback on value change
      if ('vibrate' in navigator) {
        navigator.vibrate(10);
      }
    }
  }, [isDragging, dragStart, max, min, step, value, onChange]);

  const handleEnd = useCallback(() => {
    setIsDragging(false);
    
    // End haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
  }, []);

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleStart(e.clientX);
  };

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    // Don't prevent default here since we're using passive listeners
    handleStart(e.touches[0].clientX);
  };

  // Global mouse/touch move and end events
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => handleMove(e.clientX);
    const handleTouchMove = (e: TouchEvent) => {
      // Only prevent default on touchmove to avoid scrolling during drag
      if (e.cancelable) {
        e.preventDefault();
      }
      handleMove(e.touches[0].clientX);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleEnd, { passive: true });

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, handleMove, handleEnd]);

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      
      {/* Value Display */}
      <div className="flex justify-between items-center">
        <span className={`text-lg font-semibold ${
          normalizedValue >= 0 
            ? 'text-gray-900 dark:text-white' 
            : 'text-orange-600 dark:text-orange-400'
        }`}>
          {normalizedValue.toFixed(step < 1 ? 1 : 0)}{unit}
          {normalizedValue < 0 && (
            <span className="text-xs text-orange-500 dark:text-orange-400 ml-1">
              (you get paid)
            </span>
          )}
        </span>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {min}{unit} - {max}{unit}
        </div>
      </div>

      {/* Touch Slider */}
      <div
        ref={sliderRef}
        className={`
          relative h-12 bg-gray-200 dark:bg-gray-700 rounded-lg cursor-pointer
          touch-none select-none overscroll-none
          ${isDragging ? 'bg-blue-100 dark:bg-blue-900/30' : ''}
        `}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        style={{ touchAction: 'none' }}
      >
        {/* Zero line indicator for negative ranges */}
        {isNegativeRange && (
          <div
            className="absolute top-0 w-0.5 h-full bg-gray-400 dark:bg-gray-500 z-10"
            style={{ left: `${zeroPosition}%` }}
          />
        )}

        {/* Track Fill */}
        <div
          className={`absolute top-0 h-full rounded-lg transition-all duration-150 ${
            normalizedValue >= 0 
              ? 'bg-gradient-to-r from-primary-500 to-secondary-500' 
              : 'bg-gradient-to-r from-orange-500 to-red-500'
          }`}
          style={{
            left: isNegativeRange ? `${Math.min(zeroPosition, percentage)}%` : '0%',
            width: `${Math.abs(percentage - (isNegativeRange ? zeroPosition : 0))}%`
          }}
        />
        
        {/* Thumb */}
        <div
          className={`
            absolute top-1/2 w-8 h-8 bg-white dark:bg-gray-200 
            border-2 border-primary-500 rounded-full shadow-lg
            transform -translate-y-1/2 transition-all duration-150
            ${isDragging ? 'scale-110 shadow-xl' : ''}
          `}
          style={{ left: `calc(${percentage}% - 16px)` }}
        >
          {/* Thumb indicator */}
          <div className="absolute inset-1 bg-primary-500 rounded-full opacity-60" />
        </div>
        
        {/* Touch target expansion */}
        <div className="absolute inset-0 -m-4" />
      </div>

      {helperText && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {helperText}
        </p>
      )}
    </div>
  );
});

TouchSlider.displayName = 'TouchSlider';

export default TouchSlider;