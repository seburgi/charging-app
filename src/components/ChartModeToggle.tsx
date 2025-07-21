import { memo } from 'react';
import Button from './ui/Button';

export type ViewMode = "graph" | "table";

interface ChartModeToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

function ChartModeToggle({ viewMode, onViewModeChange }: ChartModeToggleProps) {
  const handleModeChange = (mode: ViewMode) => {
    // Haptic feedback on mode change
    if ('vibrate' in navigator) {
      navigator.vibrate(40);
    }
    onViewModeChange(mode);
  };

  return (
    <div className="mb-2 md:mb-3">
      <div className="flex gap-2">
        <Button
          variant={viewMode === 'table' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => handleModeChange('table')}
          className="text-xs md:text-sm px-3 py-3 md:px-4 md:py-2 min-h-[44px] touch-manipulation"
        >
          📊 <span className="hidden sm:inline">Table Mode</span><span className="sm:hidden">Table</span>
        </Button>
        <Button
          variant={viewMode === 'graph' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => handleModeChange('graph')}
          className="text-xs md:text-sm px-3 py-3 md:px-4 md:py-2 min-h-[44px] touch-manipulation"
        >
          📈 <span className="hidden sm:inline">Graph Mode</span><span className="sm:hidden">Graph</span>
        </Button>
      </div>
    </div>
  );
}

export default memo(ChartModeToggle);