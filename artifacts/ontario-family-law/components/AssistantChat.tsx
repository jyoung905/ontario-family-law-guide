import { Feather, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { fetch } from "expo/fetch";
import React, { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import colors from "@/constants/colors";

const BASE_URL = `https://${process.env.EXPO_PUBLIC_DOMAIN}`;

const SYSTEM_PROMPT = `You are a plain-language Ontario family law information assistant. You help people understand Ontario family court procedures, forms, and timelines.

IMPORTANT RULES:
- You are NOT a lawyer and cannot give legal advice
- Always remind users to consult a licensed lawyer or duty counsel for case-specific advice
- Use plain, accessible English — avoid legal jargon or define it clearly
- Be warm, empathetic, and supportive
- When discussing forms, always mention the form number (e.g., Form 8, Form 10, Form 14B)
- Always mention key deadlines when relevant (e.g., 30 days to file Form 10 Answer)

KEY ONTARIO FAMILY LAW FORMS & PROCEDURES:
- Form 8/8A: Application (starts a family court case)
- Form 10: Answer (response to Form 8, usually 30 days to file)
- Form 14/14A/14B: Motion forms (urgent requests or changing orders)
- Form 15/15A/15B: Response to motion or change
- Form 35.1: Parenting Affidavit (for custody/access matters)
- Form 13/13.1: Financial Statement (for support or property matters)
- "Noted in default": what happens if you miss the deadline to respond
- Case conference: meeting with judge before a hearing
- Settlement conference: attempt to settle before trial
- Family Responsibility Office (FRO): enforces child and spousal support orders

DEFINITIONS TO USE:
- Affidavit: a written statement you swear is true
- Serve/Service: officially delivering documents to the other person
- Case conference: a meeting with a judge to discuss your case before a full hearing

Always end responses with a brief reminder to seek legal advice for their specific situation.`;

interface MessageBubbleProps {
  content: string;
  role: "user" | "assistant";
  colors: ReturnType<typeof useColors>;
}

function MessageBubble({ content, role, colors }: MessageBubbleProps) {
  const isUser = role === "user";
  return (
    <View
      style={[
        styles.bubble,
        isUser
          ? [styles.userBubble, { backgroundColor: colors.primary }]
          : [styles.assistantBubble, { backgroundColor: colors.card, borderColor: colors.border }],
      ]}
    >
      <Text
        style={[
          styles.bubbleText,
          { color: isUser ? colors.primaryForeground : colors.foreground },
        ]}
      >
        {content}
      </Text>
    </View>
  );
}

export default function AssistantChat() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { messages, addMessage, userRole } = useApp();
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const flatListRef = useRef<FlatList>(null);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    setInput("");
    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    addMessage({ role: "user", content: text });

    const contextMessages = messages.slice(-10).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const roleContext =
      userRole === "served"
        ? "The user has been served with family court documents and needs help understanding what to do."
        : userRole === "serving"
        ? "The user wants to start a family court process and serve someone with documents."
        : "";

    try {
      const response = await fetch(`${BASE_URL}/api/family-law/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            ...contextMessages,
            { role: "user", content: text },
          ],
          systemContext: roleContext,
        }),
      });

      if (!response.ok) throw new Error("Request failed");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader");

      const decoder = new TextDecoder();
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;
            try {
              const parsed = JSON.parse(data) as { content?: string; done?: boolean };
              if (parsed.content) {
                fullContent += parsed.content;
                setStreamingContent(fullContent);
              }
              if (parsed.done) {
                addMessage({ role: "assistant", content: fullContent });
                setStreamingContent("");
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              }
            } catch {}
          }
        }
      }
    } catch {
      addMessage({
        role: "assistant",
        content:
          "I'm having trouble connecting right now. Please try again in a moment. Remember, for urgent legal matters, contact Legal Aid Ontario at 1-800-668-8258 or a duty counsel at your local courthouse.",
      });
    } finally {
      setIsLoading(false);
      setStreamingContent("");
    }
  }, [input, isLoading, messages, addMessage, userRole]);

  const allMessages = streamingContent
    ? [
        ...messages,
        {
          id: "streaming",
          role: "assistant" as const,
          content: streamingContent,
          timestamp: Date.now(),
        },
      ]
    : messages;

  const bottomPad =
    Platform.OS === "web" ? 106 : insets.bottom > 0 ? insets.bottom : 16;

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      {allMessages.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="chatbubbles-outline" size={48} color={colors.mutedForeground} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
            Ask Me Anything
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.mutedForeground }]}>
            I can help you understand Ontario family court forms, deadlines, and procedures — in plain language.
          </Text>
          <View style={styles.suggestions}>
            {[
              "What does Form 10 mean?",
              "How long do I have to respond?",
              "What is a case conference?",
            ].map((suggestion) => (
              <Pressable
                key={suggestion}
                style={[styles.suggestion, { backgroundColor: colors.secondary, borderColor: colors.border }]}
                onPress={() => {
                  setInput(suggestion);
                }}
              >
                <Text style={[styles.suggestionText, { color: colors.primary }]}>
                  {suggestion}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={allMessages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MessageBubble content={item.content} role={item.role} colors={colors} />
          )}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      <View
        style={[
          styles.inputRow,
          {
            borderTopColor: colors.border,
            backgroundColor: colors.background,
            paddingBottom: bottomPad,
          },
        ]}
      >
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              color: colors.foreground,
              // Remove browser default focus outline on web
              ...(Platform.OS === "web" ? { outlineStyle: "none" } : {}),
            },
          ]}
          value={input}
          onChangeText={setInput}
          placeholder="Ask about your family court matter..."
          placeholderTextColor={colors.mutedForeground}
          multiline
          maxLength={500}
          returnKeyType="send"
          enterKeyHint="send"
          onSubmitEditing={sendMessage}
          onKeyPress={Platform.OS === "web" ? ((e: any) => {
            if (e.nativeEvent.key === "Enter" && !e.nativeEvent.shiftKey) {
              e.preventDefault?.();
              sendMessage();
            }
          }) : undefined}
        />
        <Pressable
          style={[
            styles.sendBtn,
            {
              backgroundColor: input.trim() ? colors.primary : colors.muted,
            },
          ]}
          onPress={sendMessage}
          disabled={!input.trim() || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={colors.primaryForeground} />
          ) : (
            <Feather name="send" size={18} color={input.trim() ? colors.primaryForeground : colors.mutedForeground} />
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },
  suggestions: {
    gap: 8,
    marginTop: 16,
    width: "100%",
  },
  suggestion: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  suggestionText: {
    fontSize: 14,
    fontWeight: "500",
  },
  messageList: {
    padding: 16,
    gap: 8,
  },
  bubble: {
    maxWidth: "85%",
    padding: 14,
    borderRadius: 16,
    marginVertical: 4,
  },
  userBubble: {
    alignSelf: "flex-end",
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    alignSelf: "flex-start",
    borderBottomLeftRadius: 4,
    borderWidth: 1,
  },
  bubbleText: {
    fontSize: 15,
    lineHeight: 22,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 15,
    maxHeight: 100,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
});
