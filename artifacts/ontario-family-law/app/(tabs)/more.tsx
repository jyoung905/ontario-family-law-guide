import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { useSubscription } from "@/lib/revenuecat";
import { TIER_CONFIG, TIER_ORDER, type Tier } from "@/lib/tiers";

const FREE_TOOLS = [
  {
    icon: "chatbubble-ellipses-outline" as const,
    label: "Ask the Assistant",
    desc: "Plain-language answers to your questions",
    route: "/(tabs)/assistant" as const,
  },
  {
    icon: "document-text-outline" as const,
    label: "Court Forms",
    desc: "Browse and understand Ontario court forms",
    route: "/(tabs)/forms" as const,
  },
  {
    icon: "link-outline" as const,
    label: "Legal Resources",
    desc: "Legal Aid, FLIC, Steps to Justice & more",
    route: "/(tabs)/resources" as const,
  },
];

// Which tab each paid tier links to (when unlocked)
const TIER_TAB: Partial<Record<Tier, string>> = {
  drafting_help: "/(tabs)/draft",
};

export default function MoreScreen() {
  const colors = useColors();
  const { hasEntitlement, hasDraftingHelp, hasGuidedHelp, hasPrepPack } = useSubscription();
  const { hasOnboarded, resetCase } = useApp();
  const [confirmVisible, setConfirmVisible] = useState(false);

  const handleConfirmReset = () => {
    setConfirmVisible(false);
    resetCase();
    router.replace("/(tabs)/");
  };

  const tierUnlocked: Record<Tier, boolean> = {
    guided_help: hasGuidedHelp,
    prep_pack: hasPrepPack,
    drafting_help: hasDraftingHelp,
  };

  return (
    <SafeAreaView style={[{ flex: 1, backgroundColor: colors.surface }]} edges={["top"]}>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <Text style={[s.pageLabel, { color: colors.mutedForeground }]}>TOOLS & RESOURCES</Text>

        {/* Free tools */}
        <View style={[s.groupCard, { backgroundColor: colors.surfaceContainerLow }]}>
          {FREE_TOOLS.map((item, i) => (
            <Pressable
              key={item.label}
              style={({ pressed }) => [
                s.toolRow,
                i < FREE_TOOLS.length - 1 && {
                  borderBottomWidth: 1,
                  borderBottomColor: colors.surfaceContainerHigh,
                  paddingBottom: 16,
                  marginBottom: 16,
                },
                { opacity: pressed ? 0.82 : 1 },
              ]}
              onPress={() => router.push(item.route)}
            >
              <View style={[s.toolIcon, { backgroundColor: colors.primary + "12" }]}>
                <Ionicons name={item.icon} size={20} color={colors.primary} />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={[s.toolLabel, { color: colors.foreground }]}>{item.label}</Text>
                <Text style={[s.toolDesc, { color: colors.mutedForeground }]}>{item.desc}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.outline} />
            </Pressable>
          ))}
        </View>

        {/* Paid tiers */}
        <Text style={[s.sectionLabel, { color: colors.mutedForeground }]}>PREMIUM TIERS</Text>

        {TIER_ORDER.map((tierId) => {
          const t = TIER_CONFIG[tierId];
          const unlocked = tierUnlocked[tierId];
          const isDrafting = tierId === "drafting_help";

          return (
            <Pressable
              key={tierId}
              style={({ pressed }) => [
                s.tierRow,
                {
                  backgroundColor: isDrafting && !unlocked ? colors.primary : colors.surfaceContainerLow,
                  opacity: pressed ? 0.9 : 1,
                  borderColor: unlocked
                    ? colors.outlineVariant
                    : isDrafting
                    ? colors.primary
                    : t.badgeColor + "30",
                },
              ]}
              onPress={() => {
                if (unlocked && TIER_TAB[tierId]) {
                  router.push(TIER_TAB[tierId] as any);
                } else {
                  router.push({ pathname: "/paywall", params: { tier: tierId } });
                }
              }}
            >
              <View style={[s.tierIcon, { backgroundColor: unlocked ? t.badgeColor + "20" : isDrafting ? "rgba(255,255,255,0.12)" : t.badgeColor + "18" }]}>
                <Ionicons
                  name={unlocked ? "checkmark-circle-outline" : (t.icon as any)}
                  size={20}
                  color={isDrafting && !unlocked ? "#fff" : unlocked ? "#16a34a" : t.badgeColor}
                />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Text style={[s.tierLabel, { color: isDrafting && !unlocked ? "#fff" : colors.foreground }]}>
                    {t.name}
                  </Text>
                  <View style={[s.tierBadgePill, { backgroundColor: t.badgeColor + (isDrafting && !unlocked ? "30" : "18") }]}>
                    <Text style={[s.tierBadgeText, { color: isDrafting && !unlocked ? "#a8d4e0" : t.badgeColor }]}>
                      {unlocked ? "ACTIVE" : t.price}
                    </Text>
                  </View>
                </View>
                <Text style={[s.tierDesc, { color: isDrafting && !unlocked ? "rgba(255,255,255,0.65)" : colors.mutedForeground }]}>
                  {t.tagline}
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={isDrafting && !unlocked ? "rgba(255,255,255,0.5)" : colors.outline}
              />
            </Pressable>
          );
        })}

        {/* Case management */}
        {hasOnboarded && (
          <View style={{ gap: 8 }}>
            <Text style={[s.sectionLabel, { color: colors.mutedForeground }]}>MY CASE</Text>
            <Pressable
              style={({ pressed }) => [
                s.caseRow,
                { backgroundColor: colors.surfaceContainerLow, opacity: pressed ? 0.82 : 1 },
              ]}
              onPress={() => setConfirmVisible(true)}
            >
              <View style={[s.toolIcon, { backgroundColor: "#fee2e2" }]}>
                <Ionicons name="refresh-outline" size={20} color="#dc2626" />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={[s.toolLabel, { color: "#dc2626" }]}>Start a new case</Text>
                <Text style={[s.toolDesc, { color: colors.mutedForeground }]}>
                  Clear your current case and begin fresh
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.outline} />
            </Pressable>
          </View>
        )}

        <Text style={[s.disclaimer, { color: colors.outline }]}>
          General information only — not legal advice.
        </Text>
      </ScrollView>

      {/* Confirm reset modal */}
      <Modal transparent visible={confirmVisible} animationType="fade">
        <View style={s.modalOverlay}>
          <View style={[s.modalCard, { backgroundColor: colors.card }]}>
            <View style={[s.modalIconWrap, { backgroundColor: "#fee2e2" }]}>
              <Ionicons name="refresh-outline" size={24} color="#dc2626" />
            </View>
            <Text style={[s.modalTitle, { color: colors.foreground, fontFamily: "Newsreader_500Medium" }]}>
              Start a new case?
            </Text>
            <Text style={[s.modalBody, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              This will clear your current case — your role, issues, deadlines, and conversation history. This cannot be undone.
            </Text>
            <View style={s.modalActions}>
              <TouchableOpacity
                style={[s.modalCancel, { backgroundColor: colors.surfaceContainerLow }]}
                onPress={() => setConfirmVisible(false)}
              >
                <Text style={[s.modalCancelText, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                  Keep my case
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.modalConfirm, { backgroundColor: "#dc2626" }]}
                onPress={handleConfirmReset}
              >
                <Text style={[s.modalConfirmText, { fontFamily: "Inter_700Bold" }]}>Start fresh</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  content: { paddingHorizontal: 22, paddingTop: 16, paddingBottom: 120, gap: 14 },
  pageLabel: { fontSize: 10, letterSpacing: 1.4, fontFamily: "Manrope_600SemiBold" },
  sectionLabel: { fontSize: 10, letterSpacing: 1.4, textTransform: "uppercase", fontFamily: "Manrope_600SemiBold" },

  groupCard: { borderRadius: 22, padding: 20 },
  toolRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  toolIcon: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  toolLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  toolDesc: { fontSize: 12, lineHeight: 17, fontFamily: "Inter_400Regular" },

  tierRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
    shadowColor: "#002631",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  tierIcon: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  tierLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  tierDesc: { fontSize: 12, lineHeight: 17, fontFamily: "Inter_400Regular" },
  tierBadgePill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
  },
  tierBadgeText: { fontSize: 10, fontWeight: "700", letterSpacing: 0.8 },

  caseRow: { flexDirection: "row", alignItems: "center", gap: 14, borderRadius: 18, padding: 16 },

  disclaimer: { fontSize: 11, textAlign: "center", lineHeight: 17, paddingTop: 4, fontFamily: "Inter_400Regular" },

  modalOverlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center", alignItems: "center", padding: 24,
  },
  modalCard: { borderRadius: 20, padding: 24, width: "100%", maxWidth: 360, gap: 12 },
  modalIconWrap: {
    width: 48, height: 48, borderRadius: 14,
    alignItems: "center", justifyContent: "center", alignSelf: "flex-start",
  },
  modalTitle: { fontSize: 20, lineHeight: 26 },
  modalBody: { fontSize: 14, lineHeight: 21 },
  modalActions: { flexDirection: "row", gap: 10, marginTop: 4 },
  modalCancel: { flex: 1, borderRadius: 12, paddingVertical: 13, alignItems: "center" },
  modalCancelText: { fontSize: 14 },
  modalConfirm: { flex: 1, borderRadius: 12, paddingVertical: 13, alignItems: "center" },
  modalConfirmText: { color: "#fff", fontSize: 14, fontWeight: "700" },
});
