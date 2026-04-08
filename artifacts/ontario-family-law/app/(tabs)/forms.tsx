import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { FormCard, FormInfo } from "@/components/FormCard";
import { useColors } from "@/hooks/useColors";

const FORMS: FormInfo[] = [
  {
    number: "Form 8",
    title: "Application (General)",
    purpose:
      "The document that starts a family court case. The applicant uses this to ask the court for orders about divorce, parenting time, support, or property.",
    deadline: "No deadline for filing — but the other party has 30 days to respond once served.",
    tip: "You must serve Form 8 on the other party before filing it with the court.",
    category: "application",
  },
  {
    number: "Form 8A",
    title: "Application (Divorce)",
    purpose:
      "Used specifically when seeking a divorce. Similar to Form 8 but for divorce proceedings.",
    tip: "Canada's Divorce Act applies here. You must meet the one-year separation requirement unless claiming fault.",
    category: "application",
  },
  {
    number: "Form 10",
    title: "Answer",
    purpose:
      "The response to a Form 8 or 8A Application. Use this to tell the court your position and what orders you want.",
    deadline: "30 days from the date you were served with the application.",
    tip: "If you miss this deadline, the other side may ask the court to proceed without your input — this is called being 'noted in default.'",
    category: "response",
  },
  {
    number: "Form 14",
    title: "Notice of Motion",
    purpose:
      "Used to bring a motion asking the court for an order. A motion is a request made to the court during a case.",
    tip: "Must be served on the other party at least 4 days before the motion date (or longer if required).",
    category: "motion",
  },
  {
    number: "Form 14A",
    title: "Affidavit (General)",
    purpose:
      "A written statement sworn to be true. Used to support a motion or provide evidence to the court.",
    tip: "An affidavit is your sworn testimony in writing. Everything in it must be true — you sign it before a commissioner.",
    category: "motion",
  },
  {
    number: "Form 14B",
    title: "Motion Form",
    purpose:
      "A simplified motion form used when seeking a consent order or to change a final order without a full hearing.",
    tip: "Used in motions to change — for example, changing a child support amount due to changed circumstances.",
    category: "motion",
  },
  {
    number: "Form 15",
    title: "Change Information Form",
    purpose:
      "Used when you want to change a final order. You must show that there has been a material change in circumstances.",
    deadline: "File as soon as possible after the change in circumstances occurs.",
    tip: "You must explain clearly what has changed since the original order was made.",
    category: "motion",
  },
  {
    number: "Form 15A",
    title: "Change Request Affidavit",
    purpose:
      "Sworn statement supporting a motion to change. Sets out your facts and reasons for requesting the change.",
    category: "motion",
  },
  {
    number: "Form 35.1",
    title: "Affidavit in Support of Claim for Decision-Making Responsibility / Parenting Time",
    purpose:
      "Required when making claims about parenting (formerly custody and access). Sets out your parenting history and arrangements.",
    tip: "Both parents typically must file this form. It includes information about the child's home, school, and relationships.",
    category: "parenting",
  },
  {
    number: "Form 13",
    title: "Financial Statement (Support Claims)",
    purpose:
      "Required for child support or spousal support claims. Shows your income, expenses, assets, and debts.",
    deadline: "Usually required within 30 days of service, or as ordered by the court.",
    tip: "Must be based on your actual income and expenses. Include all sources of income, not just employment.",
    category: "financial",
  },
  {
    number: "Form 13.1",
    title: "Financial Statement (Property and Support Claims)",
    purpose:
      "An expanded financial statement used when property division is also in dispute. More detailed than Form 13.",
    tip: "Valuation date is typically the date of marriage and the date of separation. Keep your documents.",
    category: "financial",
  },
];

const CATEGORIES = [
  { id: "all", label: "All Forms" },
  { id: "application", label: "Applications" },
  { id: "response", label: "Responses" },
  { id: "motion", label: "Motions" },
  { id: "financial", label: "Financial" },
  { id: "parenting", label: "Parenting" },
];

export default function FormsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const filtered = FORMS.filter((f) => {
    const matchesCategory = activeCategory === "all" || f.category === activeCategory;
    const matchesSearch =
      !search ||
      f.number.toLowerCase().includes(search.toLowerCase()) ||
      f.title.toLowerCase().includes(search.toLowerCase()) ||
      f.purpose.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title: "Court Forms",
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.foreground,
          headerShadowVisible: false,
        }}
      />

      <View style={[styles.searchWrapper, { backgroundColor: colors.background }]}>
        <View style={[styles.searchBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="search" size={18} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder="Search forms..."
            placeholderTextColor={colors.mutedForeground}
            value={search}
            onChangeText={setSearch}
          />
          {!!search && (
            <Pressable onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={18} color={colors.mutedForeground} />
            </Pressable>
          )}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.catScroll}
        >
          {CATEGORIES.map((cat) => (
            <Pressable
              key={cat.id}
              style={[
                styles.catChip,
                {
                  backgroundColor:
                    activeCategory === cat.id ? colors.primary : colors.secondary,
                  borderColor:
                    activeCategory === cat.id ? colors.primary : colors.border,
                },
              ]}
              onPress={() => setActiveCategory(cat.id)}
            >
              <Text
                style={[
                  styles.catChipText,
                  {
                    color:
                      activeCategory === cat.id
                        ? colors.primaryForeground
                        : colors.foreground,
                  },
                ]}
              >
                {cat.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={[styles.list, { paddingBottom: bottomPad + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {filtered.length === 0 ? (
          <View style={styles.noResults}>
            <Ionicons name="search" size={36} color={colors.mutedForeground} />
            <Text style={[styles.noResultsText, { color: colors.mutedForeground }]}>
              No forms found
            </Text>
          </View>
        ) : (
          filtered.map((form) => <FormCard key={form.number} form={form} />)
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchWrapper: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4, gap: 10 },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  searchInput: { flex: 1, fontSize: 15 },
  catScroll: { gap: 8, paddingBottom: 8 },
  catChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  catChipText: { fontSize: 13, fontWeight: "600" },
  list: { paddingHorizontal: 16, paddingTop: 12 },
  noResults: { alignItems: "center", paddingTop: 60, gap: 12 },
  noResultsText: { fontSize: 15 },
});
