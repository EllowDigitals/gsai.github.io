document.addEventListener("DOMContentLoaded", () => {
    // ====== Elements & Setup ======
    const desktopLangBtn = document.getElementById("language-switcher");
    const mobileLangBtn = document.getElementById("language-switcher-mobile");
    const langDropdown = document.getElementById("language-dropdown");
    const langButtons = [desktopLangBtn, mobileLangBtn].filter(Boolean);

    // Loading indicator (optional)
    const loadingIndicator = document.createElement("div");
    loadingIndicator.id = "language-loading";
    loadingIndicator.textContent = "Translating...";
    loadingIndicator.style.cssText = `
      position: fixed;
      top: 1rem;
      right: 1rem;
      background: #333;
      color: #fff;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      font-size: 0.95rem;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
      z-index: 2000;
      display: none;
    `;
    document.body.appendChild(loadingIndicator);
    const showLoading = () => (loadingIndicator.style.display = "block");
    const hideLoading = () => {
        setTimeout(() => {
            loadingIndicator.style.display = "none";
        }, 2000);
    };

    // ====== Utility: Wait For Google Translate ======
    // Waits up to `timeout` ms for the <select class="goog-te-combo"> element.
    function waitForGoogleTranslate(timeout = 20000) {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();
            const interval = setInterval(() => {
                const gtSelect = document.querySelector("select.goog-te-combo");
                if (gtSelect) {
                    clearInterval(interval);
                    console.log("Google Translate element found.");
                    resolve(gtSelect);
                }
                if (Date.now() - startTime >= timeout) {
                    clearInterval(interval);
                    reject(new Error("Timeout waiting for Google Translate element."));
                }
            }, 100);
        });
    }

    // ====== Dropdown Functions ======
    const showDropdown = (button) => {
        langDropdown.classList.remove("hidden");
        langDropdown.classList.add("show");
        if (window.innerWidth > 768) {
            const rect = button.getBoundingClientRect();
            langDropdown.style.top = `${rect.bottom + window.scrollY + 8}px`;
            langDropdown.style.left = `${rect.left}px`;
            langDropdown.style.transform = "none";
        } else {
            langDropdown.style.position = "fixed";
            langDropdown.style.top = "auto";
            langDropdown.style.bottom = "80px";
            langDropdown.style.left = "50%";
            langDropdown.style.transform = "translateX(-50%)";
        }
    };

    const hideDropdown = () => {
        langDropdown.classList.remove("show");
        langDropdown.classList.add("hidden");
    };

    const toggleDropdown = (button) => {
        if (langDropdown.classList.contains("show")) {
            hideDropdown();
        } else {
            showDropdown(button);
        }
    };

    // ====== Event Listeners for Dropdown Toggle ======
    langButtons.forEach((btn) => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            toggleDropdown(btn);
        });
    });

    // Close dropdown when clicking outside
    document.addEventListener("click", (e) => {
        const clickedInside =
            langDropdown.contains(e.target) ||
            langButtons.some((btn) => btn.contains(e.target));
        if (!clickedInside) {
            hideDropdown();
        }
    });

    // Close dropdown on Escape key press.
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            hideDropdown();
        }
    });

    // ====== Handle Language Selection ======
    langDropdown.addEventListener("click", async (e) => {
        const langItem = e.target.closest("[data-lang]");
        if (!langItem) return;
        const selectedLang = langItem.dataset.lang;
        localStorage.setItem("preferredLang", selectedLang);
        hideDropdown();
        showLoading();
        try {
            await applyTranslation(selectedLang);
            console.log(`Translation applied for ${selectedLang}.`);
            // Refresh the page to finalize the language change.
            setTimeout(() => {
                window.location.reload();
            }, 500);
        } catch (error) {
            console.error("Error applying translation:", error);
            alert("There was an error applying the translation. Please try again later.");
            hideLoading();
        }
    });

    // ====== Apply Translation Using Google Translate ======
    // Waits for the Google Translate element and triggers a change event.
    const applyTranslation = (langCode) => {
        return waitForGoogleTranslate()
            .then((gtSelect) => {
                gtSelect.value = langCode;
                gtSelect.dispatchEvent(new Event("change"));
            })
            .catch((err) => {
                console.error("Error applying translation:", err);
                // Optionally resolve here to avoid blocking the promise chain.
                return Promise.resolve();
            });
    };

    // ====== Auto-detect and Apply Language ======
    async function detectAndApplyLanguage() {
        let finalLang = "en";
        const storedLang = localStorage.getItem("preferredLang");
        if (storedLang) {
            finalLang = storedLang;
            await applyTranslation(finalLang);
            return;
        }
        // Default country code
        let countryCode = "IN";
        try {
            const response = await fetch("https://ipapi.co/json/");
            const data = await response.json();
            countryCode = data.country_code || "IN";
        } catch (err) {
            console.warn("IP lookup failed. Using default country code:", countryCode);
        }
        const langMap = {
            IN: "hi",
            FR: "fr",
            DE: "de",
            ES: "es",
            IT: "it",
            CN: "zh-CN",
            JP: "ja",
            RU: "ru",
            BR: "pt",
        };
        finalLang = langMap[countryCode] || "en";
        localStorage.setItem("preferredLang", finalLang);
        if (finalLang !== "en") {
            await applyTranslation(finalLang);
        }
    }

    // ====== Initialize ======
    detectAndApplyLanguage();
});
