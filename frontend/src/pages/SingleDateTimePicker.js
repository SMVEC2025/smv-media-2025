import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { Calendar, ChevronLeft, ChevronRight, ChevronUp } from 'lucide-react';

const parseDateSafe = (value, fallback = null) => {
  if (!value) return fallback;
  
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? fallback : new Date(value.getTime());
  }
  
  if (typeof value === 'string') {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? fallback : d;
  }
  
  return fallback;
};

const extractTime = (date, fallback = { hour: '09', minute: '00', period: 'AM' }) => {
  if (!date) return fallback;
  let hours = date.getHours();
  const period = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return {
    hour: `${hours}`.padStart(2, '0'),
    minute: `${date.getMinutes()}`.padStart(2, '0'),
    period,
  };
};

const isSameDay = (a, b) => {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
};

const SingleDateTimePicker = ({
  value = null,
  onChange,
  label = 'Select date & time',
}) => {
  // Parse the initial date from props
  const initialDate = useMemo(() => {
    const parsed = parseDateSafe(value, new Date());
    return parsed;
  }, []); // Empty dependency - only on mount

  // Internal state
  const [currentMonth, setCurrentMonth] = useState(initialDate);
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [time, setTime] = useState(extractTime(initialDate));

  // UI state
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);
  const [showHourDropdown, setShowHourDropdown] = useState(false);
  const [showMinuteDropdown, setShowMinuteDropdown] = useState(false);

  // Refs
  const timeRef = useRef(null);
  const hourDropdownRef = useRef(null);
  const minuteDropdownRef = useRef(null);
  const containerRef = useRef(null);
  
  // Track if we're handling a user-initiated change
  const isUserChangeRef = useRef(false);

  // Combine date and time
  const combineDateAndTime = useCallback((date, t) => {
    if (!date) return null;
    const base = new Date(date);
    let hour = parseInt(t.hour || '0', 10);
    const minute = parseInt(t.minute || '0', 10) || 0;

    if (t.period === 'PM' && hour < 12) hour += 12;
    if (t.period === 'AM' && hour === 12) hour = 0;

    const combined = new Date(
      base.getFullYear(),
      base.getMonth(),
      base.getDate(),
      hour,
      minute,
      0,
      0
    );
    return Number.isNaN(combined.getTime()) ? null : combined;
  }, []);

  // Format to ISO string
  const toLocalString = useCallback((d) => {
    if (!d) return '';
    const yyyy = d.getFullYear();
    const mm = `${d.getMonth() + 1}`.padStart(2, '0');
    const dd = `${d.getDate()}`.padStart(2, '0');
    const hh = `${d.getHours()}`.padStart(2, '0');
    const mi = `${d.getMinutes()}`.padStart(2, '0');
    return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
  }, []);

  // Handle date selection
  const handleDateSelect = useCallback((date) => {
    isUserChangeRef.current = true;
    setSelectedDate(date);
    
    // Only update current month if the selected date is in a different month
    if (date.getMonth() !== currentMonth.getMonth() || 
        date.getFullYear() !== currentMonth.getFullYear()) {
      setCurrentMonth(new Date(date.getFullYear(), date.getMonth(), 1));
    }
  }, [currentMonth]);

  // Handle time change
  const handleTimeChange = useCallback((newTime) => {
    isUserChangeRef.current = true;
    setTime(newTime);
  }, []);

  // Emit changes to parent - but only for user-initiated changes
  useEffect(() => {
    // Don't emit if this is a sync from parent
    if (!isUserChangeRef.current) return;
    
    if (onChange) {
      const combined = combineDateAndTime(selectedDate, time);
      onChange({
        value: toLocalString(combined),
        date: combined,
      });
    }
    
    // Reset the flag after emitting
    isUserChangeRef.current = false;
  }, [selectedDate, time, onChange, combineDateAndTime, toLocalString]);

  // Sync from parent - only when value prop changes externally
  const prevValueRef = useRef(value);
  useEffect(() => {
    // Skip if value hasn't changed or if this was a user-initiated change
    if (value === prevValueRef.current || isUserChangeRef.current) {
      prevValueRef.current = value;
      return;
    }
    
    const next = parseDateSafe(value, null);
    if (!next) {
      // If value is cleared externally
      const now = new Date();
      setSelectedDate(now);
      setCurrentMonth(now);
      setTime(extractTime(now));
    } else {
      // Only update if the date is different from current
      const currentCombined = combineDateAndTime(selectedDate, time);
      if (!currentCombined || currentCombined.getTime() !== next.getTime()) {
        setSelectedDate(next);
        setCurrentMonth(next);
        setTime(extractTime(next));
      }
    }
    
    prevValueRef.current = value;
  }, [value, selectedDate, time, combineDateAndTime]);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!containerRef.current?.contains(event.target)) {
        setShowTimeDropdown(false);
        setShowHourDropdown(false);
        setShowMinuteDropdown(false);
        return;
      }

      const isInsideTime = timeRef.current?.contains(event.target);
      const isInsideHour = hourDropdownRef.current?.contains(event.target);
      const isInsideMinute = minuteDropdownRef.current?.contains(event.target);

      if (!isInsideTime) setShowTimeDropdown(false);
      if (!isInsideHour) setShowHourDropdown(false);
      if (!isInsideMinute) setShowMinuteDropdown(false);
    };

    document.addEventListener('mousedown', handleClickOutside, true);
    return () => document.removeEventListener('mousedown', handleClickOutside, true);
  }, []);

  // Calendar logic - memoized
  const monthNames = useMemo(() => [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December',
  ], []);

  const weekdayLabels = useMemo(() => ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'], []);

  const monthData = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return { firstDay, daysInMonth };
  }, [currentMonth]);

  const calendarDays = useMemo(() => {
    const { firstDay, daysInMonth } = monthData;
    const days = [];

    for (let i = 0; i < firstDay; i += 1) {
      days.push(<div key={`empty-${i}`} className="p-2" />);
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const thisDate = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        day
      );
      
      const selected = isSameDay(thisDate, selectedDate);

      days.push(
        <div
          key={day}
          onClick={() => handleDateSelect(thisDate)}
          className={`p-2 text-center cursor-pointer text-sm transition-all rounded-md select-none ${
            selected
              ? 'bg-[#2f387f] text-white font-semibold hover:bg-indigo-700'
              : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          {day}
        </div>
      );
    }

    return days;
  }, [monthData, currentMonth, selectedDate, handleDateSelect]);

  const changeMonth = useCallback((delta) => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev.getFullYear(), prev.getMonth() + delta, 1);
      return newDate;
    });
  }, []);

  const formatDisplay = useCallback(() => {
    if (!selectedDate) return 'Select date & time';
    const d = selectedDate;
    const datePart = `${monthNames[d.getMonth()].slice(0, 3)} ${d.getDate()}, ${d.getFullYear()}`;
    const timePart = `${time.hour}:${time.minute} ${time.period}`;
    return `${datePart} • ${timePart}`;
  }, [selectedDate, time, monthNames]);

  // Quick time presets
  const quickTimes = useMemo(() => [
    { label: 'Morning', time: { hour: '09', minute: '00', period: 'AM' } },
    { label: 'Noon', time: { hour: '12', minute: '00', period: 'PM' } },
    { label: 'Afternoon', time: { hour: '03', minute: '00', period: 'PM' } },
    { label: 'Evening', time: { hour: '06', minute: '00', period: 'PM' } },
  ], []);

  // Time selector component
  const TimeSelector = useMemo(() => {
    const TimeSelectorComponent = ({ 
      time, 
      setTime, 
      show, 
      setShow, 
      label, 
      timeRef 
    }) => {
      const handleQuickTimeSelect = useCallback((qtTime) => {
        isUserChangeRef.current = true;
        setTime(qtTime);
      }, [setTime]);

      const handleHourChange = useCallback((hour) => {
        isUserChangeRef.current = true;
        setTime(prev => ({ ...prev, hour }));
      }, []);

      const handleMinuteChange = useCallback((minute) => {
        isUserChangeRef.current = true;
        setTime(prev => ({ ...prev, minute }));
      }, []);

      const handlePeriodChange = useCallback((period) => {
        isUserChangeRef.current = true;
        setTime(prev => ({ ...prev, period }));
      }, []);

      const handleHourInputChange = useCallback((e) => {
        isUserChangeRef.current = true;
        const val = e.target.value.replace(/\D/g, '');
        if (val === '') {
          setTime(prev => ({ ...prev, hour: '' }));
        } else if (val.length <= 2) {
          const num = parseInt(val, 10);
          if (num >= 1 && num <= 12) {
            setTime(prev => ({ ...prev, hour: val }));
          } else if (val.length === 1 && num >= 0 && num <= 9) {
            setTime(prev => ({ ...prev, hour: val }));
          }
        }
      }, [setTime]);

      const handleHourInputBlur = useCallback((e) => {
        setTimeout(() => {
          const val = e.target.value;
          if (val === '' || parseInt(val, 10) === 0) {
            setTime(prev => ({ ...prev, hour: '01' }));
          } else if (parseInt(val, 10) > 12) {
            setTime(prev => ({ ...prev, hour: '12' }));
          } else {
            setTime(prev => ({ ...prev, hour: val.padStart(2, '0') }));
          }
        }, 200);
      }, [setTime]);

      const handleMinuteInputChange = useCallback((e) => {
        isUserChangeRef.current = true;
        const val = e.target.value.replace(/\D/g, '');
        if (val === '') {
          setTime(prev => ({ ...prev, minute: '' }));
        } else if (val.length <= 2) {
          const num = parseInt(val, 10);
          if (num <= 59) {
            setTime(prev => ({ ...prev, minute: val }));
          }
        }
      }, [setTime]);

      const handleMinuteInputBlur = useCallback((e) => {
        setTimeout(() => {
          const val = e.target.value;
          if (val === '') {
            setTime(prev => ({ ...prev, minute: '00' }));
          } else if (parseInt(val, 10) > 59) {
            setTime(prev => ({ ...prev, minute: '59' }));
          } else {
            setTime(prev => ({ ...prev, minute: val.padStart(2, '0') }));
          }
        }, 200);
      }, [setTime]);

      return (
        <div className="relative" ref={timeRef}>
          <label className="text-xs text-gray-500 mb-1 block">{label}</label>
          <div
            className="border rounded px-3 py-2 flex items-center justify-between cursor-pointer bg-white transition-colors"
            style={{
              borderColor: show ? '#37429a' : '#d1d5db',
              transition: 'border-color 0.2s'
            }}
            onClick={() => setShow((prev) => !prev)}
          >
            <span className="text-sm">{time.hour}:{time.minute} {time.period}</span>
            {show ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronUp className="w-4 h-4 text-gray-400 rotate-180" />
            )}
          </div>

          {show && (
            <div className="absolute top-full mt-1 bg-white border rounded-lg shadow-xl z-50 p-4 w-72">
              <div className="mb-3">
                <div className="text-xs font-semibold text-gray-600 mb-2">Quick Select</div>
                <div className="grid grid-cols-2 gap-2">
                  {quickTimes.map((qt) => (
                    <button
                      key={qt.label}
                      type="button"
                      onClick={() => handleQuickTimeSelect(qt.time)}
                      className="px-3 py-2 text-sm border rounded transition-all hover:bg-gray-50"
                      style={{
                        borderColor: '#d1d5db',
                        backgroundColor: 'white'
                      }}
                    >
                      {qt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="text-xs font-semibold text-gray-600 mb-2">Custom Time</div>
              <div className="flex gap-2 items-center">
                {/* Hour */}
                <div className="flex-1 relative" ref={hourDropdownRef}>
                  <label className="text-xs text-gray-500 block mb-1">Hour</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={time.hour}
                      onChange={handleHourInputChange}
                      onBlur={handleHourInputBlur}
                      onFocus={(e) => {
                        e.target.select();
                        setShowHourDropdown(true);
                      }}
                      className="w-full border rounded px-2 py-1 text-sm text-center pr-6"
                      placeholder="01"
                      maxLength={2}
                      style={{ paddingRight: '1.5rem' }}
                    />
                    <div
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 cursor-pointer"
                      onClick={() => setShowHourDropdown(!showHourDropdown)}
                    >
                      <svg width="12" height="12" viewBox="0 0 12 12">
                        <path fill="#666" d="M6 9L1 4h10z" />
                      </svg>
                    </div>
                  </div>
                  {showHourDropdown && (
                    <div className="absolute top-full mt-1 w-full bg-white border rounded shadow-lg z-20 max-h-48 overflow-y-auto">
                      {['01','02','03','04','05','06','07','08','09','10','11','12'].map(h => (
                        <div
                          key={h}
                          onClick={() => {
                            handleHourChange(h);
                            setShowHourDropdown(false);
                          }}
                          className="px-3 py-2 text-sm cursor-pointer transition-colors"
                          style={{
                            backgroundColor: time.hour === h ? '#f0f1f8' : 'white'
                          }}
                        >
                          {h}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Minute */}
                <div className="flex-1 relative" ref={minuteDropdownRef}>
                  <label className="text-xs text-gray-500 block mb-1">Minute</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={time.minute}
                      onChange={handleMinuteInputChange}
                      onBlur={handleMinuteInputBlur}
                      onFocus={(e) => {
                        e.target.select();
                        setShowMinuteDropdown(true);
                      }}
                      className="w-full border rounded px-2 py-1 text-sm text-center pr-6"
                      placeholder="00"
                      maxLength={2}
                      style={{ paddingRight: '1.5rem' }}
                    />
                    <div
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 cursor-pointer"
                      onClick={() => setShowMinuteDropdown(!showMinuteDropdown)}
                    >
                      <svg width="12" height="12" viewBox="0 0 12 12">
                        <path fill="#666" d="M6 9L1 4h10z" />
                      </svg>
                    </div>
                  </div>
                  {showMinuteDropdown && (
                    <div className="absolute top-full mt-1 w-full bg-white border rounded shadow-lg z-20 max-h-48 overflow-y-auto">
                      {['00','05','10','15','20','25','30','35','40','45','50','55'].map(m => (
                        <div
                          key={m}
                          onClick={() => {
                            handleMinuteChange(m);
                            setShowMinuteDropdown(false);
                          }}
                          className="px-3 py-2 text-sm cursor-pointer transition-colors"
                          style={{
                            backgroundColor: time.minute === m ? '#f0f1f8' : 'white'
                          }}
                        >
                          {m}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Period */}
                <div className="flex-1">
                  <label className="text-xs text-gray-500 block mb-1">Period</label>
                  <select
                    value={time.period}
                    onChange={(e) => handlePeriodChange(e.target.value)}
                    className="w-full border rounded px-2 py-1 text-sm"
                  >
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    };
    
    return TimeSelectorComponent;
  }, [quickTimes]);

  return (
    <div 
      ref={containerRef}
      className="rounded-lg border border-slate-200 bg-white shadow-sm"
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 p-4 border-b"
        style={{ backgroundColor: '#f8f9fc' }}
      >
        <Calendar className="w-5 h-5" style={{ color: '#37429a' }} />
        <div className="flex-1">
          <p className="text-xs text-slate-500">{label}</p>
          <span className="text-sm font-medium text-slate-800">
            {formatDisplay()}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 grid md:grid-cols-2 gap-6">
        {/* Calendar */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={() => changeMonth(-1)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="font-semibold text-sm">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </span>
            <button
              type="button"
              onClick={() => changeMonth(1)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-1">
            {weekdayLabels.map((day) => (
              <div
                key={day}
                className="text-center text-[11px] font-medium text-gray-400 p-1"
              >
                {day}
              </div>
            ))}
            {calendarDays}
          </div>
        </div>

        {/* Time picker */}
        <div className="flex flex-col gap-4">
          <TimeSelector
            time={time}
            setTime={handleTimeChange}
            show={showTimeDropdown}
            setShow={setShowTimeDropdown}
            label="Time"
            timeRef={timeRef}
          />
        </div>
      </div>
    </div>
  );
};

export default SingleDateTimePicker;