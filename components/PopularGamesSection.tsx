import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface Game {
  id: string;
  title: string;
  imageUrl: string;
}

interface PopularList {
  id: string;
  title: string;
  creator: string;
  gameCount: number;
  games: Game[];
}

const PopularListItem: React.FC<PopularList> = ({ id, title, creator, gameCount, games }) => (
  <Link href={`/list/${id}`}>
    <motion.div
      className="bg-gray-800 rounded-lg overflow-hidden shadow-lg cursor-pointer"
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.2 }}
    >
      <div className="relative h-48 overflow-hidden">
        {games.slice(0, 5).map((game, index) => (
          <div
            key={game.id}
            className="absolute top-0 left-0 w-full h-full"
            style={{
              transform: `translateX(${index * 20}%)`,
              zIndex: 5 - index,
            }}
          >
            <Image
              src={game.imageUrl}
              alt={game.title}
              layout="fill"
              objectFit="cover"
              className="rounded-lg"
            />
          </div>
        ))}
      </div>
      <div className="p-4">
        <h4 className="text-lg font-medium text-white mb-2 line-clamp-2">{title}</h4>
        <p className="text-sm text-gray-400">by {creator}</p>
        <p className="text-sm text-gray-400">{gameCount} Games</p>
      </div>
    </motion.div>
  </Link>
);

const PopularGamesSection: React.FC = () => {
  const popularLists: PopularList[] = [
    {
      id: '1',
      title: 'I put Mother 3 back into my top 5 but this list still exists to show that I have the capacity for more love.',
      creator: 'GingerV',
      gameCount: 20,
      games: [
        { id: 'g1', title: 'Final Fantasy VI', imageUrl: '/placeholder.svg?height=300&width=200' },
        { id: 'g2', title: 'Legend of Zelda: Link\'s Awakening', imageUrl: '/placeholder.svg?height=300&width=200' },
        { id: 'g3', title: 'Chrono Cross', imageUrl: '/placeholder.svg?height=300&width=200' },
        { id: 'g4', title: 'Legend of Zelda: Skyward Sword', imageUrl: '/placeholder.svg?height=300&width=200' },
        { id: 'g5', title: 'Emblem', imageUrl: '/placeholder.svg?height=300&width=200' },
      ],
    },
    {
      id: '2',
      title: 'Best Indies of All Time',
      creator: 'IndieGamer',
      gameCount: 15,
      games: [
        { id: 'g6', title: 'Hollow Knight', imageUrl: '/placeholder.svg?height=300&width=200' },
        { id: 'g7', title: 'Stardew Valley', imageUrl: '/placeholder.svg?height=300&width=200' },
        { id: 'g8', title: 'Celeste', imageUrl: '/placeholder.svg?height=300&width=200' },
        { id: 'g9', title: 'Hades', imageUrl: '/placeholder.svg?height=300&width=200' },
        { id: 'g10', title: 'Undertale', imageUrl: '/placeholder.svg?height=300&width=200' },
      ],
    },
    {
      id: '3',
      title: 'Classic FPS Games That Defined the Genre',
      creator: 'RetroShooter',
      gameCount: 10,
      games: [
        { id: 'g11', title: 'Doom', imageUrl: '/placeholder.svg?height=300&width=200' },
        { id: 'g12', title: 'Quake', imageUrl: '/placeholder.svg?height=300&width=200' },
        { id: 'g13', title: 'Half-Life', imageUrl: '/placeholder.svg?height=300&width=200' },
        { id: 'g14', title: 'Unreal Tournament', imageUrl: '/placeholder.svg?height=300&width=200' },
        { id: 'g15', title: 'GoldenEye 007', imageUrl: '/placeholder.svg?height=300&width=200' },
      ],
    },
    {
      id: '4',
      title: 'Hidden Gems You Might Have Missed',
      creator: 'GameExplorer',
      gameCount: 25,
      games: [
        { id: 'g16', title: 'Outer Wilds', imageUrl: '/placeholder.svg?height=300&width=200' },
        { id: 'g17', title: 'Disco Elysium', imageUrl: '/placeholder.svg?height=300&width=200' },
        { id: 'g18', title: 'Factorio', imageUrl: '/placeholder.svg?height=300&width=200' },
        { id: 'g19', title: 'Rimworld', imageUrl: '/placeholder.svg?height=300&width=200' },
        { id: 'g20', title: 'Subnautica', imageUrl: '/placeholder.svg?height=300&width=200' },
      ],
    },
  ];

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-900">
      <h2 className="text-4xl font-bold text-white mb-8">Popular lists</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {popularLists.map((list) => (
          <PopularListItem key={list.id} {...list} />
        ))}
      </div>
    </div>
  );
};

export default PopularGamesSection;