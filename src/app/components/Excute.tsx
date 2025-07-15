"use client";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Arrow from "../../../public/arrow.svg";
import VideoIcon from "../../../public/videoicon.svg";
import { useRouter } from "next/navigation";
import { ROUTES } from "../routes";

export default function ExcuteComponent() {
  const router = useRouter();
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [videoPlayed, setVideoPlayed] = useState(false);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [bookmarked, setBookmarked] = useState(false);

  // Touch/Swipe state
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const touchEndRef = useRef<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoUrl = "/videoplayback.mp4";

  const assessmentData = [
    {
      card: 1,
      title: "Pre-Practice Prep Sets the Tone",
      description:
        "To stay competitive, it’s essential to prepare yourself mentally before every practice. A solid pre-practice routine helps you approach each training session with intensity, focus, and a relentless drive to improve. Identify techniques that work best for you—your routine should be part of every practice, setting you up to perform at your peak.",
    },
    {
      card: 2,
      title: "The Key to a Competitive Edge",
      description:
        "Explore how elite players turn ordinary moments—like stretching or warm-ups—into purposeful, mentally focused preparation.",
    },
    {
      card: 3,
      title: "What’s Your Lock-In Cue? ",
      description:
        "Create a small, physical action you’ll use before every practice or lift.",
    },
  ];

  const handleTouchStart = (e: React.TouchEvent) => {
    touchEndRef.current = null;
    touchStartRef.current = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndRef.current = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    };
  };
  const handleBack = () => {
    if (currentCardIndex > 0) {
      // анимированно откатываем назад
      setAnimating(true);
      setTimeout(() => {
        setCurrentCardIndex((prev) => prev - 1);
        setShowVideoPlayer(false);
        setInputValue("");
        setAnimating(false);
      }, 300);
    } else {
      router.back();
    }
  };
  const handleTouchEnd = () => {
    if (!touchStartRef.current || !touchEndRef.current) return;

    const deltaX = touchStartRef.current.x - touchEndRef.current.x;
    const deltaY = touchStartRef.current.y - touchEndRef.current.y;
    const minSwipeDistance = 50;

    // Swipe up for first two cards
    if (
      currentCardIndex <= 1 &&
      Math.abs(deltaY) > Math.abs(deltaX) &&
      deltaY > minSwipeDistance
    ) {
      handleCardNavigation();
      return;
    }

    // Horizontal swipe
    if (
      Math.abs(deltaX) > minSwipeDistance &&
      Math.abs(deltaX) > Math.abs(deltaY)
    ) {
      if (deltaX > 0) handleCardNavigation();
      else handlePrevCardNavigation();
    }
  };

  const handleCardNavigation = () => {
    // если видео открыто — сначала его закрываем
    if (showVideoPlayer) {
      setShowVideoPlayer(false);
      setTimeout(() => {
        // потом переходим дальше
        if (currentCardIndex < assessmentData.length - 1) {
          setAnimating(true);
          setTimeout(() => {
            setCurrentCardIndex((prev) => prev + 1);
            setVideoPlayed(false);
            setInputValue("");
            setAnimating(false);
          }, 300);
        } else {
          localStorage.setItem("showExcutePopup", "true");
          router.push(ROUTES.SCORE);
        }
      }, 100); // даем 100мс чтобы пропал плеер
      return;
    }

    // если видео не открыто — обычное поведение
    if (currentCardIndex < assessmentData.length - 1) {
      setAnimating(true);
      setTimeout(() => {
        setCurrentCardIndex((prev) => prev + 1);
        setVideoPlayed(false);
        setInputValue("");
        setAnimating(false);
      }, 300);
    } else {
      localStorage.setItem("showExcutePopup", "true");
      router.push(ROUTES.SCORE);
    }
  };

  const handleVideoPlay = () => {
    setShowVideoPlayer(true);
    // Даем рендернуться <video>, а потом запрашиваем fullscreen и play()
    setTimeout(() => {
      const vid = videoRef.current;
      if (!vid) return;
      // iOS Safari
      // if ((vid as any).webkitEnterFullScreen) {
      //   (vid as any).webkitEnterFullScreen();
      // } else if (vid.requestFullscreen) {
      //   vid.requestFullscreen();
      // }
      vid.play();
    }, 50);
  };

  const handleVideoClose = () => {
    setShowVideoPlayer(false);
    handleCardNavigation();
  };

  useEffect(() => {
    const onFSChange = () => {
      if (
        !document.fullscreenElement &&
        !(document as any).webkitFullscreenElement
      ) {
        // Пользователь вышел из fullscreen
        handleVideoClose();
      }
    };
    document.addEventListener("fullscreenchange", onFSChange);
    document.addEventListener("webkitfullscreenchange", onFSChange);
    return () => {
      document.removeEventListener("fullscreenchange", onFSChange);
      document.removeEventListener("webkitfullscreenchange", onFSChange);
    };
  }, []);

  const handlePrevCardNavigation = () => {
    if (currentCardIndex > 0) {
      setAnimating(true);
      setTimeout(() => {
        setCurrentCardIndex((prev) => prev - 1);
        setVideoPlayed(false);
        setInputValue("");
        setAnimating(false);
      }, 300);
    }
  };

  const handleSubmission = async () => {
    const answerPayload = { question: 11, answer: inputValue, user: 33 };
    try {
      const response = await fetch(
        "https://dashboard-athena.space/api/members-answers/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(answerPayload),
        }
      );

      // вместо throw
      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`Submit failed (${response.status}):`, errorText);
      } else {
        await response.json();
      }
    } catch (err) {
      console.error("Network error during submission:", err);
    } finally {
      handleCardNavigation();
    }
  };

  const moveToExcute = () => router.push(ROUTES.Excute);

  return (
    <div className='relative h-screen flex flex-col justify-between overflow-hidden'>
      {/* Карточки */}
      <div
        ref={containerRef}
        className='flex-1 flex flex-col items-center text-white  px-4 sm:px-0 touch-none w-full max-w-[600px] mx-auto overflow-hidden'
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className={`transition-transform duration-300 transform ${
            animating ? "-translate-y-full" : "translate-y-0"
          }`}
        >
          {/* Заголовок и описание */}
          <div className='flex flex-col items-start -mt-10'>
            <h1
              className='mt-18 mb-6 flex items-start font-bold text-[24px]'
              onClick={handleBack}
            >
              <Image
                src={Arrow}
                alt='Arrow'
                width={32}
                height={32}
                onClick={handlePrevCardNavigation}
              />
            </h1>

            <button className='w-[130px] h-[40px] mt-5 rounded-full p-1 border bg-black/50 border-white/30 text-base font-medium'>
              Flashcard {assessmentData[currentCardIndex].card}
              <span className='text-white/50'>/3</span>
            </button>

            <p className='mt-9 mb-6 text-[22px] sm:text-[30px] w-full max-w-[474px] text-left'>
              {assessmentData[currentCardIndex].title}
            </p>

            <p className='w-full max-w-[480px] text-start text-base sm:text-lg mb-6'>
              {assessmentData[currentCardIndex].description}
            </p>
          </div>

          {/* Видео-иконка на второй карточке */}
          {currentCardIndex === 1 && !showVideoPlayer && (
            <div className='flex justify-center mb-4 relative'>
              <svg
                className='absolute inset-0 m-auto w-[81px] h-[81px] pointer-events-none'
                width='81'
                height='81'
                viewBox='0 0 81 81'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
              >
                <defs>
                  <clipPath id='bgblur_0_868_20623_clip_path'>
                    <circle cx='40.2793' cy='40.6758' r='40' />
                  </clipPath>
                </defs>

                <foreignObject
                  x='-6.32041'
                  y='-5.92393'
                  width='93.1994'
                  height='93.1994'
                >
                  <div
                    style={{
                      backdropFilter: "blur(3.3px)",
                      WebkitBackdropFilter: "blur(3.3px)",
                      clipPath: "url(#bgblur_0_868_20623_clip_path)",
                      height: "100%",
                      width: "100%",
                    }}
                  />
                </foreignObject>

                <g opacity='0.5' data-figma-bg-blur-radius='6.59971'>
                  <circle cx='40.2793' cy='40.6758' r='40' fill='white' />
                  <circle cx='40.2793' cy='40.6758' r='40' stroke='white' />
                </g>

                <path
                  d='M59.5251 39.5711C60.6251 40.2062 60.6251 41.7938 59.5251 42.4289L31.4749 58.6237C30.3749 59.2587 29 58.4649 29 57.1948V24.8052C29 23.5351 30.3749 22.7413 31.4749 23.3763L59.5251 39.5711Z'
                  fill='white'
                />
              </svg>
              <Image
                src={VideoIcon}
                alt='Play video'
                onClick={handleVideoPlay}
                className='cursor-pointer'
              />
            </div>
          )}

          {showVideoPlayer && (
            // этот контейнер нужен только для safe-area inset,
            // сам <video> выведет браузерный UI
            <div className='relative w-full mb-8'>
              {/* Кнопка закрытия */}
              <button
                onClick={handleVideoClose}
                className='absolute top-2 right-2 z-50 text-white text-2xl bg-black/30 bg-opacity-50 rounded-full w-8 h-8 flex items-center justify-center'
              >
                &times;
              </button>
              <video
                ref={videoRef}
                src={videoUrl}
                controls
                onEnded={handleVideoClose}
                className='w-full h-auto rounded-lg'
              />
            </div>
          )}

          {/* Ввод на третьей карточке */}
          {currentCardIndex === 2 && (
            <div className='space-y-4 flex flex-col '>
              <p>Examples:</p>
              <ul className='list-disc list-inside text-white/80 ml-4'>
                <li>Glove tap</li>
                <li>Chest thump</li>
                <li>Breathe and nod</li>
              </ul>
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className='w-full max-w-[480px] h-[180px] sm:h-[250px] p-4 rounded-xl bg-transparent border border-white/30 text-white resize-none text-base sm:text-lg focus:outline-none'
                placeholder='Type your answer...'
              />
              <button
                onClick={handleSubmission}
                disabled={inputValue.trim() === ""}
                className={`w-full max-w-[480px] h-[50px] sm:h-[60px] rounded-full transition duration-200 ease-in-out p-4 border border-white/30 ${
                  inputValue.trim()
                    ? "bg-white text-black cursor-pointer hover:bg-gray-200"
                    : "bg-transparent text-white cursor-not-allowed"
                }`}
              >
                Submit
              </button>
            </div>
          )}

          {/* Плеер и кнопки Pause/Quit после ввода */}
          {videoPlayed && currentCardIndex === 2 && (
            <div className='flex flex-col justify-center items-center mt-10 text-white'>
              <div className='relative w-58 h-58 rounded-full border-8 border-white flex justify-center items-center overflow-hidden'>
                <div className='relative w-full h-full flex justify-center items-center'>
                  <p className='text-5xl'>00:30</p>
                </div>
              </div>
              <div className='flex space-x-20 mt-6'>
                <div className='flex flex-col items-center'>
                  <button
                    className='w-14 h-14 border-2 bg-white border-white rounded-full flex justify-center items-center'
                    onClick={moveToExcute}
                  >
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      className='h-10 w-10 text-black'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M10 19V5m4 14V5'
                      />
                    </svg>
                  </button>
                  <span className='text-white text-sm mt-2'>Pause</span>
                </div>
                <div className='flex flex-col items-center'>
                  <button
                    className='w-14 h-14 border-2 bg-white border-white rounded-full flex justify-center items-center'
                    onClick={moveToExcute}
                  >
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      className='h-8 w-8 text-black'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z'
                      />
                    </svg>
                  </button>
                  <span className='text-white text-sm mt-2'>Quit</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Нижняя панель: Swipe Up + Bookmark */}
      <div
        className='absolute bottom-10 left-0 w-full flex justify-center items-center
                   px-4 pb-[calc(env(safe-area-inset-bottom)+16px)] bg-transparent'
      >
        <div className='flex justify-between items-end w-full max-w-[480px]'>
          {currentCardIndex <= 1 && (
            <div
              onClick={handleCardNavigation}
              className='flex-1 flex justify-center cursor-pointer w-12'
            >
              <div className='flex flex-col items-center text-white'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='54'
                  height='70'
                  viewBox='0 0 54 70'
                  fill='none'
                  className='overflow-visible '
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
                  <g clip-path='url(#clip0_1331_2960)'>
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
          {/* Правый слот: иконка закладки */}
          <div
            onClick={() => setBookmarked((b) => !b)}
            className='border border-white rounded-full p-2 cursor-pointer w-12 h-12 ml-auto flex items-center justify-center'
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
    </div>
  );
}
