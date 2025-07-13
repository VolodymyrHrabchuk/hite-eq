"use client";

import TraitsCard from "../components/TransitCard";
import { useRouter } from "next/navigation";
import { ROUTES } from "../routes";
import Image from "next/image";
import { motion, Variants } from "framer-motion";

const FinalScore = () => {
  const router = useRouter();

  const startAgain = () => {
    router.push(ROUTES.SCORE);
  };

  // Варианты анимации для конуса и текста
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
        {/* Анимированный конус */}
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

        {/* Анимированный заголовок */}
        <motion.h1
          className='text-5xl font-bold text-white mb-2 text-center'
          variants={textVariants}
          initial='hidden'
          animate='visible'
        >
          You Did It!
        </motion.h1>

        {/* Анимированный подзаголовок */}
        <div className='flex items-center space-x-2 mb-6'>
          <p className='text-lg text-gray-300 text-center'>
            You’ve completed HITE Assessment!
          </p>
        </div>
      </div>

      <div className='max-w-[640px] relative'>
        <TraitsCard width='300px' />
      </div>
    </div>
  );
};

export default FinalScore;
