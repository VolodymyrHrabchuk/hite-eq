"use client";

import Image from "next/image";
import Train from "../../../public/train.svg"; // Image for the background
import { useRouter } from "next/navigation";
import { ROUTES } from "../routes";
import TrainComponent from "../components/Train";

const TrainingPage = () => {
  const router = useRouter();
  const goToStepTwo = () => {
    router.push(ROUTES.DASHBOARD);
  };

  return (
    <div className='relative h-screen w-full  overflow-hidden'>
      {/* Wrap the image with a div that has the backdrop blur */}
      <div
        className='absolute inset-0 z-0'
        style={{
          backgroundImage: `url(${Train.src})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          filter: "blur(18px)", // Apply blur to background image
        }}
      ></div>

      {/* This content will be on top of the blurred background */}
      <div className='relative z-10 flex justify-center items-center h-full text-white font-dmSans font-medium'>
        <TrainComponent />
      </div>
    </div>
  );
};

export default TrainingPage;
