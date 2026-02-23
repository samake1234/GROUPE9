// Dashboard JavaScript for JobMatch AI
class DashboardManager {
    constructor() {
        this.initCharts();
        this.loadRecentOffers();
        this.setupEventListeners();
        this.startRealTimeUpdates();
    }

    initCharts() {
        // Scores Evolution Chart
        const scoresCtx = document.getElementById('scores-chart');
        if (scoresCtx) {
            new Chart(scoresCtx, {
                type: 'line',
                data: {
                    labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
                    datasets: [{
                        label: 'Score de Match',
                        data: [75, 82, 78, 85, 88, 92],
                        borderColor: '#FF6B35',
                        backgroundColor: 'rgba(255, 107, 53, 0.1)',
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            padding: 12,
                            cornerRadius: 8,
                            titleFont: { size: 14, weight: 'bold' },
                            bodyFont: { size: 12 }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100,
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            },
                            ticks: {
                                color: 'rgba(255, 255, 255, 0.8)',
                                callback: function(value) {
                                    return value + '%';
                                }
                            }
                        },
                        x: {
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            },
                            ticks: {
                                color: 'rgba(255, 255, 255, 0.8)'
                            }
                        }
                    }
                }
            });
        }

        // Distribution Chart
        const distCtx = document.getElementById('distribution-chart');
        if (distCtx) {
            new Chart(distCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Excellent (90-100%)', 'Bon (70-89%)', 'Moyen (50-69%)', 'Faible (<50%)'],
                    datasets: [{
                        data: [35, 45, 15, 5],
                        backgroundColor: [
                            '#004E89',
                            '#FF6B35',
                            '#FFD23F',
                            '#FF6B6B'
                        ],
                        borderWidth: 0,
                        hoverOffset: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                color: 'rgba(255, 255, 255, 0.8)',
                                padding: 15,
                                font: {
                                    size: 12
                                }
                            }
                        },
                        tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            padding: 12,
                            cornerRadius: 8
                        }
                    }
                }
            });
        }
    }

    async loadRecentOffers() {
        try {
            const response = await fetch('/api/recent-offers');
            if (response.ok) {
                const offers = await response.json();
                this.displayRecentOffers(offers);
            } else {
                this.displayMockOffers();
            }
        } catch (error) {
            console.log('Chargement des offres simulé...');
            this.displayMockOffers();
        }
    }

    displayRecentOffers(offers) {
        const container = document.getElementById('recent-offers');
        if (!container) return;

        container.innerHTML = offers.slice(0, 3).map(offer => `
            <div class="offer-card" onclick="viewOffer('${offer.id}')">
                <div class="offer-header">
                    <h4>${offer.title}</h4>
                    <span class="company">${offer.company}</span>
                </div>
                <div class="offer-details">
                    <span class="location"><i class="fas fa-map-marker-alt"></i> ${offer.location}</span>
                    <span class="salary"><i class="fas fa-euro-sign"></i> ${offer.salary_min}k€ - ${offer.salary_max}k€</span>
                </div>
                <div class="offer-skills">
                    ${offer.required_skills.slice(0, 3).map(skill => 
                        `<span class="skill-tag">${skill}</span>`
                    ).join('')}
                </div>
                <div class="offer-footer">
                    <span class="date">${offer.posted_date}</span>
                    <button class="btn-offer" onclick="saveOffer('${offer.id}', event)">
                        <i class="fas fa-bookmark"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    displayMockOffers() {
        const mockOffers = [
            {
                id: 'mock_1',
                title: 'Développeur Python Senior',
                company: 'TechCorp',
                location: 'Paris',
                salary_min: 65,
                salary_max: 85,
                required_skills: ['Python', 'Django', 'PostgreSQL'],
                posted_date: '15/01/2024'
            },
            {
                id: 'mock_2',
                title: 'Data Scientist',
                company: 'DataSoft',
                location: 'Lyon',
                salary_min: 55,
                salary_max: 75,
                required_skills: ['Python', 'Machine Learning', 'TensorFlow'],
                posted_date: '10/01/2024'
            },
            {
                id: 'mock_3',
                title: 'Designer UX/UI',
                company: 'CreativeHub',
                location: 'Remote',
                salary_min: 45,
                salary_max: 60,
                required_skills: ['Figma', 'Adobe XD', 'Prototyping'],
                posted_date: '05/01/2024'
            }
        ];
        this.displayRecentOffers(mockOffers);
    }

    setupEventListeners() {
        // Sidebar toggle
        const sidebarToggle = document.querySelector('.sidebar-toggle');
        const sidebar = document.getElementById('sidebar');
        
        if (sidebarToggle && sidebar) {
            sidebarToggle.addEventListener('click', () => {
                sidebar.classList.toggle('collapsed');
                this.saveSidebarState(sidebar.classList.contains('collapsed'));
            });
        }

        // Quick upload
        const uploadArea = document.getElementById('quick-upload');
        const fileInput = document.getElementById('cv-file');
        
        if (uploadArea && fileInput) {
            uploadArea.addEventListener('click', () => fileInput.click());
            
            uploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadArea.classList.add('drag-over');
            });
            
            uploadArea.addEventListener('dragleave', () => {
                uploadArea.classList.remove('drag-over');
            });
            
            uploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadArea.classList.remove('drag-over');
                if (e.dataTransfer.files.length > 0) {
                    fileInput.files = e.dataTransfer.files;
                    this.handleFileSelect(e.dataTransfer.files[0]);
                }
            });
            
            fileInput.addEventListener('change', (e) => {
                if (e.target.files.length > 0) {
                    this.handleFileSelect(e.target.files[0]);
                }
            });
        }

        // Stat cards click handlers
        document.querySelectorAll('.stat-card').forEach(card => {
            card.addEventListener('click', () => {
                this.animateCard(card);
            });
        });

        // Action cards
        document.querySelectorAll('.action-card').forEach(card => {
            card.addEventListener('click', () => {
                this.animateCard(card);
            });
        });
    }

    handleFileSelect(file) {
        const fileName = file.name;
        const fileSize = (file.size / 1024 / 1024).toFixed(2);
        
        // Update upload area
        const uploadArea = document.getElementById('quick-upload');
        if (uploadArea) {
            uploadArea.innerHTML = `
                <i class="fas fa-check-circle" style="color: #10b981; font-size: 3rem;"></i>
                <h4 style="color: #10b981;">Fichier sélectionné</h4>
                <p>${fileName} (${fileSize} MB)</p>
            `;
        }
        
        // Store file reference
        this.selectedFile = file;
    }

    animateCard(card) {
        card.style.transform = 'scale(0.95)';
        setTimeout(() => {
            card.style.transform = '';
        }, 150);
    }

    startRealTimeUpdates() {
        // Update stats every 30 seconds
        setInterval(() => {
            this.updateStats();
        }, 30000);

        // Update activity every 60 seconds
        setInterval(() => {
            this.updateActivity();
        }, 60000);
    }

    async updateStats() {
        try {
            const response = await fetch('/api/dashboard-stats');
            if (response.ok) {
                const stats = await response.json();
                this.updateStatCards(stats);
            }
        } catch (error) {
            console.log('Stats update failed');
        }
    }

    updateStatCards(stats) {
        // Update stat cards with animation
        const cards = {
            'total-analyses': stats.analyses_count,
            'avg-score': Math.round(stats.avg_score),
            'job-offers': stats.job_offers_count,
            'profile-complete': stats.profile_complete
        };

        Object.entries(cards).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                const oldValue = parseInt(element.textContent);
                if (oldValue !== value) {
                    this.animateValue(element, oldValue, value);
                }
            }
        });
    }

    animateValue(element, start, end) {
        const duration = 1000;
        const startTime = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const currentValue = Math.floor(start + (end - start) * progress);
            element.textContent = currentValue;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }

    async updateActivity() {
        try {
            const response = await fetch('/api/user-activity');
            if (response.ok) {
                const activities = await response.json();
                this.updateActivityList(activities);
            }
        } catch (error) {
            console.log('Activity update failed');
        }
    }

    updateActivityList(activities) {
        const activityList = document.getElementById('activity-list');
        if (!activityList) return;

        activityList.innerHTML = activities.slice(0, 5).map(activity => `
            <div class="activity-item">
                <span class="activity-icon">📊</span>
                <div class="activity-content">
                    <p>${activity.description}</p>
                    <span>${this.formatDate(activity.date)}</span>
                </div>
            </div>
        `).join('');
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'À l\'instant';
        if (diffMins < 60) return `Il y a ${diffMins} minute${diffMins > 1 ? 's' : ''}`;
        if (diffHours < 24) return `Il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
        return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    }

    saveSidebarState(collapsed) {
        localStorage.setItem('sidebar-collapsed', collapsed);
    }

    loadSidebarState() {
        const collapsed = localStorage.getItem('sidebar-collapsed') === 'true';
        const sidebar = document.getElementById('sidebar');
        if (sidebar && collapsed) {
            sidebar.classList.add('collapsed');
        }
    }
}

// Global functions for navigation
function showAnalyses() {
    location.href = '/cv-improver';
}

function showMatches() {
    location.href = '/cv-improver#results';
}

function showJobOffers() {
    location.href = '/job-generator';
}

function showStatistics() {
    showNotification('Statistiques détaillées en cours de développement...');
}

function showFavorites() {
    showNotification('Favoris en cours de développement...');
}

function showProfile() {
    location.href = '/profile';
}

function quickAnalysis() {
    document.getElementById('quick-analysis-modal').style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function startQuickAnalysis() {
    const fileInput = document.getElementById('cv-file');
    const jobType = document.getElementById('job-type').value;
    
    if (!fileInput.files.length) {
        showNotification('Veuillez sélectionner un fichier CV', 'error');
        return;
    }
    
    // Show loading state
    const modal = document.getElementById('quick-analysis-modal');
    const modalBody = modal.querySelector('.modal-body');
    modalBody.innerHTML = `
        <div class="loading-state">
            <i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: #FF6B35;"></i>
            <h3>Analyse en cours...</h3>
            <p>Traitement de votre CV avec notre IA</p>
        </div>
    `;
    
    // Simulate analysis and redirect
    setTimeout(() => {
        closeModal('quick-analysis-modal');
        location.href = `/cv-improver?job_type=${jobType}&quick=true`;
    }, 2000);
}

function refreshDashboard() {
    // Show loading state
    const content = document.getElementById('dashboard-content');
    content.style.opacity = '0.5';
    
    setTimeout(() => {
        location.reload();
    }, 500);
}

function showRecentAnalyses() {
    location.href = '/cv-improver#history';
}

function showRecommendations() {
    showNotification('Recommandations personnalisées en cours de développement...');
}

function logout() {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter?')) {
        location.href = '/logout';
    }
}

function viewOffer(offerId) {
    showNotification(`Affichage de l'offre ${offerId}`);
}

function saveOffer(offerId, event) {
    event.stopPropagation();
    const button = event.currentTarget;
    const icon = button.querySelector('i');
    
    if (icon.classList.contains('fa-bookmark')) {
        icon.classList.remove('fa-bookmark');
        icon.classList.add('fa-bookmark-o');
        showNotification('Offre retirée des favoris');
    } else {
        icon.classList.remove('fa-bookmark-o');
        icon.classList.add('fa-bookmark');
        showNotification('Offre ajoutée aux favoris');
    }
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Initialize dashboard when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.dashboardManager = new DashboardManager();
    window.dashboardManager.loadSidebarState();
});

// Close modals when clicking outside
window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.style.display = 'none';
    }
});

// Add notification styles
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        z-index: 1001;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        animation: slideIn 0.3s ease;
        font-weight: 500;
    }
    
    .notification.error {
        background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    }
    
    .notification i {
        font-size: 1.25rem;
    }
    
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .loading-state {
        text-align: center;
        padding: 2rem;
        color: #666;
    }
    
    .loading-state i {
        margin-bottom: 1rem;
    }
    
    .btn-offer {
        background: none;
        border: 1px solid rgba(255, 107, 53, 0.3);
        color: #FF6B35;
        padding: 0.5rem;
        border-radius: 0.25rem;
        cursor: pointer;
        transition: all 0.2s;
    }
    
    .btn-offer:hover {
        background: rgba(255, 107, 53, 0.1);
        border-color: #FF6B35;
    }
    
    .offer-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 1rem;
        padding-top: 1rem;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .offer-footer .date {
        font-size: 0.75rem;
        color: rgba(255, 255, 255, 0.6);
    }
`;
document.head.appendChild(notificationStyles);
