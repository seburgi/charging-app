import { memo } from 'react';
import Button from './ui/Button';

export type ViewMode = "graph" | "table";

interface ChartModeToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

function ChartModeToggle({ viewMode, onViewModeChange }: ChartModeToggleProps) {
  return (
    <div className="mb-2 md:mb-3">
      <div className="flex gap-2">
        <Button
          variant={viewMode === 'table' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => onViewModeChange('table')}
          className="text-xs md:text-sm px-2 md:px-3"
        >
          📊 <span className="hidden sm:inline">Table Mode</span><span className="sm:hidden">Table</span>
        </Button>
        <Button
          variant={viewMode === 'graph' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => onViewModeChange('graph')}
          className="text-xs md:text-sm px-2 md:px-3"
        >
          📈 <span className="hidden sm:inline">Graph Mode</span><span className="sm:hidden">Graph</span>
        </Button>
      </div>
    </div>
  );
}

export default memo(ChartModeToggle);