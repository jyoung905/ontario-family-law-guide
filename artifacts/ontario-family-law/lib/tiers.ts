// ─── Tier & Entitlement Config ────────────────────────────────────────────────
// This is the single source of truth for all paid tiers.
// To add a new prep pack: add an entry to PREP_PACKS and ENTITLEMENT_TIER below.

export type Tier = "guided_help" | "prep_pack" | "drafting_help";

export type EntitlementId =
  | "guided_help"
  | "prep_pack_served"
  | "prep_pack_motion"
  | "prep_pack_enforcement"
  | "prep_pack_parenting"
  | "prep_pack_support"
  | "prep_pack_section7"
  | "prep_pack_court_prep"
  | "drafting_help";

// Maps each entitlement → which tier paywall to show when the user is locked out
export const ENTITLEMENT_TIER: Record<EntitlementId, Tier> = {
  guided_help: "guided_help",
  prep_pack_served: "prep_pack",
  prep_pack_motion: "prep_pack",
  prep_pack_enforcement: "prep_pack",
  prep_pack_parenting: "prep_pack",
  prep_pack_support: "prep_pack",
  prep_pack_section7: "prep_pack",
  prep_pack_court_prep: "prep_pack",
  drafting_help: "drafting_help",
};

export interface TierConfig {
  id: Tier;
  name: string;
  tagline: string;
  price: string;
  priceNote: string;
  badge: string;
  badgeColor: string;
  description: string;
  features: string[];
  icon: string;
  rcEntitlement: string; // RevenueCat entitlement identifier
}

export const TIER_CONFIG: Record<Tier, TierConfig> = {
  guided_help: {
    id: "guided_help",
    name: "Guided Help",
    tagline: "Get a clearer plan",
    price: "$29",
    priceNote: "one-time",
    badge: "STEP UP",
    badgeColor: "#0891b2",
    description: "Understand your situation more deeply with personalized guidance beyond the basics.",
    features: [
      "Personalized next-step plans for your case",
      "Deeper issue-specific guidance",
      "Advanced AI answers",
      "Detailed action plans",
    ],
    icon: "map-outline",
    rcEntitlement: "guided_help",
  },
  prep_pack: {
    id: "prep_pack",
    name: "Prep Packs",
    tagline: "Follow a step-by-step workflow for your situation",
    price: "From $79",
    priceNote: "per pack",
    badge: "SCENARIO PACKS",
    badgeColor: "#7c3aed",
    description: "A structured, step-by-step guide built around your exact situation in family court.",
    features: [
      "Issue-specific guided workflows",
      "Document gathering checklists",
      "Stronger preparation tools",
      "More packs added regularly",
    ],
    icon: "layers-outline",
    rcEntitlement: "prep_pack_served",
  },
  drafting_help: {
    id: "drafting_help",
    name: "Drafting Help",
    tagline: "Prepare your court documents yourself",
    price: "$299",
    priceNote: "one-time",
    badge: "HIGHEST VALUE",
    badgeColor: "#002631",
    description: "The work lawyers charge thousands for — done with AI, reviewed by you.",
    features: [
      "AI court form drafting (Form 10, 14B, 15B, 35.1 & more)",
      "Affidavit chronology builder",
      "Complete filing package",
      "Communication Coach",
      "Lawyer-ready document export",
    ],
    icon: "document-text-outline",
    rcEntitlement: "drafting_help",
  },
};

// Individual prep packs — add new ones here and the UI picks them up automatically
export const PREP_PACKS = [
  { id: "prep_pack_served" as EntitlementId, name: "I Got Served", price: "$79", icon: "mail-open-outline" },
  { id: "prep_pack_motion" as EntitlementId, name: "Respond to a Motion", price: "$79", icon: "hand-right-outline" },
  { id: "prep_pack_enforcement" as EntitlementId, name: "Enforce an Order", price: "$99", icon: "shield-checkmark-outline" },
  { id: "prep_pack_parenting" as EntitlementId, name: "Parenting & Access", price: "$99", icon: "people-outline" },
  { id: "prep_pack_support" as EntitlementId, name: "Child / Spousal Support", price: "$99", icon: "card-outline" },
  { id: "prep_pack_section7" as EntitlementId, name: "Section 7 Expenses", price: "$79", icon: "receipt-outline" },
  { id: "prep_pack_court_prep" as EntitlementId, name: "Court Prep", price: "$149", icon: "briefcase-outline" },
];

export const TIER_ORDER: Tier[] = ["guided_help", "prep_pack", "drafting_help"];
