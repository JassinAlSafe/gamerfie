import GamesPreview from "@/components/GamesPreview";
import Hero from "../components/Hero";
import ShowCase from "../components/ShowCase";
import Reviews from "../components/Reviews"

export default function Home() {
  return (
    <main className="relative bg-black flex justify-center items-center flex-col overflow-hidden mx-auto sm:px-10 px-5">
      <div className="max-w-7xl w-full">
        <Hero />
        <GamesPreview />
        <ShowCase />
        <Reviews />       
      
      </div>
    </main>
  );
}

