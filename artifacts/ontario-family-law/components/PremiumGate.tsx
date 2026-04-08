import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View, useColorScheme } from "react-native";

import { useColors } from "@/hooks/useColors";
import { TIER_CONFIG, type Tier } from "@/lib/tiers";

interface PremiumGateProps {
  featureName: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  tier?: Tier; // which tier is required — defaults to drafting_help
}

export function PremiumGate({ featureName, description, icon, tier = "drafting_help" }: PremiumGateProps) {
  const colors = useColors();
  const isDark = useColorScheme() === "dark";
  const tierConfig = TIER_CONFIG[tier];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[styles.iconCircle, { backgroundColor: tierConfig.badgeColor + "18" }]}>
          <Ionicons name={icon} size={36} color={tierConfig.badgeColor} />
        </View>

        <View style={[styles.badge, { backgroundColor: tierConfig.badgeColor + "18" }]}>
          <Text style={[styles.badgeText, { color: tierConfig.badgeColor }]}>{tierConfig.badge}</Text>
        </View>

        <Text style={[styles.title, { color: colors.foreground }]}>{featureName}</Text>
        <Text style={[styles.description, { color: colors.mutedForeground }]}>{description}</Text>

        <View style={styles.tierInfo}>
          <Text style={[styles.tierRequired, { color: colors.mutedForeground }]}>
            Included in
          </Text>
          <Text style={[styles.tierName, { color: tierConfig.badgeColor }]}>
            {tierConfig.name}
          </Text>
          <Text style={[styles.tierPrice, { color: colors.foreground }]}>
            {tierConfig.price}
            <Text style={[styles.tierPriceNote, { color: colors.mutedForeground }]}> {tierConfig.priceNote}</Text>
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.btn, { backgroundColor: tierConfig.badgeColor }]}
          onPress={() => router.push({ pathname: "/paywall", params: { tier } })}
        >
          <Ionicons name="arrow-forward-circle-outline" size={18} color="#fff" />
          <Text style={styles.btnText}>See {tierConfig.name}</Text>
        </TouchableOpacity>

        <Text style={[styles.sub, { color: colors.mutedForeground }]}>
          {tierConfig.priceNote === "one-time" ? "One-time payment · no subscription" : tierConfig.priceNote}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  card: {
    width: "100%",
    maxWidth: 380,
    borderRadius: 22,
    padding: 28,
    alignItems: "center",
    borderWidth: 1,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: { fontSize: 10, fontWeight: "700", letterSpacing: 1.5 },
  title: { fontSize: 20, fontWeight: "800", textAlign: "center" },
  description: { fontSize: 14, textAlign: "center", lineHeight: 21 },
  tierInfo: { alignItems: "center", gap: 2 },
  tierRequired: { fontSize: 12 },
  tierName: { fontSize: 16, fontWeight: "700" },
  tierPrice: { fontSize: 18, fontWeight: "800" },
  tierPriceNote: { fontSize: 13, fontWeight: "400" },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 14,
    marginTop: 4,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  sub: { fontSize: 12 },
});
