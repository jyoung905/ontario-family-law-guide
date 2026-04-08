import { htmlShell, escapeHtml, getBaseUrl } from "./shared";

export interface FormGuide {
  slug: string;
  formNumber: string;
  formName: string;
  shortDesc: string;
  purpose: string;
  whenToUse: string;
  deadline?: string;
  steps: { title: string; description: string }[];
  commonMistakes: string[];
  whatToInclude?: string[];
  downloadUrl: string;
  relatedForms: string[];
  keywords: string;
}

export const FORM_GUIDES: FormGuide[] = [
  {
    slug: "form-8-application",
    formNumber: "Form 8",
    formName: "Application (General)",
    shortDesc: "The document that starts most family court cases in Ontario.",
    purpose: "Form 8 is the Application used to start a family court case involving custody, access, support, or property matters. It tells the court and the other party what orders you are asking for.",
    whenToUse: "File Form 8 when you want to start a new family court case. If you are only seeking a divorce with no other issues, use Form 8A (Simple Application) instead. If there are urgent safety concerns, you may also need to bring an emergency motion alongside your Application.",
    deadline: "File as soon as possible. Once filed, the other party has 30 days from service to file a Form 10 Answer.",
    steps: [
      { title: "Download the form", description: "Get Form 8 from ontariocourtforms.on.ca — it is an interactive PDF. You can fill it in on your computer." },
      { title: "Complete Part 1 — Applicant information", description: "Enter your full legal name and the other party's name. These must match exactly on all court documents." },
      { title: "Complete Part 2 — The claims", description: "Check the boxes for every order you are seeking: custody, access, child support, spousal support, property equalization, divorce, etc. Be specific about what you are asking for." },
      { title: "Complete Part 3 — Background information", description: "Provide information about the children, the parties' relationship, and any prior court orders or agreements." },
      { title: "Sign the form", description: "Sign in front of a commissioner of oaths. The signature certifies that the information is accurate." },
      { title: "File at the court office", description: "File the original plus copies at the family court office in the jurisdiction where you or the children live. Pay the filing fee (currently $202 for most applications)." },
      { title: "Serve the other party", description: "Have someone over 18 (not you) personally serve the Application on the other party. Complete a Form 6B Affidavit of Service and file it with the court." },
    ],
    commonMistakes: [
      "Not listing all the orders you want — if you forget something, you may need to bring a motion to amend",
      "Serving the documents yourself — you cannot personally serve the initial Application",
      "Filing in the wrong court — jurisdiction matters; generally file where the children live",
      "Not completing the Form 35.1 (Parenting Affidavit) if your case involves children",
      "Missing the filing fee — confirm current fees at the court office",
    ],
    whatToInclude: [
      "Form 8 — Application",
      "Form 35.1 — Parenting Affidavit (if children are involved)",
      "Form 13 or 13.1 — Financial Statement (if support or property claims)",
      "Any prior court orders or separation agreements (as exhibits)",
    ],
    downloadUrl: "https://ontariocourtforms.on.ca/en/family-law-rules-forms/",
    relatedForms: ["form-10-answer", "form-35-1-parenting", "form-13-financial"],
    keywords: "Form 8 Ontario family court, how to file application Ontario, start family court case Ontario, Form 8 application general Ontario",
  },
  {
    slug: "form-10-answer",
    formNumber: "Form 10",
    formName: "Answer",
    shortDesc: "The document the respondent files to respond to an Application within 30 days.",
    purpose: "Form 10 is the Answer — the document you file if someone has started a family court case against you (served you with a Form 8 Application). It lets you respond to each claim the applicant has made and make your own claims.",
    whenToUse: "File Form 10 if you have been served with a Form 8 Application. You have 30 days from the date of service to file and serve your Answer. If you miss this deadline, you risk being noted in default, which means the court can proceed without your input.",
    deadline: "30 days from the date you were served with the Application (Form 8). Do not miss this deadline.",
    steps: [
      { title: "Read the Application carefully", description: "Go through every claim the applicant is making. Note anything you agree with and anything you dispute. This will guide how you complete your Answer." },
      { title: "Download Form 10", description: "Get Form 10 from ontariocourtforms.on.ca — it is an interactive PDF you can fill in electronically." },
      { title: "Complete Part 1 — Your response", description: "For each claim in the Application, state whether you agree, disagree, or partly agree. For claims you disagree with, briefly explain why." },
      { title: "Complete Part 2 — Your own claims (if any)", description: "If you also want orders from the court (for example, you want custody, or a different support amount), list your claims here. This makes you a respondent by claim." },
      { title: "Attach required documents", description: "Include a Form 35.1 (Parenting Affidavit) if children are involved. Include Form 13 or 13.1 (Financial Statement) if the case involves support or property." },
      { title: "Sign before a commissioner of oaths", description: "Sign the Answer in front of a commissioner of oaths. Many courthouses, libraries, and law offices have commissioners available." },
      { title: "File and serve", description: "File the original with the court. Then serve a copy on the applicant by regular mail, email (if agreed), or other permitted method. File your Affidavit of Service (Form 6B) with the court." },
    ],
    commonMistakes: [
      "Missing the 30-day deadline — this is the most serious mistake; get it done early",
      "Not making your own claims — if you want child support too, include it in your Answer",
      "Forgetting the Financial Statement if support or property is at issue",
      "Not serving the Answer on the applicant before filing",
      "Responding emotionally rather than factually — stick to what orders you want and why",
    ],
    whatToInclude: [
      "Form 10 — Answer",
      "Form 35.1 — Parenting Affidavit (if children involved)",
      "Form 13 or 13.1 — Financial Statement (if support or property involved)",
    ],
    downloadUrl: "https://ontariocourtforms.on.ca/en/family-law-rules-forms/",
    relatedForms: ["form-8-application", "form-35-1-parenting", "form-13-financial"],
    keywords: "Form 10 answer Ontario, how to file answer Ontario family court, 30 days answer family court, respond to application Ontario",
  },
  {
    slug: "form-14b-motion",
    formNumber: "Form 14B",
    formName: "Motion (Without Notice / Consent)",
    shortDesc: "Used to request a temporary order from the court while your case is ongoing.",
    purpose: "Form 14B is the Motion form used to ask the court for a temporary order during your case — for example, temporary custody, support, or an urgent order. Motions are heard before the final resolution of your case.",
    whenToUse: "Bring a Form 14B motion when you need a temporary order that cannot wait until trial. Common reasons include: child in danger, urgent support needed, or to enforce an existing order. Important: you generally must have a case conference before bringing a motion, unless it is a true emergency (no notice motion).",
    steps: [
      { title: "Confirm a case conference has been held", description: "You generally cannot bring a motion until after a case conference, unless it is an emergency. Check the court's local practice directions." },
      { title: "Download Form 14B", description: "Get Form 14B from ontariocourtforms.on.ca. Also download Form 14A (Affidavit) — you need both." },
      { title: "Complete Form 14B — Notice of Motion", description: "List every order you are requesting. Be specific: 'Temporary decision-making responsibility to the applicant' not just 'custody.'" },
      { title: "Draft Form 14A — Affidavit", description: "This is your sworn statement explaining why you need the order you are requesting. Tell the facts, not opinions. Attach relevant documents as exhibits." },
      { title: "Get a motion date from the court", description: "Contact the court office to get a date for your motion. The time for motions varies by location — some require scheduling weeks in advance." },
      { title: "Serve the other party", description: "Serve Form 14B and Form 14A on the other party at least 4 days before the motion date (unless it is a no-notice emergency motion). File proof of service." },
      { title: "Appear on the motion date", description: "Attend court at the scheduled time. Be prepared to make brief oral arguments. Judges often have reviewed the materials in advance." },
    ],
    commonMistakes: [
      "Bringing a motion without a case conference first (unless emergency)",
      "Not serving the motion materials far enough in advance",
      "Writing argument in the affidavit instead of facts — affidavits must contain facts, not legal argument",
      "Asking for too many things at once — focus on what is truly urgent",
      "Not bringing the responding materials (Form 15B) to court if the other party filed them",
    ],
    downloadUrl: "https://ontariocourtforms.on.ca/en/family-law-rules-forms/",
    relatedForms: ["form-8-application", "form-15b-response"],
    keywords: "Form 14B motion Ontario, temporary order Ontario family court, motion without notice Ontario, interim custody motion Ontario",
  },
  {
    slug: "form-15b-response",
    formNumber: "Form 15B",
    formName: "Response to Motion",
    shortDesc: "Filed by the respondent to oppose or partially agree to a motion.",
    purpose: "Form 15B is filed by the party who received a motion (Form 14B) to tell the court their position — whether they oppose the motion, agree to some of it, or want to add their own requests. It is accompanied by an Affidavit (Form 14A) setting out the responding party's evidence.",
    whenToUse: "File Form 15B when the other party has served you with a motion and you want to tell the court your position before the motion is heard. File it as soon as possible — at least 4 days before the motion hearing (check local rules for your courthouse).",
    steps: [
      { title: "Read the motion materials carefully", description: "Review every order the moving party is asking for, and their affidavit evidence. Identify what you agree with, what you dispute, and what evidence you will file." },
      { title: "Download Form 15B", description: "Get Form 15B from ontariocourtforms.on.ca. You will also need Form 14A (Affidavit) for your responding evidence." },
      { title: "Complete Form 15B", description: "For each order requested, state whether you agree, oppose, or partly agree. If you want your own temporary order, you can include it here too." },
      { title: "Draft your responding affidavit (Form 14A)", description: "Tell your side of the story in factual terms. Attach documents that support your position as exhibits. Get it commissioned." },
      { title: "Serve on the moving party", description: "Serve Form 15B and your affidavit on the other party before the motion date. Check the minimum number of days required." },
      { title: "File with the court", description: "File the originals with the court and file your proof of service." },
    ],
    commonMistakes: [
      "Waiting too long — serve and file well before the motion date",
      "Responding only to the motion without raising your own needs",
      "Not attaching documentary evidence — bank statements, text messages, etc. as exhibits",
      "Including argument in the affidavit — stick to facts",
    ],
    downloadUrl: "https://ontariocourtforms.on.ca/en/family-law-rules-forms/",
    relatedForms: ["form-14b-motion"],
    keywords: "Form 15B response to motion Ontario, oppose motion Ontario family court, responding to motion Ontario",
  },
  {
    slug: "form-35-1-parenting",
    formNumber: "Form 35.1",
    formName: "Affidavit in Support of Claim for Decision-Making Responsibility, Parenting Time, Contact, or Placement",
    shortDesc: "Mandatory affidavit in all cases involving parenting time or decision-making responsibility.",
    purpose: "Form 35.1 is a mandatory sworn document required whenever your case involves parenting time or decision-making responsibility (formerly called 'custody and access'). It provides the court with detailed background about the children and each party's parenting history.",
    whenToUse: "File Form 35.1 with your initial Application (Form 8) if your case involves children. If you are the respondent and children are involved, file it with your Answer (Form 10). All parties must complete this form — it is not optional.",
    steps: [
      { title: "Download Form 35.1", description: "Get Form 35.1 from ontariocourtforms.on.ca. This is a longer, more detailed form — set aside time to complete it carefully." },
      { title: "Part 1 — Basic information", description: "Identify yourself, the other party, and the children. List each child's name, date of birth, and current address." },
      { title: "Part 2 — Living arrangements", description: "Describe where each child has been living for the past year, month by month. Who they lived with, how much time with each parent." },
      { title: "Part 3 — Prior court involvement", description: "List any prior court orders, police involvement, child protection (CAS) involvement, or family arbitration agreements involving these children." },
      { title: "Part 4 — Your parenting history", description: "Describe your involvement in each child's daily life: school, medical, activities, routines. Be specific — not 'I am a good parent' but 'I take them to school every day and attend all parent-teacher interviews.'" },
      { title: "Part 5 — Family violence or safety concerns", description: "This section MUST be completed honestly. Disclose any history of family violence, criminal charges related to children, or safety concerns. Failure to disclose can seriously damage your credibility." },
      { title: "Part 6 — Child's views", description: "If the child is old enough to express views (generally 7+), describe what you understand the child's wishes to be and how you know this." },
      { title: "Commission the affidavit", description: "Sign in front of a commissioner of oaths and have them complete the jurat (the commissioner's signature block)." },
    ],
    commonMistakes: [
      "Omitting the Form 35.1 entirely — it is mandatory and judges notice",
      "Describing children's preferences when you don't actually know what they want",
      "Exaggerating your parenting involvement — keep it accurate and provable",
      "Leaving out family violence history — courts take non-disclosure very seriously",
      "Using the form to argue your case rather than state facts",
    ],
    downloadUrl: "https://ontariocourtforms.on.ca/en/family-law-rules-forms/",
    relatedForms: ["form-8-application", "form-10-answer"],
    keywords: "Form 35.1 Ontario, parenting affidavit Ontario, custody affidavit Ontario, decision making responsibility Ontario form",
  },
  {
    slug: "form-13-financial",
    formNumber: "Form 13 / 13.1",
    formName: "Financial Statement",
    shortDesc: "Sworn disclosure of all income, expenses, assets, and debts — required in support and property matters.",
    purpose: "The Financial Statement is a mandatory, sworn document that fully discloses your financial situation. Form 13 is used when support is the only financial issue. Form 13.1 is used when the case also involves property division. Both require you to list all income, expenses, assets, and debts — honestly and completely.",
    whenToUse: "File a Financial Statement whenever your case involves child support, spousal support, or property division. Both parties must exchange Financial Statements so the court can see both financial pictures. Hiding assets or providing inaccurate information is contempt of court.",
    deadline: "Must typically be served on the other party at least 30 days before any motion or conference that deals with financial issues.",
    steps: [
      { title: "Gather your financial documents", description: "Collect last year's tax return (Notice of Assessment), last 3 months of pay stubs, bank statements for all accounts, investment and retirement account statements, property assessment notices, and any business financial statements if self-employed." },
      { title: "Complete Part 1 — Income", description: "List all sources of income: employment, self-employment, rental income, investment income, government benefits, etc. Use your actual gross (before tax) income." },
      { title: "Complete Part 2 — Expenses", description: "List your actual monthly expenses: housing, utilities, food, transportation, childcare, medical, and other. Be accurate — over- or under-stating expenses can be challenged." },
      { title: "Complete Part 3 — Other income information", description: "If you are self-employed, complete the additional pages showing business income and expenses. Attach financial statements if you own a business or corporation." },
      { title: "Complete Part 4 — Property (Form 13.1 only)", description: "For Form 13.1, list every asset (property, vehicles, bank accounts, RRSPs, pensions, businesses) with its value on the date of marriage, a key date, and today. Also list all debts." },
      { title: "Attach supporting documents", description: "Attach the last 3 years of tax returns, last 3 months of pay stubs, bank statements, and other documents that support the figures in your statement." },
      { title: "Commission the Financial Statement", description: "Sign in front of a commissioner of oaths. By signing, you are swearing that the information is true and complete." },
      { title: "Serve and file", description: "Serve a copy on the other party and file the original with the court, along with proof of service." },
    ],
    commonMistakes: [
      "Hiding income or assets — courts have tools to find hidden assets and the consequences are severe",
      "Using net income instead of gross income in Part 1",
      "Forgetting self-employment deductions that inflate or deflate apparent income",
      "Not attaching required supporting documents (pay stubs, tax returns)",
      "Not updating the form if your financial situation changes before the hearing",
    ],
    downloadUrl: "https://ontariocourtforms.on.ca/en/family-law-rules-forms/",
    relatedForms: ["form-8-application", "form-10-answer"],
    keywords: "Form 13 financial statement Ontario, Form 13.1 Ontario, income disclosure Ontario family court, financial disclosure family law Ontario",
  },
];

export function getGuideIndexHtml(): string {
  const baseUrl = getBaseUrl();

  const cards = FORM_GUIDES.map(g => `
    <a href="${baseUrl}/api/guides/${g.slug}" style="display:block;background:#fff;border:1px solid #dde2ec;border-radius:14px;padding:20px;text-decoration:none;transition:box-shadow 0.2s;">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:10px;">
        <span style="background:#1a4b8c;color:#fff;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:700;">${escapeHtml(g.formNumber)}</span>
        ${g.deadline ? `<span style="background:#fef2f2;color:#dc2626;padding:4px 10px;border-radius:20px;font-size:11px;font-weight:600;">Deadline</span>` : ""}
      </div>
      <h3 style="font-size:16px;font-weight:700;color:#0f1f3d;margin-bottom:6px;">${escapeHtml(g.formName)}</h3>
      <p style="font-size:13px;color:#6b7280;line-height:1.6;">${escapeHtml(g.shortDesc)}</p>
      <span style="display:inline-block;margin-top:12px;color:#1a4b8c;font-size:13px;font-weight:600;">Read guide →</span>
    </a>`).join("");

  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Ontario Family Court Form Guides",
    "description": "Step-by-step guides for completing Ontario family court forms",
    "url": `${baseUrl}/api/guides`,
    "itemListElement": FORM_GUIDES.map((g, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "name": `${g.formNumber} — ${g.formName}`,
      "url": `${baseUrl}/api/guides/${g.slug}`,
    })),
  };

  return htmlShell({
    title: "Ontario Family Court Form Guides — Step-by-Step Instructions",
    description: "Plain-language, step-by-step guides for completing Ontario family court forms. Form 8, Form 10, Form 14B, Form 35.1, Form 13, and more.",
    canonical: `${baseUrl}/api/guides`,
    keywords: "Ontario family court forms guide, how to fill out Form 10 Ontario, Ontario family law forms explained",
    schemaJson: schema,
    body: `
<div style="background:#1a4b8c;padding:48px 20px;text-align:center;color:#fff;">
  <div class="badge" style="background:rgba(201,162,39,0.15);color:#c9a227;border-color:rgba(201,162,39,0.3);margin-bottom:16px;">FREE GUIDES</div>
  <h1 style="font-size:36px;font-weight:800;margin-bottom:12px;">Ontario Court Form Guides</h1>
  <p style="font-size:17px;max-width:560px;margin:0 auto;opacity:0.85;">Step-by-step instructions for completing each Ontario family court form — written for self-represented litigants.</p>
</div>

<div class="container" style="padding-top:32px;padding-bottom:64px;">
  <nav class="breadcrumb">
    <a href="/api/landing">Home</a>
    <span>›</span>
    <span>Form Guides</span>
  </nav>
  <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:16px;margin-bottom:32px;">
    ${cards}
  </div>
  <div class="disclaimer-box">
    <span>⚠️</span>
    <span>These guides are for general information only and are not legal advice. Court forms and procedures change — always download forms directly from <a href="https://ontariocourtforms.on.ca" target="_blank">ontariocourtforms.on.ca</a> and consult a lawyer for your specific situation.</span>
  </div>
</div>`,
  });
}

export function getGuideHtml(slug: string): string | null {
  const guide = FORM_GUIDES.find(g => g.slug === slug);
  if (!guide) return null;
  const baseUrl = getBaseUrl();

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": `How to Complete Ontario ${guide.formNumber} (${guide.formName})`,
    "description": guide.purpose,
    "url": `${baseUrl}/api/guides/${guide.slug}`,
    "dateModified": "2025-01-01",
    "step": guide.steps.map((s, i) => ({
      "@type": "HowToStep",
      "position": i + 1,
      "name": s.title,
      "text": s.description,
    })),
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": `When do I need to file ${guide.formNumber}?`,
        "acceptedAnswer": { "@type": "Answer", "text": guide.whenToUse },
      },
      ...(guide.deadline ? [{
        "@type": "Question",
        "name": `What is the deadline for ${guide.formNumber}?`,
        "acceptedAnswer": { "@type": "Answer", "text": guide.deadline },
      }] : []),
      {
        "@type": "Question",
        "name": `What are common mistakes when filing ${guide.formNumber}?`,
        "acceptedAnswer": { "@type": "Answer", "text": guide.commonMistakes.join(" | ") },
      },
    ],
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": `${baseUrl}/api/landing` },
      { "@type": "ListItem", "position": 2, "name": "Form Guides", "item": `${baseUrl}/api/guides` },
      { "@type": "ListItem", "position": 3, "name": `${guide.formNumber} — ${guide.formName}`, "item": `${baseUrl}/api/guides/${guide.slug}` },
    ],
  };

  const steps = guide.steps.map((step, i) => `
    <div style="display:flex;gap:16px;margin-bottom:20px;padding-bottom:20px;border-bottom:1px solid #e8edf5;">
      <div style="min-width:36px;height:36px;background:#1a4b8c;color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:14px;flex-shrink:0;">${i + 1}</div>
      <div>
        <h3 style="font-size:15px;font-weight:700;color:#0f1f3d;margin-bottom:6px;">${escapeHtml(step.title)}</h3>
        <p style="font-size:14px;color:#374151;line-height:1.7;">${escapeHtml(step.description)}</p>
      </div>
    </div>`).join("");

  const mistakes = guide.commonMistakes.map(m => `
    <div style="display:flex;gap:10px;margin-bottom:10px;">
      <span style="color:#dc2626;font-weight:700;flex-shrink:0;">✗</span>
      <p style="font-size:14px;color:#374151;line-height:1.6;">${escapeHtml(m)}</p>
    </div>`).join("");

  const relatedLinks = guide.relatedForms.map(slug => {
    const rel = FORM_GUIDES.find(g => g.slug === slug);
    if (!rel) return "";
    return `<a href="${baseUrl}/api/guides/${slug}" style="display:block;padding:12px 16px;background:#f5f7fa;border:1px solid #dde2ec;border-radius:10px;text-decoration:none;margin-bottom:8px;">
      <span style="font-weight:700;color:#1a4b8c;">${escapeHtml(rel.formNumber)}</span>
      <span style="color:#6b7280;font-size:13px;"> — ${escapeHtml(rel.formName)}</span>
    </a>`;
  }).join("");

  const whatToInclude = guide.whatToInclude ? `
    <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:12px;padding:20px;margin-bottom:24px;">
      <h3 style="font-size:15px;font-weight:700;color:#15803d;margin-bottom:12px;">📎 Documents to Include</h3>
      ${guide.whatToInclude.map(item => `
        <div style="display:flex;gap:10px;margin-bottom:8px;">
          <span style="color:#16a34a;font-weight:700;flex-shrink:0;">✓</span>
          <p style="font-size:14px;color:#14532d;">${escapeHtml(item)}</p>
        </div>`).join("")}
    </div>` : "";

  return htmlShell({
    title: `How to Complete ${guide.formNumber} (${guide.formName}) — Ontario Family Court`,
    description: guide.shortDesc,
    canonical: `${baseUrl}/api/guides/${guide.slug}`,
    keywords: guide.keywords,
    schemaJson: [howToSchema, faqSchema, breadcrumbSchema],
    body: `
<div style="background:#1a4b8c;padding:40px 20px;padding-bottom:20px;">
  <div class="container">
    <nav class="breadcrumb" style="color:rgba(255,255,255,0.65);">
      <a href="/api/landing" style="color:rgba(255,255,255,0.8);">Home</a>
      <span>›</span>
      <a href="/api/guides" style="color:rgba(255,255,255,0.8);">Form Guides</a>
      <span>›</span>
      <span style="color:#fff;">${escapeHtml(guide.formNumber)}</span>
    </nav>
    <span style="display:inline-block;background:#c9a22725;color:#c9a227;border:1px solid #c9a22750;padding:4px 14px;border-radius:20px;font-size:12px;font-weight:700;margin-bottom:14px;">${escapeHtml(guide.formNumber)}</span>
    <h1 style="font-size:32px;font-weight:800;color:#fff;margin-bottom:10px;">${escapeHtml(guide.formName)}</h1>
    <p style="font-size:16px;color:rgba(255,255,255,0.85);max-width:600px;line-height:1.6;">${escapeHtml(guide.shortDesc)}</p>
  </div>
</div>

<div class="container" style="padding-top:32px;padding-bottom:64px;">

  ${guide.deadline ? `
  <div style="background:#fef2f2;border:1px solid #fca5a5;border-radius:12px;padding:18px 20px;margin-bottom:24px;display:flex;gap:12px;align-items:center;">
    <span style="font-size:22px;flex-shrink:0;">⏰</span>
    <div>
      <span style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#dc2626;">Key Deadline</span>
      <p style="font-size:14px;color:#7f1d1d;margin-top:2px;font-weight:600;">${escapeHtml(guide.deadline)}</p>
    </div>
  </div>` : ""}

  <div style="background:#fff;border:1px solid #dde2ec;border-radius:14px;padding:24px;margin-bottom:24px;">
    <h2 style="font-size:18px;font-weight:700;color:#0f1f3d;margin-bottom:10px;">What is ${escapeHtml(guide.formNumber)}?</h2>
    <p style="font-size:14px;color:#374151;line-height:1.8;">${escapeHtml(guide.purpose)}</p>
  </div>

  <div style="background:#fff;border:1px solid #dde2ec;border-radius:14px;padding:24px;margin-bottom:24px;">
    <h2 style="font-size:18px;font-weight:700;color:#0f1f3d;margin-bottom:10px;">When to use this form</h2>
    <p style="font-size:14px;color:#374151;line-height:1.8;">${escapeHtml(guide.whenToUse)}</p>
  </div>

  ${whatToInclude}

  <div style="background:#fff;border:1px solid #dde2ec;border-radius:14px;padding:24px;margin-bottom:24px;">
    <h2 style="font-size:18px;font-weight:700;color:#0f1f3d;margin-bottom:20px;">Step-by-Step Instructions</h2>
    ${steps}
    <a href="${guide.downloadUrl}" target="_blank" rel="noopener" style="display:inline-flex;align-items:center;gap:8px;background:#1a4b8c;color:#fff;padding:12px 24px;border-radius:10px;font-weight:700;font-size:14px;text-decoration:none;margin-top:8px;">
      ↓ Download ${escapeHtml(guide.formNumber)} (Ontario Courts)
    </a>
  </div>

  <div style="background:#fff;border:1px solid #dde2ec;border-radius:14px;padding:24px;margin-bottom:24px;">
    <h2 style="font-size:18px;font-weight:700;color:#dc2626;margin-bottom:14px;">Common Mistakes to Avoid</h2>
    ${mistakes}
  </div>

  <div class="disclaimer-box">
    <span>⚠️</span>
    <span>This guide is for general information only and does not constitute legal advice. Court procedures and forms change — always use forms from <a href="https://ontariocourtforms.on.ca" target="_blank">ontariocourtforms.on.ca</a> and consult a lawyer for your situation.</span>
  </div>

  ${relatedLinks ? `
  <div style="margin-top:24px;">
    <h3 style="font-size:14px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:12px;">Related Forms</h3>
    ${relatedLinks}
  </div>` : ""}

  <div style="background:#1a4b8c;border-radius:16px;padding:28px;margin-top:36px;text-align:center;color:#fff;">
    <p style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;opacity:0.7;margin-bottom:8px;">Premium Feature</p>
    <h3 style="font-size:22px;font-weight:800;margin-bottom:10px;">Want AI to draft this form for you?</h3>
    <p style="opacity:0.85;font-size:14px;margin-bottom:20px;">The Ontario Family Law Guide app generates AI-powered draft forms based on your facts — complete with placeholders for everything you need to fill in.</p>
    <a href="/api/landing" style="display:inline-block;background:#c9a227;color:#0f1f3d;padding:12px 28px;border-radius:10px;font-weight:700;font-size:15px;text-decoration:none;">Get the App →</a>
  </div>
</div>`,
  });
}
