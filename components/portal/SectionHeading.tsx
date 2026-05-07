import type { ReactNode } from 'react';

type SectionHeadingProps = {
  title: string;
  action?: ReactNode;
};

export function SectionHeading({ title, action }: SectionHeadingProps) {
  return (
    <div className="mb-5 flex items-center justify-between gap-4 md:mb-7">
      <div className="flex items-center gap-3">
        <span className="h-7 w-1.5 rounded-full bg-[#a61d21]" />
        <h3 className="text-lg font-semibold text-[#231815] md:text-xl">{title}</h3>
      </div>
      {action}
    </div>
  );
}
