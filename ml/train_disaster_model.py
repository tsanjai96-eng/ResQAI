import os
import joblib
import pandas as pd

from sklearn.ensemble import RandomForestClassifier


# -----------------------------------------
# Paths
# -----------------------------------------

BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.abspath(__file__)
    )
)

DATASET_PATH = os.path.join(
    BASE_DIR,
    "ml",
    "datasets",
    "disaster_dataset.csv"
)

MODEL_DIR = os.path.join(
    BASE_DIR,
    "ml",
    "models"
)

MODEL_PATH = os.path.join(
    MODEL_DIR,
    "disaster_model.pkl"
)


# -----------------------------------------
# Load dataset
# -----------------------------------------

print("Loading disaster dataset...")

df = pd.read_csv(DATASET_PATH)

print("Dataset loaded successfully!")
print("Shape:", df.shape)
print("Columns:", list(df.columns))


# -----------------------------------------
# Clean dataset
# -----------------------------------------

df = df.dropna()

print("Dataset after cleaning:", df.shape)


# -----------------------------------------
# Features
# -----------------------------------------

features = [
    "rainfall",
    "temperature",
    "humidity",
    "wind_speed",
    "pressure",
    "river_level",
    "elevation"
]

X = df[features]
y = df["disaster"]


# -----------------------------------------
# Train model
# -----------------------------------------

print("\nTraining disaster model...")

model = RandomForestClassifier(
    n_estimators=100,
    random_state=42
)

model.fit(X, y)


# -----------------------------------------
# Save model
# -----------------------------------------

os.makedirs(MODEL_DIR, exist_ok=True)

joblib.dump(model, MODEL_PATH)

print("\nDisaster model trained successfully!")
print("Model saved at:")
print(MODEL_PATH)
