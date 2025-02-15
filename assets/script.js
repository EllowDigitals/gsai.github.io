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
            "assets/images/slider.webp",
            "assets/images/slider1.webp",
            "assets/images/slider2.webp",
            "assets/images/slider3.webp",
            "assets/images/slider4.webp",
            "assets/images/slider5.webp",
            "assets/images/slider6.webp",
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
            // Create slide element
            const slide = document.createElement("div");
            slide.classList.add("slide");
            slide.style.opacity = index === 0 ? "1" : "0";
            slide.style.transition = "opacity 1s ease-in-out";

            // Preload image and set as background with a fallback
            const img = new Image();
            img.src = image;
            img.onload = () => {
                slide.style.backgroundImage = `url(${image})`;
            };
            img.onerror = () => {
                console.error("Error loading slider image:", image);
                slide.style.backgroundImage = "url(assets/images/default.jpg)";
            };

            fragmentSlides.appendChild(slide);

            // Create corresponding slider button (dot)
            const button = document.createElement("button");
            button.setAttribute("data-index", index);
            // Set active class on the first button initially
            if (index === 0) {
                button.classList.add("active");
            }
            fragmentButtons.appendChild(button);
        });

        sliderContainer.appendChild(fragmentSlides);
        sliderButtonsContainer.appendChild(fragmentButtons);

        const slides = Array.from(sliderContainer.children);
        const sliderButtons = Array.from(sliderButtonsContainer.children);

        if (slides.length === 0) {
            throw new Error("No slides were created.");
        }

        // Helper to update active class on slider buttons
        function updateSliderButtons(index) {
            sliderButtons.forEach((button, idx) => {
                if (idx === index) {
                    button.classList.add("active");
                } else {
                    button.classList.remove("active");
                }
            });
        }

        // Show slide at the specified index
        function showSlide(index) {
            slides.forEach((slide, idx) => {
                slide.style.opacity = idx === index ? "1" : "0";
            });
            currentIndex = index;
            updateSliderButtons(index);
        }

        let lastTimestamp = 0;
        function autoSlide(timestamp) {
            if (!lastTimestamp || timestamp - lastTimestamp > slideInterval) {
                const nextIndex = (currentIndex + 1) % slides.length;
                showSlide(nextIndex);
                lastTimestamp = timestamp;
            }
            requestAnimationFrame(autoSlide);
        }
        requestAnimationFrame(autoSlide);

        // Click event for slider buttons
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
                const prevIndex = (currentIndex - 1 + slides.length) % slides.length;
                showSlide(prevIndex);
                lastTimestamp = performance.now();
            } else if (e.key === "ArrowRight") {
                const nextIndex = (currentIndex + 1) % slides.length;
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
                const touchEndX = e.changedTouches[0].screenX;
                if (touchEndX - touchStartX > 50) {
                    // Swipe right
                    const prevIndex = (currentIndex - 1 + slides.length) % slides.length;
                    showSlide(prevIndex);
                    lastTimestamp = performance.now();
                } else if (touchStartX - touchEndX > 50) {
                    // Swipe left
                    const nextIndex = (currentIndex + 1) % slides.length;
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
        const navLinks = document.querySelectorAll(
            ".mobile-nav .nav-list .nav-link"
        );

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

            // Close mobile nav when clicking outside of it
            document.addEventListener("click", (e) => {
                if (!menuToggle.contains(e.target) && !mobileNav.contains(e.target)) {
                    mobileNav.classList.remove("active");
                }
            });

            // Close mobile nav on link click
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

            const observer = new IntersectionObserver(
                animateOnScroll,
                observerOptions
            );
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
        console.log(
            "Native lazy loading not supported. Consider adding a polyfill."
        );
    }
});

document
    .querySelector(".enroll-form")
    .addEventListener("submit", function (event) {
        let phoneInput = document.getElementById("enroll-phone").value.trim();
        let emailInput = document.getElementById("enroll-email").value.trim();

        // Regular expression for validating phone numbers
        let phoneRegex =
            /^\+?\d{1,4}?[-.\s]?\(?\d{2,3}\)?[-.\s]?\d{3,4}[-.\s]?\d{4}$/;

        // Check if the phone number matches the pattern
        if (!phoneRegex.test(phoneInput)) {
            alert(
                "Please enter a valid phone number with a country code, totaling around 10 digits."
            );
            event.preventDefault(); // Prevent form submission
            return;
        }

        // Further check if the number is within range (10-14 digits including country code)
        let digitsOnly = phoneInput.replace(/\D/g, ""); // Remove non-digit characters
        if (digitsOnly.length < 10 || digitsOnly.length > 14) {
            alert(
                "Phone number must be between 10 and 14 digits including country code."
            );
            event.preventDefault();
            return;
        }

        // Regular expression for validating Gmail addresses
        let gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

        // Check if the email is a valid Gmail address
        if (!gmailRegex.test(emailInput)) {
            alert("Please enter a valid Gmail address (example@gmail.com).");
            event.preventDefault(); // Prevent form submission
        }
    });
