import type { PortalFooterContent } from '@/data/portal-content';
import { ExternalLink, MapPin } from 'lucide-react';

type PortalFooterProps = {
  content: PortalFooterContent;
};

export function PortalFooter({ content }: PortalFooterProps) {
  return (
    <footer className="mt-8 bg-[linear-gradient(180deg,#8d1114_0%,#6d0d10_100%)] text-white">
      <div className="mx-auto grid w-full max-w-[1120px] gap-8 px-4 py-10 md:px-6 lg:grid-cols-[1.1fr_1fr_1.1fr]">
        <section>
          <h4 className="font-heading text-2xl font-semibold uppercase tracking-[0.05em]">
            {content.contactTitle}
          </h4>
          <div className="portal-divider mt-3 h-px w-full" />

          <ul className="mt-5 space-y-4 text-sm text-white/82">
            {content.contactItems.map((item) => {
              const Icon = item.icon;

              return (
                <li key={item.value}>
                  {item.href ? (
                    <a href={item.href} className="flex items-start gap-3 transition-colors hover:text-white">
                      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#f2bf67]" />
                      <span>{item.value}</span>
                    </a>
                  ) : (
                    <div className="flex items-start gap-3">
                      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#f2bf67]" />
                      <span>{item.value}</span>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </section>

        <section>
          <h4 className="font-heading text-2xl font-semibold uppercase tracking-[0.05em]">
            {content.mapTitle}
          </h4>
          <div className="portal-divider mt-3 h-px w-full" />

          <div className="portal-card-shadow relative mt-5 h-[220px] overflow-hidden rounded-[26px] border border-white/14 bg-[linear-gradient(135deg,#f4d8ba_0%,#d9b28c_35%,#c3875e_100%)]">
            <div className="portal-map-grid absolute inset-0 opacity-40" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.4),transparent_38%)]" />
            <div className="absolute left-[16%] top-[22%] rounded-full bg-white/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7b1718]">
              Trục chính
            </div>
            <div className="absolute bottom-[26%] right-[18%] rounded-full bg-white/72 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7b1718]">
              Khu dân cư
            </div>
            <div className="absolute left-[48%] top-[50%] flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold text-[#7b1718] ring-1 ring-[#ebd5c3]">
              <MapPin className="h-4 w-4" />
              Phường Xuân Hòa
            </div>
          </div>
        </section>

        <section>
          <h4 className="font-heading text-2xl font-semibold uppercase tracking-[0.05em]">
            {content.linksTitle}
          </h4>
          <div className="portal-divider mt-3 h-px w-full" />

          <ul className="mt-5 space-y-3 text-sm text-white/82">
            {content.externalLinks.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className="flex items-start gap-3 transition-colors hover:text-white"
                  target={link.href.startsWith('http') ? '_blank' : undefined}
                  rel={link.href.startsWith('http') ? 'noreferrer' : undefined}
                >
                  <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-[#f2bf67]" />
                  <span>{link.label}</span>
                </a>
              </li>
            ))}
          </ul>

          <div className="mt-7">
            <h5 className="text-sm font-semibold uppercase tracking-[0.18em] text-white/78">
              {content.socialTitle}
            </h5>

            <div className="mt-4 grid grid-cols-2 gap-3">
              {content.socialButtons.map((button) => {
                const Icon = button.icon;

                return (
                  <a
                    key={button.label}
                    href={button.href}
                    className={`flex min-h-14 items-center gap-2 rounded-[18px] border px-3 py-2 text-white transition-transform duration-200 hover:-translate-y-0.5 ${button.buttonClass}`}
                  >
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${button.iconClass}`}>
                      <Icon className="h-4.5 w-4.5" />
                    </span>
                    <span className="min-w-0 leading-none">
                      <span className="block text-sm font-semibold uppercase tracking-[0.12em]">
                        {button.label}
                      </span>
                    </span>
                  </a>
                );
              })}
            </div>
          </div>
        </section>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-2 px-4 py-4 text-[11px] text-white/60 md:flex-row md:items-center md:justify-between md:px-6">
          <p>{content.credits[0]}</p>
          <p>{content.credits[1]}</p>
        </div>
      </div>
    </footer>
  );
}
