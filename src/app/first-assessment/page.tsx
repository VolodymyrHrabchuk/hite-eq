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

  useEffect(() => {
    // 1) Всегда сначала пробуем взять локальные hiteScores
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
      } catch (err) {
        console.warn("Cannot parse local hiteScores", err);
      }
    }
    setLoadingScores(false);

    // 2) Если есть userId — дублируем из API и обновляем
    const userId = localStorage.getItem("userId");
    if (userId) {
      setLoadingScores(true);
      getUserScores(userId)
        .then((data) => {
          setScores({
            competitiveness: data.competitiveness_score,
            composure: data.composure_score,
            confidence: data.confidence_score,
            commitment: data.commitment_score,
          });
          setErrorFetching(null);
        })
        .catch((err) => {
          console.warn("API fetch failed, using local hiteScores", err);
          // оставляем локальные данные
        })
        .finally(() => {
          setLoadingScores(false);
        });
    }
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

        <motion.p
          className='text-lg text-gray-300 text-center mb-6'
          variants={textVariants}
          initial='hidden'
          animate='visible'
        >
          You’ve completed HITE Assessment!
        </motion.p>
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

      <motion.button
        onClick={startAgain}
        animate={{
          scale: [1, 1.1, 1, 1.05, 1],
        }}
        transition={{
          opacity: { duration: 2.8, repeat: Infinity, repeatType: "loop" },
          scale: {
            duration: 2.2,
            repeat: Infinity,
            repeatType: "loop",
            ease: "easeInOut",
          },
          delay: 1.5,
        }}
        whileHover={{ scale: 1 }}
        className='mt-10 p-2 bg-transparenttransition flex flex-col items-center justify-center space-y-2'
      >
        <svg
          width='28'
          height='49'
          viewBox='0 0 33 49'
          fill='none'
          className='opacity-50'
        >
          <path
            d='M32.8326 23.5341C32.8296 22.757 32.7605 22.2038 32.4166 21.6763C32.0781 21.1571 31.5717 20.7829 31.0273 20.6497C29.9132 20.377 28.6822 21.2281 27.9564 22.1923C27.9498 22.2011 27.9425 22.2089 27.9356 22.2173L27.9408 24.6313C27.9415 24.9786 27.6605 25.2608 27.3132 25.2615C27.3127 25.2615 27.3122 25.2615 27.3118 25.2615C26.965 25.2615 26.6837 24.9809 26.6829 24.6339L26.6739 20.4189C26.6715 19.3071 26.0357 18.3426 25.0146 17.9019C24.0314 17.4775 22.9401 17.647 22.1375 18.3404V24.6326C22.1375 24.98 21.8559 25.2615 21.5086 25.2615C21.1612 25.2615 20.8796 24.98 20.8796 24.6326V16.4814C20.8796 15.696 20.4682 14.9742 19.8059 14.5975C19.4702 14.4066 18.4488 13.8257 16.9801 15.8313C16.9225 15.9099 16.8499 15.9705 16.7693 16.0136V24.6325C16.7693 24.9798 16.4877 25.2614 16.1404 25.2614C15.7931 25.2614 15.5115 24.9798 15.5115 24.6325V9.71328V7.55293C15.5115 6.65691 14.9307 6.09919 14.3873 5.87598C13.844 5.65287 13.0389 5.64141 12.4091 6.27874C11.5763 7.12117 11.1177 8.23774 11.1177 9.42287V9.43631L11.1186 9.71661L11.1215 10.7039C11.1215 10.704 11.1215 10.7042 11.1215 10.7043L11.1561 22.0986C11.1591 23.0466 11.1601 24.0105 11.161 24.9425C11.1634 27.1941 11.1658 29.5224 11.1954 31.8098C11.1982 32.0229 11.0928 32.2229 10.9154 32.3412C10.7381 32.4594 10.513 32.4798 10.3173 32.3953C8.35849 31.5495 7.20533 29.6308 6.18789 27.9381L6.11547 27.8176C5.06746 26.0749 3.77174 24.2039 1.65023 24.0633C1.08837 24.0261 0.569577 24.3175 0.262483 24.843C-0.0186706 25.3243 0.220631 25.8296 0.63436 26.6142C0.728497 26.7926 0.825825 26.9772 0.91259 27.1633C2.20327 29.9321 3.64015 32.693 5.02974 35.3629C5.7217 36.6924 6.43717 38.0671 7.12693 39.428C8.874 42.875 10.6001 45.8695 14.0402 47.6068C18.5931 49.9057 23.9032 49.1647 28.2448 45.6247C29.8167 44.3428 31.0893 42.7246 31.9251 40.945C32.6179 39.4694 32.7168 37.6706 32.8125 35.931C32.8229 35.7423 32.8332 35.5548 32.8442 35.3691C33.0023 32.6969 32.9451 29.9634 32.8897 27.3199C32.864 26.0796 32.8371 24.7973 32.8326 23.5341Z'
            fill='white'
          />
          <path
            d='M7.75639 5.95148C7.83515 7.45975 8.63335 8.83198 9.86015 9.66011L9.85947 9.43974C9.85947 9.43938 9.85951 9.43906 9.85951 9.43875L9.85947 9.42261C9.85947 7.90423 10.4471 6.47364 11.5141 5.39434C12.4064 4.49123 13.6903 4.22981 14.8647 4.71223C16.0392 5.19461 16.7689 6.28303 16.7689 7.55272V7.92707C17.1152 7.25624 17.2985 6.49846 17.2985 5.69784C17.2985 3.16202 15.3172 1.06806 12.7879 0.930678C11.4426 0.858029 10.1202 1.36599 9.15874 2.32534C8.19732 3.2847 7.68617 4.6064 7.75639 5.95148Z'
            fill='white'
          />
        </svg>
      </motion.button>
      <p className='text-white/60'>Tap to continue</p>
    </div>
  );
};

export default FinalScore;
