// ===========================================================
// Ghatak AI Error Shield v11.0 (Static Edition)
// Static-site compatible (Netlify + GitHub Pages)
// Logs via FormSubmit | Offline logs via localStorage
// ===========================================================

(function GhatakErrorShield(config = {}) {
    const cfg = {
        formSubmitEndpoint: "https://formsubmit.co/ellowdigitals@gmail.com",
        showBanner: true,
        maxOfflineLogs: 50,
        rateLimit: 5,
        rateWindow: 60000,
        validateAssets: true,
        ...config,
    };

    const styles = {
        log: "color:#fff;background:#e74c3c;padding:2px 6px;border-radius:4px;font-weight:bold;",
        warn: "color:#f39c12;font-weight:bold;",
        info: "color:#3498db;font-weight:bold;",
        success: "color:#2ecc71;font-weight:bold;",
    };

    const state = {
        sessionId: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        recentErrors: new Map(),
        offlineKey: "ghatak_offline_errors",
    };

    const showBanner = (msg, color = "#e74c3c") => {
        if (!cfg.showBanner) return;
        const banner = document.createElement("div");
        banner.textContent = msg;
        Object.assign(banner.style, {
            position: "fixed",
            bottom: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: color,
            color: "#fff",
            padding: "10px 18px",
            borderRadius: "8px",
            fontWeight: "bold",
            fontSize: "14px",
            zIndex: "9999",
            fontFamily: "sans-serif",
        });
        document.body.appendChild(banner);
        setTimeout(() => banner.remove(), 5000);
    };

    const getSuggestion = (msg) => {
        if (/undefined/.test(msg)) return "Ensure the variable is defined.";
        if (/CORS/i.test(msg)) return "Check server CORS settings.";
        if (/timeout|network/i.test(msg)) return "Check internet or API status.";
        if (/not a function/i.test(msg)) return "Check if the method exists.";
        return "No auto-fix suggestion available.";
    };

    const domSnapshot = () => ({
        active: document.activeElement?.outerHTML,
        inputs: Array.from(document.querySelectorAll("input, textarea"))
            .map((el) => ({
                name: el.name || el.id || "unnamed",
                value: /email|pass|phone/i.test(el.name) ? "****" : el.value?.slice(0, 100),
            }))
            .filter((i) => i.value),
        scrollY: window.scrollY,
    });

    const geoMetadata = () =>
        new Promise((resolve) => {
            try {
                navigator.geolocation.getCurrentPosition(
                    (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                    () => resolve(null),
                    { timeout: 2000 }
                );
            } catch {
                resolve(null);
            }
        });

    const performanceMetrics = () => {
        const t = performance.timing;
        return {
            domLoad: t.domContentLoadedEventEnd - t.navigationStart,
            totalLoad: t.loadEventEnd - t.navigationStart,
        };
    };

    const fingerprint = (msg) =>
        btoa(unescape(encodeURIComponent(msg))).slice(0, 50);

    const isRateLimited = (msg) => {
        const key = fingerprint(msg);
        const now = Date.now();
        const entry = state.recentErrors.get(key) || { count: 0, last: 0 };

        if (now - entry.last > cfg.rateWindow) {
            state.recentErrors.set(key, { count: 1, last: now });
            return false;
        }

        entry.count++;
        entry.last = now;
        state.recentErrors.set(key, entry);
        return entry.count > cfg.rateLimit;
    };

    const saveOffline = (entry) => {
        const logs = JSON.parse(localStorage.getItem(state.offlineKey) || "[]");
        logs.push(entry);
        localStorage.setItem(
            state.offlineKey,
            JSON.stringify(logs.slice(-cfg.maxOfflineLogs))
        );
    };

    const submitFormBackup = (entry) => {
        if (!cfg.formSubmitEndpoint) return;

        const simpleMessage = `
  Type: ${entry.type}
  Message: ${entry.message}
  URL: ${entry.url}
  Time: ${entry.timestamp}
  UserAgent: ${entry.userAgent}
  Lang: ${entry.language}
  Suggestion: ${entry.suggestion}
  `.trim();

        fetch(cfg.formSubmitEndpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Accept: "application/json",
            },
            body: new URLSearchParams({
                name: "Ghatak Error Log",
                email: "ellowdigitals@gmail.com",
                message: simpleMessage,
                _captcha: "false",
            }),
        })
            .then((res) => {
                if (res.ok) {
                    console.log("[Ghatak] ✅ Error report submitted.");
                } else {
                    console.warn("[Ghatak] ⚠️ Form submit failed:", res.statusText);
                }
            })
            .catch((err) => {
                console.warn("[Ghatak] ❌ Form submit error:", err);
            });
    };

    const logError = async (type, data) => {
        const msg = data.message || data.reason || "Unknown error";
        if (isRateLimited(msg)) return;

        const stack = data.stack || data.error?.stack || msg;
        const geo = await geoMetadata();

        const entry = {
            type,
            sessionId: state.sessionId,
            message: msg,
            stack: stack?.split("\n").slice(0, 5).join("\n"),
            fingerprint: fingerprint(stack),
            suggestion: getSuggestion(msg),
            timestamp: new Date().toISOString(),
            url: location.href,
            userAgent: navigator.userAgent,
            language: navigator.language,
            platform: navigator.platform,
            performance: performanceMetrics(),
            dom: domSnapshot(),
            geo,
        };

        console.error(`%c[Ghatak Error: ${type}]`, styles.log, msg);
        console.groupCollapsed("%c[Details]", styles.warn);
        console.log(entry);
        console.groupEnd();

        submitFormBackup(entry);
        saveOffline(entry);
        showBanner("⚠️ Error captured and logged.");
    };

    const validateAssets = async () => {
        const assets = [...document.querySelectorAll("script[src], link[rel='stylesheet'], img[src]")];
        const report = [];

        await Promise.all(
            assets.map((el) => {
                const url = el.src || el.href;
                return fetch(url, { method: "HEAD" })
                    .then((res) =>
                        report.push({ url, status: res.status, type: el.tagName })
                    )
                    .catch(() =>
                        report.push({ url, status: "FAILED", type: el.tagName })
                    );
            })
        );

        console.groupCollapsed("%c[Asset Validation]", styles.info);
        report.forEach((a) =>
            console.log(`%c[${a.type}] ${a.url} → ${a.status}`, styles.warn)
        );
        console.groupEnd();
    };

    window.addEventListener("error", (e) => logError("runtime", e));
    window.addEventListener("unhandledrejection", (e) =>
        logError("promise", {
            message: e.reason?.message || e.reason,
            stack: e.reason?.stack,
        })
    );

    if (cfg.validateAssets) validateAssets();

    window.ghatakDev = {
        throwError: () => {
            throw new Error("Test error from ghatakDev");
        },
        rejectPromise: () => Promise.reject("Test rejection from ghatakDev"),
        exportLogs: () => {
            const data = localStorage.getItem(state.offlineKey);
            const blob = new Blob([data], { type: "application/json" });
            const a = document.createElement("a");
            a.href = URL.createObjectURL(blob);
            a.download = `ghatak-log-${Date.now()}.json`;
            a.click();
        },
    };

    console.log(
        "%c[Ghatak AI Error Shield v11.0] Static Mode Active",
        styles.success
    );
})();
