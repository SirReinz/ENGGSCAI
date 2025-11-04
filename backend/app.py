import os
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'

from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
from tensorflow import keras
import numpy as np
from PIL import Image
import io
import base64

app = Flask(__name__)
CORS(app)  # Enable CORS for React app

# Global model variable
model = None

def load_model():
    """Load the Keras model on startup"""
    global model
    try:
        print(" Loading skin cancer detection model...")
        model_path = os.path.join(os.path.dirname(__file__), '..', 'src', 'assets', 'hybrid_model.keras')
        
        # Approach 1: Try loading the full model
        try:
            model = keras.models.load_model(model_path, compile=False)
            print(" Model loaded successfully!")
            print(f" Input shape: {model.input_shape}")
            print(f" Output shape: {model.output_shape}")
            return True
        except Exception as e1:
            print(f"  Full model loading failed: {str(e1)[:100]}")
            
            # Approach 2: Try loading with safe_mode=False (Keras 3.x)
            try:
                print(" Trying with safe_mode=False...")
                model = keras.models.load_model(model_path, compile=False, safe_mode=False)
                print(" Model loaded successfully!")
                print(f" Input shape: {model.input_shape}")
                print(f" Output shape: {model.output_shape}")
                return True
            except Exception as e2:
                print(f"  safe_mode=False failed: {str(e2)[:100]}")
                
                # Approach 3: Load model architecture and weights separately
                # This is the workaround from the Stack Overflow answer
                print(" Trying to extract and load weights separately...")
                print("  This approach requires model architecture to be defined")
                raise e2
        
    except Exception as e:
        print(f"\n All loading attempts failed")
        return False

def preprocess_image(image_file):
    """
    Preprocess image for model input
    Converts uploaded image to 256x256 RGB normalized array
    Expects image to already be cropped to 256x256 from frontend
    """
    try:
        # Read image bytes
        image_bytes = image_file.read()
        
        # Open image with PIL
        img = Image.open(io.BytesIO(image_bytes))
        
        # Convert to RGB if needed (handles RGBA, grayscale, etc.)
        if img.mode != 'RGB':
            img = img.convert('RGB')
        
        # Resize to 256x256 (should already be this size from frontend cropper)
        # Using LANCZOS for high-quality resampling if needed
        img = img.resize((256, 256), Image.Resampling.LANCZOS)
        
        # Convert to numpy array and normalize to [0, 1]
        img_array = np.array(img).astype('float32')
        img_array = img_array / 255.0
        
        # Add batch dimension: shape becomes (1, 256, 256, 3)
        img_array = np.expand_dims(img_array, axis=0)
        
        return img_array
    except Exception as e:
        raise ValueError(f"Error preprocessing image: {str(e)}")

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None
    })

@app.route('/predict', methods=['POST'])
def predict():
    """
    Main prediction endpoint
    Expects: multipart/form-data with 'image' file
    Returns: JSON with prediction and confidence
    """
    if model is None:
        # Return mock prediction if model not loaded
        print("⚠️ Using mock prediction (model not loaded)")
        import random
        is_malignant = random.random() > 0.5
        confidence = 0.75 + random.random() * 0.2
        
        return jsonify({
            'prediction': 'malignant' if is_malignant else 'benign',
            'confidence': float(confidence),
            'raw_output': {
                'malignant_probability': float(confidence if is_malignant else 1 - confidence),
                'benign_probability': float(1 - confidence if is_malignant else confidence)
            },
            'mock': True,
            'message': 'Using mock prediction - model not loaded'
        })
    
    # Check if image file is in request
    if 'image' not in request.files:
        return jsonify({
            'error': 'No image file provided. Please upload an image.'
        }), 400
    
    image_file = request.files['image']
    
    # Check if file is empty
    if image_file.filename == '':
        return jsonify({
            'error': 'Empty filename. Please select a valid image.'
        }), 400
    
    try:
        # Preprocess the image
        img_array = preprocess_image(image_file)
        
        # Run prediction
        predictions = model.predict(img_array, verbose=0)
        
        # Interpret results
        # Assuming binary classification output
        if predictions.shape[-1] == 1:
            # Single sigmoid output: 0 = benign, 1 = malignant
            malignant_prob = float(predictions[0][0])
        else:
            # Multiple outputs (softmax): assuming [benign, malignant]
            malignant_prob = float(predictions[0][1])
        
        # Determine prediction
        is_malignant = malignant_prob > 0.5
        prediction_label = 'malignant' if is_malignant else 'benign'
        confidence = malignant_prob if is_malignant else (1 - malignant_prob)
        
        print(f" Prediction: {prediction_label} ({confidence*100:.1f}% confidence)")
        
        return jsonify({
            'prediction': prediction_label,
            'confidence': float(confidence),
            'raw_output': {
                'malignant_probability': float(malignant_prob),
                'benign_probability': float(1 - malignant_prob)
            }
        })
    
    except ValueError as ve:
        return jsonify({'error': str(ve)}), 400
    except Exception as e:
        print(f" Prediction error: {e}")
        return jsonify({
            'error': f'Prediction failed: {str(e)}'
        }), 500

@app.route('/', methods=['GET'])
def index():
    """Root endpoint - API info"""
    return jsonify({
        'name': 'Skin Cancer Detection API',
        'version': '1.0.0',
        'endpoints': {
            '/health': 'GET - Health check',
            '/predict': 'POST - Upload image for prediction'
        },
        'model_status': 'loaded' if model else 'not loaded'
    })

if __name__ == '__main__':
    print("Starting Skin Cancer Detection API...")
    print("=" * 50)
    
    # Load model on startup
    model_loaded = load_model()
    
    if model_loaded:
        print("=" * 50)
        print(" Server ready!")
        print(" API running at: http://localhost:5000")
        print(" Health check: http://localhost:5000/health")
        print(" Prediction: POST to http://localhost:5000/predict")
        print("=" * 50)
        # Run Flask app
        app.run(host='0.0.0.0', port=5000, debug=True)
    else:
        print("=" * 50)
        print(" Server failed to start.")
        print(" Check error messages above")
        print("=" * 50)
        
