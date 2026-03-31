from flask import Flask, request, jsonify
import cv2
import numpy as np
import tensorflow as tf
import os

# ================= APP =================
app = Flask(__name__)

# ================= PATHS =================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "cnn_model.h5")
LABELS_PATH = os.path.join(BASE_DIR, "cnn_labels.npy")

IMG_SIZE = 128

# ================= LOAD MODEL =================
model = tf.keras.models.load_model(MODEL_PATH)
labels = np.load(LABELS_PATH, allow_pickle=True)

print("✅ CNN model and labels loaded")

# ================= PREPROCESS =================
def preprocess(image_path):
    if not image_path or not os.path.exists(image_path):
        raise ValueError("Image path does not exist")

    img = cv2.imread(image_path)
    if img is None:
        raise ValueError("Failed to read image")

    img = cv2.resize(img, (IMG_SIZE, IMG_SIZE))
    img = img.astype("float32") / 255.0
    img = np.expand_dims(img, axis=0)

    return img

# ================= ROUTES =================
@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json(silent=True)

    if not data or "imagePath" not in data:
        return jsonify({"error": "imagePath missing"}), 400

    try:
        img = preprocess(data["imagePath"])
        preds = model.predict(img, verbose=0)[0]

        idx = int(np.argmax(preds))
        label = str(labels[idx])
        confidence = float(preds[idx])

        return jsonify({
            "recognizedText": label,
            "confidence": confidence
        })

    except Exception as e:
        print("❌ Prediction error:", e)
        return jsonify({"error": str(e)}), 500

# ================= MAIN =================
if __name__ == "__main__":
    print("🚀 CNN inference server running at http://127.0.0.1:5001")
    app.run(host="127.0.0.1", port=5001, debug=False)
