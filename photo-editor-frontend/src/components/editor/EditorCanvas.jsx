import { useEffect, useRef, useState } from 'react';

export default function EditorCanvas({
  imageRef,
  edits,
  zoom,
  cropMode,
  tempCropArea,
  onCropAreaChange
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);

  // ---------------------------------------
  // RENDER CANVAS ON EVERY CHANGE
  // ---------------------------------------
  useEffect(() => {
    if (!imageRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = imageRef.current;

    // BUILD FILTER STRING ONCE
    const filterParts = [];
    if (edits.brightness !== 100) filterParts.push(`brightness(${edits.brightness}%)`);
    if (edits.contrast !== 100)   filterParts.push(`contrast(${edits.contrast}%)`);
    if (edits.saturation !== 100) filterParts.push(`saturate(${edits.saturation}%)`);
    if (edits.blur > 0)           filterParts.push(`blur(${edits.blur}px)`);
    const filterString = filterParts.length ? filterParts.join(" ") : "none";

    // -------------------------------
    // IF CROP IS ALREADY APPLIED
    // -------------------------------
    if (edits.crop) {
      const { x, y, width, height } = edits.crop;

      canvas.width = width;
      canvas.height = height;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();

      // transforms
      const cx = width / 2;
      const cy = height / 2;
      ctx.translate(cx, cy);

      if (edits.flipH) ctx.scale(-1, 1);
      if (edits.flipV) ctx.scale(1, -1);
      if (edits.rotation) ctx.rotate((edits.rotation * Math.PI) / 180);

      ctx.translate(-cx, -cy);

      ctx.filter = filterString;

      ctx.drawImage(
        img,
        x, y, width, height,
        0, 0, width, height
      );

      ctx.restore();
    }

    // -------------------------------
    // NORMAL FULL IMAGE (NO CROP)
    // -------------------------------
    else {
      canvas.width = img.width;
      canvas.height = img.height;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      ctx.translate(cx, cy);

      if (edits.flipH) ctx.scale(-1, 1);
      if (edits.flipV) ctx.scale(1, -1);
      if (edits.rotation) ctx.rotate((edits.rotation * Math.PI) / 180);

      ctx.translate(-cx, -cy);

      ctx.filter = filterString;
      ctx.drawImage(img, 0, 0);

      ctx.restore();
    }

    // -------------------------------
    // DRAW CROP OVERLAY IF IN CROP MODE
    // -------------------------------
    if (
      cropMode &&
      tempCropArea &&
      !edits.crop &&
      tempCropArea.width > 0 &&
      tempCropArea.height > 0
    ) {
      const { x, y, width, height } = tempCropArea;

      // darken outside
      ctx.fillStyle = "rgba(0,0,0,0.45)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // clear crop area
      ctx.clearRect(x, y, width, height);

      // redraw image inside crop area
      ctx.save();
      ctx.filter = filterString;
      ctx.drawImage(img, 0, 0);
      ctx.restore();

      // border
      ctx.strokeStyle = "#3b82f6";
      ctx.lineWidth = 3;
      ctx.strokeRect(x, y, width, height);

      // corner handles
      const handle = 12;
      const corners = [
        [x, y],
        [x + width, y],
        [x, y + height],
        [x + width, y + height]
      ];

      ctx.fillStyle = "#3b82f6";
      corners.forEach(([cx, cy]) => {
        ctx.fillRect(cx - handle / 2, cy - handle / 2, handle, handle);
      });
    }

  }, [imageRef.current, edits, cropMode, tempCropArea]);

  // ---------------------------------------
  // UTILITY: Get mouse position relative to canvas pixels
  // ---------------------------------------
  const getMousePos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  // ---------------------------------------
  // CROP MOUSE INTERACTIONS
  // ---------------------------------------
  const handleMouseDown = (e) => {
    if (!cropMode) return;

    const pos = getMousePos(e);
    setIsDragging(true);
    setDragStart(pos);

    onCropAreaChange({
      x: pos.x,
      y: pos.y,
      width: 0,
      height: 0
    });
  };

  const handleMouseMove = (e) => {
    if (!cropMode || !isDragging || !dragStart) return;

    const pos = getMousePos(e);
    const width = pos.x - dragStart.x;
    const height = pos.y - dragStart.y;

    onCropAreaChange({
      x: width < 0 ? pos.x : dragStart.x,
      y: height < 0 ? pos.y : dragStart.y,
      width: Math.abs(width),
      height: Math.abs(height)
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragStart(null);
  };

  return (
    <div
      ref={containerRef}
      className="flex-1 bg-gray-900 p-4 overflow-auto flex items-center justify-center"
      style={{ userSelect: "none" }}
    >
      <div
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: "center"
        }}
      >
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className={`max-w-full h-auto ${
            cropMode ? "cursor-crosshair" : ""
          }`}
          style={{ maxHeight: "80vh" }}
        />
      </div>
    </div>
  );
}
