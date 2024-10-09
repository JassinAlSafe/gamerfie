"use client";

import React from "react";
import { Spotlight } from "./ui/Spotlight";
import { SparklesPreview } from "./SparklesPreview";
import { FaLocationPin } from "react-icons/fa6";
import MagicButton from "./MagicButton";
import { useRouter } from "next/navigation";

const Hero = () => {
  const router = useRouter();

  const handleClick = React.useCallback(() => {
    console.log("Navigating to Dashboard page"); // This will appear in the browser console
    router.push("/dashboard");
  }, [router]);

  return (
    <section id="home" className="relative  pt-36">
      <div className="absolute inset-0 z-0">
        <Spotlight
          className="-top-40 -left-10 md:-left-32 md:-top-30 h-screen"
          fill="pink"
        />
        </div>
        <div className="absolute inset-0 z-0">
        <Spotlight
          className="h-[80vh] w-[50vw] top-10 left-full"
          fill="purple"
        />
        <Spotlight className="left-80 top-28 h-[80vh] w-[50vw]" fill="blue" />
      </div>
      

      <div className="w-full absolute left-0 -top-72 z-10 min-h-96"></div>

      <div className="flex justify-center relative my-20 z-20">
        <div className="max-w-[89vw] md:max-w-2xl lg:max-w-[60vw] flex flex-col items-center justify-center">

     
          <SparklesPreview />

        

          <div className="mt-9">
            <MagicButton
              icon={<FaLocationPin />}
              title="Get Started"
              position="right"
              handleClick={handleClick}
            />
          </div>
        </div>
      </div>
    </section>
  );
};


export default Hero;
