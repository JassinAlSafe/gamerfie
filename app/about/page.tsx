import { AboutSection } from '@/components/about/AboutSection';
import { aboutContent } from '@/config/aboutContent';

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl sm:text-7xl font-bold text-center py-8 mb-12 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
          About Us
        </h1>

        {aboutContent.sections.map((section, index) => (
          <AboutSection key={index} {...section} />
        ))}
      </div>
    </div>
  );
}