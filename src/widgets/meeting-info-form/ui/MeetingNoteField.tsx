'use client';

import { CREATE_MEETING_NOTE_MAX_LENGTH } from '@/features/meeting';

interface MeetingNoteFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export const MeetingNoteField = ({ value, onChange }: MeetingNoteFieldProps) => (
  <>
    <label className="mt-5 block text-sm font-semibold text-cool-900" htmlFor="meeting-note">
      비고 <span className="font-normal text-cool-500">선택</span>
    </label>
    <textarea
      id="meeting-note"
      value={value}
      maxLength={CREATE_MEETING_NOTE_MAX_LENGTH}
      placeholder="추가로 공유할 내용을 입력해주세요."
      onChange={(event) => onChange(event.target.value)}
      className="mt-2 h-28 w-full resize-none rounded-xl border border-cool-200 bg-cool-50 p-4 text-base text-cool-900 outline-none transition-colors placeholder:text-cool-400 focus:border-brand-600"
    />
    <p className="mt-1.5 text-right text-xs text-cool-500">
      {value.length}/{CREATE_MEETING_NOTE_MAX_LENGTH}
    </p>
  </>
);
