import type { PortalFeaturedShortcut } from '@/data/portal-content';
import { ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';

type FeaturedShortcutCardProps = {
  item: PortalFeaturedShortcut;
  index: number;
};

export function FeaturedShortcutCard({ item, index }: FeaturedShortcutCardProps) {
  const Icon = item.icon;

  return (
    <motion.a
      href={item.href}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.38, delay: index * 0.06 }}
      className="portal-card-shadow group relative block h-full overflow-hidden rounded-[26px] border border-[#e2c9ba] bg-[linear-gradient(135deg,#fff7f0_0%,#fff3e7_60%,#f6dec7_100%)] p-5 transition-transform duration-300 hover:-translate-y-1"
    >
      <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-[#a61d21]/8 blur-2xl" />

      <div className="relative z-10 flex h-full flex-col">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#a67b5c]">
              {item.label}
            </p>
            <h4 className="mt-2 text-xl font-semibold leading-8 text-[#2b1e18]">{item.title}</h4>
          </div>

          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#fff4eb] text-[#a61d21] ring-1 ring-[#ead4c4]">
            <Icon className="h-7 w-7" />
          </span>
        </div>

        <p className="mt-4 max-w-[34rem] text-sm leading-7 text-[#654d40]">{item.description}</p>

        <span className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#a61d21] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white transition-colors group-hover:bg-[#7d1216]">
          {item.actionLabel}
          {item.external ? <ExternalLink className="h-3.5 w-3.5" /> : null}
        </span>
      </div>
    </motion.a>
  );
}
