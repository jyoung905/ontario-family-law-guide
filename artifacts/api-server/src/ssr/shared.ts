// Shared HTML shell for all SSR/SEO pages
// Design system: #1a4b8c navy, #c9a227 gold, #f5f7fa background, Inter font

const BASE_URL = process.env["REPLIT_DOMAINS"]
  ? `https://${process.env["REPLIT_DOMAINS"].split(",")[0]}`
  : "http://localhost:8080";

export function getBaseUrl() {
  return BASE_URL;
}

const CSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { font-family: 'Inter', system-ui, -apple-system, sans-serif; scroll-behavior: smooth; }
  body { background: #f5f7fa; color: #0f1f3d; line-height: 1.6; }
  a { color: #1a4b8c; text-decoration: none; }
  a:hover { text-decoration: underline; }
  img { max-width: 100%; }

  .site-header {
    background: #1a4b8c;
    padding: 0 24px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: sticky;
    top: 0;
    z-index: 100;
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  }
  .site-header .logo {
    display: flex;
    align-items: center;
    gap: 10px;
    color: #fff;
    font-weight: 800;
    font-size: 16px;
    text-decoration: none;
  }
  .site-header .logo-icon {
    width: 32px; height: 32px;
    background: #c9a227;
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px;
  }
  .site-header nav { display: flex; gap: 20px; align-items: center; }
  .site-header nav a { color: rgba(255,255,255,0.85); font-size: 14px; font-weight: 500; text-decoration: none; }
  .site-header nav a:hover { color: #fff; text-decoration: none; }
  .site-header .cta-btn {
    background: #c9a227; color: #0f1f3d;
    padding: 8px 18px; border-radius: 8px;
    font-weight: 700; font-size: 14px;
    text-decoration: none;
  }
  .site-header .cta-btn:hover { background: #b8921f; text-decoration: none; }

  .site-footer {
    background: #0f1f3d;
    color: rgba(255,255,255,0.7);
    padding: 48px 24px 32px;
    margin-top: 64px;
  }
  .footer-grid {
    max-width: 1100px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr;
    gap: 40px;
    margin-bottom: 40px;
  }
  .footer-brand p { font-size: 13px; line-height: 1.7; margin-top: 10px; max-width: 260px; }
  .footer-col h4 { color: #fff; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 14px; }
  .footer-col a { display: block; color: rgba(255,255,255,0.65); font-size: 13px; margin-bottom: 8px; text-decoration: none; }
  .footer-col a:hover { color: #c9a227; text-decoration: none; }
  .footer-bottom { max-width: 1100px; margin: 0 auto; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 24px; font-size: 12px; color: rgba(255,255,255,0.45); }

  .container { max-width: 820px; margin: 0 auto; padding: 0 20px; }
  .container-wide { max-width: 1100px; margin: 0 auto; padding: 0 20px; }

  .badge {
    display: inline-block;
    background: #c9a22715;
    color: #c9a227;
    border: 1px solid #c9a22740;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.8px;
    text-transform: uppercase;
  }
  .badge-primary {
    background: #1a4b8c15;
    color: #1a4b8c;
    border-color: #1a4b8c40;
  }

  .breadcrumb {
    font-size: 13px;
    color: #6b7280;
    padding: 14px 0;
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
  }
  .breadcrumb a { color: #1a4b8c; text-decoration: none; }
  .breadcrumb a:hover { text-decoration: underline; }
  .breadcrumb span { color: #9ca3af; }

  .disclaimer-box {
    background: #fffbeb;
    border: 1px solid #fde68a;
    border-radius: 10px;
    padding: 14px 18px;
    font-size: 13px;
    color: #92400e;
    line-height: 1.6;
    margin: 24px 0;
    display: flex;
    gap: 10px;
    align-items: flex-start;
  }

  @media (max-width: 768px) {
    .site-header nav { display: none; }
    .footer-grid { grid-template-columns: 1fr 1fr; gap: 32px; }
    .footer-brand { grid-column: 1 / -1; }
  }
  @media (max-width: 480px) {
    .footer-grid { grid-template-columns: 1fr; }
  }
`;

function header(): string {
  return `
<header class="site-header">
  <a href="/api/landing" class="logo">
    <span class="logo-icon">⚖️</span>
    Ontario Family Law Guide
  </a>
  <nav>
    <a href="/api/learn">Glossary</a>
    <a href="/api/guides">Form Guides</a>
    <a href="/api/landing#pricing">Pricing</a>
    <a href="/api/landing" class="cta-btn">Get the App</a>
  </nav>
</header>`;
}

function footer(): string {
  return `
<footer class="site-footer">
  <div class="footer-grid">
    <div class="footer-brand">
      <a href="/api/landing" style="color:#fff;font-weight:800;font-size:16px;text-decoration:none;display:flex;align-items:center;gap:8px;">
        <span style="background:#c9a227;border-radius:6px;padding:4px 8px;font-size:13px;">⚖️</span>
        Ontario Family Law Guide
      </a>
      <p>Plain-language guidance for self-represented litigants navigating Ontario family court. Not legal advice.</p>
    </div>
    <div class="footer-col">
      <h4>Learn</h4>
      <a href="/api/learn">All Terms</a>
      <a href="/api/learn/affidavit">Affidavit</a>
      <a href="/api/learn/case-conference">Case Conference</a>
      <a href="/api/learn/default">Noted in Default</a>
      <a href="/api/learn/duty-counsel">Duty Counsel</a>
    </div>
    <div class="footer-col">
      <h4>Form Guides</h4>
      <a href="/api/guides/form-10-answer">Form 10 — Answer</a>
      <a href="/api/guides/form-14b-motion">Form 14B — Motion</a>
      <a href="/api/guides/form-35-1-parenting">Form 35.1 — Parenting</a>
      <a href="/api/guides/form-13-financial">Form 13 — Financial</a>
      <a href="/api/guides">All Form Guides</a>
    </div>
    <div class="footer-col">
      <h4>Resources</h4>
      <a href="https://legalaid.on.ca" target="_blank" rel="noopener">Legal Aid Ontario</a>
      <a href="https://stepstojustice.ca" target="_blank" rel="noopener">Steps to Justice</a>
      <a href="https://ontario.ca/fro" target="_blank" rel="noopener">FRO</a>
      <a href="/api/landing#pricing">Premium Features</a>
    </div>
  </div>
  <div class="footer-bottom">
    <p>© ${new Date().getFullYear()} Ontario Family Law Guide. This app provides general information only — not legal advice. Always consult a licensed lawyer for your specific situation. Ontario court forms are available at <a href="https://ontariocourtforms.on.ca" style="color:#c9a22780">ontariocourtforms.on.ca</a>.</p>
  </div>
</footer>`;
}

export interface HtmlShellOptions {
  title: string;
  description: string;
  canonical: string;
  schemaJson?: object | object[];
  keywords?: string;
  body: string;
  extraCss?: string;
}

export function htmlShell(opts: HtmlShellOptions): string {
  const { title, description, canonical, schemaJson, keywords, body, extraCss } = opts;
  const schemas = Array.isArray(schemaJson) ? schemaJson : schemaJson ? [schemaJson] : [];
  const schemaBlocks = schemas.map(s => `<script type="application/ld+json">${JSON.stringify(s)}</script>`).join("\n  ");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}" />
  ${keywords ? `<meta name="keywords" content="${escapeHtml(keywords)}" />` : ""}
  <link rel="canonical" href="${canonical}" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${canonical}" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
  ${schemaBlocks}
  <style>${CSS}${extraCss ?? ""}</style>
</head>
<body>
  ${header()}
  ${body}
  ${footer()}
</body>
</html>`;
}

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}
