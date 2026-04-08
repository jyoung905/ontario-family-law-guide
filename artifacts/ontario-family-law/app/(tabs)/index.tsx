import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useApp, type CaseParties } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

// ─── Intake Wizard ────────────────────────────────────────────────────────────

const OPTION_STEPS = [
  {
    id: "role",
    multiSelect: false as const,
    question: "What best describes\nyour situation right now?",
    subtitle: "Rough answers are fine — you can adjust any time after.",
    options: [
      { id: "served", label: "I was served with court papers", icon: "mail-open-outline" as const, description: "Someone started a case against me — I received documents" },
      { id: "serving", label: "I want to start a court case", icon: "document-text-outline" as const, description: "I need to file an Application to begin the process" },
      { id: "other", label: "I already have a case underway", icon: "briefcase-outline" as const, description: "We've been to court before, or something is ongoing" },
      { id: "notsure", label: "I'm not sure which applies", icon: "help-circle-outline" as const, description: "Let me pick the closest option and adjust later" },
    ],
  },
  {
    id: "needs",
    multiSelect: true as const,
    question: "What issues are\ninvolved in your case?",
    subtitle: "Select all that apply. Choose 'Not sure yet' if you're still figuring it out.",
    options: [
      { id: "custody", label: "Parenting & custody", icon: "people-outline" as const, description: "Decision-making, parenting time, access" },
      { id: "support", label: "Child or spousal support", icon: "cash-outline" as const, description: "Calculating, changing, or enforcing payments" },
      { id: "property", label: "Property & finances", icon: "home-outline" as const, description: "Home, assets, debts, equalization" },
      { id: "protection", label: "Protection order", icon: "shield-outline" as const, description: "Safety concerns or restraining order" },
      { id: "unsure", label: "Not sure yet", icon: "help-circle-outline" as const, description: "I'll figure this out as I go — that's okay" },
    ],
  },
  {
    id: "urgency",
    multiSelect: false as const,
    question: "Do you have a deadline\ncoming up soon?",
    subtitle: "This helps us flag the most urgent steps so nothing slips.",
    options: [
      { id: "urgent", label: "Yes — within 30 days", icon: "alarm-outline" as const, description: "Something is due very soon — I need to act quickly" },
      { id: "soon", label: "Within the next few months", icon: "calendar-outline" as const, description: "Getting organized — I have a bit of time" },
      { id: "no", label: "No urgent deadline right now", icon: "checkmark-circle-outline" as const, description: "Just starting to understand my situation" },
    ],
  },
];

const SUB_ROLE_OPTIONS = [
  { id: "got-docs", label: "I received a document or court order recently", icon: "mail-outline" as const, role: "served" as const },
  { id: "need-to-file", label: "I need to file something or prepare for a hearing", icon: "document-text-outline" as const, role: "serving" as const },
  { id: "ongoing", label: "My case is ongoing — I need help with the next step", icon: "navigate-outline" as const, role: "other" as const },
  { id: "not-sure-sub", label: "I honestly don't know — just help me get oriented", icon: "compass-outline" as const, role: "other" as const },
];

// Total steps: 3 option steps + confirm + respondent + children
const TOTAL_STEPS = OPTION_STEPS.length + 3;

const ROLE_LABEL: Record<string, string> = {
  served: "You were served with papers",
  serving: "You're starting a court case",
  other: "You have an ongoing case",
  notsure: "You're not sure yet",
};
const URGENCY_LABEL: Record<string, string> = {
  urgent: "Deadline within 30 days — act soon",
  soon: "A few months — getting organized",
  no: "No urgent deadline right now",
};

function IntakeWizard({ onComplete }: { onComplete: () => void }) {
  const colors = useColors();
  const { setUserRole, setCaseIssues, setCaseParties, completeOnboarding } = useApp();
  const [step, setStep] = useState(0);
  const [singleSels, setSingleSels] = useState<Record<string, string>>({});
  const [multiSels, setMultiSels] = useState<Record<string, string[]>>({});

  // Sub-role: shown when user picks "existing case" or "not sure" at step 0
  const [showSubRole, setShowSubRole] = useState(false);

  // Confirmation screen: shown after urgency before party info
  const [inConfirm, setInConfirm] = useState(false);

  // Step 4 — respondent (was 3)
  const [respondentName, setRespondentName] = useState("");
  const [respondentCity, setRespondentCity] = useState("");

  // Step 5 — children (was 4)
  const [hasChildren, setHasChildren] = useState<boolean | null>(null);
  const [childList, setChildList] = useState<Array<{ id: string; name: string; birthYear: string }>>([]);

  const isOptionStep = step < OPTION_STEPS.length && !inConfirm;
  const currentOptionStep = isOptionStep ? OPTION_STEPS[step] : null;
  const isMulti = currentOptionStep?.multiSelect ?? false;
  const multiCurrent = multiSels[currentOptionStep?.id ?? ""] ?? [];
  const canContinueMulti = isMulti ? multiCurrent.length > 0 : false;

  // Which step index to show in the progress bar (confirmation counts as OPTION_STEPS.length)
  const displayStep = inConfirm ? OPTION_STEPS.length : step;

  const handleFinish = () => {
    const parties: CaseParties = {
      respondentName: respondentName.trim(),
      respondentCity: respondentCity.trim(),
      children: childList
        .filter((c) => c.name.trim())
        .map((c) => ({ id: c.id, name: c.name.trim(), birthYear: c.birthYear.trim() })),
    };
    setCaseIssues(multiSels["needs"] ?? []);
    setCaseParties(parties);
    completeOnboarding();
    setTimeout(() => onComplete(), 300);
  };

  const handleSingleSelect = (optionId: string) => {
    if (!currentOptionStep) return;
    const next = { ...singleSels, [currentOptionStep.id]: optionId };
    setSingleSels(next);

    if (step === 0) {
      if (optionId === "other" || optionId === "notsure") {
        setUserRole("other");
        setShowSubRole(true); // Stay on step 0, show sub-options
      } else {
        setUserRole(optionId === "served" ? "served" : "serving");
        setShowSubRole(false);
        setTimeout(() => setStep(1), 240);
      }
    } else if (step === 2) {
      // After urgency, show confirmation screen
      setTimeout(() => setInConfirm(true), 240);
    } else {
      setTimeout(() => setStep((s) => s + 1), 240);
    }
  };

  const handleSubRole = (subRole: "served" | "serving" | "other") => {
    setUserRole(subRole);
    setShowSubRole(false);
    setTimeout(() => setStep(1), 240);
  };

  const handleConfirmContinue = () => {
    setInConfirm(false);
    setStep(OPTION_STEPS.length); // Jump to respondent step
  };

  const handleMultiToggle = (optionId: string) => {
    if (!currentOptionStep) return;
    const current = multiSels[currentOptionStep.id] ?? [];
    const updated = current.includes(optionId)
      ? current.filter((id) => id !== optionId)
      : [...current, optionId];
    setMultiSels({ ...multiSels, [currentOptionStep.id]: updated });
  };

  const handleMultiContinue = () => setStep((s) => s + 1);

  const addChild = () =>
    setChildList((prev) => [...prev, { id: Date.now().toString(), name: "", birthYear: "" }]);

  const updateChild = (id: string, field: "name" | "birthYear", value: string) =>
    setChildList((prev) => prev.map((c) => (c.id === id ? { ...c, [field]: value } : c)));

  const removeChild = (id: string) =>
    setChildList((prev) => prev.filter((c) => c.id !== id));

  const isSelected = (optId: string) =>
    isMulti ? multiCurrent.includes(optId) : singleSels[currentOptionStep?.id ?? ""] === optId;

  return (
    <View style={{ gap: 28 }}>
      {/* Progress dots + counter */}
      <View style={{ gap: 8 }}>
        <View style={s.dots}>
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <View key={i} style={[s.dot, {
              width: i === displayStep ? 28 : 8,
              backgroundColor: i <= displayStep ? colors.tertiary : colors.surfaceContainerHigh,
            }]} />
          ))}
        </View>
        <Text style={[s.stepLabel, { color: colors.mutedForeground, fontFamily: "Manrope_600SemiBold" }]}>
          STEP {displayStep + 1} OF {TOTAL_STEPS}
        </Text>
      </View>

      {/* ── Confirmation screen (after urgency, before party info) ── */}
      {inConfirm && (
        <View style={{ gap: 16 }}>
          <View style={{ gap: 6 }}>
            <Text style={[s.intakeQ, { color: colors.foreground, fontFamily: "Newsreader_600SemiBold" }]}>
              Here's what we understood.
            </Text>
            <Text style={[s.intakeSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              Does this sound right? You can go back to adjust.
            </Text>
          </View>

          <View style={[s.confirmCard, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outlineVariant }]}>
            {[
              { icon: "person-circle-outline" as const, label: "Your situation", value: ROLE_LABEL[singleSels["role"] ?? ""] ?? "Not set" },
              { icon: "list-outline" as const, label: "Issues involved", value: (multiSels["needs"] ?? []).filter(i => i !== "unsure").map(i => ({ custody: "Parenting & custody", support: "Support", property: "Property", protection: "Protection order", unsure: "Not sure yet" }[i] ?? i)).join(", ") || "Not selected" },
              { icon: "alarm-outline" as const, label: "Urgency", value: URGENCY_LABEL[singleSels["urgency"] ?? ""] ?? "Not set" },
            ].map((row) => (
              <View key={row.label} style={s.confirmRow}>
                <View style={[s.confirmIcon, { backgroundColor: colors.primary + "12" }]}>
                  <Ionicons name={row.icon} size={16} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[s.confirmRowLabel, { color: colors.mutedForeground, fontFamily: "Manrope_600SemiBold" }]}>
                    {row.label}
                  </Text>
                  <Text style={[s.confirmRowValue, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
                    {row.value}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          <View style={[s.confirmNext, { backgroundColor: colors.surfaceContainerLow, borderColor: colors.outlineVariant }]}>
            <Ionicons name="sparkles-outline" size={16} color={colors.primary} />
            <Text style={[s.confirmNextText, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}>
              We'll build your personal case checklist, flag your key deadlines, and prepare your guide.
            </Text>
          </View>

          <Pressable
            style={({ pressed }) => [s.continueBtn, { backgroundColor: colors.primary, opacity: pressed ? 0.88 : 1 }]}
            onPress={handleConfirmContinue}
          >
            <Ionicons name="arrow-forward" size={16} color="#fff" />
            <Text style={[s.continueBtnText, { color: "#fff", fontFamily: "Inter_600SemiBold" }]}>
              Yes — build my guide
            </Text>
          </Pressable>

          <TouchableOpacity style={{ alignItems: "center", paddingVertical: 4 }} onPress={() => { setInConfirm(false); setStep(2); }}>
            <Text style={[s.skipLink, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              ← Go back and adjust
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── Steps 0–2: Option card steps ── */}
      {isOptionStep && currentOptionStep && (
        <>
          <View style={{ gap: 6 }}>
            <Text style={[s.intakeQ, { color: colors.foreground, fontFamily: "Newsreader_600SemiBold" }]}>
              {currentOptionStep.question}
            </Text>
            <Text style={[s.intakeSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              {currentOptionStep.subtitle}
            </Text>
          </View>

          <View style={{ gap: 10 }}>
            {currentOptionStep.options.map((opt) => {
              const sel = isSelected(opt.id);
              return (
                <Pressable
                  key={opt.id}
                  style={[s.option, {
                    backgroundColor: sel ? colors.primaryContainer : colors.surfaceContainerLowest,
                    shadowColor: colors.primary,
                    shadowOffset: { width: 0, height: sel ? 6 : 2 },
                    shadowOpacity: sel ? 0.14 : 0.04,
                    shadowRadius: sel ? 20 : 8,
                    elevation: sel ? 4 : 1,
                  }]}
                  onPress={() => isMulti ? handleMultiToggle(opt.id) : handleSingleSelect(opt.id)}
                >
                  <View style={[s.optIcon, { backgroundColor: sel ? "rgba(255,255,255,0.15)" : colors.surfaceContainerHigh }]}>
                    <Ionicons name={opt.icon} size={20} color={sel ? "#fff" : colors.mutedForeground} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.optLabel, { color: sel ? "#fff" : colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                      {opt.label}
                    </Text>
                    <Text style={[s.optDesc, { color: sel ? "rgba(255,255,255,0.65)" : colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                      {opt.description}
                    </Text>
                  </View>
                  {isMulti ? (
                    <View style={[s.checkbox, {
                      backgroundColor: sel ? "rgba(255,255,255,0.2)" : "transparent",
                      borderColor: sel ? "rgba(255,255,255,0.6)" : colors.outline,
                    }]}>
                      {sel && <Ionicons name="checkmark" size={14} color="#fff" />}
                    </View>
                  ) : (
                    sel && <Ionicons name="checkmark-circle" size={20} color="rgba(255,255,255,0.85)" />
                  )}
                </Pressable>
              );
            })}
          </View>

          {/* Sub-role options — shown when "existing case" or "not sure" is picked at step 0 */}
          {step === 0 && showSubRole && (
            <View style={{ gap: 10 }}>
              <View style={[s.subRoleHint, { backgroundColor: colors.surfaceContainerLow, borderColor: colors.outlineVariant }]}>
                <Ionicons name="compass-outline" size={14} color={colors.mutedForeground} />
                <Text style={[s.subRoleHintText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                  To get you the right guide — which fits best?
                </Text>
              </View>
              {SUB_ROLE_OPTIONS.map((sub) => (
                <Pressable
                  key={sub.id}
                  style={({ pressed }) => [s.option, {
                    backgroundColor: colors.surfaceContainerLowest,
                    opacity: pressed ? 0.88 : 1,
                    shadowColor: colors.primary,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.04,
                    shadowRadius: 8,
                    elevation: 1,
                  }]}
                  onPress={() => handleSubRole(sub.role)}
                >
                  <View style={[s.optIcon, { backgroundColor: colors.surfaceContainerHigh }]}>
                    <Ionicons name={sub.icon} size={20} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.optLabel, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                      {sub.label}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={colors.outline} />
                </Pressable>
              ))}
            </View>
          )}

          {isMulti && (
            <Pressable
              style={({ pressed }) => [s.continueBtn, {
                backgroundColor: canContinueMulti ? colors.primary : colors.surfaceContainerHigh,
                opacity: pressed ? 0.88 : 1,
              }]}
              onPress={handleMultiContinue}
              disabled={!canContinueMulti}
            >
              <Text style={[s.continueBtnText, {
                color: canContinueMulti ? "#fff" : colors.mutedForeground,
                fontFamily: "Inter_600SemiBold",
              }]}>
                {canContinueMulti
                  ? `Continue with ${multiCurrent.length} issue${multiCurrent.length > 1 ? "s" : ""}`
                  : "Select at least one issue"}
              </Text>
              {canContinueMulti && <Ionicons name="arrow-forward" size={16} color="#fff" />}
            </Pressable>
          )}
        </>
      )}

      {/* ── Step 3: Respondent info ── */}
      {step === OPTION_STEPS.length && (
        <View style={{ gap: 20 }}>
          <TouchableOpacity
            style={{ flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start" }}
            onPress={() => setInConfirm(true)}
          >
            <Ionicons name="chevron-back" size={16} color={colors.mutedForeground} />
            <Text style={[s.skipLink, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              Back
            </Text>
          </TouchableOpacity>

          <View style={{ gap: 6 }}>
            <Text style={[s.intakeQ, { color: colors.foreground, fontFamily: "Newsreader_600SemiBold" }]}>
              Who is the other party?
            </Text>
            <Text style={[s.intakeSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              Their name will help pre-fill your court forms. Everything stays on your device — never shared.
            </Text>
          </View>

          <View style={{ gap: 10 }}>
            <View style={[s.fieldGroup, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outlineVariant }]}>
              <Text style={[s.fieldLabel, { color: colors.mutedForeground, fontFamily: "Manrope_600SemiBold" }]}>
                Their name (respondent)
              </Text>
              <TextInput
                style={[s.fieldInput, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}
                placeholder="e.g. Alex Smith"
                placeholderTextColor={colors.outline}
                value={respondentName}
                onChangeText={setRespondentName}
                autoCapitalize="words"
                returnKeyType="next"
              />
            </View>

            <View style={[s.fieldGroup, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outlineVariant }]}>
              <Text style={[s.fieldLabel, { color: colors.mutedForeground, fontFamily: "Manrope_600SemiBold" }]}>
                Their city or municipality (optional)
              </Text>
              <TextInput
                style={[s.fieldInput, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}
                placeholder="e.g. Toronto"
                placeholderTextColor={colors.outline}
                value={respondentCity}
                onChangeText={setRespondentCity}
                autoCapitalize="words"
                returnKeyType="done"
              />
            </View>
          </View>

          <Pressable
            style={({ pressed }) => [s.continueBtn, { backgroundColor: colors.primary, opacity: pressed ? 0.88 : 1 }]}
            onPress={() => setStep(OPTION_STEPS.length + 1)}
          >
            <Text style={[s.continueBtnText, { color: "#fff", fontFamily: "Inter_600SemiBold" }]}>
              Continue
            </Text>
            <Ionicons name="arrow-forward" size={16} color="#fff" />
          </Pressable>

          <TouchableOpacity style={{ alignItems: "center", paddingVertical: 4 }} onPress={() => setStep(OPTION_STEPS.length + 1)}>
            <Text style={[s.skipLink, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              I'll add this later
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── Step 4: Children ── */}
      {step === OPTION_STEPS.length + 1 && (
        <View style={{ gap: 20 }}>
          <TouchableOpacity
            style={{ flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start" }}
            onPress={() => setStep(OPTION_STEPS.length)}
          >
            <Ionicons name="chevron-back" size={16} color={colors.mutedForeground} />
            <Text style={[s.skipLink, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              Back
            </Text>
          </TouchableOpacity>

          <View style={{ gap: 6 }}>
            <Text style={[s.intakeQ, { color: colors.foreground, fontFamily: "Newsreader_600SemiBold" }]}>
              Any children involved?
            </Text>
            <Text style={[s.intakeSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              Their names help the AI draft parenting, custody, and support sections of your forms.
            </Text>
          </View>

          {/* Yes / No picker (shown until a choice is made) */}
          {hasChildren === null && (
            <View style={{ gap: 10 }}>
              {[
                { val: true, label: "Yes — children are involved", desc: "Parenting time, custody, or support", icon: "people-outline" as const },
                { val: false, label: "No children involved", desc: "Financial or property matter only", icon: "briefcase-outline" as const },
              ].map(({ val, label, desc, icon }) => (
                <Pressable
                  key={String(val)}
                  style={[s.option, { backgroundColor: colors.surfaceContainerLowest, shadowColor: colors.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 1 }]}
                  onPress={() => {
                    setHasChildren(val);
                    if (!val) {
                      // No children — finish immediately
                      setTimeout(() => handleFinish(), 80);
                    } else {
                      // Add the first child slot
                      setChildList([{ id: Date.now().toString(), name: "", birthYear: "" }]);
                    }
                  }}
                >
                  <View style={[s.optIcon, { backgroundColor: colors.surfaceContainerHigh }]}>
                    <Ionicons name={icon} size={20} color={colors.mutedForeground} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.optLabel, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>{label}</Text>
                    <Text style={[s.optDesc, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{desc}</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          )}

          {/* Child list (shown after Yes) */}
          {hasChildren === true && (
            <View style={{ gap: 14 }}>
              {childList.map((child, i) => (
                <View key={child.id} style={[s.childCard, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outlineVariant }]}>
                  <View style={s.childCardHeader}>
                    <Text style={[s.fieldLabel, { color: colors.mutedForeground, fontFamily: "Manrope_600SemiBold" }]}>
                      Child {i + 1}
                    </Text>
                    {childList.length > 1 && (
                      <TouchableOpacity onPress={() => removeChild(child.id)}>
                        <Ionicons name="close-circle-outline" size={18} color={colors.outline} />
                      </TouchableOpacity>
                    )}
                  </View>
                  <TextInput
                    style={[s.fieldInput, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}
                    placeholder="Full name"
                    placeholderTextColor={colors.outline}
                    value={child.name}
                    onChangeText={(v) => updateChild(child.id, "name", v)}
                    autoCapitalize="words"
                  />
                  <TextInput
                    style={[s.fieldInput, { color: colors.foreground, fontFamily: "Inter_400Regular", marginTop: 8 }]}
                    placeholder="Birth year (optional, e.g. 2018)"
                    placeholderTextColor={colors.outline}
                    value={child.birthYear}
                    onChangeText={(v) => updateChild(child.id, "birthYear", v)}
                    keyboardType="number-pad"
                    maxLength={4}
                  />
                </View>
              ))}

              <TouchableOpacity style={[s.addChildBtn, { borderColor: colors.outlineVariant }]} onPress={addChild}>
                <Ionicons name="add-circle-outline" size={18} color={colors.primary} />
                <Text style={[s.addChildText, { color: colors.primary, fontFamily: "Inter_600SemiBold" }]}>
                  Add another child
                </Text>
              </TouchableOpacity>

              <Pressable
                style={({ pressed }) => [s.continueBtn, { backgroundColor: colors.primary, opacity: pressed ? 0.88 : 1 }]}
                onPress={handleFinish}
              >
                <Text style={[s.continueBtnText, { color: "#fff", fontFamily: "Inter_600SemiBold" }]}>
                  All done — build my guide
                </Text>
                <Ionicons name="arrow-forward" size={16} color="#fff" />
              </Pressable>
            </View>
          )}

          <TouchableOpacity style={{ alignItems: "center", paddingVertical: 4 }} onPress={handleFinish}>
            <Text style={[s.skipLink, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              Skip for now
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

// ─── Main Home Screen ─────────────────────────────────────────────────────────

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { hasOnboarded, deadlines } = useApp();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = (Platform.OS === "web" ? 34 : insets.bottom) + 100;
  const scrollRef = useRef<ScrollView>(null);
  const [intakeY, setIntakeY] = useState(0);

  const nextDeadline = useMemo(() => {
    if (!deadlines || deadlines.length === 0) return null;
    const sorted = [...deadlines].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return sorted[0];
  }, [deadlines]);

  if (hasOnboarded) {
    const actions = [
      {
        icon: "briefcase-outline" as const,
        label: "Resume my case",
        desc: "Continue where you left off",
        route: "/(tabs)/my-case" as const,
        primary: true,
      },
      {
        icon: "alarm-outline" as const,
        label: "See my deadline",
        desc: nextDeadline ? nextDeadline.label : "No deadline added yet",
        route: "/(tabs)/timeline" as const,
        primary: false,
      },
      {
        icon: "cloud-upload-outline" as const,
        label: "Upload or review documents",
        desc: "Add files to your document checklist",
        route: "/(tabs)/my-case" as const,
        primary: false,
      },
    ];

    return (
      <View style={{ flex: 1, backgroundColor: colors.surface }}>
        <View style={{
          flex: 1,
          paddingTop: topPad + 24,
          paddingHorizontal: 24,
          paddingBottom: botPad,
          justifyContent: "center",
          gap: 32,
        }}>
          <View style={{ gap: 4 }}>
            <Text style={[s.lbl, { color: colors.mutedForeground, fontFamily: "Manrope_600SemiBold" }]}>
              ONTARIO FAMILY LAW
            </Text>
            <Text style={[s.welcomeTitle, { color: colors.foreground, fontFamily: "Newsreader_500Medium" }]}>
              Welcome back.
            </Text>
          </View>

          <View style={{ gap: 10 }}>
            {actions.map((action) => (
              <Pressable
                key={action.label}
                style={({ pressed }) => [{
                  flexDirection: "row" as const,
                  alignItems: "center" as const,
                  gap: 16,
                  padding: 18,
                  borderRadius: 22,
                  backgroundColor: action.primary ? colors.primary : colors.surfaceContainerLow,
                  opacity: pressed ? 0.88 : 1,
                  shadowColor: colors.primary,
                  shadowOffset: { width: 0, height: action.primary ? 6 : 2 },
                  shadowOpacity: action.primary ? 0.14 : 0.04,
                  shadowRadius: action.primary ? 20 : 8,
                  elevation: action.primary ? 4 : 1,
                }]}
                onPress={() => router.push(action.route)}
              >
                <View style={{
                  width: 44, height: 44, borderRadius: 14,
                  backgroundColor: action.primary ? "rgba(255,255,255,0.12)" : colors.surfaceContainerHigh,
                  alignItems: "center", justifyContent: "center",
                }}>
                  <Ionicons name={action.icon} size={21} color={action.primary ? "#fff" : colors.primary} />
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={{ fontSize: 15, color: action.primary ? "#fff" : colors.foreground, fontFamily: "Inter_600SemiBold" }}>
                    {action.label}
                  </Text>
                  <Text style={{ fontSize: 12, color: action.primary ? "rgba(255,255,255,0.62)" : colors.mutedForeground, fontFamily: "Inter_400Regular" }}>
                    {action.desc}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={action.primary ? "rgba(255,255,255,0.5)" : colors.outline} />
              </Pressable>
            ))}
          </View>

          <Text style={{ fontSize: 11, color: colors.outline, textAlign: "center", lineHeight: 17, fontFamily: "Inter_400Regular" }}>
            General information only — not legal advice.
          </Text>
        </View>
      </View>
    );
  }

  // ── New user → Public landing + intake ──
  return (
    <ScrollView
      ref={scrollRef}
      style={{ flex: 1, backgroundColor: colors.surface }}
      contentContainerStyle={{ paddingTop: topPad + 16, paddingHorizontal: 24, paddingBottom: botPad, gap: 32 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero */}
      <View style={{ gap: 18 }}>
        <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
          <Text style={[s.lbl, { color: colors.mutedForeground, fontFamily: "Manrope_600SemiBold" }]}>
            ONTARIO FAMILY LAW
          </Text>
          <View style={[s.betaBadge, { backgroundColor: "#f0fdf4", borderColor: "#86efac" }]}>
            <Text style={[s.betaBadgeText, { color: "#16a34a" }]}>OPEN BETA</Text>
          </View>
        </View>
        <Text style={[s.heroTitle, { color: colors.foreground, fontFamily: "Newsreader_500Medium" }]}>
          Understand your family court matter.{"\n"}Know exactly what to do next.
        </Text>
        <Text style={[s.heroSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
          Plain-language guidance for self-represented Ontarians navigating family court.
        </Text>
      </View>

      {/* Scope clarity */}
      <View style={[s.scopeCard, { backgroundColor: colors.surfaceContainerLow }]}>
        <Text style={[s.scopeTitle, { color: colors.foreground, fontFamily: "Manrope_700Bold" }]}>
          What this app does
        </Text>
        {[
          { icon: "checkmark-circle-outline" as const, text: "Explains Ontario court documents in plain English" },
          { icon: "checkmark-circle-outline" as const, text: "Tracks your deadlines and key steps" },
          { icon: "checkmark-circle-outline" as const, text: "Helps you draft common family court forms" },
          { icon: "checkmark-circle-outline" as const, text: "Connects you to Legal Aid, FLIC, and duty counsel" },
        ].map((b) => (
          <View key={b.text} style={s.benefitRow}>
            <Ionicons name={b.icon} size={16} color="#16a34a" />
            <Text style={[s.benefitText, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}>{b.text}</Text>
          </View>
        ))}
        <View style={[s.scopeDivider, { backgroundColor: colors.outlineVariant }]} />
        <Text style={[s.scopeTitle, { color: colors.mutedForeground, fontFamily: "Manrope_600SemiBold" }]}>
          What it doesn't do
        </Text>
        <Text style={[s.scopeNote, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
          This is not a law firm and cannot give legal advice. For your specific situation, always consult a licensed Ontario family lawyer or duty counsel.
        </Text>
      </View>

      {/* Primary CTA */}
      <Pressable
        style={({ pressed }) => [s.primaryCtaBtn, {
          backgroundColor: colors.primary, opacity: pressed ? 0.9 : 1,
          shadowColor: colors.primary, shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.18, shadowRadius: 20, elevation: 5,
        }]}
        onPress={() => scrollRef.current?.scrollTo({ y: intakeY > 20 ? intakeY - 24 : 1200, animated: true })}
      >
        <Ionicons name="arrow-forward-circle-outline" size={20} color="#fff" />
        <Text style={[s.primaryCtaBtnText, { fontFamily: "Manrope_700Bold" }]}>
          Build my case guide — free
        </Text>
      </Pressable>

      {/* Founder trust block */}
      <View style={[s.founderBlock, { backgroundColor: colors.surfaceContainerLow, borderLeftColor: colors.tertiary }]}>
        <Text style={[s.founderText, { color: colors.foreground, fontFamily: "Newsreader_500Medium" }]}>
          "Built by someone who went through Ontario family court self-represented and knows exactly how costly confusion can be."
        </Text>
        <Text style={[s.founderMeta, { color: colors.mutedForeground, fontFamily: "Manrope_600SemiBold" }]}>
          — Founder
        </Text>
      </View>

      {/* Intake */}
      <View
        style={{ gap: 16 }}
        onLayout={(e) => setIntakeY(e.nativeEvent.layout.y)}
      >
        <View style={{ gap: 4 }}>
          <Text style={[s.sectionLabel, { color: colors.tertiary, fontFamily: "Manrope_700Bold" }]}>START HERE</Text>
          <Text style={[s.sectionHeading, { color: colors.foreground, fontFamily: "Newsreader_500Medium" }]}>
            Describe your case.{"\n"}Get your personal guide.
          </Text>
          <Text style={[s.intakeLead, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            A few quick questions. Under two minutes. Completely free.
          </Text>
        </View>
        <IntakeWizard onComplete={() => router.push("/(tabs)/my-case")} />
      </View>

      {/* Trust bar */}
      <View style={[s.trustBar, { backgroundColor: colors.surfaceContainerLow }]}>
        <Ionicons name="shield-checkmark-outline" size={16} color={colors.primary} />
        <Text style={[s.trustText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
          Designed for Ontario family court · Plain language · Not a law firm
        </Text>
      </View>

      {/* Free vs Premium */}
      <View style={{ gap: 12 }}>
        <Text style={[s.sectionLabel, { color: colors.mutedForeground, fontFamily: "Manrope_700Bold" }]}>FREE VS PREMIUM</Text>
        <View style={[s.compareCard, { backgroundColor: colors.surfaceContainerLow }]}>
          <View style={s.compareCol}>
            <Text style={[s.compareTier, { color: colors.primary, fontFamily: "Manrope_700Bold" }]}>FREE</Text>
            {["Case guide & next steps", "Document analysis", "Deadline tracking", "Plain-language assistant", "Legal resources"].map((f) => (
              <View key={f} style={s.compareRow}>
                <Ionicons name="checkmark" size={14} color={colors.primary} />
                <Text style={[s.compareItem, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}>{f}</Text>
              </View>
            ))}
          </View>
          <View style={[s.compareDivider, { backgroundColor: colors.outlineVariant }]} />
          <View style={s.compareCol}>
            <Text style={[s.compareTier, { color: colors.tertiary, fontFamily: "Manrope_700Bold" }]}>PREMIUM</Text>
            {["AI court form drafts", "Affidavit chronology", "Filing package", "Communication coach", "Stronger action plan"].map((f) => (
              <View key={f} style={s.compareRow}>
                <Ionicons name="checkmark" size={14} color={colors.tertiary} />
                <Text style={[s.compareItem, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}>{f}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View style={[s.disclaimer, { backgroundColor: colors.surfaceContainerLow }]}>
        <Ionicons name="shield-outline" size={15} color={colors.outline} />
        <Text style={[s.disclaimerText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
          General information only — not legal advice. Always consult a licensed lawyer for your situation.
        </Text>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  lbl: { fontSize: 10, letterSpacing: 1.4 },
  dots: { flexDirection: "row", gap: 6 },
  dot: { height: 8, borderRadius: 4 },
  stepLabel: { fontSize: 10, letterSpacing: 1.2, textTransform: "uppercase" },
  intakeQ: { fontSize: 26, lineHeight: 32, letterSpacing: -0.3 },
  intakeSub: { fontSize: 14, lineHeight: 20 },
  option: { flexDirection: "row", alignItems: "center", gap: 14, borderRadius: 20, padding: 16 },
  optIcon: { width: 42, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  optLabel: { fontSize: 14, marginBottom: 2 },
  optDesc: { fontSize: 12, lineHeight: 16 },
  checkbox: {
    width: 22, height: 22, borderRadius: 6,
    borderWidth: 1.5,
    alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  },
  continueBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, paddingVertical: 16, borderRadius: 18,
  },
  continueBtnText: { fontSize: 15 },

  // Hero
  heroTitle: { fontSize: 30, lineHeight: 37, letterSpacing: -0.5 },
  heroSub: { fontSize: 15, lineHeight: 23 },
  betaBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6, borderWidth: 1 },
  betaBadgeText: { fontSize: 9, fontWeight: "700", letterSpacing: 0.8 },

  // Scope clarity card
  scopeCard: { borderRadius: 22, padding: 20, gap: 10 },
  scopeTitle: { fontSize: 12, letterSpacing: 0.6, marginBottom: 4 },
  scopeDivider: { height: 1, marginVertical: 4 },
  scopeNote: { fontSize: 13, lineHeight: 19 },

  // Benefits
  benefitCard: { borderRadius: 22, padding: 20 },
  benefitRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  benefitIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  benefitText: { flex: 1, fontSize: 14, lineHeight: 20 },

  // CTA
  primaryCtaBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 10, paddingVertical: 17, borderRadius: 20,
  },
  primaryCtaBtnText: { color: "#fff", fontSize: 16, letterSpacing: 0.2 },

  // Founder block
  founderBlock: { borderRadius: 20, padding: 20, borderLeftWidth: 4, gap: 10 },
  founderText: { fontSize: 16, lineHeight: 25, letterSpacing: -0.1 },
  founderMeta: { fontSize: 10, letterSpacing: 1.2, textTransform: "uppercase" },

  // Landing shared
  trustBar: { flexDirection: "row", alignItems: "center", gap: 10, padding: 14, borderRadius: 16 },
  trustText: { fontSize: 12, lineHeight: 18, flex: 1 },
  sectionLabel: { fontSize: 10, letterSpacing: 1.6, textTransform: "uppercase" },
  sectionHeading: { fontSize: 24, lineHeight: 30, letterSpacing: -0.3 },
  intakeLead: { fontSize: 14, lineHeight: 20 },
  compareCard: { borderRadius: 20, padding: 20, flexDirection: "row", gap: 0 },
  compareCol: { flex: 1, gap: 10 },
  compareDivider: { width: 1, marginHorizontal: 16, borderRadius: 1 },
  compareTier: { fontSize: 11, letterSpacing: 0.8, marginBottom: 4 },
  compareRow: { flexDirection: "row", alignItems: "flex-start", gap: 6 },
  compareItem: { fontSize: 12, lineHeight: 17, flex: 1 },

  // Welcome back
  welcomeTitle: { fontSize: 30, lineHeight: 36, letterSpacing: -0.3 },

  disclaimer: { flexDirection: "row", gap: 10, padding: 16, borderRadius: 20, alignItems: "flex-start" },
  disclaimerText: { fontSize: 12, lineHeight: 18, flex: 1 },

  // Party info steps
  fieldGroup: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 6 },
  fieldLabel: { fontSize: 10, letterSpacing: 1.1, textTransform: "uppercase" },
  fieldInput: { fontSize: 15, paddingVertical: 4 },
  childCard: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 6 },
  childCardHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  addChildBtn: {
    flexDirection: "row", alignItems: "center", gap: 8,
    borderWidth: 1, borderStyle: "dashed" as const,
    borderRadius: 14, paddingVertical: 13, justifyContent: "center",
  },
  addChildText: { fontSize: 14 },
  skipLink: { fontSize: 13, textDecorationLine: "underline" as const },
  confirmCard: { borderRadius: 18, borderWidth: 1, padding: 16, gap: 14 },
  confirmRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  confirmIcon: { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 },
  confirmRowLabel: { fontSize: 10, letterSpacing: 0.8, marginBottom: 2 },
  confirmRowValue: { fontSize: 14, lineHeight: 20 },
  confirmNext: { flexDirection: "row", gap: 10, padding: 14, borderRadius: 12, borderWidth: 1, alignItems: "flex-start" },
  confirmNextText: { flex: 1, fontSize: 13, lineHeight: 19 },
  subRoleHint: { flexDirection: "row", gap: 8, padding: 12, borderRadius: 12, borderWidth: 1, alignItems: "center" },
  subRoleHintText: { flex: 1, fontSize: 13, lineHeight: 18 },
});
