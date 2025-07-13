"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Arrow from "../../../public/arrow.svg";
import TransitCard from "../components/TransitCard";
import { useRouter } from "next/navigation";
import { ROUTES } from "../routes";
import { json } from "stream/consumers";

export default function Assessment() {
  const router = useRouter();
  const [selectedIndex, setSelectedIndex] = useState(0); // ✅ Start at 0
  const [inputValue, setInputValue] = useState("");
  const [fillPercentage, setFillPercentage] = useState(0); // Updated to start at 0
  const [animate, setAnimate] = useState(true);

  const assessmentData = [
    {
      description: "I can stay focused when distractions show up.",
    },
    {
      description: "What will help you stay focused this week?",
    },
  ];

  const isComplete = selectedIndex === assessmentData.length;
  useEffect(() => {
    setAnimate(false);
    const t = setTimeout(() => setAnimate(true), 50);
    return () => clearTimeout(t);
  }, [selectedIndex]);

  useEffect(() => {
    if (isComplete) {
      const timer = setTimeout(() => {
        const scores = localStorage.getItem("hiteScores");
        if (scores) {
          const parsedScores = JSON.parse(scores);
          const keys = Object.keys(parsedScores);
          const randomKey = keys[Math.floor(Math.random() * keys.length)];
          parsedScores[randomKey] += 1;
          localStorage.setItem("hiteScores", JSON.stringify(parsedScores));
        }
        router.push(ROUTES.SCORE);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isComplete, router]);

  const handleButtonClick = () => {
    if (selectedIndex < assessmentData.length) {
      setSelectedIndex((prev) => prev + 1);
      setFillPercentage((prev) => prev + 100 / assessmentData.length);
      setInputValue("");
    }
    if (selectedIndex === 1) {
      console.log("clic", selectedIndex);
      router.push(ROUTES.AFFIRMATION);
    }
  };

  if (isComplete) {
    return (
      <div className='absolute inset-0 flex flex-col items-center text-white mt-10 px-6'>
        <h1 className='mt-18 mb-10 flex items-start font-bold text-[37px]'>
          You Did It
        </h1>
        <p className='text-[20px] text-center text-white/80 text-sm'>
          You’ve completed HITE Assessment!
        </p>
        <TransitCard width='243px' />
      </div>
    );
  }

  return (
    <div className='absolute inset-0 flex flex-col items-center text-white mt-10 px-6'>
      <div
        className={`flex flex-col items-start  transition-transform
     duration-500 ease-in-out ${
       animate ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
     }`}
      >
        <h1 className='mt-18 mb-10 flex items-start font-bold text-[24px]'>
          <Image
            src={Arrow}
            alt='Arrow'
            width={32}
            height={32}
            className='mr-4'
          />
          Execute
        </h1>

        <div className='w-[465px] h-[10px] mx-auto bg-white/10 rounded-[12px] overflow-hidden mb-4'>
          <div
            className='h-full bg-white transition-all duration-500 ease-in-out rounded-2xl'
            style={{ width: `${fillPercentage}%` }}
          />
        </div>

        <p className='mt-12 mb-12 text-[20px] w-[474px] text-left'>
          {assessmentData[selectedIndex].description}
        </p>
      </div>

      <div className='space-y-4 flex flex-col'>
        {selectedIndex === 0 ? (
          [
            "Strongly disagree",
            "Disagree",
            "Neutral",
            "Agree",
            "Strongly Agree",
          ].map((text, index) => (
            <button
              key={index}
              className='w-[480px] h-[60px] rounded-full bg-transparent border border-white/30 text-white text-[20px] font-medium hover:bg-white/20'
              onClick={handleButtonClick}
            >
              {text}
            </button>
          ))
        ) : (
          <>
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className='w-[480px] h-[180px] p-4 rounded-xl bg-transparent border focus:outline-1 focus:outline-white transition-all border-white/30 text-white resize-none'
              placeholder='Type your response...'
            />
            <button
              onClick={handleButtonClick}
              disabled={inputValue.trim() === ""}
              className={`w-[480px] h-[60px] rounded-full p-4 text-black transition duration-200 ease-in-out ${
                inputValue.trim() === ""
                  ? "bg-transparent border border-white/30 text-white cursor-not-allowed"
                  : "bg-white hover:bg-gray-200"
              }`}
            >
              Submit
            </button>
          </>
        )}
      </div>
    </div>
  );
}
