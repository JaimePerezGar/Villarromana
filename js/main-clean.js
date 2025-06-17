/**
 * Main JavaScript - Clean Version
 * Combines essential functionality without duplicates
 */

(function() {
    'use strict';

    // Mobile menu toggle
    function initMobileMenu() {
        const mobileToggle = document.querySelector('.mobile-menu-toggle');
        const navMenu = document.querySelector('.nav-menu');
        
        if (mobileToggle && navMenu) {
            mobileToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
                mobileToggle.classList.toggle('active');
            });
            
            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!e.target.closest('.nav-menu') && !e.target.closest('.mobile-menu-toggle')) {
                    navMenu.classList.remove('active');
                    mobileToggle.classList.remove('active');
                }
            });
        }
    }

    // Hero slider
    function initHeroSlider() {
        const slides = document.querySelectorAll('.hero-slider .slide');
        if (slides.length === 0) return;
        
        let currentSlide = 0;
        
        function showSlide(index) {
            slides.forEach((slide, i) => {
                slide.classList.toggle('active', i === index);
            });
        }
        
        function nextSlide() {
            currentSlide = (currentSlide + 1) % slides.length;
            showSlide(currentSlide);
        }
        
        // Initialize first slide
        showSlide(0);
        
        // Auto-advance every 5 seconds
        setInterval(nextSlide, 5000);
        
        // Add navigation dots
        const dotsContainer = document.createElement('div');
        dotsContainer.className = 'slider-dots';
        dotsContainer.style.cssText = `
            position: absolute;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            gap: 10px;
            z-index: 3;
        `;
        
        slides.forEach((_, index) => {
            const dot = document.createElement('button');
            dot.className = 'slider-dot';
            dot.style.cssText = `
                width: 12px;
                height: 12px;
                border-radius: 50%;
                border: 2px solid white;
                background: ${index === 0 ? 'white' : 'transparent'};
                cursor: pointer;
                transition: background 0.3s;
            `;
            
            dot.addEventListener('click', () => {
                currentSlide = index;
                showSlide(currentSlide);
                updateDots();
            });
            
            dotsContainer.appendChild(dot);
        });
        
        function updateDots() {
            dotsContainer.querySelectorAll('.slider-dot').forEach((dot, i) => {
                dot.style.background = i === currentSlide ? 'white' : 'transparent';
            });
        }
        
        // Update dots when slide changes
        const sliderContainer = document.querySelector('.hero-slider');
        if (sliderContainer) {
            sliderContainer.appendChild(dotsContainer);
            
            // Update dots on auto-advance
            const originalNextSlide = nextSlide;
            window.nextSlide = function() {
                originalNextSlide();
                updateDots();
            };
        }
    }

    // Smooth scrolling for anchor links
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (href === '#' || href === '') return;
                
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    // Lazy loading for images
    function initLazyLoading() {
        const images = document.querySelectorAll('img[data-src]');
        if ('IntersectionObserver' in window) {
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
        } else {
            // Fallback for older browsers
            images.forEach(img => {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
            });
        }
    }

    // Contact form handler
    function initContactForm() {
        const form = document.getElementById('contact-form');
        if (!form) return;
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;
            
            // Get form data
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            
            // Here you would normally send to your backend
            // For demo, just show success
            setTimeout(() => {
                alert('Message sent successfully!');
                form.reset();
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }, 1000);
        });
    }

    // WhatsApp button
    function initWhatsApp() {
        const whatsappBtn = document.querySelector('.whatsapp-float');
        if (!whatsappBtn) {
            const btn = document.createElement('a');
            btn.href = 'https://wa.me/34612345678';
            btn.target = '_blank';
            btn.className = 'whatsapp-float';
            btn.innerHTML = '<i class="fab fa-whatsapp"></i>';
            btn.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                width: 60px;
                height: 60px;
                background: #25d366;
                color: white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 30px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.3);
                z-index: 100;
                transition: transform 0.3s;
            `;
            
            btn.addEventListener('mouseenter', () => {
                btn.style.transform = 'scale(1.1)';
            });
            
            btn.addEventListener('mouseleave', () => {
                btn.style.transform = 'scale(1)';
            });
            
            document.body.appendChild(btn);
        }
    }

    // Initialize everything when DOM is ready
    function init() {
        initMobileMenu();
        initHeroSlider();
        initSmoothScroll();
        initLazyLoading();
        initContactForm();
        initWhatsApp();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();