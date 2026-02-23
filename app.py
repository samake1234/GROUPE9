from flask import Flask, render_template, request, jsonify, send_file, redirect
import PyPDF2
import re
import os
from collections import Counter
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
import io
import warnings
import json
from datetime import datetime
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from ai_job_generator import JobOfferAIGenerator
from cv_improver import improve_cv
from models import db, User, CVAnalysis, JobProfile
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
import secrets

warnings.filterwarnings('ignore')

# Télécharger les ressources NLTK nécessaires
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')

try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords')

app = Flask(__name__)
app.config['SECRET_KEY'] = secrets.token_hex(16)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///jobmatch.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50MB max

# Initialiser la base de données
db.init_app(app)

# Initialiser Flask-Login
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login_page'

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Créer les tables au démarrage
with app.app_context():
    db.create_all()

# ============= FONCTIONS UTILITAIRES =============

def extract_text_from_pdf(pdf_file):
    """Extrait le texte d'un fichier PDF"""
    try:
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text()
        return text
    except Exception as e:
        return None

def clean_text(text):
    """Nettoie et normalise le texte"""
    text = text.lower()
    text = re.sub(r'[^a-zéèêëàâäùûüôöçîï0-9\s]', '', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def remove_stopwords(text):
    """Supprime les mots vides"""
    stop_words = set(stopwords.words('french'))
    tokens = word_tokenize(text)
    return ' '.join([word for word in tokens if word not in stop_words and len(word) > 2])

def calculate_similarity(cv_text, job_text):
    """Calcule la similarité cosinus entre le CV et l'offre"""
    vectorizer = TfidfVectorizer(max_features=500, analyzer='char', ngram_range=(2, 3))
    try:
        tfidf_matrix = vectorizer.fit_transform([cv_text, job_text])
        similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
        return float(similarity) * 100
    except:
        return 0

def extract_keywords(text, min_length=3):
    """Extrait les mots-clés pertinents du texte"""
    text = clean_text(text)
    text = remove_stopwords(text)
    tokens = word_tokenize(text)
    filtered_tokens = [token for token in tokens if len(token) > min_length]
    counter = Counter(filtered_tokens)
    return counter.most_common(20)

def find_missing_keywords(cv_keywords, job_keywords):
    """Trouve les mots-clés de l'offre absents du CV"""
    cv_dict = dict(cv_keywords)
    job_dict = dict(job_keywords)
    
    missing = {}
    for keyword, count in job_keywords:
        if keyword not in cv_dict:
            missing[keyword] = count
    
    return sorted(missing.items(), key=lambda x: x[1], reverse=True)

def calculate_detailed_score(cv_text, job_text, similarity_score):
    """Calcule un score détaillé en analysant plusieurs facteurs"""
    cv_words = set(clean_text(cv_text).split())
    job_words = set(clean_text(job_text).split())
    
    if len(job_words) > 0:
        keyword_coverage = len(cv_words & job_words) / len(job_words) * 100
    else:
        keyword_coverage = 0
    
    # Calculate similarity weighted by keyword density
    final_score = (similarity_score * 0.5 + keyword_coverage * 0.5)
    
    # Bonus for specific key matches (optional)
    if final_score > 0 and final_score < 100:
        # Prevent scores from being too low for good matches
        final_score = min(100, final_score * 1.1)
    
    return {
        'similarity': similarity_score,
        'coverage': keyword_coverage,
        'final': final_score
    }

def get_score_color(score):
    """Retourne la classe CSS en fonction du score"""
    if score >= 70:
        return "score-high"
    elif score >= 50:
        return "score-medium"
    else:
        return "score-low"

def extract_cv_details(text):
    """Extrait les informations structurées d'un CV pour le template premium"""
    details = {
        'name': 'Candidat',
        'first_name': 'Prénom',
        'last_name': 'NOM',
        'job_title': 'Expert IT',
        'contact': {'location': '', 'email': '', 'phone': '', 'portfolio': ''},
        'languages': [],
        'skills': [],
        'experiences': [],
        'education': []
    }
    
    # Extraction nom (Très basique, prend la 1ère ligne significative)
    lines = [line.strip() for line in text.split('\n') if line.strip()]
    if lines:
        full_name = lines[0]
        details['name'] = full_name
        parts = full_name.split()
        if len(parts) >= 2:
            details['first_name'] = parts[0]
            details['last_name'] = " ".join(parts[1:])
    
    # Emails & Téléphones
    emails = re.findall(r'[a-z0-9\.\-+_]+@[a-z0-9\.\-+_]+\.[a-z]+', text.lower())
    if emails: details['contact']['email'] = emails[0]
    
    phones = re.findall(r'(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}', text)
    if phones: details['contact']['phone'] = phones[0]
    
    # Job Title (cherche des mots clés après le nom)
    job_titles = ["développeur", "analyste", "ingénieur", "consultant", "manager", "data scientist"]
    for line in lines[1:5]:
        for title in job_titles:
            if title in line.lower():
                details['job_title'] = line.upper()
                break
    
    # Fake splitting for sections (Production real NLP would be better)
    # This is a fallback-rich version for the UX
    details['skills'] = ["Python", "Flask", "React", "SQL", "Git", "Docker"] # Fallback logic
    
    # Logic simplified for demo purposes: in a real app, uses regex for "Expérience", "Formation" etc.
    details['experiences'] = [
        {
            'title': "PROJET D'ANALYSE INTELLIGENTE",
            'date': "2024 - Présent",
            'company': "JobMatch Platform",
            'details': ["Développement de l'interface premium", "Optimisation des scores de similarité"]
        }
    ]
    
    details['education'] = [
        {
            'degree': "FORMATION SUPÉRIEURE EN INFORMATIQUE",
            'date': "En cours",
            'school': "Université Labé"
        }
    ]
    
    return details

# ============= ROUTES =============

@app.route('/')
def index():
    """Redirige vers le tableau de bord ou la connexion"""
    if current_user.is_authenticated:
        return redirect('/dashboard')
    else:
        return redirect('/login')

@app.route('/dashboard')
@login_required
def dashboard():
    """Page du tableau de bord avec données dynamiques et design moderne"""
    # Récupérer les données de l'utilisateur
    user_analyses = CVAnalysis.query.filter_by(user_id=current_user.id).all()
    user_profiles = JobProfile.query.filter_by(user_id=current_user.id).all()
    
    # Calculer les statistiques
    analyses_count = len(user_analyses)
    avg_score = sum(a.final_score for a in user_analyses) / len(user_analyses) if user_analyses else 0
    
    return render_template('dashboard_new.html',
                         analyses_count=analyses_count,
                         profiles_count=len(user_profiles),
                         avg_score=round(avg_score, 1))

@app.route('/job-offers')
@login_required
def job_offers():
    """Page des offres d'emploi"""
    return render_template('job_offers.html')

@app.route('/favorites')
@login_required
def favorites():
    """Page des favoris"""
    return render_template('favorites.html')

@app.route('/job-generator')
def job_generator():
    """Page du générateur d'offres IA"""
    return render_template('job_generator_new.html')

@app.route('/cv-improver')
def cv_improver():
    """Page d'amélioration de CV"""
    return render_template('cv_improver_new.html')

@app.route('/health')
def health():
    """Endpoint de vérification de santé"""
    return jsonify({
        'status': 'healthy',
        'service': 'JobMatch API',
        'version': '1.0.0'
    }), 200

@app.route('/download-cv-template')
def download_cv_template():
    """Télécharger le modèle de CV"""
    try:
        pdf_path = os.path.join(os.path.dirname(__file__), 'CV_Exemple.pdf')
        return send_file(
            pdf_path,
            mimetype='application/pdf',
            as_attachment=True,
            download_name='CV_Modele_JobMatch.pdf'
        )
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/analyze', methods=['POST'])
def analyze():
    """Endpoint API pour l'analyse"""
    try:
        # Récupérer le fichier PDF et l'offre d'emploi
        if 'pdf_file' not in request.files:
            return jsonify({'error': 'Aucun fichier PDF fourni'}), 400
        
        pdf_file = request.files['pdf_file']
        job_offer = request.form.get('job_offer', '').strip()
        threshold = int(request.form.get('threshold', 3))
        
        if pdf_file.filename == '':
            return jsonify({'error': 'Aucun fichier sélectionné'}), 400
        
        if not job_offer or len(job_offer) < 50:
            return jsonify({'error': 'Offre d\'emploi invalide (minimum 50 caractères)'}), 400
        
        # Extraction du texte du CV
        cv_text = extract_text_from_pdf(pdf_file)
        
        if not cv_text or len(cv_text.strip()) == 0:
            return jsonify({'error': 'Impossible d\'extraire le texte du PDF'}), 400
        
        # Nettoyage des textes
        cv_clean = clean_text(cv_text)
        job_clean = clean_text(job_offer)
        
        # Calcul du score de similarité
        similarity_score = calculate_similarity(cv_clean, job_clean)
        
        # Score détaillé
        scores = calculate_detailed_score(cv_clean, job_clean, similarity_score)
        
        # Extraction des mots-clés
        cv_keywords = extract_keywords(cv_clean)
        job_keywords = extract_keywords(job_clean)
        
        # Mots-clés manquants
        missing_keywords = find_missing_keywords(cv_keywords, job_keywords)
        missing_keywords = [kw for kw in missing_keywords if kw[1] >= threshold][:15]
        
        # Recommandations
        recommendation = ""
        if scores['final'] >= 80:
            recommendation = "✅ **Match Exceptionnel!** Votre CV est parfaitement aligné avec les exigences majeures de cette offre. Vos chances de sélection sont très élevées."
        elif scores['final'] >= 65:
            recommendation = "🌟 **Très Bon Profil** - Votre CV correspond bien à l'offre. Quelques ajustements mineurs sur les mots-clés suggérés pourraient optimiser votre score."
        elif scores['final'] >= 45:
            recommendation = "⚠️ **Potentiel Intéressant** - Vous possédez les bases, mais votre CV manque de termes techniques cruciaux listés ci-après pour passer les systèmes de filtrage."
        else:
            recommendation = "ℹ️ **Optimisation Nécessaire** - Votre profil semble s'écarter des attentes de l'offre. Nous vous conseillons de réviser vos expériences pour mettre en avant les compétences demandées."
        
        # Sauvegarder dans la base de données si l'utilisateur est connecté
        if current_user.is_authenticated:
            try:
                analysis = CVAnalysis(
                    user_id=current_user.id,
                    filename=pdf_file.filename,
                    job_title=job_clean[:100] + "..." if len(job_clean) > 100 else job_clean,
                    final_score=scores['final'],
                    similarity_score=scores['similarity'],
                    coverage_score=scores['coverage'],
                    recommendation=recommendation,
                    missing_keywords=json.dumps([kw for kw, count in missing_keywords])
                )
                db.session.add(analysis)
                db.session.commit()
            except Exception as e:
                print(f"Erreur de sauvegarde DB: {e}")
                db.session.rollback()

        return jsonify({
            'success': True,
            'scores': {
                'final': round(scores['final'], 1),
                'similarity': round(scores['similarity'], 1),
                'coverage': round(scores['coverage'], 1)
            },
            'score_color': get_score_color(scores['final']),
            'recommendation': recommendation,
            'missing_keywords': [{'keyword': kw, 'count': count} for kw, count in missing_keywords],
            'cv_keywords': [{'keyword': kw, 'count': count} for kw, count in cv_keywords[:10]],
            'job_keywords': [{'keyword': kw, 'count': count} for kw, count in job_keywords[:10]]
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ============= AUTHENTIFICATION ROUTES =============

@app.route('/login')
def login_page():
    """Page de connexion"""
    return render_template('login.html')

@app.route('/register')
def register_page():
    """Page d'inscription"""
    return render_template('register.html')

@app.route('/forgot-password')
def forgot_password_page():
    """Page de récupération de mot de passe"""
    return render_template('forgot_password.html')

@app.route('/profile')
@login_required
def profile_page():
    """Page de profil utilisateur"""
    analyses_count = CVAnalysis.query.filter_by(user_id=current_user.id).count()
    recent_analyses = CVAnalysis.query.filter_by(user_id=current_user.id).order_by(CVAnalysis.created_at.desc()).limit(10).all()
    
    return render_template('profile_new.html', 
                          user=current_user, 
                          analyses_count=analyses_count,
                          recent_analyses=recent_analyses)

@app.route('/logout')
def logout():
    """Déconnexion utilisateur"""
    logout_user()
    return redirect('/')

# ============= API AUTHENTIFICATION =============

@app.route('/api/login', methods=['POST'])
def api_login():
    """API de connexion"""
    try:
        data = request.get_json()
        email = data.get('email', '').strip()
        password = data.get('password', '')

        # Validation basique
        if not email or not password:
            return jsonify({'error': 'Email et mot de passe requis'}), 400

        # Vérifier le format email
        if '@' not in email:
            return jsonify({'error': 'Email invalide'}), 400

        # TODO: Vérifier dans la base de données
        user = User.query.filter_by(email=email).first()
        
        if not user or not user.check_password(password):
            return jsonify({'error': 'Email ou mot de passe incorrect'}), 401

        login_user(user)
        
        return jsonify({
            'message': 'Connexion réussie',
            'user': {
                'email': user.email,
                'firstname': user.firstname,
                'lastname': user.lastname
            }
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/register', methods=['POST'])
def api_register():
    """API d'inscription"""
    try:
        data = request.get_json()
        firstname = data.get('firstname', '').strip()
        lastname = data.get('lastname', '').strip()
        email = data.get('email', '').strip()
        password = data.get('password', '')
        profession = data.get('profession', '')

        # Validation
        if not all([firstname, lastname, email, password, profession]):
            return jsonify({'error': 'Tous les champs sont requis'}), 400

        if len(firstname) < 2:
            return jsonify({'error': 'Le prénom est trop court'}), 400

        if len(lastname) < 2:
            return jsonify({'error': 'Le nom est trop court'}), 400

        if '@' not in email or '.' not in email.split('@')[1]:
            return jsonify({'error': 'Email invalide'}), 400

        if len(password) < 8:
            return jsonify({'error': 'Le mot de passe doit avoir au moins 8 caractères'}), 400

        # Vérifier si l'email existe déjà
        if User.query.filter_by(email=email).first():
            return jsonify({'error': 'Cet email est déjà utilisé'}), 400

        # Créer le nouvel utilisateur
        new_user = User(
            firstname=firstname,
            lastname=lastname,
            email=email,
            profession=profession
        )
        new_user.set_password(password)
        
        db.session.add(new_user)
        db.session.commit()
        
        return jsonify({
            'message': 'Inscription réussie',
            'user': {
                'firstname': firstname,
                'lastname': lastname,
                'email': email,
                'profession': profession
            }
        }), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/forgot-password', methods=['POST'])
def api_forgot_password():
    """API pour demander la réinitialisation du mot de passe"""
    try:
        data = request.get_json()
        email = data.get('email', '').strip()

        if not email:
            return jsonify({'error': 'Email requis'}), 400

        if '@' not in email:
            return jsonify({'error': 'Email invalide'}), 400

        # TODO: Générer un token de réinitialisation
        # TODO: Envoyer un email avec le lien de réinitialisation
        # TODO: Sauvegarder le token dans la BD avec une expiration

        return jsonify({
            'message': 'Email de réinitialisation envoyé',
            'email': email
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/reset-password', methods=['POST'])
def api_reset_password():
    """API pour réinitialiser le mot de passe"""
    try:
        data = request.get_json()
        token = data.get('token', '')
        password = data.get('password', '')

        if not token or not password:
            return jsonify({'error': 'Token et mot de passe requis'}), 400

        if len(password) < 8:
            return jsonify({'error': 'Le mot de passe doit avoir au moins 8 caractères'}), 400

        # TODO: Valider le token
        # TODO: Hasher le nouveau mot de passe
        # TODO: Mettre à jour dans la BD
        # TODO: Supprimer le token utilisé

        return jsonify({
            'message': 'Mot de passe réinitialisé avec succès'
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ============= NOUVELLES FONCTIONNALITÉS =============

@app.route('/api/export-pdf', methods=['POST'])
def export_pdf():
    """Exporte les résultats d'analyse en PDF"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Aucune donnée fournie'}), 400
        
        # Créer le PDF en mémoire
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=0.5*inch)
        story = []
        styles = getSampleStyleSheet()
        
        # Style personnalisé
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#004E89'),
            spaceAfter=30,
            alignment=TA_CENTER
        )
        
        heading_style = ParagraphStyle(
            'CustomHeading',
            parent=styles['Heading2'],
            fontSize=16,
            textColor=colors.HexColor('#FF6B35'),
            spaceAfter=12,
            spaceBefore=12
        )
        
        # Titre
        story.append(Paragraph("Rapport d'Analyse JobMatch", title_style))
        story.append(Spacer(1, 0.2*inch))
        story.append(Paragraph(f"Date: {datetime.now().strftime('%d/%m/%Y %H:%M')}", styles['Normal']))
        story.append(Spacer(1, 0.3*inch))
        
        # Scores
        story.append(Paragraph("📊 Scores de Compatibilité", heading_style))
        scores_data = [
            ['Métrique', 'Score'],
            ['Score Global', f"{data.get('scores', {}).get('final', 0)}%"],
            ['Similarité Textuelle', f"{data.get('scores', {}).get('similarity', 0)}%"],
            ['Couverture Mots-clés', f"{data.get('scores', {}).get('coverage', 0)}%"]
        ]
        scores_table = Table(scores_data, colWidths=[4*inch, 2*inch])
        scores_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#004E89')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.grey)
        ]))
        story.append(scores_table)
        story.append(Spacer(1, 0.3*inch))
        
        # Recommandation
        story.append(Paragraph("💡 Recommandation", heading_style))
        recommendation = data.get('recommendation', '').replace('**', '').replace('✅', '').replace('⚠️', '').replace('ℹ️', '')
        story.append(Paragraph(recommendation, styles['Normal']))
        story.append(Spacer(1, 0.3*inch))
        
        # Mots-clés manquants
        missing_keywords = data.get('missing_keywords', [])
        if missing_keywords:
            story.append(Paragraph("🔑 Mots-clés à Ajouter", heading_style))
            keywords_text = ", ".join([kw.get('keyword', '') for kw in missing_keywords[:10]])
            story.append(Paragraph(keywords_text, styles['Normal']))
            story.append(Spacer(1, 0.3*inch))
        
        # Construire le PDF
        doc.build(story)
        buffer.seek(0)
        
        return send_file(
            buffer,
            mimetype='application/pdf',
            as_attachment=True,
            download_name=f'JobMatch_Analyse_{datetime.now().strftime("%Y%m%d_%H%M%S")}.pdf'
        )
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/suggest-rephrasing', methods=['POST'])
def suggest_rephrasing():
    """Suggère des reformulations pour améliorer le CV"""
    try:
        data = request.get_json()
        cv_text = data.get('cv_text', '')
        job_offer = data.get('job_offer', '')
        
        if not cv_text or not job_offer:
            return jsonify({'error': 'CV et offre requis'}), 400
        
        # Extraire les compétences de l'offre
        job_keywords = extract_keywords(clean_text(job_offer))
        cv_keywords = extract_keywords(clean_text(cv_text))
        
        # Trouver les compétences manquantes
        missing = find_missing_keywords(cv_keywords, job_keywords)
        
        # Générer des suggestions
        suggestions = []
        for keyword, count in missing[:8]:
            priority = 'high' if count >= 4 else 'medium'
            suggestions.append({
                'keyword': keyword,
                'suggestion': f"Intégrez le terme '{keyword}' dans vos réalisations passées pour démontrer une expérience concrète.",
                'priority': priority
            })
        
        return jsonify({
            'success': True,
            'suggestions': suggestions
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/compare-cvs', methods=['POST'])
def compare_cvs():
    """Compare plusieurs CV avec une offre"""
    try:
        if 'pdf_files' not in request.files:
            return jsonify({'error': 'Aucun fichier PDF fourni'}), 400
        
        pdf_files = request.files.getlist('pdf_files')
        job_offer = request.form.get('job_offer', '').strip()
        
        if len(pdf_files) < 2:
            return jsonify({'error': 'Au moins 2 CV sont requis pour la comparaison'}), 400
        
        if not job_offer or len(job_offer) < 50:
            return jsonify({'error': 'Offre d\'emploi invalide'}), 400
        
        job_clean = clean_text(job_offer)
        results = []
        
        for idx, pdf_file in enumerate(pdf_files):
            cv_text = extract_text_from_pdf(pdf_file)
            if not cv_text:
                continue
                
            cv_clean = clean_text(cv_text)
            similarity = calculate_similarity(cv_clean, job_clean)
            scores = calculate_detailed_score(cv_clean, job_clean, similarity)
            
            results.append({
                'filename': pdf_file.filename,
                'index': idx + 1,
                'scores': {
                    'final': round(scores['final'], 1),
                    'similarity': round(scores['similarity'], 1),
                    'coverage': round(scores['coverage'], 1)
                },
                'score_color': get_score_color(scores['final'])
            })
        
        # Trier par score final
        results.sort(key=lambda x: x['scores']['final'], reverse=True)
        
        return jsonify({
            'success': True,
            'comparison': results,
            'best_cv': results[0] if results else None
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/trends', methods=['GET'])
def get_trends():
    """Analyse les tendances réelles des mots-clés depuis la base de données"""
    try:
        # Récupérer toutes les analyses
        analyses = CVAnalysis.query.all()
        
        all_keywords = []
        for a in analyses:
            if a.missing_keywords:
                all_keywords.extend(json.loads(a.missing_keywords))
        
        # Simuler des tendances (en production, comparer avec les données précédentes)
        kw_counts = Counter(all_keywords).most_common(8)
        trends_list = []
        for kw, count in kw_counts:
            trends_list.append({
                'keyword': kw,
                'frequency': count,
                'trend': random.choice(['up', 'stable', 'down'])
            })

        trends = {
            'top_keywords': trends_list,
            'sectors': [
                {'sector': 'Développement Web', 'demand': 45},
                {'sector': 'Data Science', 'demand': 30},
                {'sector': 'DevOps', 'demand': 15},
                {'sector': 'Mobile', 'demand': 10}
            ],
            'avg_score': 62.5,
            'total_analyses': len(analyses)
        }
        
        return jsonify({
            'success': True,
            'trends': trends
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/save-profile', methods=['POST'])
@login_required
def save_profile():
    """Sauvegarde un profil d'offre dans la base de données"""
    try:
        data = request.get_json()
        
        profile = JobProfile(
            user_id=current_user.id,
            title=data.get('title', 'Offre sans titre'),
            company=data.get('company', ''),
            description=data.get('job_offer', ''),
            tags=",".join(data.get('tags', []))
        )
        
        db.session.add(profile)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'profile': {
                'id': profile.id,
                'title': profile.title,
                'company': profile.company,
                'date': profile.created_at.isoformat()
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/dashboard-stats', methods=['GET'])
@login_required
def dashboard_stats():
    """Retourne les statistiques réelles pour le dashboard"""
    try:
        analyses = CVAnalysis.query.filter_by(user_id=current_user.id).order_by(CVAnalysis.created_at.desc()).all()
        
        if not analyses:
            return jsonify({
                'success': True,
                'stats': {
                    'total_analyses': 0,
                    'avg_score': 0,
                    'best_score': 0,
                    'improvement_rate': 0,
                    'scores_distribution': [],
                    'recent_analyses': [],
                    'top_missing_keywords': []
                }
            })

        total = len(analyses)
        avg_score = sum(a.final_score for a in analyses) / total
        best_score = max(a.final_score for a in analyses)
        
        # Calcul du taux d'amélioration (comparaison entre la première et la dernière analyse)
        improvement_rate = 0
        if total >= 2:
            first_score = analyses[-1].final_score
            last_score = analyses[0].final_score
            if first_score > 0:
                improvement_rate = ((last_score - first_score) / first_score) * 100

        # Distribution des scores
        distribution = [
            {'range': '0-30', 'count': len([a for a in analyses if a.final_score <= 30])},
            {'range': '31-50', 'count': len([a for a in analyses if 31 <= a.final_score <= 50])},
            {'range': '51-70', 'count': len([a for a in analyses if 51 <= a.final_score <= 70])},
            {'range': '71-90', 'count': len([a for a in analyses if 71 <= a.final_score <= 90])},
            {'range': '91-100', 'count': len([a for a in analyses if a.final_score > 90])}
        ]

        # Mots-clés manquants les plus fréquents
        all_missing = []
        for a in analyses:
            if a.missing_keywords:
                all_missing.extend(json.loads(a.missing_keywords))
        
        kw_counts = Counter(all_missing).most_common(5)
        top_missing = [{'keyword': kw, 'frequency': count} for kw, count in kw_counts]

        stats = {
            'total_analyses': total,
            'avg_score': round(avg_score, 1),
            'best_score': round(best_score, 1),
            'improvement_rate': round(improvement_rate, 1),
            'scores_distribution': distribution,
            'recent_analyses': [
                {
                    'date': a.created_at.strftime('%Y-%m-%d'),
                    'score': round(a.final_score, 1),
                    'title': a.job_title
                } for a in analyses[:5]
            ],
            'top_missing_keywords': top_missing
        }
        
        return jsonify({
            'success': True,
            'stats': stats
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/generate-premium-cv', methods=['POST'])
def generate_premium_cv():
    """Génère un CV PDF premium basé sur le texte du PDF téléversé"""
    try:
        if 'pdf_file' not in request.files:
            return jsonify({'error': 'Aucun fichier PDF fourni'}), 400
        
        pdf_file = request.files['pdf_file']
        cv_text = extract_text_from_pdf(pdf_file)
        
        if not cv_text:
            return jsonify({'error': 'Échec de l\'extraction du texte'}), 400
            
        # Extraire les infos
        cv_data = extract_cv_details(cv_text)
        
        # Lire le CSS du dossier Format
        css_path = os.path.join(app.root_path, 'Format', 'style.css')
        css_content = ""
        if os.path.exists(css_path):
            with open(css_path, 'r', encoding='utf-8') as f:
                css_content = f.read()
        
        # Rendre le HTML avec Jinja2
        rendered_html = render_template('premium_cv_template.html', 
                                      css_content=css_content,
                                      **cv_data)
        
        # En production, on utiliserait pdfkit ou weasyprint pour HTML -> PDF
        # Ici on simule en renvoyant le HTML pour visualisation ou on génère via reportlab
        # Pour rester dans la stack installée sans installer wkhtmltopdf :
        
        return rendered_html # Retourne le HTML pour que l'user puisse "Imprimer en PDF"
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ============= API ROUTES FOR DASHBOARD =============

@app.route('/api/recent-offers')
@login_required
def get_recent_offers():
    """API pour récupérer les offres récentes générées"""
    try:
        # Utiliser le générateur IA pour créer des offres d'exemple
        generator = JobOfferAIGenerator()
        
        # Générer quelques offres d'exemple
        recent_offers = generator.generate_batch(5)
        
        return jsonify(recent_offers)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/dashboard-stats')
@login_required
def get_dashboard_stats():
    """API pour récupérer les statistiques du tableau de bord"""
    try:
        user_analyses = CVAnalysis.query.filter_by(user_id=current_user.id).all()
        user_profiles = JobProfile.query.filter_by(user_id=current_user.id).all()
        
        # Calculer les statistiques
        stats = {
            'analyses_count': len(user_analyses),
            'avg_score': sum(a.final_score for a in user_analyses) / len(user_analyses) if user_analyses else 0,
            'job_offers_count': len(user_profiles) * 3,  # Simulation
            'profile_complete': 90,  # Basé sur les infos utilisateur
            'recent_analyses': len([a for a in user_analyses if (datetime.now() - a.created_at).days <= 7]),
            'total_storage': sum(a.final_score for a in user_analyses) * 0.1,  # Simulation MB
        }
        
        return jsonify(stats)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/user-activity')
@login_required
def get_user_activity():
    """API pour récupérer l'activité récente de l'utilisateur"""
    try:
        user_analyses = CVAnalysis.query.filter_by(user_id=current_user.id).order_by(CVAnalysis.created_at.desc()).limit(10).all()
        
        activities = []
        for analysis in user_analyses:
            activities.append({
                'type': 'analysis',
                'description': f"Analyse CV - {analysis.final_score:.0f}%",
                'date': analysis.created_at.strftime('%Y-%m-%d %H:%M'),
                'filename': analysis.filename,
                'score': analysis.final_score
            })
        
        return jsonify(activities)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ============= ROUTES IA - GÉNÉRATEUR D'OFFRES D'EMPLOI =============

@app.route('/api/generate-job-offer', methods=['POST'])
def generate_job_offer():
    """Génère une offre d'emploi via IA"""
    try:
        data = request.get_json()
        role_type = data.get('role_type', None)
        
        generator = JobOfferAIGenerator()
        offer = generator.generate_offer(role_type)
        
        return jsonify({
            'success': True,
            'offer': offer
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/generate-job-offers-batch', methods=['POST'])
def generate_job_offers_batch():
    """Génère un lot d'offres d'emploi"""
    try:
        data = request.get_json()
        count = data.get('count', 10)
        role_type = data.get('role_type', None)
        
        if count < 1 or count > 50:
            count = 10
        
        generator = JobOfferAIGenerator()
        offers = generator.generate_batch(count, role_type)
        
        return jsonify({
            'success': True,
            'offers': offers,
            'total': len(offers)
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/generate-offers-by-cv', methods=['POST'])
def generate_offers_by_cv():
    """Génère des offres basées sur les compétences du CV"""
    try:
        if 'pdf_file' not in request.files:
            return jsonify({'error': 'Aucun fichier PDF fourni'}), 400
        
        pdf_file = request.files['pdf_file']
        cv_text = extract_text_from_pdf(pdf_file)
        
        if not cv_text:
            return jsonify({'error': 'Échec de l\'extraction du texte'}), 400
        
        # Extraire les mots-clés du CV
        cv_keywords = extract_keywords(cv_text)
        required_skills = [keyword[0] for keyword in cv_keywords[:10]]
        
        generator = JobOfferAIGenerator()
        
        # Générer plusieurs offres adaptées
        count = request.form.get('count', 5, type=int)
        offers = []
        
        for _ in range(min(count, 10)):
            offer = generator.generate_by_requirements(required_skills)
            # Calculer le score de match avec le CV
            offer['match_score'] = calculate_similarity(cv_text, offer['description'])
            offers.append(offer)
        
        # Trier par score de match
        offers.sort(key=lambda x: x['match_score'], reverse=True)
        
        return jsonify({
            'success': True,
            'offers': offers,
            'cv_skills_detected': required_skills,
            'total': len(offers)
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/generate-specific-offer', methods=['POST'])
def generate_specific_offer():
    """Génère une offre spécifique avec critères personnalisés"""
    try:
        data = request.get_json()
        
        required_skills = data.get('required_skills', [])
        experience_level = data.get('experience_level', None)
        location = data.get('location', None)
        
        if not required_skills:
            return jsonify({'error': 'Compétences requises manquantes'}), 400
        
        generator = JobOfferAIGenerator()
        offer = generator.generate_by_requirements(
            required_skills=required_skills,
            experience_level=experience_level,
            location=location
        )
        
        return jsonify({
            'success': True,
            'offer': offer
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ============= ROUTES CV IMPROVER =============

@app.route('/api/improve-cv', methods=['POST'])
def improve_cv_route():
    """Améliore un CV uploadé et retourne le HTML formaté"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'Aucun fichier uploadé'}), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({'error': 'Nom de fichier vide'}), 400
        
        # Extraire le texte du PDF
        cv_text = extract_text_from_pdf(file)
        
        if not cv_text:
            return jsonify({'error': 'Impossible d\'extraire le texte du PDF'}), 400
        
        # Améliorer le CV
        result = improve_cv(cv_text)
        
        return jsonify({
            'success': True,
            'data': result['data'],
            'improvements': result['improvements'],
            'html': result['html']
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/download-cv-html', methods=['POST'])
def download_cv_html():
    """Télécharge le CV amélioré en HTML"""
    try:
        data = request.get_json()
        html_content = data.get('html')
        nom = data.get('nom', 'CV')
        
        if not html_content:
            return jsonify({'error': 'Contenu HTML manquant'}), 400
        
        # Créer un fichier HTML
        html_bytes = html_content.encode('utf-8')
        
        return send_file(
            io.BytesIO(html_bytes),
            mimetype='text/html',
            as_attachment=True,
            download_name=f'{nom}_CV_Ameliore.html'
        )
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
