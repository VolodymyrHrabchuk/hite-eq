"use client";

import LandingPage from "./LandingPage";
import Score from "./score/page";
import Train from "./train/page";
import MindfulnessCard from "./mindfulness/page";
export default function Home() {
  return (
    <div className='relative h-screen  w-full overflow-hidden'>
      <LandingPage />
    </div>
  );
}
