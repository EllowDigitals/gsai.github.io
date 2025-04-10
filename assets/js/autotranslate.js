document.addEventListener("DOMContentLoaded", async () => {
    // === Elements ===
    const desktopLangBtn = document.getElementById("language-switcher");
    const mobileLangBtn = document.getElementById("language-switcher-mobile");
    const langDropdown = document.getElementById("language-dropdown");
    const langButtons = [desktopLangBtn, mobileLangBtn].filter(Boolean);

    // === Loading Indicator ===
    const loadingIndicator = document.createElement("div");
    loadingIndicator.id = "language-loading";
    loadingIndicator.textContent = "Translating...";
    Object.assign(loadingIndicator.style, {
        position: "fixed",
        top: "1rem",
        right: "1rem",
        backgroundColor: "#333",
        color: "#fff",
        padding: "0.5rem 1rem",
        borderRadius: "6px",
        fontSize: "0.95rem",
        boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
        zIndex: "2000",
        display: "none"
    });
    document.body.appendChild(loadingIndicator);

    const showLoading = () => loadingIndicator.style.display = "block";
    const hideLoading = () => setTimeout(() => loadingIndicator.style.display = "none", 2000);

    // === Google Translate Script Loader ===
    const loadGoogleTranslateScript = (callbackName = "googleTranslateElementInit") => {
        return new Promise((resolve, reject) => {
            if (window.google?.translate?.TranslateElement) return resolve();

            const existing = document.querySelector(`script[src*="translate_a/element.js"]`);
            if (existing) {
                existing.addEventListener("load", resolve);
                existing.addEventListener("error", () => reject("Google Translate script failed."));
                return;
            }

            const script = document.createElement("script");
            script.src = `https://translate.google.com/translate_a/element.js?cb=${callbackName}`;
            script.async = true;
            script.defer = true;
            script.onload = resolve;
            script.onerror = () => reject("Could not load Google Translate.");
            document.head.appendChild(script);
        });
    };

    // === Global Callback (Required by Google) ===
    window.googleTranslateElementInit = () => {
        new google.translate.TranslateElement({
            pageLanguage: 'en',
            autoDisplay: false,
            includedLanguages: 'en,hi,fr,de,es,it,zh-CN,ja,ru,pt',
            layout: google.translate.TranslateElement.InlineLayout.SIMPLE
        }, 'google_translate_element');
    };

    // === Wait for Google Translate Dropdown ===
    const waitForTranslateDropdown = (timeout = 15000) => {
        return new Promise((resolve, reject) => {
            const start = Date.now();
            const interval = setInterval(() => {
                const dropdown = document.querySelector("select.goog-te-combo");
                if (dropdown) {
                    clearInterval(interval);
                    resolve(dropdown);
                } else if (Date.now() - start > timeout) {
                    clearInterval(interval);
                    reject("Google Translate dropdown timeout.");
                }
            }, 100);
        });
    };

    // === Apply Translation ===
    const applyTranslation = async (langCode) => {
        try {
            await loadGoogleTranslateScript();
            const dropdown = await waitForTranslateDropdown();
            const found = [...dropdown.options].some(opt => opt.value === langCode);

            if (found) {
                dropdown.value = langCode;
                dropdown.dispatchEvent(new Event("change"));
            } else {
                console.warn("Unsupported language:", langCode);
            }
        } catch (err) {
            console.error("Translation error:", err);
        }
    };

    // === Dropdown Positioning ===
    const showDropdown = (btn) => {
        langDropdown.classList.remove("hidden");
        langDropdown.classList.add("show");

        const { bottom, left } = btn.getBoundingClientRect();
        Object.assign(langDropdown.style, {
            position: "absolute",
            top: `${bottom + window.scrollY + 8}px`,
            left: `${left}px`,
            transform: "none"
        });

        if (window.innerWidth <= 768) {
            Object.assign(langDropdown.style, {
                position: "fixed",
                top: "auto",
                bottom: "80px",
                left: "50%",
                transform: "translateX(-50%)"
            });
        }
    };

    const hideDropdown = () => {
        langDropdown.classList.remove("show");
        langDropdown.classList.add("hidden");
    };

    const toggleDropdown = (btn) => {
        langDropdown.classList.contains("show") ? hideDropdown() : showDropdown(btn);
    };

    // === Button Event Listeners ===
    langButtons.forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            toggleDropdown(btn);
        });
    });

    document.addEventListener("click", (e) => {
        const clickedInside = langDropdown.contains(e.target) || langButtons.some(btn => btn.contains(e.target));
        if (!clickedInside) hideDropdown();
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") hideDropdown();
    });

    // === Handle Manual Language Selection ===
    langDropdown.addEventListener("click", async (e) => {
        const item = e.target.closest("[data-lang]");
        if (!item) return;

        const lang = item.dataset.lang;
        localStorage.setItem("preferredLang", lang);
        hideDropdown();
        showLoading();

        try {
            await applyTranslation(lang);
        } catch (err) {
            console.error("Manual translation failed:", err);
            alert("Could not change language. Please try again.");
        } finally {
            hideLoading();
        }
    });

    // === Geo-detect Language or Load Saved Language ===
    const detectAndApplyLanguage = async () => {
        let lang = localStorage.getItem("preferredLang") || "en";

        if (!localStorage.getItem("preferredLang")) {
            try {
                const res = await fetch("https://ipapi.co/json/");
                const data = await res.json();
                const map = {
                    IN: "hi", FR: "fr", DE: "de", ES: "es",
                    IT: "it", CN: "zh-CN", JP: "ja", RU: "ru", BR: "pt"
                };
                lang = map[data.country_code] || "en";
                localStorage.setItem("preferredLang", lang);
            } catch {
                console.warn("Geo-detection failed. Defaulting to English.");
            }
        }

        if (lang !== "en") {
            showLoading();
            try {
                await applyTranslation(lang);
            } catch (err) {
                console.warn("Auto language translation failed:", err);
            } finally {
                hideLoading();
            }
        }
    };

    // === Initialize Google Translate + Language Setup ===
    try {
        await loadGoogleTranslateScript();
        detectAndApplyLanguage();
    } catch (err) {
        console.error("Failed to initialize Google Translate:", err);
    }
});
