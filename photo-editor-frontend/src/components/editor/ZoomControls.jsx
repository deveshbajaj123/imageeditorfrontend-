export default function ZoomControls({ zoom, onZoomChange, onReset }) {
  return (
    <div className="space-y-4">
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="text-gray-300 text-sm font-medium">
            🔍 Zoom
          </label>
          <span className="text-gray-400 text-sm">{Math.round(zoom * 100)}%</span>
        </div>
        <input
          type="range"
          min="0.1"
          max="3"
          step="0.1"
          value={zoom}
          onChange={(e) => onZoomChange(parseFloat(e.target.value))}
          className="w-full"
        />
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onZoomChange(Math.max(0.1, zoom - 0.1))}
          className="flex-1 bg-gray-700 text-white py-2 rounded-lg hover:bg-gray-600 transition-colors"
        >
          −
        </button>
        <button
          onClick={() => onReset()}
          className="flex-1 bg-gray-700 text-white py-2 rounded-lg hover:bg-gray-600 transition-colors text-sm"
        >
          100%
        </button>
        <button
          onClick={() => onZoomChange(Math.min(3, zoom + 0.1))}
          className="flex-1 bg-gray-700 text-white py-2 rounded-lg hover:bg-gray-600 transition-colors"
        >
          +
        </button>
      </div>

      <p className="text-xs text-gray-400">
        Use mouse wheel to zoom in/out
      </p>
    </div>
  );
}