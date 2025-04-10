document.addEventListener("DOMContentLoaded", () => {
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
        background: "#333",
        color: "#fff",
        padding: "0.5rem 1rem",
        borderRadius: "6px",
        fontSize: "0.95rem",
        boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
        zIndex: "2000",
        display: "none",
    });
    document.body.appendChild(loadingIndicator);

    const showLoading = () => loadingIndicator.style.display = "block";
    const hideLoading = () => setTimeout(() => {
        loadingIndicator.style.display = "none";
    }, 2000);

    // === Load Google Translate Script ===
    const loadGoogleTranslateScript = (cbName = "googleTranslateElementInit") => {
        return new Promise((resolve, reject) => {
            if (window.google?.translate?.TranslateElement) return resolve();

            const existing = document.querySelector('script[src*="translate_a/element.js"]');
            if (existing) return resolve();

            const script = document.createElement("script");
            script.src = `https://translate.google.com/translate_a/element.js?cb=${cbName}`;
            script.async = true;
            script.onload = resolve;
            script.onerror = () => reject(new Error("Failed to load Google Translate."));
            document.head.appendChild(script);
        });
    };

    // === Google Translate Callback ===
    window.googleTranslateElementInit = () => {
        new google.translate.TranslateElement({
            pageLanguage: 'en',
            autoDisplay: false,
            includedLanguages: 'en,hi,fr,de,es,it,zh-CN,ja,ru,pt',
            layout: google.translate.TranslateElement.InlineLayout.SIMPLE
        }, 'google_translate_element');
    };

    // === Wait for the Google Translate dropdown to render
    const waitForGoogleTranslate = (timeout = 20000) =>
        new Promise((resolve, reject) => {
            const start = Date.now();
            const interval = setInterval(() => {
                const select = document.querySelector("select.goog-te-combo");
                if (select) {
                    clearInterval(interval);
                    resolve(select);
                } else if (Date.now() - start > timeout) {
                    clearInterval(interval);
                    reject(new Error("Timeout waiting for Google Translate dropdown."));
                }
            }, 100);
        });

    // === Apply Translation Logic ===
    const applyTranslation = async (langCode) => {
        try {
            await loadGoogleTranslateScript();
            const select = await waitForGoogleTranslate();

            if (select && [...select.options].some(opt => opt.value === langCode)) {
                select.value = langCode;
                // Slight delay for change event
                setTimeout(() => {
                    select.dispatchEvent(new Event("change"));
                }, 100);
            } else {
                console.warn("Language not found in options:", langCode);
            }
        } catch (err) {
            console.error("Error applying translation:", err);
        }
    };

    // === Dropdown Toggle Logic ===
    const showDropdown = (btn) => {
        langDropdown.classList.remove("hidden");
        langDropdown.classList.add("show");

        if (window.innerWidth > 768) {
            const { bottom, left } = btn.getBoundingClientRect();
            Object.assign(langDropdown.style, {
                top: `${bottom + window.scrollY + 8}px`,
                left: `${left}px`,
                transform: "none"
            });
        } else {
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

    // === Event Listeners ===
    langButtons.forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            toggleDropdown(btn);
        });
    });

    document.addEventListener("click", (e) => {
        const isInside = langDropdown.contains(e.target) || langButtons.some(btn => btn.contains(e.target));
        if (!isInside) hideDropdown();
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") hideDropdown();
    });

    // === Manual Language Switch ===
    langDropdown.addEventListener("click", async (e) => {
        const langItem = e.target.closest("[data-lang]");
        if (!langItem) return;

        const langCode = langItem.dataset.lang;
        localStorage.setItem("preferredLang", langCode);
        hideDropdown();
        showLoading();

        try {
            await applyTranslation(langCode);
        } catch (err) {
            console.error("Manual translation failed:", err);
            alert("Could not switch language. Please try again.");
        } finally {
            hideLoading();
        }
    });

    // === Initial Detection & Apply ===
    const detectAndApplyLanguage = async () => {
        let lang = localStorage.getItem("preferredLang") || "en";

        if (!localStorage.getItem("preferredLang")) {
            try {
                const res = await fetch("https://ipapi.co/json/");
                const data = await res.json();
                const code = data.country_code || "IN";
                const map = {
                    IN: "hi", FR: "fr", DE: "de", ES: "es",
                    IT: "it", CN: "zh-CN", JP: "ja", RU: "ru", BR: "pt"
                };
                lang = map[code] || "en";
                localStorage.setItem("preferredLang", lang);
            } catch (err) {
                console.warn("Geo-detection failed, using English.");
            }
        }

        if (lang !== "en") {
            try {
                showLoading();
                await applyTranslation(lang);
            } catch (err) {
                console.warn("Initial language translation failed:", err);
            } finally {
                hideLoading();
            }
        }
    };

    detectAndApplyLanguage();
});
