document.addEventListener('DOMContentLoaded', () => {
    // 1. Dark Mode Toggle
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    const sunIcon = document.querySelector('.icon.sun');
    const moonIcon = document.querySelector('.icon.moon');

    // Check for saved theme or system preference
    const savedTheme = localStorage.getItem('theme');
    
    // Default to dark since user requested dark mode/sleek grays specifically
    if (savedTheme === 'light') {
        setTheme('light');
    } else {
        setTheme('dark');
    }

    themeToggle.addEventListener('click', () => {
        if (body.classList.contains('dark')) {
            setTheme('light');
        } else {
            setTheme('dark');
        }
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
    }

    // 2. Reading Progress Bar
    const progressBar = document.getElementById('progress-bar');
    
    window.addEventListener('scroll', () => {
        // Calculate scroll percentage
        const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrollPercentage = (scrollTop / scrollHeight) * 100;
        
        progressBar.style.width = scrollPercentage + '%';
    });

    // 3. Dynamic Table of Contents (Intersection Observer)
    const tocLinks = document.querySelectorAll('#toc a');
    const sections = Array.from(tocLinks).map(link => {
        const id = link.getAttribute('href').substring(1);
        return document.getElementById(id);
    }).filter(section => section !== null);

    const observerOptions = {
        root: null,
        rootMargin: '-100px 0px -60% 0px', // Trigger when section is near the top
        threshold: 0
    };

    const observerCallback = (entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Remove active class from all links
                tocLinks.forEach(link => link.classList.remove('active'));
                
                // Add active class to corresponding link
                const activeLink = document.querySelector(`#toc a[href="#${entry.target.id}"]`);
                if (activeLink) {
                    activeLink.classList.add('active');
                }
            }
        });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    sections.forEach(section => observer.observe(section));
});
