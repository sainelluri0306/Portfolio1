// Sidebar icon click handlers
document.querySelectorAll('.sidebar-icon').forEach(icon => {
    icon.addEventListener('click', function (e) {
        e.preventDefault();
        
        // Remove active class from all icons
        document.querySelectorAll('.sidebar-icon').forEach(i => i.classList.remove('active'));
        
        // Add active class to clicked icon
        this.classList.add('active');
        
        // Get the section to scroll to
        const sectionId = this.getAttribute('data-section') || this.getAttribute('href').substring(1);
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
        section.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
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

// Interactive dots background - Full page with wrap effect
(function() {
    const canvas = document.getElementById('dotsCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    let mouseX = -1000;
    let mouseY = -1000;
    let dots = [];
    let animationId = null;
    
    // Single color scheme (primary color variations) - matching menu bar highlight
    const primaryColor = { r: 99, g: 102, b: 241 }; // #6366f1 (primary-color - menu bar highlight)
    const darkColor = { r: 40, g: 40, b: 40 }; // Very dark base
    
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
    
    // Initialize dots - exclude sidebar area only
    function initDots() {
        dots = [];
        const spacing = 40;
        const sidebarBounds = getSidebarBounds();
        const rows = Math.ceil(canvas.height / spacing);
        const cols = Math.ceil(canvas.width / spacing);
        
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                const x = j * spacing + (spacing / 2);
                const y = i * spacing + (spacing / 2);
                
                // Skip dots ONLY in the exact sidebar area (tight bounds)
                if (x >= sidebarBounds.left && x <= sidebarBounds.right &&
                    y >= sidebarBounds.top && y <= sidebarBounds.bottom) {
                    continue;
                }
                
                dots.push({
                    x: x,
                    y: y,
                    baseSize: 0.4,
                    currentSize: 0.4,
                    targetSize: 0.4,
                    baseColor: { ...darkColor },
                    currentColor: { ...darkColor },
                    targetColor: { ...darkColor },
                    waveOffset: Math.random() * Math.PI * 2
                });
            }
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
    
    // Draw all dots with smooth flow and torch effect
    function drawDots() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const maxDistance = 250;
        const time = Date.now() * 0.001;
        
        // Draw torch glow effect with primary color (menu bar highlight)
        if (mouseX >= 0 && mouseY >= 0) {
            const gradient = ctx.createRadialGradient(
                mouseX, mouseY, 0,
                mouseX, mouseY, 300
            );
            
            // Torch effect with primary color matching menu bar highlight
            gradient.addColorStop(0, `rgba(${primaryColor.r}, ${primaryColor.g}, ${primaryColor.b}, 0.35)`);
            gradient.addColorStop(0.2, `rgba(${primaryColor.r}, ${primaryColor.g}, ${primaryColor.b}, 0.2)`);
            gradient.addColorStop(0.5, `rgba(${primaryColor.r}, ${primaryColor.g}, ${primaryColor.b}, 0.1)`);
            gradient.addColorStop(0.8, `rgba(${primaryColor.r}, ${primaryColor.g}, ${primaryColor.b}, 0.03)`);
            gradient.addColorStop(1, 'rgba(99, 102, 241, 0)');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(mouseX - 300, mouseY - 300, 600, 600);
        }
        
        dots.forEach(dot => {
            // Calculate distance from mouse
            const dx = mouseX - dot.x;
            const dy = mouseY - dot.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < maxDistance) {
                // Wrap effect using wave function
                const waveOffset = dot.waveOffset + time * 2;
                const influence = waveEffect(distance, maxDistance, waveOffset);
                
                // Smaller enlargement (reduced from 5 to 2.5)
                dot.targetSize = 0.4 + (influence * 2.5);
                
                // Use primary color (menu bar highlight) for torch effect
                dot.targetColor = {
                    r: darkColor.r + (primaryColor.r - darkColor.r) * influence,
                    g: darkColor.g + (primaryColor.g - darkColor.g) * influence,
                    b: darkColor.b + (primaryColor.b - darkColor.b) * influence
                };
            } else {
                // Return to base smoothly with easing
                dot.targetSize = 0.4;
                dot.targetColor = { ...darkColor };
            }
            
            // Smooth interpolation for fluid animation
            const ease = 0.15;
            dot.currentSize += (dot.targetSize - dot.currentSize) * ease;
            dot.currentColor.r += (dot.targetColor.r - dot.currentColor.r) * ease;
            dot.currentColor.g += (dot.targetColor.g - dot.currentColor.g) * ease;
            dot.currentColor.b += (dot.targetColor.b - dot.currentColor.b) * ease;
            
            // Draw dot with glow effect
            const glowRadius = dot.currentSize * 2;
            const glowGradient = ctx.createRadialGradient(
                dot.x, dot.y, 0,
                dot.x, dot.y, glowRadius
            );
            glowGradient.addColorStop(0, `rgba(${Math.round(dot.currentColor.r)}, ${Math.round(dot.currentColor.g)}, ${Math.round(dot.currentColor.b)}, 0.8)`);
            glowGradient.addColorStop(0.5, `rgba(${Math.round(dot.currentColor.r)}, ${Math.round(dot.currentColor.g)}, ${Math.round(dot.currentColor.b)}, 0.4)`);
            glowGradient.addColorStop(1, `rgba(${Math.round(dot.currentColor.r)}, ${Math.round(dot.currentColor.g)}, ${Math.round(dot.currentColor.b)}, 0)`);
            
            // Draw glow
            ctx.beginPath();
            ctx.arc(dot.x, dot.y, glowRadius, 0, Math.PI * 2);
            ctx.fillStyle = glowGradient;
            ctx.fill();
            
            // Draw dot
            ctx.beginPath();
            ctx.arc(dot.x, dot.y, dot.currentSize, 0, Math.PI * 2);
            ctx.fillStyle = `rgb(${Math.round(dot.currentColor.r)}, ${Math.round(dot.currentColor.g)}, ${Math.round(dot.currentColor.b)})`;
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
