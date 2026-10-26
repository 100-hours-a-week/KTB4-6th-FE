interface VoiceEnrollProgressProps {
  ratios: number[];
  currentStep: number;
}

export const VoiceEnrollProgress = ({ ratios, currentStep }: VoiceEnrollProgressProps) => (
  <div className="flex items-center gap-3">
    <div className="flex flex-1 gap-[5px]">
      {ratios.map((ratio, index) => (
        <span
          key={index}
          className="relative h-[5px] flex-1 overflow-hidden rounded-[3px] bg-cool-200"
        >
          <span
            className="absolute inset-y-0 left-0 rounded-[3px] bg-brand-600 transition-[width] duration-100 ease-linear"
            style={{ width: `${Math.min(1, ratio) * 100}%` }}
          />
        </span>
      ))}
    </div>
    <span className="shrink-0 font-mono text-xs font-medium text-brand-600 tabular-nums">
      {currentStep} / {ratios.length}
    </span>
  </div>
);
