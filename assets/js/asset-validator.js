/* =============================================================
   Asset Validator v4.3 – AI-Enhanced + Retry + Visual Alerts + DOM Snapshot
   =============================================================
   Features:
   ✓ Visual popup alerts for failed assets
   ✓ Automatic retry logic for transient issues
   ✓ Grouping diagnostics by domain/CDN
   ✓ Smart filtering for CORS/external assets
   ✓ Fallback to GET if HEAD fails (configurable)
   ✓ DOM snapshot logging for failed assets
================================================================ */

(async function runAssetValidatorV4_3() {
    const version = "4.3";
    const CONCURRENCY_LIMIT = 5;
    const fallbackToGet = true;
    const RETRY_LIMIT = 2;

    const styles = {
        log: "color:#fff;background:#333;padding:2px 6px;border-radius:4px;font-weight:bold;",
        warn: "color:#f39c12;font-weight:bold;",
        info: "color:#3498db;font-weight:bold;",
        error: "color:#e74c3c;font-weight:bold;",
        success: "color:#2ecc71;font-weight:bold;"
    };

    const ignorePatterns = [
        "google.com/maps", "translate.google.com", "gstatic.com",
        "fonts.googleapis.com", "googletagmanager", "analytics.js",
        "googleusercontent", "youtube.com", "fbcdn.net"
    ];

    const selectors = {
        img: "img[src]",
        script: "script[src]",
        css: "link[rel='stylesheet']",
        video: "video[src]",
        audio: "audio[src]",
        source: "source[src]",
        iframe: "iframe[src]",
        object: "object[data]"
    };

    const getUrl = (el) => el.getAttribute("src") || el.getAttribute("data") || el.getAttribute("href");

    const shouldIgnore = (url) =>
        !url || url.startsWith("data:") || ignorePatterns.some(p => url.includes(p));

    const getTip = (status, url) => {
        if (status === "error" && url.includes("cdn")) return "🔁 Check CDN availability or add a local fallback.";
        if (status === "CORS Blocked") return "🔒 CORS blocked – use a proxy or local asset instead.";
        if (status === "broken") return "🚫 Broken asset – check path or server response.";
        if (status === "slow") return "🐢 Slow load – optimize with compression or a better CDN.";
        return "ℹ️ Review manually.";
    };

    const showPopup = (message, color = "#e74c3c") => {
        const popup = document.createElement("div");
        Object.assign(popup.style, {
            position: "fixed",
            bottom: "20px",
            right: "20px",
            background: color,
            color: "#fff",
            padding: "10px 14px",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "bold",
            zIndex: "9999",
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
            fontFamily: "sans-serif"
        });
        popup.textContent = message;
        document.body.appendChild(popup);
        setTimeout(() => popup.remove(), 6000);
    };

    const captureDomSnapshot = (el) => {
        const wrapper = document.createElement("div");
        wrapper.appendChild(el.cloneNode(true));
        return wrapper.innerHTML;
    };

    const fetchHead = async (url) => {
        if (shouldIgnore(url)) return { url, status: "skipped" };

        const result = { url, status: "ok", details: {} };
        const t0 = performance.now();

        try {
            const res = await fetch(url, { method: "HEAD", cache: "no-store" });
            const duration = performance.now() - t0;
            result.details.duration = `${duration.toFixed(1)}ms`;

            if (!res.ok) {
                result.status = "broken";
                result.details.httpCode = res.status;
            } else if (duration > 2000) {
                result.status = "slow";
            }
        } catch (err) {
            if (fallbackToGet) {
                try {
                    await fetch(url, { method: "GET", mode: "no-cors", cache: "no-store" });
                    result.status = "CORS Blocked";
                    result.details.fallback = "GET fallback triggered";
                } catch (fallbackErr) {
                    result.status = "error";
                    result.details.error = fallbackErr.message;
                }
            } else {
                result.status = "error";
                result.details.error = err.message;
            }
        }

        return result;
    };

    const fetchWithRetry = async (url, retries = RETRY_LIMIT) => {
        for (let i = 0; i <= retries; i++) {
            const result = await fetchHead(url);
            if (result.status === "ok" || result.status === "skipped") return result;
        }
        return await fetchHead(url); // final attempt
    };

    const throttle = (tasks, limit) => {
        const results = [];
        let i = 0;

        return new Promise((resolve) => {
            const next = () => {
                if (i >= tasks.length) return resolve(results);
                const task = tasks[i++];
                task().then((res) => {
                    results.push(res);
                    next();
                });
            };
            for (let j = 0; j < limit; j++) next();
        });
    };

    const groupByDomain = (errors) => {
        const grouped = {};
        errors.forEach(({ url, status, details }) => {
            try {
                const domain = new URL(url).hostname;
                if (!grouped[domain]) grouped[domain] = [];
                grouped[domain].push({ url, status, details });
            } catch {
                // Ignore invalid URLs
            }
        });
        return grouped;
    };

    const startTime = performance.now();
    const diagnostics = {};
    const assets = Object.entries(selectors).flatMap(([type, selector]) =>
        [...document.querySelectorAll(selector)].map(el => ({ el, type, url: getUrl(el) }))
    );

    console.groupCollapsed(`%c[Asset Validator v${version}] Validating ${assets.length} assets...`, styles.info);

    const tasks = assets.map(asset => () => fetchWithRetry(asset.url));
    const results = await throttle(tasks, CONCURRENCY_LIMIT);

    results.forEach((res, i) => {
        const { status, url, details } = res;
        const { type, el } = assets[i];
        if (!diagnostics[type]) diagnostics[type] = [];

        if (status !== "ok" && status !== "skipped") {
            diagnostics[type].push({
                url, status, details,
                domSnapshot: captureDomSnapshot(el)
            });
            el.style.outline = "2px dashed red";
        }
    });

    Object.entries(diagnostics).forEach(([type, issues]) => {
        const byDomain = groupByDomain(issues);
        console.groupCollapsed(`%c[${type.toUpperCase()} Issues by Domain]`, styles.warn);
        Object.entries(byDomain).forEach(([domain, items]) => {
            console.groupCollapsed(`%c${domain} (${items.length})`, styles.error);
            items.forEach(({ url, status, details, domSnapshot }) => {
                console.warn(`%c[${status.toUpperCase()}]`, styles.warn, url, details, getTip(status, url));
                console.log("DOM Snapshot:", domSnapshot);
            });
            console.groupEnd();
        });
        console.groupEnd();
    });

    if (Object.keys(diagnostics).length === 0) {
        console.log("%c[✓ All assets validated successfully]", styles.success);
    } else {
        // showPopup("⚠️ Asset validation failed – check console for details.");
        console.error("%c⚠️ Asset validation failed", styles.error);
    }

    // Log script load order
    const scripts = Array.from(document.scripts);
    console.groupCollapsed("%c[Script Load Order]", styles.info);
    scripts.forEach((s, i) => {
        const label = s.src ? `External: ${s.src}` : `Inline: ${s.textContent.trim().slice(0, 80)}...`;
        console.log(`%c[${i + 1}] ${label}`, styles.success);
    });
    console.groupEnd();

    const totalTime = performance.now() - startTime;
    console.info(`%c[Validation completed in ${totalTime.toFixed(1)}ms]`, styles.info);
})();
