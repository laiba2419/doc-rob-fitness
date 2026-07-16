import { useTheme } from '@/theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Month keys map to the "months" section in the locale JSON files
// (jan, feb, mar ... dec) -- order 0-11 matches Date.getMonth().
const monthKeys = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

// Weekday keys map to the "days" section -- order Mon-Sun to match the
// Monday-first grid used below.
const weekdayKeys = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

// ✅ FIXED: local date use karta hai (device/Pakistan time), UTC nahi --
// home.tsx ke dateKey() se match karta hai ab. Purana version toISOString()
// use karta tha jo UTC deta hai -- isi wajah se "10 pe tap karo to 9 select
// ho jata tha" wala bug aa raha tha.
function dateKey(d: Date) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Builds a 6-row grid (42 cells) for the given month, starting on Monday,
// including the trailing/leading days from adjacent months so every week
// row is fully populated like a normal calendar app.
function buildMonthGrid(year: number, month: number) {
  const firstOfMonth = new Date(year, month, 1);
  const firstWeekday = (firstOfMonth.getDay() + 6) % 7; // 0 = Monday
  const gridStart = new Date(firstOfMonth);
  gridStart.setDate(firstOfMonth.getDate() - firstWeekday);

  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    return d;
  });
}

interface CalendarPickerModalProps {
  visible: boolean;
  onClose: () => void;
  selectedDateKey: string;
  onSelectDate: (key: string) => void;
  /** Optional: dates (dateKey strings) that already have a workout assigned,
   * used to draw a small dot under the day number. */
  scheduledDateKeys?: string[];
}

export default function CalendarPickerModal({
  visible,
  onClose,
  selectedDateKey,
  onSelectDate,
  scheduledDateKeys = [],
}: CalendarPickerModalProps) {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const today = useMemo(() => new Date(), []);

  // ✅ Jab modal khule to selectedDateKey (jo Home se aa raha hai) ke month
  // se shuru ho -- pehle hamesha "aaj" ke month se start hota tha, is liye
  // agar aap kisi doosre mahine ki date select kar chuki hon aur dobara
  // calendar kholein, to galat month dikhta tha.
  const [viewDate, setViewDate] = useState(() => {
    const d = new Date(selectedDateKey + 'T00:00:00');
    d.setDate(1);
    return d;
  });

  const grid = useMemo(
    () => buildMonthGrid(viewDate.getFullYear(), viewDate.getMonth()),
    [viewDate],
  );

  const scheduledSet = useMemo(() => new Set(scheduledDateKeys), [scheduledDateKeys]);

  const goPrevMonth = () => {
    setViewDate((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() - 1);
      return d;
    });
  };

  const goNextMonth = () => {
    setViewDate((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + 1);
      return d;
    });
  };

  const handlePick = (d: Date) => {
    onSelectDate(dateKey(d));
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
      <View style={styles.centerWrap}>
        <View style={[styles.card, { backgroundColor: theme.background }]}>
          {/* Month nav */}
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={goPrevMonth} style={styles.navBtn}>
              <Ionicons name="chevron-back" size={20} color={theme.text} />
            </TouchableOpacity>
            <Text style={[styles.monthLabel, { color: theme.text }]}>
              {t(`months.${monthKeys[viewDate.getMonth()]}`)} {viewDate.getFullYear()}
            </Text>
            <TouchableOpacity onPress={goNextMonth} style={styles.navBtn}>
              <Ionicons name="chevron-forward" size={20} color={theme.text} />
            </TouchableOpacity>
          </View>

          {/* Weekday headers */}
          <View style={styles.weekHeaderRow}>
            {weekdayKeys.map((wk, i) => (
              <Text key={i} style={[styles.weekHeaderText, { color: theme.textSecondary }]}>
                {t(`days.${wk}`).charAt(0)}
              </Text>
            ))}
          </View>

          {/* Day grid */}
          <View style={styles.grid}>
            {grid.map((d, i) => {
              const key = dateKey(d);
              const isCurrentMonth = d.getMonth() === viewDate.getMonth();
              const isToday = dateKey(today) === key;
              const isSelected = selectedDateKey === key;
              const isScheduled = scheduledSet.has(key);

              return (
                <TouchableOpacity
                  key={i}
                  style={styles.cell}
                  onPress={() => handlePick(d)}
                  disabled={!isCurrentMonth}
                >
                  <View
                    style={[
                      styles.cellInner,
                      isSelected && { backgroundColor: theme.primary },
                      isToday && !isSelected && { borderWidth: 1.5, borderColor: theme.primary },
                    ]}
                  >
                    <Text
                      style={[
                        styles.cellText,
                        {
                          color: !isCurrentMonth
                            ? theme.textSecondary + '55'
                            : isSelected
                            ? '#FFFFFF'
                            : theme.text,
                        },
                      ]}
                    >
                      {d.getDate()}
                    </Text>
                  </View>
                  {isScheduled && isCurrentMonth && (
                    <View
                      style={[
                        styles.dot,
                        { backgroundColor: isSelected ? '#FFFFFF' : theme.primary },
                      ]}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  centerWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: { width: '100%', maxWidth: 360, borderRadius: 20, padding: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  navBtn: { padding: 4 },
  monthLabel: { fontSize: 16, fontWeight: '700' },
  weekHeaderRow: { flexDirection: 'row', marginBottom: 4 },
  weekHeaderText: { flex: 1, textAlign: 'center', fontSize: 12, fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: '14.2857%', aspectRatio: 1, justifyContent: 'center', alignItems: 'center' },
  cellInner: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  cellText: { fontSize: 13, fontWeight: '600' },
  dot: { position: 'absolute', bottom: 6, width: 5, height: 5, borderRadius: 2.5 },
});
