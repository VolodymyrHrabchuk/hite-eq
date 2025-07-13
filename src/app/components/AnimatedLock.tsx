// components/MorphingLock.tsx
"use client";

import { useRef, useEffect } from "react";
import { motion, useAnimation, useInView, Variants } from "framer-motion";

export default function MorphingLock() {
  const controls = useAnimation();
  const ref = useRef<SVGPathElement>(null);
  // следим, когда элемент хотя бы наполовину (amount: 0.5) появляется в вьюпорте, и запускаем один раз (once: true)
  const inView = useInView(ref, { once: true, amount: 0.5 });

  useEffect(() => {
    if (inView) controls.start("visible");
  }, [inView, controls]);

  // старый «каплевидный» d и новый замочек d
  const topOld = `
    M25 0C36.3949 0 45.6347 9.23989 45.6348 20.6348
    V36.1387H33.334V20.6348C33.334 16.033 29.6018 12.3008 25 12.3008
    C20.3982 12.3008 16.666 16.033 16.666 20.6348
    V36.1436H4.36523V20.6348C4.36526 9.2399 13.6051 0 25 0Z
  `
    .trim()
    .replace(/\s+/g, " ");

  const topNew = `
    M24.2051 0C34.3468 0 42.7811 7.31933 44.5137 16.9629
    L32.5391 21.3535V20.6348C32.539 16.033 28.8069 12.3008 24.2051 12.3008
    C19.6033 12.3008 15.8711 16.033 15.8711 20.6348
    V36.1436H3.57031V20.6348C3.57034 9.2399 12.8102 0.0000252602 24.2051 0
    ZM44.8398 36.1387H32.5391V27.21H44.8398V36.1387Z
  `
    .trim()
    .replace(/\s+/g, " ");

  const variants: Variants = {
    hidden: { d: topOld },
    visible: {
      d: topNew,
      transition: { duration: 0.6, ease: "easeInOut" },
    },
  };

  return (
    <svg
      width='49'
      height='59'
      viewBox='0 0 49 59'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      {/* Маска, чтобы морфилась только верхняя часть */}
      <mask id='mask-cut-bottom' x='0' y='0' width='49' height='59'>
        <rect x='0' y='0' width='49' height='27' fill='white' />
      </mask>

      {/* Этот путь морфит из topOld → topNew, когда попадает в вьюпорт */}
      <motion.path
        ref={ref}
        mask='url(#mask-cut-bottom)'
        fill='url(#paint0_linear_1174_1504)'
        variants={variants}
        initial='hidden'
        animate={controls}
      />

      {/* Нижняя часть с блюром */}
      <foreignObject x='-18' y='8.71826' width='84.4099' height='67.7021'>
        <div
          style={{
            backdropFilter: "blur(9px)",
            clipPath: "url(#bgblur_0_1174_1504_clip_path)",
            width: "100%",
            height: "100%",
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
  );
}
