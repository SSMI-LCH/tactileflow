export type ScheduleCategory = 'work' | 'meeting' | 'personal' | 'focus';
export type SchedulePriority = 'high' | 'medium' | 'low';

export interface ScheduleItem {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  category: ScheduleCategory;
  priority: SchedulePriority;
  location?: string;
  notes?: string;
  completed: boolean;
  reminderEnabled: boolean;
}

export interface RoutineToggle {
  id: string;
  label: string;
  subtitle: string;
  enabled: boolean;
  targetMinutes: number;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export const CATEGORY_META: Record<
  ScheduleCategory,
  { label: string; dotColor: string; accentColor: string }
> = {
  work: { label: '업무', dotColor: '#3b82f6', accentColor: '#0058be' },
  meeting: { label: '미팅', dotColor: '#b75b00', accentColor: '#924700' },
  personal: { label: '개인', dotColor: '#505f76', accentColor: '#38485d' },
  focus: { label: '집중 블록', dotColor: '#2170e4', accentColor: '#004395' },
};

export const PRIORITY_META: Record<SchedulePriority, { label: string }> = {
  high: { label: '높음' },
  medium: { label: '보통' },
  low: { label: '낮음' },
};

export function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseTimeMinutes(timeStr: string): number {
  const parts = timeStr.split(':');
  if (parts.length !== 2) return -1;
  const h = Number(parts[0]);
  const m = Number(parts[1]);
  if (Number.isNaN(h) || Number.isNaN(m) || h < 0 || h > 23 || m < 0 || m > 59) {
    return -1;
  }
  return h * 60 + m;
}

export function calculateDurationMinutes(startTime: string, endTime: string): number {
  const start = parseTimeMinutes(startTime);
  const end = parseTimeMinutes(endTime);
  if (start < 0 || end < 0 || end <= start) return 0;
  return end - start;
}

export function validateScheduleInput(input: {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
}): ValidationResult {
  const trimmedTitle = input.title.trim();
  if (!trimmedTitle) {
    return { valid: false, error: '일정 제목을 입력해 주세요.' };
  }
  if (trimmedTitle.length > 80) {
    return { valid: false, error: '일정 제목은 80자 이내로 입력해 주세요.' };
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) {
    return { valid: false, error: '유효한 날짜(YYYY-MM-DD)를 선택해 주세요.' };
  }
  const startMins = parseTimeMinutes(input.startTime);
  const endMins = parseTimeMinutes(input.endTime);
  if (startMins < 0 || endMins < 0) {
    return { valid: false, error: '유효한 시작 및 종료 시간을 입력해 주세요.' };
  }
  if (endMins <= startMins) {
    return { valid: false, error: '종료 시간은 시작 시간보다 이후여야 합니다.' };
  }
  return { valid: true };
}

export function filterAndSortSchedules(
  items: ScheduleItem[],
  options: {
    date?: string;
    category?: ScheduleCategory | 'all';
    status?: 'all' | 'pending' | 'completed';
    searchQuery?: string;
  }
): ScheduleItem[] {
  const query = (options.searchQuery ?? '').trim().toLowerCase();

  return items
    .filter((item) => {
      if (options.date && item.date !== options.date) return false;
      if (options.category && options.category !== 'all' && item.category !== options.category) {
        return false;
      }
      if (options.status === 'pending' && item.completed) return false;
      if (options.status === 'completed' && !item.completed) return false;
      if (query) {
        const hay = `${item.title} ${item.location ?? ''} ${item.notes ?? ''}`.toLowerCase();
        if (!hay.includes(query)) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return parseTimeMinutes(a.startTime) - parseTimeMinutes(b.startTime);
    });
}

export interface DailyStats {
  totalCount: number;
  completedCount: number;
  pendingCount: number;
  completionRate: number; // 0 to 100
  totalPlannedMinutes: number;
  completedMinutes: number;
  highPriorityPending: number;
}

export function computeDailyStats(items: ScheduleItem[], date: string): DailyStats {
  const dayItems = items.filter((i) => i.date === date);
  const totalCount = dayItems.length;
  const completedItems = dayItems.filter((i) => i.completed);
  const completedCount = completedItems.length;
  const pendingCount = totalCount - completedCount;
  const completionRate = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  const totalPlannedMinutes = dayItems.reduce(
    (sum, item) => sum + calculateDurationMinutes(item.startTime, item.endTime),
    0
  );
  const completedMinutes = completedItems.reduce(
    (sum, item) => sum + calculateDurationMinutes(item.startTime, item.endTime),
    0
  );
  const highPriorityPending = dayItems.filter(
    (i) => !i.completed && i.priority === 'high'
  ).length;

  return {
    totalCount,
    completedCount,
    pendingCount,
    completionRate,
    totalPlannedMinutes,
    completedMinutes,
    highPriorityPending,
  };
}

export interface CalendarCell {
  dateStr: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  totalEvents: number;
  completedEvents: number;
  hasHighPriorityPending: boolean;
}

export function buildMonthGrid(
  year: number,
  monthZeroIndexed: number,
  todayStr: string,
  items: ScheduleItem[]
): CalendarCell[] {
  const firstDayOfMonth = new Date(year, monthZeroIndexed, 1);
  const startDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sun
  const daysInMonth = new Date(year, monthZeroIndexed + 1, 0).getDate();
  const prevMonthDays = new Date(year, monthZeroIndexed, 0).getDate();

  const cells: CalendarCell[] = [];

  const summarizeForDate = (dateStr: string) => {
    const dayItems = items.filter((i) => i.date === dateStr);
    return {
      totalEvents: dayItems.length,
      completedEvents: dayItems.filter((i) => i.completed).length,
      hasHighPriorityPending: dayItems.some((i) => !i.completed && i.priority === 'high'),
    };
  };

  // Leading days from previous month
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const dayNum = prevMonthDays - i;
    const d = new Date(year, monthZeroIndexed - 1, dayNum);
    const dateStr = formatDateKey(d);
    cells.push({
      dateStr,
      dayNumber: dayNum,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
      ...summarizeForDate(dateStr),
    });
  }

  // Current month days
  for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
    const d = new Date(year, monthZeroIndexed, dayNum);
    const dateStr = formatDateKey(d);
    cells.push({
      dateStr,
      dayNumber: dayNum,
      isCurrentMonth: true,
      isToday: dateStr === todayStr,
      ...summarizeForDate(dateStr),
    });
  }

  // Trailing days to fill 42 cells (6 weeks) or 35 cells (5 weeks)
  const targetCells = cells.length > 35 ? 42 : 35;
  const remaining = targetCells - cells.length;
  for (let dayNum = 1; dayNum <= remaining; dayNum++) {
    const d = new Date(year, monthZeroIndexed + 1, dayNum);
    const dateStr = formatDateKey(d);
    cells.push({
      dateStr,
      dayNumber: dayNum,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
      ...summarizeForDate(dateStr),
    });
  }

  return cells;
}

export function createInitialSchedules(baseDateStr: string): ScheduleItem[] {
  const [y, m, d] = baseDateStr.split('-').map(Number);
  const baseDate = new Date(y, m - 1, d);
  const prevDateStr = formatDateKey(new Date(y, m - 1, d - 1));
  const nextDateStr = formatDateKey(new Date(y, m - 1, d + 1));
  const twoDaysLaterStr = formatDateKey(new Date(y, m - 1, d + 2));

  return [
    {
      id: 'sched-1',
      title: '모닝 데일리 스크럼 및 우선순위 점검',
      date: baseDateStr,
      startTime: '09:00',
      endTime: '09:45',
      category: 'meeting',
      priority: 'high',
      location: '회의실 A · 온라인 동기화',
      notes: '이번 주 핵심 마일스톤 진행률 확인 및 블로커 조율',
      completed: true,
      reminderEnabled: true,
    },
    {
      id: 'sched-2',
      title: '뉴모피즘 UI 컴포넌트 깊이감 & 명암비 검수',
      date: baseDateStr,
      startTime: '10:30',
      endTime: '12:00',
      category: 'work',
      priority: 'high',
      location: '디자인 스튜디오 3층',
      notes: 'Extruded/Debossed 그림자 각도(315°) 및 WCAG AA 텍스트 대비 검증',
      completed: true,
      reminderEnabled: true,
    },
    {
      id: 'sched-3',
      title: '딥워크: 인터랙티브 캘린더 엔진 모듈 구현',
      date: baseDateStr,
      startTime: '13:30',
      endTime: '15:30',
      category: 'focus',
      priority: 'high',
      location: '집중 포커스 존',
      notes: '알림 차단 모드로 120분 무중단 코드 아키텍처 설계',
      completed: false,
      reminderEnabled: true,
    },
    {
      id: 'sched-4',
      title: '프로덕트 로드맵 이해관계자 주간 싱크',
      date: baseDateStr,
      startTime: '16:00',
      endTime: '17:00',
      category: 'meeting',
      priority: 'medium',
      location: '보드룸 B',
      notes: '4분기 모바일 터치 사용성 개선 지표 공유',
      completed: false,
      reminderEnabled: true,
    },
    {
      id: 'sched-5',
      title: '저녁 코어 스트레칭 및 러닝 5km',
      date: baseDateStr,
      startTime: '19:00',
      endTime: '20:00',
      category: 'personal',
      priority: 'low',
      location: '한강 시민공원 트랙',
      notes: '심박수 존 2 유지 및 수분 보충',
      completed: false,
      reminderEnabled: false,
    },
    {
      id: 'sched-6',
      title: '주간 스프린트 회고록 문서 정리',
      date: prevDateStr,
      startTime: '14:00',
      endTime: '15:30',
      category: 'work',
      priority: 'medium',
      location: '워크스페이스 데스크',
      notes: '팀 피드백 요약 및 액션 아이템 아카이빙',
      completed: true,
      reminderEnabled: false,
    },
    {
      id: 'sched-7',
      title: '모바일 반응형 접근성(A11y) 테스트 세션',
      date: nextDateStr,
      startTime: '11:00',
      endTime: '12:30',
      category: 'work',
      priority: 'high',
      location: 'QA 디바이스 랩',
      notes: '포커스 링(#3b82f6) 및 최소 터치 타겟(44px) 전수 점검',
      completed: false,
      reminderEnabled: true,
    },
    {
      id: 'sched-8',
      title: '디자인 시스템 토큰 릴리즈 노트 배포',
      date: twoDaysLaterStr,
      startTime: '15:00',
      endTime: '16:00',
      category: 'focus',
      priority: 'medium',
      location: '온라인 배포 파이프라인',
      notes: '프론트엔드 및 모바일 팀 공통 가이드라인 공유',
      completed: false,
      reminderEnabled: true,
    },
  ];
}
