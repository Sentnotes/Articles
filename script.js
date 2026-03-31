const initApp = () => {
    // 0. Splash Screen Logic
    const splashScreen = document.getElementById('splash-screen');
    if (splashScreen) {
        // Wait for snappier typing animation to complete (0.5s delay + 2s typing + 0.5s pause = 3.0s)
        setTimeout(() => {
            splashScreen.classList.add('fade-out');
            document.body.classList.remove('splash-active');
            
            // Wait for 0.8s fade to finish before removing from flow completely
            setTimeout(() => {
                splashScreen.style.display = 'none';
            }, 800);
        }, 3000);
    }

    // 1. Navbar Node Highway (Bi-Directional)
    class NodeHighway {
        constructor() {
            this.canvas = document.getElementById('node-highway');
            if (!this.canvas) return;
            this.ctx = this.canvas.getContext('2d');
            this.nodes = [];
            this.nodeCount = 50;
            
            this.init();
            this.animate();
            
            window.addEventListener('resize', () => this.resize());
        }

        init() {
            this.resize();
            this.nodes = [];
            for (let i = 0; i < this.nodeCount; i++) {
                const direction = Math.random() > 0.5 ? 1 : -1;
                this.nodes.push({
                    x: Math.random() * this.canvas.width,
                    y: Math.random() * this.canvas.height,
                    vx: direction * (Math.random() * 2 + 1), // Fast but suitable for small bar
                    vy: (Math.random() - 0.5) * 0.2,
                    size: Math.random() * 1.5 + 0.5,
                    color: direction > 0 ? '45, 212, 191' : '129, 140, 248',
                });
            }
        }

        resize() {
            const wrapper = this.canvas.parentElement;
            this.canvas.width = wrapper.clientWidth;
            this.canvas.height = wrapper.clientHeight;
        }

        draw() {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.nodes.forEach((node, i) => {
                node.x += node.vx;
                node.y += node.vy;

                // Boundary Wrap
                if (node.x < -50) node.x = this.canvas.width + 50;
                if (node.x > this.canvas.width + 50) node.x = -50;
                if (node.y < 0 || node.y > this.canvas.height) node.vy *= -1;

                // Draw Node
                this.ctx.beginPath();
                this.ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
                this.ctx.fillStyle = `rgba(${node.color}, 0.5)`;
                this.ctx.fill();

                // Simple connections
                for (let j = i + 1; j < this.nodes.length; j++) {
                    const other = this.nodes[j];
                    const dx = node.x - other.x;
                    const dy = node.y - other.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 60) {
                        this.ctx.beginPath();
                        this.ctx.moveTo(node.x, node.y);
                        this.ctx.lineTo(other.x, other.y);
                        this.ctx.strokeStyle = `rgba(${node.color}, 0.1)`;
                        this.ctx.stroke();
                    }
                }
            });
        }

        animate() {
            this.draw();
            requestAnimationFrame(() => this.animate());
        }
    }

    new NodeHighway();

    // 2. Dark Mode Toggle — Blur Dissolve
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    const sunIcon = document.querySelector('.icon.sun');
    const moonIcon = document.querySelector('.icon.moon');
    let isTransitioning = false;

    function applyTheme(theme) {
        if (theme === 'dark') {
            body.classList.add('dark');
            sunIcon.style.display = 'block';
            moonIcon.style.display = 'none';
        } else {
            body.classList.remove('dark');
            sunIcon.style.display = 'none';
            moonIcon.style.display = 'block';
        }
        localStorage.setItem('theme', theme);
    }

    function triggerDissolve(targetTheme) {
        if (isTransitioning) return;
        isTransitioning = true;

        const pageContent = document.getElementById('page-content');
        const dispMap = document.getElementById('liquid-disp');
        const duration = 900;
        const start = performance.now();

        // Apply filter directly to page-content
        pageContent.style.filter = 'url(#liquid-distort)';
        pageContent.classList.add('theme-dissolving');

        function animateWave(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);

            const eased = progress < 0.5
                ? 2 * progress * progress
                : 1 - Math.pow(-2 * progress + 2, 2) / 2;
            const wave = Math.sin(eased * Math.PI);
            const scale = wave * 30; // maximum displacement
            if (dispMap) dispMap.setAttribute('scale', scale);

            if (progress < 1) {
                requestAnimationFrame(animateWave);
            } else {
                if (dispMap) dispMap.setAttribute('scale', 0);
                pageContent.style.filter = '';
                pageContent.classList.remove('theme-dissolving');
                isTransitioning = false;
            }
        }

        requestAnimationFrame(animateWave);

        // Switch theme at the visual midpoint of the wave
        setTimeout(() => applyTheme(targetTheme), 450);
    }



    const savedTheme = localStorage.getItem('theme') || 'dark';
    applyTheme(savedTheme);

    themeToggle.addEventListener('click', () => {
        const targetTheme = body.classList.contains('dark') ? 'light' : 'dark';
        triggerDissolve(targetTheme);
    });



    // 3. Reading Progress Bar
    const progressBar = document.getElementById('progress-bar');
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrollPercentage = (scrollTop / scrollHeight) * 100;
        progressBar.style.width = scrollPercentage + '%';
    });

    // 4. Content Reveals (Intersection Observer)
    const revealOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                revealObserver.unobserve(entry.target);
            }
        });
    }, revealOptions);

    document.querySelectorAll('[data-reveal]').forEach(el => revealObserver.observe(el));

    // 5. Dynamic Table of Contents (Intersection Observer)
    const tocLinks = document.querySelectorAll('#toc a');
    const sections = Array.from(tocLinks).map(link => {
        const id = link.getAttribute('href').substring(1);
        return document.getElementById(id);
    }).filter(section => section !== null);

    const tocObserverOptions = {
        rootMargin: '-100px 0px -70% 0px',
        threshold: 0
    };

    const tocObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                tocLinks.forEach(link => link.classList.remove('active'));
                const activeLink = document.querySelector(`#toc a[href="#${entry.target.id}"]`);
                if (activeLink) activeLink.classList.add('active');
            }
        });
    }, tocObserverOptions);

    sections.forEach(section => tocObserver.observe(section));

    // 6. Diagram Data Flow Animation (Figure 1)
    function initDiagramAnimation() {
        const mermaidContainer = document.querySelector('.mermaid');
        if (!mermaidContainer) return;

        // Configuration
        const PULSE_SPEED = 0.0015; // Methodical moderate speed
        const PULSES_PER_PATH = 2;
        const pulses = [];

        function createPulses() {
            const svg = mermaidContainer.querySelector('svg');
            if (!svg) return;

            // Ensure we don't duplicate pulses if called twice
            if (svg.querySelector('.data-pulse')) return;

            const paths = svg.querySelectorAll('.edgePath path');
            if (paths.length === 0) {
                // If paths aren't ready yet, try again shortly
                setTimeout(createPulses, 500);
                return;
            }

            paths.forEach((path, pathIdx) => {
                const length = path.getTotalLength();
                // Alternating colors based on path index or context
                const color = pathIdx % 2 === 0 ? 'var(--accent-teal)' : 'var(--accent-indigo)';

                for (let i = 0; i < PULSES_PER_PATH; i++) {
                    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                    circle.setAttribute('r', '3');
                    circle.setAttribute('class', 'data-pulse');
                    circle.style.fill = color;
                    svg.appendChild(circle);

                    pulses.push({
                        element: circle,
                        path: path,
                        length: length,
                        progress: (i / PULSES_PER_PATH),
                        active: false
                    });
                }
            });
            
            function animate() {
                pulses.forEach(pulse => {
                    pulse.progress += PULSE_SPEED;
                    if (pulse.progress > 1) pulse.progress = 0;

                    const point = pulse.path.getPointAtLength(pulse.progress * pulse.length);
                    pulse.element.setAttribute('cx', point.x);
                    pulse.element.setAttribute('cy', point.y);

                    // Fade in/out logic
                    if (pulse.progress > 0.1 && pulse.progress < 0.9) {
                        pulse.element.classList.add('active');
                    } else {
                        pulse.element.classList.remove('active');
                    }
                });
                requestAnimationFrame(animate);
            }
            animate();
        }

        // Robust initialization
        if (mermaidContainer.querySelector('svg')) {
            setTimeout(createPulses, 1000);
        } else {
            const observer = new MutationObserver((mutations) => {
                if (mermaidContainer.querySelector('svg')) {
                    observer.disconnect();
                    setTimeout(createPulses, 1000);
                }
            });
            observer.observe(mermaidContainer, { childList: true });
        }
    }

    initDiagramAnimation();

    // 3. Data Harmonization Scanner (Pretext Visualization)
    class DataHarmonizer {
        constructor() {
            this.canvas = document.getElementById('data-harmonizer');
            if (!this.canvas) return;
            this.ctx = this.canvas.getContext('2d');
            
            const rawText = "Patient 45y male presents with acute cephalgia. History of HTN. Meds: Lisinopril 10mg. BP 145/90. Labs WNL. Fragmented note from specialist: MRI negative, possible tension vs migraine. Unstructured clinical events frequently obscure longitudinal patterns. Patient states symptoms worsen evening. Need to synthesize multi-source fragments into structured representation. Validated via Popperian constraints: evidence must be falsifiable and traceable. ";
            
            this.words = rawText.repeat(8).split(' ').map(word => ({
                text: word, x: 0, y: 0, targetX: 0, targetY: 0, width: 0
            }));
            
            this.mouseX = -1000;
            this.mouseY = -1000;
            this.radius = 110;
            this.pretextEngine = null;
            
            window.addEventListener('resize', () => this.resize());
            this.canvas.addEventListener('mousemove', (e) => {
                const rect = this.canvas.getBoundingClientRect();
                this.mouseX = e.clientX - rect.left;
                this.mouseY = e.clientY - rect.top;
            });
            this.canvas.addEventListener('mouseleave', () => {
                this.mouseX = -1000;
                this.mouseY = -1000;
            });
            
            // Mobile Touch Support
            const handleTouch = (e) => {
                if (e.touches.length > 0) {
                    const rect = this.canvas.getBoundingClientRect();
                    this.mouseX = e.touches[0].clientX - rect.left;
                    this.mouseY = e.touches[0].clientY - rect.top;
                }
            };
            this.canvas.addEventListener('touchstart', handleTouch, {passive: true});
            this.canvas.addEventListener('touchmove', handleTouch, {passive: true});
            this.canvas.addEventListener('touchend', () => {
                this.mouseX = -1000;
                this.mouseY = -1000;
            });
            
            this.init();
        }
        
        async init() {
            this.resize();
            try {
                // Dynamically import Pretext JS for high-performance layout/measurement
                this.pretextEngine = await import('https://esm.sh/@chenglou/pretext');
                console.log("Pretext JS loaded successfully for Data Harmonization Scanner.");
            } catch (e) {
                console.warn("Pretext CDN unavailable. Using native Canvas fallback.", e);
            }
            
            this.calculateMetrics();
            this.layout();
            this.animate();
        }
        
        resize() {
            const parent = this.canvas.parentElement;
            this.canvas.width = parent.clientWidth * window.devicePixelRatio;
            this.canvas.height = parent.clientHeight * window.devicePixelRatio;
            this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
            this.width = parent.clientWidth;
            this.height = parent.clientHeight;
            if (this.words.length > 0) this.layout();
        }
        
        calculateMetrics() {
            this.ctx.font = '15px Inter, sans-serif';
            // Utilize Pretext engine for off-DOM measurement if available
            this.words.forEach(w => {
                if (this.pretextEngine && this.pretextEngine.measureText) {
                    w.width = this.pretextEngine.measureText(w.text, '15px Inter').width;
                } else {
                    w.width = this.ctx.measureText(w.text + ' ').width; // Native fallback
                }
            });
        }
        
        layout() {
            const lineHeight = 28;
            let startX = 30;
            let startY = 40;
            
            this.words.forEach(w => {
                if (startX + w.width > this.width - 30) {
                    startX = 30;
                    startY += lineHeight;
                }
                w.targetX = startX;
                w.targetY = startY;
                
                if (w.fragmentX === undefined) {
                    w.fragmentX = Math.random() * this.width;
                    w.fragmentY = Math.random() * this.height;
                }
                
                if (w.x === 0 && w.y === 0) {
                    w.x = w.fragmentX;
                    w.y = w.fragmentY;
                }
                startX += w.width;
            });
        }
        
        animate() {
            this.ctx.clearRect(0, 0, this.width, this.height);
            this.ctx.font = '15px Inter, sans-serif';
            this.ctx.textBaseline = 'middle';
            
            const isDarkMode = document.body.classList.contains('dark');
            const defaultColor = isDarkMode ? 'rgba(148, 163, 184, 0.3)' : 'rgba(71, 85, 105, 0.3)';
            const activeColor = isDarkMode ? '#2dd4bf' : '#111827'; // Teal (dark mode), Navy/Black (light mode)

            this.words.forEach(w => {
                const dx = w.targetX + (w.width/2) - this.mouseX;
                const dy = w.targetY - this.mouseY;
                const dist = Math.sqrt(dx*dx + dy*dy);
                
                let drawX, drawY;
                let isStructured = false;
                
                if (dist < this.radius) {
                    // Structure the information logically inside the scanner radius
                    drawX = w.targetX;
                    drawY = w.targetY;
                    isStructured = true;
                } else {
                    // Maintain epistemic fragmentation outside
                    drawX = w.fragmentX;
                    drawY = w.fragmentY;
                    
                    // Simple chaotic drift
                    w.fragmentX += (Math.random() - 0.5) * 0.4;
                    w.fragmentY += (Math.random() - 0.5) * 0.4;
                }
                
                // Spring physics targeting proper location
                w.x += (drawX - w.x) * 0.15;
                w.y += (drawY - w.y) * 0.15;
                
                this.ctx.fillStyle = isStructured ? activeColor : defaultColor;
                this.ctx.fillText(w.text, w.x, w.y);
            });
            
            if (this.mouseX > 0) {
                this.ctx.beginPath();
                this.ctx.arc(this.mouseX, this.mouseY, this.radius, 0, Math.PI * 2);
                this.ctx.strokeStyle = activeColor;
                this.ctx.lineWidth = 1;
                this.ctx.setLineDash([4, 4]);
                this.ctx.stroke();
                this.ctx.setLineDash([]); // reset
            }
            requestAnimationFrame(() => this.animate());
        }
    }
    new DataHarmonizer();

};

if (document.readyState === 'loading') {    
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
