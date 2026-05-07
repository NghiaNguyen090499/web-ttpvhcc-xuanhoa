import type { PortalResourcesContent } from '@/data/portal-content';
import { SectionHeading } from '@/components/portal/SectionHeading';

type ResourcesSectionProps = {
  content: PortalResourcesContent;
};

export function ResourcesSection({ content }: ResourcesSectionProps) {
  return (
    <section className="mx-auto w-full max-w-[1120px] px-4 py-6 md:px-6 md:py-10">
      <div className="portal-card-shadow rounded-[28px] border border-[#e5d5c5] bg-[linear-gradient(180deg,#fbf9f5_0%,#f7f0e8_100%)] p-5 md:p-7">
        <SectionHeading title={content.title} />

        <div className="grid gap-x-10 gap-y-4 md:grid-cols-2">
          {content.items.map((item) => {
            const Icon = item.icon;

            return (
              <a
                key={item.text}
                href={item.href}
                className="group flex items-center gap-3 border-b border-[#eadbcf] pb-3 text-sm font-medium text-[#43352e] transition-colors hover:text-[#a61d21]"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#a61d21] ring-1 ring-[#eddaca] transition-transform group-hover:scale-105">
                  <Icon className="h-4 w-4" />
                </span>
                <span>{item.text}</span>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
