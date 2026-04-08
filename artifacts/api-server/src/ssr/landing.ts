import { htmlShell, escapeHtml, getBaseUrl } from "./shared";

export function getLandingHtml(): string {
  const baseUrl = getBaseUrl();

  const heroSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Ontario Family Law Guide",
    "operatingSystem": "iOS, Android",
    "applicationCategory": "LifestyleApplication",
    "description": "AI-powered plain-language guidance for Ontario family court. Draft court forms, track deadlines, and navigate the legal process — all in plain language.",
    "offers": {
      "@type": "Offer",
      "price": "9.99",
      "priceCurrency": "CAD",
      "priceSpecification": {
        "@type": "UnitPriceSpecification",
        "price": "9.99",
        "priceCurrency": "CAD",
        "billingDuration": "P1M",
      },
    },
    "url": `${baseUrl}/api/landing`,
    "featureList": [
      "AI-powered court form drafting",
      "Affidavit builder",
      "Deadline tracker",
      "Plain-language legal guidance",
      "Communication coach",
      "Ontario court forms reference",
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Is this app legal advice?",
        "acceptedAnswer": { "@type": "Answer", "text": "No. The Ontario Family Law Guide provides general legal information in plain language — it is not legal advice and does not create a lawyer-client relationship. Always consult a licensed Ontario lawyer for advice specific to your situation." },
      },
      {
        "@type": "Question",
        "name": "What Ontario court forms can the app help me draft?",
        "acceptedAnswer": { "@type": "Answer", "text": "The premium tier helps you draft Form 8 (Application), Form 10 (Answer), Form 14B (Motion), Form 15B (Response to Motion), Form 35.1 (Parenting Affidavit), and Form 13/13.1 (Financial Statement). The AI generates a structured draft with placeholders, which you then review and have a lawyer check before filing." },
      },
      {
        "@type": "Question",
        "name": "How much does the app cost?",
        "acceptedAnswer": { "@type": "Answer", "text": "The app is free to download with core features including deadline tracking, the glossary, and basic legal information. The premium tier is $9.99 CAD per month and includes AI document drafting, affidavit builder, and communication coach." },
      },
      {
        "@type": "Question",
        "name": "Is my data private and secure?",
        "acceptedAnswer": { "@type": "Answer", "text": "Yes. Upload only redacted documents. We process your text to generate document drafts and do not store personal identifying information. Your case details are not shared with third parties." },
      },
      {
        "@type": "Question",
        "name": "Who is this app for?",
        "acceptedAnswer": { "@type": "Answer", "text": "The Ontario Family Law Guide is designed for self-represented litigants navigating Ontario family court — people who cannot afford a lawyer or want to understand the process before meeting with one. It is not a substitute for legal representation." },
      },
    ],
  };

  const extraCss = `
    .hero { background: linear-gradient(145deg, #1a4b8c 0%, #0f2f61 100%); padding: 80px 20px 80px; text-align: center; }
    .hero h1 { font-size: clamp(28px, 5vw, 48px); font-weight: 800; color: #fff; line-height: 1.2; margin-bottom: 18px; max-width: 720px; margin-left: auto; margin-right: auto; }
    .hero p.sub { font-size: clamp(15px, 2.5vw, 19px); color: rgba(255,255,255,0.85); max-width: 580px; margin: 0 auto 32px; line-height: 1.7; }
    .cta-primary { display: inline-block; background: #c9a227; color: #0f1f3d; padding: 16px 36px; border-radius: 12px; font-size: 17px; font-weight: 800; text-decoration: none; box-shadow: 0 4px 20px rgba(201,162,39,0.4); }
    .cta-primary:hover { background: #b8921f; text-decoration: none; }
    .cta-secondary { display: inline-block; color: rgba(255,255,255,0.75); font-size: 14px; text-decoration: none; margin-top: 12px; }
    .cta-secondary:hover { color: #fff; text-decoration: underline; }
    .features { padding: 72px 20px; }
    .features-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; max-width: 1100px; margin: 0 auto; }
    .feature-card { background: #fff; border: 1px solid #dde2ec; border-radius: 16px; padding: 24px; }
    .feature-card .icon { font-size: 28px; margin-bottom: 12px; }
    .feature-card h3 { font-size: 16px; font-weight: 700; color: #0f1f3d; margin-bottom: 8px; }
    .feature-card p { font-size: 14px; color: #6b7280; line-height: 1.7; }
    .feature-card.premium { border-color: #c9a22750; background: linear-gradient(135deg, #fffdf5 0%, #fff8e1 100%); }
    .pricing { background: #0f1f3d; padding: 72px 20px; }
    .pricing-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; max-width: 800px; margin: 0 auto; }
    .pricing-card { background: #fff; border-radius: 20px; padding: 32px; }
    .pricing-card.featured { background: linear-gradient(145deg, #1a4b8c, #0f2f61); color: #fff; border: 2px solid #c9a227; }
    .faq { padding: 72px 20px; }
    .faq-item { border-bottom: 1px solid #e8edf5; padding: 20px 0; }
    .faq-item h3 { font-size: 16px; font-weight: 700; color: #0f1f3d; margin-bottom: 10px; }
    .faq-item p { font-size: 14px; color: #374151; line-height: 1.8; }
    .trust { background: #f5f7fa; padding: 64px 20px; border-top: 1px solid #e8edf5; }
    @media (max-width: 600px) {
      .pricing-grid { grid-template-columns: 1fr; }
      .hero { padding: 60px 20px; }
    }
  `;

  const body = `
<!-- HERO -->
<section class="hero">
  <div class="badge" style="margin-bottom:18px;">ONTARIO FAMILY COURT GUIDE</div>
  <h1>Handle your family‑law case<br/>with confidence</h1>
  <p class="sub">Get court-ready forms, deadline reminders, and plain-language guidance — powered by AI, designed for self-represented Ontarians.</p>
  <div style="margin-bottom:16px;">
    <a href="#pricing" class="cta-primary">Unlock my case toolkit for $9.99/month</a>
  </div>
  <a href="#features" class="cta-secondary">See what's included ↓</a>
  <div style="display:flex;justify-content:center;gap:24px;margin-top:40px;flex-wrap:wrap;">
    <div style="text-align:center;">
      <div style="font-size:28px;font-weight:800;color:#c9a227;">6</div>
      <div style="font-size:12px;color:rgba(255,255,255,0.65);margin-top:2px;">Court Forms Supported</div>
    </div>
    <div style="width:1px;background:rgba(255,255,255,0.15);"></div>
    <div style="text-align:center;">
      <div style="font-size:28px;font-weight:800;color:#c9a227;">20+</div>
      <div style="font-size:12px;color:rgba(255,255,255,0.65);margin-top:2px;">Legal Terms Explained</div>
    </div>
    <div style="width:1px;background:rgba(255,255,255,0.15);"></div>
    <div style="text-align:center;">
      <div style="font-size:28px;font-weight:800;color:#c9a227;">$0</div>
      <div style="font-size:12px;color:rgba(255,255,255,0.65);margin-top:2px;">to Download & Try</div>
    </div>
  </div>
</section>

<!-- SOCIAL PROOF BANNER -->
<div style="background:#c9a227;padding:14px 20px;text-align:center;">
  <p style="font-size:14px;font-weight:600;color:#0f1f3d;margin:0;">"Our AI-powered tool helps you respond to court documents or start your own case — in plain language." &nbsp; · &nbsp; Used by self-represented litigants across Ontario</p>
</div>

<!-- FEATURES -->
<section class="features" id="features">
  <div style="text-align:center;margin-bottom:48px;">
    <div class="badge badge-primary" style="margin-bottom:12px;">WHAT YOU GET</div>
    <h2 style="font-size:32px;font-weight:800;color:#0f1f3d;margin-bottom:12px;">Everything you need to navigate family court</h2>
    <p style="font-size:16px;color:#6b7280;max-width:520px;margin:0 auto;">Free features to get started. Premium tools to go further.</p>
  </div>
  <div class="features-grid">
    <div class="feature-card">
      <div class="icon">⚖️</div>
      <h3>Plain-Language Explanations</h3>
      <p>Ask any Ontario family law question and get a clear, plain-English answer — no legalese. Free for all users.</p>
    </div>
    <div class="feature-card">
      <div class="icon">⏰</div>
      <h3>Deadline Tracker</h3>
      <p>Never miss a court deadline. Track when your Answer is due, when to file affidavits, and conference dates — all in one place.</p>
    </div>
    <div class="feature-card">
      <div class="icon">📋</div>
      <h3>Court Forms Reference</h3>
      <p>Step-by-step guides for every major Ontario court form: Form 8, Form 10, Form 14B, Form 35.1, Form 13 and more.</p>
    </div>
    <div class="feature-card">
      <div class="icon">📚</div>
      <h3>Family Law Glossary</h3>
      <p>20+ Ontario family law terms explained in plain language — from "affidavit" to "without prejudice." Free for all users.</p>
    </div>
    <div class="feature-card premium">
      <div class="icon">✍️</div>
      <h3>AI Document Drafter <span style="background:#c9a227;color:#fff;padding:2px 8px;border-radius:10px;font-size:11px;vertical-align:middle;margin-left:4px;">PREMIUM</span></h3>
      <p>Describe your situation in plain language. The AI generates a structured draft of your court form — complete with placeholders where you need to fill in specifics.</p>
    </div>
    <div class="feature-card premium">
      <div class="icon">📝</div>
      <h3>Affidavit Builder <span style="background:#c9a227;color:#fff;padding:2px 8px;border-radius:10px;font-size:11px;vertical-align:middle;margin-left:4px;">PREMIUM</span></h3>
      <p>Enter your facts and receive a properly structured affidavit outline with numbered paragraphs and exhibit suggestions — ready for your lawyer to review.</p>
    </div>
    <div class="feature-card premium">
      <div class="icon">💬</div>
      <h3>Communication Coach <span style="background:#c9a227;color:#fff;padding:2px 8px;border-radius:10px;font-size:11px;vertical-align:middle;margin-left:4px;">PREMIUM</span></h3>
      <p>Draft a professional message to the other party, or paste your existing message to have it reviewed for language that could hurt your case.</p>
    </div>
    <div class="feature-card">
      <div class="icon">🆘</div>
      <h3>Legal Resources</h3>
      <p>Quick links to Legal Aid Ontario, duty counsel, Steps to Justice, and the Family Responsibility Office — the resources you actually need.</p>
    </div>
  </div>
</section>

<!-- HOW IT WORKS -->
<section style="background:#f5f7fa;padding:72px 20px;border-top:1px solid #e8edf5;">
  <div class="container-wide">
    <div style="text-align:center;margin-bottom:48px;">
      <div class="badge badge-primary" style="margin-bottom:12px;">HOW IT WORKS</div>
      <h2 style="font-size:32px;font-weight:800;color:#0f1f3d;">Get court-ready in 3 steps</h2>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:24px;max-width:900px;margin:0 auto;">
      <div style="text-align:center;padding:24px;">
        <div style="width:56px;height:56px;background:#1a4b8c;color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:800;margin:0 auto 16px;">1</div>
        <h3 style="font-size:17px;font-weight:700;color:#0f1f3d;margin-bottom:8px;">Download the free app</h3>
        <p style="font-size:14px;color:#6b7280;line-height:1.7;">Get instant access to the glossary, deadline tracker, and court forms reference — no sign-up required to start.</p>
      </div>
      <div style="text-align:center;padding:24px;">
        <div style="width:56px;height:56px;background:#1a4b8c;color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:800;margin:0 auto 16px;">2</div>
        <h3 style="font-size:17px;font-weight:700;color:#0f1f3d;margin-bottom:8px;">Describe your situation</h3>
        <p style="font-size:14px;color:#6b7280;line-height:1.7;">With Premium, type what is happening in your case in plain language — no legal training needed. The AI understands Ontario family law.</p>
      </div>
      <div style="text-align:center;padding:24px;">
        <div style="width:56px;height:56px;background:#1a4b8c;color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:800;margin:0 auto 16px;">3</div>
        <h3 style="font-size:17px;font-weight:700;color:#0f1f3d;margin-bottom:8px;">Get your draft documents</h3>
        <p style="font-size:14px;color:#6b7280;line-height:1.7;">Receive a structured draft — affidavit, motion, financial statement — ready for you to review with a lawyer before filing.</p>
      </div>
    </div>
  </div>
</section>

<!-- PRICING -->
<section class="pricing" id="pricing">
  <div style="text-align:center;margin-bottom:48px;">
    <div class="badge" style="margin-bottom:12px;">PRICING</div>
    <h2 style="font-size:32px;font-weight:800;color:#fff;margin-bottom:12px;">Start free. Upgrade when you need more.</h2>
    <p style="font-size:16px;color:rgba(255,255,255,0.7);max-width:480px;margin:0 auto;">No subscription required for core features. Premium unlocks the AI drafting tools.</p>
  </div>
  <div class="pricing-grid">
    <div class="pricing-card">
      <h3 style="font-size:20px;font-weight:800;color:#0f1f3d;margin-bottom:6px;">Free</h3>
      <div style="font-size:36px;font-weight:800;color:#0f1f3d;margin-bottom:20px;">$0</div>
      <ul style="list-style:none;margin-bottom:28px;">
        ${["Plain-language AI answers","Deadline tracker","Court forms reference","Family law glossary (20+ terms)","Legal resources directory"].map(f => `<li style="display:flex;gap:10px;font-size:14px;color:#374151;margin-bottom:10px;"><span style="color:#1a4b8c;font-weight:700;">✓</span>${escapeHtml(f)}</li>`).join("")}
      </ul>
      <a href="#" style="display:block;text-align:center;border:2px solid #1a4b8c;color:#1a4b8c;padding:12px;border-radius:10px;font-weight:700;font-size:14px;text-decoration:none;">Download Free</a>
    </div>
    <div class="pricing-card featured">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
        <h3 style="font-size:20px;font-weight:800;">Premium</h3>
        <span style="background:#c9a227;color:#0f1f3d;padding:4px 10px;border-radius:20px;font-size:11px;font-weight:800;">MOST POPULAR</span>
      </div>
      <div style="font-size:36px;font-weight:800;margin-bottom:4px;">$9.99<span style="font-size:14px;font-weight:400;opacity:0.7;">/month</span></div>
      <p style="font-size:12px;opacity:0.6;margin-bottom:20px;">Cancel anytime</p>
      <ul style="list-style:none;margin-bottom:28px;">
        ${["Everything in Free","AI document drafter (Form 8, 10, 14B, 35.1, 13)","Affidavit builder with exhibit suggestions","Communication coach (draft & review)","Priority AI responses"].map(f => `<li style="display:flex;gap:10px;font-size:14px;color:rgba(255,255,255,0.9);margin-bottom:10px;"><span style="color:#c9a227;font-weight:700;">✓</span>${escapeHtml(f)}</li>`).join("")}
      </ul>
      <a href="#" style="display:block;text-align:center;background:#c9a227;color:#0f1f3d;padding:14px;border-radius:10px;font-weight:800;font-size:15px;text-decoration:none;">Unlock my case toolkit →</a>
      <p style="font-size:11px;text-align:center;opacity:0.55;margin-top:12px;">Subscription managed by RevenueCat. Cancel in app settings.</p>
    </div>
  </div>
</section>

<!-- TRUST SECTION -->
<section class="trust">
  <div class="container-wide" style="text-align:center;">
    <div class="badge badge-primary" style="margin-bottom:16px;">TRUST & SAFETY</div>
    <h2 style="font-size:28px;font-weight:800;color:#0f1f3d;margin-bottom:32px;">Built with Ontario litigants in mind</h2>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:20px;max-width:900px;margin:0 auto 40px;">
      ${[
        ["🏛️", "Ontario-specific", "All guidance is tailored to Ontario Family Law Rules — not generic Canadian or US law."],
        ["🔒", "Privacy-first", "Upload only redacted documents. We process your text and do not store personal data."],
        ["⚖️", "Not legal advice", "We are clear about our limits. Every response reminds you to verify with a lawyer."],
        ["📋", "Court-approved forms", "We reference official Ontario court forms from ontariocourtforms.on.ca only."],
      ].map(([icon, title, desc]) => `
        <div style="background:#fff;border:1px solid #dde2ec;border-radius:14px;padding:20px;text-align:left;">
          <div style="font-size:24px;margin-bottom:10px;">${icon}</div>
          <h3 style="font-size:15px;font-weight:700;color:#0f1f3d;margin-bottom:6px;">${escapeHtml(title as string)}</h3>
          <p style="font-size:13px;color:#6b7280;line-height:1.6;">${escapeHtml(desc as string)}</p>
        </div>`).join("")}
    </div>
    <div style="background:#fff;border:1px solid #dde2ec;border-radius:14px;padding:24px;max-width:600px;margin:0 auto;">
      <p style="font-size:15px;font-style:italic;color:#374151;line-height:1.8;margin-bottom:12px;">"Generate your court forms, timeline, and plain-language explanations instantly. Our drafts follow Ontario Family Law Rules."</p>
      <p style="font-size:13px;color:#6b7280;">Ontario Family Law Guide — Used by self-represented litigants across Ontario</p>
    </div>
  </div>
</section>

<!-- FAQ -->
<section class="faq" id="faq">
  <div class="container">
    <div style="text-align:center;margin-bottom:40px;">
      <div class="badge badge-primary" style="margin-bottom:12px;">FREQUENTLY ASKED</div>
      <h2 style="font-size:28px;font-weight:800;color:#0f1f3d;">Common questions</h2>
    </div>
    <div class="faq-item">
      <h3>Is this app legal advice?</h3>
      <p>No. The Ontario Family Law Guide provides general legal information in plain language — it is not legal advice and does not create a lawyer-client relationship. Always consult a licensed Ontario lawyer for advice specific to your situation.</p>
    </div>
    <div class="faq-item">
      <h3>What Ontario court forms can the app help me draft?</h3>
      <p>The premium tier helps you draft Form 8 (Application), Form 10 (Answer), Form 14B (Motion), Form 15B (Response to Motion), Form 35.1 (Parenting Affidavit), and Form 13/13.1 (Financial Statement). The AI generates a structured draft with placeholders, which you review and have a lawyer check before filing.</p>
    </div>
    <div class="faq-item">
      <h3>How much does it cost?</h3>
      <p>The app is free to download. Core features — AI Q&A, deadline tracker, glossary, and court forms reference — are free. The premium tier is <strong>$9.99 CAD/month</strong> and includes AI document drafting, the affidavit builder, and communication coach. Cancel any time in your device's subscription settings.</p>
    </div>
    <div class="faq-item">
      <h3>Is my information private?</h3>
      <p>Yes. Upload only redacted documents. We process your text to generate document drafts and do not store personal identifying information. Your case details are not shared with third parties.</p>
    </div>
    <div class="faq-item">
      <h3>Who is this app for?</h3>
      <p>The Ontario Family Law Guide is designed for self-represented litigants navigating Ontario family court — people who cannot afford a lawyer or who want to understand the process before or after meeting with one. It is not a substitute for legal representation.</p>
    </div>
  </div>
</section>

<!-- FINAL CTA -->
<section style="background:linear-gradient(145deg,#1a4b8c,#0f2f61);padding:80px 20px;text-align:center;">
  <h2 style="font-size:clamp(24px,4vw,38px);font-weight:800;color:#fff;margin-bottom:14px;">Ready to handle your case with confidence?</h2>
  <p style="font-size:16px;color:rgba(255,255,255,0.8);margin-bottom:32px;max-width:480px;margin-left:auto;margin-right:auto;">Draft my forms now — AI-powered, Ontario-specific, plain language.</p>
  <a href="#pricing" class="cta-primary" style="font-size:18px;padding:18px 40px;">Unlock my case toolkit for $9.99/month</a>
  <p style="font-size:13px;color:rgba(255,255,255,0.5);margin-top:20px;">Free tier available. No credit card needed to try. Cancel any time.</p>
</section>
`;

  return htmlShell({
    title: "Ontario Family Law Guide — AI-Powered Court Forms & Legal Help for Self-Represented Litigants",
    description: "Handle your Ontario family law case with confidence. AI-powered plain-language guidance, court form drafting, deadline tracking, and legal resources. $9.99/month premium tier.",
    canonical: `${baseUrl}/api/landing`,
    keywords: "Ontario family law app, self-represented litigant Ontario, Ontario family court forms, how to file family court Ontario",
    schemaJson: [heroSchema, faqSchema],
    extraCss,
    body,
  });
}
