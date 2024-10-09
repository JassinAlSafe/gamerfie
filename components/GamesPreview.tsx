"use client";
import React from "react";
import { Carousel, Card } from "./ui/apple-cards-carousel";
import Image from "next/image";

// DummyContent component for the cards
const DummyContent = () => {
  return (
    <>
      {[...new Array(3).fill(1)].map((_, index) => (
        <div
          key={"dummy-content" + index}
          className="bg-[#F5F5F7] dark:bg-neutral-800 p-8 md:p-14 rounded-3xl mb-4"
        >
          <p className="text-neutral-600 dark:text-neutral-400 text-base md:text-2xl font-sans max-w-3xl mx-auto">
            <span className="font-bold text-neutral-700 dark:text-neutral-200">
              The first rule of Apple club is that you boast about Apple club.
            </span>{" "}
            Keep a journal, jot down a grocery list, and take amazing class
            notes. Want to convert those notes to text? No problem.
          </p>
          <Image
            src="https://assets.aceternity.com/macbook.png"
            alt="Macbook mockup from Aceternity UI"
            height="500"
            width="500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="md:w-1/2 md:h-1/2 h-full w-full mx-auto object-contain"
          />
        </div>
      ))}
    </>
  );
};

// Static data for carousel
const staticData = [
  {
    category: "Track your gaming",
    title: "You can do more with AI.",
    src: "https://images.unsplash.com/photo-1513807762437-8c8dee6b3776?q=80&w=3027&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    content: <DummyContent />,
  },
  {
    category: "Earn Points",
    title: "Enhance your productivity.",
    src: "https://images.unsplash.com/photo-1535223289827-42f1e9919769?q=80&w=3087&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    content: <DummyContent />,
  },
  {
    category: "Platform for everyone",
    title: "Launching Soon",
    src: "https://images.unsplash.com/photo-1607853202273-797f1c22a38e?q=80&w=3027&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    content: <DummyContent />,
  },
  {
    category: "Platform for everyone",
    title: "Launching Soon",
    src: "https://images.unsplash.com/photo-1581281832703-d1ecb0b943cf?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    content: <DummyContent />,
  },
];

const GamesPreview = () => {
  const staticCards = staticData.map((item, index) => (
    <Card
      key={index}
      card={{
        title: item.title,
        category: item.category,
        src: item.src,
        content: item.content,
      }}
      index={index}
    />
  ));

  return (
    <section id="gamespreview" className="py-20 w-full">
      <h1 className="heading text-white text-center mb-10">
        <span className="text-blue-100"></span>
      </h1>
      <div>
        <Carousel items={staticCards} />
      </div>
    </section>
  );
};

export default GamesPreview;
