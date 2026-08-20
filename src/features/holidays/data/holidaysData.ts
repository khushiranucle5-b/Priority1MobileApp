export interface HolidayData {
  id: string;
  holidayCode: string;
  name: string;
  dateStr: string; // e.g. "August 15, 2026"
  dayOfWeek: string;
  type: 'National Holiday' | 'Company Holiday' | 'Festival Holiday' | 'Public Holiday' | 'Public';
  status: 'Active' | 'Upcoming' | 'Past';
  year: number;
}

export const mockHolidays: HolidayData[] = [
  {
    id: '1',
    holidayCode: 'h-01',
    name: "New Year's Day",
    dateStr: 'January 01, 2026',
    dayOfWeek: 'Thursday',
    type: 'Public',
    status: 'Active',
    year: 2026,
  },
  {
    id: '2',
    holidayCode: 'h-02',
    name: 'Republic Day',
    dateStr: 'January 26, 2026',
    dayOfWeek: 'Monday',
    type: 'National Holiday',
    status: 'Active',
    year: 2026,
  },
  {
    id: '3',
    holidayCode: 'h-03',
    name: 'Holi',
    dateStr: 'March 15, 2026',
    dayOfWeek: 'Sunday',
    type: 'Festival Holiday',
    status: 'Active',
    year: 2026,
  },
  {
    id: '4',
    holidayCode: 'h-04',
    name: 'Labor Day',
    dateStr: 'May 01, 2026',
    dayOfWeek: 'Friday',
    type: 'Public Holiday',
    status: 'Active',
    year: 2026,
  },
  {
    id: '5',
    holidayCode: 'h-05',
    name: 'Independence Day',
    dateStr: 'August 15, 2026',
    dayOfWeek: 'Saturday',
    type: 'National Holiday',
    status: 'Upcoming',
    year: 2026,
  },
  {
    id: '6',
    holidayCode: 'h-06',
    name: 'Foundation Day',
    dateStr: 'August 19, 2026',
    dayOfWeek: 'Wednesday',
    type: 'Company Holiday',
    status: 'Upcoming',
    year: 2026,
  },
  {
    id: '7',
    holidayCode: 'h-07',
    name: 'Company Anniversary',
    dateStr: 'September 10, 2026',
    dayOfWeek: 'Thursday',
    type: 'Company Holiday',
    status: 'Upcoming',
    year: 2026,
  },
  {
    id: '8',
    holidayCode: 'h-08',
    name: 'Diwali',
    dateStr: 'November 01, 2026',
    dayOfWeek: 'Sunday',
    type: 'Festival Holiday',
    status: 'Upcoming',
    year: 2026,
  },
  {
    id: '9',
    holidayCode: 'h-09',
    name: 'Christmas',
    dateStr: 'December 25, 2026',
    dayOfWeek: 'Friday',
    type: 'National Holiday',
    status: 'Upcoming',
    year: 2026,
  },
];

// Helper to convert Date object to YYYY-MM-DD
export const formatDateToISOKey = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

// Helper to parse "August 15, 2026" string to YYYY-MM-DD
export const parseHolidayDateToISO = (dateStr: string): string => {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return formatDateToISOKey(d);
};

// Check if a specific Date is a holiday
export const getHolidayInfoForDate = (date: Date): { isHoliday: boolean; holidayName?: string; holidayType?: string } => {
  const targetKey = formatDateToISOKey(date);
  for (const h of mockHolidays) {
    const hKey = parseHolidayDateToISO(h.dateStr);
    if (hKey === targetKey) {
      return {
        isHoliday: true,
        holidayName: h.name,
        holidayType: h.type,
      };
    }
  }
  return { isHoliday: false };
};

// Check if any date in a range (inclusive) is a holiday
export const checkDateRangeForHolidays = (startDate: Date, endDate: Date) => {
  const current = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
  const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());

  while (current <= end) {
    const info = getHolidayInfoForDate(current);
    if (info.isHoliday) {
      const dStr = current.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
      return {
        hasHoliday: true,
        holidayName: info.holidayName,
        holidayDateStr: dStr,
        dateObj: new Date(current),
      };
    }
    current.setDate(current.getDate() + 1);
  }
  return { hasHoliday: false };
};
