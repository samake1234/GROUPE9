# JobMatch - Analyseur d'Offres d'Emploi avec IA

**JobMatch** est une plateforme web intelligente qui analyse la compatibilité entre votre CV et les offres d'emploi, grâce à l'IA (Gemini) et le traitement du langage naturel (NLP).

---

## 📋 Table des matières

- [Fonctionnalités principales](#-fonctionnalités-principales)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Utilisation](#-utilisation)
- [Structure du projet](#-structure-du-projet)
- [Technologies](#-technologies)
- [Support & Dépannage](#-support--dépannage)

---

## 🚀 Fonctionnalités principales

### 1. **Authentification & Profil Utilisateur**
- ✅ Inscription et connexion sécurisées
- ✅ Gestion du profil avec avatar et bannière
- ✅ Upload et modification de photo de profil
- ✅ Historique d'analyses personnalisé

### 2. **Analyseur d'Offres d'Emploi** 🔍
- Analysez la compatibilité entre votre **CV (PDF)** et une **offre d'emploi**
- Score global en temps réel
- Détails des points forts et des lacunes
- Recommandations d'amélioration basées sur l'IA
- Résultats détaillés avec :
  - **Score de compatibilité** : mesure du match général
  - **Score de couverture** : pourcentage de compétences requises trouvées
  - **Compétences manquantes** : liste des skills à acquérir
  - **Plan d'action** : recommandations IA pour améliorer

### 3. **Générateur d'Offres avec IA** ✨
- Générez des **offres d'emploi réalistes** pour vos besoins
- Entrez un titre de poste, une entreprise et les compétences clés
- L'IA (Gemini) crée une description complète et professionnelle
- Copiez et utilisez les offres générées

### 4. **Dashboard & Statistiques** 📊
- Vue d'ensemble des analyses réalisées
- Score moyen des compatibilités
- Nombre d'offres sauvegardées
- Historique récent des analyses

### 5. **Gestion des Offres Sauvegardées** 💾
- Sauvegardez les offres qui vous intéressent
- Consulter la liste complète avec statuts (sauvegardée, appliquée, rejetée)
- Accès rapide aux offres d'emploi pertinentes

### 6. **Amélioration du CV** 📝
- Téléchargez votre CV
- Recevez des recommandations IA pour l'optimiser
- Suggestions de mots-clés et formats

### 7. **Abonnement Premium** 💎
- Analyses illimitées
- Génération d'offres illimitée
- Recommandations avancées

---

## 💻 Installation

### Prérequis
- **Python 3.9+**
- **pip** (gestionnaire de paquets Python)
- **Clé API Gemini** (Google AI)

### Étapes d'installation

1. **Clonez le repository**
```bash
git clone <url-du-repo>
cd jobmaths
```

2. **Créez un environnement virtuel**
```bash
python -m venv venv
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate
```

3. **Installez les dépendances**
```bash
cd flask_app
pip install -r requirements.txt
```

4. **Configurez les variables d'environnement**

Créez un fichier `.env` à la racine de `flask_app/` :
```ini
FLASK_CONFIG=development
FLASK_ENV=development
SECRET_KEY=your-secret-key-here
GEMINI_API_KEY=your-gemini-api-key
GEMINI_ENABLED=1
SQLALCHEMY_DATABASE_URI=sqlite:///instance/jobmatch.db
```

5. **Initialisez la base de données**
```bash
python
>>> from app import app, db
>>> with app.app_context():
...     db.create_all()
>>> exit()
```

6. **Lancez l'application**
```bash
python app.py
```

L'application est alors accessible à : **http://localhost:5000**

---

## ⚙️ Configuration

### Variables d'environnement

| Variable | Description | Exemple |
|----------|-------------|---------|
| `FLASK_CONFIG` | Mode de l'application | `development` ou `production` |
| `SECRET_KEY` | Clé secrète Flask | `votre-cle-secrete` |
| `GEMINI_API_KEY` | Clé API Google Gemini | `AIza...` |
| `GEMINI_ENABLED` | Active/désactive l'IA | `1` (activé) ou `0` |
| `SQLALCHEMY_DATABASE_URI` | Connexion base de données | `sqlite:///jobmatch.db` |

### Configuration Gemini

1. Allez sur [Google AI Studio](https://aistudio.google.com/)
2. Créez une nouvelle clé API
3. Copiez la clé dans votre `.env`

---

## � Informations de Connexion (Admin & Test)

Voici les identifiants par défaut pour tester l'application (une fois la base initialisée avec `seed.py`) :

### Comptes de test
| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Développeuse | `alice@jobmatch.test` | `alice123` |
| Product Manager | `bob@jobmatch.test` | `bob123` |
| Designer UX/UI | `charlie@jobmatch.test` | `charlie123` |
| Data Scientist | `diana@jobmatch.test` | `diana123` |
| Visionnaire | `castro@jobmatch.test` | `castro123` |

### Compte Administrateur (SuperAdmin)
- **Email :** `samakedelamou858@gmail.com`
- **Mot de passe :** *(Mot de passe défini lors de votre inscription)*
- **Accès SuperAdmin :** L'interface d'administration est accessible via `/superadmin`.
- **Note :** Pour accorder les droits administrateur à n'importe quel compte existant, exécutez le script : `python migrate_admin.py` depuis le dossier `flask_app`.

---

## �📱 Utilisation

### Création de compte
1. Cliquez sur **"S'inscrire"** sur l'accueil
2. Remplissez le formulaire (mail, mot de passe)
3. Confirmez votre inscription

### Analyse d'une offre d'emploi

1. Accédez à **"Analyseur d'Offres"** dans le menu
2. Deux options :
   - **Copier une offre réelle** : collez le texte dans le champ
   - **Générer une offre test** : cliquez sur le bouton "IA" pour charger un exemple
3. Uploadez votre **CV en PDF**
4. Cliquez sur **"Lancer l'Analyse Cognitive"**
5. Consultez les résultats :
   - Score global en haut à droite
   - Points forts et lacunes
   - Recommandations d'amélioration

### Génération d'offres

1. Allez à **"Analyseur d'Offres"** → onglet **"Génération d'Offre"**
2. Remplissez :
   - Titre du poste (ex: "Senior Fullstack Developer")
   - Nom de l'entreprise
   - Compétences clés (séparées par des virgules)
3. Cliquez sur **"Générer l'Offre avec Gemini"**
4. Copiez et utilisez l'offre générée

### Gestion du profil

1. Allez à **"Mon Profil"**
2. Mettez à jour vos informations
3. Uploadez une photo de profil en cliquant l'identifiant
4. Uploadez une bannière en cliquant l'image de couverture
5. Cliquez **"Enregistrer les modifications"**

### Voir mes offres sauvegardées

1. Allez à **"Mes Offres"**
2. Consultez toutes les offres que vous avez sauvegardées
3. Modifiez le statut (sauvegardée → appliquée → rejetée)

---

## 📁 Structure du projet

```
jobmaths/
├── flask_app/                          # Application principale
│   ├── app.py                          # Point d'entrée Flask
│   ├── config.py                       # Configuration
│   ├── models.py                       # Modèles de base de données
│   ├── requirements.txt                # Dépendances Python
│   ├── gemini_service.py              # Service Gemini (IA)
│   ├── ai_job_generator.py            # Générateur d'offres IA
│   ├── cv_improver.py                 # Amélioration de CV
│   ├── static/                         # Fichiers statiques
│   │   ├── css/                        # Feuilles de style
│   │   ├── js/                         # Scripts JavaScript
│   │   └── uploads/                    # Stockage des uploads
│   ├── templates/                      # Pages HTML/Jinja2
│   │   ├── base_v3.html               # Template de base
│   │   ├── login.html                 # Page de connexion
│   │   ├── register.html              # Page d'inscription
│   │   ├── dashboard.html             # Dashboard
│   │   ├── profile.html               # Profil utilisateur
│   │   ├── job_generator_v3.html      # Analyseur & Générateur
│   │   ├── my_offers_v3.html          # Mes offres sauvegardées
│   │   ├── cv_improver_v3.html        # Amélioration CV
│   │   └── subscriptions_v3.html      # Gestion abonnement
│   ├── instance/                       # Base de données locale
│   └── .env                            # Variables d'environnement
└── README.md                           # Cette documentation

```

---

## 🛠️ Technologies utilisées

### Backend
- **Flask** : Framework web Python
- **SQLAlchemy** : ORM pour la base de données
- **Flask-Login** : Gestion des sessions utilisateur
- **PyPDF2** : Extraction de texte depuis PDF

### IA & NLP
- **Google Gemini API** : Génération et recommandations IA
- **scikit-learn** : Machine Learning (TF-IDF, similitude cosinus)
- **NLTK** : Traitement du langage naturel
- **ReportLab** : Génération de rapports PDF

### Frontend
- **HTML5 & CSS3** : Structure et style
- **JavaScript (Vanilla)** : Interactivité client
- **Responsive Design** : Mobile-friendly

### Base de données
- **SQLite** : Base de données (développement)
- Configurable avec PostgreSQL/MySQL pour la production

---

## 🔒 Sécurité

- Mots de passe hashés avec Werkzeug
- Protections CSRF via Flask
- Validation des uploads (fichiers, taille max 50MB)
- Sessions Flask-Login sécurisées
- Variables d'environnement pour les données sensibles

---

## 🐛 Support & Dépannage

### Problème : Erreur "no such column: user.profile_picture"

**Solution** : Exécutez le script de migration
```bash
python migrate_add_profile_fields.py
```

### Problème : Gemini API key invalide

**Solution** : 
1. Vérifiez votre `.env` : `GEMINI_API_KEY=votre-clé`
2. Testez la clé sur [Google AI Studio](https://aistudio.google.com/)
3. Redémarrez l'app : `python app.py`

### Problème : Upload de CV échoue

**Solution** :
- Vérifiez que le fichier est en PDF valide
- Étendue du fichier < 50 MB
- Dossier `/static/uploads/profiles/` existe

### Problème : Base de données corrompue

**Solution** :
```bash
# Supprimez la base
rm flask_app/instance/jobmatch.db

# Recréez-la
python
>>> from app import app, db
>>> with app.app_context():
...     db.create_all()
```

---

## 📞 Contact & Support

Pour toute question ou problème, consultez les logs dans :
- Console Flask (en développement)
- Dossier `logs/` (en production)

---

## 📄 Licence

Propriétaire - 2026 JobMatch

---

**Bonne utilisation de JobMatch ! 🚀**
