import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { TimeRange, HistoricalPeriod } from '../types';
import { historicalPeriods } from '../data/periods';

interface TimelineProps {
  timeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
}

const Timeline: React.FC<TimelineProps> = ({ timeRange, onTimeRangeChange }) => {
  const { t } = useTranslation();
  const [isDragging, setIsDragging] = useState<'start' | 'end' | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  
  const minYear = -500;
  const maxYear = 2024;
  
  const yearToPosition = (year: number) => {
    return ((year - minYear) / (maxYear - minYear)) * 100;
  };
  
  const positionToYear = (position: number) => {
    return Math.round(minYear + (position / 100) * (maxYear - minYear));
  };

  const handleMouseDown = (type: 'start' | 'end') => {
    setIsDragging(type);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !timelineRef.current) return;
    
    const rect = timelineRef.current.getBoundingClientRect();
    const position = ((e.clientX - rect.left) / rect.width) * 100;
    const year = positionToYear(Math.max(0, Math.min(100, position)));
    
    if (isDragging === 'start') {
      onTimeRangeChange({ start: Math.min(year, timeRange.end - 10), end: timeRange.end });
    } else {
      onTimeRangeChange({ start: timeRange.start, end: Math.max(year, timeRange.start + 10) });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(null);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove as any);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove as any);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  return (
    <div className="bg-black/80 backdrop-blur-sm rounded-xl p-4 shadow-2xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white flex items-center">
          <div className="w-2 h-2 bg-purple-400 rounded-full mr-2"></div>
          {t('timeline.title')}
        </h2>
        <div className="text-sm text-gray-300">
          <span className="text-blue-400 font-medium">{timeRange.start}</span> - <span className="text-purple-400 font-medium">{timeRange.end}</span>
        </div>
      </div>
      
      <div className="space-y-4">
        {/* Main timeline with overlaid period bands */}
        <div
          ref={timelineRef}
          className="relative h-10 bg-gray-700 rounded-lg cursor-pointer"
          onMouseMove={handleMouseMove}
        >
          {/* Timeline track */}
          <div className="absolute inset-0 bg-gradient-to-r from-gray-600 to-gray-500 rounded-lg"></div>
          
          {/* Historical period bands overlaid on timeline */}
          {historicalPeriods.map((period) => (
            <div
              key={period.name}
              className="absolute h-full rounded text-xs text-white flex items-center justify-center font-medium opacity-60"
              style={{
                left: `${yearToPosition(period.start)}%`,
                width: `${yearToPosition(period.end) - yearToPosition(period.start)}%`,
                backgroundColor: period.color,
                minWidth: '60px'
              }}
            >
              {t(`timeline.periods.${period.name}`, period.name)}
            </div>
          ))}
          
          {/* Selected range */}
          <div
            className="absolute h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg opacity-80"
            style={{
              left: `${yearToPosition(timeRange.start)}%`,
              width: `${yearToPosition(timeRange.end) - yearToPosition(timeRange.start)}%`
            }}
          ></div>
          
          {/* Start handle */}
          <div
            className="absolute top-1/2 transform -translate-y-1/2 w-5 h-5 bg-blue-400 rounded-full cursor-grab active:cursor-grabbing shadow-lg border-2 border-white hover:scale-110 transition-transform z-10"
            style={{ left: `${yearToPosition(timeRange.start)}%`, marginLeft: '-10px' }}
            onMouseDown={() => handleMouseDown('start')}
          >
            <div className="w-1.5 h-1.5 bg-white rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
          </div>
          
          {/* End handle */}
          <div
            className="absolute top-1/2 transform -translate-y-1/2 w-5 h-5 bg-purple-400 rounded-full cursor-grab active:cursor-grabbing shadow-lg border-2 border-white hover:scale-110 transition-transform z-10"
            style={{ left: `${yearToPosition(timeRange.end)}%`, marginLeft: '-10px' }}
            onMouseDown={() => handleMouseDown('end')}
          >
            <div className="w-1.5 h-1.5 bg-white rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
          </div>
        </div>
        
        {/* Year markers */}
        <div className="relative h-4">
          {[-500, 0, 500, 1000, 1500, 1800, 1900, 2000, 2024].map((year) => (
            <div
              key={year}
              className="absolute text-xs text-gray-400 transform -translate-x-1/2"
              style={{ left: `${yearToPosition(year)}%` }}
            >
              <div className="w-px h-3 bg-gray-600 mb-1"></div>
              {year < 0 ? `${Math.abs(year)} BC` : year}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Timeline;