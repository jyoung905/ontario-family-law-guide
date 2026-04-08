import * as Clipboard from "expo-clipboard";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  useColorScheme,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { useSubscription } from "@/lib/revenuecat";
import { PremiumGate } from "@/components/PremiumGate";
const BASE_URL = `https://${process.env.EXPO_PUBLIC_DOMAIN}`;

export const FORM_TYPES = [
  {
    id: "Form 8 (Application)",
    label: "Form 8 — Application",
    icon: "document-outline" as const,
    desc: "Starting a court case — what you are asking for",
    deadline: null,
  },
  {
    id: "Form 10 (Answer)",
    label: "Form 10 — Answer",
    icon: "mail-unread-outline" as const,
    desc: "Responding to an Application",
    deadline: "30 days from service",
  },
  {
    id: "Form 14B (Motion)",
    label: "Form 14B — Motion",
    icon: "hand-right-outline" as const,
    desc: "Asking for a temporary order",
    deadline: null,
  },
  {
    id: "Form 15B (Response to Motion)",
    label: "Form 15B — Response",
    icon: "chatbubble-ellipses-outline" as const,
    desc: "Responding to a motion",
    deadline: null,
  },
  {
    id: "Form 35.1 (Parenting Affidavit)",
    label: "Form 35.1 — Parenting",
    icon: "people-outline" as const,
    desc: "Custody / parenting cases",
    deadline: "Filed with Application",
  },
  {
    id: "Form 13 (Financial Statement)",
    label: "Form 13 — Financial",
    icon: "wallet-outline" as const,
    desc: "Support & property matters",
    deadline: null,
  },
];

const STEPS = ["Select Form", "Describe Situation", "Review Draft"];

export default function DraftScreen() {
  const colors = useColors();
  const isDark = useColorScheme() === "dark";
  const { hasDraftingHelp } = useSubscription();
  const { formId } = useLocalSearchParams<{ formId?: string }>();

  const [step, setStep] = useState(0);
  const [selectedForm, setSelectedForm] = useState(FORM_TYPES[0].id);
  const [facts, setFacts] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [copyDone, setCopyDone] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  // When arriving from the checklist with a specific formId, pre-select and skip to step 1
  useEffect(() => {
    if (!formId) return;
    const match = FORM_TYPES.find((f) => f.id === formId);
    if (match) {
      setSelectedForm(match.id);
      setFacts("");
      setResult("");
      setStep(1);
      setTimeout(() => scrollRef.current?.scrollTo({ y: 0, animated: false }), 50);
    }
  }, [formId]);

  if (!hasDraftingHelp) {
    return (
      <PremiumGate
        featureName="AI Document Drafting"
        description="Generate prefilled drafts of Ontario family court forms based on your facts. Form 10, Form 14B, Form 15B, and more."
        icon="document-text-outline"
        tier="drafting_help"
      />
    );
  }

  const handleGenerate = async () => {
    if (!facts.trim()) return;
    setLoading(true);
    setResult("");
    setStep(2);
    try {
      const response = await fetch(`${BASE_URL}/api/family-law/premium/draft-document`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formType: selectedForm, userFacts: facts }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error((err as any).error ?? `Server error ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error("No response stream");

      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.content) setResult((prev) => prev + data.content);
              if (data.fullContent) setResult(data.fullContent);
            } catch {}
          }
        }
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Something went wrong. Please try again.";
      setResult(`⚠️ ${msg}`);
    } finally {
      setLoading(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 200);
    }
  };

  const buildPdfHtml = (formLabel: string, draftText: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${formLabel}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Georgia, 'Times New Roman', serif; max-width: 680px; margin: 40px auto; padding: 0 32px; color: #1a1a1a; }
    .header { border-bottom: 2px solid #002631; padding-bottom: 14px; margin-bottom: 20px; }
    h1 { font-size: 20px; color: #002631; margin-bottom: 4px; }
    .meta { font-size: 11px; color: #666; }
    .disclaimer { background: #fffbeb; border: 1px solid #fde68a; border-radius: 6px; padding: 12px 14px; font-size: 12px; color: #92400e; margin-bottom: 24px; line-height: 1.5; }
    .content { white-space: pre-wrap; font-size: 13px; line-height: 1.8; color: #1a1a1a; }
    .placeholder { background: #fef3c7; color: #92400e; font-weight: bold; }
    .footer { margin-top: 48px; padding-top: 12px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #9ca3af; }
    @media print { body { margin: 20px auto; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>${formLabel}</h1>
    <div class="meta">AI-generated draft · Ontario Family Law Guide · ${new Date().toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" })}</div>
  </div>
  <div class="disclaimer">
    ⚠️ Draft only — review carefully with a licensed lawyer before filing. All [PLACEHOLDER] items must be completed with your specific information.
  </div>
  <div class="content">${draftText.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>
  <div class="footer">Ontario Family Law Guide · Not a law firm · General information only · Not legal advice</div>
</body>
</html>`;

  const handleSaveAsPDF = async () => {
    if (!result || !selectedFormData) return;
    setIsSaving(true);
    try {
      const html = buildPdfHtml(selectedFormData.label, result);
      if (Platform.OS === "web") {
        const win = window.open("", "_blank");
        if (win) {
          win.document.write(html);
          win.document.close();
          setTimeout(() => win.print(), 300);
        }
      } else {
        const { uri } = await Print.printToFileAsync({ html });
        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          await Sharing.shareAsync(uri, {
            mimeType: "application/pdf",
            dialogTitle: `Save ${selectedFormData.label} Draft`,
            UTI: "com.adobe.pdf",
          });
        }
      }
    } catch {
      // silently fail — nothing to do
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyText = async () => {
    if (!result) return;
    try {
      await Clipboard.setStringAsync(result);
    } catch {
      // Fallback for web browsers that support navigator.clipboard
      if (Platform.OS === "web") {
        try { await navigator.clipboard.writeText(result); } catch {}
      }
    }
    setCopyDone(true);
    setTimeout(() => setCopyDone(false), 2200);
  };

  const s = styles(colors, isDark);
  const selectedFormData = FORM_TYPES.find((f) => f.id === selectedForm);

  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      {/* Progress header */}
      <View style={s.header}>
        <Text style={s.title}>Document Drafter</Text>
        <Text style={s.subtitle}>AI-generated Ontario court form drafts</Text>

        <View style={s.stepsRow}>
          {STEPS.map((label, i) => (
            <React.Fragment key={label}>
              <TouchableOpacity
                onPress={() => { if (i < step || step === 2) setStep(i); }}
                style={s.stepItem}
                disabled={i > step}
              >
                <View style={[
                  s.stepDot,
                  {
                    backgroundColor: i <= step ? colors.primary : colors.secondary,
                    borderColor: i <= step ? colors.primary : colors.border,
                  },
                ]}>
                  {i < step ? (
                    <Ionicons name="checkmark" size={12} color="#fff" />
                  ) : (
                    <Text style={[s.stepNum, { color: i === step ? "#fff" : colors.mutedForeground }]}>{i + 1}</Text>
                  )}
                </View>
                <Text style={[s.stepLabel, { color: i === step ? colors.primary : colors.mutedForeground }]}>
                  {label}
                </Text>
              </TouchableOpacity>
              {i < STEPS.length - 1 && (
                <View style={[s.stepLine, { backgroundColor: i < step ? colors.primary : colors.border }]} />
              )}
            </React.Fragment>
          ))}
        </View>
      </View>

      <ScrollView ref={scrollRef} style={s.scroll} contentContainerStyle={s.scrollContent}>

        {/* ── Step 0: Select form ── */}
        {step === 0 && (
          <View style={{ gap: 10 }}>
            <Text style={s.stepHeading}>Which form do you need to draft?</Text>
            <Text style={s.stepHint}>Select the court form that matches your situation.</Text>
            {FORM_TYPES.map((f) => (
              <TouchableOpacity
                key={f.id}
                style={[
                  s.formCard,
                  {
                    backgroundColor: selectedForm === f.id ? colors.primary + "10" : colors.card,
                    borderColor: selectedForm === f.id ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => {
                  setSelectedForm(f.id);
                  setTimeout(() => setStep(1), 260);
                }}
              >
                <View style={[s.formCardIcon, { backgroundColor: selectedForm === f.id ? colors.primary + "20" : colors.secondary }]}>
                  <Ionicons name={f.icon} size={22} color={selectedForm === f.id ? colors.primary : colors.mutedForeground} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[s.formCardLabel, { color: colors.foreground }]}>{f.label}</Text>
                  <Text style={[s.formCardDesc, { color: colors.mutedForeground }]}>{f.desc}</Text>
                  {f.deadline && (
                    <View style={s.deadlinePill}>
                      <Ionicons name="alarm-outline" size={11} color="#dc2626" />
                      <Text style={s.deadlinePillText}>Deadline: {f.deadline}</Text>
                    </View>
                  )}
                </View>
                {selectedForm === f.id
                  ? <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
                  : <Ionicons name="chevron-forward" size={18} color={colors.mutedForeground} />
                }
              </TouchableOpacity>
            ))}
            <Text style={[s.stepHint, { textAlign: "center", marginTop: 4 }]}>Tap a form above to continue →</Text>
          </View>
        )}

        {/* ── Step 1: Facts ── */}
        {step === 1 && (
          <View style={{ gap: 10 }}>
            <Text style={s.stepHeading}>Describe your situation</Text>
            <Text style={s.stepHint}>
              Write in plain language — no legal jargon needed. Avoid full names, SIN numbers, or exact birthdates. The AI will generate a structured draft based on what you provide.
            </Text>

            <View style={[s.selectedFormBadge, { backgroundColor: colors.primary + "10", borderColor: colors.primary + "40" }]}>
              <Ionicons name="document-text" size={14} color={colors.primary} />
              <Text style={[s.selectedFormText, { color: colors.primary }]}>
                Drafting: {selectedFormData?.label}
              </Text>
              <TouchableOpacity onPress={() => setStep(0)}>
                <Text style={[s.changeLink, { color: colors.primary }]}>Change</Text>
              </TouchableOpacity>
            </View>

            <View style={[s.exampleBox, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
              <Text style={[s.exampleLabel, { color: colors.mutedForeground }]}>Example</Text>
              <Text style={[s.exampleText, { color: colors.mutedForeground }]}>
                "I was served with an Application on March 15, 2025. My spouse is asking for sole custody of our two children aged 6 and 9. I disagree — I have been the primary caregiver and the children live with me 70% of the time..."
              </Text>
            </View>

            <TextInput
              style={[s.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
              multiline
              numberOfLines={8}
              placeholder="Describe what happened and what you need the form to say..."
              placeholderTextColor={colors.mutedForeground}
              value={facts}
              onChangeText={setFacts}
              textAlignVertical="top"
            />

            <Text style={[s.charCount, { color: colors.mutedForeground }]}>
              {facts.length} characters — aim for at least 100 for a useful draft
            </Text>

            <TouchableOpacity
              style={[s.nextBtn, { backgroundColor: colors.primary, opacity: !facts.trim() ? 0.5 : 1 }]}
              onPress={handleGenerate}
              disabled={!facts.trim() || loading}
            >
              {loading ? <ActivityIndicator color="#fff" /> : (
                <>
                  <Ionicons name="sparkles" size={18} color="#fff" />
                  <Text style={s.nextBtnText}>Generate Draft</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* ── Step 2: Result ── */}
        {step === 2 && (
          <View style={{ gap: 12 }}>
            <Text style={s.stepHeading}>Your Draft</Text>

            {loading ? (
              <View style={[s.loadingCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <ActivityIndicator color={colors.primary} size="large" />
                <Text style={[s.loadingText, { color: colors.mutedForeground }]}>
                  Generating your {selectedFormData?.label} draft...
                </Text>
                <View style={[s.progressTrack, { backgroundColor: colors.secondary }]}>
                  <View style={[s.progressPulse, { backgroundColor: colors.primary }]} />
                </View>
              </View>
            ) : result ? (
              <>
                <View style={[s.disclaimerBanner, { backgroundColor: isDark ? "#2a1f0a" : "#fffbeb", borderColor: isDark ? "#3d2f10" : "#fde68a" }]}>
                  <Ionicons name="warning-outline" size={16} color="#d97706" />
                  <Text style={[s.disclaimerText, { color: "#92400e" }]}>
                    Draft only — review with a lawyer before filing. All personal details marked [PLACEHOLDER] must be completed.
                  </Text>
                </View>

                <View style={[s.resultCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={[s.resultHeader, { borderBottomColor: colors.border }]}>
                    <View style={[s.resultHeaderIcon, { backgroundColor: colors.primary + "15" }]}>
                      <Ionicons name="document-text" size={18} color={colors.primary} />
                    </View>
                    <View>
                      <Text style={[s.resultTitle, { color: colors.foreground }]}>{selectedFormData?.label}</Text>
                      <Text style={[s.resultSubtitle, { color: colors.mutedForeground }]}>AI-generated draft</Text>
                    </View>
                  </View>
                  <Text style={[s.resultText, { color: colors.foreground }]}>{result}</Text>
                </View>

                {/* Action buttons */}
                <View style={s.actionRow}>
                  <TouchableOpacity
                    style={[s.pdfBtn, { backgroundColor: colors.primary }]}
                    onPress={handleSaveAsPDF}
                    disabled={isSaving}
                  >
                    {isSaving
                      ? <ActivityIndicator size="small" color="#fff" />
                      : <Ionicons name="download-outline" size={16} color="#fff" />
                    }
                    <Text style={s.pdfBtnText}>
                      {Platform.OS === "web" ? "Print / Save PDF" : "Save as PDF"}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[s.copyBtn, { backgroundColor: copyDone ? "#f0fdf4" : colors.secondary, borderColor: copyDone ? "#86efac" : colors.border }]}
                    onPress={handleCopyText}
                  >
                    <Ionicons name={copyDone ? "checkmark-outline" : "copy-outline"} size={16} color={copyDone ? "#16a34a" : colors.primary} />
                    <Text style={[s.copyBtnText, { color: copyDone ? "#16a34a" : colors.primary }]}>
                      {copyDone ? "Copied!" : "Copy text"}
                    </Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={[s.restartBtn, { backgroundColor: colors.secondary, borderColor: colors.border }]}
                  onPress={() => { setResult(""); setFacts(""); setStep(0); }}
                >
                  <Ionicons name="refresh-outline" size={16} color={colors.primary} />
                  <Text style={[s.restartBtnText, { color: colors.primary }]}>Start a new draft</Text>
                </TouchableOpacity>
              </>
            ) : null}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = (colors: any, isDark: boolean) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    header: {
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    title: { fontSize: 22, fontWeight: "800", color: colors.foreground },
    subtitle: { fontSize: 13, color: colors.mutedForeground, marginTop: 2, marginBottom: 14 },

    // Step progress
    stepsRow: { flexDirection: "row", alignItems: "center" },
    stepItem: { alignItems: "center", gap: 4 },
    stepDot: {
      width: 26, height: 26, borderRadius: 13,
      alignItems: "center", justifyContent: "center",
      borderWidth: 1.5,
    },
    stepNum: { fontSize: 12, fontWeight: "700" },
    stepLabel: { fontSize: 10, fontWeight: "600", textAlign: "center", maxWidth: 60 },
    stepLine: { flex: 1, height: 2, marginBottom: 14, marginHorizontal: 4 },

    scroll: { flex: 1 },
    scrollContent: { padding: 20, paddingBottom: 120 },

    stepHeading: { fontSize: 18, fontWeight: "800", color: colors.foreground, marginBottom: 2 },
    stepHint: { fontSize: 13, color: colors.mutedForeground, lineHeight: 19, marginBottom: 6 },

    // Form selection cards
    formCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      borderRadius: 14,
      borderWidth: 1.5,
      padding: 14,
    },
    formCardIcon: { width: 42, height: 42, borderRadius: 10, alignItems: "center", justifyContent: "center" },
    formCardLabel: { fontSize: 14, fontWeight: "700" },
    formCardDesc: { fontSize: 12, marginTop: 2 },
    deadlinePill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      marginTop: 5,
      backgroundColor: "#fef2f2",
      alignSelf: "flex-start",
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 10,
    },
    deadlinePillText: { fontSize: 10, color: "#dc2626", fontWeight: "600" },

    // Selected form badge
    selectedFormBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      borderRadius: 10,
      borderWidth: 1,
      padding: 10,
    },
    selectedFormText: { flex: 1, fontSize: 13, fontWeight: "600" },
    changeLink: { fontSize: 12, fontWeight: "700" },

    // Example box
    exampleBox: { borderRadius: 10, borderWidth: 1, padding: 12 },
    exampleLabel: { fontSize: 10, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 },
    exampleText: { fontSize: 12, lineHeight: 18, fontStyle: "italic" },

    // Input
    input: {
      borderRadius: 12,
      borderWidth: 1,
      padding: 14,
      fontSize: 14,
      minHeight: 180,
      lineHeight: 21,
    },
    charCount: { fontSize: 11, textAlign: "right", marginTop: -4 },

    // Navigation
    nextBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      borderRadius: 12,
      paddingVertical: 14,
      marginTop: 4,
    },
    nextBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },

    // Loading state
    loadingCard: {
      borderRadius: 16,
      borderWidth: 1,
      padding: 32,
      alignItems: "center",
      gap: 16,
    },
    loadingText: { fontSize: 14, textAlign: "center", lineHeight: 20 },
    progressTrack: { width: "100%", height: 4, borderRadius: 2, overflow: "hidden" },
    progressPulse: { height: 4, width: "60%", borderRadius: 2 },

    // Result
    disclaimerBanner: {
      flexDirection: "row",
      gap: 8,
      alignItems: "flex-start",
      borderRadius: 12,
      padding: 12,
      borderWidth: 1,
    },
    disclaimerText: { flex: 1, fontSize: 12, lineHeight: 17 },
    resultCard: {
      borderRadius: 14,
      borderWidth: 1,
      overflow: "hidden",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.07,
      shadowRadius: 6,
      elevation: 3,
    },
    resultHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      padding: 14,
      borderBottomWidth: 1,
    },
    resultHeaderIcon: {
      width: 36, height: 36, borderRadius: 10,
      alignItems: "center", justifyContent: "center",
    },
    resultTitle: { fontSize: 14, fontWeight: "700" },
    resultSubtitle: { fontSize: 11, marginTop: 1 },
    resultText: { padding: 16, fontSize: 13, lineHeight: 22 },

    restartBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      borderRadius: 12,
      borderWidth: 1,
      paddingVertical: 12,
      marginTop: 4,
    },
    restartBtnText: { fontSize: 14, fontWeight: "600" },

    // PDF / Copy actions
    actionRow: { flexDirection: "row", gap: 10 },
    pdfBtn: {
      flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
      gap: 8, borderRadius: 12, paddingVertical: 14,
    },
    pdfBtnText: { color: "#fff", fontSize: 14, fontWeight: "700" },
    copyBtn: {
      flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
      gap: 8, borderRadius: 12, paddingVertical: 14, borderWidth: 1,
    },
    copyBtnText: { fontSize: 14, fontWeight: "600" },
  });
