// ==========================
// Ghatak Web Scripts – Core Bundle
// Version: ghatak-web-scripts.v4.6
// ==========================

"use strict";

// 💡 Utility Shortcuts
const $ = sel => document.querySelector(sel);
const $$ = sel => document.querySelectorAll(sel);
const qs = (sel, parent = document) => parent.querySelector(sel);
const debounce = (fn, delay = 300) => {
    let t;
    return (...a) => {
        clearTimeout(t);
        t = setTimeout(() => fn.apply(this, a), delay);
    };
};

// 🚀 Init All on DOM Ready
document.addEventListener("DOMContentLoaded", () => {
    // 📢 Core Script Log First
    console.groupCollapsed("%c🚀 Ghatak Web Scripts Loaded", "color:#fff; background:#2ecc71; padding:4px 10px; border-radius:6px;");
    console.log("%cVersion: v4.6", "color:#222; background:#f39c12; padding:2px 6px; border-radius:4px;");
    console.log("%cLast Updated: 2025-04-11", "color:#999; font-size:12px;");
    console.groupEnd();

    // 📦 Core Initializations
    fadeInPage();                     // 🌅 Page Fade-In Loader (v2.0)
    initHeroSlider();                // 🖼️ Hero Image Slider (v2.1)
    initMobileNav();                 // 📱 Mobile Navigation (v2.0)
    enableSmoothScroll();            // 🧭 Smooth Scrolling (v2.0)
    initScrollReveal();              // ✨ Scroll Reveal (v2.0)
    initEnrollForm();                // 📝 Enroll Form UX (v3.2)
    initLogoSliderHoverPause();      // 🎞️ Logo Carousel Pause (v2.0)
    updateFooterYear();              // 📆 Footer Year Auto (v2.0)
    checkLazyLoadSupport();          // 💤 Lazy Loading Check (v2.1)
    ensureMetaDescription();         // 🧠 Meta Tag Fallback
    monitorConnectionStatus();       // 🔌 Connection Monitor (v3.8)
});


// Fade-In Effect v2.0
function fadeInPage({ duration = 800, easing = "ease-in-out", debug = false } = {}) {
    const style = document.body.style;

    // Prevent flicker if script runs after paint
    style.opacity = "0";
    style.transition = `opacity ${duration}ms ${easing}`;

    // Trigger transition in next frame
    requestAnimationFrame(() => {
        style.opacity = "1";
        if (debug) console.info(`[FadeInPage] Applied fade-in: ${duration}ms ${easing}`);
    });

    // Optional: clean up inline styles after transition
    document.body.addEventListener("transitionend", () => {
        style.transition = "";
        if (debug) console.info("[FadeInPage] Transition complete.");
    }, { once: true });
}

// Hero Slider v3.0
function initHeroSlider({
    containerSelector = "#slider",
    navButtonsSelector = "#slider-buttons",
    imageList = [
        "slider.webp", "slider1.webp", "slider2.webp",
        "slider3.webp", "slider4.webp", "slider5.webp", "slider6.webp"
    ],
    imagePath = "assets/images/",
    fallbackImage = "default.jpg",
    interval = 5000,
    transition = "opacity 1s ease-in-out",
    debug = false
} = {}) {
    const container = document.querySelector(containerSelector);
    const buttons = document.querySelector(navButtonsSelector);
    if (!container || !buttons) {
        if (debug) console.warn("[HeroSlider] Container or buttons not found.");
        return;
    }

    const slides = [], navs = [];
    let current = 0, paused = false, timer;

    const preloadImages = (sources) => Promise.all(sources.map(src => new Promise(resolve => {
        const img = new Image();
        img.src = src;
        img.onload = () => resolve(src);
        img.onerror = () => {
            if (debug) console.warn(`[HeroSlider] Failed to load: ${src}, using fallback.`);
            resolve(`${imagePath}${fallbackImage}`);
        };
    })));

    const showSlide = (i) => {
        slides.forEach((slide, idx) => slide.style.opacity = idx === i ? "1" : "0");
        navs.forEach((btn, idx) => btn.classList.toggle("active", idx === i));
        current = i;
    };

    const start = () => timer = setInterval(() => !paused && showSlide((current + 1) % slides.length), interval);
    const restart = () => { clearInterval(timer); start(); };

    const setupSlide = (src, i) => {
        const slide = document.createElement("div");
        slide.className = "slide";
        Object.assign(slide.style, {
            backgroundImage: `url(${src})`,
            opacity: i === 0 ? "1" : "0",
            transition
        });
        slide.setAttribute("role", "img");
        slide.setAttribute("aria-label", `Slide ${i + 1}`);
        container.appendChild(slide);
        slides.push(slide);

        const btn = document.createElement("button");
        btn.className = i === 0 ? "active" : "";
        btn.setAttribute("aria-label", `Go to slide ${i + 1}`);
        btn.onclick = () => {
            showSlide(i);
            restart();
        };
        buttons.appendChild(btn);
        navs.push(btn);
    };

    const handleKeyboard = (e) => {
        if (["ArrowLeft", "ArrowRight"].includes(e.key)) {
            const dir = e.key === "ArrowLeft" ? -1 : 1;
            showSlide((current + dir + slides.length) % slides.length);
            restart();
        }
    };

    const handleSwipe = () => {
        let startX = 0;
        container.addEventListener("touchstart", e => startX = e.touches[0].clientX);
        container.addEventListener("touchend", e => {
            const dx = e.changedTouches[0].clientX - startX;
            if (Math.abs(dx) > 50) {
                showSlide((current + (dx > 0 ? -1 : 1) + slides.length) % slides.length);
                restart();
            }
        });
    };

    // Load and render all slides
    const fullPaths = imageList.map(img => `${imagePath}${img}`);
    preloadImages(fullPaths).then(loadedImages => {
        loadedImages.forEach((src, i) => setupSlide(src, i));
        start();
    });

    // Pause/resume on hover
    container.addEventListener("mouseenter", () => paused = true);
    container.addEventListener("mouseleave", () => paused = false);

    // Enable keyboard nav and swipe support
    document.addEventListener("keydown", handleKeyboard);
    handleSwipe();

    if (debug) console.info("[HeroSlider] Initialized.");
}

// Mobile Navigation v2.0
function initMobileNav({
    toggleSelector = ".menu-toggle",
    navSelector = ".mobile-nav",
    linkSelector = ".mobile-nav .nav-link",
    activeClass = "active",
    debug = false
} = {}) {
    const toggleBtn = document.querySelector(toggleSelector);
    const nav = document.querySelector(navSelector);

    if (!toggleBtn || !nav) {
        if (debug) console.warn("[MobileNav] Toggle or navigation element not found.");
        return;
    }

    const toggleNav = () => nav.classList.toggle(activeClass);
    const closeNav = () => nav.classList.remove(activeClass);

    // Click and keyboard accessibility
    toggleBtn.addEventListener("click", toggleNav);
    toggleBtn.addEventListener("keydown", (e) => {
        if (["Enter", " "].includes(e.key)) {
            e.preventDefault();
            toggleNav();
        }
    });

    // Close nav when clicking outside
    document.addEventListener("click", (e) => {
        if (!nav.contains(e.target) && !toggleBtn.contains(e.target)) {
            closeNav();
        }
    });

    // Close nav on link click
    document.querySelectorAll(linkSelector).forEach(link =>
        link.addEventListener("click", closeNav)
    );

    if (debug) console.info("[MobileNav] Initialized.");
}

// Smooth Scroll v2.0
function enableSmoothScroll({
    offset = 80,
    selector = 'a[href^="#"]:not([href="#"])',
    debug = false
} = {}) {
    const links = document.querySelectorAll(selector);

    if (!links.length) {
        if (debug) console.warn("[SmoothScroll] No anchor links found.");
        return;
    }

    links.forEach(link => {
        link.addEventListener("click", e => {
            const targetId = link.getAttribute("href").slice(1);
            const targetEl = document.getElementById(targetId);

            if (!targetEl) {
                if (debug) console.warn(`[SmoothScroll] Target element not found: #${targetId}`);
                return;
            }

            e.preventDefault();

            const targetOffset = targetEl.getBoundingClientRect().top + window.scrollY - offset;

            window.scrollTo({ top: targetOffset, behavior: "smooth" });

            // Accessibility improvement: make target focusable and focus it
            targetEl.setAttribute("tabindex", "-1");
            targetEl.focus({ preventScroll: true });

            if (debug) console.info(`[SmoothScroll] Scrolled to: #${targetId}`);
        });
    });

    if (debug) console.info(`[SmoothScroll] Bound ${links.length} anchor link(s).`);
}

// Scroll Reveal v2.0
function initScrollReveal({
    selector = ".fadeInBox",
    threshold = 0.15,
    rootMargin = "0px 0px -10% 0px",
    inViewClass = "in-view",
    debug = false
} = {}) {
    const elements = document.querySelectorAll(selector);

    if (!elements.length) {
        if (debug) console.warn("[ScrollReveal] No elements found for selector:", selector);
        return;
    }

    if (!window.IntersectionObserver) {
        console.warn("[ScrollReveal] IntersectionObserver not supported in this browser.");
        return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add(inViewClass);
                obs.unobserve(entry.target);
                if (debug) console.info("[ScrollReveal] Revealed:", entry.target);
            }
        });
    }, { threshold, rootMargin });

    elements.forEach(el => observer.observe(el));

    if (debug) console.info(`[ScrollReveal] Initialized on ${elements.length} element(s).`);
}

// 📝 Enroll Form Validation & UX
// Version: 3.2
function initEnrollForm() {
    const form = document.querySelector(".enroll-form");
    if (!form) return console.warn("[EnrollForm] Form element not found.");

    const phoneInput = form.querySelector("#enroll-phone");
    const emailInput = form.querySelector("#enroll-email");
    const submitBtn = form.querySelector("button.btn");

    if (!phoneInput || !emailInput || !submitBtn) {
        console.error("[EnrollForm] Required fields missing in DOM.");
        return;
    }

    form.addEventListener("submit", (e) => {
        const phoneDigits = phoneInput.value.replace(/\D/g, "");
        const isValidPhone = /^\+?\d{1,4}?[-.\s]?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}$/.test(phoneInput.value) &&
            phoneDigits.length >= 10 && phoneDigits.length <= 14;
        const isValidEmail = /^[\w.+-]+@gmail\.com$/.test(emailInput.value);

        // Reset errors
        [phoneInput, emailInput].forEach(field => {
            field.classList.remove("input-error", "shake");
            field.nextElementSibling?.classList.contains("form-error") && field.nextElementSibling.remove();
        });

        let hasError = false;

        if (!isValidPhone) {
            showError(phoneInput, "Please enter a valid phone number (10–14 digits).");
            hasError = true;
        }

        if (!isValidEmail) {
            showError(emailInput, "Please enter a valid Gmail address.");
            hasError = true;
        }

        if (hasError) {
            e.preventDefault();
            return;
        }

        // UX feedback
        submitBtn.disabled = true;
        submitBtn.textContent = "Submitting...";
    });

    function showError(field, message) {
        field.classList.add("input-error", "shake");
        const errorMsg = document.createElement("div");
        errorMsg.className = "form-error";
        errorMsg.textContent = message;
        field.insertAdjacentElement("afterend", errorMsg);
        setTimeout(() => field.classList.remove("shake"), 500);
    }
}

// Logo Slider Pause v2.0
function initLogoSliderHoverPause({
    wrapperSelector = ".slider-wrapper",
    trackSelector = ".slider-track",
    debug = false
} = {}) {
    const wrapper = document.querySelector(wrapperSelector);
    const track = document.querySelector(trackSelector);

    if (!wrapper || !track) {
        if (debug) console.warn(`[LogoSlider] Missing elements: ${!wrapper ? 'wrapper' : ''} ${!track ? 'track' : ''}`);
        return;
    }

    wrapper.tabIndex = 0;
    wrapper.setAttribute("aria-label", "Logo carousel. Hover or focus to pause animation.");

    const pause = () => {
        track.style.animationPlayState = "paused";
        if (debug) console.log("[LogoSlider] Animation paused.");
    };

    const resume = () => {
        track.style.animationPlayState = "running";
        if (debug) console.log("[LogoSlider] Animation resumed.");
    };

    wrapper.addEventListener("mouseenter", pause);
    wrapper.addEventListener("mouseleave", resume);
    wrapper.addEventListener("focusin", pause);
    wrapper.addEventListener("focusout", resume);

    if (debug) console.info("[LogoSlider] Hover/focus pause initialized.");
}

// Footer Year Auto v2.0
function updateFooterYear({ selector = ".current-year", format = "numeric", debug = false } = {}) {
    const element = document.querySelector(selector);

    if (!element) {
        if (debug) console.warn(`[FooterYear] No element found for selector: '${selector}'`);
        return;
    }

    try {
        const year = new Intl.DateTimeFormat("en", { year: format }).format(new Date());
        element.textContent = year;
        if (debug) console.info(`[FooterYear] Year updated to: ${year}`);
    } catch (error) {
        console.error("[FooterYear] Failed to format year:", error);
    }
}

// Lazy Loading Check v2.0
function checkLazyLoadSupport({ debug = false, polyfillUrl = null } = {}) {
    const isSupported = 'loading' in HTMLImageElement.prototype;
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');

    if (isSupported) {
        if (debug) {
            console.info(`[LazyLoad] Native lazy-loading is supported. (${lazyImages.length} image${lazyImages.length !== 1 ? 's' : ''})`);
        }
    } else {
        console.warn('[LazyLoad] Native lazy-loading is not supported.');

        if (polyfillUrl) {
            const script = document.createElement('script');
            script.src = polyfillUrl;
            script.async = true;
            script.onload = () => console.info('[LazyLoad] Polyfill loaded successfully.');
            script.onerror = () => console.error('[LazyLoad] Failed to load polyfill.');
            document.head.appendChild(script);
        } else if (debug) {
            console.info('[LazyLoad] Consider providing a polyfill URL to enable compatibility.');
        }
    }
}

// Meta Description Fallback
function ensureMetaDescription() {
    if (!$('meta[name="description"]')) {
        const meta = document.createElement("meta");
        meta.name = "description";
        meta.content = "Ghatak Sports Academy - Martial Arts Training in India. Learn self-defense, fitness, and discipline.";
        document.head.appendChild(meta);
    }
}

// Ghatak Connection Monitor v3.8 (Enhanced, Optimized & Theme-Aware)
function monitorConnectionStatus({
    onOnline = () => { },
    onOffline = () => { },
    enableBatteryCheck = true
} = {}) {
    const STATUS_KEY = "ghatak-connection-status";

    const banner = Object.assign(document.createElement("div"), {
        className: "ghatak-connection-banner",
        role: "status",
        ariaLive: "polite",
        innerHTML: '<span id="conn-text"></span>'
    });

    const dot = Object.assign(document.createElement("div"), {
        className: "ghatak-connection-dot"
    });

    document.body.append(banner, dot);

    const updateUI = (isOnline) => {
        const msg = isOnline
            ? "You're back online. Connection looks good!"
            : "You're offline. Some features may not work.";
        const icon = isOnline ? "🌐" : "📴";

        banner.querySelector("#conn-text").innerHTML = `${icon} ${msg}`;
        banner.classList.remove("conn-hide");
        banner.classList.toggle("conn-online", isOnline);
        banner.classList.toggle("conn-offline", !isOnline);

        dot.classList.toggle("conn-online", isOnline);
        dot.classList.toggle("conn-offline", !isOnline);

        clearTimeout(banner._timeout);
        banner._timeout = setTimeout(() => {
            banner.classList.add("conn-hide");
        }, 5000);

        console.info(`[ConnectionStatus] ${isOnline ? "Online" : "Offline"} at ${new Date().toLocaleTimeString()}`);
        (isOnline ? onOnline : onOffline)();
    };


    const debouncedUpdate = debounce(() => {
        const isOnline = navigator.onLine;
        const prev = localStorage.getItem(STATUS_KEY);
        if (String(isOnline) !== prev) {
            localStorage.setItem(STATUS_KEY, isOnline);
            updateUI(isOnline);
        }
    }, 250);

    window.addEventListener("online", debouncedUpdate);
    window.addEventListener("offline", debouncedUpdate);
    document.addEventListener("visibilitychange", () => {
        if (!document.hidden) debouncedUpdate();
    });

    if (enableBatteryCheck && navigator.getBattery) {
        navigator.getBattery().then((battery) => {
            const handleBatteryStatus = () => {
                if (battery.level < 0.15 && !battery.charging) {
                    console.warn("⚠️ Low battery mode detected.");
                    banner.querySelector("#conn-text").textContent =
                        "🔋 Low battery detected! Please plug in your device to maintain performance.";
                    banner.classList.remove("conn-hide");
                    banner.classList.add("conn-low-battery");

                    dot.classList.remove("conn-online", "conn-offline");
                    dot.classList.add("conn-low-battery");

                    clearTimeout(banner._timeout);
                    banner._timeout = setTimeout(() => {
                        banner.classList.add("conn-hide");
                        banner.classList.remove("conn-low-battery");
                        dot.classList.remove("conn-low-battery");
                    }, 5000);
                }
            };

            battery.addEventListener("levelchange", handleBatteryStatus);
            battery.addEventListener("chargingchange", handleBatteryStatus);
            handleBatteryStatus(); // Initial
        }).catch(console.error);
    }

    debouncedUpdate();
}

(function (global) {
    if (!global.debounce) {
        global.debounce = (fn, delay = 300) => {
            let t;
            return (...a) => {
                clearTimeout(t);
                t = setTimeout(() => fn.apply(this, a), delay);
            };
        };
    }
})(window);
