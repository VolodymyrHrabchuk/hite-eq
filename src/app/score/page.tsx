"use client";
import TraitsCard from "../components/TransitCard";
import { useRouter } from "next/navigation";
import { ROUTES } from "../routes";
import { useEffect, useState } from "react";
import First from "../../../public/first.svg";
import Second from "../../../public/second.svg";
import Third from "../../../public/third.svg";
import Nib from "../../../public/nib.svg";
import Image from "next/image";
import Discover from "../../../public/discover.svg";
import Execute from "../../../public/execute.svg";
import Star from "../../../public/star.svg";
import { LockClosedIcon } from "@heroicons/react/24/solid";
import Block from "../../../public/block.svg";
import Lock from "../../../public/lock.svg";
import MorphingLock from "../components/AnimatedLock";
import { Raleway } from "next/font/google";

const raleway = Raleway({
  subsets: ["latin"],
  weight: ["400", "500", "700"], // добавь нужные веса
  variable: "--font-raleway", // опционально, если хочешь использовать CSS переменную
  display: "swap",
});
const Score = () => {
  const router = useRouter();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [showTrainPopup, setShowTrainPopup] = useState(false);
  const [showExcutePopup, setShowExcutePopup] = useState(false);
  const [unlockedLevel, setUnlockedLevel] = useState<number>(0);
  const [lockAnimate, setLockAnimate] = useState(false);

  useEffect(() => {
    // триггерим анимацию замочка при открытии любого попапа
    if (showTrainPopup || showExcutePopup) {
      setLockAnimate(false);
      const t = setTimeout(() => setLockAnimate(true), 50);
      return () => clearTimeout(t);
    }
  }, [showTrainPopup, showExcutePopup]);
  const [scores, setScores] = useState<Record<string, number>>({
    composure: 0,
    confidence: 0,
    competitiveness: 0,
    commitment: 0,
  });

  const steps = [
    { image: Discover, title: "Discover" },
    { image: Star, title: "Train" },
    { image: Execute, title: "Execute" },
  ];

  const discoverAssessment = () => {
    router.push(ROUTES.Discover);
  };

  const trainAssessment = () => {
    localStorage.removeItem("showTrainPopup");
    router.push(ROUTES.Train);
  };

  const excuteAssessment = () => {
    localStorage.removeItem("showExcutePopup");
    router.push(ROUTES.EXECUTEPLAN);
  };

  useEffect(() => {
    const storedState = localStorage.getItem("showTrainPopup");
    setScores(JSON.parse(localStorage.getItem("hiteScores") || "{}"));
    setShowTrainPopup(storedState === "true");
    // Read unlocked level from localStorage
    const level = parseInt(localStorage.getItem("level") || "0", 10);
    setUnlockedLevel(level);
  }, []);

  useEffect(() => {
    const storedState = localStorage.getItem("showExcutePopup");
    setShowExcutePopup(storedState === "true");
  }, []);

  return (
    <div className='text-white mt-15 px-4 sm:px-0'>
      <div className='max-w-[640px] mx-auto'>
        <h1 className='text-[28px] font-bold mb-8 text-start'>Your Result</h1>

        <TraitsCard
          width='305px'
          commitment={scores.commitment}
          composure={scores.composure}
          confidence={scores.confidence}
          competitiveness={scores.competitiveness}
        />

        <div className='mt-5 bg-black/20 border border-white/20 p-4 w-157 rounded-xl overflow-hidden'>
          <div className='flex items-center space-x-4'>
            <div className='border-white/30 flex items-center justify-center w-10 h-10 border rounded-full'>
              <svg
                width='24'
                height='25'
                viewBox='0 0 24 25'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  d='M8.65752 20.462C7.97501 18.9357 8.32659 17.0239 9.53126 15.8518L12.4751 12.9079L15.4185 15.8518C16.6148 17.016 16.9718 18.9101 16.3054 20.4314C20.4092 18.0271 21.1471 12.0977 17.7286 8.77252C17.7287 8.77252 12.4562 3.5 12.4562 3.5L7.18413 8.77252C5.77586 10.1808 5.00029 12.0531 5.00029 14.0446C4.97653 16.6486 6.41814 19.1518 8.65752 20.462Z'
                  fill='white'
                />
                <path
                  d='M10.5621 16.883C8.9056 18.5485 10.0141 21.3764 12.3368 21.4961C14.7868 21.6232 16.1343 18.6388 14.388 16.883L12.4753 14.9698L10.5621 16.883Z'
                  fill='white'
                />
              </svg>
            </div>

            <div className='flex-1'>
              <h2 className='text-sm font-medium mb-3'>7 Day Streak!</h2>
              <div className='flex justify-between'>
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                  (day, i) => {
                    const isChecked = i < 3; // заменишь на логику из данных

                    return (
                      <div
                        key={day}
                        className='flex flex-col items-center space-y-2'
                      >
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center ${
                            isChecked
                              ? "bg-white"
                              : "bg-transparent border border-white/40"
                          }`}
                        >
                          {isChecked ? (
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
                          ) : null}
                        </div>
                        <span className='text-xs text-white'>{day}</span>
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          </div>
        </div>

        <div className='mt-2 bg-black/20 border border-white/20 p-3 w-157 rounded-xl flex items-center space-x-1'>
          <div className='flex items-center justify-center space-x-4 w-12 h-12 border border-white/30 rounded-full'>
            <Image src='/bot.svg' alt='Logo' width={26} height={22} />
          </div>
          <div>
            <p className='text-sm font-medium'>
              Need a boost or have a question?
            </p>
            <div className='flex items-center space-x-2'>
              <span className='text-white/80 text-sm font-light'>
                Ask your CoachBot!
              </span>
            </div>
          </div>
        </div>

        <div className='mt-12 relative'>
          <h2 className='text-2xl font-bold mb-4'>Today's Plan</h2>

          <div className='absolute left-0 top-10 bottom-0 w-1 bg-white/20 z-0 rounded-full overflow-hidden'>
            {selectedIndex === 0 && (
              <div className='absolute top-0 w-full h-1/3 bg-white transition-all duration-300' />
            )}
            {selectedIndex === 1 && (
              <div className='absolute top-1/3 w-full h-1/3 bg-white transition-all duration-300' />
            )}
            {selectedIndex === 2 && (
              <div className='absolute bottom-0 w-full h-1/3 bg-white transition-all duration-300' />
            )}
          </div>

          <div className='space-y-2'>
            {steps.map((step, index) => {
              const level = index + 1;
              const isUnlocked = unlockedLevel >= level;
              return (
                <div
                  key={step.title}
                  className={`relative flex items-center space-x-4 border border-none px-4 py-3 rounded-full ml-4 ${
                    isUnlocked ? "" : "opacity-50 pointer-events-none"
                  }`}
                  onClick={() => {
                    if (isUnlocked) {
                      setSelectedIndex(index);
                      if (index === 0) discoverAssessment();
                      if (index === 1) trainAssessment();
                      if (index === 2) excuteAssessment();
                    }
                  }}
                  style={{
                    background:
                      selectedIndex === index
                        ? "rgba(255, 255, 255, 0.06)"
                        : "rgba(255, 255, 255, 0.04)",
                  }}
                >
                  <div className='w-12 h-12 bg-black-600 border border-gray-600 rounded-full flex items-center justify-center'>
                    <Image className='text-white' alt='' src={step.image} />
                  </div>

                  <div>
                    <p className='font-semibold'>{step.title}</p>
                    <div className='flex items-center space-x-1'>
                      <svg
                        width='14'
                        height='15'
                        viewBox='0 0 14 15'
                        fill='none'
                        xmlns='http://www.w3.org/2000/svg'
                      >
                        <path
                          d='M13.6663 7.49967C13.6663 11.1816 10.6816 14.1663 6.99967 14.1663C3.31778 14.1663 0.333008 11.1816 0.333008 7.49967C0.333008 3.81778 3.31778 0.833008 6.99967 0.833008C10.6816 0.833008 13.6663 3.81778 13.6663 7.49967Z'
                          fill='white'
                          fill-opacity='0.8'
                        />
                        <path
                          fill-rule='evenodd'
                          clip-rule='evenodd'
                          d='M6.99967 4.33301C7.27582 4.33301 7.49967 4.55687 7.49967 4.83301V7.29257L9.01989 8.81279C9.21516 9.00805 9.21516 9.32463 9.01989 9.51989C8.82463 9.71516 8.50805 9.71516 8.31279 9.51989L6.64612 7.85323C6.55235 7.75946 6.49967 7.63228 6.49967 7.49967V4.83301C6.49967 4.55687 6.72353 4.33301 6.99967 4.33301Z'
                          fill='#060502'
                        />
                      </svg>

                      <p className='text-gray-400 text-sm'>2 minutes</p>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Only allow click if unlocked
                      if (isUnlocked) {
                        if (index === 0) discoverAssessment();
                        if (index === 1) trainAssessment();
                        if (index === 2) excuteAssessment();
                      }
                    }}
                    className={`ml-auto w-10 h-10 flex items-center justify-center rounded-full text-sm font-bold ${
                      isUnlocked
                        ? "bg-white text-black"
                        : "bg-gray-500 text-black"
                    }`}
                  >
                    {isUnlocked ? (
                      <svg
                        width='8'
                        height='16'
                        viewBox='0 0 8 16'
                        fill='none'
                        xmlns='http://www.w3.org/2000/svg'
                      >
                        <path
                          fill-rule='evenodd'
                          clip-rule='evenodd'
                          d='M0.51192 0.430571C0.826414 0.161005 1.29989 0.197426 1.56946 0.51192L7.56946 7.51192C7.8102 7.79279 7.8102 8.20724 7.56946 8.48811L1.56946 15.4881C1.29989 15.8026 0.826414 15.839 0.51192 15.5695C0.197426 15.2999 0.161005 14.8264 0.430571 14.5119L6.01221 8.00001L0.430571 1.48811C0.161005 1.17361 0.197426 0.700138 0.51192 0.430571Z'
                          fill='black'
                        />
                      </svg>
                    ) : (
                      <LockClosedIcon className='w-4 h-4 text-black' />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className='mt-5'>
          {/* Header */}
          <div className='flex flex-row justify-between items-center'>
            <h1 className='text-2xl font-bold text-white'>Suggested Skills</h1>
            <button className='text-white text-base py-2.5 px-5 border border-white/20 rounded-full'>
              See all
            </button>
          </div>

          {/* Scrollable image list */}
          <div className='flex space-x-4 mt-5 overflow-x-auto pb-4 scrollbar-hide'>
            <Image
              src={First}
              alt='Skill 1'
              className='w-[200px] h-[180px] object-cover border border-gray-600 rounded-lg flex-shrink-0'
            />
            <Image
              src={Second}
              alt='Skill 2'
              className='w-[200px] h-[180px] object-cover border border-gray-600 rounded-lg flex-shrink-0'
            />
            <Image
              src={Second}
              alt='Skill 3'
              className='w-[200px] h-[180px] object-cover border border-gray-600 rounded-lg flex-shrink-0'
            />
          </div>
        </div>
      </div>

      {showPopup && (
        <div className='fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm p-4'>
          <div
            className='text-white rounded-2xl p-10 w-[474px]   text-center flex flex-col items-center justify-center'
            style={{
              background: "rgba(64, 64, 64, 0.9)",
              border: "1px solid gray",
              borderRadius: "24px",
            }}
          >
            <h2 className='text-[28px] font-semibold mb-2'>
              {selectedIndex === 1
                ? "Train"
                : selectedIndex === 2
                ? "Execute"
                : ""}{" "}
              Locked
            </h2>
            <p className='text-md mb-4 text-gray-300'>
              To access your Train, please finish the first step of your journey
              — "Reflection". It helps lay the foundation for everything that
              follows.
            </p>

            <div className='mb-6'>
              <Image src={Block} alt='block' className='mx-auto' />
            </div>

            <button
              onClick={() => setShowPopup(false)}
              className='bg-white w-[390px] max-w-[80vw] h-[60px] text-black rounded-4xl'
            >
              Got It
            </button>
          </div>
        </div>
      )}

      {showTrainPopup && (
        <div className='fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm p-4'>
          <div
            className='text-white rounded-2xl p-6 w-[474px]   text-center flex flex-col items-center justify-center'
            style={{
              background: "rgba(64, 64, 64, 0.9)",
              border: "1px solid gray",
              borderRadius: "24px",
            }}
          >
            <h2 className='text-[28px] font-bold mb-2'>
              Train Section Unlocked
            </h2>
            <p
              className={`${raleway.className} text-base capitalize mb-4  text-gray-300 `}
            >
              Track and grow your personal skills — now available in your
              dashboard.
            </p>

            <div className='mb-6'>
              <MorphingLock />
            </div>

            <button
              onClick={trainAssessment}
              className='bg-white  font-medium py-4 px-9 text-black text-lg rounded-4xl w-full'
            >
              Go To Skills
            </button>
          </div>
        </div>
      )}

      {showExcutePopup && (
        <div className='fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm p-4'>
          <div
            className='text-white rounded-2xl p-6 w-[474px]   text-center flex flex-col items-center justify-center'
            style={{
              background: "rgba(64, 64, 64, 0.9)",
              border: "1px solid gray",
              borderRadius: "24px",
            }}
          >
            <h2 className='text-[28px] font-bold mb-2'>
              Execute Section Unlocked
            </h2>
            <p
              className={`${raleway.className} text-base capitalize mb-4  text-gray-300 `}
            >
              Set clear Execute to stay aligned and focused each day.
            </p>

            <div
              className={`mt-3 mb-6 relative w-max mx-auto
                transition-transform  duration-500 ease-out
                ${
                  lockAnimate ? "scale-100 opacity-100" : "scale-75 opacity-0"
                }`}
            >
              <svg
                width='49'
                height='59'
                viewBox='0 0 49 59'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
                className='relative z-10'
              >
                <path
                  d='M24.2051 0C34.3468 0 42.7811 7.31933 44.5137 16.9629L32.5391 21.3535V20.6348C32.539 16.033 28.8069 12.3008 24.2051 12.3008C19.6033 12.3008 15.8711 16.033 15.8711 20.6348V36.1436H3.57031V20.6348C3.57034 9.2399 12.8102 2.52602e-05 24.2051 0ZM44.8398 36.1387H32.5391V27.21H44.8398V36.1387Z'
                  fill='url(#paint0_linear_1174_1504)'
                />
                <foreignObject
                  x='-18'
                  y='8.71826'
                  width='84.4099'
                  height='67.7021'
                >
                  <div
                    style={{
                      backdropFilter: "blur(9px)",
                      clipPath: "url(#bgblur_0_1174_1504_clip_path)",
                      height: "100%",
                      width: "100%",
                    }}
                  />
                </foreignObject>
                <path
                  data-figma-bg-blur-radius='18'
                  d='M5.18848 27.7183H43.2217C45.5346 27.7183 47.4102 29.5938 47.4102 31.9067V53.2319C47.4102 55.5449 45.5346 57.4204 43.2217 57.4204H5.18848C2.87551 57.4204 1 55.5449 1 53.2319V31.9067C1 29.5938 2.87551 27.7183 5.18848 27.7183Z'
                  fill='url(#paint1_linear_1174_1504)'
                  stroke='url(#paint2_linear_1174_1504)'
                  strokeWidth='2'
                />
                <defs>
                  <clipPath
                    id='bgblur_0_1174_1504_clip_path'
                    transform='translate(18 -8.71826)'
                  >
                    <path d='M5.18848 27.7183H43.2217C45.5346 27.7183 47.4102 29.5938 47.4102 31.9067V53.2319C47.4102 55.5449 45.5346 57.4204 43.2217 57.4204H5.18848C2.87551 57.4204 1 55.5449 1 53.2319V31.9067C1 29.5938 2.87551 27.7183 5.18848 27.7183Z' />
                  </clipPath>
                  <linearGradient
                    id='paint0_linear_1174_1504'
                    x1='-2.00797'
                    y1='15.7099'
                    x2='50.4181'
                    y2='15.7099'
                    gradientUnits='userSpaceOnUse'
                  >
                    <stop stopColor='#91F4FF' />
                    <stop offset='0.5' stopColor='#D67EE2' />
                    <stop offset='0.99' stopColor='#9820FF' />
                  </linearGradient>
                  <linearGradient
                    id='paint1_linear_1174_1504'
                    x1='2.73302'
                    y1='56.6306'
                    x2='28.5111'
                    y2='17.2667'
                    gradientUnits='userSpaceOnUse'
                  >
                    <stop stopColor='white' stopOpacity='0.2' />
                    <stop offset='1' stopColor='white' stopOpacity='0.49' />
                  </linearGradient>
                  <linearGradient
                    id='paint2_linear_1174_1504'
                    x1='3.4172'
                    y1='29.2116'
                    x2='27.0758'
                    y2='67.8401'
                    gradientUnits='userSpaceOnUse'
                  >
                    <stop stopColor='white' />
                    <stop offset='1' stopColor='white' stopOpacity='0' />
                  </linearGradient>
                </defs>
              </svg>
              <span
                className='absolute inset-0 rounded-lg
                  bg-gradient-to-r from-[#91F4FF] via-[#D67EE2] to-[#9820FF]
                  opacity-20 blur-[12px] pointer-events-none'
              />
            </div>

            <button
              onClick={excuteAssessment}
              className='bg-white  font-medium py-4 px-9 text-black text-lg rounded-4xl w-full'
            >
              Got To Execute
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Score;
