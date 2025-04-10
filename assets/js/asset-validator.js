/* ================================================================
   Asset Validator v4.1.1 – Optimized + AI-Powered Suggestions
   ================================================================
   Enhancements:
   ✓ Smart filtering for external/CORS-heavy assets
   ✓ Cleaner diagnostics grouping and summaries
   ✓ AI tips per issue for dev productivity
   ✓ Fallback to GET if HEAD fails due to CORS (configurable)
================================================================ */

(async function runAssetValidatorV4_1_1() {
    const version = "4.1.1";
    const CONCURRENCY_LIMIT = 5;
    const fallbackToGet = true; // Optional: fallback if HEAD fails

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
                    const getRes = await fetch(url, { method: "GET", mode: "no-cors", cache: "no-store" });
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

    const throttle = (tasks, limit) => {
        const results = [];
        let i = 0;

        return new Promise((resolve) => {
            const next = () => {
                if (i >= tasks.length) return resolve(results);
                tasks[i++]().then(res => {
                    results.push(res);
                    next();
                });
            };
            for (let j = 0; j < limit; j++) next();
        });
    };

    const startTime = performance.now();
    const diagnostics = {};
    const assets = Object.entries(selectors).flatMap(([type, selector]) =>
        [...document.querySelectorAll(selector)].map(el => ({
            el, type, url: getUrl(el)
        }))
    );

    console.groupCollapsed(`%c[Asset Validator v${version}] Validating ${assets.length} assets...`, styles.info);

    const tasks = assets.map(asset => () => fetchHead(asset.url));
    const results = await throttle(tasks, CONCURRENCY_LIMIT);

    results.forEach((res, i) => {
        const { status, url, details } = res;
        const { type, el } = assets[i];
        if (!diagnostics[type]) diagnostics[type] = [];

        if (status !== "ok" && status !== "skipped") {
            diagnostics[type].push({ url, status, details });
            el.style.outline = "2px dashed red";
        }
    });

    // Print diagnostics
    Object.entries(diagnostics).forEach(([type, issues]) => {
        console.groupCollapsed(`%c[${type.toUpperCase()} Issues] (${issues.length})`, styles.warn);
        issues.forEach(({ url, status, details }) => {
            console.warn(`%c[${status.toUpperCase()}]`, styles.warn, url, details, getTip(status, url));
        });
        console.groupEnd();
    });

    if (!Object.keys(diagnostics).length) {
        console.log("%c[✓ All assets validated successfully]", styles.success);
    }

    // Print script load order
    const scripts = Array.from(document.scripts);
    console.groupCollapsed("%c[Script Load Order]", styles.info);
    scripts.forEach((s, i) => {
        const label = s.src
            ? `External: ${s.src}`
            : `Inline: ${s.textContent.trim().slice(0, 80)}...`;
        console.log(`%c[${i + 1}] ${label}`, styles.success);
    });
    console.groupEnd();

    const totalTime = performance.now() - startTime;
    console.info(`%c[Validation completed in ${totalTime.toFixed(1)}ms]`, styles.info);
})();
