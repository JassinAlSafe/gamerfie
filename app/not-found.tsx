import Link from 'next/link';
import { Icons } from '@/components/ui/icons';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <Icons.logo className="h-16 w-16 mx-auto mb-4" />
          <h1 className="text-6xl font-bold text-purple-400 mb-2">404</h1>
          <h2 className="text-2xl font-semibold text-white mb-4">Page Not Found</h2>
          <p className="text-gray-400 mb-8">
            Oops! The page you're looking for seems to have respawned elsewhere.
          </p>
        </div>
        
        <div className="space-y-4">
          <Button asChild className="w-full bg-purple-600 hover:bg-purple-700">
            <Link href="/">Return Home</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/explore">Explore Games</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}