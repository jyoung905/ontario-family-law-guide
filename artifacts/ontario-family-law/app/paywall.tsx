import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { useSubscription } from "@/lib/revenuecat";
import { PREP_PACKS, TIER_CONFIG, TIER_ORDER, type Tier } from "@/lib/tiers";

export default function PaywallScreen() {
  const colors = useColors();
  const isDark = useColorScheme() === "dark";
  const { tier: tierParam } = useLocalSearchParams<{ tier?: Tier }>();
  const { offerings, purchase, isPurchasing, restore, isRestoring } = useSubscription();
  const scrollRef = useRef<ScrollView>(null);

  const [confirmTier, setConfirmTier] = useState<Tier | null>(null);
  const [restoredVisible, setRestoredVisible] = useState(false);
  const [restoredSuccess, setRestoredSuccess] = useState(false);

  const pkg = offerings?.current?.availablePackages[0];

  const handlePurchaseIntent = (tier: Tier) => setConfirmTier(tier);

  const confirmPurchase = async () => {
    if (!pkg || !confirmTier) return;
    setConfirmTier(null);
    try {
      await purchase(pkg);
      router.back();
    } catch (e: any) {
      if (!e?.userCancelled) console.error("Purchase error:", e);
    }
  };

  const handleRestore = async () => {
    try {
      const info = await restore();
      const active = (info as any)?.entitlements?.active ?? {};
      setRestoredSuccess(Object.keys(active).length > 0);
    } catch {
      setRestoredSuccess(false);
    }
    setRestoredVisible(true);
  };

  const s = styles(colors, isDark);
  const focusedTier = tierParam && TIER_CONFIG[tierParam] ? tierParam : null;
  const confirmingConfig = confirmTier ? TIER_CONFIG[confirmTier] : null;

  return (
    <SafeAreaView style={s.safe}>
      <TouchableOpacity style={s.closeBtn} onPress={() => router.back()}>
        <Ionicons name="close" size={26} color={colors.mutedForeground} />
      </TouchableOpacity>

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={s.header}>
          <Text style={[s.headline, { color: colors.foreground }]}>
            Get the help{"\n"}you need
          </Text>
          <Text style={[s.subhead, { color: colors.mutedForeground }]}>
            {focusedTier
              ? `This feature is included in ${TIER_CONFIG[focusedTier].name}.`
              : "Free helps you understand and organize. Paid helps you prepare and produce."}
          </Text>
        </View>

        {/* Free tier reminder */}
        <View style={[s.freeTier, { backgroundColor: colors.surfaceContainerLow, borderColor: colors.outlineVariant }]}>
          <View style={[s.tierBadge, { backgroundColor: "#16a34a18" }]}>
            <Text style={[s.tierBadgeText, { color: "#16a34a" }]}>FREE</Text>
          </View>
          <Text style={[s.freeTierTitle, { color: colors.foreground }]}>What you already have</Text>
          {["Intake wizard & case overview", "Document analysis", "Personalized checklist", "Deadline tracking", "Basic AI chat", "Legal resources"].map((f) => (
            <View key={f} style={s.freeFeatureRow}>
              <Ionicons name="checkmark" size={14} color="#16a34a" />
              <Text style={[s.freeFeatureText, { color: colors.mutedForeground }]}>{f}</Text>
            </View>
          ))}
        </View>

        <Text style={[s.sectionLabel, { color: colors.mutedForeground }]}>Paid tiers</Text>

        {/* Tier cards */}
        {TIER_ORDER.map((tierId) => {
          const t = TIER_CONFIG[tierId];
          const isFocused = focusedTier === tierId;
          const isDrafting = tierId === "drafting_help";
          const isPrepPack = tierId === "prep_pack";

          return (
            <View
              key={tierId}
              style={[
                s.tierCard,
                isDrafting && s.tierCardDrafting,
                isFocused && s.tierCardFocused,
                {
                  backgroundColor: isDrafting
                    ? colors.primary
                    : colors.surfaceContainerLow,
                  borderColor: isFocused
                    ? t.badgeColor
                    : isDrafting
                    ? colors.primary
                    : colors.outlineVariant,
                },
              ]}
            >
              {/* Badge */}
              <View style={[s.tierBadge, { backgroundColor: t.badgeColor + (isDrafting ? "30" : "18") }]}>
                <Text style={[s.tierBadgeText, { color: isDrafting ? "#a8d4e0" : t.badgeColor }]}>
                  {t.badge}
                </Text>
              </View>

              {isFocused && (
                <View style={[s.focusedBanner, { backgroundColor: t.badgeColor + "18", borderColor: t.badgeColor + "40" }]}>
                  <Ionicons name="arrow-up-circle" size={14} color={t.badgeColor} />
                  <Text style={[s.focusedBannerText, { color: t.badgeColor }]}>
                    You need this tier to access the feature
                  </Text>
                </View>
              )}

              <Text style={[s.tierName, { color: isDrafting ? "#fff" : colors.foreground }]}>
                {t.name}
              </Text>
              <Text style={[s.tierTagline, { color: isDrafting ? "rgba(255,255,255,0.75)" : colors.mutedForeground }]}>
                {t.tagline}
              </Text>

              {/* Features */}
              <View style={s.featureList}>
                {t.features.map((f) => (
                  <View key={f} style={s.featureRow}>
                    <Ionicons
                      name="checkmark-circle"
                      size={16}
                      color={isDrafting ? "rgba(255,255,255,0.6)" : t.badgeColor}
                    />
                    <Text style={[s.featureText, { color: isDrafting ? "rgba(255,255,255,0.85)" : colors.foreground }]}>
                      {f}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Prep pack chips */}
              {isPrepPack && (
                <View style={s.packGrid}>
                  {PREP_PACKS.map((pack) => (
                    <View key={pack.id} style={[s.packChip, { backgroundColor: "#7c3aed12", borderColor: "#7c3aed30" }]}>
                      <Ionicons name={pack.icon as any} size={13} color="#7c3aed" />
                      <Text style={[s.packChipName, { color: colors.foreground }]}>{pack.name}</Text>
                      <Text style={[s.packChipPrice, { color: "#7c3aed" }]}>{pack.price}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Price + CTA */}
              <View style={s.tierPricing}>
                <Text style={[s.tierPrice, { color: isDrafting ? "#fff" : colors.foreground }]}>
                  {t.price}
                </Text>
                <Text style={[s.tierPriceNote, { color: isDrafting ? "rgba(255,255,255,0.6)" : colors.mutedForeground }]}>
                  {t.priceNote}
                </Text>
              </View>

              <TouchableOpacity
                style={[
                  s.ctaBtn,
                  {
                    backgroundColor: isDrafting ? "#fff" : t.badgeColor,
                    opacity: isPurchasing ? 0.6 : 1,
                  },
                ]}
                onPress={() => handlePurchaseIntent(tierId)}
                disabled={isPurchasing || !pkg}
              >
                {isPurchasing ? (
                  <ActivityIndicator color={isDrafting ? colors.primary : "#fff"} />
                ) : (
                  <Text style={[s.ctaBtnText, { color: isDrafting ? colors.primary : "#fff" }]}>
                    Get {t.name} — {t.price}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          );
        })}

        {/* Disclaimer */}
        <View style={[s.disclaimer, { backgroundColor: isDark ? "#1e2d4a" : "#f0f4ff", borderColor: isDark ? "#1e3a5f" : "#bfdbfe" }]}>
          <Ionicons name="information-circle-outline" size={15} color={colors.mutedForeground} />
          <Text style={[s.disclaimerText, { color: colors.mutedForeground }]}>
            All documents are drafts for your review only. This app does not provide legal advice. Always consult a licensed lawyer.
          </Text>
        </View>

        <TouchableOpacity style={s.restoreBtn} onPress={handleRestore} disabled={isRestoring}>
          {isRestoring ? (
            <ActivityIndicator color={colors.mutedForeground} size="small" />
          ) : (
            <Text style={[s.restoreBtnText, { color: colors.mutedForeground }]}>Restore purchases</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Purchase confirmation modal */}
      <Modal transparent visible={!!confirmTier} animationType="fade">
        <View style={s.modalOverlay}>
          <View style={[s.modalCard, { backgroundColor: colors.card }]}>
            <Text style={[s.modalTitle, { color: colors.foreground }]}>Confirm Purchase</Text>
            <Text style={[s.modalBody, { color: colors.mutedForeground }]}>
              {confirmingConfig
                ? `You're about to purchase ${confirmingConfig.name} for ${confirmingConfig.price} (${confirmingConfig.priceNote}) using the test store.`
                : ""}
            </Text>
            <View style={s.modalActions}>
              <TouchableOpacity style={[s.modalCancel, { backgroundColor: colors.secondary }]} onPress={() => setConfirmTier(null)}>
                <Text style={[s.modalCancelText, { color: colors.foreground }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.modalConfirm, { backgroundColor: colors.primary }]} onPress={confirmPurchase}>
                <Text style={s.modalConfirmText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Restore result modal */}
      <Modal transparent visible={restoredVisible} animationType="fade">
        <View style={s.modalOverlay}>
          <View style={[s.modalCard, { backgroundColor: colors.card }]}>
            <Text style={[s.modalTitle, { color: colors.foreground }]}>
              {restoredSuccess ? "Purchases Restored" : "Nothing Found"}
            </Text>
            <Text style={[s.modalBody, { color: colors.mutedForeground }]}>
              {restoredSuccess
                ? "Your purchases have been restored successfully."
                : "No active purchases found for this account."}
            </Text>
            <TouchableOpacity
              style={[s.modalConfirm, { backgroundColor: colors.primary }]}
              onPress={() => { setRestoredVisible(false); if (restoredSuccess) router.back(); }}
            >
              <Text style={s.modalConfirmText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = (colors: any, isDark: boolean) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    closeBtn: { position: "absolute", top: 56, right: 20, zIndex: 10, padding: 4 },
    scroll: { padding: 22, paddingTop: 56, paddingBottom: 60, gap: 14 },

    header: { alignItems: "center", paddingTop: 10, paddingBottom: 8, gap: 10 },
    headline: { fontSize: 30, fontWeight: "800", textAlign: "center", lineHeight: 36 },
    subhead: { fontSize: 14, textAlign: "center", lineHeight: 21 },

    // Free tier
    freeTier: {
      borderRadius: 20,
      borderWidth: 1,
      padding: 18,
      gap: 8,
    },
    freeTierTitle: { fontSize: 14, fontWeight: "700", marginBottom: 2 },
    freeFeatureRow: { flexDirection: "row", alignItems: "center", gap: 8 },
    freeFeatureText: { fontSize: 13 },

    sectionLabel: {
      fontSize: 10,
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 1.4,
      textAlign: "center",
    },

    // Tier cards
    tierCard: {
      borderRadius: 22,
      borderWidth: 1.5,
      padding: 22,
      gap: 12,
    },
    tierCardDrafting: {
      shadowColor: "#002631",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.25,
      shadowRadius: 20,
      elevation: 8,
    },
    tierCardFocused: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 12,
      elevation: 4,
    },

    tierBadge: {
      alignSelf: "flex-start",
      paddingHorizontal: 10,
      paddingVertical: 3,
      borderRadius: 20,
    },
    tierBadgeText: { fontSize: 10, fontWeight: "700", letterSpacing: 1.2 },

    focusedBanner: {
      flexDirection: "row",
      alignItems: "center",
      gap: 7,
      borderRadius: 10,
      borderWidth: 1,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    focusedBannerText: { fontSize: 12, fontWeight: "600" },

    tierName: { fontSize: 22, fontWeight: "800" },
    tierTagline: { fontSize: 13, lineHeight: 19, marginTop: -4 },

    featureList: { gap: 8 },
    featureRow: { flexDirection: "row", alignItems: "flex-start", gap: 9 },
    featureText: { flex: 1, fontSize: 13, lineHeight: 19 },

    // Prep pack chips
    packGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    packChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 10,
      borderWidth: 1,
    },
    packChipName: { fontSize: 12, fontWeight: "600" },
    packChipPrice: { fontSize: 11, fontWeight: "700" },

    tierPricing: { flexDirection: "row", alignItems: "baseline", gap: 6 },
    tierPrice: { fontSize: 26, fontWeight: "800" },
    tierPriceNote: { fontSize: 13 },

    ctaBtn: {
      borderRadius: 14,
      paddingVertical: 15,
      alignItems: "center",
    },
    ctaBtnText: { fontSize: 16, fontWeight: "700" },

    disclaimer: {
      flexDirection: "row",
      gap: 8,
      borderRadius: 12,
      borderWidth: 1,
      padding: 12,
      marginTop: 4,
    },
    disclaimerText: { flex: 1, fontSize: 12, lineHeight: 18 },

    restoreBtn: { alignItems: "center", paddingVertical: 12 },
    restoreBtnText: { fontSize: 13 },

    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.55)",
      justifyContent: "center",
      alignItems: "center",
      padding: 24,
    },
    modalCard: { borderRadius: 18, padding: 24, width: "100%", maxWidth: 360 },
    modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 10 },
    modalBody: { fontSize: 14, lineHeight: 21, marginBottom: 20 },
    modalActions: { flexDirection: "row", gap: 12 },
    modalCancel: { flex: 1, borderRadius: 10, paddingVertical: 12, alignItems: "center" },
    modalCancelText: { fontWeight: "600" },
    modalConfirm: { flex: 1, borderRadius: 10, paddingVertical: 12, alignItems: "center" },
    modalConfirmText: { color: "#fff", fontWeight: "700" },
  });
