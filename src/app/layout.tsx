// app/layout.tsx

import "./globals.css";
import Image from "next/image";
import MainImage from "../../public/background.svg";
import { DM_Sans, Raleway } from "next/font/google";

export const metadata = {
  title: "HITE EQ",
  description: "App description here",
};
const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"], // добавь нужные веса
  variable: "--font-dm-sans", // опционально, если хочешь использовать CSS переменную
  display: "swap",
});

// const raleway = Raleway({
//   subsets: ["latin"],
//   weight: ["400", "500", "700"], // добавь нужные веса
//   variable: "--font-raleway", // опционально, если хочешь использовать CSS переменную
//   display: "swap",
// });
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body className={`${dmSans.className} `}>
        <div className='relative  h-screen overflow-hidden'>
          {/* Background image with lower z-index */}
          <Image
            src={MainImage}
            alt='Background'
            fill
            className='object-cover z-0'
            quality={100}
            priority
          />

          <div className='relative z-10'>{children}</div>
        </div>
      </body>
    </html>
  );
}
