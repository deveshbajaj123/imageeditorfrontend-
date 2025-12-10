export default function BlurTool({ blur, onBlurChange }) {
  return (
    <div className="space-y-4">
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="text-gray-300 text-sm font-medium">
            ⚪ Blur Amount
          </label>
          <span className="text-gray-400 text-sm">{blur}px</span>
        </div>
        <input
          type="range"
          min="0"
          max="20"
          value={blur}
          onChange={(e) => onBlurChange(Number(e.target.value))}
          className="w-full"
        />
      </div>

      <div className="bg-gray-900 rounded-lg p-3">
        <p className="text-xs text-gray-400 mb-2">
          Blur preview:
        </p>
        <div className="flex gap-2">
          <div 
            className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded"
            style={{ filter: `blur(${blur}px)` }}
          />
          <div className="flex-1 text-xs text-gray-500">
            {blur === 0 && 'No blur'}
            {blur > 0 && blur <= 5 && 'Slight blur'}
            {blur > 5 && blur <= 10 && 'Medium blur'}
            {blur > 10 && 'Heavy blur'}
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-400">
        Applied uniformly to entire image
      </p>
    </div>
  );
}
