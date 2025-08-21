import { useMemo } from 'react';

export const useWeekdays = (startTime: string | null | undefined) => {
  const weekdays = useMemo(() => {
    const weekdayMap = [
      'شنبه',
      'یکشنبه',
      'دوشنبه',
      'سه‌شنبه',
      'چهارشنبه',
      'پنجشنبه',
      'جمعه'
    ];

    if (!startTime || typeof startTime !== 'string') return [];

    const numberStrings = startTime.split(',').map(s => s.trim());
    const validDays: string[] = [];

    numberStrings.forEach(numStr => {
      const num = parseInt(numStr, 10);
      if (num >= 1 && num <= 7) {
        validDays.push(weekdayMap[num - 1]);
      }
    });

    return validDays;
  }, [startTime]);

  return weekdays;
};

export const useFormattedWeekdays = (weekdays: string[]) => {
  const formatted = useMemo(() => {
    if (weekdays.length === 0) return '';

    if (weekdays.length === 1) {
      return `روز ${weekdays[0]}`;
    }

    if (weekdays.length === 2) {
      return `روزهای ${weekdays[0]} و ${weekdays[1]}`;
    }

    // 3 or more
    const lastDay = weekdays[weekdays.length - 1];
    const restDays = weekdays.slice(0, -1).join('، ');
    return `روزهای ${restDays} و ${lastDay}`;
  }, [weekdays]);

  return formatted;
};

type UsePreparationTimeProps = {
  start: number | null | undefined;
};

export const usePreparationTime = ({ start }: UsePreparationTimeProps): string => {
  return useMemo(() => {
    if (start === null || start === undefined) return '';

    if (start === 0) {
      return 'از زمان سفارش';
    }

    if (start > 0) {
      return `${start} روز بعد از سفارش`;
    }

    // Optional: Handle negative values
    return '';
  }, [start]);
};