import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import Loading from '@/components/Loading';  // Now this import will work

// Dynamic imports for better code splitting
const Hero = dynamic(() => import("../components/Hero"), {
  loading: () => <Loading />,
});

const ShowCase = dynamic(() => import("../components/ShowCase"), {
  loading: () => <Loading />,
});

const Reviews = dynamic(() => import("../components/testimonials-showcase"), {
  loading: () => <Loading />,
});

export default function Home() {
  return (
    <main className="relative bg-black flex justify-center items-center flex-col overflow-hidden mx-auto sm:px-10 px-5">
      <div className="max-w-7xl w-full">
        <Suspense fallback={<Loading />}>
          <Hero />
          <ShowCase />
          <Reviews />
        </Suspense>
      </div>
    </main>
  );
}
