"use strict";

// Utility Functions
const $ = sel => document.querySelector(sel);
const $$ = sel => document.querySelectorAll(sel);
const qs = (sel, parent = document) => parent.querySelector(sel);
const debounce = (fn, delay = 300) => {
    let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn.apply(this, a), delay); };
};

// Init on DOM ready
addEventListener("DOMContentLoaded", () => {
    fadeInPage();
    initHeroSlider();
    initMobileNav();
    enableSmoothScroll();
    initScrollReveal();
    initEnrollForm();
    initLogoSliderHoverPause();
    updateFooterYear();
    checkLazyLoadSupport();
    ensureMetaDescription();
    monitorConnectionStatus();
});

// Fade-In Effect
function fadeInPage() {
    Object.assign(document.body.style, {
        opacity: "0",
        transition: "opacity 0.8s ease-in-out"
    });
    requestAnimationFrame(() => document.body.style.opacity = "1");
}

// Hero Slider v2.0
function initHeroSlider() {
    const container = $("#slider"), buttons = $("#slider-buttons"),
        imgs = ["slider.webp", "slider1.webp", "slider2.webp", "slider3.webp", "slider4.webp", "slider5.webp", "slider6.webp"].map(img => `assets/images/${img}`);
    if (!container || !buttons) return;
    let current = 0, paused = false, timer;
    const slides = [], navs = [];

    const show = i => {
        slides.forEach((s, idx) => s.style.opacity = idx === i ? "1" : "0");
        navs.forEach((b, idx) => b.classList.toggle("active", idx === i));
        current = i;
    };

    Promise.all(imgs.map(src => new Promise(res => {
        const img = new Image(); img.src = src;
        img.onload = () => res(src);
        img.onerror = () => res("assets/images/default.jpg");
    }))).then(loaded => {
        loaded.forEach((src, i) => {
            const d = document.createElement("div");
            d.className = "slide";
            Object.assign(d.style, {
                backgroundImage: `url(${src})`,
                opacity: i ? "0" : "1",
                transition: "opacity 1s ease-in-out"
            });
            d.setAttribute("role", "img");
            d.setAttribute("aria-label", `Slide ${i + 1}`);
            container.appendChild(d);
            slides.push(d);

            const b = document.createElement("button");
            b.className = i ? "" : "active";
            b.setAttribute("aria-label", `Go to slide ${i + 1}`);
            b.onclick = () => { show(i); restart(); };
            buttons.appendChild(b);
            navs.push(b);
        });
        start();
    });

    const start = () => timer = setInterval(() => !paused && show((current + 1) % slides.length), 5000);
    const restart = () => { clearInterval(timer); start(); };
    container.onmouseenter = () => paused = true;
    container.onmouseleave = () => paused = false;

    document.onkeydown = e => {
        if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
            const dir = e.key === "ArrowLeft" ? -1 : 1;
            show((current + dir + slides.length) % slides.length);
            restart();
        }
    };

    let x = 0;
    container.ontouchstart = e => x = e.touches[0].clientX;
    container.ontouchend = e => {
        const dx = e.changedTouches[0].clientX - x;
        if (Math.abs(dx) > 50) {
            show((current + (dx > 0 ? -1 : 1) + slides.length) % slides.length);
            restart();
        }
    };
}

// Mobile Navigation
function initMobileNav() {
    const toggle = $(".menu-toggle"), nav = $(".mobile-nav");
    if (!toggle || !nav) return;
    const toggleNav = () => nav.classList.toggle("active");

    toggle.onclick = toggleNav;
    toggle.onkeydown = e => ["Enter", " "].includes(e.key) && (e.preventDefault(), toggleNav());

    document.onclick = e => !nav.contains(e.target) && !toggle.contains(e.target) && nav.classList.remove("active");
    $$(".mobile-nav .nav-link").forEach(l => l.onclick = () => nav.classList.remove("active"));
}

// Smooth Scroll
function enableSmoothScroll() {
    $$('a[href^="#"]:not([href="#"])').forEach(link => link.onclick = e => {
        const id = link.getAttribute("href").slice(1), el = document.getElementById(id);
        if (!el) return;
        e.preventDefault();
        window.scrollTo({ top: el.getBoundingClientRect().top + scrollY - 80, behavior: "smooth" });
        el.setAttribute("tabindex", "-1"); el.focus({ preventScroll: true });
    });
}

// Scroll Reveal
function initScrollReveal() {
    const items = document.querySelectorAll(".fadeInBox");
    if (!items.length || !window.IntersectionObserver) return;
    const io = new IntersectionObserver((entries, obs) => {
        entries.forEach(e => e.isIntersecting && (e.target.classList.add("in-view"), obs.unobserve(e.target)));
    }, { threshold: 0.15, rootMargin: "0px 0px -10% 0px" });
    items.forEach(item => io.observe(item));
}

// Enroll Form v3.1
function initEnrollForm() {
    const form = $(".enroll-form"), btn = $("#enroll-button");
    btn?.addEventListener("click", () => form?.classList.toggle("active"));

    form?.addEventListener("submit", e => {
        const phone = $("#enroll-phone"), email = $("#enroll-email"),
            digits = phone.value.replace(/\D/g, ""),
            validPhone = /^\+?\d{1,4}?[-.\s]?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}$/.test(phone.value),
            validEmail = /^[\w.+-]+@gmail\.com$/.test(email.value);

        [phone, email].forEach(f => (f.classList.remove("input-error", "shake"), f.nextElementSibling?.remove?.()));
        let err = false;

        if (!validPhone || digits.length < 10 || digits.length > 14) showError(phone, "Please enter a valid phone number (10–14 digits)."), err = true;
        if (!validEmail) showError(email, "Please enter a valid Gmail address."), err = true;

        if (err) return e.preventDefault();
        const submitBtn = form.querySelector("button.btn");
        submitBtn.disabled = true;
        submitBtn.textContent = "Submitting...";
    });

    function showError(f, m) {
        f.classList.add("input-error", "shake");
        const e = document.createElement("div");
        e.className = "form-error"; e.textContent = m;
        f.insertAdjacentElement("afterend", e);
        setTimeout(() => f.classList.remove("shake"), 500);
    }
}

// Logo Slider Pause
function initLogoSliderHoverPause({ wrapperSelector = ".slider-wrapper", trackSelector = ".slider-track", debug = false } = {}) {
    const wrapper = $(wrapperSelector), track = $(trackSelector);
    if (!wrapper || !track) return debug && console.warn('[LogoSlider] Elements missing');
    Object.assign(wrapper, { tabIndex: 0, ariaLabel: 'Logo carousel. Hover or focus to pause animation.' });

    const pause = () => (track.style.animationPlayState = 'paused', debug && console.log('[LogoSlider] Paused'));
    const resume = () => (track.style.animationPlayState = 'running', debug && console.log('[LogoSlider] Resumed'));

    wrapper.onmouseenter = pause;
    wrapper.onmouseleave = resume;
    wrapper.onfocusin = pause;
    wrapper.onfocusout = resume;
}

// Footer Year Auto
function updateFooterYear({ selector = ".current-year", format = 'numeric', debug = false } = {}) {
    const el = $(selector);
    if (!el) return debug && console.warn('[FooterYear] Element not found');
    const year = new Intl.DateTimeFormat('en', { year: format }).format(new Date());
    el.textContent = year;
    debug && console.info(`[FooterYear] Updated to ${year}`);
}

// Lazy Loading Check
function checkLazyLoadSupport({ debug = false, polyfillUrl = null } = {}) {
    const supported = 'loading' in HTMLImageElement.prototype;
    const lazyImgs = $$('img[loading="lazy"]');

    if (supported) {
        debug && console.info(`[LazyLoad] Native supported. (${lazyImgs.length} images)`);
    } else {
        console.warn('[LazyLoad] Not supported.');
        if (polyfillUrl) {
            const s = document.createElement('script');
            s.src = polyfillUrl; s.async = true;
            s.onload = () => console.info('[LazyLoad] Polyfill loaded.');
            document.head.appendChild(s);
        } else debug && console.info('[LazyLoad] Polyfill suggested.');
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

// Connection Monitor v3.5
function monitorConnectionStatus({ onOnline = () => { }, onOffline = () => { }, enableBatteryCheck = true } = {}) {
    const STATUS_KEY = "ghatak-connection-status";
    const banner = Object.assign(document.createElement("div"), {
        className: "ghatak-connection-banner",
        role: "status",
        ariaLive: "polite",
        innerHTML: '<span id="conn-text"></span>'
    });
    const dot = Object.assign(document.createElement("div"), {
        style: "position:fixed;bottom:16px;right:16px;width:14px;height:14px;border-radius:50%;z-index:9999;background:#27ae60;transition:background-color 0.3s ease;box-shadow:0 0 10px rgba(0,0,0,0.3)"
    });

    Object.assign(banner.style, {
        position: "fixed", bottom: "16px", left: "50%", transform: "translateX(-50%)",
        padding: "10px 20px", borderRadius: "10px", color: "#fff", fontWeight: "600",
        zIndex: "9999", display: "none", opacity: "0", pointerEvents: "none",
        boxShadow: "0 4px 16px rgba(0,0,0,0.3)", fontSize: "15px", transition: "all 0.4s ease"
    });

    document.body.append(banner, dot);

    const updateUI = isOnline => {
        const msg = isOnline ? "✅ Back online!" : "🔌 You are offline.",
            color = isOnline ? "#27ae60" : "#e74c3c";
        dot.style.backgroundColor = color;
        banner.style.backgroundColor = color;
        banner.querySelector("#conn-text").textContent = msg;
        banner.style.display = "block";
        banner.style.opacity = "1";
        clearTimeout(banner._timeout);
        banner._timeout = setTimeout(() => {
            banner.style.opacity = "0";
            setTimeout(() => (banner.style.display = "none"), 400);
        }, 5000);
    };

    const debouncedUpdate = debounce(() => {
        const online = navigator.onLine;
        const prev = localStorage.getItem(STATUS_KEY);
        if (String(online) !== prev) {
            localStorage.setItem(STATUS_KEY, online);
            updateUI(online);
            (online ? onOnline : onOffline)();
        }
    }, 250);

    window.addEventListener("online", debouncedUpdate);
    window.addEventListener("offline", debouncedUpdate);

    if (enableBatteryCheck && navigator.getBattery) {
        navigator.getBattery().then(bat => {
            if (bat.level < 0.15 && !bat.charging) {
                console.warn("⚠️ Low battery mode detected.");
                banner.style.fontSize = "13px";
                banner.style.padding = "8px 16px";
            }
        });
    }

    document.addEventListener("visibilitychange", () => {
        if (!document.hidden) debouncedUpdate();
    });

    debouncedUpdate();
}