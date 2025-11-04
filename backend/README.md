# Skin Cancer Detection - Backend API

Flask backend for serving CNN model predictions.

## Setup

1. **Install dependencies:**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Run the server:**
   ```bash
   python app.py
   ```

   Server will start at `http://localhost:5000`

## API Endpoints

### GET `/health`
Health check endpoint to verify server and model status.

**Response:**
```json
{
  "status": "healthy",
  "model_loaded": true
}
```

### POST `/predict`
Upload an image for skin cancer prediction.

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body: `image` file (PNG, JPG, JPEG, WebP)

**Response:**
```json
{
  "prediction": "benign",
  "confidence": 0.87,
  "raw_output": {
    "malignant_probability": 0.13,
    "benign_probability": 0.87
  }
}
```

## Model

The API expects a Keras model file at:
../src/assets/hybrid_model.keras

### DEPRECATED
The API expects the Keras model file at:
```
../src/assets/skin_cancer_classifier_model.keras
```

### Model Requirements
- Input: 256×256 RGB images
- Output: Binary classification (benign/malignant)
- Format: Keras .keras file

## CORS

CORS is enabled for all origins to allow the React frontend to connect.
In production, update the CORS configuration in `app.py` to restrict origins.

## Development

The server runs in debug mode by default. For production:
1. Set `debug=False` in `app.run()`
2. Use a production WSGI server like Gunicorn
3. Configure proper CORS origins
4. Add authentication if needed

## Troubleshooting

### Model not loading
- Check that the model file exists at the correct path
- Verify TensorFlow version compatibility
- Check console output for specific error messages

### CORS errors
- Ensure Flask-CORS is installed
- Check browser console for specific CORS issues
- Verify the React app is making requests to the correct URL
