import React, { useState, useEffect } from 'react';
import { X, Trash2, Check } from 'lucide-react';
import {
  ScheduleItem,
  ScheduleCategory,
  SchedulePriority,
  CATEGORY_META,
  PRIORITY_META,
  validateScheduleInput,
} from '../utils/scheduleLogic';

interface ScheduleModalProps {
  isOpen: boolean;
  initialDate: string;
  editingItem: ScheduleItem | null;
  onClose: () => void;
  onSave: (itemData: Omit<ScheduleItem, 'id'>, existingId?: string) => void;
  onDelete?: (id: string) => void;
}

export const ScheduleModal: React.FC<ScheduleModalProps> = ({
  isOpen,
  initialDate,
  editingItem,
  onClose,
  onSave,
  onDelete,
}) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(initialDate);
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('11:00');
  const [category, setCategory] = useState<ScheduleCategory>('work');
  const [priority, setPriority] = useState<SchedulePriority>('medium');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (editingItem) {
      setTitle(editingItem.title);
      setDate(editingItem.date);
      setStartTime(editingItem.startTime);
      setEndTime(editingItem.endTime);
      setCategory(editingItem.category);
      setPriority(editingItem.priority);
      setLocation(editingItem.location ?? '');
      setNotes(editingItem.notes ?? '');
      setReminderEnabled(editingItem.reminderEnabled);
      setCompleted(editingItem.completed);
    } else {
      setTitle('');
      setDate(initialDate);
      setStartTime('10:00');
      setEndTime('11:00');
      setCategory('work');
      setPriority('medium');
      setLocation('');
      setNotes('');
      setReminderEnabled(true);
      setCompleted(false);
    }
    setErrorMsg(null);
  }, [editingItem, initialDate, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateScheduleInput({ title, date, startTime, endTime });
    if (!validation.valid) {
      setErrorMsg(validation.error ?? '입력값을 확인해 주세요.');
      return;
    }

    onSave(
      {
        title: title.trim(),
        date,
        startTime,
        endTime,
        category,
        priority,
        location: location.trim() || undefined,
        notes: notes.trim() || undefined,
        reminderEnabled,
        completed,
      },
      editingItem?.id
    );
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1e293b]/35 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-schedule-title"
    >
      <div className="neu-floating w-full max-w-lg rounded-[24px] p-6 md:p-7 space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-[#64748b] block">
              {editingItem ? '일정 상세 편집' : '새로운 타임블록 등록'}
            </span>
            <h2
              id="modal-schedule-title"
              className="text-[22px] font-bold tracking-tight text-[#1e293b]"
            >
              {editingItem ? '일정 수정하기' : '새 일정 추가'}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="모달 닫기"
            className="neu-btn w-10 h-10 rounded-full flex items-center justify-center text-[#1e293b]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {errorMsg && (
            <div
              role="alert"
              className="neu-debossed rounded-[16px] px-4 py-3 text-xs font-semibold text-[#ba1a1a]"
            >
              {errorMsg}
            </div>
          )}

          {/* Title Input */}
          <div className="space-y-1.5">
            <label
              htmlFor="schedule-title-input"
              className="block text-xs font-semibold text-[#1e293b]"
            >
              일정 제목 *
            </label>
            <input
              id="schedule-title-input"
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errorMsg) setErrorMsg(null);
              }}
              placeholder="예: 디자인 시스템 컴포넌트 리뷰"
              className="neu-input w-full rounded-full px-4 py-3 text-sm font-medium"
              autoFocus
            />
          </div>

          {/* Date & Time Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label
                htmlFor="schedule-date-input"
                className="block text-xs font-semibold text-[#1e293b]"
              >
                날짜
              </label>
              <input
                id="schedule-date-input"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="neu-input w-full rounded-full px-3.5 py-2.5 text-xs font-semibold tabular-nums"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="schedule-start-input"
                className="block text-xs font-semibold text-[#1e293b]"
              >
                시작 시간
              </label>
              <input
                id="schedule-start-input"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="neu-input w-full rounded-full px-3.5 py-2.5 text-xs font-semibold tabular-nums"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="schedule-end-input"
                className="block text-xs font-semibold text-[#1e293b]"
              >
                종료 시간
              </label>
              <input
                id="schedule-end-input"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="neu-input w-full rounded-full px-3.5 py-2.5 text-xs font-semibold tabular-nums"
              />
            </div>
          </div>

          {/* Category Segmented Selector */}
          <div className="space-y-1.5">
            <span className="block text-xs font-semibold text-[#1e293b]">
              카테고리 분류
            </span>
            <div className="neu-debossed rounded-full p-1.5 grid grid-cols-4 gap-1.5">
              {(Object.keys(CATEGORY_META) as ScheduleCategory[]).map((cat) => {
                const isSelected = category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`min-h-[38px] rounded-full text-xs font-semibold transition-all whitespace-nowrap shrink-0 ${
                      isSelected
                        ? 'neu-extruded-sm text-[#3b82f6] font-bold'
                        : 'text-[#64748b] hover:text-[#1e293b]'
                    }`}
                  >
                    {CATEGORY_META[cat].label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Priority Segmented Selector */}
          <div className="space-y-1.5">
            <span className="block text-xs font-semibold text-[#1e293b]">
              우선순위
            </span>
            <div className="neu-debossed rounded-full p-1.5 grid grid-cols-3 gap-1.5">
              {(Object.keys(PRIORITY_META) as SchedulePriority[]).map((prio) => {
                const isSelected = priority === prio;
                return (
                  <button
                    key={prio}
                    type="button"
                    onClick={() => setPriority(prio)}
                    className={`min-h-[38px] rounded-full text-xs font-semibold transition-all whitespace-nowrap shrink-0 ${
                      isSelected
                        ? 'neu-extruded-sm text-[#3b82f6] font-bold'
                        : 'text-[#64748b] hover:text-[#1e293b]'
                    }`}
                  >
                    {PRIORITY_META[prio].label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Location Input */}
          <div className="space-y-1.5">
            <label
              htmlFor="schedule-location-input"
              className="block text-xs font-semibold text-[#1e293b]"
            >
              장소 또는 미팅 링크 (선택)
            </label>
            <input
              id="schedule-location-input"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="예: 보드룸 B / 온라인 화상 회의"
              className="neu-input w-full rounded-full px-4 py-2.5 text-xs font-medium"
            />
          </div>

          {/* Notes Input */}
          <div className="space-y-1.5">
            <label
              htmlFor="schedule-notes-input"
              className="block text-xs font-semibold text-[#1e293b]"
            >
              상세 메모 (선택)
            </label>
            <textarea
              id="schedule-notes-input"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="준비물이나 핵심 안건을 기록하세요"
              className="neu-input w-full rounded-[16px] px-4 py-2.5 text-xs font-medium resize-none"
            />
          </div>

          {/* Tactile Reminder Switch */}
          <div className="neu-debossed-sm rounded-[16px] px-4 py-3 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-[#1e293b]">
                시작 10분 전 리마인더 알림
              </div>
              <div className="text-[11px] text-[#64748b]">
                타임블록 전환 시 촉각 알림 활성화
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={reminderEnabled}
              aria-label="리마인더 알림 토글"
              onClick={() => setReminderEnabled((r) => !r)}
              className={`relative w-14 h-8 rounded-full p-1 transition-colors duration-200 shrink-0 ${
                reminderEnabled
                  ? 'bg-[#3b82f6] shadow-[inset_3px_3px_6px_rgba(15,45,110,0.45)]'
                  : 'neu-debossed'
              }`}
            >
              <span
                className={`block w-6 h-6 rounded-full neu-extruded-sm transition-transform duration-200 ${
                  reminderEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="neu-divider my-2" />

          {/* Modal Footer Actions */}
          <div className="flex items-center justify-between gap-3 pt-1">
            {editingItem && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  onDelete(editingItem.id);
                  onClose();
                }}
                className="neu-btn min-h-[44px] px-4 rounded-full text-xs font-semibold text-[#ba1a1a] flex items-center gap-1.5 whitespace-nowrap shrink-0"
              >
                <Trash2 className="w-4 h-4" />
                삭제
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="neu-btn min-h-[44px] px-5 rounded-full text-xs font-semibold text-[#64748b] hover:text-[#1e293b] whitespace-nowrap shrink-0"
              >
                취소
              </button>
              <button
                type="submit"
                className="neu-btn-primary min-h-[44px] px-6 rounded-full text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap shrink-0"
              >
                <Check className="w-4 h-4" />
                {editingItem ? '변경사항 저장' : '일정 저장'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
