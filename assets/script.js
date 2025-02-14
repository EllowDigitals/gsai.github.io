document.addEventListener("DOMContentLoaded", function () {
    "use strict";

    /* ======================================
         Global Page Fade‑in Animation
    ====================================== */
    document.body.style.opacity = 0;
    document.body.style.transition = "opacity 1s ease-in-out";
    requestAnimationFrame(() => {
        document.body.style.opacity = 1;
    });

    /* ======================================
         Slider Functionality (Enhanced)
    ====================================== */
    try {
        const sliderImages = [
            "assets/images/slider.jpg",
            "assets/images/slider1.jpg",
            "assets/images/slider2.jpg",
            "assets/images/slider3.jpg",
            "assets/images/slider4.jpg",
            "assets/images/slider5.jpg",
            "assets/images/slider6.jpg",
        ];

        const sliderContainer = document.getElementById("slider");
        const sliderButtonsContainer = document.getElementById("slider-buttons");

        if (!sliderContainer || !sliderButtonsContainer) {
            throw new Error("Slider container elements not found.");
        }

        let currentIndex = 0;
        const slideInterval = 5000; // 5 seconds

        // Create DocumentFragments for performance
        const fragmentSlides = document.createDocumentFragment();
        const fragmentButtons = document.createDocumentFragment();

        sliderImages.forEach((image, index) => {
            const slide = document.createElement("div");
            slide.classList.add("slide");
            slide.style.opacity = index === 0 ? "1" : "0";
            slide.style.transition = "opacity 1s ease-in-out";

            // Preload image and set background image with a fallback
            const img = new Image();
            img.src = image;
            img.onload = () => {
                slide.style.backgroundImage = `url(${image})`;
            };
            img.onerror = () => {
                console.error("Error loading slider image:", image);
                slide.style.backgroundImage = `url(assets/images/default.jpg)`;
            };

            fragmentSlides.appendChild(slide);

            const button = document.createElement("button");
            button.setAttribute("data-index", index);
            fragmentButtons.appendChild(button);
        });

        sliderContainer.appendChild(fragmentSlides);
        sliderButtonsContainer.appendChild(fragmentButtons);

        const slides = Array.from(sliderContainer.children);
        const sliderButtons = Array.from(sliderButtonsContainer.children);

        if (slides.length === 0) {
            throw new Error("No slides were created.");
        }

        function showSlide(index) {
            slides.forEach((slide, idx) => {
                slide.style.opacity = idx === index ? "1" : "0";
            });
            currentIndex = index;
        }

        let lastTimestamp = 0;
        function autoSlide(timestamp) {
            if (!lastTimestamp || timestamp - lastTimestamp > slideInterval) {
                let nextIndex = (currentIndex + 1) % slides.length;
                showSlide(nextIndex);
                lastTimestamp = timestamp;
            }
            requestAnimationFrame(autoSlide);
        }
        requestAnimationFrame(autoSlide);

        sliderButtons.forEach((button) => {
            button.addEventListener("click", () => {
                const index = parseInt(button.getAttribute("data-index"), 10);
                if (!isNaN(index)) {
                    showSlide(index);
                    lastTimestamp = performance.now();
                }
            });
        });

        // Keyboard navigation for slider (Left/Right arrow keys)
        document.addEventListener("keydown", (e) => {
            if (e.key === "ArrowLeft") {
                let prevIndex = (currentIndex - 1 + slides.length) % slides.length;
                showSlide(prevIndex);
                lastTimestamp = performance.now();
            } else if (e.key === "ArrowRight") {
                let nextIndex = (currentIndex + 1) % slides.length;
                showSlide(nextIndex);
                lastTimestamp = performance.now();
            }
        });

        // Touch swipe support for mobile devices
        let touchStartX = null;
        sliderContainer.addEventListener("touchstart", (e) => {
            touchStartX = e.changedTouches[0].screenX;
        });
        sliderContainer.addEventListener("touchend", (e) => {
            if (touchStartX !== null) {
                let touchEndX = e.changedTouches[0].screenX;
                if (touchEndX - touchStartX > 50) {
                    // Swipe right
                    let prevIndex = (currentIndex - 1 + slides.length) % slides.length;
                    showSlide(prevIndex);
                    lastTimestamp = performance.now();
                } else if (touchStartX - touchEndX > 50) {
                    // Swipe left
                    let nextIndex = (currentIndex + 1) % slides.length;
                    showSlide(nextIndex);
                    lastTimestamp = performance.now();
                }
            }
            touchStartX = null;
        });
    } catch (err) {
        console.error("Error in slider functionality:", err);
    }

    /* ======================================
         Mobile Navigation (Enhanced)
    ====================================== */
    try {
        const menuToggle = document.querySelector(".menu-toggle");
        const mobileNav = document.querySelector(".mobile-nav");
        const navLinks = document.querySelectorAll(".mobile-nav .nav-list .nav-link");

        if (menuToggle && mobileNav) {
            menuToggle.addEventListener("click", () => {
                mobileNav.classList.toggle("active");
            });

            // Keyboard support for menu toggle (Enter or Space)
            menuToggle.addEventListener("keydown", (e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    mobileNav.classList.toggle("active");
                }
            });

            document.addEventListener("click", (e) => {
                if (!menuToggle.contains(e.target) && !mobileNav.contains(e.target)) {
                    mobileNav.classList.remove("active");
                }
            });

            navLinks.forEach((link) => {
                link.addEventListener("click", () => {
                    mobileNav.classList.remove("active");
                });
            });
        } else {
            console.warn("Mobile navigation elements not found.");
        }
    } catch (err) {
        console.error("Error in mobile navigation:", err);
    }

    /* ======================================
         Smooth Scrolling (Optimized)
    ====================================== */
    try {
        document.querySelectorAll('a[href^="#"]').forEach((link) => {
            link.addEventListener("click", function (e) {
                const targetId = this.getAttribute("href").substring(1);
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    e.preventDefault();
                    targetElement.scrollIntoView({ behavior: "smooth" });
                }
            });
        });
    } catch (err) {
        console.error("Error in smooth scrolling:", err);
    }

    /* ======================================
         Animate on Scroll (Optimized)
    ====================================== */
    try {
        const animateElements = document.querySelectorAll(".fadeInBox");

        if (animateElements.length > 0) {
            const observerOptions = { threshold: 0.2 };

            const animateOnScroll = (entries, observer) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("in-view");
                        observer.unobserve(entry.target);
                    }
                });
            };

            const observer = new IntersectionObserver(animateOnScroll, observerOptions);
            animateElements.forEach((el) => observer.observe(el));
        }
    } catch (err) {
        console.error("Error in animate on scroll:", err);
    }

    /* ======================================
         Global Error Handling
    ====================================== */
    window.addEventListener("error", (event) => {
        console.error("Global error caught:", event.error);
    });

    window.addEventListener("unhandledrejection", (event) => {
        console.error("Unhandled promise rejection:", event.reason);
    });

    /* ======================================
         Lazy Loading Support Check
    ====================================== */
    if ("loading" in HTMLImageElement.prototype) {
        document.querySelectorAll('img[loading="lazy"]').forEach((img) => {
            console.log("Lazy loading supported for:", img.src);
        });
    } else {
        console.log("Native lazy loading not supported. Consider adding a polyfill.");
    }
});
