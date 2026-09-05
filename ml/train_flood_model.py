import os
import pandas as pd
import joblib

from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score


# ==========================================
# PATHS
# ==========================================

BASE_DIR = os.path.dirname(
    os.path.abspath(__file__)
)

DATA_PATH = os.path.join(
    BASE_DIR,
    "datasets",
    "flood_data.csv"
)

MODEL_DIR = os.path.join(
    BASE_DIR,
    "models"
)

MODEL_PATH = os.path.join(
    MODEL_DIR,
    "flood_model.pkl"
)


# ==========================================
# LOAD DATA
# ==========================================

print("Loading flood dataset...")

df = pd.read_csv(DATA_PATH)

print("Dataset shape:", df.shape)

print("Columns:")
print(df.columns.tolist())


# ==========================================
# CLEAN DATA
# ==========================================

df = df.dropna()

print("Dataset after cleaning:", df.shape)


# ==========================================
# FEATURES
# ==========================================

FEATURES = [
    "rainfall",
    "temperature",
    "humidity",
    "wind_speed",
    "pressure",
    "river_level",
    "elevation"
]

TARGET = "flood"


X = df[FEATURES]

y = df[TARGET]


# ==========================================
# TRAIN / TEST
# ==========================================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.25,
    random_state=42,
    stratify=y
)


# ==========================================
# MODEL
# ==========================================

model = RandomForestClassifier(
    n_estimators=100,
    random_state=42,
    class_weight="balanced"
)


print("Training Flood AI model...")

model.fit(
    X_train,
    y_train
)


# ==========================================
# TEST
# ==========================================

predictions = model.predict(X_test)

accuracy = accuracy_score(
    y_test,
    predictions
)

print(
    "Model accuracy:",
    round(accuracy * 100, 2),
    "%"
)


# ==========================================
# SAVE MODEL
# ==========================================

os.makedirs(
    MODEL_DIR,
    exist_ok=True
)

joblib.dump(
    model,
    MODEL_PATH
)

print()
print("================================")
print("Flood model trained successfully")
print("================================")
print("Model saved:")
print(MODEL_PATH)