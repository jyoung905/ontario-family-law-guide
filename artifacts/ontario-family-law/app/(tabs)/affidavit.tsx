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
import { useApp } from "@/context/AppContext";
const BASE_URL = `https://${process.env.EXPO_PUBLIC_DOMAIN}`;

export default function AffidavitScreen() {
  const colors = useColors();
  const isDark = useColorScheme() === "dark";
  const { hasPrepPack } = useSubscription();
  const { userRole } = useApp();

  const [facts, setFacts] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  if (!hasPrepPack) {
    return (
      <PremiumGate
        featureName="Affidavit Builder"
        description="Turn your facts into a structured affidavit outline, ready for your lawyer to review and for you to swear before a commissioner."
        icon="create-outline"
        tier="prep_pack"
      />
    );
  }

  const handleGenerate = async () => {
    if (!facts.trim()) return;
    setLoading(true);
    setResult("");
    try {
      const response = await fetch(`${BASE_URL}/api/family-law/premium/affidavit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          facts,
          userRole: userRole === "served" ? "Respondent" : userRole === "serving" ? "Applicant" : "not specified",
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
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  const s = styles(colors, isDark);

  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      <View style={s.header}>
        <Text style={s.title}>Affidavit Builder</Text>
        <Text style={s.subtitle}>Structured outline from your facts</Text>
      </View>

      <ScrollView ref={scrollRef} style={s.scroll} contentContainerStyle={s.scrollContent}>
        <View style={s.infoCard}>
          <Ionicons name="information-circle-outline" size={18} color={colors.info} />
          <Text style={s.infoText}>
            An affidavit is a written statement you swear is true before a commissioner of oaths. It must contain facts — not arguments or opinions. This tool creates a structured outline based on the facts you provide.
          </Text>
        </View>

        <Text style={s.label}>Your Facts</Text>
        <Text style={s.hint}>
          Write what happened in your own words. Include dates, locations, and what was said or done. Avoid opinions or conclusions.
        </Text>
        <TextInput
          style={s.input}
          multiline
          numberOfLines={8}
          placeholder="E.g. On January 5, 2025, I picked up the children from school. When I arrived, my spouse told me I could not take them. The children were present and became upset..."
          placeholderTextColor={colors.mutedForeground}
          value={facts}
          onChangeText={setFacts}
          textAlignVertical="top"
        />

        <View style={s.tips}>
          <Text style={s.tipsTitle}>Tips for a strong affidavit:</Text>
          {[
            "Stick to facts — no opinions or arguments",
            "One fact per paragraph",
            "Include dates and locations",
            "Describe what you saw or heard directly",
            "Attach documents as exhibits (label A, B, C...)",
          ].map((tip) => (
            <View key={tip} style={s.tipRow}>
              <Text style={s.tipBullet}>•</Text>
              <Text style={s.tipText}>{tip}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={[s.btn, (!facts.trim() || loading) && s.btnDisabled]}
          onPress={handleGenerate}
          disabled={!facts.trim() || loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="sparkles" size={18} color="#fff" />
              <Text style={s.btnText}>Build Affidavit Outline</Text>
            </>
          )}
        </TouchableOpacity>

        {result !== "" && (
          <View style={s.resultCard}>
            <View style={s.resultHeader}>
              <Ionicons name="create" size={18} color={colors.accent} />
              <Text style={s.resultTitle}>Affidavit Outline</Text>
            </View>
            <View style={s.disclaimerBanner}>
              <Ionicons name="warning-outline" size={14} color={colors.warning} />
              <Text style={s.disclaimerText}>
                You must review this with a lawyer and swear it before a commissioner of oaths. This is a draft only — not a legal document as written.
              </Text>
            </View>
            <Text style={s.resultText}>{result}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = (colors: any, isDark: boolean) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
    title: { fontSize: 24, fontWeight: "800", color: colors.foreground },
    subtitle: { fontSize: 13, color: colors.mutedForeground, marginTop: 2 },
    scroll: { flex: 1 },
    scrollContent: { padding: 20, paddingBottom: 120 },
    infoCard: {
      flexDirection: "row",
      gap: 10,
      backgroundColor: isDark ? "#0d1e3a" : "#eff6ff",
      borderRadius: 12,
      padding: 14,
      marginBottom: 20,
    },
    infoText: { flex: 1, fontSize: 13, color: colors.info, lineHeight: 20 },
    label: { fontSize: 13, fontWeight: "700", color: colors.foreground, marginBottom: 6 },
    hint: { fontSize: 12, color: colors.mutedForeground, lineHeight: 18, marginBottom: 10 },
    input: {
      backgroundColor: colors.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 14,
      fontSize: 14,
      color: colors.foreground,
      minHeight: 160,
      lineHeight: 21,
      marginBottom: 16,
    },
    tips: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    tipsTitle: { fontSize: 13, fontWeight: "700", color: colors.foreground, marginBottom: 10 },
    tipRow: { flexDirection: "row", gap: 8, marginBottom: 6 },
    tipBullet: { color: colors.accent, fontWeight: "700", fontSize: 14 },
    tipText: { flex: 1, fontSize: 13, color: colors.mutedForeground, lineHeight: 19 },
    btn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      backgroundColor: colors.primary,
      borderRadius: 12,
      paddingVertical: 14,
      marginBottom: 20,
    },
    btnDisabled: { opacity: 0.5 },
    btnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
    resultCard: {
      backgroundColor: colors.card,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
    },
    resultHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    resultTitle: { fontSize: 15, fontWeight: "700", color: colors.foreground },
    disclaimerBanner: {
      flexDirection: "row",
      gap: 6,
      alignItems: "flex-start",
      backgroundColor: isDark ? "#2a1f0a" : "#fffbeb",
      padding: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    disclaimerText: { flex: 1, fontSize: 11, color: colors.warning, lineHeight: 16 },
    resultText: { padding: 16, fontSize: 13, color: colors.foreground, lineHeight: 22 },
  });
