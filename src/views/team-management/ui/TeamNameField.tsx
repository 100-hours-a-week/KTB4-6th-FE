'use client';

import { useState } from 'react';
import { Check, Pencil, X } from 'lucide-react';
import { getNameError } from '@/features/team-space';
import { cn } from '@/shared/lib';

interface TeamNameFieldProps {
  isEditable: boolean;
  name: string;
  onSave: (name: string) => void;
}

export const TeamNameField = ({ isEditable, name, onSave }: TeamNameFieldProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draftName, setDraftName] = useState(name);
  const [error, setError] = useState<string | null>(null);

  const startEditing = () => {
    setDraftName(name);
    setError(null);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setError(null);
  };

  const commitEditing = () => {
    const validationError = getNameError(draftName, 'team');

    if (validationError) {
      setError(validationError);
      return;
    }

    onSave(draftName);
    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-[-0.02em] text-cool-900">{name}</h1>
        {isEditable && (
          <button
            type="button"
            aria-label="팀명 수정"
            onClick={startEditing}
            className="flex size-8 items-center justify-center rounded-full text-cool-500 transition-colors hover:bg-cool-100 hover:text-cool-900"
          >
            <Pencil className="size-4" strokeWidth={2} />
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          cancelEditing();
        }
      }}
    >
      <div className="flex items-center gap-2">
        <input
          autoFocus
          value={draftName}
          onChange={(event) => setDraftName(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              commitEditing();
            } else if (event.key === 'Escape') {
              cancelEditing();
            }
          }}
          className={cn(
            'flex-1 rounded-lg border bg-white px-2 py-1 text-xl font-bold tracking-[-0.02em] text-cool-900 outline-none',
            error ? 'border-danger' : 'border-cool-200 focus:border-cool-400',
          )}
        />
        <button
          type="button"
          aria-label="팀명 저장"
          onClick={commitEditing}
          className="flex size-8 shrink-0 items-center justify-center rounded-full text-success transition-colors hover:bg-success-bg"
        >
          <Check className="size-4" strokeWidth={2} />
        </button>
        <button
          type="button"
          aria-label="팀명 수정 취소"
          onClick={cancelEditing}
          className="flex size-8 shrink-0 items-center justify-center rounded-full text-cool-500 transition-colors hover:bg-cool-100"
        >
          <X className="size-4" strokeWidth={2} />
        </button>
      </div>
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
};
