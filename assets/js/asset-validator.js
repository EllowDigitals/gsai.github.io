/* ================================================================
   Asset Validator v4.1 – Static Site Optimized + AI Tips
   ================================================================
   Enhancements:
   ✓ Skip known CORS-blocked or external assets
   ✓ Filter 3rd party embeds like Google Maps, Translate, etc.
   ✓ Improved error resilience + cleaner logs
   ✓ Configurable ignorePatterns and asset filtering
================================================================ */

(async function runAssetValidatorV4_1() {
    const version = "4.1";
    const startTime = performance.now();
    const diagnostics = {};
    const CONCURRENCY_LIMIT = 5;

    const styles = {
        log: "color:#fff;background:#333;padding:2px 6px;border-radius:4px;font-weight:bold;",
        warn: "color:#f39c12;font-weight:bold;",
        info: "color:#3498db;font-weight:bold;",
        error: "color:#e74c3c;font-weight:bold;",
        success: "color:#2ecc71;font-weight:bold;"
    };

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

    const ignorePatterns = [
        "google.com/maps",
        "googleusercontent",
        "translate.google.com",
        "gstatic.com",
        "fonts.googleapis.com",
        "googletagmanager",
        "analytics.js"
    ];

    const getUrl = (el) => el.getAttribute("src") || el.getAttribute("data") || el.getAttribute("href");

    const getTip = (status, url) => {
        if (status === "error" && url.includes("cdn")) return "🔁 Check CDN availability or add a local fallback.";
        if (status === "CORS Blocked") return "🔒 CORS blocked – use a proxy or check headers.";
        if (status === "broken") return "🚫 Broken asset – check path, filename, or server config.";
        if (status === "slow") return "🐢 Slow load – consider compression or CDN optimization.";
        return "ℹ️ Review manually.";
    };

    const shouldIgnore = (url) =>
        !url || url.startsWith("data:") || ignorePatterns.some(p => url.includes(p));

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
            result.status = "error";
            result.details.error = err.message.includes("CORS") ? "CORS Blocked" : err.message;
        }

        return result;
    };

    const throttle = (tasks, limit) => {
        const results = [];
        let index = 0;

        return new Promise((resolve) => {
            const next = () => {
                if (index >= tasks.length) {
                    if (results.length === tasks.length) resolve(results);
                    return;
                }
                const current = tasks[index++];
                current().then((res) => {
                    results.push(res);
                    next();
                });
            };
            for (let i = 0; i < limit; i++) next();
        });
    };

    const assets = Object.entries(selectors)
        .flatMap(([type, selector]) =>
            [...document.querySelectorAll(selector)].map((el) => ({
                el,
                type,
                url: getUrl(el)
            }))
        );

    console.groupCollapsed(`%c[Asset Validator v${version}] Scanning ${assets.length} assets...`, styles.info);

    const tasks = assets.map((asset) => () => fetchHead(asset.url));
    const results = await throttle(tasks, CONCURRENCY_LIMIT);

    results.forEach((res, i) => {
        const { status, url, details } = res;
        const { type, el } = assets[i];
        if (!diagnostics[type]) diagnostics[type] = [];

        if (status !== "ok" && status !== "skipped") {
            diagnostics[type].push({ url, status, details });
            el.style.outline = "2px dashed red"; // Visual feedback
        }
    });

    Object.entries(diagnostics).forEach(([type, issues]) => {
        console.groupCollapsed(`%c[${type.toUpperCase()} Issues] (${issues.length})`, styles.warn);
        issues.forEach(({ url, status, details }) => {
            const tip = getTip(status, url);
            console.warn(`%c[${status.toUpperCase()}]`, styles.warn, url, details, tip);
        });
        console.groupEnd();
    });

    if (!Object.keys(diagnostics).length) {
        console.log("%c[✓ All assets validated successfully]", styles.success);
    }

    // === Script Load Debugger ===
    const scripts = Array.from(document.scripts);
    console.groupCollapsed("%c[Script Load Order]", styles.info);
    scripts.forEach((script, i) => {
        const label = script.src
            ? `External: ${script.src}`
            : `Inline: ${script.textContent.trim().slice(0, 80)}...`;
        console.log(`%c[${i + 1}] ${label}`, styles.success);
    });
    console.groupEnd();

    const duration = performance.now() - startTime;
    console.info(`%c[Validation Completed in ${duration.toFixed(1)}ms]`, styles.info);
})();
