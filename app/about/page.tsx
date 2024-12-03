import { WobbleCardDemo } from '@/components/WobbleCard';
import { GridBackground } from '@/components/layout/GridBackground';
import { GradientText } from '@/components/ui/GradientText';
import { AboutSection } from '@/components/about/AboutSection';
import { aboutContent } from '@/config/aboutContent';

export default function About() {
  return (
    <GridBackground>
      <h1 className="text-4xl sm:text-7xl font-bold text-center py-8 mb-12">
        <GradientText>About Us</GradientText>
      </h1>

      <div className='mb-10'>
        <WobbleCardDemo />
      </div>

      {aboutContent.sections.map((section, index) => (
        <AboutSection key={index} {...section} />
      ))}
    </GridBackground>
  );
}