import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useRef, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

interface DeadlineModalProps {
  visible: boolean;
  onClose: () => void;
}

const QUICK_TEMPLATES = [
  { title: "Date I Was Served", description: "The date court documents were delivered to me — starts all response deadlines" },
  { title: "File Form 10 Answer", description: "Response to Form 8 Application — due 30 days after service" },
  { title: "File Form 15B", description: "Response to motion to change" },
  { title: "Exchange Financial Statements", description: "Form 13 or 13.1" },
  { title: "Case Conference", description: "First court appearance" },
  { title: "Motion Hearing", description: "Court motion date" },
  { title: "Settlement Conference", description: "Scheduled settlement conference" },
];

export default function DeadlineModal({ visible, onClose }: DeadlineModalProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addDeadline } = useApp();
  const scrollRef = useRef<ScrollView>(null);
  const dateRef = useRef<TextInput>(null);

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");

  const reset = () => {
    setTitle("");
    setDate("");
    setDescription("");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleAdd = () => {
    if (!title.trim() || !date.trim()) return;
    addDeadline({ title: title.trim(), date: date.trim(), description: description.trim() });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    reset();
    onClose();
  };

  const prefillFromTemplate = (item: (typeof QUICK_TEMPLATES)[0]) => {
    setTitle(item.title);
    setDescription(item.description);
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
      dateRef.current?.focus();
    }, 150);
  };

  const canAdd = title.trim().length > 0 && date.trim().length > 0;

  return (
    <Modal visible={visible} animationType="slide" transparent presentationStyle="formSheet">
      <View style={styles.overlay}>
        <View
          style={[
            styles.sheet,
            { backgroundColor: colors.background, paddingBottom: insets.bottom + 16 },
          ]}
        >
          <View style={styles.handle} />
          <View style={styles.header}>
            <Text style={[styles.sheetTitle, { color: colors.foreground }]}>Add Deadline</Text>
            <Pressable onPress={handleClose}>
              <Ionicons name="close" size={24} color={colors.mutedForeground} />
            </Pressable>
          </View>

          <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

            {/* Quick-fill templates */}
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
              Quick fill — tap to pre-fill the form
            </Text>
            <View style={styles.quickList}>
              {QUICK_TEMPLATES.map((item) => (
                <Pressable
                  key={item.title}
                  style={({ pressed }) => [
                    styles.quickItem,
                    {
                      backgroundColor: title === item.title ? colors.primary + "14" : colors.card,
                      borderColor: title === item.title ? colors.primary : colors.border,
                      opacity: pressed ? 0.75 : 1,
                    },
                  ]}
                  onPress={() => prefillFromTemplate(item)}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.quickTitle, { color: colors.foreground }]}>{item.title}</Text>
                    <Text style={[styles.quickDesc, { color: colors.mutedForeground }]}>{item.description}</Text>
                  </View>
                  <Ionicons
                    name={title === item.title ? "checkmark-circle" : "add-circle-outline"}
                    size={20}
                    color={title === item.title ? colors.primary : colors.outline}
                  />
                </Pressable>
              ))}
            </View>

            {/* Manual entry form */}
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
              Enter deadline details
            </Text>

            <View style={styles.form}>
              <TextInput
                style={[styles.inputField, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
                placeholder="Title (e.g., File Form 10)"
                placeholderTextColor={colors.mutedForeground}
                value={title}
                onChangeText={setTitle}
              />

              <View style={[styles.dateRow, { backgroundColor: colors.card, borderColor: date ? colors.primary : colors.border }]}>
                <Ionicons name="calendar-outline" size={18} color={date ? colors.primary : colors.mutedForeground} />
                <TextInput
                  ref={dateRef}
                  style={[styles.dateInput, { color: colors.foreground }]}
                  placeholder="Date — e.g. April 15, 2026"
                  placeholderTextColor={colors.mutedForeground}
                  value={date}
                  onChangeText={setDate}
                  returnKeyType="next"
                />
              </View>

              <TextInput
                style={[styles.inputField, styles.textArea, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
                placeholder="Notes (optional)"
                placeholderTextColor={colors.mutedForeground}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={2}
              />

              <TouchableOpacity
                style={[styles.addBtn, { backgroundColor: colors.primary, opacity: canAdd ? 1 : 0.4 }]}
                onPress={handleAdd}
                disabled={!canAdd}
              >
                <Text style={[styles.addBtnText, { color: colors.primaryForeground }]}>
                  Add Deadline
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingHorizontal: 20,
    maxHeight: "90%",
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: "#c0c0c0",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  sheetTitle: { fontSize: 20, fontWeight: "700" },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 10,
    marginTop: 4,
  },
  quickList: { gap: 8, marginBottom: 20 },
  quickItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  quickTitle: { fontSize: 14, fontWeight: "600" },
  quickDesc: { fontSize: 12, marginTop: 2 },
  form: { gap: 12, marginBottom: 20 },
  inputField: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  dateInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 10,
  },
  textArea: {
    height: 72,
    textAlignVertical: "top",
    paddingTop: 12,
  },
  addBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 4,
  },
  addBtnText: { fontSize: 16, fontWeight: "700" },
});
