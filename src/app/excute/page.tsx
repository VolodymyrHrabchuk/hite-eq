"use client";

import Image from "next/image";
import Excute from "../../../public/excute.svg";
import { useRouter } from "next/navigation";
import { ROUTES } from "../routes";
import Flash from "../../../public/flash.svg";
import Arrow from "../../../public/arrow.svg";

const ExcutePage = () => {
  const router = useRouter();
  const goToStepTwo = () => {
    router.push(ROUTES.EXCUTING);
  };

  return (
    <div className='min-h-screen flex flex-col items-center justify-center w-full text-white'>
      {/* Стрелка назад */}
      <div className='mb-15 -ml-[470px]'>
        <Image src={Arrow} alt='Arrow' width={32} height={32} />
      </div>

      {/* Карточка с градиентами внутри */}
      <div
        className='relative w-[474px] p-4 flex flex-col text-start rounded-[28px] border border-white/20 backdrop-blur-md overflow-hidden'
        style={{ backgroundColor: "transparent" }}
      >
        {/* Градиент сверху */}
        <div className='absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-[#1D3156]/[0.8] to-transparent pointer-events-none -z-10' />
        {/* Градиент снизу */}
        <div className='absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-[#1D3156]/[0.8] to-transparent pointer-events-none -z-10' />

        {/* Контейнер под изображение */}
        <div className='relative w-full h-[560px] mb-5'>
          <Image
            src={Excute}
            alt='Excute Illustration'
            fill
            className='object-cover border border-white/20 rounded-[12px]'
          />
        </div>

        <h1 className='text-2xl leading-relaxed mb-4'>
          Lock In Before Practice
        </h1>
        <p className='text-white/80 text-base leading-relaxed mb-5'>
          Show up focused and ready to go.
        </p>

        <div className='flex items-center space-x-2'>
          <Image src={Flash} alt='Flash' className='w-8 h-8' />
          <p>3 Flash Cards</p>
        </div>

        <button
          onClick={goToStepTwo}
          className='mt-6 w-full py-3 rounded-full bg-white text-black text-xl font-medium hover:bg-gray-200 transition'
        >
          Start
        </button>
      </div>
    </div>
  );
};

export default ExcutePage;
