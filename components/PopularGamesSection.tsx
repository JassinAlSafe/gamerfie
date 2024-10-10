import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronRight, Users, Gamepad2 } from 'lucide-react';

interface PopularList {
  id: string;
  title: string;
  creator: string;
  gameCount: number;
  category: string;
}

const PopularListItem: React.FC<PopularList> = ({ id, title, creator, gameCount, category }) => (
  <Link href={`/list/${id}`}>
    <motion.div
      className="bg-gray-800/50 backdrop-blur-sm rounded-lg overflow-hidden shadow-lg cursor-pointer p-6 h-full flex flex-col justify-between border border-gray-700"
      whileHover={{ scale: 1.03 }}
      transition={{ duration: 0.2 }}
    >
      <div>
        <p className="text-sm font-medium text-blue-400 mb-2">{category}</p>
        <h4 className="text-xl font-semibold text-white mb-4 line-clamp-2">{title}</h4>
        <div className="flex items-center text-gray-300 mb-2">
          <Users size={16} className="mr-2" />
          <p className="text-sm">{creator}</p>
        </div>
        <div className="flex items-center text-gray-300">
          <Gamepad2 size={16} className="mr-2" />
          <p className="text-sm">{gameCount} Games</p>
        </div>
      </div>
      <div className="mt-6 flex items-center text-blue-400 group">
        <span className="text-sm font-medium">View List</span>
        <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
      </div>
    </motion.div>
  </Link>
);

const PopularGamesSection: React.FC = () => {
  const popularLists: PopularList[] = [
    {
      id: '1',
      title: 'Top RPGs of All Time',
      creator: 'GingerV',
      gameCount: 20,
      category: 'Role-Playing Games',
    },
    {
      id: '2',
      title: 'Best Indies of the Decade',
      creator: 'IndieGamer',
      gameCount: 15,
      category: 'Indie Games',
    },
    {
      id: '3',
      title: 'Classic FPS Games That Defined the Genre',
      creator: 'RetroShooter',
      gameCount: 10,
      category: 'First-Person Shooters',
    },
    {
      id: '4',
      title: 'Hidden Gems You Might Have Missed',
      creator: 'GameExplorer',
      gameCount: 25,
      category: 'Underrated Games',
    },
    {
      id: '5',
      title: 'Must-Play Nintendo Switch Exclusives',
      creator: 'NintendoFan',
      gameCount: 12,
      category: 'Nintendo Switch',
    },
    {
      id: '6',
      title: 'Best Story-Driven Adventures',
      creator: 'NarrativeNerd',
      gameCount: 18,
      category: 'Adventure Games',
    },
  ];

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: 'rgb(3, 6, 22)' }}>
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-white mb-8">Popular Game Lists</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {popularLists.map((list) => (
            <PopularListItem key={list.id} {...list} />
          ))}
        </div>
        <div className="mt-12 text-center">
          <Link href="/lists" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-300">
            Explore All Lists
            <ChevronRight size={20} className="ml-2" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PopularGamesSection;