"use client";

import Image from "next/image";
import React, { useState } from "react";
import { Timeline } from "@/components/ui/timeline";
import { timelineData } from "../data/timelineData";
import { Button } from "@/components/ui/button";

const ITEMS_PER_PAGE = 3;

export function TimelineDemo() {
  const [displayedItems, setDisplayedItems] = useState(ITEMS_PER_PAGE);

  const loadMore = () => {
    setDisplayedItems((prevItems) =>
      Math.min(prevItems + ITEMS_PER_PAGE, timelineData.length)
    );
  };

  interface Content {
    text: string | string[];
    list?: string[];
    images: string[];
  }

  const renderContent = (content: Content) => (
    <div>
      {Array.isArray(content.text) ? (
        content.text.map((text: string, index: number) => (
          <p
            key={index}
            className="text-neutral-300 text-xs md:text-sm font-normal mb-8"
          >
            {text}
          </p>
        ))
      ) : (
        <p className="text-neutral-300 text-xs md:text-sm font-normal mb-8">
          {content.text}
        </p>
      )}
      {content.list && (
        <div className="mb-8">
          {content.list.map((item: string, index: number) => (
            <div
              key={index}
              className="flex gap-2 items-center text-neutral-400 text-xs md:text-sm"
            >
              ✅ {item}
            </div>
          ))}
        </div>
      )}
      <div className="grid grid-cols-2 gap-4">
        {content.images.map((src: string, index: number) => (
          <Image
            key={index}
            src={src}
            alt={`template ${index + 1}`}
            width={500}
            height={500}
            className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-[0_0_24px_rgba(255,255,255,0.1)]"
          />
        ))}
      </div>
    </div>
  );

  const data = timelineData.slice(0, displayedItems).map((entry) => ({
    ...entry,
    content: renderContent(entry.content),
  }));

  return (
    <div className="w-full">
      <Timeline data={data} />
      {displayedItems < timelineData.length && (
        <div className="flex justify-center mt-8">
          <Button
            onClick={loadMore}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold"
          >
            Load More
          </Button>
        </div>
      )}
    </div>
  );
}
