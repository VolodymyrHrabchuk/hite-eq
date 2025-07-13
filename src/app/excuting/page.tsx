"use client";

import Image from "next/image";
import Train from "../../../public/train.svg";
import Excute from "../../../public/excute.svg";
import { useRouter } from "next/navigation";
import { ROUTES } from "../routes";
import ExcuteComponent from "../components/Excute";

const TrainingPage = () => {
  const router = useRouter();
  const goToStepTwo = () => {
    router.push(ROUTES.DASHBOARD);
  };

  return (
    <div className="relative h-screen w-full  overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${Excute.src})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundPositionY: "30px",
            backgroundRepeat: "no-repeat",
            filter: "blur(28px)",
          }}
        ></div>

        <div className="absolute inset-0 bg-black/50"></div>
      </div>

      <div className="relative z-10 flex justify-center items-center h-full text-white">
        <ExcuteComponent />
      </div>
    </div>
  );
};

export default TrainingPage;
