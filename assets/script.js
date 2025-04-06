"use strict";

/* ===============================
   DOM Ready
=============================== */
document.addEventListener("DOMContentLoaded", () => {
    /* ===============================
       Page Fade-In Effect
    =============================== */
    document.body.style.opacity = 0;
    document.body.style.transition = "opacity 1s ease-in-out";
    requestAnimationFrame(() => {
        document.body.style.opacity = 1;
    });

    /* ===============================
       Hero Image Slider
    =============================== */
    (() => {
        const images = [
            "assets/images/slider.webp",
            "assets/images/slider1.webp",
            "assets/images/slider2.webp",
            "assets/images/slider3.webp",
            "assets/images/slider4.webp",
            "assets/images/slider5.webp",
            "assets/images/slider6.webp"
        ];
        const container = document.getElementById("slider");
        const buttons = document.getElementById("slider-buttons");

        if (!container || !buttons) return;

        const interval = 5000;
        let current = 0;
        let lastTime = 0;
        const slides = [];
        const navButtons = [];

        const showSlide = index => {
            slides.forEach((slide, i) => slide.style.opacity = i === index ? "1" : "0");
            navButtons.forEach((btn, i) => btn.classList.toggle("active", i === index));
            current = index;
        };

        images.forEach((src, i) => {
            const slide = document.createElement("div");
            slide.className = "slide";
            slide.style.opacity = i === 0 ? "1" : "0";
            slide.style.transition = "opacity 1s ease-in-out";

            const img = new Image();
            img.src = src;
            img.onload = () => slide.style.backgroundImage = `url(${src})`;
            img.onerror = () => {
                console.error(`Failed to load: ${src}`);
                slide.style.backgroundImage = "url(assets/images/default.jpg)";
            };

            const btn = document.createElement("button");
            btn.dataset.index = i;
            if (i === 0) btn.classList.add("active");
            btn.addEventListener("click", () => {
                showSlide(i);
                lastTime = performance.now();
            });

            slides.push(slide);
            navButtons.push(btn);
            container.appendChild(slide);
            buttons.appendChild(btn);
        });

        const cycle = time => {
            if (!lastTime || time - lastTime > interval) {
                showSlide((current + 1) % slides.length);
                lastTime = time;
            }
            requestAnimationFrame(cycle);
        };
        requestAnimationFrame(cycle);

        document.addEventListener("keydown", e => {
            if (e.key === "ArrowLeft") showSlide((current - 1 + slides.length) % slides.length);
            if (e.key === "ArrowRight") showSlide((current + 1) % slides.length);
            lastTime = performance.now();
        });

        let startX = null;
        container.addEventListener("touchstart", e => startX = e.changedTouches[0].screenX);
        container.addEventListener("touchend", e => {
            const delta = e.changedTouches[0].screenX - startX;
            if (delta > 50) showSlide((current - 1 + slides.length) % slides.length);
            if (delta < -50) showSlide((current + 1) % slides.length);
            lastTime = performance.now();
            startX = null;
        });
    })();

    /* ===============================
       Mobile Navigation
    =============================== */
    (() => {
        const toggle = document.querySelector(".menu-toggle");
        const nav = document.querySelector(".mobile-nav");
        const links = document.querySelectorAll(".mobile-nav .nav-link");
        if (!toggle || !nav) return;

        const toggleNav = () => nav.classList.toggle("active");

        toggle.addEventListener("click", toggleNav);
        toggle.addEventListener("keydown", e => {
            if (["Enter", " "].includes(e.key)) {
                e.preventDefault();
                toggleNav();
            }
        });

        document.addEventListener("click", e => {
            if (!toggle.contains(e.target) && !nav.contains(e.target)) {
                nav.classList.remove("active");
            }
        });

        links.forEach(link => link.addEventListener("click", () => nav.classList.remove("active")));
    })();

    /* ===============================
       Smooth Anchor Scrolling
    =============================== */
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener("click", e => {
            const targetId = link.getAttribute("href").substring(1);
            const target = document.getElementById(targetId);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        });
    });

    /* ===============================
       Scroll Reveal Animation
    =============================== */
    (() => {
        const items = document.querySelectorAll(".fadeInBox");
        if (!items.length) return;

        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("in-view");
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });

        items.forEach(item => observer.observe(item));
    })();

    /* ===============================
       Enroll Form Toggle & Validation
    =============================== */
    (() => {
        const form = document.querySelector(".enroll-form");
        const toggleBtn = document.getElementById("enroll-button");

        toggleBtn?.addEventListener("click", () => {
            form?.classList.toggle("active");
        });

        form?.addEventListener("submit", e => {
            const phone = document.getElementById("enroll-phone")?.value.trim();
            const email = document.getElementById("enroll-email")?.value.trim();
            const phoneRegex = /^\+?\d{1,4}?[-.\s]?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}$/;
            const digits = phone.replace(/\D/g, "");

            if (!phoneRegex.test(phone)) {
                alert("Please enter a valid phone number with country code.");
                e.preventDefault();
            } else if (digits.length < 10 || digits.length > 14) {
                alert("Phone number must be between 10–14 digits.");
                e.preventDefault();
            } else if (!/^[\w.+-]+@gmail\.com$/.test(email)) {
                alert("Please enter a valid Gmail address.");
                e.preventDefault();
            }
        });
    })();

    /* ===============================
       Logo Slider: Hover Pause
    =============================== */
    (() => {
        const track = document.querySelector(".slider-track");
        const wrapper = document.querySelector(".slider-wrapper");
        if (!track || !wrapper) return;

        wrapper.addEventListener("mouseenter", () => track.style.animationPlayState = "paused");
        wrapper.addEventListener("mouseleave", () => track.style.animationPlayState = "running");
    })();

    /* ===============================
       Dynamic Footer Year
    =============================== */
    const year = document.querySelector(".current-year");
    if (year) year.textContent = new Date().getFullYear();

    /* ===============================
       Error Logging
    =============================== */
    window.addEventListener("error", e => {
        console.error("Error:", e.error || e.message);
    });
    window.addEventListener("unhandledrejection", e => {
        console.error("Unhandled Promise:", e.reason);
    });

    /* ===============================
       Lazy Loading Support Check
    =============================== */
    if ("loading" in HTMLImageElement.prototype) {
        document.querySelectorAll('img[loading="lazy"]').forEach(img => {
            console.log("Native lazy loading:", img.src);
        });
    } else {
        console.warn("Lazy loading not supported. Consider a polyfill.");
    }

    /* ===============================
       SEO: Add Meta Description if Missing
    =============================== */
    (() => {
        if (!document.querySelector('meta[name="description"]')) {
            const meta = document.createElement("meta");
            meta.name = "description";
            meta.content = "Ghatak Sports Academy - Martial Arts Training in India. Learn self-defense, fitness, and discipline.";
            document.head.appendChild(meta);
        }
    })();

    /* ===============================
       Connection Status Indicator
    =============================== */
    (() => {
        window.addEventListener("offline", () => alert("You are currently offline. Some features may not work."));
        window.addEventListener("online", () => alert("You're back online!"));
    })();

    /* ===============================
       Global Error Fallback Logging
    =============================== */
    (() => {
        window.onerror = (msg, src, line, col, err) => {
            console.warn(`Global Error: ${msg} at ${src}:${line}:${col}`);
        };
    })();
});