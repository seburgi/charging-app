import { memo } from 'react';
import Button from './ui/Button';

export type ViewMode = "graph" | "table";

interface ChartModeToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

function ChartModeToggle({ viewMode, onViewModeChange }: ChartModeToggleProps) {
  return (
    <div className="mb-6">
      <div className="flex gap-2">
        <Button
          variant={viewMode === 'table' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => onViewModeChange('table')}
        >
          📊 Table Mode
        </Button>
        <Button
          variant={viewMode === 'graph' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => onViewModeChange('graph')}
        >
          📈 Graph Mode
        </Button>
      </div>
    </div>
  );
}

export default memo(ChartModeToggle);