/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Plus,
  Search,
  Check,
  Clock,
  MapPin,
  Edit3,
  Trash2,
  CalendarDays,
  CheckSquare,
  BarChart3,
  Timer,
  SlidersHorizontal,
  ArrowRight,
} from 'lucide-react';
import {
  ScheduleItem,
  ScheduleCategory,
  RoutineToggle,
  CATEGORY_META,
  PRIORITY_META,
  formatDateKey,
  calculateDurationMinutes,
  filterAndSortSchedules,
  computeDailyStats,
  buildMonthGrid,
  createInitialSchedules,
  validateScheduleInput,
} from './utils/scheduleLogic';
import { TactileCalendar } from './components/TactileCalendar';
import { FocusRoutinePanel } from './components/FocusRoutinePanel';
import { ScheduleModal } from './components/ScheduleModal';

const STORAGE_KEY_SCHEDULES = 'tactileflow_schedules_v1';
const STORAGE_KEY_ROUTINES = 'tactileflow_routines_v1';
const STORAGE_KEY_GOAL = 'tactileflow_daily_goal_v1';

const DEFAULT_ROUTINES: RoutineToggle[] = [
  {
    id: 'routine-morning',
    label: '오전 타임블록 알림 잠금',
    subtitle: '09:00–12:00 집중 모드 자동 전환',
    enabled: true,
    targetMinutes: 180,
  },
  {
    id: 'routine-review',
    label: '일일 마감 회고 리마인더',
    subtitle: '18:00 미완료 과업 자동 이관 알림',
    enabled: true,
    targetMinutes: 15,
  },
  {
    id: 'routine-stretch',
    label: '50분 주기 휴식 가이드',
    subtitle: '장시간 착석 시 스트레칭 촉각 신호',
    enabled: false,
    targetMinutes: 10,
  },
];

type WorkspaceTab = 'dashboard' | 'timeline' | 'focus' | 'analytics';

export default function App() {
  const todayStr = useMemo(() => formatDateKey(new Date()), []);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [viewYear, setViewYear] = useState<number>(() => new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(() => new Date().getMonth());
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('dashboard');

  const [schedules, setSchedules] = useState<ScheduleItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SCHEDULES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Fallback to deterministic seed
    }
    return createInitialSchedules(todayStr);
  });

  const [routines, setRoutines] = useState<RoutineToggle[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ROUTINES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Fallback
    }
    return DEFAULT_ROUTINES;
  });

  const [dailyGoalMinutes, setDailyGoalMinutes] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_GOAL);
      if (saved) {
        const num = Number(saved);
        if (!Number.isNaN(num) && num >= 120 && num <= 600) return num;
      }
    } catch {
      // Fallback
    }
    return 360; // 6 hours default
  });

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<ScheduleCategory | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'pending' | 'completed'>('all');

  // Quick inline add state
  const [quickTitle, setQuickTitle] = useState<string>('');
  const [quickStart, setQuickStart] = useState<string>('11:00');
  const [quickEnd, setQuickEnd] = useState<string>('12:00');
  const [quickCategory, setQuickCategory] = useState<ScheduleCategory>('work');
  const [quickError, setQuickError] = useState<string | null>(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SCHEDULES, JSON.stringify(schedules));
    } catch {
      // Ignore storage quota errors
    }
  }, [schedules]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ROUTINES, JSON.stringify(routines));
    } catch {
      // Ignore
    }
  }, [routines]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_GOAL, String(dailyGoalMinutes));
    } catch {
      // Ignore
    }
  }, [dailyGoalMinutes]);

  const monthCells = useMemo(
    () => buildMonthGrid(viewYear, viewMonth, todayStr, schedules),
    [viewYear, viewMonth, todayStr, schedules]
  );

  const dailyStats = useMemo(
    () => computeDailyStats(schedules, selectedDate),
    [schedules, selectedDate]
  );

  const visibleSchedules = useMemo(
    () =>
      filterAndSortSchedules(schedules, {
        date: searchQuery.trim() ? undefined : selectedDate,
        category: selectedCategory,
        status: selectedStatus,
        searchQuery,
      }),
    [schedules, selectedDate, selectedCategory, selectedStatus, searchQuery]
  );

  const handleSelectDate = (dateStr: string) => {
    setSelectedDate(dateStr);
    const [y, m] = dateStr.split('-').map(Number);
    if (y && m) {
      setViewYear(y);
      setViewMonth(m - 1);
    }
  };

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleJumpToday = () => {
    const now = new Date();
    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth());
    setSelectedDate(todayStr);
  };

  const handleToggleComplete = (id: string) => {
    setSchedules((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const handleDeleteSchedule = (id: string) => {
    setSchedules((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSaveSchedule = (
    itemData: Omit<ScheduleItem, 'id'>,
    existingId?: string
  ) => {
    if (existingId) {
      setSchedules((prev) =>
        prev.map((item) =>
          item.id === existingId ? { ...itemData, id: existingId } : item
        )
      );
    } else {
      const newItem: ScheduleItem = {
        ...itemData,
        id: `sched-${Date.now()}`,
      };
      setSchedules((prev) => [...prev, newItem]);
      setSelectedDate(itemData.date);
    }
  };

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateScheduleInput({
      title: quickTitle,
      date: selectedDate,
      startTime: quickStart,
      endTime: quickEnd,
    });
    if (!validation.valid) {
      setQuickError(validation.error ?? '일정 입력을 확인해 주세요.');
      return;
    }

    const newItem: ScheduleItem = {
      id: `sched-${Date.now()}`,
      title: quickTitle.trim(),
      date: selectedDate,
      startTime: quickStart,
      endTime: quickEnd,
      category: quickCategory,
      priority: 'medium',
      completed: false,
      reminderEnabled: true,
    };
    setSchedules((prev) => [...prev, newItem]);
    setQuickTitle('');
    setQuickError(null);
  };

  const handleToggleRoutine = (id: string) => {
    setRoutines((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    );
  };

  const handleCompleteFocusSession = useCallback(
    (minutes: number, label: string) => {
      const now = new Date();
      const endH = String(now.getHours()).padStart(2, '0');
      const endM = String(now.getMinutes()).padStart(2, '0');
      const startTotal = Math.max(0, now.getHours() * 60 + now.getMinutes() - minutes);
      const startH = String(Math.floor(startTotal / 60)).padStart(2, '0');
      const startM = String(startTotal % 60).padStart(2, '0');

      const completedFocusItem: ScheduleItem = {
        id: `focus-${Date.now()}`,
        title: `[몰입 완료] ${label}`,
        date: selectedDate,
        startTime: `${startH}:${startM}`,
        endTime: `${endH}:${endM}`,
        category: 'focus',
        priority: 'high',
        completed: true,
        reminderEnabled: false,
      };
      setSchedules((prev) => [...prev, completedFocusItem]);
    },
    [selectedDate]
  );

  // Compute 7-day weekly overview around selectedDate
  const weekOverview = useMemo(() => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const center = new Date(y, m - 1, d);
    const dayOfWeek = center.getDay();
    const sunday = new Date(y, m - 1, d - dayOfWeek);
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];

    return Array.from({ length: 7 }, (_, idx) => {
      const curr = new Date(
        sunday.getFullYear(),
        sunday.getMonth(),
        sunday.getDate() + idx
      );
      const dateStr = formatDateKey(curr);
      const stats = computeDailyStats(schedules, dateStr);
      return {
        dateStr,
        dayLabel: dayNames[idx],
        dayNum: curr.getDate(),
        stats,
      };
    });
  }, [selectedDate, schedules]);

  return (
    <div className="min-h-screen neu-canvas text-[#1e293b] flex flex-col">
      {/* Strict 3-Zone Top Bar Contract */}
      <header className="w-full max-w-7xl mx-auto px-5 md:px-8 pt-5 pb-3 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            setActiveTab('dashboard');
          }}
          className="text-xl font-bold tracking-tight text-[#1e293b] whitespace-nowrap shrink-0"
        >
          TactileFlow
        </a>

        {/* Zone 2: 4 concise single-line text navigation links */}
        <nav
          aria-label="주요 워크스페이스 탐색"
          className="hidden md:flex items-center gap-7 text-sm font-semibold text-[#64748b]"
        >
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
              activeTab === 'dashboard'
                ? 'text-[#3b82f6] border-[#3b82f6]'
                : 'border-transparent hover:text-[#1e293b]'
            }`}
          >
            일정 대시보드
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('timeline')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
              activeTab === 'timeline'
                ? 'text-[#3b82f6] border-[#3b82f6]'
                : 'border-transparent hover:text-[#1e293b]'
            }`}
          >
            주간 타임라인
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('focus')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
              activeTab === 'focus'
                ? 'text-[#3b82f6] border-[#3b82f6]'
                : 'border-transparent hover:text-[#1e293b]'
            }`}
          >
            몰입 & 루틴
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('analytics')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
              activeTab === 'analytics'
                ? 'text-[#3b82f6] border-[#3b82f6]'
                : 'border-transparent hover:text-[#1e293b]'
            }`}
          >
            실행 리포트
          </button>
        </nav>

        {/* Zone 3: 1 primary action CTA */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={() => {
              setEditingItem(null);
              setIsModalOpen(true);
            }}
            className="neu-btn-primary min-h-[44px] px-5 rounded-full text-xs font-semibold flex items-center gap-2 whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" />
            새 일정 추가
          </button>
        </div>
      </header>

      {/* Mobile Segmented Navigation (Shown below header on narrow viewports) */}
      <div className="md:hidden px-5 pt-2 pb-1">
        <div className="neu-debossed rounded-full p-1.5 grid grid-cols-4 gap-1">
          {[
            { id: 'dashboard', label: '대시보드' },
            { id: 'timeline', label: '주간뷰' },
            { id: 'focus', label: '타이머' },
            { id: 'analytics', label: '리포트' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as WorkspaceTab)}
              className={`min-h-[38px] rounded-full text-xs font-semibold transition-all whitespace-nowrap shrink-0 ${
                activeTab === tab.id
                  ? 'neu-extruded-sm text-[#3b82f6] font-bold'
                  : 'text-[#64748b]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-5 md:px-8 py-6">
        {/* Top Weekly Quick Date Scroller & Summary Strip */}
        <section
          aria-label="주간 날짜 빠른 선택 및 핵심 지표"
          className="neu-extruded rounded-[20px] p-5 mb-6"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div className="space-y-1.5">
              <div className="text-xs font-semibold text-[#64748b] flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="whitespace-nowrap">택타일 뉴모피즘 워크스페이스</span>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums text-[#3b82f6] font-bold whitespace-nowrap">
                  선택된 날짜 {selectedDate}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl md:text-[28px] font-bold tracking-tight text-[#1e293b] text-balance leading-snug">
                차분한 입체 표면 위에서 하루의 흐름과 몰입을 조각하세요
              </h1>
            </div>

            {/* 7-Day Tactile Date Strip */}
            <div
              className="grid grid-cols-7 gap-1.5 sm:gap-2.5"
              role="group"
              aria-label="이번 주 날짜 선택"
            >
              {weekOverview.map((day) => {
                const isSelected = day.dateStr === selectedDate;
                return (
                  <button
                    key={day.dateStr}
                    type="button"
                    onClick={() => handleSelectDate(day.dateStr)}
                    className={`min-h-[60px] px-1.5 sm:px-2.5 py-2 rounded-[16px] flex flex-col items-center justify-center transition-all tabular-nums ${
                      isSelected
                        ? 'neu-debossed text-[#3b82f6] font-bold ring-2 ring-[#3b82f6]'
                        : 'neu-btn text-[#1e293b]'
                    }`}
                  >
                    <span className="text-[11px] text-[#64748b] font-semibold">
                      {day.dayLabel}
                    </span>
                    <span className="text-sm font-bold mt-0.5">{day.dayNum}</span>
                    <span className="text-[10px] text-[#64748b] mt-0.5 whitespace-nowrap">
                      {day.stats.totalCount}건
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Dedicated Top-Level Panel when User Switches Tab to Weekly Timeline, Focus, or Analytics */}
        {activeTab === 'timeline' && (
          <section
            aria-label="주간 타임라인 매트릭스"
            className="neu-extruded rounded-[20px] p-6 mb-6 space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-xs font-semibold text-[#64748b] block">
                  주간 일정 전체 조망
                </span>
                <h2 className="text-xl font-bold text-[#1e293b]">
                  7일 타임블록 매트릭스
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('dashboard')}
                className="neu-btn px-4 min-h-[40px] rounded-full text-xs font-semibold text-[#3b82f6] whitespace-nowrap shrink-0"
              >
                일정 대시보드 보기
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
              {weekOverview.map((day) => {
                const dayEvents = filterAndSortSchedules(schedules, {
                  date: day.dateStr,
                });
                return (
                  <div
                    key={day.dateStr}
                    className={`rounded-[16px] p-3.5 space-y-2.5 ${
                      day.dateStr === selectedDate
                        ? 'neu-debossed ring-1 ring-[#3b82f6]'
                        : 'neu-extruded-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-bold tabular-nums">
                      <span>
                        {day.dayNum}일 ({day.dayLabel})
                      </span>
                      <span className="text-[#3b82f6]">{dayEvents.length}건</span>
                    </div>
                    <div className="space-y-2">
                      {dayEvents.length === 0 ? (
                        <div className="text-[11px] text-[#64748b] py-3 text-center">
                          일정 없음
                        </div>
                      ) : (
                        dayEvents.map((ev) => (
                          <button
                            key={ev.id}
                            type="button"
                            onClick={() => {
                              setEditingItem(ev);
                              setIsModalOpen(true);
                            }}
                            className="w-full text-left neu-debossed-sm rounded-[12px] p-2.5 text-xs space-y-0.5 hover:ring-1 hover:ring-[#3b82f6]"
                          >
                            <div className="font-mono text-[10px] text-[#3b82f6] font-semibold tabular-nums">
                              {ev.startTime}–{ev.endTime}
                            </div>
                            <div
                              className={`font-semibold text-[#1e293b] truncate ${
                                ev.completed ? 'line-through text-[#64748b]' : ''
                              }`}
                            >
                              {ev.title}
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {activeTab === 'analytics' && (
          <section
            aria-label="주간 실행 리포트 상세"
            className="neu-extruded rounded-[20px] p-6 mb-6 space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-xs font-semibold text-[#64748b] block">
                  실행 데이터 인사이트
                </span>
                <h2 className="text-xl font-bold text-[#1e293b]">
                  주간 생산성 및 타임블록 이행 지표
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('dashboard')}
                className="neu-btn px-4 min-h-[40px] rounded-full text-xs font-semibold text-[#3b82f6] whitespace-nowrap shrink-0"
              >
                일정 대시보드 보기
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="neu-debossed rounded-[18px] p-5 space-y-1">
                <span className="text-xs font-semibold text-[#64748b]">
                  전체 등록 일정
                </span>
                <div className="text-2xl font-bold text-[#1e293b] tabular-nums">
                  {schedules.length}건
                </div>
                <p className="text-xs text-[#64748b]">
                  완료 {schedules.filter((s) => s.completed).length}건 · 대기{' '}
                  {schedules.filter((s) => !s.completed).length}건
                </p>
              </div>

              <div className="neu-debossed rounded-[18px] p-5 space-y-1">
                <span className="text-xs font-semibold text-[#64748b]">
                  선택일({selectedDate}) 계획 시간
                </span>
                <div className="text-2xl font-bold text-[#3b82f6] tabular-nums">
                  {dailyStats.totalPlannedMinutes}분
                </div>
                <p className="text-xs text-[#64748b]">
                  완료된 타임블록 {dailyStats.completedMinutes}분
                </p>
              </div>

              <div className="neu-debossed rounded-[18px] p-5 space-y-1">
                <span className="text-xs font-semibold text-[#64748b]">
                  활성화된 데일리 루틴
                </span>
                <div className="text-2xl font-bold text-[#1e293b] tabular-nums">
                  {routines.filter((r) => r.enabled).length} / {routines.length}개
                </div>
                <p className="text-xs text-[#64748b]">
                  촉각 리마인더 및 자동 집중 블록 연동됨
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Main 12-Column Responsive Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (4 cols on desktop): Monthly Sculpted Calendar & Goal Tracker */}
          <div className="lg:col-span-4 space-y-6">
            <TactileCalendar
              year={viewYear}
              monthZeroIndexed={viewMonth}
              selectedDate={selectedDate}
              todayStr={todayStr}
              cells={monthCells}
              dailyStats={dailyStats}
              dailyGoalMinutes={dailyGoalMinutes}
              onSelectDate={handleSelectDate}
              onPrevMonth={handlePrevMonth}
              onNextMonth={handleNextMonth}
              onJumpToday={handleJumpToday}
              onChangeGoalMinutes={setDailyGoalMinutes}
            />
          </div>

          {/* Center Column (5 cols on desktop): Schedule Timeline, Quick Add & Task Checklists */}
          <div className="lg:col-span-5 space-y-6">
            {/* Inline Quick-Add Tactile Card */}
            <section
              aria-label="빠른 일정 등록"
              className="neu-extruded rounded-[20px] p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-xs font-semibold text-[#64748b] block">
                    빠른 타임블록 입력
                  </span>
                  <h2 className="text-[18px] font-semibold text-[#1e293b]">
                    {selectedDate} 일정 즉시 추가
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditingItem(null);
                    setIsModalOpen(true);
                  }}
                  className="text-xs font-semibold text-[#3b82f6] hover:underline flex items-center gap-1 whitespace-nowrap shrink-0"
                >
                  상세 옵션 열기
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <form onSubmit={handleQuickAdd} className="space-y-3" noValidate>
                {quickError && (
                  <div
                    role="alert"
                    className="neu-debossed rounded-[14px] px-3.5 py-2 text-xs font-semibold text-[#ba1a1a]"
                  >
                    {quickError}
                  </div>
                )}

                <div>
                  <label htmlFor="quick-schedule-title" className="sr-only">
                    빠른 일정 제목
                  </label>
                  <input
                    id="quick-schedule-title"
                    type="text"
                    value={quickTitle}
                    onChange={(e) => {
                      setQuickTitle(e.target.value);
                      if (quickError) setQuickError(null);
                    }}
                    placeholder="새로운 할 일 또는 미팅 제목을 입력하세요..."
                    className="neu-input w-full rounded-full px-4 py-3 text-sm font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div>
                    <label htmlFor="quick-start-time" className="sr-only">
                      시작 시간
                    </label>
                    <input
                      id="quick-start-time"
                      type="time"
                      value={quickStart}
                      onChange={(e) => setQuickStart(e.target.value)}
                      className="neu-input w-full rounded-full px-3 py-2 text-xs font-semibold tabular-nums"
                    />
                  </div>
                  <div>
                    <label htmlFor="quick-end-time" className="sr-only">
                      종료 시간
                    </label>
                    <input
                      id="quick-end-time"
                      type="time"
                      value={quickEnd}
                      onChange={(e) => setQuickEnd(e.target.value)}
                      className="neu-input w-full rounded-full px-3 py-2 text-xs font-semibold tabular-nums"
                    />
                  </div>
                  <div>
                    <label htmlFor="quick-category-select" className="sr-only">
                      카테고리
                    </label>
                    <select
                      id="quick-category-select"
                      value={quickCategory}
                      onChange={(e) =>
                        setQuickCategory(e.target.value as ScheduleCategory)
                      }
                      className="neu-input w-full rounded-full px-3 py-2 text-xs font-semibold"
                    >
                      <option value="work">업무</option>
                      <option value="meeting">미팅</option>
                      <option value="focus">집중 블록</option>
                      <option value="personal">개인</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="neu-btn-primary min-h-[40px] rounded-full px-4 text-xs font-semibold flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    등록
                  </button>
                </div>
              </form>
            </section>

            {/* Search & Segmented Filter Controls */}
            <section
              aria-label="일정 검색 및 필터"
              className="neu-extruded rounded-[20px] p-6 space-y-4"
            >
              {/* Recessed Pill Search Well */}
              <div className="relative flex items-center">
                <Search className="w-4 h-4 text-[#64748b] absolute left-4 pointer-events-none" />
                <label htmlFor="schedule-search-input" className="sr-only">
                  일정 검색
                </label>
                <input
                  id="schedule-search-input"
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="일정 제목, 장소, 메모 검색 (전체 날짜 대상)..."
                  className="neu-input w-full rounded-full pl-10 pr-4 py-2.5 text-xs font-medium"
                />
              </div>

              {/* Category Filter Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div
                  className="neu-debossed rounded-full p-1 flex items-center gap-1 overflow-x-auto"
                  role="group"
                  aria-label="카테고리 필터"
                >
                  {(
                    [
                      { key: 'all', label: '전체' },
                      { key: 'work', label: '업무' },
                      { key: 'meeting', label: '미팅' },
                      { key: 'focus', label: '집중 블록' },
                      { key: 'personal', label: '개인' },
                    ] as const
                  ).map((item) => {
                    const active = selectedCategory === item.key;
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => setSelectedCategory(item.key)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap shrink-0 ${
                          active
                            ? 'neu-extruded-sm text-[#3b82f6] font-bold'
                            : 'text-[#64748b] hover:text-[#1e293b]'
                        }`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>

                {/* Status Filter */}
                <div
                  className="neu-debossed rounded-full p-1 flex items-center gap-1"
                  role="group"
                  aria-label="완료 상태 필터"
                >
                  {(
                    [
                      { key: 'all', label: '모든 상태' },
                      { key: 'pending', label: '진행 중' },
                      { key: 'completed', label: '완료됨' },
                    ] as const
                  ).map((st) => {
                    const active = selectedStatus === st.key;
                    return (
                      <button
                        key={st.key}
                        type="button"
                        onClick={() => setSelectedStatus(st.key)}
                        className={`px-2.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap shrink-0 ${
                          active
                            ? 'neu-extruded-sm text-[#3b82f6] font-bold'
                            : 'text-[#64748b] hover:text-[#1e293b]'
                        }`}
                      >
                        {st.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="neu-divider" />

              {/* Schedule Items List */}
              <div className="space-y-4" role="list" aria-label="타임블록 일정 목록">
                {visibleSchedules.length === 0 ? (
                  <div className="neu-debossed rounded-[20px] p-8 text-center space-y-3">
                    <CalendarDays className="w-8 h-8 text-[#64748b] mx-auto" />
                    <div className="space-y-1">
                      <h3 className="text-base font-semibold text-[#1e293b]">
                        표시할 일정이 없습니다
                      </h3>
                      <p className="text-xs text-[#64748b]">
                        선택한 날짜({selectedDate})나 검색 조건에 해당하는 타임블록이 비어 있습니다.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory('all');
                        setSelectedStatus('all');
                        setEditingItem(null);
                        setIsModalOpen(true);
                      }}
                      className="neu-btn-primary min-h-[42px] px-5 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
                    >
                      <Plus className="w-4 h-4" />첫 일정 등록하기
                    </button>
                  </div>
                ) : (
                  visibleSchedules.map((item) => {
                    const durationMins = calculateDurationMinutes(
                      item.startTime,
                      item.endTime
                    );
                    const catMeta = CATEGORY_META[item.category];
                    const prioMeta = PRIORITY_META[item.priority];

                    return (
                      <article
                        key={item.id}
                        role="listitem"
                        className={`rounded-[20px] p-5 transition-all ${
                          item.completed ? 'neu-debossed opacity-85' : 'neu-extruded'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          {/* Tactile Neumorphic Checkbox (12px radius) */}
                          <button
                            type="button"
                            onClick={() => handleToggleComplete(item.id)}
                            aria-label={`${item.title} 완료 상태 토글`}
                            aria-pressed={item.completed}
                            className={`mt-0.5 w-7 h-7 rounded-[12px] flex items-center justify-center shrink-0 transition-all ${
                              item.completed
                                ? 'bg-[#3b82f6] text-white shadow-[0_4px_10px_rgba(59,130,246,0.4)]'
                                : 'neu-debossed text-transparent hover:text-[#64748b]'
                            }`}
                          >
                            <Check className="w-4 h-4 stroke-[2.5]" />
                          </button>

                          {/* Schedule Content */}
                          <div className="flex-1 min-w-0">
                            {/* Unboxed Metadata Kicker with Typographic Separators */}
                            <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold text-[#64748b] tabular-nums mb-1">
                              <span
                                className="font-mono font-bold"
                                style={{ color: catMeta.accentColor }}
                              >
                                {item.startTime} – {item.endTime}
                              </span>
                              <span aria-hidden="true">·</span>
                              <span>{durationMins}분</span>
                              <span aria-hidden="true">·</span>
                              <span style={{ color: catMeta.accentColor }}>
                                {catMeta.label}
                              </span>
                              <span aria-hidden="true">·</span>
                              <span>우선순위 {prioMeta.label}</span>
                              {searchQuery.trim() && (
                                <>
                                  <span aria-hidden="true">·</span>
                                  <span>{item.date}</span>
                                </>
                              )}
                            </div>

                            <h3
                              className={`text-base font-bold text-[#1e293b] leading-snug ${
                                item.completed ? 'line-through text-[#64748b]' : ''
                              }`}
                            >
                              {item.title}
                            </h3>

                            {item.location && (
                              <div className="flex items-center gap-1.5 text-xs text-[#64748b] mt-1.5">
                                <MapPin className="w-3.5 h-3.5 text-[#3b82f6] shrink-0" />
                                <span className="truncate">{item.location}</span>
                              </div>
                            )}

                            {item.notes && (
                              <p className="text-xs text-[#424754] mt-2 leading-relaxed neu-debossed-sm rounded-[12px] px-3 py-2">
                                {item.notes}
                              </p>
                            )}
                          </div>

                          {/* Edit & Delete Tactile Buttons */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingItem(item);
                                setIsModalOpen(true);
                              }}
                              aria-label={`${item.title} 수정`}
                              className="neu-btn w-9 h-9 rounded-full flex items-center justify-center text-[#64748b] hover:text-[#3b82f6]"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteSchedule(item.id)}
                              aria-label={`${item.title} 삭제`}
                              className="neu-btn w-9 h-9 rounded-full flex items-center justify-center text-[#64748b] hover:text-[#ba1a1a]"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })
                )}
              </div>
            </section>
          </div>

          {/* Right Column (3 cols on desktop): Tactile Focus Timer, Routine Switches & Weekly Analytics */}
          <div
            className={`lg:col-span-3 space-y-6 ${
              activeTab === 'focus' ? 'order-first lg:order-none' : ''
            }`}
          >
            <FocusRoutinePanel
              routines={routines}
              onToggleRoutine={handleToggleRoutine}
              onCompleteFocusSession={handleCompleteFocusSession}
            />

            {/* Weekly Execution Balance Breakdown */}
            <section
              aria-label="주간 카테고리별 시간 배분 리포트"
              className="neu-extruded rounded-[20px] p-6 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-[#64748b] block mb-0.5">
                    주간 리소스 분석
                  </span>
                  <h3 className="text-[18px] font-semibold text-[#1e293b]">
                    카테고리별 몰입 비중
                  </h3>
                </div>
                <BarChart3 className="w-4 h-4 text-[#3b82f6]" />
              </div>

              <div className="space-y-3">
                {(Object.keys(CATEGORY_META) as ScheduleCategory[]).map((cat) => {
                  const catItems = schedules.filter((s) => s.category === cat);
                  const totalMins = catItems.reduce(
                    (acc, cur) =>
                      acc + calculateDurationMinutes(cur.startTime, cur.endTime),
                    0
                  );
                  const completedCnt = catItems.filter((s) => s.completed).length;

                  return (
                    <div
                      key={cat}
                      className="neu-debossed-sm rounded-[14px] p-3 flex items-center justify-between text-xs"
                    >
                      <div className="font-semibold text-[#1e293b]">
                        {CATEGORY_META[cat].label}
                      </div>
                      <div className="text-[#64748b] tabular-nums font-medium">
                        {catItems.length}건 ({completedCnt}완료) ·{' '}
                        <span className="text-[#1e293b] font-semibold">
                          {totalMins}분
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Clean Quiet Footer */}
      <footer className="w-full max-w-7xl mx-auto px-5 md:px-8 py-6 mt-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#64748b]">
        <div>TactileFlow — Tactile Neumorphic Productivity Workspace</div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleJumpToday}
            className="hover:text-[#1e293b] transition-colors"
          >
            오늘 날짜로 이동
          </button>
          <span aria-hidden="true">·</span>
          <button
            type="button"
            onClick={() => {
              setEditingItem(null);
              setIsModalOpen(true);
            }}
            className="hover:text-[#1e293b] transition-colors"
          >
            새 일정 만들기
          </button>
        </div>
      </footer>

      {/* Active Floating Elevation 2 Modal for Adding/Editing Schedules */}
      <ScheduleModal
        isOpen={isModalOpen}
        initialDate={selectedDate}
        editingItem={editingItem}
        onClose={() => {
          setIsModalOpen(false);
          setEditingItem(null);
        }}
        onSave={handleSaveSchedule}
        onDelete={handleDeleteSchedule}
      />
    </div>
  );
}
