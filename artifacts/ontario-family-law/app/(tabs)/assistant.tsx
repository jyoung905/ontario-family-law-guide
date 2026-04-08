import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

import AssistantChat from "@/components/AssistantChat";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

export default function AssistantScreen() {
  const colors = useColors();
  const { clearMessages } = useApp();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title: "Ask the Assistant",
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.foreground,
          headerShadowVisible: false,
          headerRight: () => (
            <Pressable onPress={clearMessages} style={styles.clearBtn}>
              <Ionicons name="trash-outline" size={20} color={colors.mutedForeground} />
            </Pressable>
          ),
        }}
      />
      <AssistantChat />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  clearBtn: { padding: 4 },
});
