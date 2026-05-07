import type { PortalNewsItem } from '@/data/portal-content';
import { ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';

type NewsCardProps = {
  item: PortalNewsItem;
};

export function NewsCard({ item }: NewsCardProps) {
  const Icon = item.icon;

  if (item.featured) {
    return (
      <motion.a
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.45 }}
        href={item.href}
        target="_blank"
        rel="noreferrer"
        className="group block"
      >
        <article className="portal-soft-shadow relative min-h-[300px] overflow-hidden rounded-[28px] border border-[#ddc6b1] md:min-h-[420px]">
          <img
            src={item.imageSrc}
            alt={item.imageAlt}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(31,16,12,0.08)_0%,rgba(31,16,12,0.15)_38%,rgba(24,8,5,0.82)_100%)]" />

          <div className="absolute left-4 top-4 flex items-center gap-2">
            <span className="rounded-full border border-white/30 bg-white/12 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/90 backdrop-blur-sm">
              {item.tag}
            </span>
            <span className="hidden rounded-full border border-white/20 bg-white/10 p-2 text-white/90 backdrop-blur-sm md:flex">
              <Icon className="h-4 w-4" />
            </span>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-white/70">
              {item.source} • {item.publishedAt}
            </p>
            <h4 className="mt-3 text-xl font-semibold leading-tight text-white md:text-[1.7rem]">
              {item.title}
            </h4>
            <p className="mt-3 max-w-[90%] text-sm leading-6 text-white/80 md:text-[15px]">
              {item.summary}
            </p>
          </div>
        </article>
      </motion.a>
    );
  }

  return (
    <motion.a
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.4 }}
      href={item.href}
      target="_blank"
      rel="noreferrer"
      className="group block h-full"
    >
      <article className="portal-card-shadow flex h-full flex-col overflow-hidden rounded-[24px] border border-[#e6d7c8] bg-white">
        <div className="relative overflow-hidden">
          <img
            src={item.imageSrc}
            alt={item.imageAlt}
            className="h-[190px] w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          <div className="absolute left-3 top-3 flex items-center gap-2">
            <span className="rounded-full bg-[#7b1216]/92 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-white">
              {item.tag}
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-[#7b1216] shadow-sm">
              <Icon className="h-4 w-4" />
            </span>
          </div>
        </div>

        <div className="flex flex-1 flex-col p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9a7d68]">
            {item.publishedAt}
          </p>
          <h4 className="mt-2 line-clamp-3 text-base font-semibold leading-6 text-[#261914] transition-colors group-hover:text-[#a61d21]">
            {item.title}
          </h4>
          <p className="mt-3 line-clamp-1 text-sm leading-6 text-[#6a5548]">{item.summary}</p>
          <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#a61d21]">
            Xem nguồn
            <ExternalLink className="h-3.5 w-3.5" />
          </span>
        </div>
      </article>
    </motion.a>
  );
}
