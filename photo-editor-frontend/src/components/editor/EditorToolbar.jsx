export default function EditorToolbar({ activeTool, onToolChange }) {
  const tools = [
    { id: 'adjust', label: 'Adjust', icon: '☀️' },
    { id: 'crop', label: 'Crop', icon: '✂️' },
    { id: 'zoom', label: 'Zoom', icon: '🔍' },
    { id: 'blur', label: 'Blur', icon: '⚪' },
    { id: 'transform', label: 'Transform', icon: '🔄' },
  ];

  return (
    <div className="mb-6">
      <div className="grid grid-cols-5 gap-2">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => onToolChange(tool.id)}
            className={`py-3 rounded-lg transition-colors ${
              activeTool === tool.id
                ? 'bg-primary-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <div className="text-xl mb-1">{tool.icon}</div>
            <div className="text-xs">{tool.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
}