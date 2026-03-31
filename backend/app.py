import cv2
import numpy as np
import mediapipe as mp
import tensorflow as tf
from flask import Flask, request, jsonify
from flask_cors import CORS
from collections import deque

# ================= INIT =================

app = Flask(__name__)
CORS(app)

print("Loading models...")

letter_model = tf.keras.models.load_model("models/letter_model.h5")
word_model = tf.keras.models.load_model("models/word_model.h5")

letter_labels = list("ABCDEFGHIJKLMNOPQRSTUVWXYZ")

try:
    with open("file.txt") as f:
        word_labels = [line.strip() for line in f]
except:
    word_labels = []

print("Models loaded!")

# ================= MEDIAPIPE =================

mp_hands = mp.solutions.hands
hands = mp_hands.Hands(
    max_num_hands=2,
    min_detection_confidence=0.6,
    min_tracking_confidence=0.6
)

# ================= SETTINGS =================

SEQUENCE_LENGTH = 30
sequence = deque(maxlen=SEQUENCE_LENGTH)

CONFIDENCE = 0.5

# ================= LANDMARKS =================

def extract_landmarks(image):

    results = hands.process(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))

    left = np.zeros(63)
    right = np.zeros(63)

    if results.multi_hand_landmarks:
        for hand_landmarks, handedness in zip(
            results.multi_hand_landmarks,
            results.multi_handedness
        ):
            coords = []
            for lm in hand_landmarks.landmark:
                coords.extend([lm.x, lm.y, lm.z])

            coords = np.array(coords)

            if handedness.classification[0].label == "Left":
                left = coords
            else:
                right = coords

    return left, right

# ================= API =================

@app.route("/predict", methods=["POST"])
def predict():

    if "image" not in request.files:
        return jsonify({"prediction": ""})

    file = request.files["image"]
    npimg = np.frombuffer(file.read(), np.uint8)
    frame = cv2.imdecode(npimg, cv2.IMREAD_COLOR)

    left, right = extract_landmarks(frame)

    one_hand = left if np.sum(left) > 0 else right
    two_hand = np.concatenate([left, right])

    hands_detected = 0
    if np.sum(left) > 0:
        hands_detected += 1
    if np.sum(right) > 0:
        hands_detected += 1

    prediction = ""

    # ===== LETTER =====
    if hands_detected == 1:
        pred = letter_model.predict(one_hand.reshape(1, 63), verbose=0)[0]
        idx = np.argmax(pred)
        conf = pred[idx]

        if conf > CONFIDENCE:
            prediction = letter_labels[idx]

    # ===== WORD =====
    elif hands_detected >= 1 and len(word_labels) > 0:

        sequence.append(two_hand)

        if len(sequence) == SEQUENCE_LENGTH:
            pred = word_model.predict(
                np.array(sequence).reshape(1, SEQUENCE_LENGTH, 126),
                verbose=0
            )[0]

            idx = np.argmax(pred)
            conf = pred[idx]

            if conf > CONFIDENCE:
                prediction = word_labels[idx]

    return jsonify({"prediction": prediction})

# ================= RUN =================

if __name__ == "__main__":
    app.run(debug=True, port=5000) 

