import React from 'react';
import type { PredictionResult } from '../types';
import './Results.css';

interface ResultsProps {
  result: PredictionResult;
  onReset: () => void;
}

const Results: React.FC<ResultsProps> = ({ result, onReset }) => {
  const isBenign = result.prediction === 'benign';
  const confidencePercent = (result.confidence * 100).toFixed(1);

  return (
    <div className="results-container">
      <div className={`results-card ${isBenign ? 'benign' : 'malignant'}`}>
        <div className="results-icon">
          {isBenign ? (
            <svg
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ) : (
            <svg
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          )}
        </div>
        <h2 className="results-title">Analysis Complete</h2>
        <div className="results-prediction">
          <span className="prediction-label">Prediction:</span>
          <span className="prediction-value">{result.prediction.toUpperCase()}</span>
        </div>
        <div className="results-confidence">
          <span className="confidence-label">Confidence:</span>
          <span className="confidence-value">{confidencePercent}%</span>
        </div>
        <div className="confidence-bar">
          <div
            className="confidence-fill"
            style={{ width: `${confidencePercent}%` }}
          ></div>
        </div>
        <div className="results-disclaimer">
          <p>
            <strong>Important:</strong> This is an AI-assisted analysis and should not be used as
            a substitute for professional medical diagnosis. Please consult with a healthcare
            professional for proper evaluation.
          </p>
        </div>
        <button className="reset-button" onClick={onReset}>
          Analyze Another Image
        </button>
      </div>
    </div>
  );
};

export default Results;
