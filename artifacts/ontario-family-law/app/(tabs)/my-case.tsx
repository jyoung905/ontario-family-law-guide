import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { useSubscription } from "@/lib/revenuecat";

const BASE_URL = `https://${process.env.EXPO_PUBLIC_DOMAIN}`;

// ─── Static case data ─────────────────────────────────────────────────────────

const ROLE_DATA = {
  served: {
    label: "Responding to an Application",
    summary: "You've been served with a court application. The other party has started proceedings — and the clock has started. You must respond.",
    urgency: "HIGH" as const,
    urgencyColor: "#9b1c1c",
    urgencyBg: "#fef2f2",
    urgencyBgDark: "#1c0808",
    deadline: { label: "File Form 10 Answer", sub: "30 days from the date you were served" },
    consequence: "If you don't respond, the court may note you in default and issue a final order without hearing your side.",
    nextAction: { label: "Find your service date", detail: "Check the documents for the date you personally received them. This starts your 30-day clock.", route: "/(tabs)/timeline" as const },
    checklist: [
      { id: "intake",         label: "Complete intake",                  detail: "Tell us your situation",                               locked: false, route: null },
      { id: "service_date",   label: "Find your service date",           detail: "Starts your 30-day clock",                             locked: false, route: "/(tabs)/timeline" as const },
      { id: "read_app",       label: "Read the Application carefully",   detail: "Understand every claim being made",                     locked: false, route: "/(tabs)/assistant" as const },
      { id: "gather_docs",    label: "Gather your documents",            detail: "Court papers, financial records, communications",       locked: false, route: null },
      { id: "contact_help",   label: "Contact Duty Counsel or Legal Aid",detail: "Free help at your courthouse",                          locked: false, route: null },
      { id: "track_deadline", label: "Track your deadline",              detail: "Add your 30-day deadline to the timeline",             locked: false, route: "/(tabs)/timeline" as const },
      { id: "draft_answer",   label: "Draft your Form 10 Answer",        detail: "AI-generated draft based on your facts",               locked: true,  route: "/(tabs)/draft" as const,     formId: "Form 10 (Answer)" },
      { id: "affidavit",      label: "Build your affidavit",             detail: "Structured narrative from your facts",                  locked: true,  route: "/(tabs)/affidavit" as const },
    ],
    gather: [
      { id: "court_docs",      label: "All documents received",           detail: "Application, affidavit, notice of hearing" },
      { id: "service_date",    label: "Date you were served",             detail: "Starts your legal deadline" },
      { id: "communications",  label: "Texts and emails with other party",detail: "Any relevant messages" },
      { id: "bank_statements", label: "Bank statements & pay stubs",      detail: "Required for any support claim" },
      { id: "kids_records",    label: "School and medical records",        detail: "If custody is in dispute" },
      { id: "prior_orders",    label: "Any existing court orders",         detail: "Previous agreements or judgments" },
    ],
    showRiskCard: true,
  },
  serving: {
    label: "Starting a Court Application",
    summary: "You are starting this case by filing a Form 8 Application and serving the other party. The court will then schedule a first appearance.",
    urgency: "MEDIUM" as const,
    urgencyColor: "#92400e",
    urgencyBg: "#fffbeb",
    urgencyBgDark: "#1a1000",
    deadline: { label: "No statutory deadline yet", sub: "File when you are ready to proceed" },
    consequence: "Delaying may allow the other party to act first and shift the dynamic of your case.",
    nextAction: { label: "Prepare your Form 8 Application", detail: "Understand what the court can order and what you are asking for before you file.", route: "/(tabs)/assistant" as const },
    checklist: [
      { id: "intake",        label: "Complete intake",                   detail: "Tell us your situation",                              locked: false, route: null },
      { id: "prepare_app",   label: "Prepare your Form 8 Application",   detail: "What you are asking the court for, and why",          locked: false, route: "/(tabs)/assistant" as const },
      { id: "gather_docs",   label: "Gather your documents",             detail: "Identification, financial records, evidence",         locked: false, route: null },
      { id: "file_court",    label: "File at the courthouse",            detail: "Bring Form 8 to the Family Court clerk's office",     locked: false, route: null },
      { id: "serve_other",   label: "Serve the other party",             detail: "Personal service by someone other than you",          locked: false, route: "/(tabs)/assistant" as const },
      { id: "proof_service", label: "File proof of service (Form 6B)",   detail: "Confirms the other party received the documents",     locked: false, route: "/(tabs)/timeline" as const },
      { id: "draft_form",    label: "Draft your Form 8 Application",     detail: "AI-generated draft based on your facts",              locked: true,  route: "/(tabs)/draft" as const,     formId: "Form 8 (Application)" },
      { id: "affidavit",     label: "Build your supporting affidavit",   detail: "Structured narrative from your facts",                locked: true,  route: "/(tabs)/affidavit" as const },
    ],
    gather: [
      { id: "full_name",    label: "Your legal name and address",        detail: "As it appears in court documents" },
      { id: "other_party",  label: "Other party's name and address",     detail: "Required to serve the Application" },
      { id: "children",     label: "Children's names and birthdates",    detail: "If custody is part of your claim" },
      { id: "financials",   label: "Pay stubs and bank statements",      detail: "Required for any support claim" },
      { id: "assets_debts", label: "List of assets and debts",           detail: "Homes, vehicles, savings, credit cards" },
      { id: "prior_orders", label: "Any existing agreements",            detail: "Separation agreements, prior court orders" },
    ],
    showRiskCard: false,
  },
  other: {
    label: "Active Court Case",
    summary: "You have an ongoing case. Focus on your next court date, outstanding deadlines, and documents required to file or exchange.",
    urgency: "MEDIUM" as const,
    urgencyColor: "#92400e",
    urgencyBg: "#fffbeb",
    urgencyBgDark: "#1a1000",
    deadline: { label: "Check your most recent court order", sub: "Next date and deadlines are in the endorsement" },
    consequence: "Missing deadlines can result in your motion being dismissed or evidence excluded.",
    nextAction: { label: "Find your next court date", detail: "Check your most recent endorsement or court order for the next scheduled date.", route: "/(tabs)/timeline" as const },
    checklist: [
      { id: "intake",          label: "Complete intake",                  detail: "Tell us your situation",                             locked: false, route: null },
      { id: "next_date",       label: "Find your next court date",        detail: "From your most recent endorsement or order",         locked: false, route: "/(tabs)/timeline" as const },
      { id: "disclosure",      label: "Review your disclosure obligations",detail: "What you must exchange with the other party",        locked: false, route: "/(tabs)/assistant" as const },
      { id: "gather_docs",     label: "Gather updated documents",         detail: "Financial statements, communications, orders",       locked: false, route: null },
      { id: "prep_materials",  label: "Prepare your court materials",     detail: "Brief, affidavit, or financial statement",           locked: false, route: "/(tabs)/assistant" as const },
      { id: "track_deadlines", label: "Track all deadlines",              detail: "From your most recent court order",                  locked: false, route: "/(tabs)/timeline" as const },
      { id: "draft_form",      label: "Draft your next court form",       detail: "AI-generated draft based on your facts",             locked: true,  route: "/(tabs)/draft" as const,     formId: "Form 14B (Motion)" },
      { id: "affidavit",       label: "Build your affidavit",             detail: "Structured narrative from your facts",               locked: true,  route: "/(tabs)/affidavit" as const },
    ],
    gather: [
      { id: "all_orders",     label: "All court orders and endorsements", detail: "Every order made so far in your case" },
      { id: "upcoming_dates", label: "Upcoming court dates",              detail: "From your most recent order or notice" },
      { id: "financials",     label: "Updated financial statements",      detail: "Income, expenses, assets, debts" },
      { id: "communications", label: "Recent messages with other party",  detail: "Any relevant communications" },
      { id: "all_filed",      label: "All documents filed or received",   detail: "Everything served in the case" },
      { id: "notes",          label: "Notes from court appearances",      detail: "What was said, ordered, and who attended" },
    ],
    showRiskCard: false,
  },
};

type Tab = "overview" | "checklist" | "support";

// ─── Tab: Overview ────────────────────────────────────────────────────────────

type DocAnalysis = {
  documentType: string;
  deadline: string;
  confidence: string;
  summary: string;
  nextSteps: string[];
};

function OverviewTab({ role, data }: { role: string; data: typeof ROLE_DATA.served }) {
  const colors = useColors();
  const isDark = useColorScheme() === "dark";
  const urgBg = isDark ? data.urgencyBgDark : data.urgencyBg;
  const { caseIssues, caseParties, setCaseParties } = useApp();
  const [editingParties, setEditingParties] = useState(false);
  const [draftRespondent, setDraftRespondent] = useState(caseParties?.respondentName ?? "");
  const [draftCity, setDraftCity] = useState(caseParties?.respondentCity ?? "");
  const [draftChildren, setDraftChildren] = useState<Array<{ id: string; name: string; birthYear: string }>>(
    (caseParties?.children ?? []).map((c) => ({ id: c.id, name: c.name, birthYear: c.birthYear }))
  );

  const [showAnalyze, setShowAnalyze] = useState(false);
  const [docText, setDocText] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<DocAnalysis | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  const ISSUE_LABELS: Record<string, string> = {
    custody: "Parenting & custody",
    support: "Support",
    property: "Property",
    protection: "Protection order",
  };

  const confidenceColor = (c: string) =>
    c === "high" ? "#16a34a" : c === "medium" ? "#d97706" : "#dc2626";

  const handleAnalyze = async () => {
    if (!docText.trim()) return;
    setAnalyzing(true);
    try {
      const res = await fetch(`${BASE_URL}/api/family-law/analyze-document`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentText: docText, userRole: role }),
      });
      const json: DocAnalysis = await res.json();
      setAnalysis(json);
    } catch {
      setAnalysis(null);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    setUploadedFileName(file.name);
    setDocText("");
    setAnalysis(null);
    setAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      if (role) formData.append("userRole", role);
      const res = await fetch(`${BASE_URL}/api/family-law/upload-document`, {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (json.error) {
        setAnalysis({ documentType: "Error", deadline: "", confidence: "low", summary: json.error, nextSteps: [] });
      } else {
        setAnalysis(json as DocAnalysis);
      }
    } catch (err) {
      setAnalysis({ documentType: "Upload failed", deadline: "", confidence: "low", summary: "Could not upload the file. Please check your connection and try again.", nextSteps: [] });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleNativeFileUpload = async (asset: DocumentPicker.DocumentPickerAsset) => {
    setUploadedFileName(asset.name);
    setDocText("");
    setAnalysis(null);
    setAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append("file", {
        uri: asset.uri,
        name: asset.name,
        type: asset.mimeType || "application/pdf",
      } as any);
      if (role) formData.append("userRole", role);
      const res = await fetch(`${BASE_URL}/api/family-law/upload-document`, {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (json.error) {
        setAnalysis({ documentType: "Error", deadline: "", confidence: "low", summary: json.error, nextSteps: [] });
      } else {
        setAnalysis(json as DocAnalysis);
      }
    } catch {
      setAnalysis({ documentType: "Upload failed", deadline: "", confidence: "low", summary: "Could not upload the file. Please check your connection and try again.", nextSteps: [] });
    } finally {
      setAnalyzing(false);
    }
  };

  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "text/plain", "text/*"],
        copyToCacheDirectory: true,
      });
      if (result.canceled || !result.assets?.[0]) return;
      const asset = result.assets[0];
      if (Platform.OS === "web" && asset.file) {
        await handleFileUpload(asset.file as File);
      } else {
        await handleNativeFileUpload(asset);
      }
    } catch {
      setAnalysis({ documentType: "Error", deadline: "", confidence: "low", summary: "Could not open the file picker. Please paste your document text instead.", nextSteps: [] });
    }
  };

  const resetAnalyze = () => {
    setAnalysis(null);
    setDocText("");
    setUploadedFileName(null);
  };

  return (
    <View style={tab.container}>

      {/* Document Analysis Card */}
      <View style={[tab.analyzeCard, { backgroundColor: colors.surfaceContainerLow }]}>
        <Pressable
          style={tab.analyzeHeader}
          onPress={() => { setShowAnalyze(!showAnalyze); resetAnalyze(); }}
        >
          <View style={[tab.analyzeIconWrap, { backgroundColor: colors.primary + "12" }]}>
            <Ionicons name="search-outline" size={18} color={colors.primary} />
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={[tab.analyzeTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
              Analyze a court document
            </Text>
            <Text style={[tab.analyzeDesc, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              Upload a file or paste text to identify the form and what's due
            </Text>
          </View>
          <Ionicons
            name={showAnalyze ? "chevron-up" : "chevron-down"}
            size={16}
            color={colors.outline}
          />
        </Pressable>

        {showAnalyze && !analysis && (
          <View style={{ gap: 12, paddingTop: 4 }}>
            {/* Upload file button */}
            <Pressable
              style={({ pressed }) => [tab.uploadBtn, {
                backgroundColor: colors.surfaceContainerHigh,
                borderColor: colors.outlineVariant,
                opacity: pressed ? 0.85 : 1,
              }]}
              onPress={pickFile}
              disabled={analyzing}
            >
              {analyzing && uploadedFileName ? (
                <>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <View style={{ flex: 1 }}>
                    <Text style={[tab.uploadBtnText, { color: colors.primary, fontFamily: "Manrope_700Bold" }]}>
                      Analyzing…
                    </Text>
                    <Text style={[tab.analyzeHint, { color: colors.mutedForeground, textAlign: "left", fontFamily: "Inter_400Regular" }]}>
                      {uploadedFileName}
                    </Text>
                  </View>
                </>
              ) : (
                <>
                  <Ionicons name="cloud-upload-outline" size={20} color={colors.primary} />
                  <View style={{ flex: 1 }}>
                    <Text style={[tab.uploadBtnText, { color: colors.foreground, fontFamily: "Manrope_700Bold" }]}>
                      Upload a file
                    </Text>
                    <Text style={[tab.analyzeHint, { color: colors.mutedForeground, textAlign: "left", fontFamily: "Inter_400Regular" }]}>
                      PDF or text file — analyzed automatically
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={colors.outline} />
                </>
              )}
            </Pressable>

            {/* OR divider */}
            <View style={tab.orDivider}>
              <View style={[tab.orLine, { backgroundColor: colors.outlineVariant }]} />
              <Text style={[tab.orText, { color: colors.outline, fontFamily: "Inter_400Regular" }]}>or paste text</Text>
              <View style={[tab.orLine, { backgroundColor: colors.outlineVariant }]} />
            </View>

            <TextInput
              style={[tab.analyzeInput, {
                backgroundColor: isDark ? colors.surfaceContainerHigh : "#fff",
                borderColor: colors.outlineVariant,
                color: colors.foreground,
              }]}
              multiline
              numberOfLines={5}
              placeholder="Paste key text from your court document here — first page, header, or any paragraph that describes the form or order..."
              placeholderTextColor={colors.outline}
              value={docText}
              onChangeText={setDocText}
              textAlignVertical="top"
              editable={!analyzing}
            />
            <Pressable
              style={({ pressed }) => [tab.analyzeBtn, {
                backgroundColor: docText.trim().length >= 20 ? colors.primary : colors.surfaceContainerHigh,
                opacity: pressed ? 0.88 : 1,
              }]}
              onPress={handleAnalyze}
              disabled={docText.trim().length < 20 || analyzing}
            >
              {analyzing && !uploadedFileName ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Ionicons name="sparkles" size={15} color={docText.trim().length >= 20 ? "#fff" : colors.outline} />
                  <Text style={[tab.analyzeBtnText, {
                    color: docText.trim().length >= 20 ? "#fff" : colors.outline,
                    fontFamily: "Manrope_700Bold",
                  }]}>
                    Analyze document
                  </Text>
                </>
              )}
            </Pressable>
            <Text style={[tab.analyzeHint, { color: colors.outline, fontFamily: "Inter_400Regular" }]}>
              Free · AI-powered · No account needed
            </Text>
          </View>
        )}

        {analysis && (
          <View style={{ gap: 10, paddingTop: 4 }}>
            <View style={[tab.aiResultBanner, { backgroundColor: colors.primary + "10" }]}>
              <Ionicons name="sparkles" size={12} color={colors.primary} />
              <Text style={[tab.aiResultBannerText, { color: colors.primary, fontFamily: "Manrope_700Bold" }]}>
                We analyzed your document
              </Text>
            </View>
            <View style={tab.row}>
              <View style={[tab.docTypePill, { backgroundColor: colors.primary }]}>
                <Text style={[tab.docTypePillText, { fontFamily: "Manrope_700Bold" }]}>
                  {analysis.documentType}
                </Text>
              </View>
              <View style={[tab.confidencePill, { backgroundColor: confidenceColor(analysis.confidence) + "18" }]}>
                <View style={[tab.confidenceDot, { backgroundColor: confidenceColor(analysis.confidence) }]} />
                <Text style={[tab.confidencePillText, { color: confidenceColor(analysis.confidence), fontFamily: "Manrope_600SemiBold" }]}>
                  {analysis.confidence} confidence
                </Text>
              </View>
            </View>
            {analysis.deadline && analysis.deadline !== "No deadline detected" && (
              <View style={[tab.deadlinePill, { backgroundColor: "#fef2f2" }]}>
                <Ionicons name="alarm-outline" size={13} color="#dc2626" />
                <Text style={[tab.deadlinePillText, { fontFamily: "Manrope_600SemiBold", color: "#9b1c1c" }]}>
                  {analysis.deadline}
                </Text>
              </View>
            )}
            <Text style={[tab.analyzeDesc, { color: colors.foreground, fontFamily: "Inter_400Regular", lineHeight: 20 }]}>
              {analysis.summary}
            </Text>
            {analysis.nextSteps?.length > 0 && (
              <View style={{ gap: 6 }}>
                {analysis.nextSteps.map((step, i) => (
                  <View key={i} style={tab.nextStepRow}>
                    <View style={[tab.nextStepNum, { backgroundColor: colors.primary }]}>
                      <Text style={[tab.nextStepNumText, { fontFamily: "Manrope_700Bold" }]}>{i + 1}</Text>
                    </View>
                    <Text style={[tab.analyzeDesc, { color: colors.foreground, fontFamily: "Inter_400Regular", flex: 1 }]}>
                      {step}
                    </Text>
                  </View>
                ))}
              </View>
            )}
            <Pressable onPress={resetAnalyze} style={tab.expandRow}>
              <Text style={[tab.expandText, { color: colors.mutedForeground, fontFamily: "Manrope_600SemiBold" }]}>
                Analyze another document
              </Text>
              <Ionicons name="refresh-outline" size={13} color={colors.mutedForeground} />
            </Pressable>
          </View>
        )}
      </View>

      {/* Deadline — most important, first */}
      <View style={{ gap: 8 }}>
        <View style={tab.row}>
          <Text style={[tab.smLabel, { color: colors.mutedForeground, fontFamily: "Manrope_600SemiBold", flex: 1 }]}>
            DEADLINE
          </Text>
          <View style={[tab.badge, { backgroundColor: data.urgencyColor }]}>
            <Text style={[tab.badgeText, { fontFamily: "Manrope_700Bold" }]}>{data.urgency}</Text>
          </View>
        </View>
        <View style={[tab.deadlineCard, { backgroundColor: colors.surfaceContainerLow }]}>
          <Text style={[tab.deadlineTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
            {data.deadline.label}
          </Text>
          <View style={[tab.deadlinePill, { backgroundColor: data.urgencyColor + "16" }]}>
            <Ionicons name="alarm-outline" size={12} color={data.urgencyColor} />
            <Text style={[tab.deadlinePillText, { color: data.urgencyColor, fontFamily: "Manrope_600SemiBold" }]}>
              {data.deadline.sub}
            </Text>
          </View>
          <Pressable
            style={({ pressed }) => [tab.deadlineBtn, { backgroundColor: colors.primary, opacity: pressed ? 0.88 : 1 }]}
            onPress={() => router.push("/(tabs)/timeline")}
          >
            <Text style={[tab.deadlineBtnText, { fontFamily: "Manrope_600SemiBold" }]}>Manage in Timeline →</Text>
          </Pressable>
        </View>
      </View>

      {/* Next best action — second */}
      <Pressable
        style={({ pressed }) => [tab.nextCard, { backgroundColor: colors.primary, opacity: pressed ? 0.92 : 1 }]}
        onPress={() => data.nextAction.route && router.push(data.nextAction.route)}
      >
        <View style={[tab.nextBadge, { backgroundColor: "rgba(255,255,255,0.1)" }]}>
          <Text style={[tab.nextBadgeText, { fontFamily: "Manrope_700Bold" }]}>NEXT ACTION</Text>
        </View>
        <Text style={[tab.nextTitle, { fontFamily: "Newsreader_500Medium" }]}>
          {data.nextAction.label}
        </Text>
        <Text style={[tab.nextDetail, { fontFamily: "Inter_400Regular" }]}>
          {data.nextAction.detail}
        </Text>
        <Text style={[tab.nextGo, { fontFamily: "Manrope_600SemiBold" }]}>Go →</Text>
      </Pressable>

      {/* Situation summary — context third */}
      <View style={[tab.summaryCard, { backgroundColor: colors.surfaceContainerLow }]}>
        <View style={[tab.summaryAccent, { backgroundColor: data.urgencyColor }]} />
        <View style={{ flex: 1, paddingLeft: 14, gap: 8 }}>
          <View style={tab.row}>
            <Text style={[tab.smLabel, { color: colors.mutedForeground, fontFamily: "Manrope_600SemiBold", flex: 1, marginBottom: 0 }]}>
              YOUR SITUATION
            </Text>
            <View style={[tab.aiLabel, { backgroundColor: colors.primary + "10" }]}>
              <Ionicons name="sparkles" size={10} color={colors.primary} />
              <Text style={[tab.aiLabelText, { color: colors.primary, fontFamily: "Manrope_700Bold" }]}>AI-ASSISTED</Text>
            </View>
          </View>
          <Text style={[tab.summaryText, { color: colors.foreground, fontFamily: "Newsreader_500Medium" }]}>
            {data.summary}
          </Text>
          {caseIssues && caseIssues.length > 0 && (
            <View style={[tab.row, { flexWrap: "wrap", gap: 6 }]}>
              {caseIssues.map((issue) => (
                <View key={issue} style={[tab.issuePill, { backgroundColor: colors.surfaceContainerHigh }]}>
                  <Text style={[tab.issuePillText, { color: colors.mutedForeground, fontFamily: "Manrope_600SemiBold" }]}>
                    {ISSUE_LABELS[issue] ?? issue}
                  </Text>
                </View>
              ))}
            </View>
          )}
          <Text style={[tab.aiGenNote, { color: colors.outline, fontFamily: "Inter_400Regular" }]}>
            Generated from your answers
          </Text>
        </View>
      </View>

      {/* ── Party Info Card ── */}
      <View style={[tab.partyCard, { backgroundColor: colors.surfaceContainerLow, borderColor: colors.outlineVariant }]}>
        <View style={tab.partyCardHeader}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Ionicons name="people-outline" size={16} color={colors.primary} />
            <Text style={[tab.partyCardTitle, { color: colors.foreground, fontFamily: "Manrope_700Bold" }]}>
              Case Parties
            </Text>
          </View>
          <Pressable onPress={() => {
            setDraftRespondent(caseParties?.respondentName ?? "");
            setDraftCity(caseParties?.respondentCity ?? "");
            setDraftChildren((caseParties?.children ?? []).map((c) => ({ id: c.id, name: c.name, birthYear: c.birthYear })));
            setEditingParties(true);
          }}>
            <Text style={[{ fontSize: 12, color: colors.primary, fontFamily: "Inter_600SemiBold" }]}>
              {caseParties?.respondentName || caseParties?.children?.length ? "Edit" : "Add info"}
            </Text>
          </Pressable>
        </View>

        {!editingParties ? (
          <View style={{ gap: 10 }}>
            <View style={tab.partyRow}>
              <Text style={[tab.partyLabel, { color: colors.mutedForeground, fontFamily: "Manrope_600SemiBold" }]}>
                RESPONDENT
              </Text>
              <Text style={[tab.partyValue, { color: caseParties?.respondentName ? colors.foreground : colors.outline, fontFamily: "Inter_400Regular" }]}>
                {caseParties?.respondentName
                  ? `${caseParties.respondentName}${caseParties.respondentCity ? `, ${caseParties.respondentCity}` : ""}`
                  : "Not added yet — tap Edit"}
              </Text>
            </View>
            <View style={[tab.partyDivider, { backgroundColor: colors.outlineVariant }]} />
            <View style={tab.partyRow}>
              <Text style={[tab.partyLabel, { color: colors.mutedForeground, fontFamily: "Manrope_600SemiBold" }]}>
                CHILDREN
              </Text>
              {caseParties?.children?.length ? (
                <View style={{ gap: 3 }}>
                  {caseParties.children.map((ch) => (
                    <Text key={ch.id} style={[tab.partyValue, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}>
                      {ch.name}{ch.birthYear ? ` (b. ${ch.birthYear})` : ""}
                    </Text>
                  ))}
                </View>
              ) : (
                <Text style={[tab.partyValue, { color: colors.outline, fontFamily: "Inter_400Regular" }]}>
                  None added
                </Text>
              )}
            </View>
          </View>
        ) : (
          <View style={{ gap: 12 }}>
            <View style={[tab.partyField, { borderColor: colors.outlineVariant, backgroundColor: colors.surfaceContainerLowest }]}>
              <Text style={[tab.partyLabel, { color: colors.mutedForeground, fontFamily: "Manrope_600SemiBold" }]}>
                RESPONDENT NAME
              </Text>
              <TextInput
                style={[{ fontSize: 14, color: colors.foreground, fontFamily: "Inter_400Regular", paddingVertical: 4 }]}
                placeholder="e.g. Alex Smith"
                placeholderTextColor={colors.outline}
                value={draftRespondent}
                onChangeText={setDraftRespondent}
                autoCapitalize="words"
              />
            </View>
            <View style={[tab.partyField, { borderColor: colors.outlineVariant, backgroundColor: colors.surfaceContainerLowest }]}>
              <Text style={[tab.partyLabel, { color: colors.mutedForeground, fontFamily: "Manrope_600SemiBold" }]}>
                THEIR CITY (OPTIONAL)
              </Text>
              <TextInput
                style={[{ fontSize: 14, color: colors.foreground, fontFamily: "Inter_400Regular", paddingVertical: 4 }]}
                placeholder="e.g. Toronto"
                placeholderTextColor={colors.outline}
                value={draftCity}
                onChangeText={setDraftCity}
                autoCapitalize="words"
              />
            </View>

            <Text style={[tab.partyLabel, { color: colors.mutedForeground, fontFamily: "Manrope_600SemiBold", marginBottom: -4 }]}>
              CHILDREN
            </Text>
            {draftChildren.map((ch, i) => (
              <View key={ch.id} style={[tab.partyField, { borderColor: colors.outlineVariant, backgroundColor: colors.surfaceContainerLowest, gap: 8 }]}>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                  <Text style={[tab.partyLabel, { color: colors.mutedForeground, fontFamily: "Manrope_600SemiBold" }]}>
                    CHILD {i + 1}
                  </Text>
                  <Pressable onPress={() => setDraftChildren((prev) => prev.filter((c) => c.id !== ch.id))}>
                    <Ionicons name="close-circle-outline" size={16} color={colors.outline} />
                  </Pressable>
                </View>
                <TextInput
                  style={{ fontSize: 14, color: colors.foreground, fontFamily: "Inter_400Regular", paddingVertical: 2 }}
                  placeholder="Full name"
                  placeholderTextColor={colors.outline}
                  value={ch.name}
                  onChangeText={(v) => setDraftChildren((prev) => prev.map((c) => c.id === ch.id ? { ...c, name: v } : c))}
                  autoCapitalize="words"
                />
                <TextInput
                  style={{ fontSize: 14, color: colors.foreground, fontFamily: "Inter_400Regular", paddingVertical: 2 }}
                  placeholder="Birth year (optional)"
                  placeholderTextColor={colors.outline}
                  value={ch.birthYear}
                  onChangeText={(v) => setDraftChildren((prev) => prev.map((c) => c.id === ch.id ? { ...c, birthYear: v } : c))}
                  keyboardType="number-pad"
                  maxLength={4}
                />
              </View>
            ))}

            <Pressable
              style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
              onPress={() => setDraftChildren((prev) => [...prev, { id: Date.now().toString(), name: "", birthYear: "" }])}
            >
              <Ionicons name="add-circle-outline" size={16} color={colors.primary} />
              <Text style={{ fontSize: 13, color: colors.primary, fontFamily: "Inter_600SemiBold" }}>
                Add a child
              </Text>
            </Pressable>

            <View style={{ flexDirection: "row", gap: 10, marginTop: 4 }}>
              <Pressable
                style={[tab.partyBtn, { backgroundColor: colors.surfaceContainerHigh, flex: 1 }]}
                onPress={() => setEditingParties(false)}
              >
                <Text style={{ fontSize: 13, color: colors.mutedForeground, fontFamily: "Inter_600SemiBold", textAlign: "center" }}>
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                style={[tab.partyBtn, { backgroundColor: colors.primary, flex: 2 }]}
                onPress={() => {
                  setCaseParties({
                    respondentName: draftRespondent.trim(),
                    respondentCity: draftCity.trim(),
                    children: draftChildren.filter((c) => c.name.trim()).map((c) => ({ id: c.id, name: c.name.trim(), birthYear: c.birthYear.trim() })),
                  });
                  setEditingParties(false);
                }}
              >
                <Text style={{ fontSize: 13, color: "#fff", fontFamily: "Inter_600SemiBold", textAlign: "center" }}>
                  Save changes
                </Text>
              </Pressable>
            </View>
          </View>
        )}
      </View>

      {/* Consequence — smallest, last */}
      <View style={[tab.consequenceCard, { backgroundColor: urgBg }]}>
        <Ionicons name="warning-outline" size={13} color={data.urgencyColor} style={{ marginTop: 1 }} />
        <Text style={[tab.consequenceText, {
          color: isDark ? "rgba(255,255,255,0.65)" : data.urgencyColor + "bb",
          fontFamily: "Inter_400Regular",
        }]}>{data.consequence}</Text>
      </View>
    </View>
  );
}

// ─── Paywall Modal ─────────────────────────────────────────────────────────────

type ChecklistItem = { id: string; label: string; detail: string; locked: boolean; route: string | null; formId?: string };

function DraftingPaywallModal({
  item,
  onDismiss,
}: {
  item: ChecklistItem | null;
  onDismiss: () => void;
}) {
  const colors = useColors();
  if (!item) return null;
  return (
    <Modal visible transparent animationType="slide" onRequestClose={onDismiss}>
      <Pressable style={pw.backdrop} onPress={onDismiss}>
        <Pressable style={[pw.sheet, { backgroundColor: colors.surface }]} onPress={() => {}}>
          {/* Handle bar */}
          <View style={[pw.handle, { backgroundColor: colors.outlineVariant }]} />

          {/* Lock badge */}
          <View style={[pw.lockBadge, { backgroundColor: colors.primary + "12" }]}>
            <Ionicons name="lock-closed" size={18} color={colors.primary} />
          </View>

          <Text style={[pw.title, { color: colors.foreground, fontFamily: "Newsreader_600SemiBold" }]}>
            {item.label}
          </Text>
          <Text style={[pw.subtitle, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            {item.detail}
          </Text>

          <View style={[pw.featureList, { backgroundColor: colors.surfaceContainerLow, borderColor: colors.outlineVariant }]}>
            {[
              "AI-drafted court forms tailored to your facts",
              "Affidavit chronology builder",
              "Complete filing package",
              "Communication Coach",
            ].map((f) => (
              <View key={f} style={pw.featureRow}>
                <Ionicons name="checkmark-circle" size={15} color={colors.primary} />
                <Text style={[pw.featureText, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}>{f}</Text>
              </View>
            ))}
          </View>

          <Pressable
            style={({ pressed }) => [pw.unlockBtn, { backgroundColor: colors.primary, opacity: pressed ? 0.88 : 1 }]}
            onPress={() => {
              onDismiss();
              router.push("/paywall?tier=drafting_help");
            }}
          >
            <Ionicons name="lock-open-outline" size={16} color="#fff" />
            <Text style={[pw.unlockBtnText, { fontFamily: "Manrope_700Bold" }]}>
              Unlock Drafting Help
            </Text>
          </Pressable>

          <Pressable style={pw.dismissBtn} onPress={onDismiss}>
            <Text style={[pw.dismissText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              Not now
            </Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── Tab: Checklist ───────────────────────────────────────────────────────────

const VISIBLE_STEPS = 3;

function ChecklistTab({ data }: { data: typeof ROLE_DATA.served }) {
  const colors = useColors();
  const { hasDraftingHelp } = useSubscription();
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [gathered, setGathered] = useState<Record<string, boolean>>({});
  const [showAll, setShowAll] = useState(false);
  const [paywallItem, setPaywallItem] = useState<ChecklistItem | null>(null);

  const toggle = (id: string) => setChecked((p) => ({ ...p, [id]: !p[id] }));
  const toggleGather = (id: string) => setGathered((p) => ({ ...p, [id]: !p[id] }));

  const handleLockedPress = (item: ChecklistItem) => {
    if (hasDraftingHelp) {
      toggle(item.id);
      if (item.formId) {
        router.push({ pathname: "/(tabs)/draft", params: { formId: item.formId } } as any);
      } else if (item.route) {
        router.push(item.route as any);
      }
    } else {
      setPaywallItem(item);
    }
  };

  const items = data.checklist.map((item) => ({
    ...item,
    done: item.id === "intake" ? true : !!checked[item.id],
  }));
  const done = items.filter((i) => i.done).length;
  const pct = Math.round((done / items.length) * 100);
  const freeItems = items.filter((i) => !i.locked);
  const lockedItems = items.filter((i) => i.locked);
  const visibleFree = showAll ? freeItems : freeItems.slice(0, VISIBLE_STEPS);
  const hiddenCount = freeItems.length - VISIBLE_STEPS;
  const gatherDone = data.gather.filter((i) => gathered[i.id]).length;

  return (
    <View style={tab.container}>
      {/* Paywall modal */}
      <DraftingPaywallModal item={paywallItem} onDismiss={() => setPaywallItem(null)} />

      {/* Progress */}
      <View style={[tab.progressCard, { backgroundColor: colors.surfaceContainerLow }]}>
        <View style={tab.row}>
          <Text style={[tab.progressNum, { color: colors.foreground, fontFamily: "Newsreader_500Medium" }]}>
            {pct}%
          </Text>
          <Text style={[tab.progressLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            {done} of {items.length} steps complete
          </Text>
        </View>
        <View style={[tab.progressTrack, { backgroundColor: colors.surfaceContainerHighest }]}>
          <View style={[tab.progressFill, {
            width: `${pct}%` as any,
            backgroundColor: pct === 100 ? "#16a34a" : colors.tertiary,
          }]} />
        </View>
      </View>

      {/* AI-SUGGESTED NEXT STEPS label */}
      <View style={[tab.row, { marginBottom: -8 }]}>
        <Ionicons name="sparkles" size={11} color={colors.primary} />
        <Text style={[tab.smLabel, { color: colors.primary, fontFamily: "Manrope_700Bold", marginBottom: 0 }]}>
          AI-SUGGESTED NEXT STEPS
        </Text>
      </View>

      {/* Free checklist steps — checkbox separated from navigation */}
      <View style={[tab.listCard, { backgroundColor: colors.surfaceContainerLow }]}>
        {visibleFree.map((item, i) => (
          <View
            key={item.id}
            style={[tab.checkRow, i < visibleFree.length - 1 && tab.checkRowBorder, i < visibleFree.length - 1 && { borderBottomColor: colors.surfaceContainerHigh }]}
          >
            {/* Checkbox — mark done only */}
            <Pressable
              hitSlop={{ top: 10, bottom: 10, left: 6, right: 10 }}
              onPress={() => { if (item.id !== "intake") toggle(item.id); }}
              style={[tab.checkbox, {
                backgroundColor: item.done ? colors.primary : "transparent",
                borderColor: item.done ? colors.primary : colors.outlineVariant,
              }]}
            >
              {item.done && <Ionicons name="checkmark" size={12} color="#fff" />}
            </Pressable>

            {/* Label + detail — navigate on press */}
            <Pressable
              style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 0 }}
              onPress={() => { if (item.route) router.push(item.route as any); }}
            >
              <View style={{ flex: 1 }}>
                <Text style={[tab.checkLabel, {
                  color: item.done ? colors.mutedForeground : colors.foreground,
                  textDecorationLine: item.done ? "line-through" : "none",
                  fontFamily: item.done ? "Inter_400Regular" : "Inter_600SemiBold",
                }]}>{item.label}</Text>
                <Text style={[tab.checkDetail, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                  {item.detail}
                </Text>
              </View>
              {item.route && !item.done && (
                <Ionicons name="chevron-forward" size={14} color={colors.outline} />
              )}
            </Pressable>
          </View>
        ))}
      </View>

      {/* Expand / collapse */}
      {!showAll && hiddenCount > 0 && (
        <Pressable onPress={() => setShowAll(true)} style={tab.expandRow}>
          <Text style={[tab.expandText, { color: colors.primary, fontFamily: "Manrope_600SemiBold" }]}>
            View full checklist ({hiddenCount} more)
          </Text>
          <Ionicons name="chevron-down" size={14} color={colors.primary} />
        </Pressable>
      )}
      {showAll && (
        <Pressable onPress={() => setShowAll(false)} style={tab.expandRow}>
          <Text style={[tab.expandText, { color: colors.mutedForeground, fontFamily: "Manrope_600SemiBold" }]}>
            Show less
          </Text>
          <Ionicons name="chevron-up" size={14} color={colors.mutedForeground} />
        </Pressable>
      )}

      {/* Premium (locked) checklist items — always shown, gated on tap */}
      <View style={{ gap: 8 }}>
        <View style={[tab.row, { marginBottom: -4 }]}>
          <Ionicons name="sparkles" size={11} color={colors.tertiary} />
          <Text style={[tab.smLabel, { color: colors.tertiary, fontFamily: "Manrope_700Bold", marginBottom: 0 }]}>
            DRAFTING HELP STEPS
          </Text>
        </View>
        <View style={[tab.listCard, { backgroundColor: colors.surfaceContainerLow }]}>
          {lockedItems.map((item, i) => (
            <Pressable
              key={item.id}
              style={({ pressed }) => [
                tab.checkRow,
                i < lockedItems.length - 1 && tab.checkRowBorder,
                i < lockedItems.length - 1 && { borderBottomColor: colors.surfaceContainerHigh },
                { opacity: pressed ? 0.8 : 1 },
              ]}
              onPress={() => handleLockedPress(item)}
            >
              {/* Lock / check indicator */}
              {hasDraftingHelp ? (
                <View style={[tab.checkbox, {
                  backgroundColor: !!checked[item.id] ? colors.primary : "transparent",
                  borderColor: !!checked[item.id] ? colors.primary : colors.outlineVariant,
                }]}>
                  {!!checked[item.id] && <Ionicons name="checkmark" size={12} color="#fff" />}
                </View>
              ) : (
                <View style={[tab.lockDot, { backgroundColor: colors.tertiary + "18", borderColor: colors.tertiary + "40" }]}>
                  <Ionicons name="lock-closed" size={11} color={colors.tertiary} />
                </View>
              )}

              <View style={{ flex: 1 }}>
                <Text style={[tab.checkLabel, {
                  color: hasDraftingHelp && !!checked[item.id] ? colors.mutedForeground : colors.foreground,
                  textDecorationLine: hasDraftingHelp && !!checked[item.id] ? "line-through" : "none",
                  fontFamily: hasDraftingHelp && !!checked[item.id] ? "Inter_400Regular" : "Inter_600SemiBold",
                }]}>{item.label}</Text>
                <Text style={[tab.checkDetail, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                  {item.detail}
                </Text>
              </View>
              <Ionicons
                name={hasDraftingHelp ? "chevron-forward" : "lock-closed-outline"}
                size={14}
                color={hasDraftingHelp ? colors.outline : colors.tertiary}
              />
            </Pressable>
          ))}
        </View>
        {!hasDraftingHelp && (
          <Pressable
            style={({ pressed }) => [tab.unlockHint, { backgroundColor: colors.tertiary + "0d", borderColor: colors.tertiary + "30", opacity: pressed ? 0.88 : 1 }]}
            onPress={() => router.push("/paywall?tier=drafting_help")}
          >
            <Ionicons name="lock-open-outline" size={13} color={colors.tertiary} />
            <Text style={[tab.unlockHintText, { color: colors.tertiary, fontFamily: "Manrope_600SemiBold" }]}>
              Unlock with Drafting Help
            </Text>
          </Pressable>
        )}
      </View>

      {/* Documents to gather */}
      <View style={{ gap: 10 }}>
        <View style={tab.row}>
          <Text style={[tab.smLabel, { color: colors.mutedForeground, fontFamily: "Manrope_700Bold", flex: 1 }]}>
            DOCUMENTS TO GATHER
          </Text>
          <Text style={[tab.smLabel, { color: colors.mutedForeground, fontFamily: "Manrope_600SemiBold" }]}>
            {gatherDone}/{data.gather.length}
          </Text>
        </View>
        <View style={[tab.listCard, { backgroundColor: colors.surfaceContainerLow }]}>
          {data.gather.map((item, i) => {
            const done = !!gathered[item.id];
            return (
              <Pressable
                key={item.id}
                style={[tab.checkRow, i < data.gather.length - 1 && tab.checkRowBorder, i < data.gather.length - 1 && { borderBottomColor: colors.surfaceContainerHigh }]}
                onPress={() => toggleGather(item.id)}
              >
                <View style={[tab.checkbox, {
                  backgroundColor: done ? "#16a34a" : "transparent",
                  borderColor: done ? "#16a34a" : colors.outlineVariant,
                  borderRadius: 6,
                }]}>
                  {done && <Ionicons name="checkmark" size={12} color="#fff" />}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[tab.checkLabel, {
                    color: done ? colors.mutedForeground : colors.foreground,
                    textDecorationLine: done ? "line-through" : "none",
                    fontFamily: done ? "Inter_400Regular" : "Inter_600SemiBold",
                  }]}>{item.label}</Text>
                  <Text style={[tab.checkDetail, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                    {item.detail}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

// ─── Tab: Support ─────────────────────────────────────────────────────────────

function SupportTab({ role, data }: { role: string; data: typeof ROLE_DATA.served }) {
  const colors = useColors();
  const isDark = useColorScheme() === "dark";
  const { isSubscribed } = useSubscription();
  const [showSafety, setShowSafety] = useState(false);

  const resources = [
    { icon: "people-outline" as const, label: "Duty Counsel", detail: "Free legal advice at your courthouse — no appointment needed, available on court days.", color: "#1e40af" },
    { icon: "call-outline" as const, label: "Legal Aid Ontario", detail: "1-800-668-8258 · legalaid.on.ca — may cover your legal costs if you qualify.", color: "#065f46" },
    { icon: "information-circle-outline" as const, label: "FLIC — Family Law Information Centre", detail: "Available at most Family Court locations. Staff can answer questions and provide referrals.", color: "#1e40af" },
    { icon: "globe-outline" as const, label: "Steps to Justice", detail: "stepstojustice.ca — free, plain-language guides for every stage of family court.", color: "#065f46" },
  ];

  return (
    <View style={tab.container}>

      {/* Legal help */}
      <View style={{ gap: 10 }}>
        <Text style={[tab.smLabel, { color: colors.mutedForeground, fontFamily: "Manrope_700Bold" }]}>LEGAL HELP</Text>
        <View style={[tab.listCard, { backgroundColor: colors.surfaceContainerLow }]}>
          {resources.map((r, i) => (
            <View
              key={r.label}
              style={[tab.resourceRow, i < resources.length - 1 && tab.checkRowBorder, i < resources.length - 1 && { borderBottomColor: colors.surfaceContainerHigh }]}
            >
              <View style={[tab.resourceIcon, { backgroundColor: r.color + "14" }]}>
                <Ionicons name={r.icon} size={18} color={r.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[tab.resourceLabel, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                  {r.label}
                </Text>
                <Text style={[tab.resourceDetail, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                  {r.detail}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Safety — behind a toggle, not always visible */}
      {!showSafety ? (
        <Pressable onPress={() => setShowSafety(true)} style={tab.expandRow}>
          <Ionicons name="shield-outline" size={14} color={colors.outline} />
          <Text style={[tab.expandText, { color: colors.outline, fontFamily: "Manrope_600SemiBold" }]}>
            Show safety resources
          </Text>
        </Pressable>
      ) : (
        <View style={[tab.safetyCard, { backgroundColor: isDark ? "#1c0808" : "#fef2f2", borderLeftColor: "#9b1c1c" }]}>
          <Pressable onPress={() => setShowSafety(false)} style={[tab.row, { justifyContent: "space-between" }]}>
            <View style={tab.row}>
              <Ionicons name="alert-circle" size={15} color="#9b1c1c" />
              <Text style={[tab.safetyTitle, { fontFamily: "Newsreader_600SemiBold" }]}>
                If you feel unsafe
              </Text>
            </View>
            <Ionicons name="chevron-up" size={14} color="#9b1c1c" />
          </Pressable>
          <Text style={[tab.safetyText, { color: isDark ? "rgba(255,255,255,0.7)" : "#450e09", fontFamily: "Inter_400Regular" }]}>
            If you or your children are at risk, help is available.
          </Text>
          <View style={[tab.safetyLink, { backgroundColor: "rgba(155,28,28,0.08)" }]}>
            <Text style={[tab.safetyLinkText, { color: "#9b1c1c", fontFamily: "Inter_600SemiBold" }]}>
              Ontario Victim Support Line — 1-888-579-2888
            </Text>
          </View>
          <View style={[tab.safetyLink, { backgroundColor: "rgba(155,28,28,0.08)" }]}>
            <Text style={[tab.safetyLinkText, { color: "#9b1c1c", fontFamily: "Inter_600SemiBold" }]}>
              Shelter Safe · sheltersafe.ca
            </Text>
          </View>
        </View>
      )}

      {/* Premium — contextual, not a banner */}
      {!isSubscribed && (
        <View style={{ gap: 10 }}>
          <Text style={[tab.smLabel, { color: colors.mutedForeground, fontFamily: "Manrope_700Bold" }]}>CASE PREPARATION</Text>
          <Pressable
            style={({ pressed }) => [tab.premiumCard, { backgroundColor: colors.primary, opacity: pressed ? 0.92 : 1 }]}
            onPress={() => router.push("/paywall")}
          >
            <View style={{ gap: 6 }}>
              <Text style={[tab.premiumTitle, { fontFamily: "Newsreader_500Medium" }]}>
                Prepare your documents.
              </Text>
              <Text style={[tab.premiumSub, { fontFamily: "Inter_400Regular" }]}>
                Draft court forms, build your affidavit, and prepare a complete filing package — the work lawyers usually charge for.
              </Text>
            </View>
            <View style={tab.premiumFeatures}>
              {[
                "Draft Form 10 / 14B / 35.1",
                "Affidavit-ready chronology",
                "Complete filing package",
                "Communication Coach",
              ].map((f, i) => (
                <View key={f} style={[tab.premiumFeatureRow, i === 3 && { opacity: 0.6 }]}>
                  <View style={[tab.premiumDot, { backgroundColor: i < 3 ? colors.tertiary : "rgba(255,255,255,0.3)" }]}>
                    <Ionicons name="checkmark" size={10} color="#fff" />
                  </View>
                  <Text style={[tab.premiumFeatureText, { fontFamily: "Inter_400Regular" }]}>{f}</Text>
                </View>
              ))}
            </View>
            <View style={[tab.premiumCta, { backgroundColor: colors.tertiary }]}>
              <Text style={[tab.premiumCtaText, { fontFamily: "Manrope_700Bold" }]}>Unlock for $60 one-time</Text>
              <Ionicons name="arrow-forward" size={14} color="#fff" />
            </View>
          </Pressable>
        </View>
      )}
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

const TABS: { id: Tab; label: string }[] = [
  { id: "overview",  label: "Overview"  },
  { id: "checklist", label: "Checklist" },
  { id: "support",   label: "Support"   },
];

export default function MyCaseScreen() {
  const colors = useColors();
  const { userRole, hasOnboarded } = useApp();
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const role: keyof typeof ROLE_DATA =
    userRole === "served" ? "served" : userRole === "serving" ? "serving" : "other";
  const data = ROLE_DATA[role];

  if (!hasOnboarded) {
    return (
      <SafeAreaView style={[{ flex: 1, backgroundColor: colors.surface }]} edges={["top"]}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 16 }}>
          <Ionicons name="briefcase-outline" size={40} color={colors.outline} />
          <Text style={{ fontSize: 20, textAlign: "center", color: colors.foreground, fontFamily: "Newsreader_500Medium" }}>
            Complete your intake first
          </Text>
          <Text style={{ fontSize: 14, textAlign: "center", color: colors.mutedForeground, lineHeight: 20, fontFamily: "Inter_400Regular" }}>
            Go to the Home tab to answer three quick questions and build your personal case guide.
          </Text>
          <Pressable
            style={{ backgroundColor: colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 100 }}
            onPress={() => router.push("/(tabs)")}
          >
            <Text style={{ color: "#fff", fontSize: 14, fontFamily: "Manrope_600SemiBold" }}>Go to Home →</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[{ flex: 1, backgroundColor: colors.surface }]} edges={["top"]}>
      {/* ── Fixed header + tab switcher ── */}
      <View style={[mc.header, { backgroundColor: colors.surface }]}>
        <View style={mc.headerTop}>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={[mc.headerLabel, { color: colors.mutedForeground, fontFamily: "Manrope_600SemiBold" }]}>
              MY CASE
            </Text>
            <Text style={[mc.headerTitle, { color: colors.foreground, fontFamily: "Newsreader_500Medium" }]}>
              {data.label}
            </Text>
          </View>
          <Pressable
            style={[mc.askBtn, { backgroundColor: colors.surfaceContainerLow }]}
            onPress={() => router.push("/(tabs)/assistant")}
          >
            <Ionicons name="chatbubble-ellipses-outline" size={16} color={colors.primary} />
            <Text style={[mc.askBtnText, { color: colors.primary, fontFamily: "Manrope_600SemiBold" }]}>Ask</Text>
          </Pressable>
        </View>

        {/* Tab pills */}
        <View style={[mc.tabRow, { backgroundColor: colors.surfaceContainerLow }]}>
          {TABS.map((t) => {
            const active = activeTab === t.id;
            return (
              <Pressable
                key={t.id}
                style={[mc.tabPill, active && { backgroundColor: colors.primary }]}
                onPress={() => setActiveTab(t.id)}
              >
                <Text style={[mc.tabLabel, {
                  color: active ? "#fff" : colors.mutedForeground,
                  fontFamily: active ? "Manrope_700Bold" : "Manrope_500Medium",
                }]}>{t.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* ── Scrollable tab content ── */}
      <ScrollView
        key={activeTab}
        contentContainerStyle={mc.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === "overview"  && <OverviewTab  role={role} data={data} />}
        {activeTab === "checklist" && <ChecklistTab data={data} />}
        {activeTab === "support"   && <SupportTab   role={role} data={data} />}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Shared tab styles ────────────────────────────────────────────────────────

const tab = StyleSheet.create({
  container: { gap: 18 },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  smLabel: { fontSize: 9, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 4 },

  summaryCard: { flexDirection: "row", borderRadius: 20, padding: 16, overflow: "hidden" },
  summaryAccent: { width: 4, borderRadius: 2, flexShrink: 0 },
  summaryText: { fontSize: 14, lineHeight: 22, marginTop: 6 },

  badge: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 20 },
  badgeText: { fontSize: 10, color: "#fff", letterSpacing: 1 },

  deadlineCard: { borderRadius: 18, padding: 16, gap: 8 },
  deadlineTitle: { fontSize: 15 },
  deadlinePill: { flexDirection: "row", alignItems: "center", gap: 5, alignSelf: "flex-start", paddingHorizontal: 9, paddingVertical: 4, borderRadius: 20 },
  deadlinePillText: { fontSize: 12 },
  deadlineBtn: { alignSelf: "flex-start", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 100 },
  deadlineBtnText: { color: "#fff", fontSize: 12 },

  consequenceCard: { flexDirection: "row", alignItems: "flex-start", gap: 8, borderRadius: 14, padding: 14 },
  consequenceText: { flex: 1, fontSize: 13, lineHeight: 19 },

  partyCard: { borderRadius: 20, borderWidth: 1, padding: 18, gap: 14 },
  partyCardHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  partyCardTitle: { fontSize: 14 },
  partyRow: { gap: 3 },
  partyLabel: { fontSize: 9, letterSpacing: 1.2, textTransform: "uppercase" },
  partyValue: { fontSize: 14, lineHeight: 20 },
  partyDivider: { height: 1, borderRadius: 1 },
  partyField: { borderRadius: 14, borderWidth: 1, padding: 12, gap: 4 },
  partyBtn: { borderRadius: 14, paddingVertical: 12, paddingHorizontal: 16 },

  nextCard: { borderRadius: 24, padding: 22, gap: 6 },
  nextBadge: { alignSelf: "flex-start", paddingHorizontal: 9, paddingVertical: 3, borderRadius: 20, marginBottom: 4 },
  nextBadgeText: { fontSize: 9, color: "rgba(255,255,255,0.6)", letterSpacing: 1.4 },
  nextTitle: { fontSize: 22, lineHeight: 28, color: "#fff" },
  nextDetail: { fontSize: 13, lineHeight: 19, color: "rgba(255,255,255,0.65)" },
  nextGo: { fontSize: 13, color: "rgba(255,255,255,0.8)", marginTop: 8 },

  progressCard: { borderRadius: 18, padding: 16, gap: 10 },
  progressNum: { fontSize: 28, lineHeight: 32 },
  progressLabel: { fontSize: 13 },
  progressTrack: { height: 6, borderRadius: 3, overflow: "hidden" },
  progressFill: { height: 6, borderRadius: 3 },

  listCard: { borderRadius: 20, padding: 18 },
  checkRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  checkRowBorder: { paddingBottom: 14, marginBottom: 14, borderBottomWidth: 1 },
  checkbox: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, alignItems: "center", justifyContent: "center", marginTop: 1, flexShrink: 0 },
  checkLabel: { fontSize: 14, lineHeight: 20 },
  checkDetail: { fontSize: 12, lineHeight: 16, marginTop: 2 },

  unlockCard: { borderRadius: 22, padding: 18, gap: 14 },
  lockedRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  lockIcon: { width: 24, height: 24, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  lockedLabel: { fontSize: 13 },
  unlockBadge: { alignSelf: "stretch", paddingVertical: 11, borderRadius: 100, alignItems: "center" },
  unlockBadgeText: { fontSize: 11, letterSpacing: 1.2 },

  expandRow: { flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "center", paddingVertical: 4 },
  expandText: { fontSize: 13 },

  resourceRow: { flexDirection: "row", alignItems: "flex-start", gap: 14 },
  resourceIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  resourceLabel: { fontSize: 14 },
  resourceDetail: { fontSize: 12, lineHeight: 17, marginTop: 2 },

  safetyCard: { borderRadius: 18, borderLeftWidth: 4, padding: 16, gap: 10 },
  safetyTitle: { fontSize: 15, color: "#9b1c1c" },
  safetyText: { fontSize: 13, lineHeight: 19 },
  safetyLink: { borderRadius: 10, padding: 12 },
  safetyLinkText: { fontSize: 13 },

  premiumCard: { borderRadius: 24, padding: 20, gap: 16 },
  premiumTitle: { fontSize: 20, lineHeight: 26, color: "#fff" },
  premiumSub: { fontSize: 13, lineHeight: 19, color: "rgba(255,255,255,0.62)" },
  premiumFeatures: { gap: 8 },
  premiumFeatureRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  premiumDot: { width: 18, height: 18, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  premiumFeatureText: { fontSize: 13, color: "rgba(255,255,255,0.8)" },
  premiumCta: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 13, borderRadius: 100 },
  premiumCtaText: { color: "#fff", fontSize: 13, letterSpacing: 0.8 },

  // AI / analyze
  aiLabel: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  aiLabelText: { fontSize: 9, letterSpacing: 1.2 },
  aiGenNote: { fontSize: 11, lineHeight: 15 },
  issuePill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  issuePillText: { fontSize: 11 },

  analyzeCard: { borderRadius: 22, padding: 18, gap: 14 },
  analyzeHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  analyzeIconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  analyzeTitle: { fontSize: 14 },
  analyzeDesc: { fontSize: 12, lineHeight: 17 },
  analyzeInput: {
    borderWidth: 1, borderRadius: 14, padding: 14,
    fontSize: 13, lineHeight: 19, minHeight: 100,
  },
  analyzeBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, paddingVertical: 13, borderRadius: 14,
  },
  analyzeBtnText: { fontSize: 14, letterSpacing: 0.3 },
  analyzeHint: { fontSize: 11, textAlign: "center" },

  aiResultBanner: { flexDirection: "row", alignItems: "center", gap: 6, padding: 10, borderRadius: 12 },
  aiResultBannerText: { fontSize: 11, letterSpacing: 1 },
  docTypePill: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  docTypePillText: { fontSize: 12, color: "#fff" },
  confidencePill: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  confidenceDot: { width: 6, height: 6, borderRadius: 3 },
  confidencePillText: { fontSize: 11 },
  nextStepRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  nextStepNum: { width: 20, height: 20, borderRadius: 10, alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 },
  nextStepNumText: { fontSize: 11, color: "#fff" },

  uploadBtn: {
    flexDirection: "row", alignItems: "center", gap: 12,
    padding: 14, borderRadius: 14, borderWidth: 1,
  },
  uploadBtnText: { fontSize: 14 },

  orDivider: { flexDirection: "row", alignItems: "center", gap: 10 },
  orLine: { flex: 1, height: 1 },
  orText: { fontSize: 12 },

  lockDot: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, alignItems: "center", justifyContent: "center", marginTop: 1, flexShrink: 0 },
  unlockHint: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
    borderRadius: 12, borderWidth: 1, paddingVertical: 10,
  },
  unlockHintText: { fontSize: 12, letterSpacing: 0.3 },
});

const pw = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" },
  sheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 24, paddingTop: 12, paddingBottom: 40, gap: 16, alignItems: "stretch" },
  handle: { width: 40, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: 8 },
  lockBadge: { width: 52, height: 52, borderRadius: 16, alignItems: "center", justifyContent: "center", alignSelf: "center" },
  title: { fontSize: 22, lineHeight: 28, letterSpacing: -0.3, textAlign: "center" },
  subtitle: { fontSize: 14, lineHeight: 20, textAlign: "center", marginTop: -4 },
  featureList: { borderRadius: 18, borderWidth: 1, padding: 16, gap: 12 },
  featureRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  featureText: { fontSize: 13, lineHeight: 19, flex: 1 },
  unlockBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 16, borderRadius: 18 },
  unlockBtnText: { color: "#fff", fontSize: 15 },
  dismissBtn: { alignItems: "center", paddingVertical: 4 },
  dismissText: { fontSize: 13, textDecorationLine: "underline" },
});

// ─── Screen styles ────────────────────────────────────────────────────────────

const mc = StyleSheet.create({
  header: { paddingHorizontal: 22, paddingTop: 16, paddingBottom: 12, gap: 14 },
  headerTop: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  headerLabel: { fontSize: 9, letterSpacing: 1.4, textTransform: "uppercase" },
  headerTitle: { fontSize: 18, lineHeight: 24, letterSpacing: -0.2 },
  askBtn: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 100, marginTop: 4 },
  askBtnText: { fontSize: 12 },
  tabRow: { flexDirection: "row", borderRadius: 14, padding: 4, gap: 4 },
  tabPill: { flex: 1, alignItems: "center", paddingVertical: 9, borderRadius: 10 },
  tabLabel: { fontSize: 13 },
  scrollContent: { paddingHorizontal: 22, paddingTop: 16, paddingBottom: 120 },
});
