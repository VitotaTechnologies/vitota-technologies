import Link from 'next/link';
import { Hero } from '@/components/public/Hero';
import { ServicesSection } from '@/components/public/ServicesSection';
import { AboutSection } from '@/components/public/AboutSection';
import { HowWeWorkSection } from '@/components/public/HowWeWorkSection';
import { PortfolioSection } from '@/components/public/PortfolioSection';
import { WhyChooseSection } from '@/components/public/WhyChooseSection';
import { StatisticsSection } from '@/components/public/StatisticsSection';
import { LeadershipSection } from '@/components/public/LeadershipSection';
import { TestimonialsSection } from '@/components/public/TestimonialsSection';
import { CTASection } from '@/components/public/CTASection';
import { ContactSection } from '@/components/public/ContactSection';

export default function HomePage() {
  return (
    <>
      <Hero />
      <AboutSection />
      <ServicesSection />
      <HowWeWorkSection />
      <PortfolioSection />
      <WhyChooseSection />
      <StatisticsSection />
      <LeadershipSection />
      <TestimonialsSection />
      <CTASection />
      <ContactSection />
    </>
  );
}