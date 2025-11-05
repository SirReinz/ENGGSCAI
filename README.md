# ENGGSCAI
AI model for Skin Cancer

# NOTE
Keras files were too big for github, please user/train a pre-existing model and insert the model in to use the application. Naming it accordingly

For pretrained model used in the initial version of the application:
[Link to model](https://drive.google.com/drive/folders/1zeOUmeLyW6j0g4ZwySv6gnnd4CRY9QBP?usp=sharing)

# Skin Cancer Detection App

React TypeScript application with Flask backend for AI-powered skin lesion analysis using CNN models.

## Quick Start Guide

### Step 1: Start the Backend

Open a terminal and run:

```bash
cd backend
python app.py
```

You should see:
```
Starting Skin Cancer Detection API...
Server ready!
API running at: http://localhost:5000
```

**Note:** If you see "model not loaded", that's OK! The app will use mock predictions for development.

### Step 2: Start the Frontend

Open a **new terminal** and run:

```bash
npm run dev
```

You should see:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
```

### Step 3: Use the App

1. Open http://localhost:5173 in your browser
2. Click "Use Camera" or "Upload Image"
3. Select/capture an image of a skin lesion
4. Position and resize the crop box to select the area to analyze
5. Click "Confirm Crop"
6. Click "Analyze Image"
7. View the results!

## Troubleshooting

### Backend won't start
- **Check Python is installed:** `python --version`
- **Install dependencies:** `cd backend && pip install -r requirements.txt`
- **Check installed version of tensorflow + keras** Recommended to update to latest version
- **Port 5000 in use:** Change port in `backend/app.py` line 169

### Frontend won't start
- **Check Node is installed:** `node --version`
- **Install dependencies:** `npm install`
- **Port 5173 in use:** Vite will automatically try next available port
