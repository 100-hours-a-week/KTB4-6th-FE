import { Drawer } from '@base-ui/react/drawer';
import type { ReactNode } from 'react';

interface VoiceEnrollResultProps {
  image?: ReactNode;
  title: string;
  description: ReactNode;
  children: ReactNode;
}

export const VoiceEnrollResult = ({
  image,
  title,
  description,
  children,
}: VoiceEnrollResultProps) => (
  <>
    <div className="flex flex-col items-center gap-2.5 px-1 pt-3.5 pb-1 text-center">
      {image}
      <Drawer.Title className="mt-1.5 text-[21px] leading-[1.35] font-bold tracking-[-0.035em] text-cool-900">
        {title}
      </Drawer.Title>
      <Drawer.Description className="text-[13.5px] leading-[1.6] text-cool-600">
        {description}
      </Drawer.Description>
    </div>
    <div className="flex flex-col gap-1.5">{children}</div>
  </>
);
