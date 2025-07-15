// pages/completed-plan.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import TraitsCard from "../components/TransitCard";
import Image from "next/image";

// Импорт фонового SVG
import MainImage from "../../public/background.svg";

// ваши локальные картинки
import First from "../../../public/first.png";
import Second from "../../../public/second.png";
import Third from "../../../public/soccer.jpg";

export default function CompletedPlan() {
  const router = useRouter();

  const [competitiveness, setCompetitiveness] = useState(0);
  const [composure, setComposure] = useState(0);
  const [confidence, setConfidence] = useState(0);
  const [commitment, setCommitment] = useState(0);

  // Забираем финальные скоры из localStorage
  useEffect(() => {
    const raw = localStorage.getItem("hiteScores");
    if (!raw) return;
    try {
      const p = JSON.parse(raw);
      setCompetitiveness(p.competitiveness);
      setComposure(p.composure);
      setConfidence(p.confidence);
      setCommitment(p.commitment);
    } catch {
      console.warn("Invalid hiteScores JSON");
    }
  }, []);

  const goHome = () => {
    localStorage.clear();
    router.push("/");
  };

  return (
    <div className='relative min-h-screen h-screen  font-sans'>
      {/* Контент поверх фона */}
      <div className='relative z-10 flex flex-col items-center justify-start bg-transparent px-4 sm:px-0 text-white pt-16'>
        <div className='max-w-[640px] w-full'>
          {/* Your Result */}
          <h1 className='text-[28px] font-bold mb-8'>Your Result</h1>
          <TraitsCard
            width='305px'
            competitiveness={competitiveness}
            composure={composure}
            confidence={confidence}
            commitment={commitment}
            showArrow={false}
          />

          {/* 7 Day Streak */}
          <div className='mt-5 bg-white/5 border border-white/20 p-4 rounded-xl '>
            <div className='flex items-center space-x-4'>
              <div className='border-white/30 flex items-center justify-center w-10 h-10 border rounded-full'>
                {/* иконка сердца */}
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
                      const isChecked = i < 3; // ваша логика
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
                            {isChecked && (
                              <svg
                                width='10'
                                height='10'
                                viewBox='0 0 36 36'
                                fill='none'
                              >
                                <path
                                  fill='#000'
                                  d='M34.459 1.375a2.999 2.999 0 0 0-4.149.884L13.5 28.17l-8.198-7.58a2.999 2.999 0 1 0-4.073 4.405l10.764 9.952s.309.266.452.359a2.999 2.999 0 0 0 4.15-.884L35.343 5.524a2.999 2.999 0 0 0-.884-4.149z'
                                />
                              </svg>
                            )}
                          </div>
                          <span className='text-xs'>{day}</span>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* CoachBot */}
          <div className='mt-6 bg-white/5 border border-white/20 p-2.5 rounded-xl flex items-center space-x-3'>
            <div className='w-12 h-12 border border-white/30 rounded-full flex items-center justify-center'>
              <Image src='/bot.svg' alt='Bot' width={26} height={22} />
            </div>
            <div>
              <p className='text-sm font-medium'>
                Need a boost or have a question?
              </p>
              <span className='text-white/80 text-sm'>Ask your CoachBot!</span>
            </div>
          </div>

          {/* Ваш финальный блок вместо Timeline */}
          <div className='mt-12 flex justify-center'>
            <div
              className='bg-[#0C0C0C] rounded-2xl p-8 w-full border border-white/5 text-center'
              style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.5)" }}
            >
              <h1 className='text-3xl font-bold mb-2'>Today’s Plan</h1>
              <p className='text-lg text-gray-400 mb-6'>
                You’re All Done For Today
              </p>
              <div className='flex justify-center mb-6'>
                <Image
                  src='/check-icon.png'
                  alt='Done'
                  width={100}
                  height={100}
                />
              </div>
              <button
                onClick={goHome}
                className='px-9 py-3 bg-black/50 border border-white/30 text-base font-medium rounded-full hover:bg-white/60 transition duration-300'
              >
                Try Again
              </button>
            </div>
          </div>

          {/* Suggested Skills */}
          <div className='mt-5'>
            {/* Header */}
            <div className='flex flex-row justify-between items-center'>
              <h1 className='text-2xl font-bold text-white'>
                Suggested Skills
              </h1>
              <button className='text-white text-base py-2.5 px-5 border border-white/20 rounded-full'>
                See all
              </button>
            </div>

            {/* Scrollable image list */}
            <div className='flex space-x-4 mt-5 overflow-x-auto pb-4 scrollbar-hide'>
              <div className='border border-white/20 rounded-2xl p-2.5 bg-black/20'>
                <Image
                  src={First}
                  alt='Skill 1'
                  className='w-[200px] h-[180px] object-cover  flex-shrink-0 rounded-lg'
                />
              </div>
              <div className='border border-white/20 rounded-2xl p-2.5 bg-black/20'>
                <Image
                  src={Second}
                  alt='Skill 2'
                  className='w-[200px] h-[180px] object-cover  flex-shrink-0 rounded-lg'
                />
              </div>
              <div className='border border-white/20 rounded-2xl p-2.5 bg-black/20'>
                <Image
                  src={Third}
                  alt='Skill 3'
                  className='w-[200px] h-[180px] object-cover  flex-shrink-0 rounded-lg'
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
