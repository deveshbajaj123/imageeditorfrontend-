import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { photoAPI } from '../services/api';
import Toast from '../components/shared/Toast';
import { useToast } from '../hooks/useToast';
import EditorToolbar from '../components/editor/EditorToolbar';
import EditorCanvas from '../components/editor/EditorCanvas';
import CropTool from '../components/editor/CropTool';
import ZoomControls from '../components/editor/ZoomControls';
import BlurTool from '../components/editor/BlurTool';

export default function EditorAdvanced() {
  const { photoId } = useParams();
  const navigate = useNavigate();
  const imageRef = useRef(null);
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTool, setActiveTool] = useState('adjust');
  const [zoom, setZoom] = useState(1);
  const [tempCropArea, setTempCropArea] = useState(null); // NEW: temporary crop selection
  const [edits, setEdits] = useState({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    rotation: 0,
    flipH: false,
    flipV: false,
    blur: 0,
    crop: null,
  });
  const { toasts, showToast, hideToast } = useToast();

  useEffect(() => {
    fetchPhoto();
  }, [photoId]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
      if (e.key === 'Escape') {
        handleCancel();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const fetchPhoto = async () => {
    setLoading(true);
    
    try {
      const response = await photoAPI.getPhoto(photoId);
      const photoData = response.data.photo;
      setPhoto(photoData);
      
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        imageRef.current = img;
        setLoading(false);
      };
      
      img.onerror = () => {
        showToast('Failed to load image', 'error');
        setTimeout(() => navigate('/dashboard'), 2000);
      };
      
      img.src = photoData.original_url;
      
    } catch (error) {
      console.error('Error:', error);
      showToast('Failed to load photo', 'error');
      navigate('/dashboard');
    }
  };

  const handleSave = async () => {
  if (saving) return;
  setSaving(true);

  try {
    const img = imageRef.current;

    // 1️⃣ CREATE TEMP CANVAS
    const tempCanvas = document.createElement("canvas");
    const ctx = tempCanvas.getContext("2d");

    // Determine save size (crop first)
    let sx = 0, sy = 0, sw = img.width, sh = img.height;
    if (edits.crop) {
      sx = edits.crop.x;
      sy = edits.crop.y;
      sw = edits.crop.width;
      sh = edits.crop.height;
    }

    tempCanvas.width = sw;
    tempCanvas.height = sh;

    // 2️⃣ APPLY ROTATION + FLIP BEFORE DRAW
    ctx.save();
    ctx.translate(sw / 2, sh / 2);

    if (edits.flipH) ctx.scale(-1, 1);
    if (edits.flipV) ctx.scale(1, -1);

    if (edits.rotation !== 0) {
      ctx.rotate((edits.rotation * Math.PI) / 180);
    }

    ctx.translate(-sw / 2, -sh / 2);

    // 3️⃣ DRAW BASE IMAGE (cropped region if any)
    ctx.drawImage(
      img,
      sx, sy, sw, sh,   // source
      0, 0, sw, sh      // destination
    );

    ctx.restore();

    // 4️⃣ APPLY REAL PIXEL FILTERS (no CSS filters!)
    const imageData = ctx.getImageData(0, 0, sw, sh);
    const data = imageData.data;

    const brightness = edits.brightness / 100;
    const contrast = (edits.contrast - 100) / 100;
    const saturation = edits.saturation / 100;
    const blurRadius = edits.blur;

    // REAL FILTER ENGINE
    for (let i = 0; i < data.length; i += 4) {
      // BRIGHTNESS
      data[i] *= brightness;
      data[i + 1] *= brightness;
      data[i + 2] *= brightness;

      // CONTRAST
      if (contrast !== 0) {
        data[i] = ((data[i] - 128) * (1 + contrast)) + 128;
        data[i + 1] = ((data[i + 1] - 128) * (1 + contrast)) + 128;
        data[i + 2] = ((data[i + 2] - 128) * (1 + contrast)) + 128;
      }

      // SATURATION
      if (saturation !== 1) {
        const gray = 0.2989 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        data[i] = gray + (data[i] - gray) * saturation;
        data[i + 1] = gray + (data[i + 1] - gray) * saturation;
        data[i + 2] = gray + (data[i + 2] - gray) * saturation;
      }

      // Clamp
      data[i] = Math.min(255, Math.max(0, data[i]));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1]));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2]));
    }

    ctx.putImageData(imageData, 0, 0);

    // 5️⃣ OPTIONAL: Apply blur (via stack blur algorithm)
    if (blurRadius > 0) {
      // basic canvas blur
      ctx.filter = `blur(${blurRadius}px)`;
      ctx.drawImage(tempCanvas, 0, 0);
      ctx.filter = "none";
    }

    // 6️⃣ SAVE AS JPEG
    tempCanvas.toBlob(
      async (blob) => {
        if (!blob) {
          showToast("Failed to generate edited image", "error");
          setSaving(false);
          return;
        }

        try {
          const formData = new FormData();
          formData.append("photos", blob, `edited_${photo.filename}`);
          await photoAPI.upload(formData);
          showToast("Photo saved successfully!");
          setTimeout(() => navigate("/dashboard"), 1000);
        } catch (error) {
          console.error("Upload error:", error);
          showToast("Failed to save photo", "error");
        }

        setSaving(false);
      },
      "image/jpeg",
      0.92
    );

  } catch (err) {
    console.error(err);
    showToast("Error processing image", "error");
    setSaving(false);
  }
};

  const handleCancel = () => navigate('/dashboard');
  
  const handleReset = () => {
    setEdits({
      brightness: 100,
      contrast: 100,
      saturation: 100,
      rotation: 0,
      flipH: false,
      flipV: false,
      blur: 0,
      crop: null,
    });
    setZoom(1);
    setTempCropArea(null); // NEW: reset temp crop area
    setActiveTool('adjust');
  };

  // UPDATED: handleCrop now uses tempCropArea
  const handleCrop = () => {
    if (tempCropArea && tempCropArea.width > 0 && tempCropArea.height > 0) {
      setEdits(prev => ({ ...prev, crop: tempCropArea }));
      setTempCropArea(null);
      setActiveTool('adjust');
      showToast('Crop applied');
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-white">Loading editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* Top bar */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={handleCancel}
            disabled={saving}
            className="text-gray-300 hover:text-white transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          {photo && (
            <span className="text-white font-medium truncate max-w-xs sm:max-w-md">
              {photo.filename}
            </span>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleReset}
            disabled={saving}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
          >
            Reset
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 font-medium"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Canvas area - UPDATED with new props */}
        <EditorCanvas
          imageRef={imageRef}
          edits={edits}
          zoom={zoom}
          cropMode={activeTool === 'crop'}
          tempCropArea={tempCropArea}
          onCropAreaChange={setTempCropArea}
        />

        {/* Controls sidebar */}
        <div className="w-full lg:w-80 bg-gray-800 p-4 lg:p-6 overflow-y-auto">
          <h3 className="text-white text-lg font-semibold mb-6">Edit Tools</h3>

          <EditorToolbar activeTool={activeTool} onToolChange={setActiveTool} />

          {/* Adjust Tools */}
          {activeTool === 'adjust' && (
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-gray-300 text-sm font-medium">☀️ Brightness</label>
                  <span className="text-gray-400 text-sm">{edits.brightness}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={edits.brightness}
                  onChange={e => setEdits(p => ({ ...p, brightness: +e.target.value }))}
                  className="w-full"
                />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-gray-300 text-sm font-medium">◐ Contrast</label>
                  <span className="text-gray-400 text-sm">{edits.contrast}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={edits.contrast}
                  onChange={e => setEdits(p => ({ ...p, contrast: +e.target.value }))}
                  className="w-full"
                />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-gray-300 text-sm font-medium">🎨 Saturation</label>
                  <span className="text-gray-400 text-sm">{edits.saturation}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={edits.saturation}
                  onChange={e => setEdits(p => ({ ...p, saturation: +e.target.value }))}
                  className="w-full"
                />
              </div>

              {/* Show crop applied indicator */}
              {edits.crop && (
                <div className="mt-4 p-3 bg-green-900/30 border border-green-700 rounded-lg">
                  <p className="text-green-400 text-sm font-medium mb-1">✓ Crop Applied</p>
                  <p className="text-green-300 text-xs">
                    {Math.round(edits.crop.width)} × {Math.round(edits.crop.height)}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Crop Tool - UPDATED with new props */}
          {activeTool === 'crop' && (
            <CropTool
              isActive={true}
              onCrop={handleCrop}
              cropArea={tempCropArea}
              onCropAreaChange={setTempCropArea}
              imageSize={{ width: imageRef.current?.width || 0, height: imageRef.current?.height || 0 }}
            />
          )}

          {/* Zoom Controls */}
          {activeTool === 'zoom' && (
            <ZoomControls
              zoom={zoom}
              onZoomChange={setZoom}
              onReset={() => setZoom(1)}
            />
          )}

          {/* Blur Tool */}
          {activeTool === 'blur' && (
            <BlurTool
              blur={edits.blur}
              onBlurChange={(value) => setEdits(p => ({ ...p, blur: value }))}
            />
          )}

          {/* Transform Tools */}
          {activeTool === 'transform' && (
            <div className="space-y-6">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-3">Rotate</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEdits(p => ({ ...p, rotation: (p.rotation - 90 + 360) % 360 }))}
                    className="flex-1 bg-gray-700 text-white py-2 rounded-lg hover:bg-gray-600"
                  >
                    ↶ 90°
                  </button>
                  <button
                    onClick={() => setEdits(p => ({ ...p, rotation: (p.rotation + 90) % 360 }))}
                    className="flex-1 bg-gray-700 text-white py-2 rounded-lg hover:bg-gray-600"
                  >
                    ↷ 90°
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-3">Flip</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEdits(p => ({ ...p, flipH: !p.flipH }))}
                    className={`flex-1 py-2 rounded-lg ${
                      edits.flipH ? 'bg-primary-600 text-white' : 'bg-gray-700 text-white hover:bg-gray-600'
                    }`}
                  >
                    ⇄ H
                  </button>
                  <button
                    onClick={() => setEdits(p => ({ ...p, flipV: !p.flipV }))}
                    className={`flex-1 py-2 rounded-lg ${
                      edits.flipV ? 'bg-primary-600 text-white' : 'bg-gray-700 text-white hover:bg-gray-600'
                    }`}
                  >
                    ⇅ V
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Toasts */}
      {toasts.map(t => <Toast key={t.id} message={t.message} type={t.type} onClose={() => hideToast(t.id)} />)}
    </div>
  );
}
