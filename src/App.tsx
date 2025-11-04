import { useState, useEffect } from 'react';
import ImageUpload from './components/ImageUpload';
import ImageCropper from './components/ImageCropper';
import ImagePreview from './components/ImagePreview';
import Results from './components/Results';
import type { ImageData, PredictionResult } from './types';
import { createImagePreview, cleanupPreview } from './utils/imageProcessing';
import { predictImage } from './utils/modelLoader';
import './App.css';

function App() {
  const [rawImageData, setRawImageData] = useState<ImageData | null>(null);
  const [imageData, setImageData] = useState<ImageData | null>(null);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCropper, setShowCropper] = useState(false);

  useEffect(() => {
    // Cleanup preview URL when component unmounts or image changes
    return () => {
      if (imageData?.preview) {
        cleanupPreview(imageData.preview);
      }
    };
  }, [imageData]);

  const handleImageSelect = async (file: File) => {
    try {
      const preview = await createImagePreview(file);
      setRawImageData({
        file,
        preview,
        name: file.name,
        size: file.size,
      });
      setShowCropper(true);
      setResult(null);
    } catch (error) {
      console.error('Error creating preview:', error);
      alert('Failed to load image preview');
    }
  };

  const handleCropConfirm = (croppedImageData: string) => {
    if (!rawImageData) return;
    
    // Convert cropped data URL to ImageData
    setImageData({
      file: rawImageData.file,
      preview: croppedImageData,
      name: rawImageData.name,
      size: rawImageData.size,
    });
    setShowCropper(false);
  };

  const handleCropCancel = () => {
    if (rawImageData?.preview) {
      cleanupPreview(rawImageData.preview);
    }
    setRawImageData(null);
    setShowCropper(false);
  };

  const handleAnalyze = async () => {
    if (!imageData) return;

    setIsProcessing(true);
    try {
      const prediction = await predictImage(imageData.preview);
      setResult(prediction);
    } catch (error) {
      console.error('Error during prediction:', error);
      alert('Failed to analyze image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveImage = () => {
    if (imageData?.preview) {
      cleanupPreview(imageData.preview);
    }
    if (rawImageData?.preview) {
      cleanupPreview(rawImageData.preview);
    }
    setImageData(null);
    setRawImageData(null);
    setResult(null);
    setShowCropper(false);
  };

  const handleReset = () => {
    handleRemoveImage();
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Skin Cancer Detection</h1>
        <p className="subtitle">AI-Powered Skin Lesion Analysis</p>
      </header>

      <main className="app-main">
        {!result ? (
          <>
            {!rawImageData && !imageData ? (
              <ImageUpload onImageSelect={handleImageSelect} isProcessing={isProcessing} />
            ) : showCropper && rawImageData ? (
              <ImageCropper 
                imageData={rawImageData.preview} 
                onCropConfirm={handleCropConfirm}
                onCancel={handleCropCancel}
              />
            ) : imageData ? (
              <>
                <ImagePreview imageData={imageData} onRemove={handleRemoveImage} />
                <div className="action-container">
                  <button
                    className="analyze-button"
                    onClick={handleAnalyze}
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Analyzing...' : 'Analyze Image'}
                  </button>
                </div>
              </>
            ) : null}
          </>
        ) : (
          <Results result={result} onReset={handleReset} />
        )}
      </main>

      <footer className="app-footer">
        <p>
          This tool is for educational and screening purposes only. Always consult with a
          qualified healthcare professional for medical advice.
        </p>
      </footer>
    </div>
  );
}

export default App;

