import React from 'react';
import { Filter, RotateCcw } from 'lucide-react';

interface SearchFiltersProps {
  selectedMovement: string;
  selectedPeriod: string;
  onMovementChange: (movement: string) => void;
  onPeriodChange: (period: string) => void;
  onReset: () => void;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({
  selectedMovement,
  selectedPeriod,
  onMovementChange,
  onPeriodChange,
  onReset
}) => {
  const movements = [
    'All Movements', 'Renaissance', 'Baroque', 'Impressionism', 
    'Post-Impressionism', 'Cubism', 'Surrealism', 'Abstract'
  ];
  
  const periods = [
    'All Periods', 'Ancient', 'Medieval', 'Renaissance', 
    'Baroque', 'Modern', 'Contemporary'
  ];

  return (
    <div className="bg-black/80 backdrop-blur-sm rounded-xl p-4 shadow-2xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-white flex items-center">
          <Filter size={18} className="mr-2 text-orange-400" />
          Filters
        </h3>
        <button
          onClick={onReset}
          className="flex items-center px-3 py-1 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors text-sm"
        >
          <RotateCcw size={14} className="mr-1" />
          Reset
        </button>
      </div>
      
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Art Movement
          </label>
          <select
            value={selectedMovement}
            onChange={(e) => onMovementChange(e.target.value)}
            className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none"
          >
            {movements.map((movement) => (
              <option key={movement} value={movement}>
                {movement}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Historical Period
          </label>
          <select
            value={selectedPeriod}
            onChange={(e) => onPeriodChange(e.target.value)}
            className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none"
          >
            {periods.map((period) => (
              <option key={period} value={period}>
                {period}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default SearchFilters;