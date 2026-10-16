# Heart Disease Prediction App

A machine-learning web application that estimates the likelihood of heart disease from 13 patient-provided clinical features. The project includes a trained scikit-learn pipeline, a FastAPI backend, and an HTML/CSS/JavaScript frontend.

> **Disclaimer:** This project is for educational and demonstration purposes only. It is not a medical device and does not provide a diagnosis. Do not use its predictions as a substitute for professional medical advice.

## Features

- Web form for entering 13 clinical features
- FastAPI prediction endpoint
- Saved scikit-learn pipeline with preprocessing included
- Prediction result and probability/confidence display
- Interactive API documentation at `/docs`

## Project structure

```text
heart-disease-prediction/
├── frontend/
│   ├── index.html
│   ├── result.html
│   ├── script.js
│   └── style.css
├── main.py
├── app.py
├── best_heart_disease_pipeline.joblib
├── requirements.txt
├── .gitignore
└── README.md
```

The training notebook can also be added if you want to share the model-development workflow.

## Input features

The API expects these 13 fields:

`age`, `sex`, `cp`, `trestbps`, `chol`, `fbs`, `restecg`, `thalach`, `exang`, `oldpeak`, `slope`, `ca`, and `thal`.

Use the category encodings expected by the dataset and model. Do not change the feature order or category mappings without updating and testing the model and frontend together.

## Requirements

- Python compatible with the saved model environment
- scikit-learn 1.5.1 for the currently saved pipeline
- Packages listed in `requirements.txt`

The pipeline was saved with scikit-learn 1.5.1. Loading scikit-learn models across different versions can fail or produce unreliable behavior, so keep the runtime version aligned with the training environment.

## Run locally

1. Clone this repository:

   ```bash
   git clone https://github.com/Dhamiex01/heart-disease-prediction.git
   cd heart-disease-prediction
   ```

2. Create and activate a virtual environment.

   **Windows PowerShell:**

   ```powershell
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1
   ```

   **macOS/Linux:**

   ```bash
   python -m venv .venv
   source .venv/bin/activate
   ```

3. Install dependencies:

   ```bash
   python -m pip install --upgrade pip
   pip install -r requirements.txt
   ```

4. Start FastAPI. If `main.py` defines the FastAPI instance as `app`, run:

   ```bash
   uvicorn main:app --reload
   ```

5. Open:
   - Web app: http://127.0.0.1:8000/
   - API documentation: http://127.0.0.1:8000/docs

If the frontend is served at a different route in your code, follow the routes defined in `main.py`.

## Model file

The API uses `best_heart_disease_pipeline.joblib`. Keep it at the location expected by `MODEL_PATH` in `main.py`. The saved pipeline performs its own preprocessing, so the API should pass it a DataFrame with the expected feature names rather than applying a separate scaler to the same inputs.

Only publish model artifacts you have permission to distribute. Do not commit private datasets, credentials, `.env` files, or personal patient information.

## Repository

https://github.com/Dhamiex01/heart-disease-prediction
