/**
 * Compute the current attendance streak (consecutive days ending today or yesterday).
 * Input: list of yyyy-mm-dd strings, any order.
 */
export function computeAttendanceStreak(dates: string[]): {
  current: number;
  longest: number;
  thisMonth: number;
} {
  if (dates.length === 0) return { current: 0, longest: 0, thisMonth: 0 };

  const set = new Set(dates);
  const sorted = [...set].sort(); // ascending yyyy-mm-dd

  // Longest streak across all attendances.
  let longest = 0;
  let run = 0;
  let prev: string | null = null;
  for (const d of sorted) {
    if (prev && isNextDay(prev, d)) run++;
    else run = 1;
    longest = Math.max(longest, run);
    prev = d;
  }

  // Current streak ending today or yesterday (so missing today doesn't break it).
  const today = new Date();
  const todayStr = isoDate(today);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = isoDate(yesterday);

  let current = 0;
  const start = set.has(todayStr) ? todayStr : set.has(yesterdayStr) ? yesterdayStr : null;
  if (start) {
    const cursor = new Date(start);
    while (set.has(isoDate(cursor))) {
      current++;
      cursor.setDate(cursor.getDate() - 1);
    }
  }

  // Days attended in the current calendar month.
  const monthPrefix = todayStr.slice(0, 7); // yyyy-mm
  const thisMonth = sorted.filter((d) => d.startsWith(monthPrefix)).length;

  return { current, longest, thisMonth };
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function isNextDay(prev: string, next: string): boolean {
  const a = new Date(prev);
  a.setDate(a.getDate() + 1);
  return isoDate(a) === next;
}
