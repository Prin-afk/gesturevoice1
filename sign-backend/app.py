from flask import Flask, request, jsonify
from flask_cors import CORS
from video_mapper import get_video_sequence

app = Flask(__name__)
CORS(app)

@app.route("/translate", methods=["POST"])
def translate():
    data = request.json
    text = data.get("text", "")

    videos = get_video_sequence(text)

    if not videos:
        return jsonify({"error": "No sign videos found"}), 404

    return jsonify({"videos": videos})

if __name__ == "__main__":
    app.run(debug=True)

