/* ===========================================================
   Error Handling v8.0
   + AI Suggestions
   + DOM Snapshot
   + Geo-Aware Metadata
   + Performance Metrics
   + Offline Retry (IndexedDB)
   + Script Profiler
   + In-Browser Panel (devtools-lite)
   =========================================================== */

(function initErrorHandlingV8(config = {}) {
    const defaultConfig = {
        logToServer: true,
        useSentry: false,
        sentryDSN: "",
        endpoint: "/log-error",
        localLogKey: "ghatak-error-log",
        maxLogEntries: 100,
        errorRateLimit: 5,
        rateLimitWindow: 60000,
        enableOfflineLog: true,
        showUIBanner: true,
        validateAssets: true,
        backupViaFormSubmit: true,
        formSubmitEndpoint: "https://formsubmit.co/ajax/ghatakgsai@gmail.com"
    };

    const cfg = { ...defaultConfig, ...config };
    const sessionId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const rateMap = new Map();

    // Styles
    const styleLog = "color:#fff;background:#e74c3c;padding:2px 6px;border-radius:4px;font-weight:bold;";
    const styleInfo = "color:#3498db;font-weight:bold;";
    const styleWarn = "color:#f39c12;font-weight:bold;";
    const styleSuccess = "color:#2ecc71;font-weight:bold;";

    // UI Banner
    let banner;
    if (cfg.showUIBanner) {
        banner = document.createElement("div");
        Object.assign(banner.style, {
            position: "fixed", bottom: "20px", left: "50%",
            transform: "translateX(-50%)", backgroundColor: "var(--primary-color, #e74c3c)",
            color: "#fff", padding: "12px 20px", borderRadius: "10px", fontWeight: "600",
            fontSize: "14px", boxShadow: "0 8px 24px rgba(0,0,0,0.2)", zIndex: "9999",
            maxWidth: "80%", textAlign: "center", display: "none"
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
            setTimeout(() => (banner.style.display = "none"), 300);
        }, 5000);
    };

    // Rate Limiting
    const isRateLimited = (msg) => {
        const now = Date.now();
        const entry = rateMap.get(msg) || { count: 0, last: now };
        if (now - entry.last > cfg.rateLimitWindow) {
            rateMap.set(msg, { count: 1, last: now });
            return false;
        }
        entry.count++;
        entry.last = now;
        rateMap.set(msg, entry);
        return entry.count > cfg.errorRateLimit;
    };

    // AI Suggestions
    const aiSuggestFix = (msg) => {
        if (/undefined/.test(msg)) return "Check for uninitialized variables.";
        if (/CORS/.test(msg)) return "Verify CORS headers on your server.";
        if (/timeout/.test(msg)) return "Network timeout. Check connectivity or backend latency.";
        return "No automatic suggestion.";
    };

    // DOM Snapshot
    const getDomSnapshot = () => {
        const active = document.activeElement?.outerHTML;
        const inputs = Array.from(document.querySelectorAll("input, textarea"))
            .map(el => ({ name: el.name || el.id, value: el.value?.slice(0, 50) }))
            .filter(i => i.value);
        return { active, inputs, scrollY: window.scrollY };
    };

    // Geo Metadata
    const getGeo = () => new Promise(resolve => {
        try {
            navigator.geolocation.getCurrentPosition(
                pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                () => resolve(null), { timeout: 3000 }
            );
        } catch {
            resolve(null);
        }
    });

    // Performance Metrics
    const getPerformance = () => {
        const timing = performance.timing;
        return {
            domLoad: timing.domContentLoadedEventEnd - timing.navigationStart,
            totalLoad: timing.loadEventEnd - timing.navigationStart
        };
    };

    // IndexedDB Offline Log (Lite)
    const saveOfflineLog = (entry) => {
        if (!cfg.enableOfflineLog || !window.indexedDB) return;
        const req = indexedDB.open("ghatakErrorLogs", 1);
        req.onupgradeneeded = () => req.result.createObjectStore("logs", { autoIncrement: true });
        req.onsuccess = () => req.result.transaction("logs", "readwrite").objectStore("logs").add(entry);
    };

    const flushOfflineLogs = () => {
        if (!navigator.onLine || !cfg.logToServer || !window.indexedDB) return;
        const req = indexedDB.open("ghatakErrorLogs", 1);
        req.onsuccess = () => {
            const db = req.result;
            const store = db.transaction("logs", "readwrite").objectStore("logs");
            const all = store.getAll();
            all.onsuccess = () => {
                if (!all.result.length) return;
                fetch(cfg.endpoint, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ batch: all.result })
                }).then(() => store.clear());
            };
        };
    };

    // Logger
    const logError = async (type, data) => {
        const message = data.message || data.reason || "Unknown error";
        if (isRateLimited(message)) return;

        const stack = data.error?.stack || data.reason?.stack || message;
        const geo = await getGeo();

        const entry = {
            type, sessionId, message,
            stack: stack?.split("\n").slice(0, 5).join("\n"),
            suggestion: aiSuggestFix(message),
            timestamp: new Date().toISOString(),
            url: location.href,
            userAgent: navigator.userAgent,
            language: navigator.language,
            platform: navigator.platform,
            performance: getPerformance(),
            dom: getDomSnapshot(),
            geo
        };

        console.error(`%c[${type}]`, styleLog, message);
        if (cfg.useSentry && window.Sentry) Sentry.captureException(data.error || data.reason);

        if (cfg.logToServer && navigator.onLine) {
            fetch(cfg.endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(entry)
            });
        }

        if (cfg.backupViaFormSubmit) {
            fetch(cfg.formSubmitEndpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: "Auto Error Report",
                    email: "system@ghatakgsai.in",
                    message: JSON.stringify(entry, null, 2)
                })
            });
        }

        saveOfflineLog(entry);
        if (cfg.showUIBanner) showBanner("⚠️ Error captured and sent to admin.");
    };

    window.addEventListener("error", e => logError("error", e));
    window.addEventListener("unhandledrejection", e => logError("unhandledrejection", { reason: e.reason }));
    window.addEventListener("online", flushOfflineLogs);
    flushOfflineLogs();

    // Script Profiler
    const scripts = [...document.scripts];
    console.groupCollapsed("%c[Script Load Order]", styleInfo);
    scripts.forEach((s, i) => {
        const src = s.src ? s.src : s.textContent.slice(0, 40);
        console.log(`%c[${i + 1}] ${src}`, styleSuccess);
    });
    console.groupEnd();

    console.info("%c[ErrorHandling v8.0 Ready]", styleInfo);
})();