// ML model integration for skin cancer detection
// Using Flask backend API for predictions

import type { PredictionResult } from '../types';

// Backend API URL - change this if deploying to production
const API_URL = 'http://localhost:5000';

/**
 * Check if the Flask backend is running and model is loaded
 */
export const loadModel = async (): Promise<void> => {
  try {
    console.log('🔍 Checking backend API connection...');
    
    const response = await fetch(`${API_URL}/health`);
    const data = await response.json();
    
    if (data.model_loaded) {
      console.log('✅ Backend API connected - Model ready');
    } else {
      console.warn('⚠️ Backend API connected but model not loaded');
    }
  } catch (error) {
    console.error('❌ Backend API not reachable:', error);
    console.warn('Please make sure the Flask backend is running:');
    console.warn('1. cd backend');
    console.warn('2. pip install -r requirements.txt');
    console.warn('3. python app.py');
    throw new Error('Backend API not available. Please start the Flask server.');
  }
};

/**
 * Converts a data URL to a Blob for upload
 */
const dataURLtoBlob = (dataURL: string): Blob => {
  const arr = dataURL.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
};

/**
 * Runs prediction on the provided image using the Flask backend
 */
export const predictImage = async (imageData: string): Promise<PredictionResult> => {
  try {
    console.log('📤 Sending image to backend for prediction...');
    
    // Convert data URL to blob
    const blob = dataURLtoBlob(imageData);
    
    // Create form data
    const formData = new FormData();
    formData.append('image', blob, 'image.jpg');
    
    // Send to backend
    const response = await fetch(`${API_URL}/predict`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Prediction failed');
    }
    
    const result = await response.json();
    
    console.log('✅ Prediction received:', result.prediction, `(${(result.confidence * 100).toFixed(1)}%)`);
    
    return {
      prediction: result.prediction,
      confidence: result.confidence,
      timestamp: new Date(),
    };
  } catch (error) {
    console.error('❌ Prediction error:', error);
    if (error instanceof Error) {
      throw new Error(`Prediction failed: ${error.message}`);
    }
    throw new Error('Failed to make prediction. Please ensure the backend server is running.');
  }
};

/**
 * Unload the model (cleanup - not needed for backend but kept for API consistency)
 */
export const unloadModel = (): void => {
  console.log('Backend mode - no local model to unload');
};
