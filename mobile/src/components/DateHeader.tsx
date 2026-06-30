import React from "react";
import { View, Text, StyleSheet } from "react-native";
import type { HijriDate } from "@/utils/hijri";
import { formatHijri } from "@/utils/hijri";
import { formatGregorian } from "@/utils/dates";
import { colors, spacing } from "@/theme";

interface Props {
  hijri: HijriDate;
  gregorian: Date;
  isToday: boolean;
}

export default function DateHeader({ hijri, gregorian, isToday }: Props) {
  return (
    <View style={styles.container}>
      {isToday && <Text style={styles.todayPill}>TODAY</Text>}
      <Text style={styles.hijri} accessibilityRole="header">
        {formatHijri(hijri)}
      </Text>
      <Text style={styles.gregorian}>{formatGregorian(gregorian)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  todayPill: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 2,
    marginBottom: spacing.xs,
  },
  hijri: {
    color: colors.text,
    fontSize: 26,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: 0.3,
  },
  gregorian: {
    color: colors.textFaint,
    fontSize: 14,
    marginTop: spacing.xs,
    textAlign: "center",
  },
});
