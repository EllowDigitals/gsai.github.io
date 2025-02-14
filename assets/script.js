document.addEventListener("DOMContentLoaded", function () {
    "use strict";

    /* ======================================
         Slider Functionality (Optimized)
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

        // Create elements using DocumentFragment
        const fragmentSlides = document.createDocumentFragment();
        const fragmentButtons = document.createDocumentFragment();

        sliderImages.forEach((image, index) => {
            const slide = document.createElement("div");
            slide.classList.add("slide");
            slide.style.backgroundImage = `url(${image})`;
            slide.style.opacity = index === 0 ? "1" : "0";
            slide.style.transition = "opacity 1s ease-in-out";
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
    } catch (err) {
        console.error("Error in slider functionality:", err);
    }

    /* ======================================
         Mobile Navigation (Optimized)
    ====================================== */
    try {
        const menuToggle = document.querySelector(".menu-toggle");
        const mobileNavList = document.querySelector(".mobile-nav .nav-list");
        const navLinks = document.querySelectorAll(".mobile-nav .nav-list .nav-link");

        if (menuToggle && mobileNavList) {
            menuToggle.addEventListener("click", () => {
                mobileNavList.classList.toggle("active");
            });

            document.addEventListener("click", (e) => {
                if (!menuToggle.contains(e.target) && !mobileNavList.contains(e.target)) {
                    mobileNavList.classList.remove("active");
                }
            });

            navLinks.forEach(link => {
                link.addEventListener("click", () => {
                    mobileNavList.classList.remove("active");
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
