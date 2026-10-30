import React from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Target } from 'lucide-react';
import { CalendarCell, DailyStats } from '../utils/scheduleLogic';

interface TactileCalendarProps {
  year: number;
  monthZeroIndexed: number;
  selectedDate: string;
  todayStr: string;
  cells: CalendarCell[];
  dailyStats: DailyStats;
  dailyGoalMinutes: number;
  onSelectDate: (dateStr: string) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onJumpToday: () => void;
  onChangeGoalMinutes: (minutes: number) => void;
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

export const TactileCalendar: React.FC<TactileCalendarProps> = ({
  year,
  monthZeroIndexed,
  selectedDate,
  todayStr,
  cells,
  dailyStats,
  dailyGoalMinutes,
  onSelectDate,
  onPrevMonth,
  onNextMonth,
  onJumpToday,
  onChangeGoalMinutes,
}) => {
  const goalProgressPercent = Math.min(
    100,
    Math.round((dailyStats.totalPlannedMinutes / Math.max(60, dailyGoalMinutes)) * 100)
  );

  return (
    <div className="space-y-6">
      {/* Monthly Calendar Card */}
      <section
        aria-label="월간 일정 캘린더"
        className="neu-extruded rounded-[20px] p-6"
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <span className="text-xs font-semibold tracking-wider text-[#64748b] block mb-0.5">
              월간 스케줄 내비게이터
            </span>
            <h2 className="text-[22px] font-bold tracking-tight text-[#1e293b] tabular-nums">
              {year}년 {monthZeroIndexed + 1}월
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onJumpToday}
              className={`px-3.5 min-h-[40px] rounded-full text-xs font-semibold transition-all whitespace-nowrap shrink-0 ${
                selectedDate === todayStr
                  ? 'neu-debossed text-[#3b82f6]'
                  : 'neu-btn text-[#1e293b]'
              }`}
              aria-label="오늘 날짜로 이동"
            >
              오늘
            </button>
            <button
              type="button"
              onClick={onPrevMonth}
              className="neu-btn w-10 h-10 rounded-full flex items-center justify-center text-[#1e293b]"
              aria-label="이전 달 보기"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onNextMonth}
              className="neu-btn w-10 h-10 rounded-full flex items-center justify-center text-[#1e293b]"
              aria-label="다음 달 보기"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-2 mb-2 text-center">
          {WEEKDAYS.map((day, idx) => (
            <div
              key={day}
              className={`text-xs font-semibold py-1 ${
                idx === 0
                  ? 'text-[#ba1a1a]'
                  : idx === 6
                  ? 'text-[#0058be]'
                  : 'text-[#64748b]'
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2" role="grid" aria-label="날짜 선택 그리드">
          {cells.map((cell) => {
            const isSelected = cell.dateStr === selectedDate;
            return (
              <button
                key={cell.dateStr}
                type="button"
                onClick={() => onSelectDate(cell.dateStr)}
                aria-label={`${cell.dateStr} (${cell.totalEvents}개 일정)`}
                aria-pressed={isSelected}
                className={`relative min-h-[46px] rounded-[14px] flex flex-col items-center justify-center p-1 transition-all tabular-nums ${
                  isSelected
                    ? 'neu-debossed text-[#3b82f6] font-bold ring-2 ring-[#3b82f6]/80'
                    : cell.isCurrentMonth
                    ? 'neu-extruded-sm text-[#1e293b] hover:text-[#3b82f6] font-semibold'
                    : 'bg-transparent text-[#64748b]/55 hover:text-[#64748b] font-medium'
                }`}
              >
                <span className="text-[13px] leading-none">{cell.dayNumber}</span>

                {/* Subtle Schedule Count Indicator Bar */}
                <div className="mt-1.5 h-1.5 flex items-center justify-center gap-1">
                  {cell.totalEvents > 0 && (
                    <span
                      className={`h-1.5 rounded-full transition-all ${
                        isSelected
                          ? 'w-4 bg-[#3b82f6]'
                          : cell.completedEvents === cell.totalEvents
                          ? 'w-3 bg-[#64748b]/60'
                          : cell.hasHighPriorityPending
                          ? 'w-3.5 bg-[#b75b00]'
                          : 'w-2.5 bg-[#3b82f6]/80'
                      }`}
                    />
                  )}
                  {cell.isToday && !isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#3b82f6]" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <div className="neu-divider my-5" />

        {/* Selected Date Summary Row */}
        <div className="flex items-center justify-between text-xs text-[#64748b]">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-[#3b82f6]" />
            <span className="font-medium text-[#1e293b] tabular-nums">{selectedDate}</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">총 {dailyStats.totalCount}건</span>
          </div>
          <div className="font-semibold text-[#3b82f6] tabular-nums">
            완료율 {dailyStats.completionRate}%
          </div>
        </div>
      </section>

      {/* Daily Progress & Tactile Goal Slider Card */}
      <section
        aria-label="일간 목표 달성 및 몰입 시간 설정"
        className="neu-extruded rounded-[20px] p-6 space-y-5"
      >
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-[#64748b] block mb-0.5">
              일간 완료 트래커
            </span>
            <h3 className="text-[18px] font-semibold text-[#1e293b]">
              오늘의 실행 밸런스
            </h3>
          </div>
          <span className="text-sm font-bold text-[#3b82f6] tabular-nums">
            {dailyStats.completedCount} / {dailyStats.totalCount} 완료
          </span>
        </div>

        {/* Debossed Progress Well */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-medium text-[#64748b]">
            <span>일정 수행 달성률</span>
            <span className="tabular-nums text-[#1e293b] font-semibold">
              {dailyStats.completionRate}%
            </span>
          </div>
          <div
            className="neu-debossed h-4 rounded-full p-1 overflow-hidden"
            role="progressbar"
            aria-valuenow={dailyStats.completionRate}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="일정 완료 진행률"
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#3b82f6] to-[#2170e4] transition-all duration-200"
              style={{ width: `${Math.max(dailyStats.completionRate, dailyStats.totalCount > 0 ? 6 : 0)}%` }}
            />
          </div>
        </div>

        {/* Scrubber Slider for Daily Planned Hours Target */}
        <div className="space-y-2.5 pt-1">
          <div className="flex items-center justify-between text-xs">
            <label
              htmlFor="daily-goal-slider"
              className="font-semibold text-[#1e293b] flex items-center gap-1.5"
            >
              <Target className="w-3.5 h-3.5 text-[#3b82f6]" />
              일일 몰입 목표 시간
            </label>
            <span className="font-mono font-semibold text-[#3b82f6] tabular-nums">
              {Math.floor(dailyStats.totalPlannedMinutes / 60)}시간 {dailyStats.totalPlannedMinutes % 60}분 / 목표 {Math.floor(dailyGoalMinutes / 60)}시간
            </span>
          </div>

          <div className="neu-debossed-sm rounded-full px-3 py-2 flex items-center">
            <input
              id="daily-goal-slider"
              type="range"
              min={120}
              max={600}
              step={30}
              value={dailyGoalMinutes}
              onChange={(e) => onChangeGoalMinutes(Number(e.target.value))}
              className="neu-slider w-full"
              aria-label="일일 몰입 목표 시간 조절"
            />
          </div>

          <div className="flex justify-between text-[11px] text-[#64748b] tabular-nums">
            <span>2시간</span>
            <span>목표 대비 {goalProgressPercent}% 배정됨</span>
            <span>10시간</span>
          </div>
        </div>
      </section>
    </div>
  );
};
