import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";

export interface FormInfo {
  number: string;
  title: string;
  purpose: string;
  deadline?: string;
  tip?: string;
  category: "application" | "response" | "motion" | "financial" | "parenting";
}

interface FormCardProps {
  form: FormInfo;
}

const CATEGORY_ICONS: Record<FormInfo["category"], string> = {
  application: "document-text",
  response: "return-down-back",
  motion: "flash",
  financial: "cash",
  parenting: "people",
};

const CATEGORY_COLORS: Record<FormInfo["category"], string> = {
  application: "#1a4b8c",
  response: "#16a34a",
  motion: "#d97706",
  financial: "#7c3aed",
  parenting: "#0891b2",
};

export function FormCard({ form }: FormCardProps) {
  const colors = useColors();
  const [expanded, setExpanded] = useState(false);
  const catColor = CATEGORY_COLORS[form.category];

  return (
    <Pressable
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => setExpanded((v) => !v)}
    >
      <View style={styles.header}>
        <View style={[styles.iconBadge, { backgroundColor: catColor + "20" }]}>
          <Ionicons
            name={CATEGORY_ICONS[form.category] as "document-text"}
            size={18}
            color={catColor}
          />
        </View>
        <View style={styles.titleBlock}>
          <Text style={[styles.formNumber, { color: catColor }]}>{form.number}</Text>
          <Text style={[styles.formTitle, { color: colors.foreground }]}>{form.title}</Text>
        </View>
        <Ionicons
          name={expanded ? "chevron-up" : "chevron-down"}
          size={18}
          color={colors.mutedForeground}
        />
      </View>

      {expanded && (
        <View style={styles.details}>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>Purpose</Text>
          <Text style={[styles.value, { color: colors.foreground }]}>{form.purpose}</Text>

          {form.deadline && (
            <>
              <View style={[styles.deadlineBadge, { backgroundColor: "#dc262615" }]}>
                <Ionicons name="time" size={14} color="#dc2626" />
                <Text style={[styles.deadlineText, { color: "#dc2626" }]}>
                  {form.deadline}
                </Text>
              </View>
            </>
          )}

          {form.tip && (
            <View style={[styles.tip, { backgroundColor: colors.secondary }]}>
              <Ionicons name="bulb-outline" size={14} color={colors.accent} />
              <Text style={[styles.tipText, { color: colors.foreground }]}>{form.tip}</Text>
            </View>
          )}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
  },
  iconBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  titleBlock: {
    flex: 1,
  },
  formNumber: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  formTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginTop: 1,
  },
  details: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 14,
    lineHeight: 20,
  },
  deadlineBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 4,
  },
  deadlineText: {
    fontSize: 13,
    fontWeight: "600",
  },
  tip: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 4,
  },
  tipText: {
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
});
