import React from 'react'
import { WobbleCardDemo } from '@/components/WobbleCard'

function About() {
  return (
    <div className="min-h-screen w-full bg-black bg-grid-white/[0.2] relative">
      <div className="absolute pointer-events-none inset-0 bg-black [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
      <div className="relative z-10 container mx-auto px-4 py-16">
        <h1 className="text-4xl sm:text-7xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-b from-neutral-200 to-neutral-500 py-8 mb-12">
          About Us
        </h1>

        <section>
            <div className='mb-10'>
                <WobbleCardDemo />
            </div>
        </section>
        
        {/* Add your content sections here */}
        <section className="mb-12">
          <h2 className="text-2xl sm:text-4xl font-semibold text-white mb-4">Our Mission</h2>
          <p className="text-lg text-gray-300">
            We are dedicated to providing the best gaming experience for our users. Our platform aims to connect gamers, share insights, and celebrate the diverse world of video games.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl sm:text-4xl font-semibold text-white mb-4">What We Offer</h2>
          <ul className="list-disc list-inside text-lg text-gray-300">
            <li>Comprehensive game tracking</li>
            <li>Community-driven game lists and recommendations</li>
            <li>In-depth game reviews and ratings</li>
            <li>Latest gaming news and updates</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl sm:text-4xl font-semibold text-white mb-4">Join Our Community</h2>
          <p className="text-lg text-gray-300">
            Whether you&apos;re a casual gamer or a hardcore enthusiast, there&apos;s a place for you here. Join us in shaping the future of gaming communities!
          </p>
        </section>
      </div>
    </div>
  )
}

export default About