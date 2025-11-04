import type { FC } from 'react';
import './ModelPreviewOverlay.css';

interface ModelPreviewOverlayProps {
  imageData: string;
}

const ModelPreviewOverlay: FC<ModelPreviewOverlayProps> = ({ imageData }) => {
  return (
    <div className="model-preview-section">
      <div className="preview-container">
        <img src={imageData} alt="Preview" className="preview-image" />
        <div className="model-preview-overlay">
          <div className="crop-indicator">
            <div className="crop-box"></div>
            <div className="crop-corners">
              <div className="crop-corner top-left"></div>
              <div className="crop-corner top-right"></div>
              <div className="crop-corner bottom-left"></div>
              <div className="crop-corner bottom-right"></div>
            </div>
            <div className="crop-label">Model Input (256×256)</div>
          </div>
        </div>
      </div>
      
      <div className="positioning-guide">
        <h4>📸 Image Guidelines</h4>
        <ul>
          <li>Center the area of concern within the highlighted square</li>
          <li>Position the lesion/tumor in the middle of the frame</li>
          <li>Ensure the skin covers the entire highlighted area</li>
          <li>The image will be center-cropped to a square before analysis</li>
        </ul>
      </div>
    </div>
  );
};

export default ModelPreviewOverlay;
