from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import re
import string
import os

app = Flask(__name__)
CORS(app)

# Load model files FROM THE BACKEND FOLDER
model = joblib.load('spam_classifier_model.pkl')
vectorizer = joblib.load('tfidf_vectorizer.pkl')

def preprocess_text(text):
    if not isinstance(text, str):
        return ""
    text = text.lower()
    text = text.translate(str.maketrans('', '', string.punctuation))
    text = re.sub(r'\d+', '', text)
    text = ' '.join(text.split())
    return text

@app.route('/api/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        email_text = data.get('email_text', '')
        
        cleaned_text = preprocess_text(email_text)
        text_tfidf = vectorizer.transform([cleaned_text])
        
        prediction = model.predict(text_tfidf)[0]
        probabilities = model.predict_proba(text_tfidf)[0]
        confidence = float(max(probabilities))
        
        if model.classes_[0] == 'ham':
            ham_prob = float(probabilities[0])
            spam_prob = float(probabilities[1])
        else:
            ham_prob = float(probabilities[1])
            spam_prob = float(probabilities[0])
        
        return jsonify({
            "prediction": prediction,
            "confidence": round(confidence * 100, 2),
            "probabilities": {
                "ham": round(ham_prob * 100, 2),
                "spam": round(spam_prob * 100, 2)
            },
            "status": "success"
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=True, host='0.0.0.0', port=port)