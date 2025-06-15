export default function Sitemap() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
          Sitemap
        </h1>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <SitemapSection
            title="Main Pages"
            links={[
              { href: '/', label: 'Home' },
              { href: '/explore', label: 'Explore' },
              { href: '/info/about', label: 'About' },
            ]}
          />
          <SitemapSection
            title="User Pages"
            links={[
              { href: '/profile', label: 'Profile' },
              { href: '/profile/games', label: 'Your Games' },
              { href: '/settings', label: 'Settings' },
            ]}
          />
          <SitemapSection
            title="Game Pages"
            links={[
              { href: '/all-games', label: 'All Games' },
              { href: '/game/popular', label: 'Popular Games' },
            ]}
          />
        </div>
      </div>
    </div>
  );
}

interface SitemapLink {
  href: string;
  label: string;
}

interface SitemapSectionProps {
  title: string;
  links: SitemapLink[];
}

function SitemapSection({ title, links }: SitemapSectionProps) {
  return (
    <div className="p-6 rounded-lg bg-gray-800/50 backdrop-blur-sm">
      <h2 className="text-xl font-semibold text-white mb-4">{title}</h2>
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link.href}>
            <a
              href={link.href}
              className="text-gray-300 hover:text-white transition-colors"
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}