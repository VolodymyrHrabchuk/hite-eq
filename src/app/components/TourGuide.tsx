// components/TourGuide.tsx
"use client";
import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

export interface Step {
  selector: string;
  content: string;
  placement: "top" | "bottom" | "left" | "right";
}

interface TourGuideProps {
  steps: Step[];
  onFinish?: () => void;
}

export const TourGuide: React.FC<TourGuideProps> = ({ steps, onFinish }) => {
  const [stepIdx, setStepIdx] = useState(0);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Жёстко прописанные позиции для каждого шага:
  const manualPositions = [
    { top: "390px", left: "50px" }, // Шаг 1
    { top: "320px", left: "50px" }, // Шаг 2
    { top: "790px", left: "50px" }, // Шаг 3
    { top: "400px", left: "50px" }, // Шаг 4
  ];

  // При каждом изменении шага меняем стиль тултипа и скроллим
  useEffect(() => {
    const pos = manualPositions[stepIdx];
    setTooltipStyle({
      position: "absolute",
      top: pos.top,
      left: pos.left,
      zIndex: 10002,
    });

    // Скроллим так, чтобы тултип оказался в центре экрана
    const scrollToY = Math.max(
      parseInt(pos.top, 10) - window.innerHeight / 2,
      0
    );
    window.scrollTo({ top: scrollToY, behavior: "smooth" });
  }, [stepIdx]);

  const isLast = stepIdx === steps.length - 1;
  const next = () => (isLast ? onFinish?.() : setStepIdx((i) => i + 1));
  const skip = () => onFinish?.();

  // Динамический «хвостик» тултипа
  const computeTailStyle = (): React.CSSProperties => {
    const size = 12;
    const base: React.CSSProperties = {
      position: "absolute",
      width: `${size}px`,
      height: `${size}px`,
      background: "white",
      transform: "rotate(45deg)",
      zIndex: 10002,
    };
    if (!tooltipRef.current) {
      return base;
    }
    const tw = tooltipRef.current.offsetWidth;
    const th = tooltipRef.current.offsetHeight;
    const placement = steps[stepIdx].placement;

    switch (placement) {
      case "top":
        return {
          ...base,
          bottom: `-${size / 2}px`,
          left: `${tw / 2 - size / 2}px`,
        };
      case "bottom":
        return {
          ...base,
          top: `-${size / 2}px`,
          left: `${tw / 2 - size / 2}px`,
        };
      case "left":
        return {
          ...base,
          right: `-${size / 2}px`,
          top: `${th / 2 - size / 2}px`,
        };
      default: // right
        return {
          ...base,
          left: `-${size / 2}px`,
          top: `${th / 2 - size / 2}px`,
        };
    }
  };

  return createPortal(
    <AnimatePresence>
      {/* Оверлей, который гасит фон, но не закрывает тур по клику */}
      <motion.div
        key='overlay'
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "black",
          zIndex: 10000,
        }}
      />

      {/* Сам тултип */}
      <motion.div
        key='tooltip'
        ref={tooltipRef}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.3 }}
        style={tooltipStyle}
        className='relative bg-white rounded-2xl p-6 max-w-xs shadow-lg'
        onClick={(e) => e.stopPropagation()}
      >
        {/* Текст подсказки */}
        <div className='text-black text-base leading-relaxed'>
          {steps[stepIdx].content}
        </div>

        {/* Номер шага и кнопка */}
        <div className='mt-4 flex items-center justify-between'>
          <span className='text-gray-400 text-sm'>
            Step {stepIdx + 1}/{steps.length}
          </span>
          <button
            onClick={next}
            className='w-10 h-5 flex items-center justify-center bg-black rounded-full'
          >
            <svg
              width='16'
              height='16'
              viewBox='0 0 24 24'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                d='M8 5L16 12L8 19'
                stroke='white'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </svg>
          </button>
        </div>

        {/* Хвостик */}
        <div style={computeTailStyle()} />
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};
