import type { PortalStatItem } from '@/data/portal-content';

type StatsStripProps = {
  items: PortalStatItem[];
};

export function StatsStrip({ items }: StatsStripProps) {
  return (
    <section className="relative z-20 -mt-10 px-4 md:-mt-12 md:px-6">
      <div className="portal-card-shadow mx-auto grid w-full max-w-[1040px] overflow-hidden rounded-[26px] border border-[#ead8c7] bg-white md:grid-cols-3">
        {items.map((stat, index) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className={`flex items-center gap-4 px-5 py-5 md:px-6 ${
                index !== items.length - 1 ? 'border-b border-[#f0e5d9] md:border-b-0 md:border-r' : ''
              }`}
            >
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#fcf2e9] text-[#a61d21] ring-1 ring-[#f2ddc8]">
                <Icon className="h-6 w-6" />
              </div>

              <div>
                <p className="text-2xl font-bold leading-none text-[#231815]">{stat.value}</p>
                <p className="mt-1 text-sm font-semibold text-[#5a453a]">{stat.label}</p>
                <p className="mt-1 text-xs text-[#8a776a]">{stat.note}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
