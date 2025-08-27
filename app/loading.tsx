import { Icons } from '@/components/ui/icons';

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center">
      <div className="text-center">
        <Icons.logo className="h-12 w-12 mx-auto mb-4 animate-pulse" />
        <p className="text-gray-400 text-sm">Loading Game Vault...</p>
      </div>
    </div>
  );
}