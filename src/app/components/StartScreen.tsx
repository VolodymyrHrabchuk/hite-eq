"use client";
import Image from "next/image";
import Logo from "../../../public/mainLogo.svg";
import MainImage from "../../../public/background.svg";

interface StartScreenProps {
  onStart: () => void;
}

export default function StartScreen({ onStart }: StartScreenProps) {
  return (
    <div className='flex h-screen items-center justify-center px-6'>
      <div
        className='flex flex-col items-start p-4 gap-12 text-white text-[20px] font-medium relative max-w-[623px] w-full'
        style={{
          background:
            "radial-gradient(60.56% 60.56% at 50% 50%, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.06) 100%)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          borderRadius: "28px",
          backdropFilter: "blur(10px)",
        }}
      >
        <Image
          src={MainImage}
          alt='Landing'
          width={500}
          height={500}
          className='absolute inset-0 w-full h-full object-cover -z-10 overflow-hidden rounded-[28px] opacity-20'
        />
        <Image
          width={192}
          height={48}
          src={Logo}
          alt='Logo'
          className='mx-auto mt-4'
        />

        <p className='text-center font-normal text-2xl  leading-snug'>
          When your athlete first downloads the app, they'll complete an
          assessment that will give you baseline metrics on their mental
          attributes (here's a shortened version of that assessment for you to
          try).
        </p>

        <button
          onClick={onStart}
          className='w-full justify-center  rounded-full py-4 text-black bg-white text-xl font-medium'
        >
          Start HITE Assessment
        </button>
      </div>
    </div>
  );
}
