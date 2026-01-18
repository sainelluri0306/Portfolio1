// Track if animations have already played in this session
const hasAnimated = sessionStorage.getItem('hasAnimated') === 'true';

// Scroll indicator click handler
(function() {
    const scrollIndicator = document.querySelector('.scroll-indicator');
    if (!scrollIndicator) return;
    
    let hasScrolledDown = false;
    let lastScrollPosition = 0;
    let scrollDownTime = 0;
    let cooldownTimer = null;
    let reminderTimer = null;
    const COOLDOWN_DURATION = 10000; // 10 seconds
    const REMINDER_DELAY = 8000; // Show reminder after 8 seconds of being at top
    
    scrollIndicator.addEventListener('click', () => {
        const aboutSection = document.getElementById('about');
        if (aboutSection) {
            aboutSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
    
    function hideIndicator() {
        scrollIndicator.style.opacity = '0';
        scrollIndicator.style.pointerEvents = 'none';
        scrollIndicator.style.visibility = 'hidden';
        scrollIndicator.classList.remove('visible');
    }
    
    function showIndicator() {
        scrollIndicator.classList.add('visible');
        scrollIndicator.style.visibility = 'visible';
        scrollIndicator.style.opacity = '1';
        scrollIndicator.style.pointerEvents = 'auto';
    }
    
    function startReminderTimer() {
        // Clear any existing reminder timer
        if (reminderTimer) {
            clearTimeout(reminderTimer);
        }
        
        // Show reminder after delay if user is at top
        reminderTimer = setTimeout(() => {
            const currentScroll = window.pageYOffset;
            if (currentScroll < 50 && !hasScrolledDown) {
                showIndicator();
            }
        }, REMINDER_DELAY);
    }
    
    function handleScroll() {
        const currentScroll = window.pageYOffset;
        const isScrollingDown = currentScroll > lastScrollPosition;
        const isAtTop = currentScroll < 50;
        const hasScrolledSignificantly = currentScroll > 150;
        
        // Detect if user scrolled down significantly
        if (isScrollingDown && hasScrolledSignificantly) {
            if (!hasScrolledDown) {
                hasScrolledDown = true;
                scrollDownTime = Date.now();
                hideIndicator();
                
                // Clear any timers
                if (reminderTimer) {
                    clearTimeout(reminderTimer);
                    reminderTimer = null;
                }
                if (cooldownTimer) {
                    clearTimeout(cooldownTimer);
                    cooldownTimer = null;
                }
            }
        }
        
        // User is at the top
        if (isAtTop) {
            // If user has scrolled down before, enforce cooldown
            if (hasScrolledDown) {
                const timeSinceScrollDown = Date.now() - scrollDownTime;
                
                // Always hide during cooldown period - don't show until cooldown is complete
                if (timeSinceScrollDown < COOLDOWN_DURATION) {
                    hideIndicator();
                    
                    // Only set timer if one doesn't exist (prevent multiple timers)
                    if (!cooldownTimer) {
                        const remainingTime = COOLDOWN_DURATION - timeSinceScrollDown;
                        cooldownTimer = setTimeout(() => {
                            const stillAtTop = window.pageYOffset < 50;
                            if (stillAtTop) {
                                showIndicator();
                                hasScrolledDown = false;
                                scrollDownTime = 0;
                                startReminderTimer();
                            }
                            cooldownTimer = null;
                        }, remainingTime);
                    }
                } else {
                    // Cooldown has passed, show indicator and reset
                    if (cooldownTimer) {
                        clearTimeout(cooldownTimer);
                        cooldownTimer = null;
                    }
                    showIndicator();
                    hasScrolledDown = false;
                    scrollDownTime = 0;
                    startReminderTimer();
                }
            } else {
                // User hasn't scrolled down yet, show indicator normally
                showIndicator();
                startReminderTimer();
            }
        } else {
            // User is scrolled down, always hide indicator
            hideIndicator();
            
            // Clear reminder timer when scrolled away
            if (reminderTimer) {
                clearTimeout(reminderTimer);
                reminderTimer = null;
            }
            
            // Don't clear cooldown timer - let it complete even if user scrolls
        }
        
        lastScrollPosition = currentScroll;
    }
    
    // Throttled scroll handler
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                handleScroll();
                ticking = false;
            });
            ticking = true;
        }
    });
    
    // Initial check
    handleScroll();
})();

// Sidebar icon click handlers
document.querySelectorAll('.sidebar-icon').forEach(icon => {
    icon.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        const dataSection = this.getAttribute('data-section');
        
        // Handle home button - navigate to index.html
        if (dataSection === 'home' && href) {
            // Check if we're already on index.html
            const currentPath = window.location.pathname;
            if (currentPath.includes('index.html') || currentPath.endsWith('/') || currentPath === '') {
                // Already on home page, just scroll to top
                e.preventDefault();
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
                // Clear hash from URL
                if (window.location.hash) {
                    window.history.replaceState(null, '', window.location.pathname);
                }
                // Update active icon
                document.querySelectorAll('.sidebar-icon').forEach(i => i.classList.remove('active'));
                this.classList.add('active');
                // Trigger update for sidebar position
                setTimeout(() => {
                    const event = new Event('hashchange');
                    window.dispatchEvent(event);
                }, 100);
            } else {
                // Navigate to home page
                sessionStorage.removeItem('hasAnimated');
                window.location.href = href;
            }
            return;
        }
        
        // Handle contact button - navigate to index.html#contact
        if (dataSection === 'contact' && href) {
            // Check if we're already on index.html
            const currentPath = window.location.pathname;
            if (currentPath.includes('index.html') || currentPath.endsWith('/') || currentPath === '') {
                // Already on home page, scroll to contact section
                e.preventDefault();
                const contactSection = document.getElementById('contact');
                if (contactSection) {
                    const sectionTop = contactSection.offsetTop;
                    const sectionHeight = contactSection.offsetHeight;
                    const windowHeight = window.innerHeight;
                    const scrollPosition = sectionTop - (windowHeight / 2) + (sectionHeight / 2);
                    window.scrollTo({
                        top: scrollPosition,
                        behavior: 'smooth'
                    });
                    // Update URL hash
                    window.history.pushState(null, '', '#contact');
                    // Update active icon
                    document.querySelectorAll('.sidebar-icon').forEach(i => i.classList.remove('active'));
                    this.classList.add('active');
                }
            } else {
                // Navigate to contact section on home page
                window.location.href = href;
            }
            return;
        }
        
        // If href doesn't start with #, it's an external link - allow normal navigation
        if (href && !href.startsWith('#')) {
            // Check if navigating to home page - reset animation flag
            if (href === 'index.html' || href === '/' || href.endsWith('index.html')) {
                sessionStorage.removeItem('hasAnimated');
            } else {
                // Mark that we've navigated (so animations won't play on next page)
                sessionStorage.setItem('hasAnimated', 'true');
            }
            // Allow normal navigation for external links
            return;
        }
        
        // For anchor links, prevent default and scroll
        e.preventDefault();
        
        // Remove active class from all icons
        document.querySelectorAll('.sidebar-icon').forEach(i => i.classList.remove('active'));
        
        // Add active class to clicked icon
        this.classList.add('active');
        
        // Get the section to scroll to
        const sectionId = this.getAttribute('data-section') || (href ? href.substring(1) : null);
        const target = document.getElementById(sectionId);
        
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Smooth scrolling for navigation links (for any other links)
document.querySelectorAll('a[href^="#"]:not(.sidebar-icon)').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            
            // Update active icon based on scroll target
            const sectionId = this.getAttribute('href').substring(1);
            document.querySelectorAll('.sidebar-icon').forEach(icon => {
                icon.classList.remove('active');
                if (icon.getAttribute('data-section') === sectionId) {
                    icon.classList.add('active');
                }
            });
        }
    });
});

// Function to scroll to a section
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        if (sectionId === 'contact') {
            // Center the contact section
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const windowHeight = window.innerHeight;
            const scrollPosition = sectionTop - (windowHeight / 2) + (sectionHeight / 2);
            window.scrollTo({
                top: scrollPosition,
                behavior: 'smooth'
            });
        } else {
            section.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }
}

// Handle form submission
function handleSubmit(event) {
    event.preventDefault();
    alert('Thank you for your message! We will get back to you soon.');
    event.target.reset();
}

// Add scroll animation for sections
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

// Observe all sections
document.querySelectorAll('.section').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(20px)';
    section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(section);
});

// Stagger animation for portfolio cards
const cardObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0) scale(1)';
            }, index * 100);
            cardObserver.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
});

// Initialize portfolio cards animation
function initPortfolioCards() {
    const portfolioCards = document.querySelectorAll('.portfolio-card');
    portfolioCards.forEach(card => {
        cardObserver.observe(card);
    });
}

// Initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPortfolioCards);
} else {
    initPortfolioCards();
}

// Also try after a short delay to ensure everything is loaded
setTimeout(initPortfolioCards, 100);

// Add data-text attributes to card header h3 elements for gradient transition
(function() {
    function addDataTextAttributes() {
        const cardHeaders = document.querySelectorAll('.card-header h3');
        cardHeaders.forEach(h3 => {
            if (!h3.hasAttribute('data-text')) {
                h3.setAttribute('data-text', h3.textContent);
            }
        });
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', addDataTextAttributes);
    } else {
        addDataTextAttributes();
    }
    
    // Also try after a short delay
    setTimeout(addDataTextAttributes, 100);
})();

// Interactive glossy effect for portfolio cards, experience boxes, and project cards based on mouse position
(function() {
    const portfolioCards = document.querySelectorAll('.portfolio-card, .experience-content-box, .project-card');
    
    portfolioCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            card.style.setProperty('--mouse-x', `${x}%`);
            card.style.setProperty('--mouse-y', `${y}%`);
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.setProperty('--mouse-x', '50%');
            card.style.setProperty('--mouse-y', '50%');
        });
    });
})();

// Interactive dots background - Full page with wrap effect
(function() {
    const canvas = document.getElementById('dotsCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    let mouseX = -1000;
    let mouseY = -1000;
    let dots = [];
    let animationId = null;
    
    // Entry animation state
    let entryAnimationStart = Date.now();
    let entryAnimationDuration = 2500; // 2.5 seconds - longer for visibility
    let hasAnimated = sessionStorage.getItem('dotsAnimated') === 'true';
    
    // For testing: uncomment the line below to see the animation every time
    // hasAnimated = false;
    
    // Single color scheme (primary color variations) - matching menu bar highlight
    const primaryColor = { r: 99, g: 102, b: 241 }; // #6366f1 (primary-color - menu bar highlight)
    const darkColor = { r: 50, g: 50, b: 65 }; // Very subtle tint of primary color for base visibility
    
    // Get sidebar bounds to exclude from dots
    function getSidebarBounds() {
        const sidebar = document.querySelector('.sidebar');
        if (!sidebar) return { left: -1000, right: -1000, top: -1000, bottom: -1000 };
        const rect = sidebar.getBoundingClientRect();
        return {
            left: rect.left - 30,
            right: rect.right + 30,
            top: rect.top - 30,
            bottom: rect.bottom + 30
        };
    }
    
    // Set canvas size
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        initDots();
    }
    
    // Initialize dots - show dots everywhere including under menu bar
    function initDots() {
        dots = [];
        const spacing = 40;
        const rows = Math.ceil(canvas.height / spacing);
        const cols = Math.ceil(canvas.width / spacing);
        
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                const x = j * spacing + (spacing / 2);
                const y = i * spacing + (spacing / 2);
                
                // Calculate distance from center for entry animation
                const centerX = canvas.width / 2;
                const centerY = canvas.height / 2;
                const distFromCenter = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
                const maxDist = Math.sqrt(centerX ** 2 + centerY ** 2);
                const normalizedDist = distFromCenter / maxDist;
                
                // Add dots everywhere - no exclusion
                dots.push({
                    x: x,
                    y: y,
                    baseSize: 0.6, // Very tiny pinpricks
                    currentSize: hasAnimated ? 0.6 : 0, // Start at 0 for entry animation
                    targetSize: 0.6,
                    baseColor: { r: 60, g: 62, b: 150 }, // Primary color (darker blue-purple) when not hovered
                    currentColor: hasAnimated ? { r: 60, g: 62, b: 150 } : { r: 60, g: 62, b: 150 },
                    targetColor: { r: 60, g: 62, b: 150 },
                    waveOffset: Math.random() * Math.PI * 2,
                    entryDelay: normalizedDist * 0.5, // Stagger based on distance from center (faster spread)
                    entryPhase: Math.random() * Math.PI * 2 // Random phase for shimmer
                });
            }
        }
        
        // Reset entry animation if not already animated
        if (!hasAnimated) {
            entryAnimationStart = Date.now();
            // Force canvas to be visible for entry animation
            canvas.style.opacity = '1';
        }
        
        if (!animationId) {
            drawDots();
        }
    }
    
    // Wave function for wrap effect
    function waveEffect(distance, maxDistance, waveOffset) {
        const normalizedDist = distance / maxDistance;
        const wave = Math.sin(normalizedDist * Math.PI * 3 - waveOffset) * 0.5 + 0.5;
        return Math.pow(1 - normalizedDist, 2) * wave;
    }
    
    // Easing function for smooth entry animation
    function easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }
    
    // Easing function for shimmer effect
    function easeInOutSine(t) {
        return -(Math.cos(Math.PI * t) - 1) / 2;
    }
    
    // Draw all dots with smooth flow and small torch effect
    function drawDots() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const maxDistance = 250;
        const time = Date.now() * 0.001;
        const currentTime = Date.now();
        const elapsed = currentTime - entryAnimationStart;
        const entryProgress = Math.min(elapsed / entryAnimationDuration, 1);
        const isEntryAnimating = !hasAnimated && entryProgress < 1;
        
        // Mark as animated after first animation completes
        if (isEntryAnimating && entryProgress >= 1) {
            hasAnimated = true;
            sessionStorage.setItem('dotsAnimated', 'true');
        }
        
        dots.forEach(dot => {
            // Entry animation - shimmer effect
            let entryAlpha = 1;
            let entrySizeMultiplier = 1;
            let shimmerIntensity = 0;
            
            if (isEntryAnimating) {
                // Calculate when this dot should start appearing (staggered)
                const dotStartTime = dot.entryDelay;
                const dotProgress = Math.max(0, Math.min(1, (entryProgress - dotStartTime) / (1 - dotStartTime)));
                
                if (dotProgress > 0) {
                    // Smooth fade in with easing
                    entryAlpha = easeOutCubic(dotProgress);
                    
                    // Shimmer effect - elegant wave that travels across dots (Apple-like)
                    // Create a wave pattern that moves outward from center
                    const shimmerWave = Math.sin((time * 2 + dot.entryPhase + dot.entryDelay * 2) % (Math.PI * 2));
                    // Only apply shimmer during the initial appearance phase
                    const shimmerPhase = Math.min(1, dotProgress * 2); // Shimmer fades out as dot fully appears
                    shimmerIntensity = 0.6 + (shimmerWave * 0.35 * shimmerPhase); // More visible oscillation (0.25 to 0.95)
                    shimmerIntensity = Math.max(0.5, Math.min(1.0, shimmerIntensity));
                    
                    // More visible size variation during shimmer
                    entrySizeMultiplier = 1 + (shimmerIntensity - 0.6) * 0.3; // More noticeable size variation
                } else {
                    entryAlpha = 0;
                }
            }
            
            // Calculate distance from mouse
            const dx = mouseX - dot.x;
            const dy = mouseY - dot.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < maxDistance) {
                // Wrap effect using wave function
                const waveOffset = dot.waveOffset + time * 2;
                const influence = waveEffect(distance, maxDistance, waveOffset);
                
                // Enlarge from tiny pinprick to visible size when hovering
                dot.targetSize = 0.6 + (influence * 3);
                
                // Change from grey to full primary color when hovering (menu bar highlight)
                dot.targetColor = {
                    r: 120 + (primaryColor.r - 120) * influence,
                    g: 120 + (primaryColor.g - 120) * influence,
                    b: 120 + (primaryColor.b - 120) * influence
                };
            } else {
                // Return to tiny pinprick base - primary color when not hovered
                dot.targetSize = 0.6;
                dot.targetColor = { r: 60, g: 62, b: 150 }; // Primary color (darker blue-purple)
            }
            
            // Apply entry animation size multiplier
            if (isEntryAnimating && entryAlpha > 0) {
                dot.targetSize *= entrySizeMultiplier;
            }
            
            // Smooth interpolation for fluid animation
            const ease = 0.15;
            dot.currentSize += (dot.targetSize - dot.currentSize) * ease;
            dot.currentColor.r += (dot.targetColor.r - dot.currentColor.r) * ease;
            dot.currentColor.g += (dot.targetColor.g - dot.currentColor.g) * ease;
            dot.currentColor.b += (dot.targetColor.b - dot.currentColor.b) * ease;
            
            // Only show glow effect when dot is enlarged (hovered)
            if (dot.currentSize > 0.8) {
                const glowRadius = dot.currentSize * 2.5;
                const glowGradient = ctx.createRadialGradient(
                    dot.x, dot.y, 0,
                    dot.x, dot.y, glowRadius
                );
                const alpha = Math.min(dot.currentSize / 3, 0.6); // Glow intensity based on size
                glowGradient.addColorStop(0, `rgba(${Math.round(dot.currentColor.r)}, ${Math.round(dot.currentColor.g)}, ${Math.round(dot.currentColor.b)}, ${alpha * 0.8 * entryAlpha})`);
                glowGradient.addColorStop(0.5, `rgba(${Math.round(dot.currentColor.r)}, ${Math.round(dot.currentColor.g)}, ${Math.round(dot.currentColor.b)}, ${alpha * 0.4 * entryAlpha})`);
                glowGradient.addColorStop(1, `rgba(${Math.round(dot.currentColor.r)}, ${Math.round(dot.currentColor.g)}, ${Math.round(dot.currentColor.b)}, 0)`);
                
                // Draw glow only when enlarged
                ctx.beginPath();
                ctx.arc(dot.x, dot.y, glowRadius, 0, Math.PI * 2);
                ctx.fillStyle = glowGradient;
                ctx.fill();
            }
            
            // Draw dot - tiny pinprick when small, larger when hovered
            ctx.beginPath();
            const dotSize = Math.max(dot.currentSize * entrySizeMultiplier, 0.1); // Apply size multiplier and ensure minimum
            ctx.arc(dot.x, dot.y, dotSize, 0, Math.PI * 2);
            const baseAlpha = dot.currentSize < 1.5 ? 0.5 : 1; // Very lightly visible at base size
            const finalAlpha = baseAlpha * entryAlpha;
            
            // Apply shimmer color enhancement during entry (Apple-like subtle glow)
            let shimmerColor = { ...dot.currentColor };
            if (isEntryAnimating && shimmerIntensity > 0.6) {
                // More visible brightness increase during shimmer peak
                const brightnessBoost = (shimmerIntensity - 0.6) * 0.4; // More visible
                shimmerColor.r = Math.min(255, dot.currentColor.r + brightnessBoost * 60);
                shimmerColor.g = Math.min(255, dot.currentColor.g + brightnessBoost * 60);
                shimmerColor.b = Math.min(255, dot.currentColor.b + brightnessBoost * 60);
            }
            
            ctx.fillStyle = `rgba(${Math.round(shimmerColor.r)}, ${Math.round(shimmerColor.g)}, ${Math.round(shimmerColor.b)}, ${finalAlpha})`;
            ctx.fill();
        });
        
        animationId = requestAnimationFrame(drawDots);
    }
    
    // Track mouse movement globally
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });
    
    // Initialize on load
    resizeCanvas();
    window.addEventListener('resize', () => {
        resizeCanvas();
    });
})();

// Custom cursor disabled - using default browser cursor
// Hide custom cursor elements
(function() {
    const cursor = document.querySelector('.custom-cursor');
    const follower = document.querySelector('.custom-cursor-follower');
    if (cursor) cursor.style.display = 'none';
    if (follower) follower.style.display = 'none';
    document.body.style.cursor = 'auto';
})();

// Parallax scrolling effect
(function() {
    let ticking = false;
    
    function updateParallax() {
        const scrolled = window.pageYOffset;
        const hero = document.querySelector('.hero');
        const heroContent = document.querySelector('.hero-content');
        
        if (hero && heroContent) {
            const parallaxY = scrolled * 0.3;
            heroContent.style.transform = `translateY(${parallaxY}px)`;
            heroContent.style.opacity = Math.max(0, 1 - (scrolled / 500));
        }
        
        ticking = false;
    }
    
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(updateParallax);
            ticking = true;
        }
    });
})();

// Text reveal animation on scroll
(function() {
    const textObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const text = entry.target;
                const words = text.textContent.split(' ');
                text.innerHTML = words.map((word, i) => 
                    `<span style="opacity: 0; animation: fadeInUp 0.6s ease ${i * 0.1}s forwards">${word}</span>`
                ).join(' ');
                textObserver.unobserve(text);
            }
        });
    }, { threshold: 0.5 });
    
    document.querySelectorAll('.profile-bio, .hero-description').forEach(text => {
        textObserver.observe(text);
    });
})();

// Removed 3D tilt effect - cards only glow on hover

// Smooth reveal animation for sections
(function() {
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.section, .portfolio-card, .project-card').forEach(el => {
        revealObserver.observe(el);
    });
})();

// Apply animation classes only on initial page load
(function() {
    const hasAnimated = sessionStorage.getItem('hasAnimated') === 'true';
    
    // Only animate if this is the first page load (not a navigation)
    if (!hasAnimated) {
        // Mark that animations have played
        sessionStorage.setItem('hasAnimated', 'true');
        
        // Add animate-in class to elements that should animate
        document.querySelectorAll('.social-icon').forEach(icon => {
            icon.classList.add('animate-in');
        });
        
        const emailDisplay = document.querySelector('.email-display');
        if (emailDisplay) {
            emailDisplay.classList.add('animate-in');
        }
        
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            sidebar.classList.add('animate-in');
        }
        
        const sidebarNav = document.querySelector('.sidebar-nav');
        if (sidebarNav) {
            sidebarNav.classList.add('animate-in');
        }
        
        document.querySelectorAll('.sidebar-icon').forEach(icon => {
            icon.classList.add('animate-in');
        });
    } else {
        // If animations already played, show elements immediately
        document.querySelectorAll('.social-icon').forEach(icon => {
            icon.style.opacity = '1';
            icon.style.transform = 'translateX(0)';
        });
        
        const emailDisplay = document.querySelector('.email-display');
        if (emailDisplay) {
            emailDisplay.style.opacity = '1';
            emailDisplay.style.transform = 'translateX(0)';
            emailDisplay.style.animation = 'none';
        }
        
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            sidebar.style.opacity = '1';
            sidebar.style.transform = 'translateY(-50%) scale(1)';
        }
        
        const sidebarNav = document.querySelector('.sidebar-nav');
        if (sidebarNav) {
            sidebarNav.style.opacity = '1';
            sidebarNav.style.transform = 'scale(1)';
        }
        
        document.querySelectorAll('.sidebar-icon').forEach(icon => {
            icon.style.opacity = '1';
            icon.style.transform = 'translateX(0)';
        });
    }
})();

// Typing animation for hero section
(function() {
    const typingWord = document.querySelector('.typing-word');
    const typingContainer = document.querySelector('.typing-container');
    if (!typingWord || !typingContainer) return;
    
    const hasAnimated = sessionStorage.getItem('hasAnimated') === 'true';
    const words = ['RELENTLESS', 'BRAVE', 'STRONG', 'CURIOUS', 'DRIVEN', 'FOCUSED', 'INNOVATIVE', 'PASSIONATE', 'DETERMINED', 'RESILIENT'];
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100;
    let deletingSpeed = 50;
    let pauseTime = 1500;
    
    // If animations already played, start typing immediately
    if (hasAnimated) {
        typingContainer.style.opacity = '1';
        typingContainer.style.transform = 'translateY(0)';
        // Start typing animation immediately
        setTimeout(type, 300);
    } else {
        // Start typing animation after all other elements have appeared (2.5s delay)
        setTimeout(() => {
            typingContainer.style.opacity = '1';
            typingContainer.style.transform = 'translateY(0)';
            setTimeout(type, 300);
        }, 2500);
    }
    
    function type() {
        const currentWord = words[wordIndex];
        
        if (isDeleting) {
            // Delete characters
            typingWord.textContent = currentWord.substring(0, charIndex - 1);
            charIndex--;
            typingSpeed = deletingSpeed;
            
            if (charIndex < 0) {
                // Finished deleting, move to next word
                isDeleting = false;
                wordIndex = (wordIndex + 1) % words.length;
                typingSpeed = 300; // Short pause before typing next word
            }
        } else {
            // Type characters
            typingWord.textContent = currentWord.substring(0, charIndex + 1);
            charIndex++;
            typingSpeed = 100;
            
            if (charIndex === currentWord.length) {
                // Finished typing word, pause then start deleting
                isDeleting = true;
                typingSpeed = pauseTime; // Pause before deleting
            }
        }
        
        setTimeout(type, typingSpeed);
    }
})();

// Highlight menu bar icons based on current page and scroll position
(function() {
    const sidebar = document.querySelector('.sidebar');
    const emailDisplay = document.querySelector('.email-display');
    const contactSection = document.getElementById('contact');
    const homeSection = document.getElementById('home');
    const experienceSection = document.getElementById('experience');
    const projectsSection = document.getElementById('projects');
    
    const contactIcon = document.querySelector('.sidebar-icon[data-section="contact"]');
    const homeIcon = document.querySelector('.sidebar-icon[data-section="home"]');
    const aboutIcon = document.querySelector('.sidebar-icon[data-section="about"]');
    const experienceIcon = document.querySelector('.sidebar-icon[data-section="experience"]');
    const projectsIcon = document.querySelector('.sidebar-icon[data-section="projects"]');
    
    if (!sidebar) return;
    
    function getCurrentPage() {
        const pathname = window.location.pathname;
        const hash = window.location.hash;
        
        // Check pathname first
        if (pathname.includes('experience.html')) {
            return 'experience';
        }
        if (pathname.includes('projects.html')) {
            return 'projects';
        }
        if (pathname.includes('about.html')) {
            return 'about';
        }
        
        // Check hash (for contact section) - only if on home page
        if (hash === '#contact' && contactSection) {
            return 'contact';
        }
        
        // Default to home/index
        return 'home';
    }
    
    function updateActiveIcon() {
        const currentPage = getCurrentPage();
        
        // Remove active from all icons
        document.querySelectorAll('.sidebar-icon').forEach(icon => {
            icon.classList.remove('active');
        });
        
        // Set active based on current page
        if (currentPage === 'home' && homeIcon) {
            homeIcon.classList.add('active');
        } else if (currentPage === 'about' && aboutIcon) {
            aboutIcon.classList.add('active');
        } else if (currentPage === 'experience' && experienceIcon) {
            experienceIcon.classList.add('active');
        } else if (currentPage === 'projects' && projectsIcon) {
            projectsIcon.classList.add('active');
        } else if (currentPage === 'contact' && contactIcon) {
            contactIcon.classList.add('active');
        }
    }
    
    function updateSidebarPosition() {
        const windowHeight = window.innerHeight;
        const currentPage = getCurrentPage();
        let activeSection = null;
        
        // If on home page, check scroll position for sections
        if (currentPage === 'home' || currentPage === 'contact') {
            // Check if we have a hash (contact section)
            const hash = window.location.hash;
            if (hash === '#contact' && contactSection) {
                activeSection = 'contact';
            } else {
                // Check home section - if at top or home section is visible
                if (homeSection && homeIcon) {
                    const homeRect = homeSection.getBoundingClientRect();
                    const isHomeVisible = homeRect.top < windowHeight * 0.5 && homeRect.bottom > windowHeight * 0.3;
                    const isAtTop = window.scrollY < 100;
                    if (isHomeVisible || isAtTop) {
                        activeSection = 'home';
                    }
                }
            }
            
            // Check contact section for positioning
            if (contactSection && emailDisplay && contactIcon) {
                const contactRect = contactSection.getBoundingClientRect();
                const emailRect = emailDisplay.getBoundingClientRect();
                const contactTop = contactRect.top;
                const contactBottom = contactRect.bottom;
                const isContactVisible = contactTop < windowHeight && contactBottom > 0;
                const isContactCentered = contactTop <= windowHeight * 0.4 && contactBottom >= windowHeight * 0.6;
                
                if (isContactVisible && isContactCentered) {
                    // Align sidebar with email icon (center of email icon)
                    const emailCenter = emailRect.top + (emailRect.height / 2);
                    // Only move if email is in a reasonable position (not too high or too low)
                    if (emailCenter > 50 && emailCenter < windowHeight - 50) {
                        sidebar.style.top = emailCenter + 'px';
                        sidebar.style.transform = 'translateY(-50%)';
                    }
                } else {
                    // Reset to center if not in contact section
                    sidebar.style.top = '50%';
                    sidebar.style.transform = 'translateY(-50%)';
                }
            } else {
                // Reset to center if contact section doesn't exist
                sidebar.style.top = '50%';
                sidebar.style.transform = 'translateY(-50%)';
            }
            
            // Update active icon based on current page or scroll position
            if (activeSection === 'contact' && contactIcon) {
                document.querySelectorAll('.sidebar-icon').forEach(icon => icon.classList.remove('active'));
                contactIcon.classList.add('active');
            } else if (activeSection === 'home' && homeIcon) {
                document.querySelectorAll('.sidebar-icon').forEach(icon => icon.classList.remove('active'));
                homeIcon.classList.add('active');
            } else if (currentPage === 'home' && homeIcon && !hash) {
                // Fallback: if no hash and at top, highlight home
                document.querySelectorAll('.sidebar-icon').forEach(icon => icon.classList.remove('active'));
                homeIcon.classList.add('active');
            }
        } else {
            // On other pages, just update based on page
            updateActiveIcon();
            // Reset sidebar to center
            sidebar.style.top = '50%';
            sidebar.style.transform = 'translateY(-50%)';
        }
    }
    
    let ticking = false;
    function throttledUpdate() {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                updateSidebarPosition();
                ticking = false;
            });
            ticking = true;
        }
    }
    
    // Initial setup
    updateActiveIcon();
    updateSidebarPosition();
    
    // Update on scroll (for home page section changes)
    window.addEventListener('scroll', throttledUpdate);
    window.addEventListener('resize', throttledUpdate);
    
    // Update on hash change (for contact link)
    window.addEventListener('hashchange', () => {
        updateActiveIcon();
        updateSidebarPosition();
    });
})();
