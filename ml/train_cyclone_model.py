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
    "cyclone_data.csv"
)

MODEL_DIR = os.path.join(
    BASE_DIR,
    "models"
)

MODEL_PATH = os.path.join(
    MODEL_DIR,
    "cyclone_model.pkl"
)


# ==========================================
# LOAD DATA
# ==========================================

print("Loading cyclone dataset...")

df = pd.read_csv(DATA_PATH)

print("Dataset shape:", df.shape)


# ==========================================
# FEATURES
# ==========================================

FEATURES = [
    "wind_speed",
    "pressure",
    "temperature",
    "humidity",
    "rainfall"
]

TARGET = "cyclone"


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


print("Training Cyclone AI model...")

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
    "Cyclone model accuracy:",
    round(accuracy * 100, 2),
    "%"
)


# ==========================================
# SAVE
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
print("Cyclone model trained successfully")
print("================================")
print("Saved:", MODEL_PATH)
print("Features:", model.n_features_in_)