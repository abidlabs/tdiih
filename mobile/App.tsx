import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FlatList, StyleSheet, View, useWindowDimensions } from "react-native";
import type { ListRenderItemInfo } from "react-native";
import { StatusBar } from "expo-status-bar";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import DayCard from "@/components/DayCard";
import { buildDayWindow } from "@/utils/dates";
import { getEventsSync, syncEvents, type EventsDataset } from "@/utils/eventStore";
import { colors } from "@/theme";

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function Pager() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const today = useMemo(() => new Date(), []);
  const { days, todayIndex } = useMemo(() => buildDayWindow(today), [today]);

  const [dataset, setDataset] = useState<EventsDataset>(() => getEventsSync());
  const listRef = useRef<FlatList<Date>>(null);

  useEffect(() => {
    let active = true;
    syncEvents()
      .then((next) => {
        if (active) setDataset(next);
      })
      .catch(() => {
        // syncEvents never throws; this is belt-and-suspenders.
      });
    return () => {
      active = false;
    };
  }, []);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<Date>) => (
      <DayCard
        date={item}
        dataset={dataset}
        isToday={isSameDay(item, today)}
        width={width}
        height={height}
        insets={insets}
      />
    ),
    [dataset, today, width, height, insets]
  );

  const getItemLayout = useCallback(
    (_: ArrayLike<Date> | null | undefined, index: number) => ({
      length: width,
      offset: width * index,
      index,
    }),
    [width]
  );

  const keyExtractor = useCallback((item: Date) => item.toISOString(), []);

  return (
    <View style={styles.container}>
      <FlatList
        ref={listRef}
        data={days}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        getItemLayout={getItemLayout}
        initialScrollIndex={todayIndex}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        initialNumToRender={3}
        maxToRenderPerBatch={3}
        windowSize={5}
      />
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Pager />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
});
