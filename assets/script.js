document.addEventListener("DOMContentLoaded", function () {
    "use strict";

    /* ======================================
         Slider Functionality
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

        // Create slides and navigation buttons
        sliderImages.forEach((image, index) => {
            // Create slide element
            const slide = document.createElement("div");
            slide.classList.add("slide");
            if (index === 0) slide.classList.add("active");
            slide.style.backgroundImage = `url(${image})`;
            sliderContainer.appendChild(slide);

            // Create navigation button for each slide
            const button = document.createElement("button");
            button.setAttribute("data-index", index);
            sliderButtonsContainer.appendChild(button);
        });

        const slides = document.querySelectorAll(".slide");
        const sliderButtons = document.querySelectorAll("#slider-buttons button");

        if (slides.length === 0) {
            throw new Error("No slides were created.");
        }

        // Function to show a specific slide by index
        function showSlide(index) {
            slides.forEach((slide, idx) => {
                slide.classList.toggle("active", idx === index);
            });
            currentIndex = index;
        }

        // Automatic slide transition
        let sliderTimer = setInterval(() => {
            let nextIndex = (currentIndex + 1) % slides.length;
            showSlide(nextIndex);
        }, slideInterval);

        // Manual slide navigation
        sliderButtons.forEach((button) => {
            button.addEventListener("click", () => {
                clearInterval(sliderTimer);
                const index = parseInt(button.getAttribute("data-index"), 10);
                if (isNaN(index)) return;
                showSlide(index);
                // Restart the timer after manual navigation
                sliderTimer = setInterval(() => {
                    let nextIndex = (currentIndex + 1) % slides.length;
                    showSlide(nextIndex);
                }, slideInterval);
            });
        });
    } catch (err) {
        console.error("Error in slider functionality:", err);
    }

    /* ======================================
         Mobile Navigation
    ====================================== */
    try {
        // Use a more specific selector for mobile nav list to avoid selecting the desktop nav list
        const menuToggle = document.querySelector(".menu-toggle");
        const mobileNavList = document.querySelector(".mobile-nav .nav-list");

        if (!menuToggle || !mobileNavList) {
            console.warn("Mobile navigation elements not found.");
        } else {
            menuToggle.addEventListener("click", () => {
                mobileNavList.classList.toggle("active");
            });

            // Close the mobile menu when a navigation link is clicked
            const mobileNavLinks = document.querySelectorAll(".mobile-nav .nav-list li a");
            mobileNavLinks.forEach((link) => {
                link.addEventListener("click", () => {
                    if (mobileNavList.classList.contains("active")) {
                        mobileNavList.classList.remove("active");
                    }
                });
            });
        }
    } catch (err) {
        console.error("Error in mobile navigation:", err);
    }

    /* ======================================
         Smooth Scrolling for Anchor Links
    ====================================== */
    try {
        const anchorLinks = document.querySelectorAll('a[href^="#"]');
        anchorLinks.forEach((link) => {
            link.addEventListener("click", function (e) {
                // Get target element by id (skip links with just "#")
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
         Animate on Scroll (Section Animations)
    ====================================== */
    try {
        // Elements you want to animate on scroll should have the class .fadeInBox
        const animateElements = document.querySelectorAll(".fadeInBox");

        if (animateElements.length > 0) {
            const observerOptions = {
                threshold: 0.2, // Trigger when 20% of the element is visible
            };

            const animateOnScroll = (entries, observer) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("in-view");
                        // Optionally unobserve the element if you want the animation to run only once
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
    window.addEventListener("error", function (event) {
        console.error("Global error caught:", event.error);
    });

    /* ======================================
         Lazy Loading Check
    ====================================== */
    if ("loading" in HTMLImageElement.prototype) {
        document.querySelectorAll('img[loading="lazy"]').forEach((img) => {
            console.log("Lazy loading supported for:", img.src);
        });
    } else {
        console.log("Native lazy loading not supported. Consider adding a polyfill.");
    }
});
