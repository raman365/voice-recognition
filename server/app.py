from flask import Flask, request, jsonify
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

@app.route('/save_text', methods=['POST'])
def save_text():
    data = request.get_json()
    if 'text' in data:
        text = data['text']
        with open('saved_text.txt', 'a') as f:
            f.write(text + '\n')
        return jsonify({'message': 'Text saved successfully!'}), 200
    else:
        return jsonify({'message': 'No text found in request'}), 400

@app.route('/get_saved_text', methods=['GET'])
def get_saved_text():
    if os.path.exists('saved_text.txt'):
        with open('saved_text.txt', 'r') as f:
            saved_text = f.read().splitlines()
        return jsonify({'saved_text': saved_text}), 200
    else:
        return jsonify({'saved_text': []}), 200

@app.route('/save_audio', methods=['POST'])
def save_audio():
    if 'audio' not in request.files:
        return jsonify({'message': 'No audio file found in request'}), 400

    audio = request.files['audio']
    audio.save(os.path.join('audio_files', audio.filename))
    return jsonify({'message': 'Audio file saved successfully!'}), 200

if __name__ == '__main__':
    if not os.path.exists('audio_files'):
        os.makedirs('audio_files')
    app.run(debug=True)
