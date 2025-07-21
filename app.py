from flask import Flask, request, jsonify, send_from_directory
import pdfplumber
from groq import Groq
import tempfile
import os
import re
import fitz  # PyMuPDF
from docx import Document
import io
from flask_cors import CORS
import uuid
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timedelta
# Remove spaCy import and model loading
from email.message import EmailMessage
import smtplib
from dotenv import load_dotenv
load_dotenv()

app = Flask(__name__)
CORS(app)

# In-memory storage for parsed resumes (for demo; use DB for production)
parsed_resumes_store = []

groq_client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

UPLOAD_DIR = 'uploaded_resumes'
os.makedirs(UPLOAD_DIR, exist_ok=True)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///resumes.db'
db = SQLAlchemy(app)

class Resume(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(256))
    stored_filename = db.Column(db.String(256))
    candidate_name = db.Column(db.String(128))
    is_fake = db.Column(db.Boolean, default=False)
    upload_time = db.Column(db.DateTime, default=datetime.utcnow)
    job_description = db.Column(db.Text)
    score = db.Column(db.Float, nullable=True)
    explanation = db.Column(db.Text, nullable=True)
    email = db.Column(db.String(256), nullable=True)  # New field

class Candidate(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(256))
    stored_filename = db.Column(db.String(256))
    candidate_name = db.Column(db.String(128))
    job_description = db.Column(db.Text)
    score = db.Column(db.Float, nullable=True)
    explanation = db.Column(db.Text, nullable=True)
    upload_time = db.Column(db.DateTime, default=datetime.utcnow)
    email = db.Column(db.String(256), nullable=True)  # New field

class Interview(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    candidate_id = db.Column(db.Integer, db.ForeignKey('candidate.id'))
    candidate_name = db.Column(db.String(128))
    email = db.Column(db.String(256))
    score = db.Column(db.Float)
    interview_datetime = db.Column(db.String(64))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# ---
# To initialize the database, run this in Python shell:
# >>> from app import db
# >>> db.create_all()
# ---

# Remove spaCy import and model loading

def extract_resume_text(file_path):
    with pdfplumber.open(file_path) as pdf:
        text = " ".join(page.extract_text() or "" for page in pdf.pages)
    return text.strip()

def extract_name_from_text(text):
    # Try to find a line with two or three capitalized words (common for names)
    lines = [l.strip() for l in text.splitlines() if l.strip()]
    for line in lines[:10]:  # Only check the first 10 lines for performance
        match = re.match(r'^([A-Z][a-zA-Z\'-]+\s){1,2}[A-Z][a-zA-Z\'-]+$', line)
        if match:
            return line
    # Fallback: return the first non-empty line
    return lines[0] if lines else "Unknown"

def detect_fake_resume(resume_text, job_description):
    prompt = f"""
    You are an expert resume screener. Determine if this resume is fake, AI-generated, or overly generic.

    Resume:
    {resume_text}

    Job Description:
    {job_description}

    Respond with:
    1. Fake: Yes/No
    2. Reason: Short explanation.
    """
    response = groq_client.chat.completions.create(
        model="llama3-70b-8192",
        messages=[
            {"role": "system", "content": "You are a resume authenticity evaluator."},
            {"role": "user", "content": prompt}
        ]
    )
    return response.choices[0].message.content.strip()

def extract_text_from_file(filename, file_bytes):
    if filename.lower().endswith(".pdf"):
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        return "\n".join(page.get_text() for page in doc)
    elif filename.lower().endswith(".docx"):
        doc = Document(io.BytesIO(file_bytes))
        return "\n".join(p.text for p in doc.paragraphs)
    elif filename.lower().endswith(".txt"):
        return file_bytes.decode("utf-8", errors="ignore")
    else:
        return ""

SMTP_EMAIL = "roonybenshaw21@gmail.com"
SMTP_PASSWORD = "htbw ulku afzj ufvq"
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587

def send_interview_email(to_email, candidate_name, interview_time):
    try:
        msg = EmailMessage()
        msg['Subject'] = "🎉 You're Selected! Interview Scheduled"
        msg['From'] = SMTP_EMAIL
        msg['To'] = to_email
        msg.set_content(f"""
Dear {candidate_name},

🎉 Congratulations! You have been shortlisted based on your resume.

Your interview is scheduled for:
🗓 {interview_time}

Please ensure you're available at that time and have a stable internet connection. You will receive a meeting link closer to the interview.

Best of luck!

Regards,  
RecruitBot AI Team
""")
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_EMAIL, SMTP_PASSWORD)
            server.send_message(msg)
        return True, None
    except Exception as e:
        return False, str(e)

def extract_email(text):
    if not text:
        return None
    match = re.search(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+", text)
    return match.group(0) if match else None

@app.errorhandler(Exception)
def handle_exception(e):
    import traceback
    return jsonify({'error': str(e), 'trace': traceback.format_exc()}), 500

@app.route('/clear-resumes', methods=['POST'])
def clear_resumes():
    # Delete all files in the upload directory
    for fname in os.listdir(UPLOAD_DIR):
        fpath = os.path.join(UPLOAD_DIR, fname)
        if os.path.isfile(fpath):
            os.remove(fpath)
    # Delete all records from the database
    num_deleted = Resume.query.delete()
    db.session.commit()
    return jsonify({'message': f'Cleared {num_deleted} resumes and all files.'}), 200

# Update logic to prevent duplicate filenames in /detect endpoint
@app.route('/detect', methods=['POST'])
def detect():
    job_description = request.form.get('job_description', '')
    files = request.files.getlist('resumes')
    results = []
    for file in files:
        # Check for duplicate filename in DB
        if Resume.query.filter_by(filename=file.filename).first():
            results.append({
                'filename': file.filename,
                'name': 'Duplicate',
                'result': 'Duplicate filename. Not added.',
                'is_fake': False
            })
            continue
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as tmp:
            file.save(tmp.name)
            tmp_path = tmp.name
        try:
            resume_text = extract_resume_text(tmp_path)
            candidate_name = extract_name_from_text(resume_text)
            result = detect_fake_resume(resume_text, job_description)
            # Determine if fake
            is_fake = False
            if 'Fake: Yes' in result or 'Fake: yes' in result:
                is_fake = True
            # Save only if not fake and not duplicate
            if not is_fake:
                # Save file to disk with a unique name
                ext = os.path.splitext(file.filename)[1]
                unique_id = str(uuid.uuid4())
                safe_filename = f"{unique_id}{ext}"
                file_path = os.path.join(UPLOAD_DIR, safe_filename)
                file.seek(0)
                with open(file_path, 'wb') as f:
                    f.write(file.read())
                # Add to DB
                resume = Resume(
                    filename=file.filename,
                    stored_filename=safe_filename,
                    candidate_name=candidate_name,
                    is_fake=False,
                    job_description=job_description
                )
                db.session.add(resume)
                db.session.commit()
            results.append({
                'filename': file.filename,
                'name': candidate_name,
                'result': result,
                'is_fake': is_fake
            })
        finally:
            os.unlink(tmp_path)
    return jsonify({'results': results})

# Update parse_resumes to extract and store email
@app.route('/parse-resumes', methods=['POST'])
def parse_resumes():
    job_description = request.form.get('job_description', '')
    results = []

    # 1. Handle new uploaded files (if any)
    if 'resumes' in request.files:
        files = request.files.getlist('resumes')
        for file in files:
            # Check for duplicate filename in DB
            if Resume.query.filter_by(filename=file.filename).first():
                results.append({
                    'filename': file.filename,
                    'name': 'Duplicate',
                    'score': None,
                    'explanation': 'Duplicate filename. Not added.',
                    'stored_filename': None
                })
                continue  # Skip duplicates
            # Save file to disk with a unique name
            ext = os.path.splitext(file.filename)[1]
            unique_id = str(uuid.uuid4())
            safe_filename = f"{unique_id}{ext}"
            file_path = os.path.join(UPLOAD_DIR, safe_filename)
            file.seek(0)
            with open(file_path, 'wb') as f:
                f.write(file.read())
            # Extract candidate name and email from resume text
            file.seek(0)
            resume_text = extract_text_from_file(file.filename, file.read())
            candidate_name = extract_name_from_text(resume_text)
            email = extract_email(resume_text)
            # Add to DB
            resume = Resume(
                filename=file.filename,
                stored_filename=safe_filename,
                candidate_name=candidate_name,
                is_fake=False,
                job_description=job_description,
                email=email
            )
            db.session.add(resume)
            db.session.commit()
            # Only set score and explanation after real AI analysis.
            results.append({
                'filename': file.filename,
                'name': candidate_name,
                'score': None, # Placeholder, will be updated
                'explanation': 'Parsing in progress...', # Placeholder, will be updated
                'stored_filename': safe_filename
            })

    # 2. Evaluate all non-fake resumes in DB
    resumes = Resume.query.filter_by(is_fake=False).all()
    for resume in resumes:
        file_path = os.path.join(UPLOAD_DIR, resume.stored_filename)
        if not os.path.exists(file_path):
            continue
        with open(file_path, 'rb') as f:
            file_bytes = f.read()
        text = extract_text_from_file(resume.filename, file_bytes)
        candidate_name = extract_name_from_text(text)
        email = extract_email(text)
        if not text.strip():
            result = {
                'filename': resume.filename,
                'stored_filename': resume.stored_filename,
                'name': candidate_name,
                'score': None,
                'explanation': 'Unsupported or empty file.'
            }
            results.append(result)
            # Update DB
            resume.score = None
            resume.explanation = 'Unsupported or empty file.'
            db.session.commit()
            continue
        prompt = (
            f"Evaluate the following resume against the job description. "
            f"Give a score out of 10 and explain why:\n\n"
            f"Job Description:\n{job_description}\n\n"
            f"Resume:\n{text}"
        )
        resp = groq_client.chat.completions.create(
            model="llama3-70b-8192",
            messages=[
                {"role": "system", "content": "You are an expert HR resume ranker."},
                {"role": "user", "content": prompt}
            ]
        )
        content = resp.choices[0].message.content
        # Robust score extraction
        score_match = re.search(r"score\s*(?:of)?\s*[:=\-]?\s*(\d+(?:\.\d+)?)", content, re.IGNORECASE)
        if not score_match:
            score_match = re.search(r"score.*?(\d+(?:\.\d+)?)", content, re.IGNORECASE)
        score = float(score_match.group(1)) if score_match else None
        result = {
            'filename': resume.filename,
            'stored_filename': resume.stored_filename,
            'name': candidate_name,
            'score': score,
            'explanation': content
        }
        results.append(result)
        # Update DB
        resume.score = score
        resume.explanation = content
        # Update email if not already set
        if not resume.email and email:
            resume.email = email
        db.session.commit()
        # Add to Candidate table if score > 5 and not already present
        if score is not None and score > 5:
            existing = Candidate.query.filter_by(filename=resume.filename).first()
            if not existing:
                candidate = Candidate(
                    filename=resume.filename,
                    stored_filename=resume.stored_filename,
                    candidate_name=candidate_name,
                    job_description=resume.job_description,
                    score=score,
                    explanation=content,
                    email=resume.email
                )
                db.session.add(candidate)
                db.session.commit()
    # Ensure all resumes with score > 5 are in Candidate table
    high_score_resumes = Resume.query.filter(Resume.score != None, Resume.score > 5, Resume.is_fake == False).all()
    for resume in high_score_resumes:
        existing = Candidate.query.filter_by(filename=resume.filename).first()
        if not existing:
            candidate = Candidate(
                filename=resume.filename,
                stored_filename=resume.stored_filename,
                candidate_name=resume.candidate_name,
                job_description=resume.job_description,
                score=resume.score,
                explanation=resume.explanation,
                email=resume.email
            )
            db.session.add(candidate)
    db.session.commit()
    return jsonify({'results': results})

# New endpoint to fetch all parsed non-fake resumes
@app.route('/parsed-resumes', methods=['GET'])
def get_parsed_resumes():
    resumes = Resume.query.filter_by(is_fake=False).all()
    results = []
    for resume in resumes:
        results.append({
            'id': resume.id,  # Added id field
            'filename': resume.filename,
            'stored_filename': resume.stored_filename,
            'name': resume.candidate_name,
            'score': resume.score,
            'explanation': resume.explanation,
            'upload_time': resume.upload_time.isoformat()
        })
    return jsonify({'results': results}), 200

@app.route('/candidates', methods=['GET'])
def get_candidates():
    candidates = Candidate.query.all()
    results = []
    for c in candidates:
        results.append({
            'id': c.id,
            'filename': c.filename,
            'stored_filename': c.stored_filename,
            'name': c.candidate_name,
            'job_description': c.job_description,
            'score': c.score,
            'explanation': c.explanation,
            'upload_time': c.upload_time,
            'email': c.email
        })
    return jsonify({'results': results})

@app.route('/delete-resume/<int:resume_id>', methods=['DELETE'])
def delete_resume(resume_id):
    resume = Resume.query.get(resume_id)
    if not resume:
        return jsonify({'error': 'Resume not found.'}), 404
    # Delete the file from disk
    file_path = os.path.join(UPLOAD_DIR, resume.stored_filename)
    if os.path.exists(file_path):
        os.remove(file_path)
    # Delete from database
    db.session.delete(resume)
    db.session.commit()
    return jsonify({'message': 'Resume deleted.'}), 200

@app.route('/delete-resume-by-filename/<filename>', methods=['DELETE'])
def delete_resume_by_filename(filename):
    print(f"Requested to delete filename: {filename}")
    resume = Resume.query.filter_by(filename=filename).first()
    if not resume:
        print("Resume not found in DB.")
        return jsonify({'error': 'Resume not found.'}), 404
    # Delete the file from disk
    file_path = os.path.join(UPLOAD_DIR, resume.stored_filename)
    if os.path.exists(file_path):
        os.remove(file_path)
    # Delete from database
    db.session.delete(resume)
    db.session.commit()
    print(f"Resume {filename} deleted.")
    return jsonify({'message': 'Resume deleted.'}), 200

@app.route('/delete-resume-by-stored-filename/<stored_filename>', methods=['DELETE'])
def delete_resume_by_stored_filename(stored_filename):
    try:
        print(f"Requested to delete stored_filename: '{stored_filename}'")
        all_resumes = Resume.query.all()
        print("All stored_filenames in DB:", [f"'{r.stored_filename}'" for r in all_resumes])
        found_match = False
        for r in all_resumes:
            if r.stored_filename == stored_filename:
                print(f"Match found for: '{r.stored_filename}'")
                found_match = True
        if not found_match:
            print("No exact match found for requested stored_filename.")
        resume = Resume.query.filter_by(stored_filename=stored_filename).first()
        if not resume:
            print("Resume not found in DB.")
            return jsonify({'error': 'Resume not found.'}), 404
        # Delete the file from disk
        file_path = os.path.join(UPLOAD_DIR, resume.stored_filename)
        if os.path.exists(file_path):
            os.remove(file_path)
        # Delete from database
        db.session.delete(resume)
        db.session.commit()
        print(f"Resume {stored_filename} deleted.")
        return jsonify({'message': 'Resume deleted.'}), 200
    except Exception as e:
        print("Exception during deletion:", str(e))
        return jsonify({'error': str(e)}), 500

@app.route('/download-resume/<stored_filename>', methods=['GET'])
def download_resume(stored_filename):
    # Only allow download if not fake
    resume = Resume.query.filter_by(stored_filename=stored_filename, is_fake=False).first()
    if not resume:
        return jsonify({'error': 'Resume not found or is marked as fake.'}), 404
    return send_from_directory(UPLOAD_DIR, stored_filename, as_attachment=True)

@app.route('/fake-detection.html')
def serve_html():
    return send_from_directory('public', 'fake-detection.html')

@app.route('/add-test-candidate', methods=['POST'])
def add_test_candidate():
    candidate = Candidate(
        filename="test_resume.pdf",
        stored_filename="test_resume.pdf",
        candidate_name="Test User",
        job_description="Test job",
        score=8.0,
        explanation="Test explanation"
    )
    db.session.add(candidate)
    db.session.commit()
    return jsonify({"message": "Test candidate added."})

@app.route('/clear-candidates-above-score', methods=['POST'])
def clear_candidates_above_score():
    threshold = 5
    # Only delete where score is not None and > threshold
    candidates_to_delete = Candidate.query.filter(Candidate.score != None, Candidate.score > threshold).all()
    candidate_count = len(candidates_to_delete)
    for candidate in candidates_to_delete:
        if candidate.stored_filename:
            fpath = os.path.join(UPLOAD_DIR, candidate.stored_filename)
            if os.path.isfile(fpath):
                os.remove(fpath)
        db.session.delete(candidate)
    resumes_to_delete = Resume.query.filter(Resume.score != None, Resume.score > threshold).all()
    resume_count = len(resumes_to_delete)
    for resume in resumes_to_delete:
        if resume.stored_filename:
            fpath = os.path.join(UPLOAD_DIR, resume.stored_filename)
            if os.path.isfile(fpath):
                os.remove(fpath)
        db.session.delete(resume)
    db.session.commit()
    return jsonify({'message': f'Deleted {candidate_count} candidates and {resume_count} resumes with score > {threshold}.'}), 200

@app.route('/schedule-interview', methods=['POST'])
def schedule_interview():
    data = request.json
    candidate_id = data.get('candidate_id')
    interview_date = data.get('interview_date')
    interview_time = data.get('interview_time')
    if not candidate_id or not interview_date or not interview_time:
        return jsonify({'error': 'Missing required fields.'}), 400
    candidate = Candidate.query.get(candidate_id)
    if not candidate:
        return jsonify({'error': 'Candidate not found.'}), 404
    interview_datetime = f"{interview_date} {interview_time}"
    # Use email from candidate if available
    email = candidate.email
    # Fallback to extraction if not present
    if not email and candidate.explanation:
        email = extract_email(candidate.explanation)
    if not email:
        resume = Resume.query.filter_by(filename=candidate.filename).first()
        if resume:
            if resume.email:
                email = resume.email
            elif resume.explanation:
                email = extract_email(resume.explanation)
            elif resume.candidate_name:
                email = extract_email(resume.candidate_name)
            elif resume.filename:
                email = extract_email(resume.filename)
    if not email:
        email = 'candidate@example.com'
    # Save interview
    interview = Interview(
        candidate_id=candidate.id,
        candidate_name=candidate.candidate_name,
        email=email,
        score=candidate.score,
        interview_datetime=interview_datetime
    )
    db.session.add(interview)
    db.session.commit()
    # Send email
    to_email = email
    success, error = send_interview_email(to_email, candidate.candidate_name, interview_datetime)
    if success:
        return jsonify({'message': f'Interview scheduled and email sent to {to_email}.'}), 200
    else:
        return jsonify({'error': f'Interview saved but failed to send email: {error}'}), 500

@app.route('/interviews', methods=['GET'])
def get_interviews():
    interviews = Interview.query.order_by(Interview.interview_datetime.desc()).all()
    results = []
    for i in interviews:
        results.append({
            'id': i.id,
            'candidate_name': i.candidate_name,
            'email': i.email,
            'score': i.score,
            'interview_datetime': i.interview_datetime,
        })
    return jsonify({'results': results}), 200

@app.route('/cancel-interview/<int:interview_id>', methods=['DELETE'])
def cancel_interview(interview_id):
    interview = Interview.query.get(interview_id)
    if not interview:
        return jsonify({'error': 'Interview not found.'}), 404
    db.session.delete(interview)
    db.session.commit()
    return jsonify({'message': 'Interview cancelled.'}), 200

@app.route('/interview-time-slots', methods=['GET'])
def get_interview_time_slots():
    start_time = datetime.strptime("10:00", "%H:%M")
    end_time = datetime.strptime("16:00", "%H:%M")
    slots = []
    current = start_time
    while current <= end_time:
        slots.append(current.strftime("%I:%M %p"))
        current += timedelta(minutes=30)
    return jsonify({'slots': slots})

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True) 