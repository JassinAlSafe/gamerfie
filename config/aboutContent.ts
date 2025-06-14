import { AboutContent } from '@/types/about';

export const aboutContent: AboutContent = {
  sections: [
    {
      title: "Revolutionizing Gaming Communities",
      content: "GameRFie is the ultimate platform for gamers to track, share, and celebrate their gaming journey. We're building the future of gaming communities, where every achievement matters and every gamer has a voice.",
      type: "text"
    },
    {
      title: "Platform Statistics",
      content: "Growing stronger every day",
      type: "stats",
      stats: [
        { label: "Active Gamers", value: "10,000+" },
        { label: "Games Tracked", value: "50,000+" },
        { label: "Reviews Posted", value: "25,000+" },
        { label: "Communities", value: "500+" }
      ]
    },
    {
      title: "What Makes Us Special",
      content: [
        "🎮 Comprehensive game tracking across all platforms",
        "👥 Connect with fellow gamers and build lasting friendships",
        "📊 Advanced analytics and insights into your gaming habits",
        "🏆 Achievement systems and progress tracking",
        "📝 Rich journaling and review features",
        "🌍 Global gaming community with local connections",
        "🔒 Privacy-first approach with granular control",
        "📱 Seamless experience across web and mobile"
      ],
      type: "feature",
      icon: "✨"
    },
    {
      title: "Our Mission",
      content: "To create the most comprehensive and user-friendly platform for gamers worldwide. We believe gaming is more than entertainment—it's a way to connect, learn, and grow. Our mission is to provide tools that enhance every aspect of your gaming experience.",
      type: "text"
    },
    {
      title: "Join the Revolution",
      content: "Whether you're a casual mobile gamer, a competitive esports athlete, or a retro gaming enthusiast, GameRFie has something for you. Join thousands of gamers who have already discovered a better way to track and share their gaming journey.",
      type: "text"
    }
  ]
};