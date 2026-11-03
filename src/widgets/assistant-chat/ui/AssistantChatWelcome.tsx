import Image from 'next/image';

export const AssistantChatWelcome = () => (
  <section className="flex flex-col items-center gap-2 pt-1.5 pb-2.5">
    <div aria-hidden="true" className="relative flex h-32 w-[136px] items-end justify-center">
      <span className="absolute inset-x-3.5 bottom-0 h-[108px] rounded-full bg-brand-100" />
      <span className="absolute inset-x-[38px] bottom-1.5 h-2 rounded-full bg-brand-600/15" />
      <Image
        src="/brand/mascot/meety-10-default-transparent.png"
        alt=""
        width={104}
        height={104}
        priority
        className="relative mb-2 size-[104px] motion-safe:animate-meety-peek"
      />
      <span className="absolute top-0.5 -right-1 origin-bottom-left rounded-[11px_11px_11px_3px] bg-[#f5b73b] px-[9px] py-1.5 text-[11.5px] leading-none font-bold text-cool-900 motion-safe:animate-meety-wave">
        안녕!
      </span>
    </div>
    <h2 className="mt-2 text-center text-[21px] leading-[1.35] font-bold tracking-[-0.035em] text-cool-900">
      저는 미티예요
    </h2>
    <p className="text-center text-[13.5px] leading-[1.65] break-keep text-cool-600">
      회의 준비부터 정리까지 도와드릴게요.
      <br />
      무엇을 물어볼지 모르겠다면 오른쪽 위 ?를 눌러보세요.
    </p>
  </section>
);
