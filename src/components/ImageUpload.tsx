import React, { useRef, useState, useEffect } from 'react';
import type { ChangeEvent } from 'react';
import { validateImageFile, validateImageDimensions } from '../utils/imageProcessing';
import './ImageUpload.css';

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  isProcessing: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onImageSelect, isProcessing }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraMode, setIsCameraMode] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);

  // Handle video stream when it changes
  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.onloadedmetadata = () => {
        videoRef.current?.play().then(() => {
          setIsCameraReady(true);
          console.log('Camera ready');
        }).catch((error) => {
          console.error('Error playing video:', error);
        });
      };
    }
  }, [stream]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!validateImageFile(file)) {
        alert('Please upload a valid image file (JPEG, PNG, or WebP)');
        return;
      }
      
      try {
        const { valid, width, height } = await validateImageDimensions(file);
        if (!valid) {
          alert(`Image is too small (${width}×${height}px). Please upload an image at least 256×256 pixels.`);
          return;
        }
        onImageSelect(file);
      } catch (error) {
        console.error('Error validating image:', error);
        alert('Failed to validate image dimensions');
      }
    }
  };

  const handleClick = () => {
    if (!isCameraMode) {
      fileInputRef.current?.click();
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (!validateImageFile(file)) {
        alert('Please upload a valid image file (JPEG, PNG, or WebP)');
        return;
      }
      
      try {
        const { valid, width, height } = await validateImageDimensions(file);
        if (!valid) {
          alert(`Image is too small (${width}×${height}px). Please upload an image at least 256×256 pixels.`);
          return;
        }
        onImageSelect(file);
      } catch (error) {
        console.error('Error validating image:', error);
        alert('Failed to validate image dimensions');
      }
    }
  };

  const startCamera = async () => {
    try {
      console.log('Requesting camera access...');
      const constraints = {
        video: { 
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      };
      
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('Camera access granted');
      setStream(mediaStream);
      setIsCameraMode(true);
      setIsCameraReady(false);
    } catch (error) {
      console.error('Error accessing camera:', error);
      
      // Try fallback without facingMode constraint
      try {
        console.log('Trying fallback camera access...');
        const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true });
        console.log('Fallback camera access granted');
        setStream(fallbackStream);
        setIsCameraMode(true);
        setIsCameraReady(false);
      } catch (fallbackError) {
        console.error('Fallback camera access failed:', fallbackError);
        alert('Unable to access camera. Please check permissions or use file upload instead.');
      }
    }
  };

  const stopCamera = () => {
    if (stream) {
      console.log('Stopping camera...');
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsCameraMode(false);
    setIsCameraReady(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) {
      console.error('Video or canvas ref not available');
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;

    // Check if video has valid dimensions
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      console.error('Video not ready');
      alert('Camera is not ready yet. Please wait a moment and try again.');
      return;
    }

    console.log('Capturing photo...');
    console.log('Video dimensions:', video.videoWidth, 'x', video.videoHeight);

    const context = canvas.getContext('2d');
    if (!context) {
      console.error('Could not get canvas context');
      return;
    }

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the current video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert canvas to blob and create file
    canvas.toBlob(
      async (blob) => {
        if (blob) {
          const file = new File([blob], `camera-capture-${Date.now()}.jpg`, {
            type: 'image/jpeg',
          });
          console.log('Photo captured:', file.name, file.size, 'bytes');
          
          // Validate dimensions
          try {
            const { valid, width, height } = await validateImageDimensions(file);
            if (!valid) {
              alert(`Captured image is too small (${width}×${height}px). Please ensure your camera resolution is at least 256×256 pixels.`);
              return;
            }
            onImageSelect(file);
            stopCamera();
          } catch (error) {
            console.error('Error validating captured image:', error);
            alert('Failed to validate captured image');
          }
        } else {
          console.error('Failed to create blob from canvas');
          alert('Failed to capture photo. Please try again.');
        }
      },
      'image/jpeg',
      0.95
    );
  };

  return (
    <div className="upload-container">
      {!isCameraMode ? (
        <>
          <div
            className="upload-area"
            onClick={handleClick}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleFileChange}
              style={{ display: 'none' }}
              disabled={isProcessing}
            />
            <div className="upload-content">
              <svg
                className="upload-icon"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <p className="upload-text">
                {isProcessing ? 'Processing...' : 'Click to upload or drag and drop'}
              </p>
              <p className="upload-subtext">PNG, JPG, or WebP (recommended: 224x224px)</p>
            </div>
          </div>
          <div className="upload-divider">
            <span>or</span>
          </div>
          <button
            className="camera-button"
            onClick={startCamera}
            disabled={isProcessing}
          >
            <svg
              className="camera-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            Use Camera
          </button>
        </>
      ) : (
        <div className="camera-container">
          {!isCameraReady && (
            <div className="camera-loading">
              <p>Starting camera...</p>
            </div>
          )}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="camera-preview"
            style={{ display: isCameraReady ? 'block' : 'none' }}
          />
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          <div className="camera-controls">
            <button 
              className="capture-button" 
              onClick={capturePhoto}
              disabled={!isCameraReady}
            >
              <svg
                className="capture-icon"
                fill="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="12" cy="12" r="10" />
              </svg>
              {isCameraReady ? 'Capture Photo' : 'Loading...'}
            </button>
            <button className="cancel-button" onClick={stopCamera}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
