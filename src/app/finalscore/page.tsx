"use client";

import React from "react";
import TraitsCard from "../components/TransitCard";
import { useRouter } from "next/navigation";
import { ROUTES } from "../routes";
import Image from "next/image";
import { TrendingUp } from "lucide-react";
import { motion, Variants } from "framer-motion";

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

const FinalScore = () => {
  const router = useRouter();

  const startAgain = () => {
    router.push(ROUTES.HOME);
  };

  return (
    <div className='h-screen flex flex-col items-center justify-center w-full text-white px-6'>
      {/* Party Cone + Animated Text */}
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

      {/* Traits Card with Improvement Indicator */}
      <div className='max-w-[640px] relative mb-8'>
        <TraitsCard width='300px' />
      </div>

      {/* Стрик-секция из второго примера */}
      <div className='mt-8 bg-black/20 border border-white/20 p-4 w-full max-w-[610px] rounded-xl overflow-hidden'>
        <div className='flex items-center space-x-4'>
          {/* Иконка сердца */}

          <div className='flex-1'>
            <h2 className='text-sm font-medium mb-3'>7 Day Streak!</h2>
            <div className='flex justify-between'>
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                (day, i) => {
                  const isChecked = i < 4; // пример: 3 дня отм. как выполненные
                  const isToday = i === 2; // сегодня — Wed

                  return (
                    <div
                      key={day}
                      className='flex flex-col items-center space-y-2'
                    >
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${
                          isChecked
                            ? "bg-white"
                            : "bg-transparent border border-white/40"
                        }`}
                      >
                        {isChecked && (
                          <svg
                            width='10px'
                            height='10px'
                            viewBox='0 0 36 36'
                            aria-hidden='true'
                            role='img'
                          >
                            <path
                              fill='#000000'
                              d='M34.459 1.375a2.999 2.999 0 0 0-4.149.884L13.5 28.17l-8.198-7.58a2.999 2.999 0 1 0-4.073 4.405l10.764 9.952s.309.266.452.359a2.999 2.999 0 0 0 4.15-.884L35.343 5.524a2.999 2.999 0 0 0-.884-4.149z'
                            ></path>
                          </svg>
                        )}
                      </div>
                      <span className={`text-xs ${isToday}`}>{day}</span>
                    </div>
                  );
                }
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Кнопки действий */}
      <div className='mt-12 flex flex-col items-center space-y-4'>
        <button onClick={startAgain} className=' text-white  '>
          Try Again
        </button>
      </div>
    </div>
  );
};

export default FinalScore;
