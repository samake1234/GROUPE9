// ============= JOB GENERATOR JAVASCRIPT =============

class JobGenerator {
    constructor() {
        this.form = document.getElementById('generatorForm');
        this.generateBtn = document.getElementById('generateBtn');
        this.resultsContent = document.getElementById('resultsContent');
        this.emptyState = document.getElementById('emptyState');
        this.loadingState = document.getElementById('loadingState');
        this.generatedContent = document.getElementById('generatedContent');
        this.offerPreview = document.getElementById('offerPreview');
        this.skills = [];
        this.isGenerating = false;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupFormValidation();
        this.setupCharacterCounter();
        this.setupSkillsInput();
        this.setupAnimations();
        console.log('Job Generator initialized');
    }

    setupEventListeners() {
        // Form submission
        if (this.form) {
            this.form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.generateOffer();
            });
        }

        // Input suggestions
        const suggestionElements = document.querySelectorAll('.suggestion');
        suggestionElements.forEach(suggestion => {
            suggestion.addEventListener('click', () => {
                const jobTitleInput = document.getElementById('jobTitle');
                if (jobTitleInput) {
                    jobTitleInput.value = suggestion.textContent;
                    this.validateField(jobTitleInput);
                }
            });
        });

        // Copy and download buttons
        const copyBtn = document.getElementById('copyBtn');
        const downloadBtn = document.getElementById('downloadBtn');
        
        if (copyBtn) {
            copyBtn.addEventListener('click', () => this.copyOffer());
        }
        
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => this.downloadOffer());
        }

        // Theme toggle
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }
    }

    setupFormValidation() {
        const inputs = this.form.querySelectorAll('input[required], textarea[required]');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.validateField(input));
        });
    }

    validateField(field) {
        const value = field.value.trim();
        const isValid = value.length > 0;
        
        if (isValid) {
            field.classList.remove('error');
            field.classList.add('valid');
        } else {
            field.classList.remove('valid');
            field.classList.add('error');
        }
        
        return isValid;
    }

    setupCharacterCounter() {
        const jobDescription = document.getElementById('jobDescription');
        const charCount = document.getElementById('charCount');
        
        if (jobDescription && charCount) {
            jobDescription.addEventListener('input', () => {
                const count = jobDescription.value.length;
                charCount.textContent = count;
                
                if (count > 500) {
                    charCount.style.color = 'var(--danger-color)';
                } else if (count > 400) {
                    charCount.style.color = 'var(--warning-color)';
                } else {
                    charCount.style.color = 'var(--text-muted)';
                }
            });
        }
    }

    setupSkillsInput() {
        const skillsInput = document.getElementById('skills');
        const addSkillBtn = document.querySelector('.btn-add-skill');
        
        if (skillsInput && addSkillBtn) {
            skillsInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.addSkill();
                }
            });
            
            addSkillBtn.addEventListener('click', () => this.addSkill());
        }
    }

    addSkill() {
        const skillsInput = document.getElementById('skills');
        const skill = skillsInput.value.trim();
        
        if (skill && !this.skills.includes(skill)) {
            this.skills.push(skill);
            this.renderSkills();
            skillsInput.value = '';
            skillsInput.focus();
        }
    }

    removeSkill(skill) {
        this.skills = this.skills.filter(s => s !== skill);
        this.renderSkills();
    }

    renderSkills() {
        const skillsTags = document.getElementById('skillsTags');
        if (!skillsTags) return;
        
        skillsTags.innerHTML = this.skills.map(skill => `
            <div class="skill-tag">
                ${skill}
                <span class="remove-skill" onclick="jobGenerator.removeSkill('${skill}')">×</span>
            </div>
        `).join('');
    }

    async generateOffer() {
        if (this.isGenerating) return;
        
        // Validate form
        const requiredFields = this.form.querySelectorAll('input[required], textarea[required]');
        let isValid = true;
        
        requiredFields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });
        
        if (!isValid) {
            this.showNotification('Veuillez remplir tous les champs obligatoires', 'error');
            return;
        }
        
        this.isGenerating = true;
        this.showLoadingState();
        
        try {
            // Simulate API call
            await this.simulateGeneration();
            
            // Generate the offer
            const offerData = this.collectFormData();
            const generatedOffer = await this.generateOfferContent(offerData);
            
            this.showGeneratedContent(generatedOffer);
            this.showNotification('Offre générée avec succès!', 'success');
            
        } catch (error) {
            console.error('Error generating offer:', error);
            this.showNotification('Erreur lors de la génération', 'error');
            this.showEmptyState();
        } finally {
            this.isGenerating = false;
            this.generateBtn.classList.remove('loading');
        }
    }

    collectFormData() {
        const formData = new FormData(this.form);
        const data = {};
        
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        data.skills = this.skills;
        return data;
    }

    async simulateGeneration() {
        // Show loading animation
        this.generateBtn.classList.add('loading');
        
        // Simulate progress
        const progressFill = document.querySelector('.progress-fill');
        const progressText = document.querySelector('.progress-text');
        
        if (progressFill && progressText) {
            let progress = 0;
            const interval = setInterval(() => {
                progress += Math.random() * 15;
                if (progress > 90) {
                    progress = 90;
                    clearInterval(interval);
                }
                progressFill.style.width = `${progress}%`;
                progressText.textContent = `${Math.round(progress)}%`;
            }, 200);
            
            // Wait for minimum time
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Complete progress
            progressFill.style.width = '100%';
            progressText.textContent = '100%';
        }
    }

    async generateOfferContent(data) {
        // Simulate AI generation with realistic content
        const templates = {
            professional: {
                intro: `Nous recherchons un(e) ${data.jobTitle} talentueux(se) pour rejoindre notre équipe dynamique.`,
                description: `Au sein de notre département ${data.department || 'dynamique'}, vous serez responsable(e) de ${data.jobDescription}.`,
                requirements: `Le candidat idéal devra justifier d'une expérience de ${data.experience || '3-5 ans'} et posséder un niveau ${data.education || 'Master'}.`,
                skills: `Compétences requises : ${data.skills.join(', ') || 'excellentes compétences techniques'}.`,
                benefits: `Nous offrons un environnement de travail stimulant, des opportunités de développement professionnel et une rémunération compétitive.`
            },
            casual: {
                intro: `Rejoignez notre équipe en tant que ${data.jobTitle} !`,
                description: `Vous aimez ${data.jobDescription} ? Parfait ! C'est exactement ce que nous recherchons.`,
                requirements: `Si vous avez ${data.experience || 'quelques années'} d'expérience et êtes passionné(e) par ce domaine, vous êtes notre candidat idéal !`,
                skills: `Vos compétences : ${data.skills.join(', ') || 'votre talent naturel'}.`,
                benefits: `Flexibilité, ambiance super sympa, projets innovants et bien sûr, un café gratuit !`
            },
            enthusiastic: {
                intro: `🚀 Rejoignez l'aventure en tant que ${data.jobTitle} !`,
                description: `Vous êtes passionné(e) par ${data.jobDescription} ? Génial ! Nous avons besoin de votre énergie !`,
                requirements: `Avec votre expérience de ${data.experience || 'plusieurs années'} et votre formation ${data.education || 'solide'}, vous allez nous impressionner !`,
                skills: `Vos super compétences : ${data.skills.join(', ') || 'votre talent exceptionnel'} !`,
                benefits: `Atmosphère incroyable, défis stimulants, croissance rapide et beaucoup de fun ! 🎉`
            }
        };
        
        const tone = data.tone || 'professional';
        const template = templates[tone] || templates.professional;
        
        const salary = data.salaryMin && data.salaryMax 
            ? `${data.salaryMin}€ - ${data.salaryMax}€`
            : data.salaryMin 
            ? `À partir de ${data.salaryMin}€`
            : 'Salaire compétitif';
        
        return {
            title: data.jobTitle,
            department: data.department,
            location: data.location || 'Flexible',
            type: data.jobType || 'Temps plein',
            salary: salary,
            content: `
                <div class="offer-header">
                    <h2 class="offer-title">${data.jobTitle}</h2>
                    <div class="offer-meta">
                        <span class="offer-department">${data.department || 'Non spécifié'}</span>
                        <span class="offer-location">📍 ${data.location || 'Flexible'}</span>
                        <span class="offer-type">${data.jobType || 'Temps plein'}</span>
                    </div>
                </div>
                
                <div class="offer-section">
                    <h3>À propos du poste</h3>
                    <p>${template.intro}</p>
                    <p>${template.description}</p>
                </div>
                
                <div class="offer-section">
                    <h3>Profil recherché</h3>
                    <p>${template.requirements}</p>
                    <p>${template.skills}</p>
                </div>
                
                <div class="offer-section">
                    <h3>Ce que nous offrons</h3>
                    <p>${template.benefits}</p>
                    <div class="offer-salary">
                        <strong>Rémunération :</strong> ${salary}
                    </div>
                </div>
                
                <div class="offer-footer">
                    <div class="generated-info">
                        <span class="ai-badge">🤖 Générée par IA</span>
                        <span class="generation-time">Généré le ${new Date().toLocaleDateString('fr-FR')}</span>
                    </div>
                </div>
            `
        };
    }

    showLoadingState() {
        this.emptyState.style.display = 'none';
        this.generatedContent.style.display = 'none';
        this.loadingState.style.display = 'block';
        
        // Reset progress
        const progressFill = document.querySelector('.progress-fill');
        const progressText = document.querySelector('.progress-text');
        if (progressFill && progressText) {
            progressFill.style.width = '0%';
            progressText.textContent = '0%';
        }
    }

    showGeneratedContent(offer) {
        this.emptyState.style.display = 'none';
        this.loadingState.style.display = 'none';
        this.generatedContent.style.display = 'block';
        
        this.offerPreview.innerHTML = offer.content;
        
        // Show action buttons
        document.getElementById('copyBtn').style.display = 'inline-flex';
        document.getElementById('downloadBtn').style.display = 'inline-flex';
    }

    showEmptyState() {
        this.emptyState.style.display = 'block';
        this.loadingState.style.display = 'none';
        this.generatedContent.style.display = 'none';
        
        // Hide action buttons
        document.getElementById('copyBtn').style.display = 'none';
        document.getElementById('downloadBtn').style.display = 'none';
    }

    copyOffer() {
        const offerText = this.offerPreview.innerText;
        
        navigator.clipboard.writeText(offerText).then(() => {
            this.showNotification('Offre copiée dans le presse-papiers!', 'success');
        }).catch(() => {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = offerText;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.showNotification('Offre copiée dans le presse-papiers!', 'success');
        });
    }

    downloadOffer() {
        const offerContent = this.offerPreview.innerHTML;
        const blob = new Blob([offerContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `offre-${Date.now()}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('Offre téléchargée!', 'success');
    }

    resetForm() {
        this.form.reset();
        this.skills = [];
        this.renderSkills();
        
        // Remove validation classes
        const inputs = this.form.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.classList.remove('valid', 'error');
        });
        
        // Reset character counter
        const charCount = document.getElementById('charCount');
        if (charCount) {
            charCount.textContent = '0';
            charCount.style.color = 'var(--text-muted)';
        }
        
        this.showEmptyState();
        this.showNotification('Formulaire réinitialisé', 'info');
    }

    toggleSection(sectionId) {
        const section = document.getElementById(sectionId);
        const parentSection = section.closest('.collapsible');
        
        if (parentSection) {
            parentSection.classList.toggle('collapsed');
        }
    }

    toggleTheme() {
        document.body.classList.toggle('dark-mode');
        const isDarkMode = document.body.classList.contains('dark-mode');
        
        // Update theme toggle icon
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            const icon = themeToggle.querySelector('i');
            if (icon) {
                icon.className = isDarkMode ? 'fas fa-sun' : 'fas fa-moon';
            }
        }
        
        // Save preference
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
        
        this.showNotification(`Thème ${isDarkMode ? 'sombre' : 'clair'} activé`, 'info');
    }

    setupAnimations() {
        // Intersection Observer for scroll animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);
        
        // Observe form sections and feature cards
        const animatedElements = document.querySelectorAll('.form-section, .feature-card');
        animatedElements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(el);
        });
    }

    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(n => n.remove());
        
        // Create notification
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">
                    ${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}
                </span>
                <span class="notification-message">${message}</span>
            </div>
            <button class="notification-close">×</button>
        `;
        
        // Add styles
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6',
            color: 'white',
            padding: '16px 20px',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
            zIndex: '9999',
            minWidth: '300px',
            maxWidth: '400px',
            animation: 'slideInRight 0.3s ease-out',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
        });
        
        // Add to DOM
        document.body.appendChild(notification);
        
        // Auto remove
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 4000);
        
        // Close button
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            notification.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        });
    }
}

// Global functions for inline event handlers
function toggleSection(sectionId) {
    if (window.jobGenerator) {
        window.jobGenerator.toggleSection(sectionId);
    }
}

function addSkill() {
    if (window.jobGenerator) {
        window.jobGenerator.addSkill();
    }
}

function resetForm() {
    if (window.jobGenerator) {
        window.jobGenerator.resetForm();
    }
}

function copyOffer() {
    if (window.jobGenerator) {
        window.jobGenerator.copyOffer();
    }
}

function downloadOffer() {
    if (window.jobGenerator) {
        window.jobGenerator.downloadOffer();
    }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 12px;
    }
    
    .notification-icon {
        font-size: 20px;
    }
    
    .notification-message {
        flex: 1;
        font-weight: 500;
    }
    
    .notification-close {
        background: none;
        border: none;
        color: white;
        font-size: 24px;
        cursor: pointer;
        padding: 0;
        margin-left: 12px;
        opacity: 0.8;
        transition: opacity 0.2s;
    }
    
    .notification-close:hover {
        opacity: 1;
    }
    
    .form-group input.valid,
    .form-group select.valid,
    .form-group textarea.valid {
        border-color: var(--success-color);
    }
    
    .form-group input.error,
    .form-group select.error,
    .form-group textarea.error {
        border-color: var(--danger-color);
    }
    
    .offer-header {
        border-bottom: 2px solid var(--border-color);
        padding-bottom: 1.5rem;
        margin-bottom: 2rem;
    }
    
    .offer-title {
        font-size: 2rem;
        font-weight: 700;
        color: var(--text-primary);
        margin-bottom: 1rem;
    }
    
    .offer-meta {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
    }
    
    .offer-meta span {
        background: var(--light-bg);
        padding: 0.5rem 1rem;
        border-radius: 20px;
        font-size: 0.875rem;
        color: var(--text-secondary);
    }
    
    .offer-section {
        margin-bottom: 2rem;
    }
    
    .offer-section h3 {
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: 1rem;
    }
    
    .offer-section p {
        color: var(--text-secondary);
        line-height: 1.6;
        margin-bottom: 1rem;
    }
    
    .offer-salary {
        background: var(--primary-color);
        color: white;
        padding: 1rem;
        border-radius: 12px;
        font-weight: 600;
        margin-top: 1rem;
    }
    
    .offer-footer {
        border-top: 1px solid var(--border-color);
        padding-top: 1.5rem;
        margin-top: 2rem;
    }
    
    .generated-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 1rem;
    }
    
    .ai-badge {
        background: var(--primary-color);
        color: white;
        padding: 0.5rem 1rem;
        border-radius: 20px;
        font-size: 0.875rem;
        font-weight: 600;
    }
    
    .generation-time {
        color: var(--text-muted);
        font-size: 0.875rem;
    }
`;
document.head.appendChild(style);

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Load saved theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            const icon = themeToggle.querySelector('i');
            if (icon) {
                icon.className = 'fas fa-sun';
            }
        }
    }
    
    // Initialize job generator
    window.jobGenerator = new JobGenerator();
});

// Export for global access
window.JobGenerator = JobGenerator;
