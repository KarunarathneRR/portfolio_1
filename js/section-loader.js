// ================================
// SECTION LOADER
// ================================

class SectionLoader {
    constructor() {
        this.sections = [
            { id: 'header-container', file: 'sections/header.html' },
            { id: 'hero-container', file: 'sections/hero.html' },
            { id: 'about-container', file: 'sections/about.html' },
            { id: 'skills-container', file: 'sections/skills.html' },
            { id: 'projects-container', file: 'sections/projects.html' },
            { id: 'certifications-container', file: 'sections/certifications.html' },
            { id: 'goals-container', file: 'sections/goals.html' },
            { id: 'contact-container', file: 'sections/contact.html' },
            { id: 'footer-container', file: 'sections/footer.html' }
        ];

        this.bindProjectsToggle();
    }

    async loadSection(section) {
        try {
            const response = await fetch(section.file);
            if (!response.ok) {
                throw new Error(`Failed to load ${section.file}: ${response.status}`);
            }
            const html = await response.text();
            const container = document.getElementById(section.id);
            if (container) {
                container.innerHTML = html;
                return true;
            } else {
                console.warn(`Container with id '${section.id}' not found`);
                return false;
            }
        } catch (error) {
            console.error(`Error loading section ${section.file}:`, error);
            return false;
        }
    }

    async loadAllSections() {
        const loadPromises = this.sections.map(section => this.loadSection(section));
        const results = await Promise.all(loadPromises);
        
        const successCount = results.filter(result => result).length;
        console.log(`Loaded ${successCount} out of ${this.sections.length} sections`);
        
        // Initialize main functionality after section loading completes,
        // even if one section failed, so the rest of the page still works.
        this.initializeApp();
    }

    initializeApp() {
        // Re-initialize intersection observers for sections
        const observerOptions = {
            threshold: 0.2,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate');
                }
            });
        }, observerOptions);

        // Observe all sections except hero
        document.querySelectorAll('section:not(.hero)').forEach(section => {
            observer.observe(section);
        });

        // Re-initialize mobile menu functionality
        this.initializeMobileMenu();
        
        // Re-initialize smooth scrolling
        this.initializeSmoothScrolling();

        // Keep floating actions clear of the footer area
        this.initializeFloatingCvButton();

        console.log('App initialized successfully');
    }

    initializeMobileMenu() {
        const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
        const mobileNav = document.querySelector('.mobile-nav');
        const mobileNavLinks = document.querySelectorAll('.mobile-nav a');

        if (mobileMenuToggle && mobileNav) {
            mobileMenuToggle.addEventListener('click', () => {
                mobileMenuToggle.classList.toggle('active');
                mobileNav.classList.toggle('active');
            });

            // Close mobile menu when clicking on a link
            mobileNavLinks.forEach(link => {
                link.addEventListener('click', () => {
                    mobileMenuToggle.classList.remove('active');
                    mobileNav.classList.remove('active');
                });
            });

            // Close mobile menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!mobileNav.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
                    mobileMenuToggle.classList.remove('active');
                    mobileNav.classList.remove('active');
                }
            });
        }
    }

    initializeSmoothScrolling() {
        // Smooth scrolling for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                const targetSection = document.querySelector(targetId);
                
                if (targetSection) {
                    targetSection.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    bindProjectsToggle() {
        if (window.toggleOtherProjects) {
            return;
        }

        const setupOtherProjectsRows = (otherProjects) => {
            if (!otherProjects || otherProjects.dataset.rowsReady === 'true') {
                return;
            }

            const cards = Array.from(otherProjects.querySelectorAll('.other-project-card'));
            if (!cards.length) {
                return;
            }

            const topRowCards = cards.filter((_, index) => index % 2 === 0);
            const bottomRowCards = cards.filter((_, index) => index % 2 !== 0);

            const buildRow = (rowCards, directionClass) => {
                const row = document.createElement('div');
                row.className = 'other-projects-row';

                const track = document.createElement('div');
                track.className = `other-projects-track ${directionClass}`;

                rowCards.concat(rowCards).forEach((card) => {
                    track.appendChild(card.cloneNode(true));
                });

                row.appendChild(track);
                return row;
            };

            otherProjects.innerHTML = '';
            otherProjects.appendChild(buildRow(topRowCards, 'slide-left'));
            otherProjects.appendChild(buildRow(bottomRowCards, 'slide-right'));
            otherProjects.dataset.rowsReady = 'true';
        };

        window.toggleOtherProjects = () => {
            const seeMoreBtn = document.getElementById('see-more-btn');
            const otherProjects = document.getElementById('other-projects');

            if (!seeMoreBtn || !otherProjects) {
                return;
            }

            const isHidden = otherProjects.style.display === 'none' || otherProjects.style.display === '';

            if (isHidden) {
                setupOtherProjectsRows(otherProjects);
                otherProjects.style.display = 'grid';
                otherProjects.style.opacity = '1';
                otherProjects.style.transform = 'translateY(0)';
                seeMoreBtn.innerHTML = 'Show Less <i class="fas fa-chevron-up"></i>';

                setTimeout(() => {
                    otherProjects.classList.add('animate');
                }, 50);
            } else {
                otherProjects.style.display = 'none';
                otherProjects.style.opacity = '0';
                otherProjects.style.transform = 'translateY(20px)';
                seeMoreBtn.innerHTML = 'See All Projects <i class="fas fa-chevron-down"></i>';
                otherProjects.classList.remove('animate');
            }
        };
    }

    initializeFloatingCvButton() {
        const floatingCvBtn = document.querySelector('.floating-cv-wrap');
        const footer = document.querySelector('.footer');

        if (!floatingCvBtn || !footer || floatingCvBtn.dataset.footerAware === 'true') {
            return;
        }

        const updateFloatingCvPosition = () => {
            const footerRect = footer.getBoundingClientRect();
            const baseOffset = window.innerWidth <= 768 ? 16 : 24;
            const overlap = window.innerHeight - footerRect.top + baseOffset;

            if (overlap > 0) {
                floatingCvBtn.style.setProperty('--footer-offset', `${overlap}px`);
            } else {
                floatingCvBtn.style.setProperty('--footer-offset', '0px');
            }
        };

        window.addEventListener('scroll', updateFloatingCvPosition, { passive: true });
        window.addEventListener('resize', updateFloatingCvPosition);
        updateFloatingCvPosition();

        floatingCvBtn.dataset.footerAware = 'true';
    }
}

// Initialize section loader when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const loader = new SectionLoader();
    loader.loadAllSections();
});
