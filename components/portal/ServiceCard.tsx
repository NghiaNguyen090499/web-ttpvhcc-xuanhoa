import type { PortalServiceItem } from '@/data/portal-content';
import { motion } from 'motion/react';

type ServiceCardProps = {
  item: PortalServiceItem;
  index: number;
};

export function ServiceCard({ item, index }: ServiceCardProps) {
  const Icon = item.icon;

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.38, delay: index * 0.04 }}
      className="portal-card-shadow rounded-[24px] border border-[#e7d6c5] bg-white p-4 transition-transform duration-300 hover:-translate-y-1"
    >
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#fbf1e7] text-[#9b1d20] ring-1 ring-[#f1dcc6]">
        <Icon className="h-8 w-8" />
      </div>

      <div className="mb-4">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#a67b5c]">
          {item.badge}
        </p>
        <h4 className="min-h-12 text-sm font-semibold leading-6 text-[#251914]">{item.label}</h4>
      </div>

      <a
        href={item.href}
        className="inline-flex h-10 w-full items-center justify-center rounded-full bg-[#a61d21] px-4 text-xs font-semibold text-white transition-colors hover:bg-[#7d1216]"
      >
        Truy cập dịch vụ
      </a>
    </motion.article>
  );
}
