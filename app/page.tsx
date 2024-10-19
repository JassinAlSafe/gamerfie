import Hero from "../components/Hero";
import ShowCase from "../components/ShowCase";
import Reviews from "../components/Reviews";
import DefaultLayout from "./default-layout";

export default function Home() {
  return (
    <DefaultLayout>
      <main className="relative bg-black flex justify-center items-center flex-col overflow-hidden mx-auto sm:px-10 px-5">
        <div className="max-w-7xl w-full">
          <Hero />
          <ShowCase />
          <Reviews />
        </div>
      </main>
    </DefaultLayout>
  );
}
