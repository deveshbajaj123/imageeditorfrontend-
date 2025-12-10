import { useState } from 'react';

export default function CropTool({ isActive, onCrop, cropArea, onCropAreaChange, imageSize }) {
  const [aspectRatio, setAspectRatio] = useState('free');

  const aspectRatios = [
    { label: 'Free', value: 'free' },
    { label: '1:1', value: '1:1' },
    { label: '4:3', value: '4:3' },
    { label: '16:9', value: '16:9' },
    { label: '3:4', value: '3:4' },
  ];

  const handleAspectChange = (ratio) => {
    setAspectRatio(ratio);
    
    if (ratio === 'free' || !imageSize.width || !imageSize.height) {
      return;
    }

    // Calculate new crop area based on aspect ratio
    const [w, h] = ratio.split(':').map(Number);
    const currentAspect = imageSize.width / imageSize.height;
    const targetAspect = w / h;

    let newWidth, newHeight;
    
    if (currentAspect > targetAspect) {
      newHeight = imageSize.height * 0.8;
      newWidth = newHeight * targetAspect;
    } else {
      newWidth = imageSize.width * 0.8;
      newHeight = newWidth / targetAspect;
    }

    const newCropArea = {
      x: (imageSize.width - newWidth) / 2,
      y: (imageSize.height - newHeight) / 2,
      width: newWidth,
      height: newHeight,
    };
    
    onCropAreaChange(newCropArea);
  };

  if (!isActive) return null;

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-gray-300 text-sm font-medium mb-3">
          Aspect Ratio
        </label>
        <div className="grid grid-cols-5 gap-2">
          {aspectRatios.map((ratio) => (
            <button
              key={ratio.value}
              onClick={() => handleAspectChange(ratio.value)}
              className={`py-2 px-1 rounded-lg text-sm transition-colors ${
                aspectRatio === ratio.value
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-700 text-white hover:bg-gray-600'
              }`}
            >
              {ratio.label}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={onCrop}
        disabled={!cropArea || cropArea.width === 0 || cropArea.height === 0}
        className="w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Apply Crop
      </button>

      <p className="text-xs text-gray-400">
        Drag on the canvas to select crop area
      </p>
      
      {cropArea && cropArea.width > 0 && (
        <div className="text-xs text-gray-400 space-y-1">
          <div>Position: ({Math.round(cropArea.x)}, {Math.round(cropArea.y)})</div>
          <div>Size: {Math.round(cropArea.width)} × {Math.round(cropArea.height)}</div>
        </div>
      )}
    </div>
  );
}
