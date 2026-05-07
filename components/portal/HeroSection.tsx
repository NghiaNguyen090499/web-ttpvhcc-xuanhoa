import type { PortalHeroContent } from '@/data/portal-content';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'motion/react';

type HeroSectionProps = {
  content: PortalHeroContent;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
};

export function HeroSection({
  content,
  searchQuery,
  onSearchQueryChange,
}: HeroSectionProps) {
  const PrimaryIcon = content.primaryAction.icon;
  const SecondaryIcon = content.secondaryAction.icon;

  return (
    <section className="relative overflow-hidden bg-[linear-gradient(180deg,#b62320_0%,#8e1115_100%)] pb-18 pt-6 md:pb-24 md:pt-8">
      <div className="portal-hero-pattern absolute inset-0" />
      <div className="absolute -right-20 top-0 h-72 w-72 rounded-full bg-white/8 blur-3xl" />
      <div className="absolute -left-10 bottom-0 h-56 w-56 rounded-full bg-[#f2b756]/12 blur-3xl" />

      <div className="relative z-10 mx-auto w-full max-w-[1120px] px-4 md:px-6">
        <div className="mx-auto max-w-[760px]">
          <div className="relative mb-8 md:mb-10">
            <Input
              type="text"
              aria-label="Tìm kiếm thủ tục hành chính"
              placeholder={content.searchPlaceholder}
              className="h-13 rounded-[16px] border-[#dbaf84] bg-white/96 pl-4 pr-16 text-sm text-[#38261e] placeholder:text-[#8b7669] focus-visible:border-[#f0b654] focus-visible:ring-[#f0b654]/30 md:h-14 md:text-[15px]"
              value={searchQuery}
              onChange={(event) => onSearchQueryChange(event.target.value)}
            />

            <Button
              aria-label="Tìm kiếm"
              className="absolute right-1.5 top-1.5 h-10 w-11 rounded-[12px] bg-[#f0b654] text-[#7c1717] hover:bg-[#f3c36a] md:h-11 md:w-12"
              type="button"
            >
              <SecondaryIcon className="h-4 w-4" />
            </Button>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="text-center text-white"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.38em] text-white/72 md:text-xs">
              {content.eyebrow}
            </p>
            <h1 className="mt-4 font-heading text-[clamp(2.35rem,6.5vw,4.6rem)] font-semibold uppercase leading-[0.92] tracking-[0.02em]">
              {content.title}
            </h1>
            <p className="mx-auto mt-5 max-w-[620px] text-sm leading-7 text-white/82 md:text-base">
              {content.description}
            </p>

            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <Button
                className="h-12 rounded-full bg-[#f7e0b4] px-6 text-sm font-semibold text-[#7a1518] hover:bg-[#f3d292] md:h-13 md:px-7"
                type="button"
              >
                <PrimaryIcon className="mr-2 h-4 w-4" />
                {content.primaryAction.label}
              </Button>

              <Button
                className="h-12 rounded-full border border-white/28 bg-[#7c1216]/88 px-6 text-sm font-semibold text-white hover:bg-[#6a0f13] md:h-13 md:px-7"
                type="button"
              >
                <SecondaryIcon className="mr-2 h-4 w-4" />
                {content.secondaryAction.label}
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
