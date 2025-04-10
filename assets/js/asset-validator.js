/* ===============================================
 Asset & Script Validator v3.5
 AI-Powered Integrity Checker + Load Profiler
=============================================== */
(async function runAssetValidatorV3() {
    const startTime = performance.now();
    const diagnostics = {};
    const styles = {
        log: "color:#fff;background:#e74c3c;padding:2px 6px;border-radius:4px;font-weight:bold;",
        warn: "color:#f39c12;font-weight:bold;",
        info: "color:#3498db;font-weight:bold;",
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

    const getUrlFromEl = (el) => el.getAttribute("src") || el.getAttribute("data") || el.getAttribute("href");

    const fetchHead = async (url) => {
        if (!url || url.startsWith("data:")) return { status: "skipped" };
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

    const getSmartSuggestion = (status, url) => {
        switch (status) {
            case "error":
                return url.includes("cdn") ? "🔁 Check CDN or add local fallback." : "❌ General network error.";
            case "CORS Blocked":
                return "🔒 CORS restriction – consider using `crossorigin` or proxying.";
            case "broken":
                return "🚫 Broken link – check path or spelling.";
            case "slow":
                return "🐢 Slow load – consider compression/CDN optimization.";
            default:
                return "";
        }
    };

    const allAssets = Object.entries(selectors)
        .flatMap(([type, selector]) =>
            [...document.querySelectorAll(selector)].map(el => ({
                el,
                type,
                url: getUrlFromEl(el)
            }))
        );

    console.groupCollapsed(`%c[Asset Validator v3.5] Validating ${allAssets.length} assets...`, styles.info);

    const results = await Promise.all(allAssets.map(asset => fetchHead(asset.url)));

    results.forEach((res, i) => {
        const { status, url, details } = res;
        const type = allAssets[i].type;
        const el = allAssets[i].el;

        if (!diagnostics[type]) diagnostics[type] = [];

        if (status !== "ok" && status !== "skipped") {
            diagnostics[type].push({ url, status, details });
            el.style.outline = "2px dashed red"; // Optional visual marker
        }
    });

    Object.entries(diagnostics).forEach(([type, issues]) => {
        console.groupCollapsed(`%c[${type.toUpperCase()} Issues] (${issues.length})`, styles.warn);
        issues.forEach(({ url, status, details }) => {
            const tip = getSmartSuggestion(status, url);
            console.warn(`%c[${status.toUpperCase()}]`, styles.warn, url, details, tip);
        });
        console.groupEnd();
    });

    if (!Object.keys(diagnostics).length) {
        console.log("%c[✓ All assets validated successfully]", styles.success);
    }

    // ===== Script Execution Order Monitor =====
    const scripts = Array.from(document.scripts);
    console.groupCollapsed("%c[Script Load Order]", styles.info);
    scripts.forEach((script, i) => {
        const label = script.src
            ? `External: ${script.src}`
            : `Inline: ${script.textContent.trim().slice(0, 80)}...`;
        console.log(`%c[${i + 1}] ${label}`, styles.success);
    });
    console.groupEnd();

    const endTime = performance.now();
    console.info(`%c[Validation Complete in ${(endTime - startTime).toFixed(1)}ms]`, styles.info);

})();
