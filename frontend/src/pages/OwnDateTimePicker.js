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

const OwnDateTimePicker = ({
    value = { start: null, end: null },
    onChange,
    label = 'Select date & time',
}) => {
    const today = useMemo(() => new Date(), []);

    // Parse initial values from props
    const initialDates = useMemo(() => {
        const startValue = value?.start || value?.from;
        const endValue = value?.end || value?.to;

        const initialFrom = parseDateSafe(startValue, today) || today;
        const initialTo = parseDateSafe(endValue, null);

        return { from: initialFrom, to: initialTo };
    }, []); // Only on mount

    // Internal state
    const [currentMonth, setCurrentMonth] = useState(initialDates.from || today);
    const [fromDate, setFromDate] = useState(initialDates.from);
    const [toDate, setToDate] = useState(initialDates.to);
    const [fromTime, setFromTime] = useState(extractTime(initialDates.from));
    const [toTime, setToTime] = useState(extractTime(initialDates.to || initialDates.from));

    // UI state - SEPARATE DROPDOWNS FOR EACH TIME PICKER
    const [showFromTimeDropdown, setShowFromTimeDropdown] = useState(false);
    const [showToTimeDropdown, setShowToTimeDropdown] = useState(false);
    const [showFromHourDropdown, setShowFromHourDropdown] = useState(false);
    const [showFromMinuteDropdown, setShowFromMinuteDropdown] = useState(false);
    const [showToHourDropdown, setShowToHourDropdown] = useState(false);
    const [showToMinuteDropdown, setShowToMinuteDropdown] = useState(false);

    // Refs
    const fromTimeRef = useRef(null);
    const toTimeRef = useRef(null);
    const fromHourDropdownRef = useRef(null);
    const fromMinuteDropdownRef = useRef(null);
    const toHourDropdownRef = useRef(null);
    const toMinuteDropdownRef = useRef(null);
    const containerRef = useRef(null);

    // Track user-initiated changes
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

    // SIMPLE AND INTUITIVE DATE SELECTION LOGIC
    const handleDateSelect = useCallback((selectedDate) => {
        isUserChangeRef.current = true;

        // If we have no dates selected yet
        if (!fromDate) {
            // First click: Set start date only
            setFromDate(selectedDate);
            setToDate(null); // Ensure no end date
            return;
        }

        // If we have only start date (no end date yet)
        if (fromDate && !toDate) {
            // Check if clicking the same date
            if (isSameDay(selectedDate, fromDate)) {
                // Clicking same date: Keep as single date, do nothing or you could clear
                // For now, we'll keep it as is (single date)
                return;
            }

            // Second click on different date: Create range
            let finalFromDate = fromDate;
            let finalToDate = selectedDate;

            // Ensure fromDate is always earlier than toDate
            if (selectedDate < fromDate) {
                finalFromDate = selectedDate;
                finalToDate = fromDate;
            }

            setFromDate(finalFromDate);
            setToDate(finalToDate);
            return;
        }

        // If we already have both dates selected (range is set)
        if (fromDate && toDate) {
            // Third click: Start fresh with this date as start
            setFromDate(selectedDate);
            setToDate(null);
        }
    }, [fromDate, toDate]);

    // Handle time changes
    const handleFromTimeChange = useCallback((newTime) => {
        isUserChangeRef.current = true;
        setFromTime(newTime);
    }, []);

    const handleToTimeChange = useCallback((newTime) => {
        isUserChangeRef.current = true;
        setToTime(newTime);
    }, []);

    // Change month
    const changeMonth = useCallback((delta) => {
        setCurrentMonth(prev => {
            const newDate = new Date(prev.getFullYear(), prev.getMonth() + delta, 1);
            return newDate;
        });
    }, []);

    // Emit changes to parent
    useEffect(() => {
        if (!isUserChangeRef.current || !onChange) return;

        const fromCombined = combineDateAndTime(fromDate, fromTime);
        const toCombined = toDate ? combineDateAndTime(toDate, toTime) : null;

        onChange({
            start: toLocalString(fromCombined),
            end: toLocalString(toCombined),
            from: fromCombined,
            to: toCombined,
        });

        isUserChangeRef.current = false;
    }, [fromDate, fromTime, toDate, toTime, onChange, combineDateAndTime, toLocalString]);

    // Sync from parent value changes
    const prevValueRef = useRef(value);
    useEffect(() => {
        // Skip if value hasn't changed or if this was a user-initiated change
        if (value === prevValueRef.current || isUserChangeRef.current) {
            prevValueRef.current = value;
            return;
        }

        const startValue = value?.start || value?.from;
        const endValue = value?.end || value?.to;

        const nextFrom = parseDateSafe(startValue, null);
        const nextTo = parseDateSafe(endValue, null);

        // Only update if dates are different
        if ((nextFrom && (!fromDate || fromDate.getTime() !== nextFrom.getTime())) ||
            (nextTo && (!toDate || toDate.getTime() !== nextTo.getTime())) ||
            (!nextTo && toDate)) {

            setFromDate(nextFrom || today);
            setToDate(nextTo);
            setFromTime(extractTime(nextFrom || today));
            setToTime(extractTime(nextTo || nextFrom || today));

            if (nextFrom) {
                setCurrentMonth(nextFrom);
            }
        }

        prevValueRef.current = value;
    }, [value, fromDate, toDate, today]);

    // Click outside handler
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!containerRef.current?.contains(event.target)) {
                setShowFromTimeDropdown(false);
                setShowToTimeDropdown(false);
                setShowFromHourDropdown(false);
                setShowFromMinuteDropdown(false);
                setShowToHourDropdown(false);
                setShowToMinuteDropdown(false);
                return;
            }

            const isInsideFrom = fromTimeRef.current?.contains(event.target);
            const isInsideTo = toTimeRef.current?.contains(event.target);
            const isInsideFromHour = fromHourDropdownRef.current?.contains(event.target);
            const isInsideFromMinute = fromMinuteDropdownRef.current?.contains(event.target);
            const isInsideToHour = toHourDropdownRef.current?.contains(event.target);
            const isInsideToMinute = toMinuteDropdownRef.current?.contains(event.target);

            if (!isInsideFrom) setShowFromTimeDropdown(false);
            if (!isInsideTo) setShowToTimeDropdown(false);
            if (!isInsideFromHour) setShowFromHourDropdown(false);
            if (!isInsideFromMinute) setShowFromMinuteDropdown(false);
            if (!isInsideToHour) setShowToHourDropdown(false);
            if (!isInsideToMinute) setShowToMinuteDropdown(false);
        };

        document.addEventListener('mousedown', handleClickOutside, true);
        return () => document.removeEventListener('mousedown', handleClickOutside, true);
    }, []);

    // Calendar logic
    const monthNames = useMemo(() => [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December',
    ], []);

    const weekdayLabels = useMemo(() => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], []);

    const monthData = useMemo(() => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        return { firstDay, daysInMonth };
    }, [currentMonth]);

    // Check if date is in range
    const isDateInRange = useCallback((date) => {
        if (!fromDate || !toDate) return false;

        // If both dates are the same, no range
        if (isSameDay(fromDate, toDate)) return false;

        const startDate = fromDate < toDate ? fromDate : toDate;
        const endDate = fromDate < toDate ? toDate : fromDate;

        return date > startDate && date < endDate;
    }, [fromDate, toDate]);

    // Check if date is start
    const isDateStart = useCallback((date) => {
        if (!fromDate) return false;
        return isSameDay(date, fromDate);
    }, [fromDate]);

    // Check if date is end
    const isDateEnd = useCallback((date) => {
        if (!toDate) return false;
        return isSameDay(date, toDate);
    }, [toDate]);

    // Calendar days
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

            const isStart = isDateStart(thisDate);
            const isEnd = isDateEnd(thisDate);
            const inRange = isDateInRange(thisDate);

            let className = "p-2 text-center cursor-pointer text-sm transition-all select-none";

            if (isStart) {
                if (isEnd) {
                    // Same day selected as both start and end (single date)
                    className += " bg-[#2f387f] text-white font-semibold rounded";
                } else if (toDate && !isSameDay(fromDate, toDate)) {
                    // Start of range
                    className += " bg-[#2f387f] text-white font-semibold rounded-l";
                } else {
                    // Single date
                    className += " bg-[#2f387f] text-white font-semibold rounded";
                }
            } else if (isEnd) {
                // End of range
                className += " bg-[#2f387f] text-white font-semibold rounded-r";
            } else if (inRange) {
                className += " bg-indigo-100 text-indigo-700";
            } else {
                className += " text-slate-700 hover:bg-slate-100";
            }

            days.push(
                <div
                    key={day}
                    onClick={() => handleDateSelect(thisDate)}
                    className={className}
                >
                    {day}
                </div>
            );
        }

        return days;
    }, [monthData, currentMonth, isDateStart, isDateEnd, isDateInRange, handleDateSelect, fromDate, toDate]);

    // Format display text
    const formatDisplay = useCallback(() => {
        if (!fromDate) return 'Select date & time';

        const formatDate = (date) => {
            return `${monthNames[date.getMonth()].slice(0, 3)} ${date.getDate()}, ${date.getFullYear()}`;
        };

        const startText = `${formatDate(fromDate)} ${fromTime.hour}:${fromTime.minute} ${fromTime.period}`;

        if (!toDate || isSameDay(fromDate, toDate)) {
            return startText;
        }

        const endText = `${formatDate(toDate)} ${toTime.hour}:${toTime.minute} ${toTime.period}`;

        return `${startText} - ${endText}`;
    }, [fromDate, toDate, fromTime, toTime, monthNames]);

    // Quick time presets
    const quickTimes = useMemo(() => [
        { label: 'Morning', time: { hour: '09', minute: '00', period: 'AM' } },
        { label: 'Noon', time: { hour: '12', minute: '00', period: 'PM' } },
        { label: 'Afternoon', time: { hour: '03', minute: '00', period: 'PM' } },
        { label: 'Evening', time: { hour: '06', minute: '00', period: 'PM' } },
    ], []);

    // Time selector component - FIXED VERSION
    const TimeSelector = useMemo(() => {
        const TimeSelectorComponent = ({
            time,
            setTime,
            show,
            setShow,
            label,
            timeRef,
            hourDropdownRef,
            minuteDropdownRef,
            showHourDropdown,
            setShowHourDropdown,
            showMinuteDropdown,
            setShowMinuteDropdown,
        }) => {
            const handleQuickTimeSelect = useCallback((qtTime) => {
                isUserChangeRef.current = true;
                setTime(qtTime);
            }, [setTime]);

            const handleHourChange = useCallback((hour) => {
                isUserChangeRef.current = true;
                setTime(prev => ({ ...prev, hour }));
                setShowHourDropdown(false);
            }, [setTime, setShowHourDropdown]);

            const handleMinuteChange = useCallback((minute) => {
                isUserChangeRef.current = true;
                setTime(prev => ({ ...prev, minute }));
                setShowMinuteDropdown(false);
            }, [setTime, setShowMinuteDropdown]);

            const handlePeriodChange = useCallback((period) => {
                isUserChangeRef.current = true;
                setTime(prev => ({ ...prev, period }));
            }, [setTime]);

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
                    setShowHourDropdown(false);
                }, 200);
            }, [setTime, setShowHourDropdown]);

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
                    setShowMinuteDropdown(false);
                }, 200);
            }, [setTime, setShowMinuteDropdown]);

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
                                            className="w-full border rounded px-2 py-1 text-sm text-center pr-6 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            placeholder="01"
                                            maxLength={2}
                                            style={{ paddingRight: '1.5rem' }}
                                        />
                                        <div
                                            className="absolute right-1 top-1/2 transform -translate-y-1/2 cursor-pointer"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setShowHourDropdown(!showHourDropdown);
                                            }}
                                        >
                                            <svg width="12" height="12" viewBox="0 0 12 12">
                                                <path fill="#666" d="M6 9L1 4h10z" />
                                            </svg>
                                        </div>
                                    </div>
                                    {showHourDropdown && (
                                        <div className="absolute top-full mt-1 w-full bg-white border rounded shadow-lg z-20 max-h-48 overflow-y-auto">
                                            {['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'].map(h => (
                                                <div
                                                    key={h}
                                                    onClick={() => handleHourChange(h)}
                                                    className="px-3 py-2 text-sm cursor-pointer transition-colors hover:bg-indigo-50"
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
                                            className="w-full border rounded px-2 py-1 text-sm text-center pr-6 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            placeholder="00"
                                            maxLength={2}
                                            style={{ paddingRight: '1.5rem' }}
                                        />
                                        <div
                                            className="absolute right-1 top-1/2 transform -translate-y-1/2 cursor-pointer"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setShowMinuteDropdown(!showMinuteDropdown);
                                            }}
                                        >
                                            <svg width="12" height="12" viewBox="0 0 12 12">
                                                <path fill="#666" d="M6 9L1 4h10z" />
                                            </svg>
                                        </div>
                                    </div>
                                    {showMinuteDropdown && (
                                        <div className="absolute top-full mt-1 w-full bg-white border rounded shadow-lg z-20 max-h-48 overflow-y-auto">
                                            {['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'].map(m => (
                                                <div
                                                    key={m}
                                                    onClick={() => handleMinuteChange(m)}
                                                    className="px-3 py-2 text-sm cursor-pointer transition-colors hover:bg-indigo-50"
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
                                        className="w-full border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
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

    // Reset selection
    const handleResetSelection = useCallback(() => {
        isUserChangeRef.current = true;
        setFromDate(today);
        setToDate(null);
        setFromTime(extractTime(today));
        setToTime(extractTime(today));
    }, [today]);

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
                        {/* {formatDisplay()} */}
                        <p>
                            {fromDate
                                ? `Start: ${monthNames[fromDate.getMonth()]} ${fromDate.getDate()}, ${fromDate.getFullYear()}`
                                : 'Click a date to start selection'
                            }
                            {toDate && !isSameDay(fromDate, toDate) && (
                                <>
                                    {' - '}
                                    {`End: ${monthNames[toDate.getMonth()]} ${toDate.getDate()}, ${toDate.getFullYear()}`}
                                </>
                            )}
                        </p>

                    </span>
                </div>
                {(fromDate || toDate) && (
                    <button
                        type="button"
                        onClick={handleResetSelection}
                        className="text-xs text-gray-500 hover:text-gray-700"
                    >
                        Reset
                    </button>
                )}
            </div>

            {/* Body */}
            <div className="p-4">
                {/* Simple instructions */}
                <div className="mb-4 text-xs text-gray-600">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded bg-[#2f387f]"></div>
                            <span>Selected date(s)</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded bg-indigo-100"></div>
                            <span>Date range</span>
                        </div>
                    </div>

                </div>

                <div className="grid md:grid-cols-2 gap-6">
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

                    {/* Time pickers */}
                    <div className="flex flex-col gap-4">
                        {/* From Time Picker */}
                        <TimeSelector
                            time={fromTime}
                            setTime={handleFromTimeChange}
                            show={showFromTimeDropdown}
                            setShow={setShowFromTimeDropdown}
                            label="From Time"
                            timeRef={fromTimeRef}
                            hourDropdownRef={fromHourDropdownRef}
                            minuteDropdownRef={fromMinuteDropdownRef}
                            showHourDropdown={showFromHourDropdown}
                            setShowHourDropdown={setShowFromHourDropdown}
                            showMinuteDropdown={showFromMinuteDropdown}
                            setShowMinuteDropdown={setShowFromMinuteDropdown}
                        />

                        {/* To Time Picker */}
                        <TimeSelector
                            time={toTime}
                            setTime={handleToTimeChange}
                            show={showToTimeDropdown}
                            setShow={setShowToTimeDropdown}
                            label="To Time"
                            timeRef={toTimeRef}
                            hourDropdownRef={toHourDropdownRef}
                            minuteDropdownRef={toMinuteDropdownRef}
                            showHourDropdown={showToHourDropdown}
                            setShowHourDropdown={setShowToHourDropdown}
                            showMinuteDropdown={showToMinuteDropdown}
                            setShowMinuteDropdown={setShowToMinuteDropdown}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OwnDateTimePicker;