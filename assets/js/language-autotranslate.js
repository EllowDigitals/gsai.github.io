document.addEventListener("DOMContentLoaded", () => {
    // === Elements & Setup ===
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

    const showLoading = () => (loadingIndicator.style.display = "block");
    const hideLoading = () => setTimeout(() => {
        loadingIndicator.style.display = "none";
    }, 2000);

    // === Utility: Wait for Google Translate ===
    const waitForGoogleTranslate = (timeout = 20000) =>
        new Promise((resolve, reject) => {
            const start = Date.now();
            const interval = setInterval(() => {
                const gtSelect = document.querySelector("select.goog-te-combo");
                if (gtSelect) {
                    clearInterval(interval);
                    resolve(gtSelect);
                } else if (Date.now() - start > timeout) {
                    clearInterval(interval);
                    reject(new Error("Timeout waiting for Google Translate."));
                }
            }, 100);
        });

    // === Dropdown Logic ===
    const showDropdown = (btn) => {
        langDropdown.classList.remove("hidden");
        langDropdown.classList.add("show");

        if (window.innerWidth > 768) {
            const { bottom, left } = btn.getBoundingClientRect();
            langDropdown.style.top = `${bottom + window.scrollY + 8}px`;
            langDropdown.style.left = `${left}px`;
            langDropdown.style.transform = "none";
        } else {
            Object.assign(langDropdown.style, {
                position: "fixed",
                top: "auto",
                bottom: "80px",
                left: "50%",
                transform: "translateX(-50%)",
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
        const insideClick = langDropdown.contains(e.target) || langButtons.some(btn => btn.contains(e.target));
        if (!insideClick) hideDropdown();
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") hideDropdown();
    });

    // === Language Selection Logic ===
    langDropdown.addEventListener("click", async (e) => {
        const langItem = e.target.closest("[data-lang]");
        if (!langItem) return;
        const langCode = langItem.dataset.lang;

        localStorage.setItem("preferredLang", langCode);
        hideDropdown();
        showLoading();

        try {
            await applyTranslation(langCode);
            setTimeout(() => window.location.reload(), 500);
        } catch (err) {
            console.error("Translation failed:", err);
            alert("Could not switch language. Try again.");
            hideLoading();
        }
    });

    // === Apply Translation ===
    const applyTranslation = async (langCode) => {
        try {
            const select = await waitForGoogleTranslate();
            select.value = langCode;
            select.dispatchEvent(new Event("change"));
        } catch (err) {
            console.warn("Google Translate element not found:", err);
            return Promise.resolve(); // prevent app break
        }
    };

    // === Language Detection ===
    const detectAndApplyLanguage = async () => {
        let lang = localStorage.getItem("preferredLang") || "en";

        if (!localStorage.getItem("preferredLang")) {
            try {
                const res = await fetch("https://ipapi.co/json/");
                const data = await res.json();
                const code = data.country_code || "IN";
                const map = {
                    IN: "hi",
                    FR: "fr",
                    DE: "de",
                    ES: "es",
                    IT: "it",
                    CN: "zh-CN",
                    JP: "ja",
                    RU: "ru",
                    BR: "pt"
                };
                lang = map[code] || "en";
                localStorage.setItem("preferredLang", lang);
            } catch (err) {
                console.warn("Geo-detection failed. Defaulting to English.");
            }
        }

        if (lang !== "en") {
            await applyTranslation(lang);
        }
    };

    // === Init ===
    detectAndApplyLanguage();
});
