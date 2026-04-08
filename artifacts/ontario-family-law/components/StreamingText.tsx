import React from "react";
import { Text, StyleSheet, useColorScheme } from "react-native";
import { useColors } from "@/hooks/useColors";

interface StreamingTextProps {
  text: string;
  style?: any;
}

export function StreamingText({ text, style }: StreamingTextProps) {
  const colors = useColors();

  return (
    <Text style={[styles.text, { color: colors.foreground }, style]}>
      {text}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: { fontSize: 14, lineHeight: 22 },
});
