const MIN_BAR_SCALE = 0.22;

interface VoiceEnrollWaveProps {
  levels: readonly number[];
}

export const VoiceEnrollWave = ({ levels }: VoiceEnrollWaveProps) => (
  <span aria-hidden="true" className="flex h-[22px] items-center gap-[3px]">
    {levels.map((level, index) => (
      <span
        key={index}
        className="h-5 w-[3px] rounded-[2px] bg-danger transition-transform duration-100 ease-out"
        style={{
          opacity: 0.55 + (index % 3) * 0.15,
          transform: `scaleY(${Math.min(1, Math.max(MIN_BAR_SCALE, level))})`,
        }}
      />
    ))}
  </span>
);
