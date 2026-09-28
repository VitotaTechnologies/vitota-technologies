import { AboutSection } from '@/components/public/AboutSection';
import { WhyChooseSection } from '@/components/public/WhyChooseSection';

export const metadata = { title: 'About' };

export default function AboutPage() {
  return (
    <>
      <AboutSection />
      <WhyChooseSection />
    </>
  );
}