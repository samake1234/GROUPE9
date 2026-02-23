// ============= NAVBAR RESPONSIVE MANAGEMENT =============

class NavbarManager {
    constructor() {
        this.hamburger = document.getElementById('hamburger');
        this.mobileMenu = document.getElementById('mobile-menu');
        this.mobileOverlay = document.getElementById('mobile-overlay');
        this.mobileClose = document.getElementById('mobile-close');
        this.navMenu = document.querySelector('.navbar-menu');
        this.navLinks = document.querySelectorAll('.nav-link, .mobile-link');
        this.navbar = document.getElementById('navbar');
        this.navbarContainer = document.querySelector('.navbar-container');
        this.breakpoints = {
            mobile: 768,
            tablet: 968
        };
        this.isMenuOpen = false;
        this.isMobileView = window.innerWidth <= this.breakpoints.mobile;
        this.isTabletView = window.innerWidth <= this.breakpoints.tablet && window.innerWidth > this.breakpoints.mobile;

        this.init();
    }

    init() {
        // Event listeners
        if (this.hamburger) {
            this.hamburger.addEventListener('click', (e) => this.toggleMobileMenu(e));
        }

        if (this.mobileClose) {
            this.mobileClose.addEventListener('click', () => this.closeMobileMenu());
        }

        if (this.mobileOverlay) {
            this.mobileOverlay.addEventListener('click', () => this.closeMobileMenu());
        }

        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => this.handleLinkClick(e));
        });

        window.addEventListener('resize', () => this.handleResize());
        window.addEventListener('scroll', () => this.handleScroll());

        // Add touch support for mobile
        this.addTouchSupport();
        
        // Add keyboard navigation support
        this.addKeyboardSupport();
        
        // Initialize navbar state
        this.updateNavbarState();
        
        // Navbar scroll effect
        this.handleScroll();
    }

    toggleMobileMenu(e) {
        e.stopPropagation();
        this.isMenuOpen = !this.isMenuOpen;

        if (this.isMenuOpen) {
            this.openMobileMenu();
        } else {
            this.closeMobileMenu();
        }

        // Update ARIA attributes
        this.updateAccessibilityAttributes();
    }

    updateAccessibilityAttributes() {
        if (this.hamburger) {
            this.hamburger.setAttribute('aria-expanded', this.isMenuOpen);
            this.hamburger.setAttribute('aria-label', 
                this.isMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu');
        }

        if (this.mobileMenu) {
            this.mobileMenu.setAttribute('aria-hidden', !this.isMenuOpen);
        }

        if (this.mobileOverlay) {
            this.mobileOverlay.setAttribute('aria-hidden', !this.isMenuOpen);
        }
    }

    openMobileMenu() {
        if (this.mobileMenu) {
            this.mobileMenu.classList.add('active');
            // Trigger reflow to ensure animation works
            void this.mobileMenu.offsetWidth;
        }
        if (this.mobileOverlay) this.mobileOverlay.classList.add('active');
        if (this.hamburger) this.hamburger.classList.add('active');
        
        // Improved body scroll lock
        this.lockBodyScroll();
        this.isMenuOpen = true;

        // Add pulse effect to hamburger
        if (this.hamburger) {
            this.hamburger.style.animation = 'none';
            setTimeout(() => {
                this.hamburger.style.animation = '';
            }, 10);
        }
    }

    closeMobileMenu() {
        if (this.mobileMenu) this.mobileMenu.classList.remove('active');
        if (this.mobileOverlay) this.mobileOverlay.classList.remove('active');
        if (this.hamburger) this.hamburger.classList.remove('active');
        
        // Improved body scroll unlock
        this.unlockBodyScroll();
        this.isMenuOpen = false;
    }

    lockBodyScroll() {
        const scrollY = window.scrollY;
        document.body.style.position = 'fixed';
        document.body.style.top = `-${scrollY}px`;
        document.body.style.width = '100%';
        document.body.style.overflow = 'hidden';
        document.body.dataset.scrollY = scrollY;
    }

    unlockBodyScroll() {
        const scrollY = document.body.dataset.scrollY || '0';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        window.scrollTo(0, parseInt(scrollY));
        delete document.body.dataset.scrollY;
    }

    addTouchSupport() {
        let touchStartX = 0;
        let touchEndX = 0;
        let touchStartY = 0;
        let touchEndY = 0;

        // Handle touch gestures for mobile menu
        document.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
        }, { passive: true });

        document.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            touchEndY = e.changedTouches[0].screenY;
            this.handleSwipeGesture(touchStartX, touchEndX, touchStartY, touchEndY);
        }, { passive: true });
    }

    handleSwipeGesture(startX, endX, startY, endY) {
        const deltaX = endX - startX;
        const deltaY = endY - startY;
        const minSwipeDistance = 50;

        // Check if it's a horizontal swipe
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
            // Swipe from left to right (open menu)
            if (deltaX > 0 && startX < 50 && (this.isMobileView || this.isTabletView)) {
                if (!this.isMenuOpen) {
                    this.openMobileMenu();
                }
            }
            // Swipe from right to left (close menu)
            else if (deltaX < 0 && this.isMenuOpen) {
                this.closeMobileMenu();
            }
        }
    }

    addKeyboardSupport() {
        // Close menu on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isMenuOpen) {
                this.closeMobileMenu();
                if (this.hamburger) {
                    this.hamburger.focus();
                }
            }
        });

        // Focus management for mobile menu
        if (this.mobileMenu) {
            this.mobileMenu.addEventListener('keydown', (e) => {
                if (e.key === 'Tab') {
                    const focusableElements = this.mobileMenu.querySelectorAll(
                        'a, button, [tabindex]:not([tabindex="-1"])'
                    );
                    const firstElement = focusableElements[0];
                    const lastElement = focusableElements[focusableElements.length - 1];

                    if (e.shiftKey && document.activeElement === firstElement) {
                        e.preventDefault();
                        lastElement.focus();
                    } else if (!e.shiftKey && document.activeElement === lastElement) {
                        e.preventDefault();
                        firstElement.focus();
                    }
                }
            });
        }
    }

    handleLinkClick(e) {
        const href = e.target.closest('a')?.getAttribute('href');
        if (href && href.startsWith('#')) {
            e.preventDefault();
            this.closeMobileMenu();

            setTimeout(() => {
                const section = document.getElementById(href.substring(1));
                if (section) {
                    const offset = 80; // Navbar height
                    const elementPosition = section.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - offset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            }, 100);
        }
    }

    handleResize() {
        const width = window.innerWidth;
        const newIsMobile = width <= this.breakpoints.mobile;
        const newIsTablet = width <= this.breakpoints.tablet && width > this.breakpoints.mobile;

        // Update view states
        const viewChanged = newIsMobile !== this.isMobileView || newIsTablet !== this.isTabletView;
        this.isMobileView = newIsMobile;
        this.isTabletView = newIsTablet;

        // Close mobile menu if resizing to desktop
        if (viewChanged && !this.isMobileView && !this.isTabletView && this.isMenuOpen) {
            this.closeMobileMenu();
        }

        // Ensure proper navbar state
        this.updateNavbarState();
    }

    updateNavbarState() {
        if (!this.navbar) return;

        // Show/hide hamburger based on screen size
        if (this.hamburger) {
            if (this.isMobileView || this.isTabletView) {
                this.hamburger.style.display = 'flex';
            } else {
                this.hamburger.style.display = 'none';
            }
        }

        // Show/hide desktop menu based on screen size
        if (this.navMenu) {
            if (this.isMobileView || this.isTabletView) {
                this.navMenu.style.display = 'none';
            } else {
                this.navMenu.style.display = 'flex';
            }
        }
    }

    handleScroll() {
        // Navbar scroll effect
        if (this.navbar) {
            if (window.scrollY > 50) {
                this.navbar.classList.add('scrolled');
            } else {
                this.navbar.classList.remove('scrolled');
            }
        }

        // Update active link
        this.updateActiveLink();

        // Close mobile menu on scroll (only on mobile)
        if ((this.isMobileView || this.isTabletView) && this.isMenuOpen && window.scrollY > 100) {
            this.closeMobileMenu();
        }
    }

    updateActiveLink() {
        let current = '';
        const sections = document.querySelectorAll('section[id]');

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;

            if (window.scrollY >= sectionTop - 150) {
                current = section.getAttribute('id');
            }
        });

        this.navLinks.forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href');

            if (href && href.substring(1) === current) {
                link.classList.add('active');
            }
        });
    }

    // Public method pour scroll
    scrollToSection(sectionId) {
        this.closeMobileMenu();
        setTimeout(() => {
            const section = document.getElementById(sectionId);
            if (section) {
                const offset = 80;
                const elementPosition = section.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - offset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        }, 100);
    }
}

// Initialize navbar manager
let navbarManager;
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        navbarManager = new NavbarManager();
    });
} else {
    navbarManager = new NavbarManager();
}

// Global functions
function scrollToSection(e, sectionId) {
    if (e) e.preventDefault();
    if (navbarManager) {
        navbarManager.scrollToSection(sectionId);
    } else {
        const section = document.getElementById(sectionId);
        if (section) {
            const offset = 80;
            const elementPosition = section.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;
            window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
        }
    }
}

function closeMobileMenu() {
    if (navbarManager) {
        navbarManager.closeMobileMenu();
    }
}

// ============= MODE SOMBRE =============
const themeToggle = document.getElementById('theme-toggle');

if (themeToggle) {
    themeToggle.addEventListener('click', function () {
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
        updateThemeIcon();
    });
}

function updateThemeIcon() {
    if (themeToggle) {
        if (document.body.classList.contains('dark-mode')) {
            themeToggle.textContent = '☀️';
        } else {
            themeToggle.textContent = '🌙';
        }
    }
}

// Load dark mode preference
if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark-mode');
    updateThemeIcon();
}

// ============= HISTORIQUE ============= 
const historyToggle = document.getElementById('history-toggle');

function toggleHistory() {
    const sidebar = document.getElementById('history-sidebar');
    if (sidebar) {
        sidebar.classList.toggle('active');
        loadHistory();
    }
}

if (historyToggle) {
    historyToggle.addEventListener('click', toggleHistory);
}

function saveAnalysis(data) {
    let history = JSON.parse(localStorage.getItem('jobmatchHistory') || '[]');
    const analysis = {
        id: Date.now(),
        date: new Date().toLocaleString('fr-FR'),
        score: data.scores.final,
        recommendation: data.recommendation.substring(0, 50) + '...',
        data: data
    };
    history.unshift(analysis);
    if (history.length > 20) history.pop();
    localStorage.setItem('jobmatchHistory', JSON.stringify(history));
}

function loadHistory() {
    const history = JSON.parse(localStorage.getItem('jobmatchHistory') || '[]');
    const historyList = document.getElementById('history-list');

    if (history.length === 0) {
        historyList.innerHTML = '<p class="empty-message">Aucune analyse pour le moment</p>';
        return;
    }

    historyList.innerHTML = history.map(item => `
        <div class="history-item" onclick="restoreAnalysis(${item.id})">
            <div class="history-item-title">Score: <strong>${item.score}%</strong></div>
            <div class="history-item-score">${item.date}</div>
        </div>
    `).join('');
}

function restoreAnalysis(id) {
    const history = JSON.parse(localStorage.getItem('jobmatchHistory') || '[]');
    const analysis = history.find(item => item.id === id);
    if (analysis) {
        displayResults(analysis.data);
        toggleHistory();
        showToast('Analyse restaurée');
    }
}

// ============= FAQ ============= 
function toggleFAQ(element) {
    const faqItem = element.parentElement;
    const isActive = faqItem.classList.contains('active');

    // Fermer tous les autres
    document.querySelectorAll('.faq-item.active').forEach(item => {
        if (item !== faqItem) {
            item.classList.remove('active');
        }
    });

    faqItem.classList.toggle('active');
}

// ============= NOTIFICATIONS ============= 
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ============= NAVBAR MOBILE ============= 
// Géré par NavbarManager ci-dessus

// Update active nav link on scroll
window.addEventListener('scroll', function () {
    let current = '';
    const sections = document.querySelectorAll('section[id]');

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (scrollY >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });

    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').slice(1) === current) {
            link.classList.add('active');
        }
    });
});

// ============= DOM ELEMENTS =============
const pdfFileInput = document.getElementById('pdf_file');
const jobOfferTextarea = document.getElementById('job_offer');
const analyzeBtn = document.getElementById('analyze-btn');
const thresholdSlider = document.getElementById('threshold');
const thresholdValue = document.getElementById('threshold-value');
const showDetailsCheckbox = document.getElementById('show_details');
const resultsSection = document.getElementById('results-section');
const fileNameDisplay = document.getElementById('file-name');

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPage);
} else {
    initPage();
}

function initPage() {
    // Initialize file input if exists
    if (pdfFileInput) {
        pdfFileInput.addEventListener('change', function (e) {
            if (this.files.length > 0 && fileNameDisplay) {
                fileNameDisplay.textContent = this.files[0].name;
                fileNameDisplay.style.fontWeight = '600';
                fileNameDisplay.style.color = '#2ECC71';
            }
        });
    }

    // Initialize threshold slider if exists
    if (thresholdSlider && thresholdValue) {
        thresholdSlider.addEventListener('input', function () {
            thresholdValue.textContent = this.value;
        });
    }

    // Initialize analyze button if exists
    if (analyzeBtn) {
        analyzeBtn.addEventListener('click', analyzeCV);
    }

    // Initialize AI generator button
    const btnGenerateAI = document.getElementById('btn-generate-ai');
    if (btnGenerateAI) {
        btnGenerateAI.addEventListener('click', generateAIOffer);
    }
}

// File upload, threshold slider, and analyze button handlers are now in initPage()

async function analyzeCV() {
    // Validation
    if (!pdfFileInput || !pdfFileInput.files.length) {
        showError('Veuillez télécharger un CV en PDF');
        return;
    }

    if (!jobOfferTextarea || !jobOfferTextarea.value.trim() || jobOfferTextarea.value.trim().length < 50) {
        showError('Veuillez coller une offre d\'emploi valide (au minimum 50 caractères)');
        return;
    }

    // Prepare form data
    const formData = new FormData();
    formData.append('pdf_file', pdfFileInput.files[0]);
    formData.append('job_offer', jobOfferTextarea.value);
    formData.append('threshold', thresholdSlider ? thresholdSlider.value : 3);

    // Show loading state
    if (analyzeBtn) {
        analyzeBtn.disabled = true;
        const btnText = analyzeBtn.querySelector('.btn-text');
        const btnLoading = analyzeBtn.querySelector('.btn-loading');
        if (btnText) btnText.style.display = 'none';
        if (btnLoading) btnLoading.style.display = 'inline';
    }

    try {
        // Send request
        const response = await fetch('/api/analyze', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Erreur lors de l\'analyse');
        }

        // Display results
        displayResults(data);

    } catch (error) {
        showError(error.message);
    } finally {
        // Reset button state
        if (analyzeBtn) {
            analyzeBtn.disabled = false;
            const btnText = analyzeBtn.querySelector('.btn-text');
            const btnLoading = analyzeBtn.querySelector('.btn-loading');
            if (btnText) btnText.style.display = 'inline';
            if (btnLoading) btnLoading.style.display = 'none';
        }
    }
}

// ============= DISPLAY RESULTS =============
function displayResults(data) {
    if (!resultsSection) return;

    // Show results section
    resultsSection.style.display = 'block';

    // Smooth scroll to results
    setTimeout(() => {
        resultsSection.scrollIntoView({ behavior: 'smooth' });
    }, 100);

    // Status message
    displayStatusMessage(data);

    // Scores
    const mainScore = document.getElementById('main-score');
    const similarityScore = document.getElementById('similarity-score');
    const coverageScore = document.getElementById('coverage-score');

    mainScore.textContent = data.scores.final;
    mainScore.className = 'score-value ' + data.score_color;
    similarityScore.textContent = data.scores.similarity;
    coverageScore.textContent = data.scores.coverage;

    // Recommendation
    const recommendationBox = document.getElementById('recommendation-box');
    recommendationBox.innerHTML = parseMarkdown(data.recommendation);

    // Set recommendation class
    if (data.scores.final >= 70) {
        recommendationBox.className = 'recommendation-box recommendation-success';
    } else if (data.scores.final >= 50) {
        recommendationBox.className = 'recommendation-box recommendation-warning';
    } else {
        recommendationBox.className = 'recommendation-box recommendation-info';
    }

    // Missing keywords
    const missingKeywordsContainer = document.getElementById('missing-keywords');
    if (data.missing_keywords.length > 0) {
        missingKeywordsContainer.innerHTML = data.missing_keywords
            .map(kw => `<div class="keyword-box">📍 <strong>${kw.keyword}</strong></div>`)
            .join('');
    } else {
        missingKeywordsContainer.innerHTML = '<p style="color: #2ECC71; font-weight: 600; text-align: center; width: 100%;">✅ Votre CV contient déjà les mots-clés principaux!</p>';
    }

    // Detailed analysis
    if (showDetailsCheckbox && showDetailsCheckbox.checked) {
        displayDetailedAnalysis(data);
    } else {
        const detailedSection = document.getElementById('detailed-section');
        if (detailedSection) detailedSection.style.display = 'none';
    }

    // Save to history
    saveAnalysis(data);
}

// ============= DISPLAY STATUS MESSAGE =============
function displayStatusMessage(data) {
    const statusBox = document.getElementById('status-message');

    if (data.scores.final >= 70) {
        statusBox.className = 'status-message status-success';
        statusBox.innerHTML = '✅ Analyse complétée!';
    } else if (data.scores.final >= 50) {
        statusBox.className = 'status-message status-warning';
        statusBox.innerHTML = '✅ Analyse complétée!';
    } else {
        statusBox.className = 'status-message status-info';
        statusBox.innerHTML = '✅ Analyse complétée!';
    }
}

// ============= DISPLAY DETAILED ANALYSIS =============
function displayDetailedAnalysis(data) {
    const detailedSection = document.getElementById('detailed-section');
    const cvKeywordsList = document.getElementById('cv-keywords');
    const jobKeywordsList = document.getElementById('job-keywords');

    // CV keywords
    cvKeywordsList.innerHTML = data.cv_keywords
        .map(kw => `<li><strong>${kw.keyword}</strong> (${kw.count})</li>`)
        .join('');

    // Job keywords
    jobKeywordsList.innerHTML = data.job_keywords
        .map(kw => `<li><strong>${kw.keyword}</strong> (${kw.count})</li>`)
        .join('');

    detailedSection.style.display = 'block';
}

// ============= ERROR HANDLING =============
function showError(message) {
    // Create error container if not exists
    let errorContainer = document.getElementById('error-message');
    if (!errorContainer) {
        errorContainer = document.createElement('div');
        errorContainer.id = 'error-message';
        errorContainer.className = 'status-message';
        document.querySelector('.input-section').parentElement.insertBefore(
            errorContainer,
            document.querySelector('.input-section')
        );
    }

    errorContainer.className = 'status-message';
    errorContainer.style.background = '#f8d7da';
    errorContainer.style.borderColor = '#f5c6cb';
    errorContainer.style.color = '#721c24';
    errorContainer.innerHTML = `❌ ${message}`;
    errorContainer.style.display = 'block';

    // Scroll to error
    errorContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Auto-hide after 5 seconds
    setTimeout(() => {
        errorContainer.style.display = 'none';
    }, 5000);
}

// ============= MARKDOWN PARSER =============
function parseMarkdown(text) {
    // Bold
    text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    // Italic
    text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');
    // Return parsed text
    return text;
}

// ============= KEYBOARD SHORTCUT =============
document.addEventListener('keydown', function (e) {
    // Ctrl/Cmd + Enter to analyze
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        if (jobOfferTextarea === document.activeElement) {
            analyzeCV();
        }
    }
});

// ============= RESULTS ACTIONS =============
function copyResults() {
    const resultsText = generateResultsText();
    navigator.clipboard.writeText(resultsText).then(() => {
        showToast('Résultats copiés dans le presse-papier!', 'success');
    }).catch(() => {
        showToast('Erreur lors de la copie', 'error');
    });
}

function shareViaEmail() {
    const resultsText = generateResultsText();
    const subject = encodeURIComponent('Résultats d\'analyse JobMatch');
    const body = encodeURIComponent(resultsText);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
}

function exportPDF() {
    // Alias vers la fonction réelle
    exportPDFReal();
}

function newAnalysis() {
    // Reset form
    if (pdfFileInput) pdfFileInput.value = '';
    if (jobOfferTextarea) jobOfferTextarea.value = '';
    if (fileNameDisplay) {
        fileNameDisplay.textContent = 'Sélectionnez un fichier PDF';
        fileNameDisplay.style.fontWeight = 'normal';
        fileNameDisplay.style.color = '';
    }

    // Hide results
    if (resultsSection) resultsSection.style.display = 'none';

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    showToast('Nouvelle analyse prête', 'success');
}

function generateResultsText() {
    const mainScore = document.getElementById('main-score')?.textContent || '--';
    const similarityScore = document.getElementById('similarity-score')?.textContent || '--';
    const coverageScore = document.getElementById('coverage-score')?.textContent || '--';
    const recommendation = document.getElementById('recommendation-box')?.textContent || '';
    const missingKeywords = Array.from(document.querySelectorAll('#missing-keywords .keyword-box'))
        .map(el => el.textContent.trim())
        .join(', ');

    return `Résultats d'analyse JobMatch
========================

Score Global: ${mainScore}%
Similarité Textuelle: ${similarityScore}%
Couverture Mots-clés: ${coverageScore}%

Recommandation:
${recommendation}

Mots-clés à ajouter:
${missingKeywords || 'Aucun'}

Généré le ${new Date().toLocaleString('fr-FR')}`;
}

// ============= HERO CAROUSEL =============
let currentSlide = 0;
let carouselInterval = null;
const slides = document.querySelectorAll('.carousel-slide');
const indicators = document.querySelectorAll('.indicator');
const totalSlides = slides.length;

function initCarousel() {
    if (slides.length === 0) return;

    // Start auto-play
    startCarousel();

    // Pause on hover
    const carousel = document.querySelector('.hero-carousel');
    if (carousel) {
        carousel.addEventListener('mouseenter', stopCarousel);
        carousel.addEventListener('mouseleave', startCarousel);
    }

    // Touch/swipe support
    let touchStartX = 0;
    let touchEndX = 0;

    if (carousel) {
        carousel.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        });

        carousel.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        });
    }

    function handleSwipe() {
        if (touchEndX < touchStartX - 50) {
            changeSlide(1); // Swipe left - next
        }
        if (touchEndX > touchStartX + 50) {
            changeSlide(-1); // Swipe right - previous
        }
    }
}

function showSlide(index) {
    // Remove active class from all slides and indicators
    slides.forEach(slide => slide.classList.remove('active'));
    indicators.forEach(indicator => indicator.classList.remove('active'));

    // Add active class to current slide and indicator
    if (slides[index]) {
        slides[index].classList.add('active');
    }
    if (indicators[index]) {
        indicators[index].classList.add('active');
    }

    currentSlide = index;
}

function changeSlide(direction) {
    stopCarousel();
    let newIndex = currentSlide + direction;

    if (newIndex >= totalSlides) {
        newIndex = 0;
    } else if (newIndex < 0) {
        newIndex = totalSlides - 1;
    }

    showSlide(newIndex);
    startCarousel();
}

function goToSlide(index) {
    stopCarousel();
    showSlide(index);
    startCarousel();
}

// Make functions globally accessible
window.changeSlide = changeSlide;
window.goToSlide = goToSlide;

// ============= TABS MANAGEMENT =============
function showTab(tabId) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
        tab.style.display = 'none';
    });

    // Remove active class from all tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Show selected tab content
    const activeTab = document.getElementById(tabId);
    if (activeTab) {
        activeTab.classList.add('active');
        activeTab.style.display = 'block';
    }

    // Add active class to the clicked button
    if (event && event.target) {
        event.target.classList.add('active');
    }
}

// ============= DASHBOARD =============
async function loadDashboard() {
    try {
        const response = await fetch('/api/dashboard-stats');
        const data = await response.json();

        if (data.success) {
            const stats = data.stats;

            document.getElementById('total-analyses').textContent = stats.total_analyses;
            document.getElementById('avg-score').textContent = stats.avg_score.toFixed(1) + '%';
            document.getElementById('best-score').textContent = stats.best_score.toFixed(1) + '%';
            document.getElementById('improvement').textContent = '+' + stats.improvement_rate.toFixed(1) + '%';

            // Show dashboard section
            document.getElementById('dashboard').style.display = 'block';
            scrollToSection(null, 'dashboard');
        }
    } catch (error) {
        showToast('Erreur lors du chargement du dashboard', 'error');
    }
}

// ============= TRENDS =============
async function loadTrends() {
    try {
        const response = await fetch('/api/trends');
        const data = await response.json();

        if (data.success) {
            const trends = data.trends;

            // Display keywords
            const keywordsContainer = document.getElementById('trends-keywords');
            if (keywordsContainer) {
                keywordsContainer.innerHTML = trends.top_keywords.map(kw => `
                    <div class="trend-item">
                        <span class="trend-keyword">${kw.keyword}</span>
                        <span class="trend-frequency">${kw.frequency}%</span>
                        <span class="trend-arrow ${kw.trend}">${kw.trend === 'up' ? '📈' : kw.trend === 'down' ? '📉' : '➡️'}</span>
                    </div>
                `).join('');
            }

            // Display sectors
            const sectorsContainer = document.getElementById('trends-sectors');
            if (sectorsContainer) {
                sectorsContainer.innerHTML = trends.sectors.map(sec => `
                    <div class="trend-item">
                        <span class="trend-keyword">${sec.sector}</span>
                        <span class="trend-frequency">${sec.demand}%</span>
                        <span class="trend-arrow up">🔥</span>
                    </div>
                `).join('');
            }
        }
    } catch (error) {
        showToast('Erreur lors du chargement des tendances', 'error');
    }
}

// ============= AI GENERATOR =============
async function generateAIOffer() {
    const btn = document.getElementById('btn-generate-ai');
    const textarea = document.getElementById('job_offer');

    if (!btn || !textarea) return;

    // Show loading state
    btn.classList.add('loading');
    btn.disabled = true;
    const originalContent = btn.innerHTML;
    btn.innerHTML = '<span class="btn-icon">⏳</span> <span class="btn-text">Génération...</span>';

    try {
        const response = await fetch('/api/generate-job-offer', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ role_type: null })
        });

        const data = await response.json();

        if (data.success && data.offer) {
            textarea.value = data.offer.description;

            // Met à jour manuellement le compteur de caractères
            const charCount = document.getElementById('charCount');
            if (charCount) {
                charCount.textContent = textarea.value.length;
            }

            // Met à jour l'aperçu si nécessaire (si script existant le gère)
            textarea.dispatchEvent(new Event('input'));

            showToast('Offre générée avec succès !', 'success');

            // Animation flash sur le textarea
            textarea.style.transition = 'background 0.3s';
            textarea.style.background = 'rgba(46, 204, 113, 0.1)';
            setTimeout(() => {
                textarea.style.background = '';
            }, 1000);

        } else {
            throw new Error(data.error || 'Erreur lors de la génération');
        }
    } catch (error) {
        showToast('Erreur: ' + error.message, 'error');
    } finally {
        btn.classList.remove('loading');
        btn.disabled = false;
        btn.innerHTML = originalContent;
    }
}

// ============= COMPARE CVs =============
document.addEventListener('DOMContentLoaded', function () {
    const compareFiles = document.getElementById('compare_files');
    const compareBtn = document.getElementById('compare-btn');
    const compareResults = document.getElementById('compare-results');

    if (compareFiles) {
        compareFiles.addEventListener('change', function () {
            const files = Array.from(this.files);
            const names = files.map(f => f.name).join(', ');
            document.getElementById('compare-files-names').textContent =
                files.length > 0 ? `${files.length} fichier(s) sélectionné(s)` : 'Sélectionnez 2 CV ou plus (PDF)';
        });
    }

    if (compareBtn) {
        compareBtn.addEventListener('click', async function () {
            const files = document.getElementById('compare_files').files;
            const jobOffer = document.getElementById('job_offer').value;

            if (files.length < 2) {
                showError('Veuillez sélectionner au moins 2 CV');
                return;
            }

            if (!jobOffer || jobOffer.length < 50) {
                showError('Veuillez coller une offre d\'emploi valide');
                return;
            }

            const formData = new FormData();
            for (let file of files) {
                formData.append('pdf_files', file);
            }
            formData.append('job_offer', jobOffer);

            compareBtn.disabled = true;
            const btnText = compareBtn.querySelector('.btn-text');
            const btnLoading = compareBtn.querySelector('.btn-loading');
            if (btnText) btnText.style.display = 'none';
            if (btnLoading) btnLoading.style.display = 'inline';

            try {
                const response = await fetch('/api/compare-cvs', {
                    method: 'POST',
                    body: formData
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Erreur lors de la comparaison');
                }

                // Display results
                compareResults.style.display = 'block';
                compareResults.innerHTML = `
                    <h3>📊 Résultats de la Comparaison</h3>
                    ${data.comparison.map((cv, idx) => `
                        <div class="compare-item ${idx === 0 ? 'best' : ''}">
                            <div class="compare-header">
                                <span class="compare-filename">${cv.filename}</span>
                                ${idx === 0 ? '<span class="compare-badge">🏆 Meilleur Match</span>' : ''}
                            </div>
                            <div class="compare-scores">
                                <div class="compare-score-item">
                                    <div class="compare-score-label">Score Global</div>
                                    <div class="compare-score-value ${cv.score_color}">${cv.scores.final}%</div>
                                </div>
                                <div class="compare-score-item">
                                    <div class="compare-score-label">Similarité</div>
                                    <div class="compare-score-value">${cv.scores.similarity}%</div>
                                </div>
                                <div class="compare-score-item">
                                    <div class="compare-score-label">Couverture</div>
                                    <div class="compare-score-value">${cv.scores.coverage}%</div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                `;

                showToast('Comparaison terminée!', 'success');
            } catch (error) {
                showError(error.message);
            } finally {
                compareBtn.disabled = false;
                if (btnText) btnText.style.display = 'inline';
                if (btnLoading) btnLoading.style.display = 'none';
            }
        });
    }
});

// ============= SUGGESTIONS =============
document.addEventListener('DOMContentLoaded', function () {
    const suggestionsBtn = document.getElementById('suggestions-btn');
    const suggestionsResults = document.getElementById('suggestions-results');

    if (suggestionsBtn) {
        suggestionsBtn.addEventListener('click', async function () {
            const pdfFile = document.getElementById('pdf_file').files[0];
            const jobOffer = document.getElementById('job_offer').value;

            if (!pdfFile) {
                showError('Veuillez sélectionner un CV');
                return;
            }

            if (!jobOffer || jobOffer.length < 50) {
                showError('Veuillez coller une offre d\'emploi valide');
                return;
            }

            // Extract text from PDF (simplified - in production, use the backend)
            const formData = new FormData();
            formData.append('pdf_file', pdfFile);
            formData.append('job_offer', jobOffer);

            suggestionsBtn.disabled = true;
            const btnText = suggestionsBtn.querySelector('.btn-text');
            const btnLoading = suggestionsBtn.querySelector('.btn-loading');
            if (btnText) btnText.style.display = 'none';
            if (btnLoading) btnLoading.style.display = 'inline';

            try {
                // First analyze to get CV text
                const analyzeResponse = await fetch('/api/analyze', {
                    method: 'POST',
                    body: formData
                });

                const analyzeData = await analyzeResponse.json();

                if (!analyzeResponse.ok) {
                    throw new Error(analyzeData.error || 'Erreur lors de l\'analyse');
                }

                // Get suggestions
                const suggestResponse = await fetch('/api/suggest-rephrasing', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        cv_text: analyzeData.cv_keywords.map(k => k.keyword).join(' '), // Use extracted keywords as a proxy for text
                        job_offer: jobOffer
                    })
                });

                const suggestData = await suggestResponse.json();

                if (!suggestResponse.ok) {
                    throw new Error(suggestData.error || 'Erreur lors de la génération des suggestions');
                }

                // Display suggestions
                suggestionsResults.style.display = 'block';
                suggestionsResults.innerHTML = `
                    <h3>💡 Suggestions de Reformulation</h3>
                    ${suggestData.suggestions.map(sug => `
                        <div class="suggestion-item ${sug.priority}">
                            <div class="suggestion-header">
                                <span class="suggestion-keyword">${sug.keyword}</span>
                                <span class="suggestion-priority ${sug.priority}">${sug.priority === 'high' ? 'Priorité Haute' : 'Priorité Moyenne'}</span>
                            </div>
                            <div class="suggestion-text">${sug.suggestion}</div>
                        </div>
                    `).join('')}
                `;

                showToast('Suggestions générées!', 'success');
            } catch (error) {
                showError(error.message);
            } finally {
                suggestionsBtn.disabled = false;
                if (btnText) btnText.style.display = 'inline';
                if (btnLoading) btnLoading.style.display = 'none';
            }
        });
    }
});

// ============= EXPORT PDF REAL =============
async function exportPDFReal() {
    try {
        // Get current results data
        const resultsData = {
            scores: {
                final: document.getElementById('main-score')?.textContent || '0',
                similarity: document.getElementById('similarity-score')?.textContent || '0',
                coverage: document.getElementById('coverage-score')?.textContent || '0'
            },
            recommendation: document.getElementById('recommendation-box')?.textContent || '',
            missing_keywords: Array.from(document.querySelectorAll('#missing-keywords .keyword-box'))
                .map(el => ({ keyword: el.textContent.trim().replace('📍', '').trim() }))
        };

        const response = await fetch('/api/export-pdf', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(resultsData)
        });

        if (!response.ok) {
            throw new Error('Erreur lors de l\'export');
        }

        // Download the PDF
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `JobMatch_Analyse_${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        showToast('PDF exporté avec succès!', 'success');
    } catch (error) {
        showToast('Erreur lors de l\'export PDF', 'error');
    }
}

// Load trends on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadTrends);
} else {
    loadTrends();
}

// ============= CAROUSEL MANAGEMENT =============

class CarouselManager {
    constructor(element) {
        this.carousel = element;
        this.inner = this.carousel.querySelector('.carousel-inner');
        this.slides = this.carousel.querySelectorAll('.carousel-slide');
        this.indicators = this.carousel.querySelectorAll('.indicator');
        this.prevBtn = this.carousel.querySelector('.carousel-prev');
        this.nextBtn = this.carousel.querySelector('.carousel-next');

        this.currentIndex = 0;
        this.interval = null;
        this.intervalTime = 5000;

        this.init();
    }

    init() {
        if (this.slides.length <= 1) return;

        if (this.prevBtn) this.prevBtn.addEventListener('click', () => this.changeSlide(-1));
        if (this.nextBtn) this.nextBtn.addEventListener('click', () => this.changeSlide(1));

        this.indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => this.goToSlide(index));
        });

        this.startAutoSlide();

        this.carousel.addEventListener('mouseenter', () => this.stopAutoSlide());
        this.carousel.addEventListener('mouseleave', () => this.startAutoSlide());
    }

    updateSlides() {
        this.slides.forEach((slide, index) => {
            slide.classList.toggle('active', index === this.currentIndex);
        });

        this.indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === this.currentIndex);
        });
    }

    changeSlide(direction) {
        this.currentIndex = (this.currentIndex + direction + this.slides.length) % this.slides.length;
        this.updateSlides();
    }

    goToSlide(index) {
        this.currentIndex = index;
        this.updateSlides();
    }

    startAutoSlide() {
        this.stopAutoSlide();
        this.interval = setInterval(() => this.changeSlide(1), this.intervalTime);
    }

    stopAutoSlide() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }
}

// Initialize all carousels on the page
document.addEventListener('DOMContentLoaded', () => {
    const carousels = document.querySelectorAll('.carousel');
    carousels.forEach(carousel => new CarouselManager(carousel));
});

// ============= UPLOAD FILE HANDLER - PREMIUM DESIGN =============

document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('pdf_file');
    const filePreview = document.getElementById('filePreview');
    const uploadContent = document.querySelector('.upload-content');
    const jobOfferTextarea = document.getElementById('job_offer');
    const charCountElement = document.getElementById('charCount');

    // Drag and Drop Events
    if (dropZone) {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, preventDefaults, false);
        });

        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }

        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => {
                dropZone.classList.add('dragover');
            });
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => {
                dropZone.classList.remove('dragover');
            });
        });

        dropZone.addEventListener('drop', (e) => {
            const dt = e.dataTransfer;
            const files = dt.files;
            handleFileSelect(files);
        });

        // Click to select
        dropZone.addEventListener('click', () => {
            fileInput.click();
        });

        fileInput.addEventListener('change', (e) => {
            handleFileSelect(e.target.files);
        });
    }

    function handleFileSelect(files) {
        if (files.length > 0) {
            const file = files[0];

            // Check if PDF
            if (file.type !== 'application/pdf') {
                alert('⚠️ Veuillez sélectionner un fichier PDF');
                return;
            }

            // Check file size (max 10MB)
            const maxSize = 10 * 1024 * 1024;
            if (file.size > maxSize) {
                alert('⚠️ Le fichier ne doit pas dépasser 10 MB');
                return;
            }

            // Show preview
            const fileName = file.name;
            const fileSize = (file.size / 1024).toFixed(2) + ' KB';

            document.getElementById('previewName').textContent = fileName;
            document.getElementById('previewSize').textContent = fileSize;

            uploadContent.style.display = 'none';
            filePreview.style.display = 'block';
        }
    }
});

function clearFile() {
    const fileInput = document.getElementById('pdf_file');
    const filePreview = document.getElementById('filePreview');
    const uploadContent = document.querySelector('.upload-content');

    fileInput.value = '';
    filePreview.style.display = 'none';
    uploadContent.style.display = 'flex';
}

// Character Counter for Job Offer
document.addEventListener('DOMContentLoaded', () => {
    const jobOfferTextarea = document.getElementById('job_offer');
    const charCountElement = document.getElementById('charCount');

    if (jobOfferTextarea && charCountElement) {
        jobOfferTextarea.addEventListener('input', () => {
            const count = jobOfferTextarea.value.length;
            charCountElement.textContent = count;

            // Change color based on character count
            if (count < 50) {
                charCountElement.parentElement.style.color = '#e74c3c';
            } else if (count < 200) {
                charCountElement.parentElement.style.color = '#f39c12';
            } else {
                charCountElement.parentElement.style.color = '#2ecc71';
            }
        });
    }
});

// ============= CHATBOT LOGIC =============
document.addEventListener('DOMContentLoaded', () => {
    const fab = document.getElementById('chatbot-fab');
    const window = document.getElementById('chat-window');
    const closeBtn = document.getElementById('close-chat');
    const badge = document.querySelector('.fab-badge');
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-chat');

    if (fab && window && closeBtn) {
        fab.addEventListener('click', () => {
            window.classList.toggle('active');
            if (badge) badge.style.display = 'none';
        });

        closeBtn.addEventListener('click', () => {
            window.classList.remove('active');
        });
    }

    if (chatInput && sendBtn) {
        const handleSend = () => {
            const text = chatInput.value.trim();
            if (text) {
                addUserMessage(text);
                chatInput.value = '';
                processBotResponse(text);
            }
        };

        sendBtn.addEventListener('click', handleSend);
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleSend();
        });
    }
});

function addUserMessage(text) {
    const chatMessages = document.getElementById('chat-messages');
    if (chatMessages) {
        const uDiv = document.createElement('div');
        uDiv.className = 'message user-message';
        uDiv.textContent = text;
        chatMessages.appendChild(uDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

function processBotResponse(text) {
    const chatMessages = document.getElementById('chat-messages');
    const query = text.toLowerCase();
    let response = "";

    if (query.includes('analyser') || query.includes('cv')) {
        response = "Pour analyser votre CV, glissez votre fichier PDF dans la zone dédiée et collez l'offre d'emploi correspondant.";
    } else if (query.includes('tendance') || query.includes('marché')) {
        response = "Consultez la section 'Tendances du Marché' pour voir les compétences les plus recherchées par les recruteurs en ce moment.";
    } else if (query.includes('profil') || query.includes('compte')) {
        response = "Vous pouvez accéder à votre profil via le bouton en haut à droite pour voir votre historique d'analyses.";
    } else if (query.includes('conseil') || query.includes('aide')) {
        response = "Optimisez votre CV en y intégrant les mots-clés manquants détectés lors de l'analyse.";
    } else {
        response = "C'est une excellente question ! Pour un maximum d'efficacité, je vous suggère de tester notre outil d'analyse de compatibilité.";
    }

    setTimeout(() => {
        if (chatMessages) {
            const bDiv = document.createElement('div');
            bDiv.className = 'message bot-message';
            bDiv.textContent = response;
            chatMessages.appendChild(bDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }, 800);
}

function botHelp(topic) {
    const chatMessages = document.getElementById('chat-messages');
    let userMsg = "";
    let botMsg = "";

    switch (topic) {
        case 'analyzer':
            userMsg = "Comment analyser mon CV ?";
            botMsg = "C'est simple ! Collez d'abord l'offre d'emploi dans le champ de texte, puis glissez votre CV (PDF) dans la zone de dépôt. Cliquez enfin sur 'Analyser' pour obtenir votre score de compatibilité.";
            break;
        case 'trends':
            userMsg = "Quelles sont les tendances ?";
            botMsg = "La section 'Tendances' affiche les mots-clés et secteurs les plus demandés actuellement. Cela vous aide à savoir quelles compétences mettre en avant dans votre CV.";
            break;
        case 'profile':
            userMsg = "Comment gérer mon profil ?";
            botMsg = "Connectez-vous pour accéder à votre tableau de bord. Vous pourrez y voir l'historique de vos analyses et suivre l'évolution de vos scores.";
            break;
        case 'tips':
            userMsg = "Des conseils pour mon CV ?";
            botMsg = "Privilégiez les verbes d'action, quantifiez vos résultats, et surtout, assurez-vous que les mots-clés importants de l'offre apparaissent naturellement dans votre document.";
            break;
    }

    if (chatMessages) {
        // Add user message
        const uDiv = document.createElement('div');
        uDiv.className = 'message user-message';
        uDiv.textContent = userMsg;
        chatMessages.appendChild(uDiv);

        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Simulate thinking and add bot message
        setTimeout(() => {
            const bDiv = document.createElement('div');
            bDiv.className = 'message bot-message';
            bDiv.textContent = botMsg;
            chatMessages.appendChild(bDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 600);
    }
}

// ============= PREMIUM CV GENERATION =============
async function generatePremiumCV() {
    const fileInput = document.getElementById('pdf_file');
    if (!fileInput || !fileInput.files[0]) {
        alert("⚠️ Veuillez d'abord téléverser votre CV.");
        return;
    }

    const btn = document.querySelector('.btn-premium-trigger');
    const originalText = btn.innerHTML;
    btn.innerHTML = "⏳ Génération...";
    btn.disabled = true;

    try {
        const formData = new FormData();
        formData.append('pdf_file', fileInput.files[0]);

        const response = await fetch('/api/generate-premium-cv', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            const html = await response.text();
            const win = window.open('', '_blank');
            win.document.write(html);
            win.document.close();
        } else {
            const error = await response.json();
            alert(`❌ Erreur: ${error.error}`);
        }
    } catch (e) {
        console.error(e);
        alert("❌ Une erreur est survenue lors de la génération.");
    } finally {
        if (btn) {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    }
}
