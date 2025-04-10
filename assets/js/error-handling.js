/* ===========================================================
   Error Handling v9.0 - Ghatak AI Error Shield
   + AI Suggestions
   + DOM Snapshot
   + Geo Metadata
   + Performance Metrics
   + IndexedDB/LocalStorage Offline Retry
   + Script Profiler + Asset Validator
   + DevTools UI + Network Tracker
   + Stack Fingerprinting + Deduplication
   =========================================================== */
(function initErrorHandlingV90(config = {}) {
    const cfg = {
        logToServer: true,
        useSentry: false,
        sentryDSN: "",
        endpoint: "/log-error",
        localLogKey: "ghatak-error-log",
        errorRateLimit: 5,
        rateLimitWindow: 60000,
        enableOfflineLog: true,
        showUIBanner: true,
        validateAssets: true,
        backupViaFormSubmit: true,
        formSubmitEndpoint: "https://formsubmit.co/ajax/ellowdigitals@gmail.com",
        ...config
    };

    const styles = {
        log: "color:#fff;background:#e74c3c;padding:2px 6px;border-radius:4px;font-weight:bold;",
        info: "color:#2980b9;font-weight:bold;",
        warn: "color:#d35400;font-weight:bold;",
        success: "color:#27ae60;font-weight:bold;"
    };

    const sessionId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const rateMap = new Map();
    const offlineStorageKey = "ghatak-error-buffer";
    let banner;

    const showBanner = (msg, color = "#e74c3c") => {
        if (!cfg.showUIBanner) return;
        if (!banner) {
            banner = document.createElement("div");
            Object.assign(banner.style, {
                position: "fixed", bottom: "20px", left: "50%", transform: "translateX(-50%)",
                backgroundColor: color, color: "#fff", padding: "12px 20px", borderRadius: "10px",
                fontWeight: "600", fontSize: "14px", boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
                zIndex: "9999", maxWidth: "90%", textAlign: "center", display: "none"
            });
            document.body.appendChild(banner);
        }
        banner.textContent = msg;
        banner.style.display = "block";
        banner.style.opacity = "1";
        clearTimeout(banner.timer);
        banner.timer = setTimeout(() => {
            banner.style.opacity = "0";
            setTimeout(() => (banner.style.display = "none"), 300);
        }, 6000);
    };

    const fingerprintStack = (stack) =>
        btoa(unescape(encodeURIComponent(stack.split("\n").slice(0, 3).join("")))).slice(0, 32);

    const isRateLimited = (msg) => {
        const key = fingerprintStack(msg);
        const now = Date.now();
        const entry = rateMap.get(key) || { count: 0, last: now };
        if (now - entry.last > cfg.rateLimitWindow) {
            rateMap.set(key, { count: 1, last: now });
            return false;
        }
        entry.count++;
        entry.last = now;
        rateMap.set(key, entry);
        return entry.count > cfg.errorRateLimit;
    };

    const aiSuggestFix = (msg) => {
        if (/undefined/.test(msg)) return "Check if the variable is declared and initialized.";
        if (/CORS/.test(msg)) return "Check server CORS configuration and allowed origins.";
        if (/timeout/.test(msg)) return "Network timeout. Ensure API/server is responsive.";
        if (/not a function/.test(msg)) return "Verify if the method exists and is callable.";
        if (/failed to fetch/i.test(msg)) return "Ensure the endpoint exists and is accessible.";
        return "Suggestion unavailable. Further debugging needed.";
    };

    const getDomSnapshot = () => ({
        active: document.activeElement?.outerHTML,
        inputs: Array.from(document.querySelectorAll("input, textarea")).map(el => ({
            name: el.name || el.id,
            value: el.value?.slice(0, 100)
        })).filter(i => i.value),
        scrollY: window.scrollY
    });

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

    const saveOffline = (entry) => {
        if (!cfg.enableOfflineLog) return;
        if (window.indexedDB) {
            const req = indexedDB.open("ghatakErrorLogs", 1);
            req.onupgradeneeded = () => {
                if (!req.result.objectStoreNames.contains("logs")) {
                    req.result.createObjectStore("logs", { autoIncrement: true });
                }
            };
            req.onsuccess = () => {
                const db = req.result;
                if (!db.objectStoreNames.contains("logs")) return;
                db.transaction("logs", "readwrite").objectStore("logs").add(entry);
            };
        } else {
            const buffer = JSON.parse(localStorage.getItem(offlineStorageKey) || "[]");
            buffer.push(entry);
            localStorage.setItem(offlineStorageKey, JSON.stringify(buffer.slice(-cfg.errorRateLimit)));
        }
    };

    const flushOffline = () => {
        if (!navigator.onLine || !cfg.logToServer) return;
        if (window.indexedDB) {
            const req = indexedDB.open("ghatakErrorLogs", 1);
            req.onsuccess = () => {
                const db = req.result;
                if (!db.objectStoreNames.contains("logs")) return;
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
        } else {
            const buffer = JSON.parse(localStorage.getItem(offlineStorageKey) || "[]");
            if (buffer.length) {
                fetch(cfg.endpoint, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ batch: buffer })
                }).then(() => localStorage.removeItem(offlineStorageKey));
            }
        }
    };

    const submitBackupForm = (entry) => {
        if (!cfg.backupViaFormSubmit) return;
        fetch(cfg.formSubmitEndpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({
                name: "Auto Error Report",
                message: JSON.stringify(entry, null, 2)
            })
        }).then(res => {
            if (!res.ok) throw new Error("Backup form submission failed");
        }).catch(err => {
            console.warn("Backup formsubmit error:", err);
        });
    };

    const logError = async (type, data) => {
        const message = data.message || data.reason || "Unknown error";
        if (isRateLimited(message)) return;

        const stack = data.error?.stack || data.reason?.stack || message;
        const geo = await getGeo();

        const entry = {
            type, sessionId, message,
            stack: stack?.split("\n").slice(0, 5).join("\n"),
            fingerprint: fingerprintStack(stack),
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

        submitBackupForm(entry);
        saveOffline(entry);
        showBanner("⚠️ Error captured and logged.", "#e74c3c");

        console.groupCollapsed("%c[Error Log]", styles.warn);
        console.log(entry);
        console.groupEnd();
    };

    const validateAssets = async () => {
        const assets = [...document.querySelectorAll("script[src], link[rel='stylesheet'], img[src], link[rel='preload']")];
        const report = [];
        const promises = assets.map(el => {
            const url = el.src || el.href;
            const tag = el.tagName;
            return fetch(url, { method: "HEAD" }).then(res => {
                const suggestion = !res.ok ? aiSuggestFix(res.statusText) : "OK";
                report.push({
                    url, tag, status: res.status,
                    size: res.headers.get("content-length"),
                    type: res.headers.get("content-type"),
                    suggestion
                });
            }).catch(err => {
                report.push({ url, tag, status: "FAILED", suggestion: aiSuggestFix(err.message) });
            });
        });
        await Promise.all(promises);
        console.groupCollapsed("%c[Asset Validation Report]", styles.warn);
        report.forEach(a => console.log(`%c[${a.tag}] ${a.url}\n→ ${a.status} | ${a.suggestion}`, styles.warn));
        console.groupEnd();
    };

    // Event Listeners
    window.addEventListener("error", e => logError("error", e));
    window.addEventListener("unhandledrejection", e => logError("unhandledrejection", { reason: e.reason }));
    window.addEventListener("online", flushOffline);
    flushOffline();

    // Script Info
    console.groupCollapsed("%c[Script Load Order]", styles.info);
    [...document.scripts].forEach((s, i) => {
        const src = s.src || s.textContent.slice(0, 40);
        console.log(`%c[${i + 1}] ${src}`, styles.success);
    });
    console.groupEnd();

    if (cfg.validateAssets) validateAssets();
    showBanner("✅ ErrorHandler v9.0 Active", "#27ae60");
    console.log("%c[ErrorHandler v9.0] Initialized", styles.success);

    // Dev Mode Shortcuts
    window.ghatakDev = {
        errorTest: () => { throw new Error("Test Error Triggered") },
        rejectTest: () => Promise.reject("Test Rejection Triggered"),
        flushOffline,
        validateAssets
    };
})();
