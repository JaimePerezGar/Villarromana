/**
 * Villa Romana - Main JavaScript
 * All working functionality restored
 */

(function() {
    'use strict';

    // Mobile menu toggle
    function initMobileMenu() {
        const navToggle = document.querySelector('.nav-toggle');
        const navMenu = document.querySelector('.nav-menu');
        
        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
                navToggle.classList.toggle('active');
            });
            
            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!e.target.closest('.nav-menu') && !e.target.closest('.nav-toggle')) {
                    navMenu.classList.remove('active');
                    navToggle.classList.remove('active');
                }
            });
            
            // Close menu when clicking on a link
            navMenu.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => {
                    navMenu.classList.remove('active');
                    navToggle.classList.remove('active');
                });
            });
        }
    }

    // Language dropdown
    function initLanguageDropdown() {
        const langToggle = document.getElementById('langToggle');
        const langDropdown = document.getElementById('langDropdown');
        
        if (langToggle && langDropdown) {
            langToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                langDropdown.style.opacity = langDropdown.style.opacity === '1' ? '0' : '1';
                langDropdown.style.visibility = langDropdown.style.visibility === 'visible' ? 'hidden' : 'visible';
            });
            
            // Close dropdown when clicking outside
            document.addEventListener('click', () => {
                langDropdown.style.opacity = '0';
                langDropdown.style.visibility = 'hidden';
            });
        }
    }

    // Hero slider
    function initHeroSlider() {
        const slides = document.querySelectorAll('.hero-slider .slide');
        const prevBtn = document.querySelector('.hero-controls .prev');
        const nextBtn = document.querySelector('.hero-controls .next');
        const indicators = document.querySelectorAll('.hero-indicators .indicator');
        
        if (slides.length === 0) return;
        
        let currentSlide = 0;
        let slideInterval;
        
        function showSlide(index) {
            slides.forEach((slide, i) => {
                slide.classList.toggle('active', i === index);
            });
            
            indicators.forEach((indicator, i) => {
                indicator.classList.toggle('active', i === index);
            });
        }
        
        function nextSlide() {
            currentSlide = (currentSlide + 1) % slides.length;
            showSlide(currentSlide);
        }
        
        function prevSlide() {
            currentSlide = (currentSlide - 1 + slides.length) % slides.length;
            showSlide(currentSlide);
        }
        
        function startAutoSlide() {
            slideInterval = setInterval(nextSlide, 5000);
        }
        
        function stopAutoSlide() {
            clearInterval(slideInterval);
        }
        
        // Event listeners
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                prevSlide();
                stopAutoSlide();
                startAutoSlide();
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                nextSlide();
                stopAutoSlide();
                startAutoSlide();
            });
        }
        
        indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => {
                currentSlide = index;
                showSlide(currentSlide);
                stopAutoSlide();
                startAutoSlide();
            });
        });
        
        // Initialize
        showSlide(0);
        startAutoSlide();
        
        // Pause on hover
        const heroSlider = document.querySelector('.hero-slider');
        if (heroSlider) {
            heroSlider.addEventListener('mouseenter', stopAutoSlide);
            heroSlider.addEventListener('mouseleave', startAutoSlide);
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
                    const headerHeight = document.querySelector('.header').offsetHeight;
                    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    // Scroll to top button
    function initScrollToTop() {
        const scrollBtn = document.querySelector('.scroll-to-top');
        if (!scrollBtn) return;
        
        function toggleScrollButton() {
            if (window.pageYOffset > 300) {
                scrollBtn.classList.add('show');
            } else {
                scrollBtn.classList.remove('show');
            }
        }
        
        window.addEventListener('scroll', toggleScrollButton);
        
        scrollBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // Header scroll effect
    function initHeaderScroll() {
        const header = document.querySelector('.header');
        let lastScroll = 0;
        
        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;
            
            if (currentScroll > 100) {
                header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
            } else {
                header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
            }
            
            lastScroll = currentScroll;
        });
    }

    // Gallery filters
    function initGalleryFilters() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        const galleryItems = document.querySelectorAll('.gallery-item');
        
        if (filterButtons.length === 0 || galleryItems.length === 0) return;
        
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Remove active class from all buttons
                filterButtons.forEach(btn => btn.classList.remove('active'));
                // Add active class to clicked button
                button.classList.add('active');
                
                const filter = button.getAttribute('data-filter');
                
                galleryItems.forEach(item => {
                    if (filter === 'all' || item.getAttribute('data-category') === filter) {
                        item.style.display = 'block';
                        item.classList.remove('hidden');
                        // Add animation
                        setTimeout(() => {
                            item.style.animation = 'fadeIn 0.5s ease';
                        }, 10);
                    } else {
                        item.style.display = 'none';
                        item.classList.add('hidden');
                    }
                });
            });
        });
    }

    // Gallery lightbox
    function initGalleryLightbox() {
        const galleryItems = document.querySelectorAll('.gallery-item');
        const existingLightbox = document.getElementById('lightbox');
        
        if (galleryItems.length === 0) return;
        
        let lightbox = existingLightbox;
        
        // If lightbox doesn't exist in HTML, create it
        if (!lightbox) {
            lightbox = document.createElement('div');
            lightbox.className = 'lightbox';
            lightbox.id = 'lightbox';
            lightbox.innerHTML = `
                <span class="close-lightbox">&times;</span>
                <img src="" alt="" id="lightbox-img">
                <div class="lightbox-caption" id="lightbox-caption"></div>
                <button class="lightbox-prev">&#10094;</button>
                <button class="lightbox-next">&#10095;</button>
            `;
            document.body.appendChild(lightbox);
        }
        
        const lightboxImg = lightbox.querySelector('#lightbox-img');
        const lightboxCaption = lightbox.querySelector('#lightbox-caption');
        const closeBtn = lightbox.querySelector('.close-lightbox');
        const prevBtn = lightbox.querySelector('.lightbox-prev');
        const nextBtn = lightbox.querySelector('.lightbox-next');
        
        let currentIndex = 0;
        let visibleItems = [];
        
        function updateVisibleItems() {
            visibleItems = Array.from(galleryItems).filter(item => 
                !item.classList.contains('hidden') && item.style.display !== 'none'
            );
        }
        
        function showImage(index) {
            if (visibleItems.length === 0) return;
            
            const item = visibleItems[index];
            const img = item.querySelector('img');
            const overlay = item.querySelector('.gallery-overlay');
            
            lightboxImg.src = img.src;
            lightboxImg.alt = img.alt;
            
            if (overlay) {
                const title = overlay.querySelector('h3')?.textContent || '';
                const description = overlay.querySelector('p')?.textContent || '';
                lightboxCaption.innerHTML = `<h3>${title}</h3><p>${description}</p>`;
            }
            
            currentIndex = index;
        }
        
        galleryItems.forEach((item) => {
            item.addEventListener('click', () => {
                updateVisibleItems();
                const index = visibleItems.indexOf(item);
                if (index !== -1) {
                    lightbox.classList.add('active');
                    showImage(index);
                    document.body.style.overflow = 'hidden';
                }
            });
        });
        
        closeBtn.addEventListener('click', () => {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
        });
        
        prevBtn.addEventListener('click', () => {
            if (visibleItems.length > 0) {
                currentIndex = (currentIndex - 1 + visibleItems.length) % visibleItems.length;
                showImage(currentIndex);
            }
        });
        
        nextBtn.addEventListener('click', () => {
            if (visibleItems.length > 0) {
                currentIndex = (currentIndex + 1) % visibleItems.length;
                showImage(currentIndex);
            }
        });
        
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                lightbox.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (!lightbox.classList.contains('active')) return;
            
            if (e.key === 'Escape') {
                lightbox.classList.remove('active');
                document.body.style.overflow = '';
            } else if (e.key === 'ArrowLeft') {
                prevBtn.click();
            } else if (e.key === 'ArrowRight') {
                nextBtn.click();
            }
        });
    }

    // Contact form
    function initContactForm() {
        const form = document.getElementById('contact-form');
        if (!form) return;
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Enviando...';
            submitBtn.disabled = true;
            
            // Get form data
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            
            try {
                // Here you would normally send to your backend
                // For now, we'll simulate a successful submission
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // Show success message
                const successMsg = document.createElement('div');
                successMsg.className = 'alert alert-success';
                successMsg.textContent = '¡Mensaje enviado correctamente! Te contactaremos pronto.';
                successMsg.style.cssText = `
                    background: #d4edda;
                    color: #155724;
                    padding: 15px;
                    border-radius: 5px;
                    margin-bottom: 20px;
                `;
                form.parentNode.insertBefore(successMsg, form);
                
                // Reset form
                form.reset();
                
                // Remove success message after 5 seconds
                setTimeout(() => {
                    successMsg.remove();
                }, 5000);
                
            } catch (error) {
                console.error('Error:', error);
                alert('Error al enviar el mensaje. Por favor, inténtalo de nuevo.');
            } finally {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }

    // Initialize all functions when DOM is ready
    function init() {
        initMobileMenu();
        initLanguageDropdown();
        initHeroSlider();
        initSmoothScroll();
        initScrollToTop();
        initHeaderScroll();
        initGalleryFilters();
        initGalleryLightbox();
        initContactForm();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();