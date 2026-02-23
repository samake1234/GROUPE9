/* ============================================
   MODERN DESIGN INTERACTIONS
   Interactions et animations JavaScript
   ============================================ */

// ========== SMOOTH SCROLL ==========
document.addEventListener('DOMContentLoaded', () => {
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Intersection Observer for stagger animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('blur-enter');
                }, index * 100);
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe all stagger items
    document.querySelectorAll('.stagger-item, .feature-card, .team-card').forEach(item => {
        observer.observe(item);
    });

    // Form input animations
    setupFormAnimations();

    // Counter animations
    setupCounterAnimations();

    // Hover effects
    setupHoverEffects();
});

// ========== FORM ANIMATIONS ==========
function setupFormAnimations() {
    const inputs = document.querySelectorAll('input, textarea, select');
    
    inputs.forEach(input => {
        // Focus animation
        input.addEventListener('focus', function() {
            this.parentElement?.classList.add('focused');
        });

        // Blur animation
        input.addEventListener('blur', function() {
            if (!this.value) {
                this.parentElement?.classList.remove('focused');
            }
        });

        // Trigger animation if input has value
        if (input.value) {
            input.parentElement?.classList.add('focused');
        }
    });
}

// ========== COUNTER ANIMATIONS ==========
function setupCounterAnimations() {
    const counters = document.querySelectorAll('.stat-value, .counter');
    
    const observerOptions = {
        threshold: 0.5
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
                animateCounter(entry.target);
                entry.target.classList.add('counted');
            }
        });
    }, observerOptions);

    counters.forEach(counter => observer.observe(counter));
}

function animateCounter(element) {
    const finalValue = parseInt(element.textContent) || 0;
    const duration = 2000;
    const steps = 60;
    let current = 0;
    const increment = finalValue / steps;
    const stepDuration = duration / steps;

    const timer = setInterval(() => {
        current += increment;
        if (current >= finalValue) {
            element.textContent = finalValue;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, stepDuration);
}

// ========== HOVER EFFECTS ==========
function setupHoverEffects() {
    const hoverElements = document.querySelectorAll('.hover-lift, .feature-card, .team-card, .chart-card');
    
    hoverElements.forEach(element => {
        element.addEventListener('mouseenter', function() {
            this.style.transition = 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
        });
    });
}

// ========== NOTIFICATION SYSTEM ==========
class Notification {
    static show(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type} notification-${type}`;
        
        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ⓘ'
        };

        notification.innerHTML = `
            <span class="notification-icon">${icons[type]}</span>
            <span>${message}</span>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease forwards';
            setTimeout(() => notification.remove(), 300);
        }, duration);
    }
}

// ========== MODAL HELPER ==========
class Modal {
    constructor(selector) {
        this.modal = document.querySelector(selector);
        this.setupListeners();
    }

    setupListeners() {
        const closeButtons = this.modal.querySelectorAll('[data-close-modal]');
        closeButtons.forEach(btn => {
            btn.addEventListener('click', () => this.close());
        });

        // Close on background click
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.close();
            }
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.classList.contains('active')) {
                this.close();
            }
        });
    }

    open() {
        this.modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    close() {
        this.modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    toggle() {
        this.modal.classList.contains('active') ? this.close() : this.open();
    }
}

// ========== THEME TOGGLE ==========
function setupThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;
    
    if (!themeToggle) return;

    // Check for saved theme preference or default to 'light'
    const savedTheme = localStorage.getItem('theme') || 'light';
    htmlElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    themeToggle.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        htmlElement.setAttribute('data-theme', newTheme);
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });

    // Apply saved theme
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
    }
}

function updateThemeIcon(theme) {
    const icon = document.querySelector('#theme-toggle .icon');
    if (icon) {
        icon.textContent = theme === 'light' ? '🌙' : '☀️';
    }
}

// ========== LAZY LOADING IMAGES ==========
function setupLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));
}

// ========== PAGE LOAD ANIMATION ==========
function pageLoadAnimation() {
    const loader = document.querySelector('.page-loader');
    if (loader) {
        window.addEventListener('load', () => {
            loader.classList.add('hidden');
        });
    }
}

// ========== SCROLL ANIMATIONS ==========
function setupScrollAnimations() {
    let scrollTimeout;

    window.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        document.body.classList.add('scrolling');

        scrollTimeout = setTimeout(() => {
            document.body.classList.remove('scrolling');
        }, 100);
    });

    // Parallax effect
    const parallaxElements = document.querySelectorAll('[data-parallax]');
    window.addEventListener('scroll', () => {
        parallaxElements.forEach(element => {
            const speed = element.dataset.parallax || 0.5;
            const yPos = window.scrollY * speed;
            element.style.transform = `translateY(${yPos}px)`;
        });
    });
}

// ========== FORM VALIDATION ==========
function validateForm(form) {
    let isValid = true;

    form.querySelectorAll('input, textarea, select').forEach(field => {
        if (!field.value.trim()) {
            field.classList.add('error');
            isValid = false;
        } else {
            field.classList.remove('error');
        }
    });

    return isValid;
}

// ========== COPY TO CLIPBOARD ==========
function copyToClipboard(text, message = 'Copié!') {
    navigator.clipboard.writeText(text).then(() => {
        Notification.show(message, 'success', 2000);
    }).catch(() => {
        Notification.show('Erreur lors de la copie', 'error', 2000);
    });
}

// ========== DEBOUNCE HELPER ==========
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ========== THROTTLE HELPER ==========
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// ========== INITIALIZE ==========
document.addEventListener('DOMContentLoaded', () => {
    setupThemeToggle();
    setupLazyLoading();
    pageLoadAnimation();
    setupScrollAnimations();
});

// Expose to global scope
window.Notification = Notification;
window.Modal = Modal;
window.copyToClipboard = copyToClipboard;
window.debounce = debounce;
window.throttle = throttle;
window.validateForm = validateForm;
