import React, { useMemo } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import type { EdgeInsets } from "react-native-safe-area-context";
import DateHeader from "@/components/DateHeader";
import { gregorianToHijri, hijriKey } from "@/utils/hijri";
import { eventsForKey, type EventsDataset, type IslamicEvent } from "@/utils/eventStore";
import { colors, spacing } from "@/theme";

interface Props {
  date: Date;
  dataset: EventsDataset;
  isToday: boolean;
  width: number;
  height: number;
  insets: EdgeInsets;
}

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1519817650390-64a93db51149?w=1400&q=80&fit=crop";

function eventYearLabel(event: IslamicEvent): string | null {
  const parts: string[] = [];
  if (typeof event.year_ah === "number") parts.push(`${event.year_ah} AH`);
  if (typeof event.year_ce === "number") {
    const ce = event.year_ce;
    parts.push(ce < 0 ? `${Math.abs(ce)} BCE` : `${ce} CE`);
  }
  return parts.length ? parts.join(" · ") : null;
}

export default function DayCard({ date, dataset, isToday, width, height, insets }: Props) {
  const hijri = useMemo(() => gregorianToHijri(date), [date]);
  const events = useMemo(
    () => eventsForKey(dataset, hijriKey(hijri)),
    [dataset, hijri]
  );
  const event = events[0] ?? null;
  const yearLabel = event ? eventYearLabel(event) : null;

  return (
    <View style={[styles.card, { width, height }]}>
      <Image
        style={StyleSheet.absoluteFill}
        source={event?.image ?? FALLBACK_IMAGE}
        contentFit="cover"
        transition={250}
        cachePolicy="memory-disk"
      />
      <LinearGradient
        colors={["rgba(6,9,18,0.35)", "rgba(6,9,18,0.55)", "rgba(6,9,18,0.95)"]}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />

      <View
        style={[
          styles.content,
          { paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + spacing.md },
        ]}
      >
        <DateHeader hijri={hijri} gregorian={date} isToday={isToday} />

        <View style={styles.spacer} />

        {event ? (
          <ScrollView
            style={styles.lower}
            contentContainerStyle={styles.lowerContent}
            showsVerticalScrollIndicator={false}
          >
            {yearLabel && <Text style={styles.year}>{yearLabel}</Text>}
            <Text style={styles.title}>{event.title}</Text>
            <Text style={styles.summary}>{event.summary}</Text>
            {events.length > 1 && (
              <Text style={styles.more}>
                +{events.length - 1} more on this day
              </Text>
            )}
            {event.credit && <Text style={styles.credit}>{event.credit}</Text>}
          </ScrollView>
        ) : (
          <View style={styles.lower}>
            <Text style={styles.emptyTitle}>A quiet day in the records</Text>
            <Text style={styles.summary}>
              No notable event is logged for this date yet. Swipe to explore other
              days in history.
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bg,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  spacer: {
    flex: 1,
  },
  lower: {
    maxHeight: "62%",
  },
  lowerContent: {
    paddingBottom: spacing.sm,
  },
  year: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 1.5,
    marginBottom: spacing.xs,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "800",
    lineHeight: 34,
    marginBottom: spacing.sm,
  },
  summary: {
    color: colors.textMuted,
    fontSize: 16,
    lineHeight: 24,
  },
  more: {
    color: colors.textFaint,
    fontSize: 13,
    fontWeight: "600",
    marginTop: spacing.sm,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "700",
    marginBottom: spacing.sm,
  },
  credit: {
    color: colors.textFaint,
    fontSize: 12,
    marginTop: spacing.md,
  },
});
