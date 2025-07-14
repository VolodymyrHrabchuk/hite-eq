"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, Variants } from "framer-motion";

import TraitsCard from "../components/TransitCard";
import { ROUTES } from "../routes";
import { getUserScores } from "../lib/api";

interface Scores {
  competitiveness: number;
  composure: number;
  confidence: number;
  commitment: number;
}

const FinalScore = () => {
  const router = useRouter();

  const [scores, setScores] = useState<Scores | null>(null);
  const [loadingScores, setLoadingScores] = useState(true);
  const [errorFetching, setErrorFetching] = useState<string | null>(null);

  // Fetch scores from API on mount
  // FinalScore.tsx (useEffect)
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      setErrorFetching("User ID not found");
      setLoadingScores(false);
      return;
    }

    getUserScores(userId)
      .then((data) => {
        setScores({
          competitiveness: data.competitiveness_score,
          composure: data.composure_score,
          confidence: data.confidence_score, 
          commitment: data.commitment_score,
        });
      })
      .catch((err) => {
        console.warn("Team fetch failed, fallback to localStorage", err);
        const raw = localStorage.getItem("hiteScores");
        if (raw) {
          try {
            const p = JSON.parse(raw);
            setScores({
              competitiveness: p.competitiveness,
              composure: p.composure,
              confidence: p.confidence,
              commitment: 5.0,
            });
          } catch {
            setErrorFetching("Cannot parse local results");
          }
        } else {
          setErrorFetching(err.message || "Failed to load results");
        }
      })
      .finally(() => setLoadingScores(false));
  }, []);

  const startAgain = () => {
    router.push(ROUTES.SCORE);
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

  return (
    <div
      className='min-h-screen flex flex-col items-center justify-center w-full text-white px-6 cursor-pointer'
      onClick={startAgain}
    >
      <div className='flex flex-col items-center mb-8'>
        <motion.div
          variants={coneVariants}
          initial='hidden'
          animate='visible'
          style={{ width: 300, height: 300 }}
        >
          <Image
            src='/party-cone.svg'
            alt='Party Cone'
            width={300}
            height={300}
            draggable={false}
          />
        </motion.div>

        <motion.h1
          className='text-5xl font-bold text-white mb-2 text-center'
          variants={textVariants}
          initial='hidden'
          animate='visible'
        >
          You Did It!
        </motion.h1>

        <div className='flex items-center space-x-2 mb-6'>
          <p className='text-lg text-gray-300 text-center'>
            You’ve completed HITE Assessment!
          </p>
        </div>
      </div>

      <div className='max-w-[640px] relative'>
        {loadingScores ? (
          <p className='text-center text-white/70'>Loading your results...</p>
        ) : errorFetching ? (
          <p className='text-center text-red-500'>{errorFetching}</p>
        ) : scores ? (
          <TraitsCard
            width='300px'
            competitiveness={scores.competitiveness}
            composure={scores.composure}
            confidence={scores.confidence}
            commitment={scores.commitment}
            showArrow={false}
          />
        ) : (
          <p className='text-center text-white/70'>No results available.</p>
        )}
      </div>
    </div>
  );
};

export default FinalScore;
