import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Stack } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import DeadlineModal from "@/components/DeadlineModal";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

export default function TimelineScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { deadlines, toggleDeadline, removeDeadline } = useApp();
  const [showModal, setShowModal] = useState(false);
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const pending = deadlines.filter((d) => !d.completed);
  const completed = deadlines.filter((d) => d.completed);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title: "Deadlines",
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.foreground,
          headerShadowVisible: false,
          headerRight: () => (
            <Pressable onPress={() => setShowModal(true)} style={styles.addBtn}>
              <Ionicons name="add" size={24} color={colors.primary} />
            </Pressable>
          ),
        }}
      />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {deadlines.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={52} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              No Deadlines Yet
            </Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              Add your court deadlines to stay on top of your case. Tap the + button to get started.
            </Text>
            <TouchableOpacity
              style={[styles.addFirstBtn, { backgroundColor: colors.primary }]}
              onPress={() => setShowModal(true)}
            >
              <Text style={[styles.addFirstBtnText, { color: colors.primaryForeground }]}>
                Add First Deadline
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {pending.length > 0 && (
              <>
                <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
                  Upcoming ({pending.length})
                </Text>
                {pending.map((item) => (
                  <View
                    key={item.id}
                    style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
                  >
                    <Pressable
                      style={styles.checkArea}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        toggleDeadline(item.id);
                      }}
                    >
                      <View style={[styles.check, { borderColor: colors.primary }]}>
                      </View>
                    </Pressable>
                    <View style={styles.cardContent}>
                      <Text style={[styles.cardTitle, { color: colors.foreground }]}>
                        {item.title}
                      </Text>
                      <View style={[styles.dateBadge, { backgroundColor: "#dc262615" }]}>
                        <Ionicons name="time" size={12} color="#dc2626" />
                        <Text style={[styles.dateText, { color: "#dc2626" }]}>
                          {item.date}
                        </Text>
                      </View>
                      {!!item.description && (
                        <Text style={[styles.cardDesc, { color: colors.mutedForeground }]}>
                          {item.description}
                        </Text>
                      )}
                    </View>
                    <Pressable
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        removeDeadline(item.id);
                      }}
                      style={styles.deleteBtn}
                    >
                      <Ionicons name="trash-outline" size={16} color={colors.mutedForeground} />
                    </Pressable>
                  </View>
                ))}
              </>
            )}

            {completed.length > 0 && (
              <>
                <Text style={[styles.sectionLabel, { color: colors.mutedForeground, marginTop: 16 }]}>
                  Completed ({completed.length})
                </Text>
                {completed.map((item) => (
                  <View
                    key={item.id}
                    style={[styles.card, styles.cardDone, { backgroundColor: colors.muted, borderColor: colors.border }]}
                  >
                    <Pressable
                      style={styles.checkArea}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        toggleDeadline(item.id);
                      }}
                    >
                      <View style={[styles.check, styles.checkFilled, { backgroundColor: colors.success, borderColor: colors.success }]}>
                        <Ionicons name="checkmark" size={14} color="#fff" />
                      </View>
                    </Pressable>
                    <View style={styles.cardContent}>
                      <Text style={[styles.cardTitle, { color: colors.mutedForeground, textDecorationLine: "line-through" }]}>
                        {item.title}
                      </Text>
                      <Text style={[styles.dateText, { color: colors.mutedForeground }]}>
                        {item.date}
                      </Text>
                    </View>
                    <Pressable
                      onPress={() => removeDeadline(item.id)}
                      style={styles.deleteBtn}
                    >
                      <Ionicons name="trash-outline" size={16} color={colors.mutedForeground} />
                    </Pressable>
                  </View>
                ))}
              </>
            )}
          </>
        )}
      </ScrollView>

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => setShowModal(true)}
      >
        <Ionicons name="add" size={28} color={colors.primaryForeground} />
      </TouchableOpacity>

      <DeadlineModal visible={showModal} onClose={() => setShowModal(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 16, gap: 10 },
  addBtn: { padding: 4 },
  emptyState: {
    alignItems: "center",
    paddingTop: 80,
    gap: 12,
    paddingHorizontal: 20,
  },
  emptyTitle: { fontSize: 22, fontWeight: "700" },
  emptyText: { fontSize: 14, textAlign: "center", lineHeight: 20 },
  addFirstBtn: { borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12, marginTop: 8 },
  addFirstBtnText: { fontSize: 16, fontWeight: "700" },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 12,
  },
  cardDone: { opacity: 0.7 },
  checkArea: { paddingTop: 2 },
  check: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  checkFilled: { borderWidth: 0 },
  cardContent: { flex: 1, gap: 6 },
  cardTitle: { fontSize: 15, fontWeight: "600" },
  cardDesc: { fontSize: 13, lineHeight: 18 },
  dateBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  dateText: { fontSize: 12, fontWeight: "600" },
  deleteBtn: { padding: 4 },
  fab: {
    position: "absolute",
    bottom: 100,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
});
