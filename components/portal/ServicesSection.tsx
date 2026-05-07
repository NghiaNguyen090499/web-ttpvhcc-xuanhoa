import type { PortalFeaturedShortcut, PortalServiceItem } from '@/data/portal-content';
import { FeaturedShortcutCard } from '@/components/portal/FeaturedShortcutCard';
import { SectionHeading } from '@/components/portal/SectionHeading';
import { ServiceCard } from '@/components/portal/ServiceCard';

type ServicesSectionProps = {
  title: string;
  featuredLinks: PortalFeaturedShortcut[];
  items: PortalServiceItem[];
};

export function ServicesSection({ title, featuredLinks, items }: ServicesSectionProps) {
  return (
    <section className="mx-auto w-full max-w-[1120px] px-4 py-6 md:px-6 md:py-8">
      <SectionHeading title={title} />

      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        {featuredLinks.map((item, index) => (
          <div key={item.title}>
            <FeaturedShortcutCard item={item} index={index} />
          </div>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {items.map((item, index) => (
          <div key={item.label}>
            <ServiceCard item={item} index={index} />
          </div>
        ))}
      </div>
    </section>
  );
}
