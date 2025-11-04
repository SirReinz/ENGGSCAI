import React from 'react';
import type { ImageData } from '../types';
import { formatFileSize } from '../utils/imageProcessing';
import './ImagePreview.css';

interface ImagePreviewProps {
  imageData: ImageData;
  onRemove: () => void;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ imageData, onRemove }) => {
  return (
    <div className="preview-container">
      <div className="preview-header">
        <h3>Cropped Image</h3>
        <button className="remove-button" onClick={onRemove} aria-label="Remove image">
          ✕
        </button>
      </div>
      
      <div className="preview-image-wrapper">
        <img src={imageData.preview} alt="Cropped preview" className="preview-image" />
      </div>
      
      <div className="preview-info">
        <p className="preview-filename">{imageData.name}</p>
        <p className="preview-filesize">{formatFileSize(imageData.size)}</p>
        <p className="preview-dimensions">256×256px (ready for analysis)</p>
      </div>
    </div>
  );
};

export default ImagePreview;
