import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, Stack } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

interface ResourceItem {
  title: string;
  subtitle: string;
  url: string;
  icon: keyof typeof Ionicons.glyphMap;
  category: "legal-aid" | "court" | "support" | "information";
  phone?: string;
}

const RESOURCES: ResourceItem[] = [
  {
    title: "Legal Aid Ontario",
    subtitle: "Free or low-cost legal help for those who qualify",
    url: "https://www.legalaid.on.ca",
    icon: "shield-outline",
    category: "legal-aid",
    phone: "1-800-668-8258",
  },
  {
    title: "Family Law Information Centre",
    subtitle: "Located at Ontario courthouses — free information from staff",
    url: "https://ontariocourtforms.on.ca",
    icon: "business-outline",
    category: "court",
  },
  {
    title: "Ontario Court Forms",
    subtitle: "Download all official Ontario family court forms",
    url: "https://ontariocourtforms.on.ca/en/family-law-rules-forms/",
    icon: "document-text-outline",
    category: "court",
  },
  {
    title: "Steps to Justice",
    subtitle: "Plain-language guides to Ontario family law",
    url: "https://stepstojustice.ca/legal-topic/family-law/",
    icon: "footsteps-outline",
    category: "information",
  },
  {
    title: "Family Responsibility Office (FRO)",
    subtitle: "Enforces court-ordered child and spousal support",
    url: "https://www.ontario.ca/page/family-responsibility-office",
    icon: "cash-outline",
    category: "support",
    phone: "1-800-267-4330",
  },
  {
    title: "Ontario Ministry of the Attorney General",
    subtitle: "Official family law resources and court information",
    url: "https://www.ontario.ca/page/family-law",
    icon: "library-outline",
    category: "information",
  },
  {
    title: "Duty Counsel",
    subtitle: "Free same-day legal advice at courthouses",
    url: "https://www.legalaid.on.ca/legal-aid-services/duty-counsel/",
    icon: "person-outline",
    category: "legal-aid",
  },
  {
    title: "Victim Services Toronto",
    subtitle: "Support for survivors of domestic violence in family cases",
    url: "https://victimservicestoronto.com",
    icon: "heart-outline",
    category: "support",
    phone: "416-808-7066",
  },
  {
    title: "Law Society of Ontario — Find a Lawyer",
    subtitle: "Search for licensed Ontario family lawyers",
    url: "https://lso.ca/public-resources/finding-a-lawyer-or-paralegal",
    icon: "search-outline",
    category: "legal-aid",
  },
];

const CATEGORY_CONFIG = {
  "legal-aid": { label: "Legal Aid", color: "#1a4b8c", bg: "#1a4b8c15" },
  court: { label: "Court Resources", color: "#7c3aed", bg: "#7c3aed15" },
  support: { label: "Support Services", color: "#16a34a", bg: "#16a34a15" },
  information: { label: "Information", color: "#0891b2", bg: "#0891b215" },
};

function ResourceCard({ resource }: { resource: ResourceItem }) {
  const colors = useColors();
  const config = CATEGORY_CONFIG[resource.category];

  const handleOpen = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await WebBrowser.openBrowserAsync(resource.url);
  };

  return (
    <Pressable
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={handleOpen}
    >
      <View style={[styles.iconBadge, { backgroundColor: config.bg }]}>
        <Ionicons name={resource.icon} size={22} color={config.color} />
      </View>
      <View style={styles.cardContent}>
        <View style={styles.cardTop}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>
            {resource.title}
          </Text>
          <View style={[styles.catBadge, { backgroundColor: config.bg }]}>
            <Text style={[styles.catText, { color: config.color }]}>{config.label}</Text>
          </View>
        </View>
        <Text style={[styles.cardSubtitle, { color: colors.mutedForeground }]}>
          {resource.subtitle}
        </Text>
        {resource.phone && (
          <View style={styles.phoneRow}>
            <Ionicons name="call-outline" size={14} color={colors.mutedForeground} />
            <Text style={[styles.phone, { color: colors.primary }]}>{resource.phone}</Text>
          </View>
        )}
      </View>
      <Ionicons name="open-outline" size={16} color={colors.mutedForeground} />
    </Pressable>
  );
}

const QUICK_TOOLS = [
  {
    icon: "chatbubble-ellipses-outline" as const,
    label: "Ask the AI Assistant",
    desc: "Plain-language answers about your documents and deadlines",
    route: "/(tabs)/assistant" as const,
  },
  {
    icon: "document-text-outline" as const,
    label: "Browse Court Forms",
    desc: "Understand what each Ontario family court form is for",
    route: "/(tabs)/forms" as const,
  },
];

export default function ResourcesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { hasOnboarded, resetCase } = useApp();
  const [confirmVisible, setConfirmVisible] = useState(false);
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const grouped = Object.entries(CATEGORY_CONFIG).map(([key, config]) => ({
    key: key as ResourceItem["category"],
    label: config.label,
    resources: RESOURCES.filter((r) => r.category === key),
  }));

  const handleConfirmReset = () => {
    setConfirmVisible(false);
    resetCase();
    router.replace("/(tabs)/");
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title: "Resources & Tools",
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.foreground,
          headerShadowVisible: false,
        }}
      />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Demo banner */}
        <View style={[styles.demoBanner, { backgroundColor: "#f0fdf4", borderColor: "#86efac" }]}>
          <Ionicons name="flask-outline" size={16} color="#16a34a" />
          <Text style={[styles.demoBannerText, { color: "#166534" }]}>
            Open demo — all features unlocked. Payment not active in this version.
          </Text>
        </View>

        {/* Quick tools */}
        <Text style={[styles.groupLabel, { color: colors.mutedForeground }]}>Quick Tools</Text>
        <View style={[styles.toolsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {QUICK_TOOLS.map((tool, i) => (
            <Pressable
              key={tool.label}
              style={({ pressed }) => [
                styles.toolRow,
                i < QUICK_TOOLS.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: 14, marginBottom: 14 },
                { opacity: pressed ? 0.8 : 1 },
              ]}
              onPress={() => router.push(tool.route)}
            >
              <View style={[styles.toolIcon, { backgroundColor: colors.primary + "12" }]}>
                <Ionicons name={tool.icon} size={20} color={colors.primary} />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={[styles.toolLabel, { color: colors.foreground }]}>{tool.label}</Text>
                <Text style={[styles.toolDesc, { color: colors.mutedForeground }]}>{tool.desc}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.outline} />
            </Pressable>
          ))}
        </View>

        {/* Legal resources */}
        <View style={[styles.banner, { backgroundColor: colors.primary + "15", borderColor: colors.primary + "30" }]}>
          <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
          <Text style={[styles.bannerText, { color: colors.foreground }]}>
            These are trusted Ontario resources. Always consult a licensed lawyer for advice specific to your situation.
          </Text>
        </View>

        {grouped.map((group) => (
          <View key={group.key}>
            <Text style={[styles.groupLabel, { color: colors.mutedForeground }]}>
              {group.label}
            </Text>
            {group.resources.map((r) => (
              <ResourceCard key={r.title} resource={r} />
            ))}
          </View>
        ))}

        {/* Case management */}
        {hasOnboarded && (
          <View style={{ gap: 8, marginTop: 8 }}>
            <Text style={[styles.groupLabel, { color: colors.mutedForeground }]}>My Case</Text>
            <Pressable
              style={({ pressed }) => [
                styles.card,
                { backgroundColor: colors.card, borderColor: "#fecaca", opacity: pressed ? 0.82 : 1 },
              ]}
              onPress={() => setConfirmVisible(true)}
            >
              <View style={[styles.iconBadge, { backgroundColor: "#fee2e2" }]}>
                <Ionicons name="refresh-outline" size={22} color="#dc2626" />
              </View>
              <View style={styles.cardContent}>
                <Text style={[styles.cardTitle, { color: "#dc2626" }]}>Start a new case</Text>
                <Text style={[styles.cardSubtitle, { color: colors.mutedForeground }]}>
                  Clear your current case and begin fresh
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
            </Pressable>
          </View>
        )}

        <Text style={[styles.groupLabel, { color: colors.outline, textAlign: "center", marginTop: 8 }]}>
          General information only — not legal advice.
        </Text>
      </ScrollView>

      {/* Confirm reset modal */}
      <Modal transparent visible={confirmVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Start a new case?</Text>
            <Text style={[styles.modalBody, { color: colors.mutedForeground }]}>
              This will clear your current case — your role, issues, deadlines, and conversation history. This cannot be undone.
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalCancel, { backgroundColor: colors.secondary }]}
                onPress={() => setConfirmVisible(false)}
              >
                <Text style={[styles.modalCancelText, { color: colors.foreground }]}>Keep my case</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalConfirm, { backgroundColor: "#dc2626" }]}
                onPress={handleConfirmReset}
              >
                <Text style={styles.modalConfirmText}>Start fresh</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 16, gap: 8 },

  demoBanner: { flexDirection: "row", gap: 8, padding: 12, borderRadius: 12, borderWidth: 1, alignItems: "flex-start", marginBottom: 4 },
  demoBannerText: { flex: 1, fontSize: 12, lineHeight: 18 },

  toolsCard: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 4 },
  toolRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  toolIcon: { width: 42, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  toolLabel: { fontSize: 14, fontWeight: "700" },
  toolDesc: { fontSize: 12, lineHeight: 17 },

  banner: {
    flexDirection: "row",
    gap: 10,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "flex-start",
    marginBottom: 8,
  },
  bannerText: { flex: 1, fontSize: 13, lineHeight: 18 },
  groupLabel: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 12,
    marginBottom: 8,
  },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)", justifyContent: "center", alignItems: "center", padding: 24 },
  modalCard: { borderRadius: 20, padding: 24, width: "100%", maxWidth: 360, gap: 12 },
  modalTitle: { fontSize: 18, fontWeight: "700" },
  modalBody: { fontSize: 14, lineHeight: 21 },
  modalActions: { flexDirection: "row", gap: 10, marginTop: 4 },
  modalCancel: { flex: 1, borderRadius: 12, paddingVertical: 13, alignItems: "center" },
  modalCancelText: { fontWeight: "600", fontSize: 14 },
  modalConfirm: { flex: 1, borderRadius: 12, paddingVertical: 13, alignItems: "center" },
  modalConfirmText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 8,
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cardContent: { flex: 1, gap: 4 },
  cardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
  },
  cardTitle: { fontSize: 14, fontWeight: "700", flex: 1 },
  catBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  catText: { fontSize: 11, fontWeight: "600" },
  cardSubtitle: { fontSize: 13, lineHeight: 18 },
  phoneRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 2 },
  phone: { fontSize: 13, fontWeight: "600" },
});
