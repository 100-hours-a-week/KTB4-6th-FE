import type { FormEvent } from 'react';
import { ArrowUp } from 'lucide-react';
import { cn } from '@/shared/lib';

interface AssistantChatComposerProps {
  value: string;
  onValueChange: (value: string) => void;
}

export const AssistantChatComposer = ({ value, onValueChange }: AssistantChatComposerProps) => {
  const canSubmit = value.trim().length > 0;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  return (
    <footer className="shrink-0 border-t border-cool-200 bg-white px-3.5 pt-2.5 pb-6">
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 rounded-3xl border border-cool-200 bg-cool-50 py-[3px] pr-[3px] pl-4"
      >
        <input
          value={value}
          onChange={(event) => onValueChange(event.target.value)}
          placeholder="미티에게 물어보세요"
          aria-label="미티에게 보낼 질문"
          className="h-10 min-w-0 flex-1 bg-transparent text-sm text-cool-900 outline-none placeholder:text-cool-500"
        />
        <button
          type="submit"
          aria-label="보내기"
          disabled={!canSubmit}
          className={cn(
            'flex size-10 shrink-0 items-center justify-center rounded-full text-white transition-colors',
            canSubmit ? 'bg-brand-600 hover:bg-brand-700' : 'bg-cool-300',
          )}
        >
          <ArrowUp className="size-[17px]" strokeWidth={2} />
        </button>
      </form>
    </footer>
  );
};
