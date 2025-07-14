"use client";

import Image from "next/image";
import Logo from "../../public/mainLogo.svg";
import Landing from "../../public/landing.svg";
import MainImage from "../../public/background.svg";
import { useRouter } from "next/navigation";
import { ROUTES } from "./routes";
const LandingPage = () => {
  const router = useRouter();
  const goToStepTwo = () => {
    router.push(ROUTES.DASHBOARD);
  };
  return (
    <div className='absolute inset-0 flex items-center justify-center  w-full text-white'>
      <div
        className='w-[474px] p-6 flex flex-col items-center text-center rounded-[28px] border border-white/20 backdrop-blur-md relative'
        style={{
          backgroundColor: "transparent",
        }}
      >
        <Image
          src={MainImage}
          alt='Landing'
          width={500}
          height={500}
          className='absolute inset-0 w-full h-full object-cover -z-10 overflow-hidden rounded-[28px] opacity-20'
        />
        <Image width={442} height={440} src={Landing} alt='Landing' />

        <Image
          width={192}
          height={48}
          src={Logo}
          alt='Logo'
          quality={100}
          className='my-10'
        />

        <p className='text-white/90 text-2xl leading-relaxed mb-10'>
          This experience gives you a quick but meaningful look at how athletes
          interact with HITE EQ. This should take 10–15 minutes.
        </p>

        <div className='mt-6 w-full'>
          <button
            onClick={goToStepTwo}
            className='w-full py-3 rounded-full bg-white text-black font-medium text-lg hover:bg-gray-200 transition'
          >
            Start
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
