document.addEventListener('DOMContentLoaded', () => {
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

    // 2. Dark Mode Toggle
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    const sunIcon = document.querySelector('.icon.sun');
    const moonIcon = document.querySelector('.icon.moon');

    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);

    themeToggle.addEventListener('click', () => {
        const currentTheme = body.classList.contains('dark') ? 'light' : 'dark';
        setTheme(currentTheme);
    });

    function setTheme(theme) {
        if (theme === 'dark') {
            body.classList.add('dark');
            sunIcon.style.display = 'block';
            moonIcon.style.display = 'none';
            localStorage.setItem('theme', 'dark');
        } else {
            body.classList.remove('dark');
            sunIcon.style.display = 'none';
            moonIcon.style.display = 'block';
            localStorage.setItem('theme', 'light');
        }
        // Let mermaid know theme changed if needed (would require re-render)
    }

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
});
