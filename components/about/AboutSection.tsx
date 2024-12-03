
import { AboutSection as AboutSectionType } from '@/types/about';

export const AboutSection = ({ title, content, type }: AboutSectionType) => (
  <section className="mb-12">
    <h2 className="text-2xl sm:text-4xl font-semibold text-white mb-4">{title}</h2>
    {type === 'text' ? (
      <p className="text-lg text-gray-300">{content as string}</p>
    ) : (
      <ul className="list-disc list-inside text-lg text-gray-300">
        {(content as string[]).map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    )}
  </section>
);