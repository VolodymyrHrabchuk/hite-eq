"use client";

import { useState } from "react";
import Image from "next/image";
import Affirm from "../../../public/affirm.svg";
import { useRouter } from "next/navigation";
import { ROUTES } from "../routes";

export default function Affirmation() {
  const router = useRouter();
  const [liked, setLiked] = useState(false);

  const goToScore = () => {
    router.push(ROUTES.FINAlSCORE);
  };

  return (
    <div className='relative h-screen w-full overflow-hidden'>
      <div className='absolute inset-0 z-0'>
        <div
          className='absolute inset-0'
          style={{
            backgroundImage: `url(${Affirm.src})`,
            backgroundSize: "contain",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backgroundPositionY: "top",
          }}
        />
      </div>

      <div className='relative z-10 text-white px-6 pt-16'>
        <div className='max-w-3xl mx-auto mt-12'>
          <h1 className='text-2xl font-bold mb-4 text-center'>
            Daily Affirmation
          </h1>
          <p className='text-lg text-center'>
            Repeat out loud or in your mind this phrase.
          </p>
        </div>
      </div>

      {/* Основной текст + кнопка-сердечко */}

      {/* Кнопка Next, расположенная снизу по центру (инлайн-стилем перекрываем mt-150) */}
      <div className='absolute inset-0 flex items-center justify-center z-10 text-white px-6 text-center'>
        <h2 className='text-3xl  max-w-2xl'>
          <span className='font-bold'>I am exactly where I need to be</span> and
          have everything within me to be successful.
        </h2>
      </div>
      <div className='absolute bottom-8 left-0 right-0 z-10 px-6'>
        <div className='flex items-center justify-between max-w-xl mx-auto w-full text-white'>
          <button onClick={goToScore} className='text-lg pl-10 mx-auto'>
            Next
          </button>

          <button
            onClick={() => setLiked((v) => !v)}
            aria-label='Toggle like'
            className='p-4 border border-white/30 rounded-full'
          >
            {liked ? (
              <svg
                width='20'
                height='18'
                viewBox='0 0 20 18'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  d='M1.00078e-06 6.13734C1.83238e-06 11.0003 4.01943 13.5917 6.96173 15.9111C8 16.7296 9 17.5002 10 17.5002C11 17.5002 12 16.7296 13.0383 15.9111C15.9806 13.5916 20 11.0003 20 6.13734C20 1.2744 14.4998 -2.17429 10 2.50087C5.50016 -2.17429 1.69171e-07 1.27441 1.00078e-06 6.13734Z'
                  fill='white'
                />
              </svg>
            ) : (
              <svg
                width='20'
                height='18'
                viewBox='0 0 22 20'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  fill-rule='evenodd'
                  clip-rule='evenodd'
                  d='M4.62436 2.4241C2.96537 3.18243 1.75 4.98614 1.75 7.13701C1.75 9.33441 2.64922 11.0281 3.93829 12.4797C5.00073 13.676 6.28684 14.6675 7.54113 15.6345C7.83904 15.8642 8.13515 16.0925 8.42605 16.3218C8.95208 16.7365 9.42132 17.1004 9.87361 17.3647C10.3261 17.6292 10.6904 17.7499 11 17.7499C11.3096 17.7499 11.6739 17.6292 12.1264 17.3647C12.5787 17.1004 13.0479 16.7365 13.574 16.3218C13.8649 16.0925 14.161 15.8642 14.4589 15.6345C15.7132 14.6675 16.9993 13.676 18.0617 12.4797C19.3508 11.0281 20.25 9.33441 20.25 7.13701C20.25 4.98614 19.0346 3.18243 17.3756 2.4241C15.7639 1.68738 13.5983 1.88249 11.5404 4.02064C11.399 4.16754 11.2039 4.25054 11 4.25054C10.7961 4.25054 10.601 4.16754 10.4596 4.02064C8.40166 1.88249 6.23607 1.68739 4.62436 2.4241ZM11 2.45872C8.68795 0.390151 6.09896 0.10078 4.00076 1.05987C1.78471 2.07283 0.250001 4.42494 0.250001 7.13701C0.250002 9.80254 1.3605 11.836 2.81672 13.4757C3.98288 14.7888 5.41023 15.8879 6.67083 16.8585C6.95659 17.0785 7.23378 17.292 7.49742 17.4998C8.00966 17.9036 8.55955 18.3342 9.11683 18.6598C9.67386 18.9853 10.3096 19.2499 11 19.2499C11.6904 19.2499 12.3261 18.9853 12.8832 18.6598C13.4405 18.3342 13.9903 17.9036 14.5026 17.4998C14.7662 17.2919 15.0434 17.0785 15.3292 16.8585C16.5898 15.8879 18.0171 14.7888 19.1833 13.4757C20.6395 11.836 21.75 9.80254 21.75 7.13701C21.75 4.42494 20.2153 2.07283 17.9992 1.05987C15.901 0.100778 13.3121 0.39015 11 2.45872Z'
                  fill='white'
                />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
