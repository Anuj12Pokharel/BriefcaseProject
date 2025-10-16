import { useState, useMemo, useCallback } from 'react';
import { X, Check, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

type DateFormat = 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';

interface DateFieldModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (date: string) => void;
  defaultDate?: Date;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
] as const;

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

const DATE_FORMATS: DateFormat[] = ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'];

export default function DateFieldModal({
  isOpen,
  onClose,
  onSave,
  defaultDate
}: DateFieldModalProps): JSX.Element | null {
  const today = new Date();
  const initialDate = defaultDate || today;

  const [selectedDate, setSelectedDate] = useState<Date>(initialDate);
  const [currentMonth, setCurrentMonth] = useState<number>(initialDate.getMonth());
  const [currentYear, setCurrentYear] = useState<number>(initialDate.getFullYear());
  const [format, setFormat] = useState<DateFormat>('MM/DD/YYYY');

  // Format date helper
  const formatDate = useCallback((date: Date, dateFormat: DateFormat): string => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    switch (dateFormat) {
      case 'MM/DD/YYYY':
        return `${month}/${day}/${year}`;
      case 'DD/MM/YYYY':
        return `${day}/${month}/${year}`;
      case 'YYYY-MM-DD':
        return `${year}-${month}-${day}`;
    }
  }, []);

  // Get days in month
  const getDaysInMonth = useCallback((month: number, year: number): number => {
    return new Date(year, month + 1, 0).getDate();
  }, []);

  // Get first day of month
  const getFirstDayOfMonth = useCallback((month: number, year: number): number => {
    return new Date(year, month, 1).getDay();
  }, []);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const days: (number | null)[] = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  }, [currentMonth, currentYear, getDaysInMonth, getFirstDayOfMonth]);

  // Navigate months
  const handlePrevMonth = useCallback(() => {
    setCurrentMonth((prev) => (prev === 0 ? 11 : prev - 1));
    setCurrentYear((prev) => (currentMonth === 0 ? prev - 1 : prev));
  }, [currentMonth]);

  const handleNextMonth = useCallback(() => {
    setCurrentMonth((prev) => (prev === 11 ? 0 : prev + 1));
    setCurrentYear((prev) => (currentMonth === 11 ? prev + 1 : prev));
  }, [currentMonth]);

  // Handle date click
  const handleDateClick = useCallback((day: number) => {
    const newDate = new Date(currentYear, currentMonth, day);
    setSelectedDate(newDate);
  }, [currentMonth, currentYear]);

  // Check if date is selected
  const isSelectedDate = useCallback((day: number | null): boolean => {
    if (!day) return false;
    return (
      day === selectedDate.getDate() &&
      currentMonth === selectedDate.getMonth() &&
      currentYear === selectedDate.getFullYear()
    );
  }, [currentMonth, currentYear, selectedDate]);

  // Check if date is today
  const isToday = useCallback((day: number | null): boolean => {
    if (!day) return false;
    const todayDate = new Date();
    return (
      day === todayDate.getDate() &&
      currentMonth === todayDate.getMonth() &&
      currentYear === todayDate.getFullYear()
    );
  }, [currentMonth, currentYear]);

  // Handle save
  const handleSave = useCallback(() => {
    const formattedDate = formatDate(selectedDate, format);
    onSave(formattedDate);
    onClose();
  }, [selectedDate, format, formatDate, onSave, onClose]);

  // Set to today
  const handleToday = useCallback(() => {
    const now = new Date();
    setSelectedDate(now);
    setCurrentMonth(now.getMonth());
    setCurrentYear(now.getFullYear());
  }, []);

  // Handle background click
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center space-x-2">
            <Calendar className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Select Date</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            aria-label="Close modal"
          >
            <X className="h-6 w-6 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Calendar Section */}
          <div className="mb-6">
            {/* Month/Year Navigation */}
            <div className="flex items-center justify-between mb-6 gap-2">
              <button
                onClick={handlePrevMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                aria-label="Previous month"
              >
                <ChevronLeft className="h-5 w-5 text-gray-600" />
              </button>

              <h3 className="text-lg font-semibold text-gray-900 min-w-[180px] text-center">
                {MONTH_NAMES[currentMonth]} {currentYear}
              </h3>

              <button
                onClick={handleNextMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                aria-label="Next month"
              >
                <ChevronRight className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            {/* Day names header */}
            <div className="grid grid-cols-7 gap-2 mb-3">
              {DAY_NAMES.map((day) => (
                <div
                  key={day}
                  className="text-center text-xs font-semibold text-gray-500 py-2 uppercase tracking-wide"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((day, index) => (
                <button
                  key={`${currentMonth}-${currentYear}-${index}`}
                  onClick={() => day !== null && handleDateClick(day)}
                  disabled={day === null}
                  className={`
                    aspect-square rounded-lg text-sm font-medium transition-all duration-200
                    ${day === null ? 'invisible' : ''}
                    ${isSelectedDate(day)
                      ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
                      : isToday(day)
                      ? 'bg-blue-50 text-blue-600 border-2 border-blue-600 hover:bg-blue-100'
                      : 'text-gray-700 hover:bg-gray-100 border border-gray-200'
                    }
                  `}
                  aria-label={day ? `Select ${MONTH_NAMES[currentMonth]} ${day}, ${currentYear}` : ''}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          {/* Today Button */}
          <div className="mb-6 pb-6 border-b border-gray-200">
            <button
              onClick={handleToday}
              className="w-full py-2 text-blue-600 font-medium hover:bg-blue-50 rounded-lg transition-colors duration-200"
            >
              Today
            </button>
          </div>

          {/* Date Format Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Date Format
            </label>
            <div className="grid grid-cols-3 gap-2">
              {DATE_FORMATS.map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setFormat(fmt)}
                  className={`
                    p-3 rounded-lg border-2 text-xs font-medium transition-all duration-200
                    ${
                      format === fmt
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>

          {/* Selected Date Display */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border-2 border-blue-200">
            <p className="text-xs font-medium text-blue-700 mb-2">Selected Date:</p>
            <p className="text-3xl font-bold text-blue-900 font-mono">
              {formatDate(selectedDate, format)}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between gap-3 bg-gray-50 sticky bottom-0">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-700 font-medium hover:bg-gray-200 rounded-lg transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center space-x-2 bg-blue-600 text-white px-8 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg"
          >
            <Check className="h-5 w-5" />
            <span>Save</span>
          </button>
        </div>
      </div>
    </div>
  );
}