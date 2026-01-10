// Smooth scrolling for navigation links
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

// Interactive dots background
(function() {
    const canvas = document.getElementById('dotsCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const hero = document.querySelector('.hero');
    
    let mouseX = 0;
    let mouseY = 0;
    let dots = [];
    
    // Set canvas size
    function resizeCanvas() {
        canvas.width = hero.offsetWidth;
        canvas.height = hero.offsetHeight;
        initDots();
    }
    
    // Initialize dots
    function initDots() {
        dots = [];
        const spacing = 50;
        const rows = Math.ceil(canvas.height / spacing);
        const cols = Math.ceil(canvas.width / spacing);
        
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                dots.push({
                    x: j * spacing + (spacing / 2),
                    y: i * spacing + (spacing / 2),
                    baseSize: 2,
                    currentSize: 2,
                    baseColor: { r: 100, g: 100, b: 100 },
                    currentColor: { r: 100, g: 100, b: 100 }
                });
            }
        }
        drawDots();
    }
    
    // Draw all dots
    function drawDots() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        dots.forEach(dot => {
            // Calculate distance from mouse
            const dx = mouseX - dot.x;
            const dy = mouseY - dot.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const maxDistance = 150;
            
            // Calculate size based on proximity to mouse
            if (distance < maxDistance) {
                const influence = 1 - (distance / maxDistance);
                dot.currentSize = dot.baseSize + (influence * 4);
                
                // Change color based on proximity (from grey to a lighter color)
                const colorIntensity = influence;
                dot.currentColor = {
                    r: 100 + (colorIntensity * 155),
                    g: 150 + (colorIntensity * 105),
                    b: 200 + (colorIntensity * 55)
                };
            } else {
                // Return to base size and color smoothly
                dot.currentSize += (dot.baseSize - dot.currentSize) * 0.1;
                dot.currentColor.r += (100 - dot.currentColor.r) * 0.1;
                dot.currentColor.g += (100 - dot.currentColor.g) * 0.1;
                dot.currentColor.b += (100 - dot.currentColor.b) * 0.1;
            }
            
            // Draw dot
            ctx.beginPath();
            ctx.arc(dot.x, dot.y, dot.currentSize, 0, Math.PI * 2);
            ctx.fillStyle = `rgb(${Math.round(dot.currentColor.r)}, ${Math.round(dot.currentColor.g)}, ${Math.round(dot.currentColor.b)})`;
            ctx.fill();
        });
        
        requestAnimationFrame(drawDots);
    }
    
    // Track mouse movement
    hero.addEventListener('mousemove', (e) => {
        const rect = hero.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
    });
    
    // Handle mouse leave
    hero.addEventListener('mouseleave', () => {
        mouseX = -1000;
        mouseY = -1000;
    });
    
    // Initialize on load
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
})();
