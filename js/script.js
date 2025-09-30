// ================================
// MAIN JAVASCRIPT FUNCTIONALITY
// ================================

// Device detection and responsive utilities
const DeviceDetector = {
    isMobile: () => window.innerWidth <= 768,
    isTablet: () => window.innerWidth > 768 && window.innerWidth <= 1024,
    isDesktop: () => window.innerWidth > 1024,
    isTouch: () => 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    isRetina: () => window.devicePixelRatio > 1,
    
    getBreakpoint: () => {
        const width = window.innerWidth;
        if (width <= 360) return 'xs';
        if (width <= 480) return 'sm';
        if (width <= 768) return 'md';
        if (width <= 1024) return 'lg';
        return 'xl';
    }
};

// Performance monitoring for mobile
const PerformanceManager = {
    reducedMotion: false,
    
    init() {
        // Check for reduced motion preference
        this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        // Auto-detect performance issues on mobile
        if (DeviceDetector.isMobile()) {
            this.optimizeForMobile();
        }
    },
    
    optimizeForMobile() {
        // Reduce animation complexity on mobile
        document.body.classList.add('mobile-optimized');
        
        // Throttle scroll events more aggressively on mobile
        this.throttleScrollEvents();
    },
    
    throttleScrollEvents() {
        let ticking = false;
        const throttledScroll = () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    this.handleScroll();
                    ticking = false;
                });
                ticking = true;
            }
        };
        
        window.addEventListener('scroll', throttledScroll, { passive: true });
    },
    
    handleScroll() {
        // Update scroll progress
        this.updateScrollProgress();
        
        // Update parallax (reduced on mobile)
        if (!this.reducedMotion) {
            this.updateParallax();
        }
    },
    
    updateScrollProgress() {
        const scrolled = (window.pageYOffset / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
        document.querySelector('.scroll-progress').style.width = scrolled + '%';
    },
    
    updateParallax() {
        const scrolled = window.pageYOffset;
        const parallax = document.querySelector('.geometric-shape');
        if (parallax) {
            const isMobile = DeviceDetector.isMobile();
            const speed = isMobile ? scrolled * 0.05 : scrolled * 0.3;
            const rotation = isMobile ? scrolled * 0.02 : scrolled * 0.1;
            parallax.style.transform = `translateY(${speed}px) rotate(${rotation}deg)`;
        }
    }
};

// Initialize performance manager
PerformanceManager.init();

// Responsive Intersection Observer for section animations
const ResponsiveObserver = {
    init() {
        const observerOptions = {
            threshold: DeviceDetector.isMobile() ? 0.1 : 0.2,
            rootMargin: DeviceDetector.isMobile() ? '0px 0px -30px 0px' : '0px 0px -50px 0px'
        };

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate');
                    
                    // Add specific mobile classes for enhanced animations
                    if (DeviceDetector.isMobile()) {
                        entry.target.classList.add('mobile-animated');
                    }
                }
            });
        }, observerOptions);

        // Observe all sections except hero
        document.querySelectorAll('section:not(.hero)').forEach(section => {
            this.observer.observe(section);
        });
    },
    
    updateOnResize() {
        // Reinitialize observer with new options when screen size changes
        if (this.observer) {
            this.observer.disconnect();
            this.init();
        }
    }
};

// Initialize responsive observer
ResponsiveObserver.init();

// Text reveal animation
const revealText = (element) => {
    const text = element.textContent;
    element.innerHTML = '';
    
    text.split('').forEach((char, index) => {
        const span = document.createElement('span');
        span.textContent = char === ' ' ? '\u00A0' : char;
        span.style.opacity = '0';
        span.style.transform = 'translateY(20px)';
        span.style.transition = `all 0.3s ease ${index * 0.05}s`;
        element.appendChild(span);
        
        setTimeout(() => {
            span.style.opacity = '1';
            span.style.transform = 'translateY(0)';
        }, 100);
    });
};

// Apply text reveal to main headings when they come into view
const textObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.classList.contains('revealed')) {
            revealText(entry.target);
            entry.target.classList.add('revealed');
        }
    });
}, { threshold: 0.5 });

// Observe headings for text reveal
document.querySelectorAll('h1, h2').forEach(heading => {
    textObserver.observe(heading);
});

// Mouse cursor trail effect (desktop only)
const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

if (!isTouch) {
    const cursor = document.createElement('div');
    cursor.style.cssText = `
        position: fixed;
        width: 20px;
        height: 20px;
        background: radial-gradient(circle, rgba(0, 212, 170, 0.8), transparent);
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999;
        transition: transform 0.1s ease;
        mix-blend-mode: difference;
    `;
    document.body.appendChild(cursor);

    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX - 10 + 'px';
        cursor.style.top = e.clientY - 10 + 'px';
    });

    // Add hover effects to interactive elements
    document.querySelectorAll('a, button, .project-card').forEach(element => {
        element.addEventListener('mouseenter', () => {
            cursor.style.transform = 'scale(2)';
        });
        
        element.addEventListener('mouseleave', () => {
            cursor.style.transform = 'scale(1)';
        });
    });
}

// Scroll-triggered counter animation
const animateCounters = () => {
    const counters = document.querySelectorAll('[data-count]');
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-count'));
        const increment = target / 100;
        let current = 0;
        
        const updateCounter = () => {
            if (current < target) {
                current += increment;
                counter.textContent = Math.ceil(current);
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target;
            }
        };
        
        updateCounter();
    });
};

// Trigger animations when page loads
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});

// Enhanced Mobile Navigation
const MobileNavigation = {
    init() {
        this.mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
        this.mobileNav = document.querySelector('.mobile-nav');
        this.mobileNavLinks = document.querySelectorAll('.mobile-nav a');
        this.isOpen = false;
        
        this.bindEvents();
        this.setupSwipeGestures();
    },
    
    bindEvents() {
        // Toggle menu
        this.mobileMenuToggle.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggle();
        });
        
        // Close menu when clicking on links
        this.mobileNavLinks.forEach(link => {
            link.addEventListener('click', () => {
                this.close();
            });
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.mobileNav.contains(e.target) && !this.mobileMenuToggle.contains(e.target)) {
                this.close();
            }
        });
        
        // Handle escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });
    },
    
    setupSwipeGestures() {
        if (!DeviceDetector.isTouch()) return;
        
        let startX = 0;
        let startY = 0;
        
        this.mobileNav.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        }, { passive: true });
        
        this.mobileNav.addEventListener('touchmove', (e) => {
            const deltaX = e.touches[0].clientX - startX;
            const deltaY = Math.abs(e.touches[0].clientY - startY);
            
            // If swiping right and not scrolling vertically much
            if (deltaX > 50 && deltaY < 100) {
                this.close();
            }
        }, { passive: true });
    },
    
    toggle() {
        this.isOpen ? this.close() : this.open();
    },
    
    open() {
        this.mobileMenuToggle.classList.add('active');
        this.mobileNav.classList.add('active');
        document.body.classList.add('menu-open');
        this.isOpen = true;
        
        // Prevent background scrolling
        document.body.style.overflow = 'hidden';
    },
    
    close() {
        this.mobileMenuToggle.classList.remove('active');
        this.mobileNav.classList.remove('active');
        document.body.classList.remove('menu-open');
        this.isOpen = false;
        
        // Restore background scrolling
        document.body.style.overflow = '';
    }
};

// Initialize mobile navigation
if (DeviceDetector.isMobile() || DeviceDetector.isTablet()) {
    MobileNavigation.init();
}

// Enhanced Responsive Utilities
const ResponsiveManager = {
    currentBreakpoint: '',
    
    init() {
        this.updateBreakpoint();
        this.bindResizeEvents();
        this.handleOrientationChange();
        this.setupViewportHeight();
    },
    
    updateBreakpoint() {
        const newBreakpoint = DeviceDetector.getBreakpoint();
        
        if (newBreakpoint !== this.currentBreakpoint) {
            // Remove old breakpoint class
            if (this.currentBreakpoint) {
                document.body.classList.remove(`breakpoint-${this.currentBreakpoint}`);
            }
            
            // Add new breakpoint class
            document.body.classList.add(`breakpoint-${newBreakpoint}`);
            this.currentBreakpoint = newBreakpoint;
            
            // Trigger breakpoint change event
            this.onBreakpointChange(newBreakpoint);
        }
        
        // Update device type classes
        document.body.classList.toggle('is-mobile', DeviceDetector.isMobile());
        document.body.classList.toggle('is-tablet', DeviceDetector.isTablet());
        document.body.classList.toggle('is-desktop', DeviceDetector.isDesktop());
        document.body.classList.toggle('is-touch', DeviceDetector.isTouch());
        document.body.classList.toggle('is-retina', DeviceDetector.isRetina());
    },
    
    onBreakpointChange(breakpoint) {
        // Update observer thresholds
        ResponsiveObserver.updateOnResize();
        
        // Adjust project grid scroll behavior
        this.optimizeProjectGrid(breakpoint);
        
        // Close mobile menu if switching to desktop
        if (breakpoint === 'xl' || breakpoint === 'lg') {
            if (MobileNavigation && MobileNavigation.close) {
                MobileNavigation.close();
            }
        }
    },
    
    optimizeProjectGrid(breakpoint) {
        const projectsGrid = document.querySelector('.projects-grid');
        if (!projectsGrid) return;
        
        // Adjust scroll behavior based on screen size
        if (breakpoint === 'xs' || breakpoint === 'sm') {
            projectsGrid.style.scrollSnapType = 'x mandatory';
            projectsGrid.style.scrollBehavior = 'smooth';
        } else {
            projectsGrid.style.scrollSnapType = 'none';
        }
    },
    
    bindResizeEvents() {
        let resizeTimeout;
        
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.updateBreakpoint();
                this.setupViewportHeight();
            }, 150);
        });
    },
    
    handleOrientationChange() {
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.updateBreakpoint();
                this.setupViewportHeight();
                
                // Close mobile menu on orientation change
                if (MobileNavigation && MobileNavigation.close) {
                    MobileNavigation.close();
                }
            }, 100);
        });
    },
    
    setupViewportHeight() {
        // Set CSS custom property for viewport height (mobile browser fix)
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }
};

// Smooth scrolling for navigation links with mobile optimization
const SmoothScroll = {
    init() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = anchor.getAttribute('href');
                const targetSection = document.querySelector(targetId);
                
                if (targetSection) {
                    const offsetTop = targetSection.offsetTop - (DeviceDetector.isMobile() ? 80 : 100);
                    
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }
};

// Initialize all responsive utilities
ResponsiveManager.init();
SmoothScroll.init();

// Text Animations
const TextAnimations = {
    init() {
        this.setupTextReveal();
        this.setupCounters();
    },
    
    setupTextReveal() {
        const revealText = (element) => {
            if (element.classList.contains('revealed')) return;
            
            const text = element.textContent;
            element.innerHTML = '';
            
            text.split('').forEach((char, index) => {
                const span = document.createElement('span');
                span.textContent = char === ' ' ? '\u00A0' : char;
                span.style.opacity = '0';
                span.style.transform = 'translateY(20px)';
                span.style.transition = `all 0.3s ease ${index * 0.05}s`;
                element.appendChild(span);
                
                setTimeout(() => {
                    span.style.opacity = '1';
                    span.style.transform = 'translateY(0)';
                }, 100);
            });
            
            element.classList.add('revealed');
        };

        // Apply text reveal to main headings when they come into view
        const textObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    revealText(entry.target);
                }
            });
        }, { threshold: 0.5 });

        document.querySelectorAll('h1, h2').forEach(heading => {
            textObserver.observe(heading);
        });
    },
    
    setupCounters() {
        const animateCounters = () => {
            const counters = document.querySelectorAll('[data-count]');
            counters.forEach(counter => {
                const target = parseInt(counter.getAttribute('data-count'));
                const increment = target / 100;
                let current = 0;
                
                const updateCounter = () => {
                    if (current < target) {
                        current += increment;
                        counter.textContent = Math.ceil(current);
                        requestAnimationFrame(updateCounter);
                    } else {
                        counter.textContent = target;
                    }
                };
                
                updateCounter();
            });
        };
        
        // Trigger counter animation when visible
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounters();
                    counterObserver.unobserve(entry.target);
                }
            });
        });
        
        document.querySelectorAll('[data-count]').forEach(counter => {
            counterObserver.observe(counter);
        });
    }
};

// Cursor Effects (Desktop Only)
const CursorEffects = {
    init() {
        if (DeviceDetector.isTouch()) return;
        
        this.createCustomCursor();
        this.bindCursorEvents();
    },
    
    createCustomCursor() {
        this.cursor = document.createElement('div');
        this.cursor.style.cssText = `
            position: fixed;
            width: 20px;
            height: 20px;
            background: radial-gradient(circle, rgba(0, 212, 170, 0.8), transparent);
            border-radius: 50%;
            pointer-events: none;
            z-index: 9999;
            transition: transform 0.1s ease;
            mix-blend-mode: difference;
        `;
        document.body.appendChild(this.cursor);
    },
    
    bindCursorEvents() {
        document.addEventListener('mousemove', (e) => {
            this.cursor.style.left = e.clientX - 10 + 'px';
            this.cursor.style.top = e.clientY - 10 + 'px';
        });

        // Add hover effects to interactive elements
        document.querySelectorAll('a, button, .project-card').forEach(element => {
            element.addEventListener('mouseenter', () => {
                this.cursor.style.transform = 'scale(2)';
            });
            
            element.addEventListener('mouseleave', () => {
                this.cursor.style.transform = 'scale(1)';
            });
        });
    }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('loaded');
    
    // Initialize text reveal animations (reduced on mobile)
    if (!DeviceDetector.isMobile() || !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        TextAnimations.init();
    }
    
    // Initialize cursor effects (desktop only)
    if (!DeviceDetector.isTouch()) {
        CursorEffects.init();
    }
});