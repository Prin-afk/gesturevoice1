import sys
import cv2
import numpy as np
from keras.models import load_model
from function import *
import mediapipe as mp

cnn_model = load_model("backend/models/cnn_model.h5")
lstm_model = load_model("backend/models/lstm_model.h5")
cnn_labels = np.load("backend/models/cnn_labels.npy")

def predict_image(image_path):
    img = cv2.imread(image_path)
    img = cv2.resize(img, (128,128))
    img = img / 255.0
    img = np.expand_dims(img, axis=0)

    res = cnn_model.predict(img)[0]
    return cnn_labels[np.argmax(res)]

def predict_sequence(frames):
    res = lstm_model.predict(np.expand_dims(frames, axis=0))[0]
    return actions[np.argmax(res)]

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=4001, debug=True)

    image_path = sys.argv[1]
    print(predict_image(image_path))
