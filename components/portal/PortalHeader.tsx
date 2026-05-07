import type { PortalHeaderContent } from '@/data/portal-content';

type PortalHeaderProps = {
  content: PortalHeaderContent;
};

export function PortalHeader({ content }: PortalHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-[#eadfcd] bg-white/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-4 px-4 py-3 md:px-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3 md:gap-4">
          <img
            src="/branding/xuan-hoa-logo.png"
            alt="Logo Phường Xuân Hòa"
            className="h-14 w-14 rounded-full object-contain md:h-16 md:w-16"
          />

          <div>
            <p className="font-heading text-2xl font-semibold uppercase leading-none tracking-[0.06em] text-[#7c1216]">
              {content.agencyTitle}
            </p>
            <p className="mt-1 font-heading text-[1.9rem] font-semibold uppercase leading-none tracking-[0.08em] text-[#a61d21]">
              {content.agencySubtitle}
            </p>
          </div>
        </div>

        <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 lg:justify-end">
          {content.navLinks.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className={`text-sm font-semibold transition-colors ${
                item.active ? 'text-[#a61d21]' : 'text-[#53453d] hover:text-[#a61d21]'
              }`}
            >
              <span className={item.active ? 'border-b-2 border-[#dca64f] pb-1.5' : ''}>{item.label}</span>
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
