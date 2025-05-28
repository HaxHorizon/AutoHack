from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import cloudinary
import cloudinary.uploader
from dotenv import load_dotenv
import requests
import traceback
import fitz  # PyMuPDF
import matplotlib.pyplot as plt
from io import BytesIO
import smtplib
from email.message import EmailMessage
import re
from pymongo import MongoClient
from datetime import datetime
import time
from requests.exceptions import ChunkedEncodingError, ConnectionError

# Load environment variables from .env
load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
client = MongoClient(MONGO_URI)
db = client.get_database("Buildathon")
submissions_collection = db.get_collection("submissions")

# Flask setup
app = Flask(__name__)
CORS(app)
app.config['MAX_CONTENT_LENGTH'] = 20 * 1024 * 1024  # 20MB

# Cloudinary setup
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET")
)

# API + Email config
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"
EMAIL_SENDER = os.getenv("EMAIL_SENDER")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")

def extract_text_from_pdf(file_stream):
    text = ""
    with fitz.open(stream=file_stream.read(), filetype="pdf") as doc:
        for page in doc:
            text += page.get_text()
    return text

def create_score_chart(scores):
    fig, ax = plt.subplots()
    labels = list(scores.keys())
    values = list(scores.values())

    ax.pie(values, labels=labels, autopct='%1.1f%%', startangle=90)
    ax.set_title("Presentation Evaluation Scores")
    ax.axis('equal')

    buf = BytesIO()
    plt.savefig(buf, format='png', bbox_inches='tight')
    plt.close(fig)
    buf.seek(0)
    return buf

def send_email_with_charts(to_email, team_name, scores, chart_img_bytes, pdf_url, ai_reply):
    msg = EmailMessage()
    msg['Subject'] = f'Presentation Evaluation Report – Team {team_name}'
    msg['From'] = EMAIL_SENDER
    msg['To'] = to_email

    # Professional message content
    body = f"""  
Dear {team_name},

Thank you for submitting your presentation for evaluation. Based on our automated analysis, here are your scores across various parameters:

{chr(10).join(f"- {param}: {score}/10" for param, score in scores.items())}

Attached to this email, you will find a visual chart summarizing these scores.

If you have any questions or would like further feedback, feel free to reach out.

Best regards,  
Team HaxHorizon
"""
    msg.set_content(body)
    msg.add_attachment(chart_img_bytes.getvalue(), maintype='image', subtype='png', filename='evaluation_chart.png')

    # Send email
    with smtplib.SMTP_SSL('smtp.gmail.com', 465) as smtp:
        smtp.login(EMAIL_SENDER, EMAIL_PASSWORD)
        smtp.send_message(msg)

    print(f"Email sent to {to_email} with evaluation report for team {team_name}")

    # Save to MongoDB
    submission_data = {
        "team_name": team_name,
        "email": to_email,
        "pdf_url": pdf_url,
        "scores": scores,
        "analysis_summary": ai_reply,
        "submitted_at": datetime.utcnow()
    }
    submissions_collection.insert_one(submission_data)
    print("Submission saved to MongoDB:", submission_data)

def post_with_retries(url, json, headers, retries=3, backoff=2):
    for attempt in range(1, retries + 1):
        try:
            response = requests.post(url, json=json, headers=headers, timeout=30)
            response.raise_for_status()
            return response
        except (ChunkedEncodingError, ConnectionError) as e:
            print(f"Request attempt {attempt} failed: {e}")
            if attempt == retries:
                raise
            time.sleep(backoff * attempt)

@app.route('/api/submit-pdf', methods=['POST'])
def submit_pdf():
    try:
        team_name = request.form.get('teamName')
        user_email = request.form.get('email')
        pdf_file = request.files.get('pdf')

        if not team_name or not user_email or not pdf_file:
            return jsonify({"error": "Missing team name, email, or PDF file"}), 400

        if not pdf_file.filename.lower().endswith(".pdf"):
            return jsonify({"error": "Only PDF files are allowed."}), 400

        # Upload to Cloudinary
        upload_result = cloudinary.uploader.upload(
            pdf_file,
            resource_type="raw",
            folder="buildathon_ppt",
            public_id=team_name.replace(" ", "_")
        )
        pdf_url = upload_result.get("secure_url")
        print("Uploaded to Cloudinary:", pdf_url)

        pdf_file.stream.seek(0)
        pdf_text = extract_text_from_pdf(pdf_file.stream)

        messages = [
            {
                "role": "system",
                "content": (
                    "You are an AI assistant that evaluates documents. "
                    "Score the following parameters (0-10): Clarity, Structure, Originality, Grammar, and Relevance. "
                    "Also provide a short suggestion per category."
                )
            },
            {
                "role": "user",
                "content": f"Analyze this document and provide scores and suggestions:\n\n{pdf_text[:100000]}"
            }
        ]

        headers = {
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            "Content-Type": "application/json"
        }

        payload = {
            "model": "deepseek/deepseek-r1:free",
            "messages": messages,
            "temperature": 0.7,
            "max_tokens": 3000  # Reduced from 10000 to reduce load
        }

        try:
            res = post_with_retries(OPENROUTER_API_URL, json=payload, headers=headers)
        except Exception as e:
            print("OpenRouter API request failed:", str(e))
            return jsonify({"error": "Failed to get response from OpenRouter API"}), 502

        analysis = res.json()
        ai_reply = analysis.get("choices", [{}])[0].get("message", {}).get("content", "No analysis result found")
        print("AI Reply:", ai_reply)

        score_matches = re.findall(r"(Clarity|Structure|Originality|Grammar|Relevance):\s*(\d+)", ai_reply)
        scores = {param: int(score) for param, score in score_matches}

        chart_img = create_score_chart(scores)
        send_email_with_charts(user_email, team_name, scores, chart_img, pdf_url, ai_reply)

        return jsonify({
            "pdf_url": pdf_url,
            "analysis": ai_reply,
            "scores": scores,
            "cloudinary_info": {
                "bytes": upload_result.get("bytes"),
                "created_at": upload_result.get("created_at"),
                "format": upload_result.get("format"),
                "resource_type": upload_result.get("resource_type")
            }
        }), 200

    except Exception as e:
        print("Exception in /api/submit-pdf:", str(e))
        traceback.print_exc()
        return jsonify({"error": f"Server error: {str(e)}"}), 500


if __name__ == '__main__':
    app.run(debug=True, use_reloader=False)
