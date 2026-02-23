"""
Configuration de l'application Flask JobMatch
"""

import os

class Config:
    """Configuration de base"""
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'
    MAX_CONTENT_LENGTH = 50 * 1024 * 1024  # 50MB max
    UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'uploads')
    
    # NLP Settings
    MIN_KEYWORD_LENGTH = 3
    MAX_KEYWORDS_DISPLAY = 20
    MIN_JOB_TEXT_LENGTH = 50
    
    # Scoring
    HIGH_SCORE_THRESHOLD = 70
    MEDIUM_SCORE_THRESHOLD = 50
    
    SIMILARITY_WEIGHT = 0.6
    COVERAGE_WEIGHT = 0.4
    
    # NLTK
    NLTK_STOPWORDS_LANGUAGE = 'french'
    
    # TF-IDF
    TFIDF_MAX_FEATURES = 500
    TFIDF_NGRAM_RANGE = (2, 3)


class DevelopmentConfig(Config):
    """Configuration de développement"""
    DEBUG = True
    TESTING = False


class ProductionConfig(Config):
    """Configuration de production"""
    DEBUG = False
    TESTING = False


class TestingConfig(Config):
    """Configuration de test"""
    DEBUG = True
    TESTING = True
    UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'test_uploads')


config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}
