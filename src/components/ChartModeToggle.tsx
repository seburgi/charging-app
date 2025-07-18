export type ViewMode = "graph" | "table";

interface ChartModeToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export default function ChartModeToggle({ viewMode, onViewModeChange }: ChartModeToggleProps) {
  return (
    <div className="mb-4">
      <button
        className={`mr-2 px-3 py-1 border rounded ${
          viewMode === 'table' ? 'bg-blue-200' : 'bg-white'
        }`}
        onClick={() => onViewModeChange('table')}
      >
        Table Mode
      </button>
      <button
        className={`px-3 py-1 border rounded ${
          viewMode === 'graph' ? 'bg-blue-200' : 'bg-white'
        }`}
        onClick={() => onViewModeChange('graph')}
      >
        Graph Mode
      </button>
    </div>
  );
}