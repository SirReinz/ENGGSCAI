// Type definitions for the skin cancer detection application

export interface PredictionResult {
  prediction: 'benign' | 'malignant';
  confidence: number;
  timestamp: Date;
}

export interface ModelConfig {
  modelPath?: string;
  inputSize?: { width: number; height: number };
  threshold?: number;
}

export interface ImageData {
  file: File;
  preview: string;
  name: string;
  size: number;
}
