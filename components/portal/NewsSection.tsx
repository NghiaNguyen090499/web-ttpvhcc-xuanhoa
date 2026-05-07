import type { PortalNewsItem, PortalNewsSidebarContent } from '@/data/portal-content';
import { NewsCard } from '@/components/portal/NewsCard';
import { NewsSidebar } from '@/components/portal/NewsSidebar';
import { SectionHeading } from '@/components/portal/SectionHeading';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type NewsSectionProps = {
  title: string;
  items: PortalNewsItem[];
  sidebar: PortalNewsSidebarContent;
};

export function NewsSection({ title, items, sidebar }: NewsSectionProps) {
  const featuredNews = items.find((item) => item.featured) ?? items[0];
  const standardNews = items.filter((item) => item.href !== featuredNews.href);

  return (
    <section className="mx-auto w-full max-w-[1120px] px-4 pb-6 pt-12 md:px-6 md:pt-16">
      <SectionHeading
        title={title}
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              aria-label="Tin trước"
              className="h-9 w-9 rounded-full border-[#ddc6b1] bg-white text-[#7f1417] hover:bg-[#f9f0e7]"
              type="button"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              aria-label="Tin tiếp theo"
              className="h-9 w-9 rounded-full border-[#ddc6b1] bg-white text-[#7f1417] hover:bg-[#f9f0e7]"
              type="button"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
        <div className="grid gap-4 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <NewsCard item={featuredNews} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:col-span-7">
            {standardNews.slice(0, 2).map((item) => (
              <div key={item.href}>
                <NewsCard item={item} />
              </div>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:col-span-12">
            {standardNews.slice(2).map((item) => (
              <div key={item.href}>
                <NewsCard item={item} />
              </div>
            ))}
          </div>
        </div>

        <NewsSidebar content={sidebar} />
      </div>
    </section>
  );
}
