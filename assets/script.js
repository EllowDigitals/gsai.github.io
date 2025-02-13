document.addEventListener("DOMContentLoaded", function () {
    "use strict";

    /* ======================
         Slider Functionality
      ====================== */
    try {
        const sliderImages = [
            "assets/images/slider1.jpg",
            "assets/images/slider5.jpg",
            "assets/images/slider4.jpg",
            "assets/images/slider2.jpg",
            "assets/images/slider3.jpg",
            "assets/images/slider6.jpg",
        ];

        const sliderContainer = document.getElementById("slider");
        const sliderButtonsContainer = document.getElementById("slider-buttons");

        if (!sliderContainer || !sliderButtonsContainer) {
            throw new Error("Slider container elements not found.");
        }

        let currentIndex = 0;
        const slideInterval = 5000; // 5 seconds

        // Create slider slides and corresponding navigation buttons
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
                let index = parseInt(button.getAttribute("data-index"), 10);
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

    /* ======================
         Mobile Navigation
      ====================== */
    try {
        const menuToggle = document.querySelector(".menu-toggle");
        const navList = document.querySelector(".nav-list");

        if (!menuToggle || !navList) {
            console.warn("Mobile navigation elements not found.");
        } else {
            menuToggle.addEventListener("click", () => {
                navList.classList.toggle("active");
            });

            // Close the mobile menu when a navigation link is clicked
            const navLinks = document.querySelectorAll(".nav-list li a");
            navLinks.forEach((link) => {
                link.addEventListener("click", () => {
                    if (navList.classList.contains("active")) {
                        navList.classList.remove("active");
                    }
                });
            });
        }
    } catch (err) {
        console.error("Error in mobile navigation:", err);
    }

    /* ======================
         Smooth Scrolling
      ====================== */
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

    /* ======================
         Enrollment Form Handling
      ====================== */
    try {
        const enrollForm = document.querySelector(".enroll-form");
        if (enrollForm) {
            enrollForm.addEventListener("submit", function (e) {
                e.preventDefault();
                const name = document.getElementById("enroll-name").value.trim();
                const email = document.getElementById("enroll-email").value.trim();
                const phone = document.getElementById("enroll-phone").value.trim();

                // Basic validation for required fields
                if (name === "" || email === "" || phone === "") {
                    alert("Please fill in all required fields.");
                    return;
                }

                // Simulate AJAX call (you can replace this with an actual call)
                setTimeout(() => {
                    alert("Thank you for enrolling! We will contact you soon.");
                    enrollForm.reset();
                }, 500);
            });
        }
    } catch (err) {
        console.error("Error in enrollment form handling:", err);
    }

    /* ======================
         Global Error Handling & Performance Improvements
      ====================== */
    // Global error listener to catch uncaught errors
    window.addEventListener("error", function (event) {
        console.error("Global error caught:", event.error);
    });

    // Check for native lazy-loading support
    if ("loading" in HTMLImageElement.prototype) {
        document
            .querySelectorAll('img[loading="lazy"]')
            .forEach((img) => console.log("Lazy loading supported for:", img.src));
    } else {
        console.log(
            "Native lazy loading not supported. Consider adding a polyfill."
        );
    }
});
