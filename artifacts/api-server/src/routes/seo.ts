import { Router } from "express";
import { getLandingHtml } from "../ssr/landing";
import { getTermIndexHtml, getTermHtml, TERMS } from "../ssr/glossary";
import { getGuideIndexHtml, getGuideHtml, FORM_GUIDES } from "../ssr/formGuides";
import { getBaseUrl } from "../ssr/shared";

const router = Router();

const HTML_HEADERS = {
  "Content-Type": "text/html; charset=utf-8",
  "Cache-Control": "public, max-age=86400",
  "X-Robots-Tag": "index, follow",
};

// Landing / marketing page
router.get("/landing", (_req, res) => {
  res.set(HTML_HEADERS).send(getLandingHtml());
});

// Glossary index
router.get("/learn", (_req, res) => {
  res.set(HTML_HEADERS).send(getTermIndexHtml());
});

// Glossary term page
router.get("/learn/:slug", (req, res) => {
  const html = getTermHtml(req.params.slug);
  if (!html) {
    res.status(404).set(HTML_HEADERS).send(getNotFoundHtml("Glossary term not found", "/api/learn"));
    return;
  }
  res.set(HTML_HEADERS).send(html);
});

// Form guides index
router.get("/guides", (_req, res) => {
  res.set(HTML_HEADERS).send(getGuideIndexHtml());
});

// Form guide page
router.get("/guides/:slug", (req, res) => {
  const html = getGuideHtml(req.params.slug);
  if (!html) {
    res.status(404).set(HTML_HEADERS).send(getNotFoundHtml("Form guide not found", "/api/guides"));
    return;
  }
  res.set(HTML_HEADERS).send(html);
});

// Sitemap
router.get("/sitemap.xml", (_req, res) => {
  const baseUrl = getBaseUrl();
  const now = new Date().toISOString().split("T")[0];

  const staticUrls = [
    { loc: `${baseUrl}/api/landing`, priority: "1.0", freq: "weekly" },
    { loc: `${baseUrl}/api/learn`, priority: "0.9", freq: "weekly" },
    { loc: `${baseUrl}/api/guides`, priority: "0.9", freq: "weekly" },
  ];

  const glossaryUrls = TERMS.map(t => ({
    loc: `${baseUrl}/api/learn/${t.slug}`,
    priority: "0.8",
    freq: "monthly",
  }));

  const guideUrls = FORM_GUIDES.map(g => ({
    loc: `${baseUrl}/api/guides/${g.slug}`,
    priority: "0.85",
    freq: "monthly",
  }));

  const allUrls = [...staticUrls, ...glossaryUrls, ...guideUrls];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${u.freq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join("\n")}
</urlset>`;

  res
    .set("Content-Type", "application/xml; charset=utf-8")
    .set("Cache-Control", "public, max-age=3600")
    .send(xml);
});

// Robots.txt
router.get("/robots.txt", (_req, res) => {
  const baseUrl = getBaseUrl();
  res
    .set("Content-Type", "text/plain; charset=utf-8")
    .set("Cache-Control", "public, max-age=86400")
    .send(`User-agent: *
Allow: /

Sitemap: ${baseUrl}/api/sitemap.xml`);
});

function getNotFoundHtml(message: string, backHref: string): string {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Not Found</title></head>
<body style="font-family:Inter,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;flex-direction:column;gap:16px;color:#0f1f3d;">
<h1 style="font-size:48px;font-weight:800;">404</h1>
<p>${message}</p>
<a href="${backHref}" style="color:#1a4b8c;">← Go back</a>
</body></html>`;
}

export default router;
