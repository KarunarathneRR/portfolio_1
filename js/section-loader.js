// ================================
// SECTION LOADER
// ================================

class SectionLoader {
    constructor() {
        this.sections = [
            { id: 'header-container', file: 'sections/header.html' },
            { id: 'hero-container', file: 'sections/hero.html' },
            { id: 'about-container', file: 'sections/about.html' },
            { id: 'credentials-container', file: 'sections/credentials.html' },
            { id: 'projects-container', file: 'sections/projects.html' },
            { id: 'contact-container', file: 'sections/contact.html' }
        ];
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
        
        // Initialize main functionality after all sections are loaded
        if (successCount === this.sections.length) {
            this.initializeApp();
        }
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
}

// Initialize section loader when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const loader = new SectionLoader();
    loader.loadAllSections();
});