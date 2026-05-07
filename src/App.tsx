import { useState } from 'react';
import { siteContent } from '@/data/portal-content';
import {
  ChatbotWidget,
  HeroSection,
  NewsSection,
  PortalFooter,
  PortalHeader,
  ResourcesSection,
  ServicesSection,
  StatsStrip,
  TopBar,
} from '@/components/portal';

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen text-[#2f241d]">
      <TopBar content={siteContent.topBar} />
      <PortalHeader content={siteContent.header} />

      <main>
        <HeroSection
          content={siteContent.hero}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
        />
        <StatsStrip items={siteContent.stats} />
        <NewsSection
          title={siteContent.newsSectionTitle}
          items={siteContent.news}
          sidebar={siteContent.newsSidebar}
        />
        <ServicesSection
          title={siteContent.servicesSectionTitle}
          featuredLinks={siteContent.featuredShortcuts}
          items={siteContent.services}
        />
        <ResourcesSection content={siteContent.resources} />
      </main>

      <PortalFooter content={siteContent.footer} />
      <ChatbotWidget />
    </div>
  );
}
