document.addEventListener("DOMContentLoaded", () => {
    const langButtons = [
        document.getElementById("language-switcher"),
        document.getElementById("language-switcher-mobile")
    ];

    // Wait until Google Translate dropdown is rendered
    const waitForTranslateDropdown = () => {
        return new Promise((resolve) => {
            const checkInterval = setInterval(() => {
                const selectEl = document.querySelector("select.goog-te-combo");
                if (selectEl) {
                    clearInterval(checkInterval);
                    resolve(selectEl);
                }
            }, 300);
        });
    };

    // Detect and apply language based on location and preferences
    window.addEventListener("load", async () => {
        const usedLang = await autoTranslateByCountry();
        console.log(`[Translation] Language applied: ${usedLang}`);
    });

    async function autoTranslateByCountry() {
        const storedLang = localStorage.getItem("preferredLang");
        let finalLang = "en"; // Default language
        let countryCode = "IN";

        try {
            const res = await fetch("https://ipapi.co/json/");
            const data = await res.json();
            countryCode = data.country_code || "IN";
            console.log(`[GeoIP] Detected country: ${countryCode}`);
        } catch {
            console.warn("[GeoIP] Failed. Falling back to browser language.");
        }

        // Country to language mapping
        const langMap = {
            FR: 'fr', DE: 'de', ES: 'es', IT: 'it',
            CN: 'zh-CN', JP: 'ja', RU: 'ru', BR: 'pt'
        };

        // India-specific logic
        if (countryCode === "IN") {
            if (storedLang && storedLang !== "en") {
                finalLang = storedLang;
                await applyTranslation(finalLang);
                return finalLang;
            }
            return "en"; // India defaults to English
        }

        // Outside India: apply auto-detected or stored language
        if (storedLang) {
            finalLang = storedLang;
        } else if (langMap[countryCode]) {
            finalLang = langMap[countryCode];
            localStorage.setItem("preferredLang", finalLang);
        }

        if (finalLang !== "en") {
            await applyTranslation(finalLang);
        }

        return finalLang;
    }

    // Applies translation using Google Translate dropdown
    function applyTranslation(langCode) {
        return new Promise((resolve) => {
            const interval = setInterval(() => {
                const selectEl = document.querySelector("select.goog-te-combo");
                if (selectEl) {
                    selectEl.value = langCode;
                    selectEl.dispatchEvent(new Event("change"));
                    clearInterval(interval);
                    resolve();
                }
            }, 500);
        });
    }

    // Show the dropdown next to clicked button
    function showLanguageDropdown(selectEl, triggerBtn) {
        const rect = triggerBtn.getBoundingClientRect();
        selectEl.style.display = "block";
        selectEl.style.position = "absolute";
        selectEl.style.top = `${rect.bottom + window.scrollY}px`;
        selectEl.style.left = `${rect.left}px`;
        selectEl.style.zIndex = "9999";
        selectEl.style.background = "#fff";
        selectEl.style.padding = "0.5rem";
        selectEl.style.border = "1px solid #ccc";
        selectEl.style.borderRadius = "6px";
        selectEl.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
        selectEl.focus();
    }

    // Init once Google Translate is ready
    waitForTranslateDropdown().then((selectEl) => {
        langButtons.forEach((btn) => {
            if (btn) {
                btn.addEventListener("click", () => showLanguageDropdown(selectEl, btn));
            }
        });

        // Save user's manual language choice
        selectEl.addEventListener("change", (e) => {
            const selectedLang = e.target.value;
            localStorage.setItem("preferredLang", selectedLang);
            console.log(`[Manual] Language manually changed to: ${selectedLang}`);
        });
    });
});
