"use strict";

// Utility functions
const $ = selector => document.querySelector(selector);
const $$ = selector => document.querySelectorAll(selector);
const debounce = (fn, delay = 300) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn.apply(this, args), delay);
    };
};

// DOM ready
document.addEventListener("DOMContentLoaded", () => {
    fadeInPage();
    initHeroSlider();
    initMobileNav();
    enableSmoothScroll();
    initScrollReveal();
    initEnrollForm();
    initLogoSliderHoverPause();
    updateFooterYear();
    initErrorHandling();
    checkLazyLoadSupport();
    ensureMetaDescription();
    monitorConnectionStatus();
});

/* ===============================
   Page Fade-In
=============================== */
function fadeInPage() {
    document.body.style.opacity = "0";
    document.body.style.transition = "opacity 0.8s ease-in-out";
    requestAnimationFrame(() => {
        document.body.style.opacity = "1";
    });
}

/* ===============================
   Hero Slider
=============================== */
function initHeroSlider() {
    const container = $("#slider");
    const buttons = $("#slider-buttons");
    const images = [
        "assets/images/slider.webp",
        "assets/images/slider1.webp",
        "assets/images/slider2.webp",
        "assets/images/slider3.webp",
        "assets/images/slider4.webp",
        "assets/images/slider5.webp",
        "assets/images/slider6.webp"
    ];

    if (!container || !buttons) return;

    const slides = [];
    const navButtons = [];
    let current = 0;
    let paused = false;
    let timer;

    const showSlide = index => {
        slides.forEach((slide, i) => {
            slide.style.opacity = i === index ? "1" : "0";
            navButtons[i].classList.toggle("active", i === index);
        });
        current = index;
    };

    const preloadImage = src => {
        return new Promise(resolve => {
            const img = new Image();
            img.src = src;
            img.onload = () => resolve(src);
            img.onerror = () => resolve("assets/images/default.jpg");
        });
    };

    Promise.all(images.map(preloadImage)).then(preloadedImages => {
        preloadedImages.forEach((src, i) => {
            const slide = document.createElement("div");
            slide.className = "slide";
            slide.style.backgroundImage = `url(${src})`;
            slide.style.opacity = i === 0 ? "1" : "0";
            slide.setAttribute("role", "img");
            slide.setAttribute("aria-label", `Slide ${i + 1}`);
            slide.style.transition = "opacity 1s ease-in-out";
            container.appendChild(slide);
            slides.push(slide);

            const btn = document.createElement("button");
            btn.className = i === 0 ? "active" : "";
            btn.setAttribute("aria-label", `Go to slide ${i + 1}`);
            btn.addEventListener("click", () => {
                showSlide(i);
                restartTimer();
            });
            buttons.appendChild(btn);
            navButtons.push(btn);
        });

        startTimer();
    });

    const startTimer = () => {
        timer = setInterval(() => {
            if (!paused) {
                showSlide((current + 1) % slides.length);
            }
        }, 5000);
    };

    const restartTimer = () => {
        clearInterval(timer);
        startTimer();
    };

    container.addEventListener("mouseenter", () => paused = true);
    container.addEventListener("mouseleave", () => paused = false);

    // Keyboard navigation
    document.addEventListener("keydown", e => {
        if (["ArrowLeft", "ArrowRight"].includes(e.key)) {
            const next = e.key === "ArrowLeft"
                ? (current - 1 + slides.length) % slides.length
                : (current + 1) % slides.length;
            showSlide(next);
            restartTimer();
        }
    });

    // Touch swipe
    let startX = 0;
    container.addEventListener("touchstart", e => startX = e.touches[0].clientX);
    container.addEventListener("touchend", e => {
        const endX = e.changedTouches[0].clientX;
        const diff = endX - startX;
        if (Math.abs(diff) > 50) {
            const direction = diff > 0 ? -1 : 1;
            showSlide((current + direction + slides.length) % slides.length);
            restartTimer();
        }
    });
}

/* ===============================
   Mobile Navigation
=============================== */
function initMobileNav() {
    const toggle = $(".menu-toggle");
    const nav = $(".mobile-nav");

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
        if (!nav.contains(e.target) && !toggle.contains(e.target)) {
            nav.classList.remove("active");
        }
    });

    $$(".mobile-nav .nav-link").forEach(link =>
        link.addEventListener("click", () => nav.classList.remove("active"))
    );
}

/* ===============================
   Advanced Smooth Anchor Scrolling
=============================== */
function enableSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]:not([href="#"])');

    links.forEach(link => {
        link.addEventListener("click", e => {
            const targetId = link.getAttribute("href").slice(1);
            const targetEl = document.getElementById(targetId);
            if (!targetEl) return;

            e.preventDefault();

            // Optional: Scroll offset for fixed headers
            const offset = 80; // Change if needed
            const targetPosition = targetEl.getBoundingClientRect().top + window.scrollY - offset;

            window.scrollTo({
                top: targetPosition,
                behavior: "smooth"
            });

            // Set focus for accessibility
            targetEl.setAttribute("tabindex", "-1");
            targetEl.focus({ preventScroll: true });
        });
    });
}


/* ===============================
   Optimized Scroll Reveal Animation
=============================== */
function initScrollReveal() {
    const items = document.querySelectorAll(".fadeInBox");
    if (!items.length || !("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("in-view");
                obs.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15, // slightly lower to trigger sooner
        rootMargin: "0px 0px -10% 0px" // reveal just before fully in viewport
    });

    items.forEach(item => observer.observe(item));
}


/* ===============================
   Enroll Form Validation v3.0
   Modern, Accessible, Themed
=============================== */
function initEnrollForm() {
    const form = document.querySelector(".enroll-form");
    const toggleBtn = document.getElementById("enroll-button");

    toggleBtn?.addEventListener("click", () => {
        form?.classList.toggle("active");
    });

    form?.addEventListener("submit", e => {
        e.preventDefault();
        const phoneField = document.getElementById("enroll-phone");
        const emailField = document.getElementById("enroll-email");
        const phone = phoneField?.value.trim();
        const email = emailField?.value.trim();
        const digits = phone.replace(/\D/g, "");

        const phoneValid = /^\+?\d{1,4}?[-.\s]?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}$/.test(phone);
        const emailValid = /^[\w.+-]+@gmail\.com$/.test(email);

        // Remove previous error highlights
        [phoneField, emailField].forEach(field => {
            field.classList.remove("input-error", "shake");
            field.nextElementSibling?.remove?.();
        });

        let hasError = false;

        if (!phoneValid || digits.length < 10 || digits.length > 14) {
            showError(phoneField, "Please enter a valid phone number (10–14 digits).");
            hasError = true;
        }

        if (!emailValid) {
            showError(emailField, "Please enter a valid Gmail address.");
            hasError = true;
        }

        if (hasError) return;

        // Submitting state
        const submitBtn = form.querySelector("button.btn");
        submitBtn.disabled = true;
        const originalText = submitBtn.textContent;
        submitBtn.textContent = "Submitting...";

        // Simulate async submission
        setTimeout(() => {
            form.reset();
            showFormMessage("✅ Successfully submitted!", "success");
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }, 1500);
    });

    function showError(field, message) {
        field.classList.add("input-error", "shake");
        const errorEl = document.createElement("div");
        errorEl.className = "form-error";
        errorEl.textContent = message;
        field.insertAdjacentElement("afterend", errorEl);
        setTimeout(() => field.classList.remove("shake"), 500);
    }

    function showFormMessage(message, type = "success") {
        const msgEl = document.createElement("div");
        msgEl.className = `form-feedback ${type}`;
        msgEl.textContent = message;
        form.appendChild(msgEl);
        setTimeout(() => msgEl.remove(), 4000);
    }
}

/**
 * Utility: Query Selector Shortcut
 */

const qs = (selector, parent = document) => parent.querySelector(selector);

/* ===============================
   Logo Slider - Hover Pause + Accessibility
=============================== */
function initLogoSliderHoverPause({ wrapperSelector = ".slider-wrapper", trackSelector = ".slider-track", debug = false } = {}) {
    const wrapper = $(wrapperSelector);
    const track = $(trackSelector);

    if (!wrapper || !track) {
        if (debug) console.warn('[LogoSlider] Elements not found');
        return;
    }

    // Improve accessibility for screen readers and focus states
    wrapper.setAttribute('tabindex', '0');
    wrapper.setAttribute('aria-label', 'Logo carousel. Hover or focus to pause animation.');

    const pauseAnimation = () => {
        track.style.animationPlayState = 'paused';
        if (debug) console.log('[LogoSlider] Animation paused');
    };

    const resumeAnimation = () => {
        track.style.animationPlayState = 'running';
        if (debug) console.log('[LogoSlider] Animation resumed');
    };

    wrapper.addEventListener('mouseenter', pauseAnimation);
    wrapper.addEventListener('mouseleave', resumeAnimation);
    wrapper.addEventListener('focusin', pauseAnimation);   // Keyboard accessibility
    wrapper.addEventListener('focusout', resumeAnimation);
}

/* ===============================
   Footer Year Auto-Updater
=============================== */
function updateFooterYear({ selector = ".current-year", format = 'numeric', debug = false } = {}) {
    const yearEl = $(selector);
    if (!yearEl) {
        if (debug) console.warn('[FooterYear] Year element not found');
        return;
    }

    const currentYear = new Intl.DateTimeFormat('en', { year: format }).format(new Date());
    yearEl.textContent = currentYear;

    if (debug) console.info(`[FooterYear] Updated to ${currentYear}`);
}

/* ===============================
   Initialize All Utilities
=============================== */
document.addEventListener('DOMContentLoaded', () => {
    initLogoSliderHoverPause({ debug: false });
    updateFooterYear({ debug: false });
});



/* ===============================
   Error Handling v5.0
   With UI Alerts, Sentry, Server Logging + Offline Debug Logging
=============================== */
function initErrorHandling({
    onError = null,
    onUnhandledRejection = null,
    logToServer = false,
    endpoint = "/log-error",
    useSentry = false,
    sentryDSN = "",
    showUIBanner = true,
    enableOfflineLog = true,
    localLogKey = "ghatak-error-log",
    maxLogEntries = 50
} = {}) {
    // ===== Sentry Setup =====
    if (useSentry && sentryDSN && window.Sentry) {
        Sentry.init({ dsn: sentryDSN });
    }

    const logStyle = "color:#fff;background:#e74c3c;padding:2px 6px;border-radius:4px;font-weight:bold;";
    const warnStyle = "color:#f39c12;font-weight:bold;";
    const infoStyle = "color:#3498db;font-weight:bold;";

    // ===== UI Banner =====
    let banner = null;
    if (showUIBanner) {
        banner = document.createElement("div");
        banner.className = "error-ui-banner";
        banner.setAttribute("role", "alert");
        banner.setAttribute("aria-live", "assertive");

        Object.assign(banner.style, {
            position: "fixed",
            bottom: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "var(--primary-color)",
            color: "#fff",
            padding: "12px 20px",
            borderRadius: "10px",
            fontWeight: "600",
            fontSize: "14px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
            zIndex: "9999",
            maxWidth: "80%",
            textAlign: "center",
            display: "none",
            transition: "all 0.3s ease",
            pointerEvents: "none"
        });

        document.body.appendChild(banner);
    }

    const showBanner = (msg) => {
        if (!banner) return;
        banner.textContent = msg;
        banner.style.display = "block";
        banner.style.opacity = "1";

        clearTimeout(banner.timer);
        banner.timer = setTimeout(() => {
            banner.style.opacity = "0";
            setTimeout(() => banner.style.display = "none", 300);
        }, 5000);
    };

    // ===== Offline Logging Helpers =====
    const saveToLocalLog = (entry) => {
        if (!enableOfflineLog) return;
        const logs = JSON.parse(localStorage.getItem(localLogKey) || "[]");
        logs.push(entry);
        while (logs.length > maxLogEntries) logs.shift(); // Keep log capped
        localStorage.setItem(localLogKey, JSON.stringify(logs));
    };

    const flushLocalLogs = async () => {
        if (!navigator.onLine || !logToServer) return;
        const storedLogs = JSON.parse(localStorage.getItem(localLogKey) || "[]");
        if (!storedLogs.length) return;

        try {
            const res = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ batch: storedLogs })
            });

            if (res.ok) {
                localStorage.removeItem(localLogKey);
                console.info("%c[Error Logs Flushed]", infoStyle);
            }
        } catch (e) {
            console.warn("%c[Flush Failed]", warnStyle, e);
        }
    };

    // ===== Core Error Logging =====
    const handleError = (type, data) => {
        const entry = {
            type,
            data,
            timestamp: new Date().toISOString(),
            url: window.location.href,
            userAgent: navigator.userAgent,
        };

        console.error(`%c[${type}]`, logStyle, data.message || data.reason || data.error || data);

        if (useSentry && window.Sentry) {
            Sentry.captureException(data.error || data.reason || data.message);
        }

        saveToLocalLog(entry);
        if (navigator.onLine && logToServer) {
            fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(entry)
            }).catch(() =>
                console.warn("%c[Logger]", warnStyle, "Error logging failed.")
            );
        }

        if (showUIBanner) {
            showBanner("⚠️ An error occurred. We're tracking it.");
        }
    };

    // ===== Event Listeners =====
    window.addEventListener("error", (e) => {
        const data = {
            message: e.message,
            source: e.filename,
            lineno: e.lineno,
            colno: e.colno,
            error: e.error?.stack || e.error,
        };

        handleError("error", data);
        if (typeof onError === "function") onError(data);
    });

    window.addEventListener("unhandledrejection", (e) => {
        const data = {
            reason: e.reason?.stack || e.reason || "Unknown",
        };

        handleError("unhandledrejection", data);
        if (typeof onUnhandledRejection === "function") onUnhandledRejection(data);
    });

    window.onerror = (msg, src, line, col, err) => {
        const data = {
            message: msg,
            source: src,
            lineno: line,
            colno: col,
            error: err?.stack || err || "Unknown",
        };

        handleError("global", data);
        return false;
    };

    // ===== Auto-Flush When Back Online =====
    window.addEventListener("online", flushLocalLogs);

    // Initial flush
    flushLocalLogs();

    console.info("%c[ErrorHandling v5.0]", infoStyle, "Loaded with offline debug logging.");
}

/**
 * Lazy loading support detection and enhancement
 * - Logs detected images
 * - Optionally loads a polyfill for unsupported browsers
 * - Can toggle debug mode
 */

function checkLazyLoadSupport({ debug = false, polyfillUrl = null } = {}) {
    const supportsLazyLoading = 'loading' in HTMLImageElement.prototype;
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');

    if (supportsLazyLoading) {
        if (debug) {
            console.info(`[LazyLoad] Native lazy loading is supported. (${lazyImages.length} images detected)`);
            lazyImages.forEach(img => console.debug('Lazy image:', img.src));
        }
    } else {
        console.warn('[LazyLoad] Native lazy loading NOT supported.');
        if (polyfillUrl) {
            console.info('[LazyLoad] Loading polyfill from:', polyfillUrl);
            const script = document.createElement('script');
            script.src = polyfillUrl;
            script.async = true;
            script.onload = () => console.info('[LazyLoad] Polyfill loaded.');
            document.head.appendChild(script);
        } else {
            console.info('[LazyLoad] Consider loading a polyfill for broader support.');
        }
    }
}

// Example usage:
checkLazyLoadSupport({
    debug: true,
    polyfillUrl: 'https://cdn.jsdelivr.net/npm/lazysizes@5.3.2/lazysizes.min.js'
});


/* ===============================
   Meta Description Fallback
=============================== */
function ensureMetaDescription() {
    if (!$('meta[name="description"]')) {
        const meta = document.createElement("meta");
        meta.name = "description";
        meta.content = "Ghatak Sports Academy - Martial Arts Training in India. Learn self-defense, fitness, and discipline.";
        document.head.appendChild(meta);
    }
}

/* ===============================
   Offline/Online Notifications v2.2 (No Audio, Optimized)
=============================== */
function monitorConnectionStatus({ onOnline = () => { }, onOffline = () => { } } = {}) {
    const STATUS_KEY = "ghatak-connection-status";

    // Create notification banner
    const banner = Object.assign(document.createElement("div"), {
        className: "connection-status-banner",
        role: "status",
        ariaLive: "polite",
    });

    Object.assign(banner.style, {
        position: "fixed",
        bottom: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        padding: "10px 20px",
        borderRadius: "8px",
        color: "#fff",
        fontWeight: "600",
        zIndex: 9999,
        display: "none",
        transition: "opacity 0.3s ease-in-out",
        fontSize: "14px",
        pointerEvents: "none",
        boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
        opacity: "0"
    });

    document.body.appendChild(banner);

    // Create persistent status dot
    const statusDot = Object.assign(document.createElement("div"), {
        className: "connection-status-dot",
    });

    Object.assign(statusDot.style, {
        position: "fixed",
        bottom: "20px",
        right: "20px",
        width: "12px",
        height: "12px",
        borderRadius: "50%",
        backgroundColor: navigator.onLine ? "#27ae60" : "#e74c3c",
        boxShadow: "0 0 8px rgba(0,0,0,0.3)",
        zIndex: 9999
    });

    document.body.appendChild(statusDot);

    const showBanner = (text, bgColor) => {
        banner.textContent = text;
        banner.style.backgroundColor = bgColor;
        banner.style.display = "block";
        banner.style.opacity = "1";

        clearTimeout(banner._timeout);
        banner._timeout = setTimeout(() => {
            banner.style.opacity = "0";
            setTimeout(() => (banner.style.display = "none"), 300);
        }, 4000);
    };

    const updateVisuals = (isOnline) => {
        const color = isOnline ? "#27ae60" : "#e74c3c";
        const message = isOnline ? "✅ You are back online!" : "🔌 You are offline.";
        statusDot.style.backgroundColor = color;
        showBanner(message, color);
    };

    const debounce = (fn, delay = 300) => {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => fn.apply(this, args), delay);
        };
    };

    const updateStatus = debounce(() => {
        const isOnline = navigator.onLine;
        const last = localStorage.getItem(STATUS_KEY);
        if (String(isOnline) === last) return;

        localStorage.setItem(STATUS_KEY, isOnline);
        updateVisuals(isOnline);

        (isOnline ? onOnline : onOffline)();
    }, 250);

    window.addEventListener("online", updateStatus);
    window.addEventListener("offline", updateStatus);

    // Initial check
    updateStatus();
}

(function enhanceHeroSlider(sliderEl) {
    if (!sliderEl) return;

    const slideEls = sliderEl.querySelectorAll('[data-slide]');
    const controlPrev = sliderEl.querySelector('[data-slider-prev]');
    const controlNext = sliderEl.querySelector('[data-slider-next]');
    let currentSlide = 0;
    let isTransitioning = false;
    let autoplayInterval = null;

    const autoplayEnabled = sliderEl.dataset.autoplay === 'true';
    const autoplayIntervalTime = Number(sliderEl.dataset.autoplayInterval) || 5000;

    function goToSlide(index) {
        if (isTransitioning || index === currentSlide) return;
        isTransitioning = true;

        const totalSlides = slideEls.length;
        currentSlide = (index + totalSlides) % totalSlides;

        slideEls.forEach((slideEl, i) => {
            const isActive = i === currentSlide;
            slideEl.classList.toggle('current-slide', isActive);
            slideEl.setAttribute('aria-hidden', String(!isActive));
            slideEl.style.visibility = isActive ? 'visible' : 'hidden';
            slideEl.style.opacity = isActive ? '1' : '0';
        });

        // Re-enable transitions after it completes
        setTimeout(() => {
            isTransitioning = false;
        }, 600); // match the CSS transition duration
    }

    // Keyboard navigation
    sliderEl.setAttribute('tabindex', '0'); // Allow slider to receive keyboard events
    sliderEl.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') goToSlide(currentSlide - 1);
        if (e.key === 'ArrowRight') goToSlide(currentSlide + 1);
    });

    // Autoplay functionality
    function startAutoplay() {
        if (autoplayEnabled) {
            stopAutoplay(); // Avoid duplicates
            autoplayInterval = setInterval(() => {
                goToSlide(currentSlide + 1);
            }, autoplayIntervalTime);
        }
    }

    function stopAutoplay() {
        if (autoplayInterval) {
            clearInterval(autoplayInterval);
            autoplayInterval = null;
        }
    }

    if (autoplayEnabled) {
        startAutoplay();

        sliderEl.addEventListener('mouseenter', stopAutoplay);
        sliderEl.addEventListener('mouseleave', startAutoplay);
    }

    // Controls
    controlPrev?.addEventListener('click', () => goToSlide(currentSlide - 1));
    controlNext?.addEventListener('click', () => goToSlide(currentSlide + 1));

    // Initialize first slide
    goToSlide(0);

})(document.querySelector('[data-slider]'));


