import { htmlShell, escapeHtml, getBaseUrl } from "./shared";

export interface GlossaryTerm {
  slug: string;
  term: string;
  shortDef: string;
  fullDef: string;
  formNumbers?: string[];
  deadline?: string;
  example?: string;
  relatedTerms?: string[];
  keywords: string;
}

export const TERMS: GlossaryTerm[] = [
  {
    slug: "affidavit",
    term: "Affidavit",
    shortDef: "A written statement sworn or affirmed to be true, used as evidence in court.",
    fullDef: `An affidavit is a formal written statement that you swear (or affirm) is true. In Ontario family court, affidavits are among the most important documents you will file — they are how you tell your side of the story to a judge. The person making the affidavit is called the "deponent." You must sign it in front of a commissioner of oaths (a notary public, lawyer, or other authorized person), who also signs it to confirm your identity and that you understood you were swearing to the truth of the contents. If you lie in an affidavit, you can be charged with perjury, which is a criminal offence.`,
    formNumbers: ["Form 14A", "Form 35.1"],
    example: "If you are bringing a motion, you will attach a Form 14A Affidavit to explain why you are asking for what you are requesting.",
    relatedTerms: ["commissioner-of-oaths", "motion", "perjury"],
    keywords: "affidavit Ontario family court, sworn statement Ontario, form 14A Ontario",
  },
  {
    slug: "answer",
    term: "Answer (Form 10)",
    shortDef: "The document filed by the respondent to respond to an Application (Form 8).",
    fullDef: `When one person starts a family court case by filing an Application (Form 8), the other party — called the respondent — must file an Answer (Form 10) to respond. The Answer allows the respondent to agree or disagree with what the applicant is asking for, and to make their own claims. In Ontario, you generally have 30 days from the date you were served with the Application to file your Answer. Missing this deadline can result in you being "noted in default," which means the case can proceed without your input.`,
    formNumbers: ["Form 10"],
    deadline: "30 days from date of service of the Application (Form 8)",
    example: "Your spouse files for divorce and sole custody. You receive the Application. You must file a Form 10 Answer within 30 days to tell the court your position.",
    relatedTerms: ["application", "default", "service", "respondent"],
    keywords: "Form 10 Ontario answer, 30 days file answer Ontario, respondent answer family court",
  },
  {
    slug: "application",
    term: "Application (Form 8 / 8A)",
    shortDef: "The document that starts a family court case in Ontario.",
    fullDef: `An Application is the document that begins a family court case. There are two main types: Form 8 (General Application — for most family law matters like custody, access, support, or divorce) and Form 8A (Simple Application — used only for a simple divorce where no other issues are disputed). Once you file an Application at the court office, you must serve it on the other party. After being served, they have 30 days to file an Answer (Form 10). The Application must set out exactly what orders you are seeking from the court.`,
    formNumbers: ["Form 8", "Form 8A"],
    example: "You want to ask the court for custody of your children and child support. You file a Form 8 Application listing both of those requests.",
    relatedTerms: ["answer", "service", "applicant"],
    keywords: "Form 8 Ontario application family court, how to start family court case Ontario, Form 8A simple divorce",
  },
  {
    slug: "case-conference",
    term: "Case Conference",
    shortDef: "A required first meeting with a judge to discuss the issues before any motions are brought.",
    fullDef: `A case conference is a meeting with a judge or court officer that is required before you can bring a motion (unless you have an emergency). It is not a hearing — the judge does not make final orders at a case conference. Instead, the purpose is to: identify the issues in dispute, see if any issues can be resolved by agreement, discuss how the case should proceed, and narrow the issues for trial. Both parties must attend. You must file a Form 17 (Conference Notice) at least 7 days before the case conference, along with a brief (Form 17A) summarizing your position.`,
    formNumbers: ["Form 17", "Form 17A"],
    deadline: "Form 17 must be filed at least 7 days before the conference",
    example: "Before you can ask the court to change a custody schedule, you must first attend a case conference with the judge to try to resolve the issue.",
    relatedTerms: ["settlement-conference", "motion", "brief"],
    keywords: "case conference Ontario family court, Form 17 case conference, before motion Ontario family law",
  },
  {
    slug: "commissioner-of-oaths",
    term: "Commissioner of Oaths",
    shortDef: "A person authorized to witness the signing of sworn documents like affidavits.",
    fullDef: `A commissioner of oaths is someone legally authorized to administer oaths and take affidavits in Ontario. When you swear an affidavit, you must do so in front of a commissioner. Common commissioners of oaths include: lawyers and paralegals (all are commissioners), notaries public, court clerks, some bank employees, and people specifically designated as commissioners by the government. Many Service Ontario offices, libraries, and police stations also have commissioners available. There is usually a small fee (often $10–$25 per document). Some courthouses offer free commissioner services for self-represented litigants.`,
    example: "Before filing your affidavit with the court, you take it to your local library where a commissioner of oaths witnesses you swear that its contents are true.",
    relatedTerms: ["affidavit"],
    keywords: "commissioner of oaths Ontario, where to swear affidavit Ontario, notary Ontario family court",
  },
  {
    slug: "default",
    term: "Noted in Default",
    shortDef: "What happens when the respondent fails to file an Answer within 30 days — the case can proceed without them.",
    fullDef: `Being "noted in default" is a serious consequence. If you are served with a family court Application and you do not file your Answer (Form 10) within 30 days, the applicant can ask the court to note you in default. Once you are noted in default: the case can proceed without your participation, you cannot file any documents or appear at hearings without the court's permission, and the court may grant the orders the applicant asked for without hearing your side. If you have been noted in default, you can bring a motion to set aside the default, but you will need to explain why you missed the deadline and show that you have a reasonable defence.`,
    formNumbers: ["Form 10"],
    deadline: "30 days from service of the Application",
    example: "You were served with a Form 8 Application asking for sole custody. You did not file a Form 10 Answer within 30 days. The applicant has you noted in default and the court may grant sole custody without hearing from you.",
    relatedTerms: ["answer", "application", "service"],
    keywords: "noted in default Ontario family court, missed deadline Form 10, set aside default Ontario",
  },
  {
    slug: "duty-counsel",
    term: "Duty Counsel",
    shortDef: "Free, same-day legal help available at Ontario courthouses from Legal Aid-funded lawyers.",
    fullDef: `Duty counsel are lawyers funded by Legal Aid Ontario who provide free, short-term legal advice and assistance at courthouses on the day of your court appearance. They can: review your court documents, give you legal advice about your situation, help you understand the court process, and in some cases speak for you in front of the judge at a routine appearance. Duty counsel is available on a first-come, first-served basis — arrive early (usually before 9:00 a.m.) on your court date to sign in for duty counsel services. Note: duty counsel can help with many things but may not be able to do complex work for you. They are particularly useful for first appearances, case conferences, and urgent motions.`,
    example: "You have a case conference scheduled at 10 a.m. You arrive at the courthouse at 8:30 a.m., sign in with duty counsel, and a lawyer reviews your brief with you and advises you on what to expect.",
    relatedTerms: ["case-conference", "legal-aid"],
    keywords: "duty counsel Ontario, free legal help courthouse Ontario, Legal Aid Ontario same day lawyer",
  },
  {
    slug: "fro",
    term: "Family Responsibility Office (FRO)",
    shortDef: "The Ontario government agency that enforces child and spousal support orders.",
    fullDef: `The Family Responsibility Office (FRO) is an Ontario government agency that automatically enforces support orders. When a court makes a child support or spousal support order, it is automatically filed with the FRO (unless both parties agree in writing to withdraw from FRO enforcement). The FRO collects support payments from the person who must pay and sends the money to the person who is supposed to receive it. If the payor falls behind on support, the FRO has powerful enforcement tools including: suspending driver's licences, garnishing wages and bank accounts, seizing federal government payments (like tax refunds), and reporting the arrears to credit bureaus.`,
    example: "Your ex-spouse stops paying the court-ordered child support. Because the order is filed with the FRO, you contact them and they garnish your ex-spouse's wages to collect the support owed.",
    relatedTerms: ["support"],
    keywords: "Family Responsibility Office Ontario, FRO enforce support, child support enforcement Ontario",
  },
  {
    slug: "financial-statement",
    term: "Financial Statement (Form 13 / 13.1)",
    shortDef: "A sworn document disclosing all income, expenses, assets, and debts, required in support and property matters.",
    fullDef: `A Financial Statement is a detailed, sworn document that lists all of your income, expenses, assets, and debts. There are two versions: Form 13 (used in cases involving only support — no property claims) and Form 13.1 (used in cases involving both support and property division). You must file a Financial Statement if your case involves support or property issues. The information you provide must be truthful — you swear to it before a commissioner of oaths. Both parties must exchange Financial Statements, which allows the court to make fair orders about support and property. Hiding assets or lying on a Financial Statement is contempt of court.`,
    formNumbers: ["Form 13", "Form 13.1"],
    deadline: "Must be served and filed before most financial hearings — typically 30 days before a motion on support",
    example: "Your spouse is asking for spousal support. Both of you must complete and exchange Financial Statements so the court can see both of your financial situations.",
    relatedTerms: ["support", "affidavit"],
    keywords: "Form 13 financial statement Ontario, Form 13.1 Ontario family court, income disclosure family court Ontario",
  },
  {
    slug: "motion",
    term: "Motion",
    shortDef: "A request to the court for a temporary order while the case is ongoing.",
    fullDef: `A motion is a request to the court for a temporary order — it is not the final resolution of your case. You might bring a motion for: temporary custody or access arrangements, temporary child or spousal support, requiring a spouse to pay for certain expenses while the case continues, or an urgent order when there is a safety concern. To bring a motion, you file Form 14 (Notice of Motion) and Form 14A (Affidavit) explaining what you want and why. The other party can respond with Form 14B. You generally cannot bring a motion until after a case conference has been held, unless there is an emergency. A judge will hear arguments at the motion hearing and make a temporary order.`,
    formNumbers: ["Form 14", "Form 14A", "Form 14B"],
    example: "While your divorce case is proceeding, you need a temporary order for child support right now. You bring a motion (Form 14 + Form 14A) asking for interim support.",
    relatedTerms: ["case-conference", "affidavit", "temporary-order"],
    keywords: "motion Ontario family court, Form 14 motion, temporary order Ontario family law, interim custody motion",
  },
  {
    slug: "parenting-affidavit",
    term: "Parenting Affidavit (Form 35.1)",
    shortDef: "A sworn document required in all cases involving parenting time or decision-making responsibility.",
    fullDef: `Form 35.1 is a mandatory affidavit that must be filed whenever a case involves parenting time (formerly called "access") or decision-making responsibility (formerly called "custody"). It requires you to provide detailed information about: the children's living arrangements for the past year, your parenting history and involvement, any prior court orders or family agreements about the children, any history of domestic violence or child protection involvement, and any criminal charges relating to children. This form replaced the old "custody and access affidavit" and uses the updated terminology from the 2020 amendments to the Divorce Act.`,
    formNumbers: ["Form 35.1"],
    example: "You are applying for decision-making responsibility for your children. You must file a Form 35.1 as part of your Application, detailing your parenting history and the children's current arrangements.",
    relatedTerms: ["application", "parenting-time", "decision-making"],
    keywords: "Form 35.1 Ontario, parenting affidavit Ontario family court, custody affidavit Ontario 2024",
  },
  {
    slug: "respondent",
    term: "Respondent / Applicant",
    shortDef: "The applicant starts the case; the respondent is the other party who must respond.",
    fullDef: `In Ontario family court, the person who starts a case by filing an Application is called the applicant. The person who is served with (receives) the Application and must respond is called the respondent. These are not value-laden terms — being the respondent does not mean you are in the wrong. The respondent has 30 days to file an Answer (Form 10). Both parties have equal standing before the court. In some cases, the respondent may also make their own claims in the Answer, asking the court for orders as well. If a respondent does not file an Answer in time, they risk being "noted in default."`,
    relatedTerms: ["application", "answer", "default"],
    keywords: "respondent applicant Ontario family court, who is respondent Ontario, difference applicant respondent Ontario",
  },
  {
    slug: "self-represented",
    term: "Self-Represented Litigant (SRL)",
    shortDef: "A person who represents themselves in court without a lawyer.",
    fullDef: `A self-represented litigant (SRL), also called a "self-rep," is someone who navigates the court process without a lawyer. In Ontario family court, a large proportion of people are self-represented. Courts have a duty to accommodate self-represented parties and cannot treat you differently because you don't have a lawyer — but the court also cannot help you make legal arguments or tell you what to do. Resources for self-represented litigants include: Duty Counsel at the courthouse (free, same-day legal advice), Family Law Information Centres (FLICs), Legal Aid Ontario, Law Society Referral Service (30 minutes free with a lawyer), and Steps to Justice (stepstojustice.ca).`,
    example: "You cannot afford a lawyer for your custody dispute. You represent yourself, attend all hearings, and use duty counsel on your court dates for quick advice.",
    relatedTerms: ["duty-counsel", "legal-aid"],
    keywords: "self-represented litigant Ontario, SRL Ontario family court, how to represent yourself Ontario family court",
  },
  {
    slug: "service",
    term: "Service / Serve",
    shortDef: "Officially delivering court documents to the other party in a legally recognized way.",
    fullDef: `"Service" means officially delivering court documents to the other party in a way the court recognizes as valid. Different documents have different service requirements: the original Application (Form 8) must be served personally (handed directly to the person) or by an alternative to personal service. Most subsequent documents can be served by regular lettermail, email (if the party has agreed), or fax. Whoever serves the documents must complete an Affidavit of Service (Form 6B) to prove to the court that service was done properly. The date of service is important because many deadlines (like the 30-day Answer deadline) run from that date.`,
    formNumbers: ["Form 6B"],
    example: "You file your Application and need to serve it on your spouse. You hire a process server to hand it to them personally. The process server then completes a Form 6B Affidavit of Service, which you file with the court.",
    relatedTerms: ["application", "answer", "affidavit"],
    keywords: "service Ontario family court, how to serve documents Ontario, affidavit of service Form 6B Ontario",
  },
  {
    slug: "settlement-conference",
    term: "Settlement Conference",
    shortDef: "A meeting before a judge aimed at settling the case before trial.",
    fullDef: `A settlement conference is a meeting with a judge that happens after the case conference and before trial. Its primary goal is to help the parties reach a settlement and avoid going to trial. The judge at the settlement conference is not the trial judge — they are there to help facilitate an agreement, not decide the case. At a settlement conference, the judge can: make recommendations (though not binding orders), express views on the likely outcome if the case went to trial, encourage settlement, and identify which issues remain in dispute. If you still can't settle after a settlement conference, the case will be scheduled for trial.`,
    formNumbers: ["Form 17C"],
    example: "After your case conference, you and your spouse still disagree on spousal support. The court schedules a settlement conference where the judge reviews both Financial Statements and recommends an amount as a starting point for settlement.",
    relatedTerms: ["case-conference", "trial"],
    keywords: "settlement conference Ontario family court, Form 17C settlement conference Ontario, before trial family court Ontario",
  },
  {
    slug: "support",
    term: "Support (Child / Spousal)",
    shortDef: "Court-ordered financial payments from one party to another for children or a former spouse.",
    fullDef: `There are two main types of support in Ontario family law: Child support is money paid by the parent who does not have primary residence of the children to the parent who does. It is calculated using the Federal Child Support Guidelines, based on the paying parent's income and the number of children. Child support is the right of the child and generally cannot be waived. Spousal support (also called partner support for common-law partners) is money paid from one spouse to another to recognize their economic interdependence and help the receiving spouse become financially self-sufficient. Spousal support is not automatic — it depends on factors like the length of the relationship and the financial situation of each party.`,
    example: "You and your spouse are separating. You earn $90,000/year and your spouse earns $30,000/year. The Child Support Guidelines will determine how much you pay in child support based on your income.",
    relatedTerms: ["financial-statement", "fro", "table-amount"],
    keywords: "child support Ontario, spousal support Ontario, child support guidelines Ontario, how much is support Ontario",
  },
  {
    slug: "without-prejudice",
    term: "Without Prejudice",
    shortDef: "A label on communications that prevents them from being used as evidence if settlement talks fail.",
    fullDef: `"Without prejudice" is a label you can put on letters, emails, or offers to settle that means: if the settlement discussions do not result in an agreement, nothing said or written in that communication can be used against you in court. It encourages open and honest negotiation because parties can make offers without worrying that those offers will be cited as admissions in court. However, "without prejudice" does not make every communication confidential — it must be a genuine settlement offer or discussion. If a document says "without prejudice" but isn't actually part of a settlement discussion, a court may rule that the label doesn't apply.`,
    example: 'You email your ex: "Without prejudice — I am willing to offer $800/month in spousal support to settle this matter." If they don\'t accept, this email cannot be shown to the judge as evidence of what you thought was fair.',
    relatedTerms: ["settlement-conference", "offer-to-settle"],
    keywords: "without prejudice Ontario family court, settlement offer Ontario, without prejudice letter family law",
  },
  {
    slug: "best-interests",
    term: "Best Interests of the Child",
    shortDef: "The legal standard that governs all decisions about parenting in Ontario family court.",
    fullDef: `"Best interests of the child" is the overarching standard that governs every decision a court makes about parenting time and decision-making responsibility. Under the Divorce Act and the Children's Law Reform Act, judges must consider a list of factors when assessing what is in a child's best interests, including: the child's physical, emotional, and psychological needs; the nature and strength of the child's relationship with each parent; the ability of each parent to support the child's relationship with the other parent; any family violence or abuse; and the child's own views and preferences (depending on their age and maturity). No single factor is determinative — the judge weighs all of them together.`,
    example: "A parent wants to move to another city with the children. The court applies the best interests test — weighing the children's relationship with the other parent, the children's community connections, and the educational opportunities in the new city.",
    relatedTerms: ["parenting-affidavit", "decision-making", "parenting-time"],
    keywords: "best interests of the child Ontario, custody decision factors Ontario, parenting order Ontario family court",
  },
  {
    slug: "order",
    term: "Order",
    shortDef: "A court's official decision — final orders end the case; interim orders are temporary.",
    fullDef: `A court order is the official decision of a judge on a specific issue. In Ontario family law, there are two main types: interim orders (also called temporary orders) are made while the case is ongoing — for example, an interim custody arrangement while the divorce is being finalized. Final orders resolve the issues at the end of the case — they remain in effect until changed. A consent order is one that both parties have agreed to, which is then approved by the court. If a party does not follow a court order, the other party can bring a motion to enforce it, and the court may hold the non-complying party in contempt.`,
    example: "During your divorce, the court makes an interim order giving you parenting time every other weekend. Once the divorce is finalized, the court makes a final order setting out the long-term parenting arrangement.",
    relatedTerms: ["motion", "consent-order", "contempt"],
    keywords: "court order Ontario family law, interim order Ontario, final order Ontario divorce, consent order Ontario",
  },
  {
    slug: "legal-aid",
    term: "Legal Aid Ontario",
    shortDef: "Government-funded legal services for Ontarians who cannot afford a lawyer.",
    fullDef: `Legal Aid Ontario (LAO) provides government-funded legal services to Ontarians with low incomes. For family law matters, Legal Aid may provide: a certificate to hire a private lawyer who accepts Legal Aid (income tested), duty counsel services at courthouses (generally available to all), summary legal advice (phone consultations), and Family Law Service Centres in some locations. To qualify for a Legal Aid certificate, your income must be below a certain threshold (which varies based on family size). Call 1-800-668-8258 or visit legalaid.on.ca to check eligibility. Even if you don't qualify financially, Legal Aid offices often have staff who can point you to other free or low-cost resources.`,
    example: "You are going through a custody dispute and earn $35,000/year with two children. You call Legal Aid Ontario and qualify for a certificate that covers up to a certain number of hours with a private family law lawyer.",
    relatedTerms: ["duty-counsel", "self-represented"],
    keywords: "Legal Aid Ontario family law, free lawyer Ontario, how to get legal aid certificate Ontario",
  },
];

export function getTermIndexHtml(): string {
  const baseUrl = getBaseUrl();
  const groupedTerms = TERMS.reduce((acc, term) => {
    const letter = term.term[0].toUpperCase();
    if (!acc[letter]) acc[letter] = [];
    acc[letter].push(term);
    return acc;
  }, {} as Record<string, GlossaryTerm[]>);

  const letters = Object.keys(groupedTerms).sort();

  const letterNav = letters.map(l => `<a href="#letter-${l}" style="padding:6px 12px;background:#1a4b8c;color:#fff;border-radius:6px;font-weight:700;font-size:14px;text-decoration:none;">${l}</a>`).join("");

  const sections = letters.map(letter => {
    const terms = groupedTerms[letter];
    const items = terms.map(t => `
      <a href="${baseUrl}/api/learn/${t.slug}" style="display:block;padding:14px 0;border-bottom:1px solid #e8edf5;text-decoration:none;">
        <span style="font-weight:700;color:#1a4b8c;font-size:15px;">${escapeHtml(t.term)}</span>
        <span style="display:block;color:#6b7280;font-size:13px;margin-top:3px;">${escapeHtml(t.shortDef)}</span>
      </a>`).join("");
    return `
      <div id="letter-${letter}" style="margin-bottom:32px;">
        <h2 style="font-size:22px;font-weight:800;color:#1a4b8c;border-bottom:3px solid #c9a227;padding-bottom:8px;margin-bottom:4px;">${letter}</h2>
        ${items}
      </div>`;
  }).join("");

  const schema = {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    "name": "Ontario Family Law Glossary",
    "description": "Plain-language definitions of Ontario family law terms for self-represented litigants.",
    "url": `${baseUrl}/api/learn`,
    "hasDefinedTerm": TERMS.map(t => ({
      "@type": "DefinedTerm",
      "name": t.term,
      "description": t.shortDef,
      "url": `${baseUrl}/api/learn/${t.slug}`,
      "inDefinedTermSet": `${baseUrl}/api/learn`,
    })),
  };

  return htmlShell({
    title: "Ontario Family Law Glossary — Plain-Language Legal Terms",
    description: "Clear, plain-language definitions of Ontario family law terms. Understand affidavits, motions, case conferences, default, and more — designed for self-represented litigants.",
    canonical: `${baseUrl}/api/learn`,
    keywords: "Ontario family law glossary, family court terms Ontario, legal terms Ontario plain language",
    schemaJson: schema,
    body: `
<div style="background:#1a4b8c;padding:48px 20px;text-align:center;color:#fff;">
  <div class="badge" style="background:rgba(201,162,39,0.15);color:#c9a227;border-color:rgba(201,162,39,0.3);margin-bottom:16px;">FREE RESOURCE</div>
  <h1 style="font-size:36px;font-weight:800;margin-bottom:12px;">Ontario Family Law Glossary</h1>
  <p style="font-size:17px;max-width:560px;margin:0 auto;opacity:0.85;">Plain-language definitions for self-represented litigants. No legalese — just clear explanations of what these terms mean for your case.</p>
</div>

<div class="container" style="padding-top:32px;padding-bottom:64px;">
  <nav class="breadcrumb">
    <a href="/api/landing">Home</a>
    <span>›</span>
    <span>Glossary</span>
  </nav>
  <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:36px;">${letterNav}</div>
  ${sections}
  <div class="disclaimer-box">
    <span>⚠️</span>
    <span>These definitions are for general information only and do not constitute legal advice. Laws and procedures change — always verify with a licensed lawyer or by checking <a href="https://ontario.ca/laws" target="_blank">ontario.ca/laws</a> for the current rules.</span>
  </div>
</div>`,
  });
}

export function getTermHtml(slug: string): string | null {
  const term = TERMS.find(t => t.slug === slug);
  if (!term) return null;
  const baseUrl = getBaseUrl();

  const relatedLinks = term.relatedTerms
    ? term.relatedTerms.map(s => {
      const rel = TERMS.find(t => t.slug === s);
      if (!rel) return "";
      return `<a href="${baseUrl}/api/learn/${s}" style="display:inline-block;padding:6px 14px;border:1px solid #dde2ec;border-radius:20px;font-size:13px;color:#1a4b8c;text-decoration:none;margin:4px;">${escapeHtml(rel.term)}</a>`;
    }).join("")
    : "";

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": `What is a ${term.term} in Ontario family court?`,
        "acceptedAnswer": { "@type": "Answer", "text": term.fullDef },
      },
      ...(term.deadline ? [{
        "@type": "Question",
        "name": `What is the deadline for ${term.term}?`,
        "acceptedAnswer": { "@type": "Answer", "text": term.deadline },
      }] : []),
      ...(term.example ? [{
        "@type": "Question",
        "name": `Can you give an example of how ${term.term} works?`,
        "acceptedAnswer": { "@type": "Answer", "text": term.example },
      }] : []),
    ],
  };

  const definedTermSchema = {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    "name": term.term,
    "description": term.fullDef,
    "url": `${baseUrl}/api/learn/${term.slug}`,
    "inDefinedTermSet": {
      "@type": "DefinedTermSet",
      "name": "Ontario Family Law Glossary",
      "url": `${baseUrl}/api/learn`,
    },
    "dateModified": "2025-01-01",
  };

  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": `${term.term} — Ontario Family Law Glossary`,
    "description": term.shortDef,
    "url": `${baseUrl}/api/learn/${term.slug}`,
    "dateModified": "2025-01-01",
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": `${baseUrl}/api/landing` },
        { "@type": "ListItem", "position": 2, "name": "Glossary", "item": `${baseUrl}/api/learn` },
        { "@type": "ListItem", "position": 3, "name": term.term, "item": `${baseUrl}/api/learn/${term.slug}` },
      ],
    },
  };

  return htmlShell({
    title: `${term.term} — Ontario Family Law Glossary`,
    description: term.shortDef,
    canonical: `${baseUrl}/api/learn/${term.slug}`,
    keywords: term.keywords,
    schemaJson: [webPageSchema, definedTermSchema, faqSchema],
    body: `
<div style="background:#1a4b8c;padding:40px 20px;padding-bottom:20px;">
  <div class="container">
    <nav class="breadcrumb" style="color:rgba(255,255,255,0.65);">
      <a href="/api/landing" style="color:rgba(255,255,255,0.8);">Home</a>
      <span>›</span>
      <a href="/api/learn" style="color:rgba(255,255,255,0.8);">Glossary</a>
      <span>›</span>
      <span style="color:#fff;">${escapeHtml(term.term)}</span>
    </nav>
    <div class="badge" style="margin-bottom:14px;">GLOSSARY</div>
    <h1 style="font-size:34px;font-weight:800;color:#fff;margin-bottom:12px;">${escapeHtml(term.term)}</h1>
    <p style="font-size:17px;color:rgba(255,255,255,0.85);max-width:620px;line-height:1.6;">${escapeHtml(term.shortDef)}</p>
    ${term.formNumbers ? `<div style="margin-top:14px;display:flex;gap:8px;flex-wrap:wrap;">${term.formNumbers.map(f => `<span style="background:rgba(201,162,39,0.25);color:#c9a227;padding:4px 12px;border-radius:16px;font-size:12px;font-weight:700;">${escapeHtml(f)}</span>`).join("")}</div>` : ""}
  </div>
</div>

<div class="container" style="padding-top:32px;padding-bottom:64px;">

  <div style="background:#fff;border:1px solid #dde2ec;border-radius:14px;padding:28px;margin-bottom:24px;">
    <h2 style="font-size:20px;font-weight:700;color:#0f1f3d;margin-bottom:14px;">Full Explanation</h2>
    <p style="font-size:15px;color:#374151;line-height:1.8;">${escapeHtml(term.fullDef)}</p>
  </div>

  ${term.deadline ? `
  <div style="background:#fef2f2;border:1px solid #fca5a5;border-radius:12px;padding:20px;margin-bottom:24px;display:flex;gap:12px;align-items:flex-start;">
    <span style="font-size:20px;">⏰</span>
    <div>
      <h3 style="font-size:15px;font-weight:700;color:#dc2626;margin-bottom:6px;">Key Deadline</h3>
      <p style="font-size:14px;color:#7f1d1d;line-height:1.6;">${escapeHtml(term.deadline)}</p>
    </div>
  </div>` : ""}

  ${term.example ? `
  <div style="background:#f0f9ff;border:1px solid #7dd3fc;border-radius:12px;padding:20px;margin-bottom:24px;">
    <h3 style="font-size:15px;font-weight:700;color:#0369a1;margin-bottom:8px;">Example</h3>
    <p style="font-size:14px;color:#1e3a5f;line-height:1.7;font-style:italic;">${escapeHtml(term.example)}</p>
  </div>` : ""}

  <div class="disclaimer-box">
    <span>⚠️</span>
    <span>This explanation is for general information only and does not constitute legal advice. Always consult a licensed lawyer for your specific situation.</span>
  </div>

  ${relatedLinks ? `
  <div style="margin-top:24px;">
    <h3 style="font-size:15px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:12px;">Related Terms</h3>
    <div>${relatedLinks}</div>
  </div>` : ""}

  <div style="background:#1a4b8c;border-radius:16px;padding:28px;margin-top:36px;text-align:center;color:#fff;">
    <p style="font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px;opacity:0.7;margin-bottom:8px;">Ontario Family Law Guide App</p>
    <h3 style="font-size:22px;font-weight:800;margin-bottom:10px;">Need help with your case?</h3>
    <p style="opacity:0.85;font-size:14px;margin-bottom:20px;">Draft court forms, build an affidavit, and get AI-powered guidance — all in plain language.</p>
    <a href="/api/landing" style="display:inline-block;background:#c9a227;color:#0f1f3d;padding:12px 28px;border-radius:10px;font-weight:700;font-size:15px;text-decoration:none;">Get the App →</a>
  </div>
</div>`,
  });
}
