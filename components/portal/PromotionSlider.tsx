import type { PortalPromotionBanner } from '@/data/portal-content';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

type PromotionSliderProps = {
  title: string;
  items: PortalPromotionBanner[];
};

export function PromotionSlider({ title, items }: PromotionSliderProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeItem = items[activeIndex];
  const ActiveIcon = activeItem.icon;

  useEffect(() => {
    if (items.length <= 1) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % items.length);
    }, 4800);

    return () => window.clearInterval(timer);
  }, [items.length]);

  const showPrevious = () => {
    setActiveIndex((current) => (current - 1 + items.length) % items.length);
  };

  const showNext = () => {
    setActiveIndex((current) => (current + 1) % items.length);
  };

  return (
    <div className="portal-card-shadow overflow-hidden rounded-[24px] border border-[#e5d2c2] bg-white">
      <div className="flex items-center justify-between border-b border-[#efe1d5] px-4 py-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#a67b5c]">
            Cột tiện ích
          </p>
          <h4 className="mt-1 text-base font-semibold text-[#2a1d17]">{title}</h4>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            type="button"
            aria-label="Banner trước"
            onClick={showPrevious}
            className="h-8 w-8 rounded-full border-[#e3cfbd] bg-white text-[#8a1619] hover:bg-[#faf0e7]"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            type="button"
            aria-label="Banner tiếp theo"
            onClick={showNext}
            className="h-8 w-8 rounded-full border-[#e3cfbd] bg-white text-[#8a1619] hover:bg-[#faf0e7]"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="p-4">
        <motion.a
          key={`${activeItem.label}-${activeIndex}`}
          href={activeItem.href}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className={`block overflow-hidden rounded-[22px] bg-gradient-to-br ${activeItem.surfaceClass} p-5 text-white`}
        >
          <div className="flex items-start justify-between gap-4">
            <span className="rounded-full border border-white/18 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/88">
              {activeItem.label}
            </span>
            <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/18 bg-white/10 text-white">
              <ActiveIcon className="h-5 w-5" />
            </span>
          </div>

          <h5 className="mt-6 text-lg font-semibold leading-7">{activeItem.title}</h5>
          <p className="mt-3 text-sm leading-6 text-white/82">{activeItem.description}</p>
        </motion.a>

        <div className="mt-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {items.map((item, index) => (
              <button
                key={item.title}
                type="button"
                aria-label={`Chuyển đến banner ${index + 1}`}
                onClick={() => setActiveIndex(index)}
                className={`h-2.5 rounded-full transition-all ${
                  index === activeIndex ? 'w-7 bg-[#a61d21]' : 'w-2.5 bg-[#ddc8b8]'
                }`}
              />
            ))}
          </div>

          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#946f57]">
            {activeIndex + 1}/{items.length}
          </p>
        </div>
      </div>
    </div>
  );
}
