import React, { useState, useRef, useEffect } from 'react';
import './ImageCropper.css';

interface ImageCropperProps {
  imageData: string;
  onCropConfirm: (croppedImage: string) => void;
  onCancel: () => void;
}

interface CropPosition {
  x: number;
  y: number;
}

const MIN_CROP_SIZE = 256; // Minimum size (matches model input)
const INITIAL_CROP_SIZE = 256; // Initial crop box size

const ImageCropper: React.FC<ImageCropperProps> = ({ imageData, onCropConfirm, onCancel }) => {
  const [cropPosition, setCropPosition] = useState<CropPosition>({ x: 0, y: 0 });
  const [cropSize, setCropSize] = useState(INITIAL_CROP_SIZE);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState<CropPosition>({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState<{ mouseX: number; mouseY: number; initialSize: number }>({ mouseX: 0, mouseY: 0, initialSize: 0 });
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load image and center crop box
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      let displayWidth = img.width;
      let displayHeight = img.height;

      // Scale down if wider than 800px
      if (displayWidth > 800) {
        const scale = 800 / displayWidth;
        displayWidth = 800;
        displayHeight = img.height * scale;
      }

      setImageDimensions({ width: displayWidth, height: displayHeight });

      // Center the crop box
      const centerX = (displayWidth - INITIAL_CROP_SIZE) / 2;
      const centerY = (displayHeight - INITIAL_CROP_SIZE) / 2;
      setCropPosition({ x: Math.max(0, centerX), y: Math.max(0, centerY) });
    };
    img.src = imageData;
  }, [imageData]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Check if clicking on a resize handle (corner)
    const handleSize = 20;
    const isOnBottomRightHandle = 
      mouseX >= cropPosition.x + cropSize - handleSize &&
      mouseX <= cropPosition.x + cropSize &&
      mouseY >= cropPosition.y + cropSize - handleSize &&
      mouseY <= cropPosition.y + cropSize;

    if (isOnBottomRightHandle) {
      setIsResizing(true);
      setResizeStart({ 
        mouseX, 
        mouseY, 
        initialSize: cropSize 
      });
      return;
    }

    // Check if click is inside crop box for dragging
    if (
      mouseX >= cropPosition.x &&
      mouseX <= cropPosition.x + cropSize &&
      mouseY >= cropPosition.y &&
      mouseY <= cropPosition.y + cropSize
    ) {
      setIsDragging(true);
      setDragOffset({
        x: mouseX - cropPosition.x,
        y: mouseY - cropPosition.y,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (isResizing) {
      // Calculate new size based on diagonal movement
      const deltaX = mouseX - resizeStart.mouseX;
      const deltaY = mouseY - resizeStart.mouseY;
      const delta = Math.max(deltaX, deltaY); // Use larger delta to keep square
      
      let newSize = resizeStart.initialSize + delta;
      
      // Constrain to minimum size and image boundaries
      newSize = Math.max(MIN_CROP_SIZE, newSize);
      newSize = Math.min(newSize, imageDimensions.width - cropPosition.x);
      newSize = Math.min(newSize, imageDimensions.height - cropPosition.y);
      
      setCropSize(newSize);
    } else if (isDragging) {
      let newX = mouseX - dragOffset.x;
      let newY = mouseY - dragOffset.y;

      // Constrain to image boundaries
      newX = Math.max(0, Math.min(newX, imageDimensions.width - cropSize));
      newY = Math.max(0, Math.min(newY, imageDimensions.height - cropSize));

      setCropPosition({ x: newX, y: newY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  const handleConfirmCrop = () => {
    if (!imageRef.current) return;

    // Create canvas to extract the cropped region - always output 256x256
    const canvas = document.createElement('canvas');
    canvas.width = MIN_CROP_SIZE;
    canvas.height = MIN_CROP_SIZE;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    // Calculate scale factor between displayed image and actual image
    const img = new Image();
    img.onload = () => {
      const scaleX = img.width / imageDimensions.width;
      const scaleY = img.height / imageDimensions.height;

      // Draw the cropped portion and scale down to 256x256 if needed
      ctx.drawImage(
        img,
        cropPosition.x * scaleX,
        cropPosition.y * scaleY,
        cropSize * scaleX,
        cropSize * scaleY,
        0,
        0,
        MIN_CROP_SIZE,
        MIN_CROP_SIZE
      );

      const croppedDataURL = canvas.toDataURL('image/jpeg', 0.95);
      onCropConfirm(croppedDataURL);
    };
    img.src = imageData;
  };

  return (
    <div className="cropper-container">
      <div className="cropper-header">
        <h3>Position & Size Crop Area</h3>
        <p className="cropper-instructions">
          Drag the square to move it. Drag the bottom-right corner to resize (min 256×256px). The final output will always be 256×256px.
        </p>
      </div>

      <div
        ref={containerRef}
        className="cropper-image-container"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          width: imageDimensions.width,
          height: imageDimensions.height,
          cursor: isDragging ? 'grabbing' : isResizing ? 'nwse-resize' : 'grab',
        }}
      >
        <img
          ref={imageRef}
          src={imageData}
          alt="Crop preview"
          className="cropper-image"
          draggable={false}
          style={{
            width: imageDimensions.width,
            height: imageDimensions.height,
          }}
        />

        {/* Crop box overlay */}
        <div
          className="crop-box"
          style={{
            left: cropPosition.x,
            top: cropPosition.y,
            width: cropSize,
            height: cropSize,
          }}
        >
          {/* L-shaped corner indicators */}
          <div className="crop-corner corner-top-left"></div>
          <div className="crop-corner corner-top-right"></div>
          <div className="crop-corner corner-bottom-left"></div>
          <div className="crop-corner corner-bottom-right resize-handle"></div>

          {/* Size label */}
          <div className="crop-size-label">{cropSize}×{cropSize}px → 256×256px</div>
        </div>
      </div>

      <div className="cropper-actions">
        <button className="btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button className="btn-primary" onClick={handleConfirmCrop}>
          Confirm Crop
        </button>
      </div>
    </div>
  );
};

export default ImageCropper;
