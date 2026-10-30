import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Clock, CheckCircle2 } from 'lucide-react';
import { RoutineToggle } from '../utils/scheduleLogic';

interface FocusRoutinePanelProps {
  routines: RoutineToggle[];
  onToggleRoutine: (id: string) => void;
  onCompleteFocusSession: (minutes: number, label: string) => void;
}

export const FocusRoutinePanel: React.FC<FocusRoutinePanelProps> = ({
  routines,
  onToggleRoutine,
  onCompleteFocusSession,
}) => {
  const [focusMinutes, setFocusMinutes] = useState<number>(25);
  const [secondsLeft, setSecondsLeft] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [sessionTopic, setSessionTopic] = useState<string>('핵심 과업 딥워크 세션');
  const [completedSessions, setCompletedSessions] = useState<number>(2);

  useEffect(() => {
    if (!isRunning) return;
    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          setCompletedSessions((c) => c + 1);
          onCompleteFocusSession(focusMinutes, sessionTopic);
          return focusMinutes * 60;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [isRunning, focusMinutes, sessionTopic, onCompleteFocusSession]);

  const handleSelectDuration = (mins: number) => {
    setIsRunning(false);
    setFocusMinutes(mins);
    setSecondsLeft(mins * 60);
  };

  const handleReset = () => {
    setIsRunning(false);
    setSecondsLeft(focusMinutes * 60);
  };

  const minsDisplay = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const secsDisplay = String(secondsLeft % 60).padStart(2, '0');
  const totalSeconds = focusMinutes * 60;
  const elapsedPercent = Math.round(((totalSeconds - secondsLeft) / totalSeconds) * 100);

  return (
    <div className="space-y-6">
      {/* Tactile Focus Timer Card */}
      <section
        aria-label="집중 타이머"
        className="neu-extruded rounded-[20px] p-6 space-y-5"
      >
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-[#64748b] block mb-0.5">
              택타일 포커스 엔진
            </span>
            <h3 className="text-[18px] font-semibold text-[#1e293b]">
              몰입 타이머
            </h3>
          </div>
          <span className="text-xs font-semibold text-[#3b82f6] tabular-nums">
            오늘 {completedSessions}회 달성
          </span>
        </div>

        {/* Debossed Clock Dial Display */}
        <div className="neu-debossed rounded-[20px] p-6 text-center space-y-3">
          <div className="text-xs font-medium text-[#64748b] truncate px-2">
            {sessionTopic || '집중 세션'}
          </div>
          <div
            className="text-4xl font-bold tracking-tight text-[#1e293b] font-mono tabular-nums"
            aria-live="polite"
          >
            {minsDisplay}:{secsDisplay}
          </div>
          <div className="neu-debossed-sm h-2.5 rounded-full overflow-hidden max-w-[200px] mx-auto p-0.5">
            <div
              className="h-full rounded-full bg-[#3b82f6] transition-all duration-200"
              style={{ width: `${Math.max(elapsedPercent, isRunning ? 8 : 0)}%` }}
            />
          </div>
        </div>

        {/* Duration Preset Segmented Controls */}
        <div className="neu-debossed rounded-full p-1.5 grid grid-cols-3 gap-1.5">
          {[15, 25, 50].map((mins) => {
            const active = focusMinutes === mins;
            return (
              <button
                key={mins}
                type="button"
                onClick={() => handleSelectDuration(mins)}
                className={`min-h-[38px] rounded-full text-xs font-semibold transition-all tabular-nums whitespace-nowrap shrink-0 ${
                  active
                    ? 'neu-extruded-sm text-[#3b82f6] font-bold'
                    : 'text-[#64748b] hover:text-[#1e293b]'
                }`}
              >
                {mins}분 집중
              </button>
            );
          })}
        </div>

        {/* Topic Input */}
        <div>
          <label htmlFor="focus-topic-input" className="sr-only">
            집중 세션 주제
          </label>
          <input
            id="focus-topic-input"
            type="text"
            value={sessionTopic}
            onChange={(e) => setSessionTopic(e.target.value)}
            placeholder="집중할 작업 이름을 입력하세요"
            className="neu-input w-full rounded-full px-4 py-2.5 text-xs font-medium"
          />
        </div>

        {/* Timer Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsRunning((r) => !r)}
            className="neu-btn-primary flex-1 min-h-[44px] rounded-full text-xs font-semibold flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4" />
                일시정지
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                타이머 시작
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handleReset}
            aria-label="타이머 초기화"
            className="neu-btn w-11 h-11 rounded-full flex items-center justify-center text-[#1e293b] shrink-0"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Neumorphic Routine Switches */}
      <section
        aria-label="데일리 루틴 및 워크스페이스 스위치"
        className="neu-extruded rounded-[20px] p-6 space-y-4"
      >
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-[#64748b] block mb-0.5">
              촉각 스위치 컨트롤
            </span>
            <h3 className="text-[18px] font-semibold text-[#1e293b]">
              데일리 루틴 & 알림
            </h3>
          </div>
          <Clock className="w-4 h-4 text-[#3b82f6]" />
        </div>

        <div className="space-y-3">
          {routines.map((routine) => (
            <div
              key={routine.id}
              className="neu-debossed-sm rounded-[16px] p-3.5 flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <div className="text-sm font-semibold text-[#1e293b] truncate flex items-center gap-1.5">
                  {routine.label}
                  {routine.enabled && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#3b82f6] shrink-0" />
                  )}
                </div>
                <div className="text-xs text-[#64748b] truncate mt-0.5">
                  {routine.subtitle} · {routine.targetMinutes}분
                </div>
              </div>

              {/* Tactile Neumorphic Capsule Switch */}
              <button
                type="button"
                role="switch"
                aria-checked={routine.enabled}
                aria-label={`${routine.label} 활성화 토글`}
                onClick={() => onToggleRoutine(routine.id)}
                className={`relative w-14 h-8 rounded-full p-1 transition-colors duration-200 shrink-0 ${
                  routine.enabled
                    ? 'bg-[#3b82f6] shadow-[inset_3px_3px_6px_rgba(15,45,110,0.45)]'
                    : 'neu-debossed'
                }`}
              >
                <span
                  className={`block w-6 h-6 rounded-full neu-extruded-sm transition-transform duration-200 ${
                    routine.enabled ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
