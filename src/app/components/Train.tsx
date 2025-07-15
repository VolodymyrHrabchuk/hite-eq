"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Arrow from "../../../public/arrow.svg";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ROUTES } from "../routes";

export default function TrainComponent() {
  const router = useRouter();
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [videoPlayed, setVideoPlayed] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [timeLeft, setTimeLeft] = useState(60);
  const [timerActive, setTimerActive] = useState(false);
  const [responses, setResponses] = useState<{ [key: number]: string }>({});
  const [bookmarked, setBookmarked] = useState(false);

  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const touchEndRef = useRef<{ x: number; y: number } | null>(null);

  const assessmentData = [
    {
      card: 1,
      title: "Train Your Brain to Refocus",
      description:
        "A focus cue is something you say or do to shift your attention with purpose. It could be a word you repeat or a small action that helps reset your posture or eye level. Over time, your brain starts to link that cue with the mindset you need to perform.",
    },
    {
      card: 2,
      title: "What's Your Focus Trigger?",
      description:
        "Pick a short word and a small physical action you can use to focus today. Type both out. Use them together before your next three challenges or performance moments.",
    },
    {
      card: 3,
      title: "Breath Focus Exercise",
      description:
        "Take the next 60 seconds to center your attention on your breath. Gently guide your focus to the rhythm of your inhaling and exhaling. If your mind wanders, simply bring it back to your breath—no judgment, just awareness.",
    },
  ];

  // Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setTimerActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft]);

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)
      .toString()
      .padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  const progressPercentage = ((60 - timeLeft) / 60) * 100;

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
    touchEndRef.current = null;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  };
  const handleTouchEnd = () => {
    if (!touchStartRef.current || !touchEndRef.current) return;
    const dx = touchStartRef.current.x - touchEndRef.current.x;
    const dy = touchStartRef.current.y - touchEndRef.current.y;
    const minDist = 50;

    if (Math.abs(dy) > Math.abs(dx) && dy > minDist && currentCardIndex === 0) {
      goNext();
    } else if (Math.abs(dx) > minDist && Math.abs(dx) > Math.abs(dy)) {
      dx > 0 ? goNext() : goPrev();
    }
  };

  const handleBack = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex((i) => i - 1);
      // сбрасываем все, если нужно
      setVideoPlayed(false);
      setInputValue("");
      setTimeLeft(60);
      setTimerActive(false);
    } else {
      router.back();
    }
  };

  const goNext = () => {
    if (currentCardIndex < assessmentData.length - 1) {
      setCurrentCardIndex((i) => i + 1);
      setVideoPlayed(false);
      setInputValue("");
      setTimeLeft(60);
      setTimerActive(false);
    }
  };
  const goPrev = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex((i) => i - 1);
      setVideoPlayed(false);
      setInputValue("");
      setTimeLeft(60);
      setTimerActive(false);
    }
  };

  const handleVideoPlay = () => {
    setVideoPlayed(true);
    setTimerActive(true);
  };

  const moveToExecute = () => {
    localStorage.setItem("level", "3");
    router.push(ROUTES.Excute);
  };

  const submitResponse = (index: number, resp: string) => {
    setResponses((prev) => ({ ...prev, [index]: resp }));
    if (index === 1) goNext();
  };

  const pauseTimer = () => setTimerActive(false);
  const resumeTimer = () => timeLeft > 0 && setTimerActive(true);

  return (
    <div className='relative min-h-screen flex flex-col'>
      {/* === здесь мы оборачиваем все три карточки и двигаем весь блок === */}
      <div
        className='relative w-full h-screen overflow-hidden'
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className='transition-transform duration-800 ease-in-out'
          style={{ transform: `translateY(-${currentCardIndex * 100}vh)` }}
        >
          {/* === Карточка 1 === */}
          <div className='h-screen flex flex-col items-center text-white mt-10 px-4 sm:px-6 w-full max-w-[600px] mx-auto touch-none'>
            {/* Header */}
            <div className='flex flex-col items-start w-full'>
              <h1 className='mt-18 mb-6 flex items-start' onClick={handleBack}>
                <Image
                  src={Arrow}
                  alt='Arrow'
                  width={32}
                  height={32}
                  className='cursor-pointer'
                />
              </h1>
              <button className='w-[130px] h-[40px] mt-5 rounded-full p-1 border-1 bg-black/50 border-white/30 text-base font-medum'>
                Flashcard {assessmentData[0].card}{" "}
                <span className='text-white/50'>/3</span>
              </button>
              <p className='mt-9 mb-10 text-[22px] sm:text-[30px] w-full max-w-[474px] text-left'>
                {assessmentData[0].title}
              </p>
            </div>
            <div className='flex flex-col'>
              <p className='w-full max-w-[480px] text-start text-base sm:text-lg mb-10 font-normal '>
                {assessmentData[0].description}
              </p>
            </div>
          </div>

          {/* === Карточка 2 === */}
          <div className='h-screen flex flex-col items-center text-white mt-10 px-4 sm:px-6 w-full max-w-[600px] mx-auto touch-none'>
            {/* Header с кнопкой назад */}
            <div className='flex flex-col items-start w-full'>
              <h1 className='mt-18 mb-6 flex items-start'>
                <Image
                  src={Arrow}
                  alt='Arrow'
                  width={32}
                  height={32}
                  onClick={goPrev}
                  className='cursor-pointer'
                />
              </h1>
              <button className='w-[130px] h-[40px] mt-5 rounded-full p-1 border-1 bg-black/50 border-white/30 text-base font-medum'>
                Flashcard {assessmentData[1].card}{" "}
                <span className='text-white/50'>/3</span>
              </button>
              <p className='mt-9 mb-10 text-[22px] sm:text-[30px] w-full max-w-[474px] text-left'>
                {assessmentData[1].title}
              </p>
            </div>
            <div className='flex flex-col '>
              <p className='w-full max-w-[480px] text-start text-base sm:text-lg mb-10 font-normal '>
                {assessmentData[1].description}
              </p>
            </div>
            <div className='space-y-4 flex flex-col mb-20 w-full'>
              <textarea
                name='answer'
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className='w-full max-w-[480px] h-[180px] sm:h-[250px] p-4 rounded-xl bg-transparent border border-white/30 text-white focus:outline-[1px] outline-white/30 resize-none text-base sm:text-lg '
                placeholder='Type your answer...'
              />
              <button
                onClick={() => submitResponse(1, inputValue.trim())}
                disabled={!inputValue.trim()}
                className={`
    w-full max-w-[480px] h-[50px] sm:h-[60px] rounded-full
    border border-white/30 transition
    ${
      inputValue.trim()
        ? "bg-white text-black cursor-pointer"
        : "bg-white/10 text-white cursor-not-allowed backdrop-blur-xl"
    }
  `}
              >
                Submit
              </button>
            </div>
          </div>

          {/* === Карточка 3 === */}
          <div className='h-screen flex flex-col items-center text-white mt-10 px-4 sm:px-6 w-full max-w-[600px] mx-auto touch-none'>
            {/* Header с кнопкой назад */}
            <div className='flex flex-col items-start'>
              <h1 className='mt-18 mb-6 flex items-start'>
                <Image
                  src={Arrow}
                  alt='Arrow'
                  width={32}
                  height={32}
                  onClick={goPrev}
                  className='cursor-pointer'
                />
              </h1>
              <button className='w-[130px] h-[40px] mt-5 rounded-full p-1 border-1 bg-black/50 border-white/30 text-base font-medum'>
                Flashcard {assessmentData[2].card}{" "}
                <span className='text-white/50'>/3</span>
              </button>
              <p className='mt-9 mb-6 text-[22px] sm:text-[30px] w-full max-w-[474px] text-left'>
                {assessmentData[2].title}
              </p>
              <div className='flex flex-col '>
                <p className='w-full max-w-[480px] text-start text-base sm:text-lg mb-10 font-normal '>
                  {assessmentData[2].description}
                </p>
              </div>
            </div>
            <div className='flex flex-col justify-center items-center mb-20 text-white'>
              {!videoPlayed ? (
                <div className='flex justify-center items-center mt-10'>
                  <div className='relative w-58 h-58 rounded-full border-18 border-white flex justify-center items-center'>
                    <div className='relative w-20 h-20 rounded-full border-4 border-white flex justify-center items-center'>
                      <button
                        onClick={handleVideoPlay}
                        className='relative w-full h-full rounded-full flex justify-center items-center bg-white'
                      >
                        <svg
                          width='32'
                          height='32'
                          viewBox='0 0 32 32'
                          fill='none'
                          className='pl-2'
                        >
                          <path
                            d='M2.09247 31.7612C2.50072 31.9045 2.96009 32 3.41946 32C4.13399 32 4.84852 31.7612 5.4609 31.3792L30.7241 18.5337L30.9793 18.2949C31.6428 17.6741 32 16.9101 32 16.0505C32 15.191 31.6428 14.3792 30.9793 13.8062L30.7241 13.5674L5.4609 0.626325C4.54224 -0.0421881 3.21525 -0.18544 2.09247 0.244319C0.816508 0.721828 6.51253e-09 1.91568 6.51253e-09 3.20504V28.8006C-8.42042e-05 30.09 0.816508 31.2837 2.09247 31.7612Z'
                            fill='#1B0D08'
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className='relative w-58 h-58 flex justify-center items-center'>
                    {/* <div className='absolute inset-0 rounded-full border-8 border-white/30'></div> */}
                    <svg
                      className='absolute w-full h-full -rotate-90'
                      viewBox='0 0 100 100'
                      shapeRendering='geometricPrecision'
                    >
                      <motion.circle
                        cx='50'
                        cy='50'
                        r='42'
                        fill='url(#timerGradient)'
                        animate={
                          timerActive && timeLeft > 0
                            ? {
                                scale: [0.85, 1.15, 1.15, 0.85, 0.85],
                                opacity: [0.4, 0.8, 0.8, 0.4, 0.4],
                              }
                            : {
                                scale: 1,
                                opacity: 0,
                              }
                        }
                        transition={{
                          duration: 6,
                          ease: "easeInOut",
                          repeat: timerActive && timeLeft > 0 ? Infinity : 0,
                          times: [0, 0.25, 0.5, 0.75, 1], // Задержки в крайних точках
                        }}
                        style={{
                          transformOrigin: "50% 50%",
                        }}
                      />
                      {/* 1) Белый фон */}
                      <circle
                        cx='50'
                        cy='50'
                        r='42'
                        fill='none'
                        stroke='white'
                        strokeWidth='7'
                        strokeLinejoin='round'
                        strokeLinecap='round'
                      />

                      {/* 2) Градиент (от светло-голубого к синему) */}
                      <defs>
                        <linearGradient
                          id='timerGradient'
                          x1='0%'
                          y1='0%'
                          x2='100%'
                          y2='0%'
                        >
                          <stop offset='0%' stopColor='#60A5FA' />{" "}
                          {/* голубой */}
                          <stop offset='100%' stopColor='#1E40AF' />{" "}
                          {/* темно-синий */}
                        </linearGradient>
                      </defs>

                      {/* 3) Прогресс-штрих */}
                      <circle
                        cx='50'
                        cy='50'
                        r='42'
                        fill='none'
                        stroke='url(#timerGradient)'
                        strokeWidth='8'
                        strokeLinecap='round'
                        strokeDasharray={`${progressPercentage * 2.64} 264`}
                        className='transition-all duration-1000 ease-linear'
                      />
                    </svg>
                    <div className='relative flex justify-center items-center '>
                      <p className='text-5xl '>{formatTime(timeLeft)}</p>
                    </div>
                  </div>
                  <div className='flex space-x-20 mt-6'>
                    <div className='flex flex-col items-center space-y-4'>
                      <button
                        className='w-14 h-14 border-2 bg-white border-white rounded-full flex justify-center items-center'
                        onClick={timerActive ? pauseTimer : resumeTimer}
                      >
                        {timerActive ? (
                          <svg
                            width='19'
                            height='23'
                            viewBox='0 0 19 23'
                            fill='none'
                            xmlns='http://www.w3.org/2000/svg'
                          >
                            <path
                              d='M5.61141 22.2086H1.61141C1.25779 22.2086 0.918649 22.1064 0.668601 21.9246C0.418552 21.7427 0.278076 21.4961 0.278076 21.2389V1.84494C0.278076 1.58776 0.418552 1.34112 0.668601 1.15926C0.918649 0.977409 1.25779 0.875244 1.61141 0.875244H5.61141C5.96503 0.875244 6.30417 0.977409 6.55422 1.15926C6.80427 1.34112 6.94474 1.58776 6.94474 1.84494V21.2389C6.94474 21.4961 6.80427 21.7427 6.55422 21.9246C6.30417 22.1064 5.96503 22.2086 5.61141 22.2086Z'
                              fill='#1B0D08'
                            />
                            <path
                              d='M17.6114 22.2086H13.6114C13.2578 22.2086 12.9186 22.1064 12.6686 21.9246C12.4186 21.7427 12.2781 21.4961 12.2781 21.2389V1.84494C12.2781 1.58776 12.4186 1.34112 12.6686 1.15926C12.9186 0.977409 13.2578 0.875244 13.6114 0.875244H17.6114C17.965 0.875244 18.3042 0.977409 18.5542 1.15926C18.8043 1.34112 18.9447 1.58776 18.9447 1.84494V21.2389C18.9447 21.4961 18.8043 21.7427 18.5542 21.9246C18.3042 22.1064 17.965 22.2086 17.6114 22.2086Z'
                              fill='#1B0D08'
                            />
                          </svg>
                        ) : (
                          <svg
                            width='32'
                            height='32'
                            viewBox='0 0 36 32'
                            fill='none'
                            className='pl-2'
                          >
                            <path
                              d='M2.09247 31.7612C2.50072 31.9045 2.96009 32 3.41946 32C4.13399 32 4.84852 31.7612 5.4609 31.3792L30.7241 18.5337L30.9793 18.2949C31.6428 17.6741 32 16.9101 32 16.0505C32 15.191 31.6428 14.3792 30.9793 13.8062L30.7241 13.5674L5.4609 0.626325C4.54224 -0.0421881 3.21525 -0.18544 2.09247 0.244319C0.816508 0.721828 6.51253e-09 1.91568 6.51253e-09 3.20504V28.8006C-8.42042e-05 30.09 0.816508 31.2837 2.09247 31.7612Z'
                              fill='#1B0D08'
                            />
                          </svg>
                        )}
                      </button>
                      <p>{timerActive ? "Pause" : "Start"}</p>
                    </div>
                    <div className='flex flex-col items-center space-y-4'>
                      <button
                        className='w-14 h-14 border-2 bg-white border-white rounded-full flex justify-center items-center'
                        onClick={moveToExecute}
                      >
                        <svg
                          width='22'
                          height='23'
                          viewBox='0 0 22 23'
                          fill='none'
                          xmlns='http://www.w3.org/2000/svg'
                        >
                          <path
                            d='M16.2219 0.875244H5.55526C2.60974 0.875244 0.221924 3.26306 0.221924 6.20858V16.8752C0.221924 19.8208 2.60974 22.2086 5.55526 22.2086H16.2219C19.1674 22.2086 21.5553 19.8208 21.5553 16.8752V6.20858C21.5553 3.26306 19.1674 0.875244 16.2219 0.875244Z'
                            fill='#1B0D08'
                          />
                        </svg>
                      </button>
                      <p>Quit</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Swipe Up */}
      {currentCardIndex === 0 && (
        <div
          onClick={goNext}
          className='absolute bottom-8 left-0 right-0 flex justify-center px-2 sm:px-6'
        >
          <div className='flex flex-col items-center text-white'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width='54'
              height='70'
              viewBox='0 0 54 70'
              fill='none'
              className='overflow-visible'
            >
              <defs>
                <clipPath id='clip0_1331_2960'>
                  <rect
                    width='53.7705'
                    height='69.5082'
                    transform='translate(0.115234)'
                    fill='white'
                  />
                </clipPath>
              </defs>

              <g clipPath='url(#clip0_1331_2960)'>
                <path
                  d='M48.4197 36.1103C48.4157 35.0912 48.3251 34.3657 47.874 33.6739C47.4301 32.993 46.766 32.5022 46.0521 32.3275C44.5909 31.9699 42.9765 33.086 42.0246 34.3506C42.016 34.3621 42.0064 34.3724 41.9973 34.3833L42.0041 37.5493C42.0051 38.0048 41.6366 38.3749 41.1811 38.3758C41.1805 38.3758 41.1798 38.3758 41.1792 38.3758C40.7245 38.3758 40.3555 38.0077 40.3545 37.5527L40.3426 32.0248C40.3395 30.5667 39.5056 29.3019 38.1665 28.7238C36.8771 28.1673 35.4458 28.3895 34.3933 29.2989V37.551C34.3933 38.0065 34.024 38.3758 33.5685 38.3758C33.1129 38.3758 32.7436 38.0065 32.7436 37.551V26.8609C32.7436 25.8309 32.204 24.8842 31.3354 24.3902C30.8952 24.1398 29.5557 23.3779 27.6295 26.0083C27.554 26.1113 27.4587 26.1909 27.3531 26.2473V37.5508C27.3531 38.0064 26.9837 38.3756 26.5282 38.3756C26.0727 38.3756 25.7034 38.0064 25.7034 37.5508V17.9847V15.1514C25.7034 13.9763 24.9418 13.2449 24.2291 12.9521C23.5165 12.6595 22.4607 12.6445 21.6347 13.4803C20.5425 14.5852 19.9411 16.0495 19.9411 17.6038V17.6214L19.9422 17.989L19.946 19.2838C19.946 19.284 19.946 19.2842 19.946 19.2843L19.9915 34.2277C19.9953 35.471 19.9967 36.735 19.9979 37.9574C20.001 40.9104 20.0042 43.9638 20.043 46.9636C20.0467 47.2432 19.9084 47.5055 19.6758 47.6606C19.4433 47.8157 19.148 47.8424 18.8913 47.7316C16.3225 46.6223 14.8101 44.106 13.4758 41.8861L13.3808 41.7281C12.0063 39.4425 10.307 36.9887 7.52473 36.8043C6.78786 36.7556 6.10748 37.1377 5.70474 37.827C5.33601 38.4581 5.64985 39.1208 6.19244 40.1497C6.3159 40.3838 6.44354 40.6259 6.55733 40.87C8.25003 44.5012 10.1345 48.1219 11.9569 51.6235C12.8644 53.3671 13.8027 55.17 14.7073 56.9547C16.9985 61.4754 19.2622 65.4027 23.7739 67.6811C29.7449 70.6961 36.709 69.7242 42.4028 65.0816C44.4643 63.4004 46.1334 61.2782 47.2295 58.9443C48.138 57.0091 48.2678 54.65 48.3933 52.3686C48.4069 52.1211 48.4204 51.8752 48.4348 51.6316C48.6421 48.1271 48.5671 44.5422 48.4946 41.0753C48.4608 39.4487 48.4256 37.767 48.4197 36.1103Z'
                  fill='white'
                />
                <path
                  d='M15.5328 13.0512C15.6361 15.0292 16.6829 16.8289 18.2918 17.9149L18.2909 17.6259C18.2909 17.6255 18.291 17.625 18.291 17.6246L18.2909 17.6035C18.2909 15.6121 19.0616 13.736 20.4609 12.3205C21.6311 11.1361 23.315 10.7932 24.8552 11.4259C26.3955 12.0585 27.3524 13.486 27.3524 15.1511V15.6421C27.8067 14.7623 28.047 13.7685 28.047 12.7185C28.047 9.39285 25.4486 6.64668 22.1316 6.4665C20.3672 6.37123 18.6328 7.0374 17.3719 8.29557C16.1111 9.55375 15.4407 11.2871 15.5328 13.0512Z'
                  fill='white'
                />
                <path
                  d='M48.4197 36.1103C48.4157 35.0912 48.3251 34.3657 47.874 33.6739C47.4301 32.993 46.766 32.5022 46.0521 32.3275C44.5909 31.9699 42.9765 33.086 42.0246 34.3506C42.016 34.3621 42.0064 34.3724 41.9973 34.3833L42.0041 37.5493C42.0051 38.0048 41.6366 38.3749 41.1811 38.3758C41.1805 38.3758 41.1798 38.3758 41.1792 38.3758C40.7245 38.3758 40.3555 38.0077 40.3545 37.5527L40.3426 32.0248C40.3395 30.5667 39.5056 29.3019 38.1665 28.7238C36.8771 28.1673 35.4458 28.3895 34.3933 29.2989V37.551C34.3933 38.0065 34.024 38.3758 33.5685 38.3758C33.1129 38.3758 32.7436 38.0065 32.7436 37.551V26.8609C32.7436 25.8309 32.204 24.8842 31.3354 24.3902C30.8952 24.1398 29.5557 23.3779 27.6295 26.0083C27.554 26.1113 27.4587 26.1909 27.3531 26.2473V37.5508C27.3531 38.0064 26.9837 38.3756 26.5282 38.3756C26.0727 38.3756 25.7034 38.0064 25.7034 37.5508V17.9847V15.1514C25.7034 13.9763 24.9418 13.2449 24.2291 12.9521C23.5165 12.6595 22.4607 12.6445 21.6347 13.4803C20.5425 14.5852 19.9411 16.0495 19.9411 17.6038V17.6214L19.9422 17.989L19.946 19.2838C19.946 19.284 19.946 19.2842 19.946 19.2843L19.9915 34.2277C19.9953 35.471 19.9967 36.735 19.9979 37.9574C20.001 40.9104 20.0042 43.9638 20.043 46.9636C20.0467 47.2432 19.9084 47.5055 19.6758 47.6606C19.4433 47.8157 19.148 47.8424 18.8913 47.7316C16.3225 46.6223 14.8101 44.106 13.4758 41.8861L13.3808 41.7281C12.0063 39.4425 10.307 36.9887 7.52473 36.8043C6.78786 36.7556 6.10748 37.1377 5.70474 37.827C5.33601 38.4581 5.64985 39.1208 6.19244 40.1497C6.3159 40.3838 6.44354 40.6259 6.55733 40.87C8.25003 44.5012 10.1345 48.1219 11.9569 51.6235C12.8644 53.3671 13.8027 55.17 14.7073 56.9547C16.9985 61.4754 19.2622 65.4027 23.7739 67.6811C29.7449 70.6961 36.709 69.7242 42.4028 65.0816C44.4643 63.4004 46.1334 61.2782 47.2295 58.9443C48.138 57.0091 48.2678 54.65 48.3933 52.3686C48.4069 52.1211 48.4204 51.8752 48.4348 51.6316C48.6421 48.1271 48.5671 44.5422 48.4946 41.0753C48.4608 39.4487 48.4256 37.767 48.4197 36.1103Z'
                  fill='white'
                />
                <path
                  d='M15.5328 13.0512C15.6361 15.0292 16.6829 16.8289 18.2918 17.9149L18.2909 17.6259C18.2909 17.6255 18.291 17.625 18.291 17.6246L18.2909 17.6035C18.2909 15.6121 19.0616 13.736 20.4609 12.3205C21.6311 11.1361 23.315 10.7932 24.8552 11.4259C26.3955 12.0585 27.3524 13.486 27.3524 15.1511V15.6421C27.8067 14.7623 28.047 13.7685 28.047 12.7185C28.047 9.39285 25.4486 6.64668 22.1316 6.4665C20.3672 6.37123 18.6328 7.0374 17.3719 8.29557C16.1111 9.55375 15.4407 11.2871 15.5328 13.0512Z'
                  fill='white'
                />
              </g>

              <g className='animate-bounce'>
                <path
                  d='M4.57821 28.5275V9.50536C4.57821 8.7932 5.15553 8.21582 5.86775 8.21582C6.57991 8.21582 7.15723 8.79314 7.15723 9.50536V28.5275C7.15723 29.2398 6.57991 29.8171 5.86775 29.8171C5.15553 29.8171 4.57821 29.2398 4.57821 28.5275Z'
                  fill='white'
                />
                <path
                  d='M10.2402 14.6422L5.86793 10.2673L1.49563 14.6422V10.9297L5.86793 6.55737L10.2402 10.9297V14.6422Z'
                  fill='white'
                />
              </g>
            </svg>
            <span className='text-sm font-medium mt-1'>Swipe Up</span>
          </div>
        </div>
      )}

      {/* Bookmark */}
      <div className='absolute bottom-8 right-4'>
        <div
          onClick={() => setBookmarked((b) => !b)}
          className='border border-white rounded-full p-2 cursor-pointer w-12 h-12 flex items-center justify-center'
        >
          <svg
            xmlns='http://www.w3.org/2000/svg'
            className='h-6 w-6'
            fill={bookmarked ? "#FFFFFF" : "none"}
            stroke='currentColor'
            strokeWidth={1}
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='M5 5v14l7-5 7 5V5a2 2 0 00-2-2H7a2 2 0 00-2 2z'
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
