import { useMemo } from "react";
import dayjs from "@/utils/dayjs-jalali";
import { ItemResaultPrice } from "@/models";
import usePersianNumbers from "@/hooks/usePersianNumbers";

// Days: 0=Saturday, 1=Sunday, ..., 6=Friday
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
  dayIndex: number;
  startHour: number;
  endHour: number;
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

    // Step 1: Intersect shipping days [start, end] from all items
    const [startDay, endDay] = items.reduce<[number, number]>(
      ([start, end], item) => {
        const itemStart = item.shippingStartTimeWarehouse ?? 0;
        const itemEnd = item.shippingEndTimeWarehouse ?? 6;

        const intersectStart = Math.max(start, itemStart);
        const intersectEnd = Math.min(end, itemEnd);

        return intersectStart <= intersectEnd
          ? [intersectStart, intersectEnd]
          : [-1, -2];
      },
      [0, 6]
    );

    if (startDay > endDay) return []; // No valid intersection

    // Step 2: Get today as 0=Saturday
    const todayInWeek = dayjs().day(); // 0=Sunday ... 6=Saturday in default Gregorian
    const correctedToday = todayInWeek === 0 ? 6 : todayInWeek - 1; // Convert to 0=Saturday

    // Step 3: Generate next 4 delivery days within [startDay, endDay], starting from today
    const daySequence: number[] = [];
    let current = correctedToday;

    while (daySequence.length < 4) {
      if (startDay <= current && current <= endDay) {
        daySequence.push(current);
      }
      current = (current + 1) % 7;
    }

    // Step 4: Define time slots
    const timeSlots = [
      { start: 8, end: 13 },
      { start: 13, end: 18 },
      ...(isTransitMode ? [{ start: 6, end: 22 }] : []),
    ];

    // Step 5: Build options with Persian date labels
    const options: DeliveryTimeOption[] = [];

    daySequence.forEach((dayOffsetIndex) => {
      const diffInDays = (dayOffsetIndex - correctedToday + 7) % 7;
      const targetDate = dayjs().add(diffInDays, "day");

      // Format as Jalali and convert digits to Persian
      const jDate = targetDate.calendar("jalali").format("YYYY/MM/DD"); // "1405/8/21"
      const persianJDate = toPersianNumber(jDate); // "۱۴۰۵/۸/۲۱"

      const dayName = PERSIAN_DAYS[dayOffsetIndex];

      timeSlots.forEach((slot) => {
        const label = `${dayName}، ${persianJDate}، ساعت ${toPersianNumber(slot.start)} - ${toPersianNumber(slot.end)}`;
        options.push({
          id: `day-${dayOffsetIndex}-slot-${slot.start}-${slot.end}`,
          label,
          dayIndex: dayOffsetIndex,
          startHour: slot.start,
          endHour: slot.end,
        });
      });
    });

    return options;
  }, [items, isTransitMode, selectedDeliveryMethod, toPersianNumber]);
}
