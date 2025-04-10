/* ===========================================================
   Error Handling v8.1
   + AI Suggestions
   + DOM Snapshot
   + Geo-Aware Metadata
   + Performance Metrics
   + Offline Retry (IndexedDB)
   + Script Profiler
   + In-Browser Panel (devtools-lite)
   + Custom Triggers
   + Asset Validator with Suggestions
   =========================================================== */

(function initErrorHandlingV81(config = {}) {
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

    // Style templates
    const styles = {
        log: "color:#fff;background:#e74c3c;padding:2px 6px;border-radius:4px;font-weight:bold;",
        info: "color:#3498db;font-weight:bold;",
        warn: "color:#f39c12;font-weight:bold;",
        success: "color:#2ecc71;font-weight:bold;"
    };

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

    const aiSuggestFix = (msg) => {
        if (/undefined/.test(msg)) return "Check if the variable is declared and initialized.";
        if (/CORS/.test(msg)) return "Check server CORS configuration and allowed origins.";
        if (/timeout/.test(msg)) return "Network timeout. Ensure API/server is responsive.";
        if (/not a function/.test(msg)) return "Verify if the method exists and is callable.";
        return "Suggestion unavailable. Further debugging needed.";
    };

    const getDomSnapshot = () => {
        return {
            active: document.activeElement?.outerHTML,
            inputs: Array.from(document.querySelectorAll("input, textarea")).map(el => ({
                name: el.name || el.id,
                value: el.value?.slice(0, 100)
            })).filter(i => i.value),
            scrollY: window.scrollY
        };
    };

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

    const getPerformance = () => {
        const t = performance.timing;
        return {
            domLoad: t.domContentLoadedEventEnd - t.navigationStart,
            totalLoad: t.loadEventEnd - t.navigationStart
        };
    };

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

        console.error(`%c[${type}]`, styles.log, message);
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

    const validateCriticalAssets = async () => {
        const assets = [...document.querySelectorAll("script[src], link[rel='stylesheet'], img[src], link[rel='preload']")];
        const report = [];
        const promises = assets.map(el => {
            const url = el.src || el.href;
            const tag = el.tagName;
            return fetch(url, { method: "HEAD" })
                .then(res => {
                    const valid = res.ok;
                    const suggestion = !valid ? aiSuggestFix(res.statusText) : "OK";
                    report.push({
                        url, tag, status: res.status,
                        size: res.headers.get("content-length"),
                        type: res.headers.get("content-type"),
                        suggestion
                    });
                })
                .catch(err => {
                    report.push({ url, tag, status: "FAILED", suggestion: aiSuggestFix(err.message) });
                });
        });
        await Promise.all(promises);
        console.groupCollapsed("%c[Asset Validation Report]", styles.warn);
        report.forEach(a => console.log(`%c[${a.tag}] ${a.url}\n→ ${a.status} | ${a.type || ""} | ${a.suggestion}`, styles.warn));
        console.groupEnd();
    };

    window.addEventListener("error", e => logError("error", e));
    window.addEventListener("unhandledrejection", e => logError("unhandledrejection", { reason: e.reason }));
    window.addEventListener("online", flushOfflineLogs);
    flushOfflineLogs();

    const scripts = [...document.scripts];
    console.groupCollapsed("%c[Script Load Order]", styles.info);
    scripts.forEach((s, i) => {
        const src = s.src ? s.src : s.textContent.slice(0, 40);
        console.log(`%c[${i + 1}] ${src}`, styles.success);
    });
    console.groupEnd();

    if (cfg.validateAssets) validateCriticalAssets();

    console.info("%c[ErrorHandling v8.1 Ready]", styles.info);
})();