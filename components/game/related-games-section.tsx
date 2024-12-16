import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Star, Users, Gamepad2, Puzzle } from 'lucide-react';
import { Game } from '@/types/game';
import { ensureAbsoluteUrl } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface RelatedGamesSectionProps {
  games: Game[];
}

export function RelatedGamesSection({ games }: RelatedGamesSectionProps) {
  if (!games?.length) {
    return (
      <div className="text-center py-12 text-gray-400">
        <Gamepad2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No related games found.</p>
        <p className="text-sm mt-2 text-gray-500">This game might not have any DLCs or games from the same series.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {games.map((game, index) => (
        <Link key={game.id} href={`/game/${game.id}`}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="group relative aspect-[3/4] rounded-lg overflow-hidden bg-gray-900/50"
          >
            {/* DLC Badge */}
            {game.version_parent && (
              <div className="absolute top-2 right-2 z-10">
                <Badge variant="secondary" className="bg-purple-500/20 text-purple-300">
                  <Puzzle className="w-3 h-3 mr-1" />
                  DLC
                </Badge>
              </div>
            )}

            {game.cover?.url ? (
              <Image
                src={ensureAbsoluteUrl(game.cover.url)}
                alt={game.name}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-110"
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
                loading={index < 6 ? "eager" : "lazy"}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                <Gamepad2 className="h-10 w-10 text-gray-600" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h2 className="text-white text-sm font-semibold line-clamp-2 mb-2">
                  {game.name}
                </h2>
                <div className="flex items-center gap-3">
                  {game.rating && (
                    <div className="flex items-center text-yellow-400">
                      <Star className="h-3 w-3 mr-1 fill-current" />
                      <span className="text-xs">{Math.round(game.rating)}</span>
                    </div>
                  )}
                  {game.total_rating_count && (
                    <div className="flex items-center text-gray-400">
                      <Users className="h-3 w-3 mr-1" />
                      <span className="text-xs">
                        {game.total_rating_count > 1000
                          ? `${(game.total_rating_count / 1000).toFixed(1)}k`
                          : game.total_rating_count}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </Link>
      ))}
    </div>
  );
} 