import type { PortalTopBarContent } from '@/data/portal-content';

type TopBarProps = {
  content: PortalTopBarContent;
};

export function TopBar({ content }: TopBarProps) {
  return (
    <div className="border-b border-[#eadfcd] bg-[#faf7f1] text-[11px] text-[#7d6353]">
      <div className="mx-auto flex w-full max-w-[1120px] items-center justify-between gap-4 px-4 py-1.5 md:px-6">
        <span>{content.siteLabel}</span>

        <div className="flex items-center gap-2">
          {content.socialLinks.map((link) => {
            const Icon = link.icon;

            return (
              <a
                key={link.label}
                href={link.href}
                className="flex h-6 w-6 items-center justify-center rounded-full border border-[#e8d8c8] bg-white text-[#a61d21] transition-colors hover:bg-[#f7eee5]"
                aria-label={link.label}
              >
                <Icon className="h-3.5 w-3.5" />
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}
