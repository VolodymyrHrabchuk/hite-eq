// pages/FinalScore.tsx
"use client";

import React, { useEffect, useState } from "react";
import TraitsCard from "../components/TransitCard";
import { useRouter } from "next/navigation";
import { ROUTES } from "../routes";
import Image from "next/image";
import { motion, Variants } from "framer-motion";

type Scores = {
  competitiveness: number;
  composure: number;
  confidence: number;
  commitment: number;
};

const coneVariants: Variants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

const textVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.5 },
  },
};

export default function FinalScore() {
  const router = useRouter();
  const [scores, setScores] = useState<Scores | null>(null);

  useEffect(() => {
    // Берём скоры из localStorage и прибавляем 25% к competitiveness
    const raw = localStorage.getItem("hiteScores");
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as Scores;
      setScores({
        competitiveness: parsed.competitiveness * 1.25,
        composure: parsed.composure,
        confidence: parsed.confidence,
        commitment: 5.0,
      });
    } catch {
      // если parse не удался — пропускаем
    }
  }, []);

  const startAgain = () => {
    router.push(ROUTES.HOME);
  };

  return (
    <div className='h-screen flex flex-col items-center justify-center w-full text-white px-6'>
      <div className='flex flex-col items-center mb-8'>
        <motion.div
          variants={coneVariants}
          initial='hidden'
          animate='visible'
          style={{ width: 200, height: 200 }}
        >
          <Image
            src='/party-cone.svg'
            alt='Party Cone'
            width={200}
            height={200}
            draggable={false}
          />
        </motion.div>

        <motion.h1
          className='text-5xl font-bold mb-2 text-center'
          variants={textVariants}
          initial='hidden'
          animate='visible'
        >
          You Did It!
        </motion.h1>

        <motion.p
          className='text-lg text-gray-300 text-center mb-6'
          variants={textVariants}
          initial='hidden'
          animate='visible'
        >
          You've completed today's Execute. Your metrics have now changed!
        </motion.p>
      </div>

      <div className='max-w-[640px] relative mb-8'>
        {scores && (
          <TraitsCard
            width='300px'
            competitiveness={scores.competitiveness}
            composure={scores.composure}
            confidence={scores.confidence}
            commitment={scores.commitment}
          />
        )}
      </div>

      <button onClick={startAgain} className='mt-12 text-white underline'>
        Try Again
      </button>
    </div>
  );
}
