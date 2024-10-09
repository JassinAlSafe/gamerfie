import React from "react";
import { ExpandableCardDemo } from "./ui/ExpandableCards";
import { BentoShowcase } from "./BentoShowcase";

const Showcase = () => {
  return (
    <section id="showcase" className="py-20 w-full">
      <h1 className="heading text-white  flex text-right">
        Discover <span className="text-blue-400 mr-2 ml-2">Gaming</span> Like Never Before!
      </h1>

      <div className="mt-10">
        <BentoShowcase />
      </div>
    </section>
  );
};

export default Showcase;
