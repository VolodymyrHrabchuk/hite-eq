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
    <html lang='en' className='h-full'>
      <body className={`${dmSans.className} min-h-full`}>
        <div className='relative min-h-screen'>
          {/* Background image that grows with content */}
          <Image
            src={MainImage}
            alt='Background'
            fill
            className='object-cover z-0'
            quality={100}
            priority
            style={{ zIndex: 0 }}
          />

          {/* Content wrapper with scroll */}
          <div className='relative z-10 min-h-screen overflow-y-auto'>
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
