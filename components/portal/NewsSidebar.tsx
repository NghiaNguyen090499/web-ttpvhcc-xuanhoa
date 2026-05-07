import type { PortalNewsSidebarContent } from '@/data/portal-content';
import { PromotionSlider } from '@/components/portal/PromotionSlider';

type NewsSidebarProps = {
  content: PortalNewsSidebarContent;
};

export function NewsSidebar({ content }: NewsSidebarProps) {
  return (
    <aside className="space-y-4">
      <PromotionSlider title={content.sliderTitle} items={content.banners} />

      <div className="portal-card-shadow overflow-hidden rounded-[24px] border border-[#e5d2c2] bg-[linear-gradient(180deg,#fffaf4_0%,#fff2e7_100%)] p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#a67b5c]">
          Hỗ trợ người dân
        </p>
        <h4 className="mt-2 text-lg font-semibold text-[#281b15]">{content.hotline.title}</h4>

        <div className="mt-4 rounded-[22px] border border-[#efddce] bg-white/88 px-4 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#a67b5c]">
            Số tổng đài
          </p>
          <p className="mt-2 text-4xl font-bold leading-none text-[#a61d21]">{content.hotline.value}</p>
          <p className="mt-3 text-sm leading-6 text-[#694f42]">{content.hotline.description}</p>
        </div>
      </div>
    </aside>
  );
}
