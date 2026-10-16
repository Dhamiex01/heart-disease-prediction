
import os
from pathlib import Path
from typing import Optional

import joblib
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field


# ============================================================
# APP INITIALIZATION
# ============================================================

app = FastAPI(
    title="Heart Health AI",
    description="Machine-learning-based heart disease risk assessment",
    version="1.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


# ============================================================
# PATHS AND MODEL
# ============================================================

BASE_DIR = Path(__file__).resolve().parent

# Prefer the frontend folder if it exists; otherwise use the
# project folder. Keep the frontend files together.
FRONTEND_DIR = (
    BASE_DIR / "frontend"
    if (BASE_DIR / "frontend").is_dir()
    else BASE_DIR
)

MODEL_PATH = BASE_DIR / "best_heart_disease_pipeline.joblib"

# Support an optional custom model path through an environment
# variable, for example MODEL_PATH=/path/to/model.joblib.
if os.getenv("MODEL_PATH"):
    MODEL_PATH = Path(os.environ["MODEL_PATH"]).expanduser().resolve()

# These must match the notebook's X columns and training order.
FEATURE_NAMES = [
    "age",
    "sex",
    "cp",
    "trestbps",
    "chol",
    "fbs",
    "restecg",
    "thalach",
    "exang",
    "oldpeak",
    "slope",
    "ca",
    "thal",
]

model = None

try:
    if MODEL_PATH.is_file():
        model = joblib.load(MODEL_PATH)
        print(f"Model pipeline loaded: {MODEL_PATH}")
        print("ACTUAL MODEL FILE:", MODEL_PATH.resolve())
        print("ACTUAL MODEL TYPE:", type(model).__name__)
    else:
        print(f"MODEL NOT FOUND: {MODEL_PATH}")
        print(
            "Run the notebook's model-saving cell and place "
            "best_heart_disease_pipeline.joblib beside main.py."
        )
except Exception as exc:
    print(f"ERROR loading model pipeline: {exc}")
    model = None


# ============================================================
# INPUT SCHEMA
# ============================================================

class PatientData(BaseModel):
    age: float = Field(..., ge=1, le=120)
    sex: int = Field(..., ge=0, le=1)
    cp: int = Field(..., ge=0, le=3)
    trestbps: float = Field(..., gt=0, le=300)
    chol: float = Field(..., ge=0, le=1000)
    fbs: int = Field(..., ge=0, le=1)
    restecg: int = Field(..., ge=0, le=2)
    thalach: float = Field(..., gt=0, le=300)
    exang: int = Field(..., ge=0, le=1)
    oldpeak: float = Field(..., ge=-10, le=20)
    slope: int = Field(..., ge=0, le=3)
    ca: int = Field(..., ge=0, le=4)
    thal: int = Field(..., ge=0, le=3)


# ============================================================
# STATIC FILES
# ============================================================

if FRONTEND_DIR.is_dir():
    app.mount(
        "/static",
        StaticFiles(directory=str(FRONTEND_DIR)),
        name="static",
    )


# ============================================================
# HOME PAGE
# ============================================================

@app.get("/")
def home():
    index_file = FRONTEND_DIR / "index.html"

    if not index_file.is_file():
        raise HTTPException(
            status_code=500,
            detail=(
                "The patient assessment page was not found. "
                "Place the actual assessment form at "
                f"{index_file}. The uploaded index(1).html "
                "appears to be a results page, not the form."
            ),
        )

    return FileResponse(str(index_file))


# ============================================================
# RESULT PAGE
# ============================================================

@app.get("/result.html")
def result_page():
    result_file = FRONTEND_DIR / "result.html"

    if not result_file.is_file():
        raise HTTPException(
            status_code=404,
            detail=f"Results page not found: {result_file}",
        )

    return FileResponse(str(result_file))


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/health")
def health():
    return {
        "status": "ok",
        "model_loaded": model is not None,
        "model_file": MODEL_PATH.name,
        "feature_count": len(FEATURE_NAMES),
    }


# ============================================================
# MODEL INFORMATION
# ============================================================

@app.get("/model-info")
def model_info():
    if model is None:
        raise HTTPException(
            status_code=503,
            detail=(
                "Model pipeline is not loaded. Check that "
                f"{MODEL_PATH.name} exists and can be opened."
            ),
        )

    return {
        "model_type": type(model).__name__,
        "number_of_features": len(FEATURE_NAMES),
        "feature_names": FEATURE_NAMES,
        "classes": (
            model.classes_.tolist()
            if hasattr(model, "classes_")
            else None
        ),
    }


# ============================================================
# PREDICTION
# ============================================================

@app.post("/predict")
def predict(data: PatientData):
    if model is None:
        raise HTTPException(
            status_code=503,
            detail=(
                "The prediction model is unavailable. "
                "Check the saved pipeline file."
            ),
        )

    # Keep the feature names and order consistent with training.
    patient_values = data.model_dump()

    input_data = pd.DataFrame(
        [[patient_values[name] for name in FEATURE_NAMES]],
        columns=FEATURE_NAMES,
    )

    try:
        # The saved sklearn pipeline performs its own preprocessing.
        print("\n--- PREDICTION DEBUG ---")
        print("Model type:", type(model).__name__)
        print("Input sent to model:")
        print(input_data.to_string(index=False))
        prediction = int(model.predict(input_data)[0])
        if hasattr(model, "predict_proba"):
            print("API probabilities:", model.predict_proba(input_data)[0])
            print("Model classes:", model.classes_)
        if prediction not in (0, 1):
            raise HTTPException(
                status_code=500,
                detail=f"Unexpected prediction class: {prediction}",
            )

        confidence: Optional[float] = None
        disease_probability: Optional[float] = None

        if hasattr(model, "predict_proba"):
            probabilities = model.predict_proba(input_data)[0]
            classes = list(model.classes_)

            # Confidence means probability of the predicted class.
            predicted_index = classes.index(prediction)
            confidence = float(probabilities[predicted_index] * 100)

            # This separately reports the probability of class 1.
            if 1 in classes:
                disease_probability = float(
                    probabilities[classes.index(1)] * 100
                )

    except HTTPException:
        raise
    except Exception as exc:
        print(f"Prediction error: {exc}")
        raise HTTPException(
            status_code=500,
            detail=(
                "Prediction failed. Confirm that the saved pipeline "
                "was trained using the same 13 feature names."
            ),
        ) from exc

    if prediction == 1:
        result_status = "higher"
        result_title = "Higher Likelihood of Heart Disease"
        result_message = (
            "The model predicts a higher likelihood of heart disease "
            "based on the information provided."
        )
    else:
        result_status = "lower"
        result_title = "Lower Likelihood of Heart Disease"
        result_message = (
            "The model predicts a lower likelihood of heart disease "
            "based on the information provided."
        )

    return {
        "success": True,
        "prediction": prediction,
        "result": result_status,
        "title": result_title,
        "message": result_message,
        # Numeric percentage, e.g. 87.4 means 87.4%.
        "confidence": confidence,
        "confidence_display": (
            f"{confidence:.1f}%"
            if confidence is not None
            else "N/A"
        ),
        # Probability of class 1, distinct from predicted-class confidence.
        "disease_probability": disease_probability,
        "patient": patient_values,
    }


# ============================================================
# RUN APPLICATION
# ============================================================

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        app,
        host="127.0.0.1",
        port=8000,
        reload=False,
    )
