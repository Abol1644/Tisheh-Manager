import { useMemo } from "react";
import dayjs from "@/utils/dayjs-jalali";
import { ItemResaultPrice } from "@/models";
import usePersianNumbers from "@/hooks/usePersianNumbers";

const PERSIAN_DAYS = [
  "شنبه",
  "یک‌شنبه",
  "دوشنبه",
  "سه‌شنبه",
  "چهارشنبه",
  "پنج‌شنبه",
  "جمعه",
];

export interface DeliveryTimeOption {
  id: string;
  label: string;
  dayIndex: number; // 0=Saturday ... 6=Friday
  startHour: number;
  endHour: number;
  daysFromToday: number;
}

interface UseDeliveryTimeOptionsParams {
  items: ItemResaultPrice[];
  isTransitMode: boolean;
  selectedDeliveryMethod: { id: number; title: string } | null;
}

export function useDeliveryTimeOptions({
  items,
  isTransitMode,
  selectedDeliveryMethod,
}: UseDeliveryTimeOptionsParams): DeliveryTimeOption[] {
  const { toPersianNumber } = usePersianNumbers();

  return useMemo(() => {
    if (!selectedDeliveryMethod || items.length === 0) return [];

    // Step 1: Calculate valid delivery date range for each item as [startOffset, endOffset]
    // where offset = number of days from today (0 = today, 1 = tomorrow, etc.)
    const ranges = items.map(item => {
      const startOffset = item.shippingStartTimeWarehouse ?? 0;
      const endOffset = item.shippingEndTimeWarehouse ?? 3; // default 3-day window
      return [startOffset, endOffset] as [number, number];
    });

    // Step 2: Intersect all [start, end] ranges
    const [globalStart, globalEnd] = ranges.reduce<[number, number]>(
      ([accStart, accEnd], [start, end]) => [
        Math.max(accStart, start),
        Math.min(accEnd, end),
      ],
      [0, 6] // initial wide range
    );

    // No overlap → no valid delivery window
    if (globalStart > globalEnd) return [];

    // Step 3: Generate up to 4 upcoming delivery dates within [globalStart, globalEnd]
    const options: DeliveryTimeOption[] = [];
    const now = dayjs();
    const currentHour = now.hour();
    const todayIndex = now.day() === 0 ? 6 : now.day() - 1; // 0=Saturday

    // We'll consider days from `globalStart` to `globalEnd`, capped at 4 days
    const daysToGenerate = Math.min(4, globalEnd - globalStart + 1);

    for (let i = 0; i < daysToGenerate; i++) {
      const daysFromToday = globalStart + i; // e.g., deliver in 1, 2, or 3 days
      const targetDate = dayjs().add(daysFromToday, "day");

      const dayOfWeek = targetDate.day();
      const dayOffsetIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // 0=Saturday
      const isToday = daysFromToday === 0;

      // Format Jalali date with Persian digits
      const jDate = targetDate.calendar("jalali").format("YYYY/MM/DD");
      const persianJDate = toPersianNumber(jDate);
      const dayName = PERSIAN_DAYS[dayOffsetIndex];

      // Define time slots
      let timeSlots = [
        { start: 8, end: 13 },
        { start: 13, end: 18 },
        ...(isTransitMode ? [{ start: 6, end: 22 }] : []),
      ];

      // Filter out expired slots for today
      if (isToday) {
        if (currentHour >= 18) continue; // No slots available
        if (currentHour >= 13) {
          timeSlots = timeSlots.filter(slot => !(slot.start === 8 && slot.end === 13));
        }
      }

      timeSlots.forEach((slot) => {
        const label = `${dayName}، ${persianJDate}، ساعت ${toPersianNumber(slot.start)} - ${toPersianNumber(slot.end)}`;
        options.push({
          id: `day-${daysFromToday}-slot-${slot.start}-${slot.end}`,
          label,
          dayIndex: dayOffsetIndex,
          startHour: slot.start,
          endHour: slot.end,
          daysFromToday
        });
      });
    }

    return options;
  }, [items, isTransitMode, selectedDeliveryMethod, toPersianNumber]);
}