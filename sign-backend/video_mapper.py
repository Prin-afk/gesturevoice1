import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

WORD_PATH = os.path.join(BASE_DIR, "static", "videos", "words")
LETTER_PATH = os.path.join(BASE_DIR, "static", "videos", "letters")

def get_video_sequence(text):
    text = text.lower().strip()

    final_videos = []

    # 🔹 Split sentence into words
    words = text.split()

    for word in words:
        # 1️⃣ Check if full word video exists
        word_video_path = os.path.join(WORD_PATH, f"{word}.mp4")

        if os.path.exists(word_video_path):
            final_videos.append(f"/static/videos/words/{word}.mp4")
        else:
            # 2️⃣ Fall back to letter videos
            for ch in word:
                if ch.isalpha():
                    letter_video_path = os.path.join(
                        LETTER_PATH, f"{ch}.mp4"
                    )
                    if os.path.exists(letter_video_path):
                        final_videos.append(
                            f"/static/videos/letters/{ch}.mp4"
                        )

    return final_videos
