// document.addEventListener("DOMContentLoaded", async () => {
//     const supportedLanguages = ['en', 'hi', 'fr', 'de', 'es', 'it', 'zh-CN', 'ja', 'ru', 'pt'];
//     const defaultLang = 'en';

//     const langBtns = [
//         document.getElementById("language-switcher"),
//         document.getElementById("language-switcher-mobile")
//     ].filter(Boolean);
//     const langDropdown = document.getElementById("language-dropdown");

//     // Loading indicator
//     const loadingIndicator = document.createElement("div");
//     loadingIndicator.id = "language-loading";
//     loadingIndicator.textContent = "Translating...";
//     Object.assign(loadingIndicator.style, {
//         position: "fixed",
//         top: "1rem",
//         right: "1rem",
//         backgroundColor: "#333",
//         color: "#fff",
//         padding: "0.5rem 1rem",
//         borderRadius: "6px",
//         fontSize: "0.95rem",
//         boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
//         zIndex: "2000",
//         display: "none"
//     });
//     document.body.appendChild(loadingIndicator);

//     const showLoading = () => loadingIndicator.style.display = "block";
//     const hideLoading = () => setTimeout(() => (loadingIndicator.style.display = "none"), 1000);

//     // Fetch translation file
//     const fetchTranslation = async (lang) => {
//         const res = await fetch(`/locales/${lang}.json`);
//         if (!res.ok) throw new Error(`Translation file for "${lang}" not found`);
//         return res.json();
//     };

//     // Apply translations to all elements with data-i18n
//     const applyTranslation = (translations) => {
//         document.querySelectorAll("[data-i18n]").forEach(elem => {
//             const key = elem.getAttribute("data-i18n");
//             if (translations[key]) {
//                 elem.textContent = translations[key];
//             } else {
//                 console.warn(`Missing translation key: "${key}"`);
//             }
//         });

//         // Optional: Support for innerHTML replacement
//         document.querySelectorAll("[data-i18n-html]").forEach(elem => {
//             const key = elem.getAttribute("data-i18n-html");
//             if (translations[key]) {
//                 elem.innerHTML = translations[key];
//             } else {
//                 console.warn(`Missing translation key: "${key}"`);
//             }
//         });
//     };

//     const setLanguage = async (lang) => {
//         if (!supportedLanguages.includes(lang)) return;
//         showLoading();
//         try {
//             const translations = await fetchTranslation(lang);
//             applyTranslation(translations);
//             localStorage.setItem("preferredLang", lang);
//         } catch (err) {
//             console.error("Translation failed:", err);
//         } finally {
//             hideLoading();
//         }
//     };

//     // Auto-detect based on saved or geolocation
//     const detectLanguage = async () => {
//         const saved = localStorage.getItem("preferredLang");
//         if (saved) return saved;

//         try {
//             const res = await fetch("https://ipapi.co/json/");
//             const data = await res.json();
//             const map = {
//                 IN: "hi", FR: "fr", DE: "de", ES: "es",
//                 IT: "it", CN: "zh-CN", JP: "ja", RU: "ru", BR: "pt"
//             };
//             const detected = map[data.country_code] || defaultLang;
//             localStorage.setItem("preferredLang", detected);
//             return detected;
//         } catch {
//             return defaultLang;
//         }
//     };

//     // Toggle dropdown visibility
//     const toggleDropdown = (btn) => {
//         const visible = langDropdown.classList.contains("show");
//         langDropdown.classList.toggle("show", !visible);
//         langDropdown.classList.toggle("hidden", visible);

//         const { bottom, left } = btn.getBoundingClientRect();
//         Object.assign(langDropdown.style, {
//             position: window.innerWidth <= 768 ? "fixed" : "absolute",
//             top: window.innerWidth <= 768 ? "auto" : `${bottom + window.scrollY + 8}px`,
//             bottom: window.innerWidth <= 768 ? "80px" : "auto",
//             left: window.innerWidth <= 768 ? "50%" : `${left}px`,
//             transform: window.innerWidth <= 768 ? "translateX(-50%)" : "none"
//         });
//     };

//     // Events
//     langBtns.forEach(btn => btn.addEventListener("click", e => {
//         e.preventDefault();
//         toggleDropdown(btn);
//     }));

//     document.addEventListener("click", (e) => {
//         if (!langDropdown.contains(e.target) && !langBtns.some(btn => btn.contains(e.target))) {
//             langDropdown.classList.remove("show");
//             langDropdown.classList.add("hidden");
//         }
//     });

//     document.addEventListener("keydown", (e) => {
//         if (e.key === "Escape") {
//             langDropdown.classList.remove("show");
//             langDropdown.classList.add("hidden");
//         }
//     });

//     // Manual language change via dropdown
//     langDropdown.addEventListener("click", async (e) => {
//         const item = e.target.closest("[data-lang]");
//         if (!item) return;

//         const lang = item.dataset.lang;
//         await setLanguage(lang);

//         langDropdown.classList.remove("show");
//         langDropdown.classList.add("hidden");
//     });

//     // === Init ===
//     const lang = await detectLanguage();
//     await setLanguage(lang);
// });
