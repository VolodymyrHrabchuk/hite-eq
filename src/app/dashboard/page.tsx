"use client";

import Image from "next/image";
import Logo from "../../../public/mainLogo.svg";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createUser } from "../lib/api";
import { ROUTES } from "../routes";

const DEFAULT_TEAM_ID = 1;

const Dashboard = () => {
  const router = useRouter();

  // Форма
  const [name, setName] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [phoneNumberInput, setPhoneNumberInput] = useState("");

  // Стейт загрузки и ошибок
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        email: emailInput,
        first_name: name,
        last_name: schoolName,
        phone_number: phoneNumberInput,
        team: DEFAULT_TEAM_ID,
      };

      const responseData = await createUser(payload);
      if (responseData.id) {
        localStorage.setItem("userId", responseData.id.toString());
        console.log("User ID saved to localStorage:", responseData.id);
      }

      router.push(ROUTES.Assessments);
    } catch (err: any) {
      console.error(err);
      const msg =
        err.detail ||
        (typeof err === "string" ? err : err.message) ||
        "Unexpected error";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='absolute inset-0  flex flex-col items-center text-white mt-30'>
      <Image width={192} height={48} src={Logo} alt='Logo' quality={100} />

      <h1 className='mt-18 mb-10 text-center text-[32px] font-bold'>
        Hello! Let's get acquainted
      </h1>

      <form className='space-y-8' onSubmit={handleSignup}>
        <div>
          <label htmlFor='name' className='block text-sm mb-2'>
            Name
          </label>
          <input
            id='name'
            type='text'
            placeholder='Enter your name'
            value={name}
            onChange={(e) => setName(e.target.value)}
            className='w-[480px] px-6 py-[17.5px] rounded-full bg-transparent border border-white text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-white'
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.3)",
            }}
          />
        </div>

        <div>
          <label htmlFor='schoolName' className='block text-sm mb-2'>
            School Name
          </label>
          <input
            id='schoolName'
            type='text'
            placeholder='Enter your school name'
            value={schoolName}
            onChange={(e) => setSchoolName(e.target.value)}
            className='w-[480px] px-6 py-[17.5px] rounded-full bg-transparent border border-white text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-white'
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.3)",
            }}
          />
        </div>

        <div>
          <label htmlFor='email' className='block text-sm mb-2'>
            Email
          </label>
          <input
            id='email'
            type='email'
            placeholder='Enter your email'
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            className='w-[480px] px-6 py-[17.5px] rounded-full bg-transparent border border-white text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-white'
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.3)",
            }}
          />
        </div>

        <div>
          <label htmlFor='phoneNumber' className='block text-sm mb-2'>
            Phone Number
          </label>
          <input
            id='phoneNumber'
            type='tel'
            placeholder='+123456789'
            value={phoneNumberInput}
            onChange={(e) => {
              let v = e.target.value.replace(/[^\d]/g, "");
              if (!v.startsWith("+")) v = `+${v}`;
              setPhoneNumberInput(v);
            }}
            className='w-[480px] px-6 py-[17.5px] rounded-full bg-transparent border border-white text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-white'
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.3)",
            }}
          />
        </div>

        {error && <p className='text-red-500 text-sm text-center'>{error}</p>}

        <button
          type='submit'
          disabled={loading}
          className='w-[480px] py-[17.5px] rounded-full bg-white text-black font-medium text-lg'
        >
          {loading ? "Signing up..." : "Continue"}
        </button>
      </form>
    </div>
  );
};

export default Dashboard;
