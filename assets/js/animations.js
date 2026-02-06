document.addEventListener("DOMContentLoaded", (event) => {
    gsap.registerPlugin(ScrollTrigger);

    // 1. Identify Grid Items (Features, Portfolio, Services, News, Reviews)
    // We want these to stagger nicely.
    const gridSelectors = [
        '.features-grid', 
        '.portfolio-grid', 
        '.services-grid', 
        '.news-grid', 
        '.testimonials-grid'
    ];

    const gridItems = new Set();

    gridSelectors.forEach(selector => {
        const grid = document.querySelector(selector);
        if (grid) {
            const children = Array.from(grid.children);
            children.forEach(child => gridItems.add(child));

            // Create Staggered Batch for this Grid
            ScrollTrigger.batch(children, {
                bind: true, // Listen for resize/refresh
                onEnter: batch => gsap.to(batch, {
                    autoAlpha: 1, // Handles opacity + visibility
                    y: 0,
                    stagger: 0.15,
                    duration: 0.8,
                    ease: "power3.out",
                    overwrite: true
                }),
                start: "top 85%"
            });
            
            // Set initial state for these immediately
            gsap.set(children, { y: 50, autoAlpha: 0 });
        }
    });

    // 2. Process General Reveal Elements (Excluding those we already handled in grids)
    const revealElements = document.querySelectorAll('.reveal');
    
    revealElements.forEach((element) => {
        if (!gridItems.has(element)) {
            gsap.fromTo(element, 
                { 
                    y: 50, 
                    autoAlpha: 0 
                },
                {
                    y: 0,
                    autoAlpha: 1,
                    duration: 1,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: element,
                        start: "top 85%",
                        toggleActions: "play none none reverse"
                    }
                }
            );
        }
    });

    // 3. Process Blur Reveal Elements
    const blurElements = document.querySelectorAll('.blur-reveal');
    blurElements.forEach((element) => {
        gsap.fromTo(element, 
            {
                filter: "blur(10px)",
                autoAlpha: 0,
                y: 20
            },
            {
                filter: "blur(0px)",
                autoAlpha: 1,
                y: 0,
                duration: 1.2,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: element,
                    start: "top 90%",
                    toggleActions: "play none none reverse"
                }
            }
        );
    });

    // 4. Camera Rotation
    gsap.to(".rotating", {
        rotation: 360,
        duration: 10,
        repeat: -1,
        ease: "linear"
    });

    // 5. CTA Marquee (Infinite Loop)
    const marqueeContent = document.querySelector('.marquee-content');
    if (marqueeContent) {
        // Move by -33.333% (one set of images out of 3 total sets)
        // This assumes we have 3 identical sets of images.
        gsap.to(marqueeContent, {
            xPercent: -33.33333,
            repeat: -1,
            duration: 15, // Adjust speed as needed
            ease: "linear"
        });
    }
});
