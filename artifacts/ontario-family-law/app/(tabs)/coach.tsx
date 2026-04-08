import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useSubscription } from "@/lib/revenuecat";
import { PremiumGate } from "@/components/PremiumGate";
const BASE_URL = `https://${process.env.EXPO_PUBLIC_DOMAIN}`;

type Mode = "draft" | "review";

export default function CoachScreen() {
  const colors = useColors();
  const isDark = useColorScheme() === "dark";
  const { hasGuidedHelp } = useSubscription();

  const [mode, setMode] = useState<Mode>("draft");
  const [situation, setSituation] = useState("");
  const [draftMessage, setDraftMessage] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  if (!hasGuidedHelp) {
    return (
      <PremiumGate
        featureName="Communication Coach"
        description="Draft or review messages to the other party. Flags language that could hurt your case and suggests professional alternatives."
        icon="chatbubbles-outline"
        tier="guided_help"
      />
    );
  }

  const handleSubmit = async () => {
    if (!situation.trim()) return;
    setLoading(true);
    setResult("");
    try {
      const response = await fetch(`${BASE_URL}/api/family-law/premium/coach-message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          situation,
          mode,
          draftMessage: mode === "review" ? draftMessage : undefined,
        }),
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

  const handleReset = () => {
    setResult("");
    setSituation("");
    setDraftMessage("");
  };

  const s = styles(colors, isDark);

  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      <View style={s.header}>
        <Text style={s.title}>Communication Coach</Text>
        <Text style={s.subtitle}>Keep it professional — protect your case</Text>
      </View>

      <ScrollView ref={scrollRef} style={s.scroll} contentContainerStyle={s.scrollContent}>

        <View style={s.warningCard}>
          <Ionicons name="information-circle-outline" size={18} color="#0369a1" />
          <Text style={s.warningText}>
            All written communication with the other party can be entered as evidence in court. Keep messages factual, brief, and focused on the issue at hand.
          </Text>
        </View>

        {/* Mode tabs */}
        <View style={[s.modePicker, { backgroundColor: colors.secondary }]}>
          <TouchableOpacity
            style={[s.modeBtn, mode === "draft" && { backgroundColor: colors.primary }]}
            onPress={() => { setMode("draft"); setResult(""); }}
          >
            <Ionicons name="pencil-outline" size={15} color={mode === "draft" ? "#fff" : colors.mutedForeground} />
            <Text style={[s.modeBtnText, { color: mode === "draft" ? "#fff" : colors.mutedForeground }]}>Draft for me</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.modeBtn, mode === "review" && { backgroundColor: colors.primary }]}
            onPress={() => { setMode("review"); setResult(""); }}
          >
            <Ionicons name="eye-outline" size={15} color={mode === "review" ? "#fff" : colors.mutedForeground} />
            <Text style={[s.modeBtnText, { color: mode === "review" ? "#fff" : colors.mutedForeground }]}>Review mine</Text>
          </TouchableOpacity>
        </View>

        <Text style={[s.label, { color: colors.foreground }]}>
          {mode === "draft" ? "What do you need to communicate?" : "Situation context"}
        </Text>
        <Text style={[s.hint, { color: colors.mutedForeground }]}>
          {mode === "draft"
            ? "Describe what you need to say and why. Include any relevant facts."
            : "Briefly describe the context for your message."}
        </Text>
        <TextInput
          style={[s.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
          multiline
          numberOfLines={4}
          placeholder={
            mode === "draft"
              ? "E.g. I need to ask my ex to change the pickup time this Saturday because I have a medical appointment..."
              : "E.g. My ex hasn't responded to my request about the children's school schedule and I want to follow up..."
          }
          placeholderTextColor={colors.mutedForeground}
          value={situation}
          onChangeText={setSituation}
          textAlignVertical="top"
        />

        {mode === "review" && (
          <>
            <Text style={[s.label, { color: colors.foreground }]}>Your draft message</Text>
            <Text style={[s.hint, { color: colors.mutedForeground }]}>
              Paste the message you want reviewed for tone, language, and court-impact.
            </Text>
            <TextInput
              style={[s.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground, minHeight: 130 }]}
              multiline
              numberOfLines={6}
              placeholder="Paste your draft message here..."
              placeholderTextColor={colors.mutedForeground}
              value={draftMessage}
              onChangeText={setDraftMessage}
              textAlignVertical="top"
            />
          </>
        )}

        <TouchableOpacity
          style={[s.btn, { backgroundColor: colors.primary, opacity: !situation.trim() || loading ? 0.5 : 1 }]}
          onPress={handleSubmit}
          disabled={!situation.trim() || loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="sparkles" size={18} color="#fff" />
              <Text style={s.btnText}>
                {mode === "draft" ? "Draft a Professional Message" : "Review My Message"}
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* ── Split view result ── */}
        {result !== "" && (
          <View style={{ gap: 12 }}>
            {mode === "review" && draftMessage.trim() ? (
              <>
                {/* Split view header */}
                <View style={s.splitHeader}>
                  <Ionicons name="git-compare-outline" size={16} color={colors.mutedForeground} />
                  <Text style={[s.splitHeaderText, { color: colors.mutedForeground }]}>
                    Original vs. Court-safe version
                  </Text>
                </View>

                {/* Original */}
                <View style={[s.splitCard, { backgroundColor: isDark ? "#1f1a14" : "#fffbeb", borderColor: "#fde68a" }]}>
                  <View style={s.splitCardHeader}>
                    <View style={[s.splitDot, { backgroundColor: "#d97706" }]} />
                    <Text style={[s.splitCardLabel, { color: "#92400e" }]}>Your Original</Text>
                  </View>
                  <Text style={[s.splitCardText, { color: isDark ? "#d97706" : "#92400e" }]}>
                    {draftMessage}
                  </Text>
                </View>

                {/* Court-safe */}
                <View style={[s.splitCard, { backgroundColor: isDark ? "#0d1f14" : "#f0fdf4", borderColor: "#86efac" }]}>
                  <View style={s.splitCardHeader}>
                    <View style={[s.splitDot, { backgroundColor: "#16a34a" }]} />
                    <Text style={[s.splitCardLabel, { color: "#14532d" }]}>Coach's Review</Text>
                  </View>
                  <Text style={[s.splitCardText, { color: isDark ? "#86efac" : "#14532d" }]}>
                    {result}
                  </Text>
                </View>
              </>
            ) : (
              /* Draft mode result */
              <View style={[s.resultCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={[s.resultHeader, { borderBottomColor: colors.border }]}>
                  <View style={[s.resultHeaderIcon, { backgroundColor: "#0891b215" }]}>
                    <Ionicons name="chatbubbles" size={18} color="#0891b2" />
                  </View>
                  <View>
                    <Text style={[s.resultTitle, { color: colors.foreground }]}>Suggested Message</Text>
                    <Text style={[s.resultSubtitle, { color: colors.mutedForeground }]}>Professional & court-safe</Text>
                  </View>
                </View>
                <Text style={[s.resultText, { color: colors.foreground }]}>{result}</Text>
              </View>
            )}

            <View style={[s.tipBox, { backgroundColor: isDark ? "#0f1e14" : "#f0fdf4", borderColor: "#86efac" }]}>
              <Ionicons name="bulb-outline" size={15} color="#16a34a" />
              <Text style={[s.tipText, { color: isDark ? "#86efac" : "#14532d" }]}>
                Always send communication by email rather than text for a clear record. Save a copy to your files.
              </Text>
            </View>

            <TouchableOpacity
              style={[s.resetBtn, { backgroundColor: colors.secondary, borderColor: colors.border }]}
              onPress={handleReset}
            >
              <Ionicons name="refresh-outline" size={16} color={colors.primary} />
              <Text style={[s.resetBtnText, { color: colors.primary }]}>Start over</Text>
            </TouchableOpacity>
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
      paddingBottom: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    title: { fontSize: 22, fontWeight: "800", color: colors.foreground },
    subtitle: { fontSize: 13, color: colors.mutedForeground, marginTop: 2 },
    scroll: { flex: 1 },
    scrollContent: { padding: 20, paddingBottom: 120, gap: 14 },

    warningCard: {
      flexDirection: "row",
      gap: 10,
      backgroundColor: isDark ? "#0c1a27" : "#eff6ff",
      borderRadius: 12,
      padding: 14,
      borderWidth: 1,
      borderColor: isDark ? "#1e3a5f" : "#bfdbfe",
    },
    warningText: { flex: 1, fontSize: 13, color: isDark ? "#93c5fd" : "#1e40af", lineHeight: 19 },

    modePicker: {
      flexDirection: "row",
      gap: 8,
      borderRadius: 12,
      padding: 4,
    },
    modeBtn: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      paddingVertical: 10,
      borderRadius: 10,
    },
    modeBtnText: { fontSize: 13, fontWeight: "600" },

    label: { fontSize: 13, fontWeight: "700", marginBottom: 4 },
    hint: { fontSize: 12, lineHeight: 18, marginBottom: 8, marginTop: -2 },
    input: {
      borderRadius: 12,
      borderWidth: 1,
      padding: 14,
      fontSize: 14,
      minHeight: 100,
      lineHeight: 21,
    },

    btn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      borderRadius: 12,
      paddingVertical: 14,
    },
    btnText: { color: "#fff", fontSize: 15, fontWeight: "700" },

    // Split view
    splitHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingHorizontal: 4,
    },
    splitHeaderText: { fontSize: 12, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 },
    splitCard: {
      borderRadius: 14,
      borderWidth: 1,
      overflow: "hidden",
    },
    splitCardHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      padding: 12,
      paddingBottom: 8,
    },
    splitDot: { width: 10, height: 10, borderRadius: 5 },
    splitCardLabel: { fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },
    splitCardText: { paddingHorizontal: 14, paddingBottom: 14, fontSize: 13, lineHeight: 21 },

    // Draft result
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
    resultHeaderIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
    resultTitle: { fontSize: 14, fontWeight: "700" },
    resultSubtitle: { fontSize: 11, marginTop: 1 },
    resultText: { padding: 16, fontSize: 13, lineHeight: 22 },

    tipBox: { flexDirection: "row", gap: 8, alignItems: "flex-start", borderRadius: 10, borderWidth: 1, padding: 12 },
    tipText: { flex: 1, fontSize: 12, lineHeight: 18 },

    resetBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      borderRadius: 12,
      borderWidth: 1,
      paddingVertical: 12,
    },
    resetBtnText: { fontSize: 14, fontWeight: "600" },
  });
