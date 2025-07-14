"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Arrow from "../../../public/arrow.svg";
import TransitCard from "../components/TransitCard";
import { useRouter } from "next/navigation";
import { ROUTES } from "../routes";
import { API_BASE } from "../lib/api";

interface Question {
  id: number;
  question: string;
  position: number;
  use_common_answer: boolean;
  reverse_scoring: boolean;
  score_type: string;
  assessment: number;
}

export default function Assessment() {
  const router = useRouter();

  // 1) Вопросы из API
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loadingQ, setLoadingQ] = useState(true);
  const [errorQ, setErrorQ] = useState<string | null>(null);

  // 2) UI-состояния
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [fillPercentage, setFillPercentage] = useState(0);
  const [animate, setAnimate] = useState(true);
  const [submittingAnswer, setSubmittingAnswer] = useState(false);

  // 3) Анимация при смене вопроса
  useEffect(() => {
    setAnimate(false);
    const t = setTimeout(() => setAnimate(true), 50);
    return () => clearTimeout(t);
  }, [selectedIndex]);

  const handleBack = () => {
    if (selectedIndex > 0) {
      const prev = selectedIndex - 1;
      setSelectedIndex(prev);
      setFillPercentage((prev / questions.length) * 100);
      setInputValue("");
    } else {
      router.back();
    }
  };
  // 4) Загрузка Execute-вопросов
  useEffect(() => {
    async function load() {
      setLoadingQ(true);
      setErrorQ(null);
      try {
        const res = await fetch(`${API_BASE}/assessments/`);
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const data = await res.json();
        const exec = data.results.find(
          (a: any) => a.name === "Execute" || a.type === "execute"
        );
        if (!exec || !Array.isArray(exec.questions)) {
          throw new Error("Execute assessment not found");
        }
        const sorted = exec.questions.sort(
          (a: Question, b: Question) => a.position - b.position
        );
        setQuestions(sorted);
        setFillPercentage(30);
      } catch (e: any) {
        console.error("Load Execute questions failed:", e);
        setErrorQ(e.message);
      } finally {
        setLoadingQ(false);
      }
    }
    load();
  }, []);

  // 5) Маппинг текста кнопки → enum API
  const commonAnswerMap: Record<string, string> = {
    "Strongly disagree": "strong_disagree",
    Disagree: "disagree",
    Neutral: "neutral",
    Agree: "agree",
    "Strongly Agree": "strong_agree",
  };

  // 6) Отправка ответа на сервер
  async function submitAnswerToApi(payload: any) {
    setSubmittingAnswer(true);
    try {
      const res = await fetch(`${API_BASE}/members-answers/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        console.error("Answer API error:", res.status, err);
      }
    } catch (e) {
      console.error("Network error sending answer:", e);
    } finally {
      setSubmittingAnswer(false);
    }
  }

  // 7) Обработчик общих ответов
  const handleOptionClick = async (text: string) => {
    if (submittingAnswer) return;
    const q = questions[selectedIndex];
    const userIdRaw =
      typeof window !== "undefined" ? localStorage.getItem("userId") : null;
    if (!userIdRaw) return;

    const mapped = commonAnswerMap[text];
    if (!mapped) {
      console.error("No mapping for answer:", text);
      return;
    }

    await submitAnswerToApi({
      question_id: q.id,
      common_answer: mapped,
      user_id: parseInt(userIdRaw, 10),
    });

    const next = selectedIndex + 1;
    if (next >= questions.length) {
      // Последний ответ — сразу на Daily Affirmation
      router.push(ROUTES.AFFIRMATION);
      return;
    }

    setSelectedIndex(next);
    setFillPercentage((next / questions.length) * 100);
    setInputValue("");
  };

  // 8) Обработчик текстового ответа
  const handleSubmitText = async () => {
    if (submittingAnswer || !inputValue.trim()) return;
    const q = questions[selectedIndex];
    const userIdRaw =
      typeof window !== "undefined" ? localStorage.getItem("userId") : null;
    if (!userIdRaw) return;

    await submitAnswerToApi({
      question_id: q.id,
      answer: inputValue,
      user_id: parseInt(userIdRaw, 10),
    });

    const next = selectedIndex + 1;
    if (next >= questions.length) {
      router.push(ROUTES.AFFIRMATION);
      return;
    }

    setSelectedIndex(next);
    setFillPercentage((next / questions.length) * 100);
    setInputValue("");
  };

  // 9) Загрузка / Ошибка / Нет вопросов
  if (loadingQ) {
    return (
      <div className='absolute inset-0 flex items-center justify-center text-white text-xl'>
        Loading Execute questions...
      </div>
    );
  }
  if (errorQ) {
    return (
      <div className='absolute inset-0 flex flex-col items-center justify-center text-red-500 text-center px-4'>
        <p className='text-xl'>Error loading Execute:</p>
        <p className='text-sm mt-2'>{errorQ}</p>
        <button
          onClick={() => window.location.reload()}
          className='mt-4 px-6 py-2 bg-white text-black rounded-full'
        >
          Try Again
        </button>
      </div>
    );
  }
  if (questions.length === 0) {
    return (
      <div className='absolute inset-0 flex items-center justify-center text-white text-xl'>
        No Execute questions found.
      </div>
    );
  }

  // 10) Основной рендер
  const current = questions[selectedIndex];
  const isInput = !current.use_common_answer;

  return (
    <div className='absolute inset-0 flex flex-col items-center text-white mt-10 px-6'>
      <div
        className={`flex flex-col items-start transition-transform duration-500 ease-in-out ${
          animate ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
        }`}
      >
        <h1
          className='mt-18 mb-10 flex items-start font-bold text-[24px]'
          onClick={handleBack}
        >
          <Image
            src={Arrow}
            alt='Arrow'
            width={32}
            height={32}
            className='mr-4'
          />
          Execute
        </h1>

        <div className='w-[465px] h-[10px] mx-auto bg-white/10 rounded-[12px] overflow-hidden mb-4'>
          <div
            className='h-full bg-white transition-all duration-500 ease-in-out rounded-2xl'
            style={{ width: `${fillPercentage}%` }}
          />
        </div>

        <p className='mt-12 mb-12 text-[20px] w-[474px] text-left'>
          {current.question}
        </p>
      </div>

      <div className='space-y-4 flex flex-col'>
        {isInput ? (
          <>
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className='w-[480px] h-[180px] p-4 rounded-xl bg-transparent border border-white/30 text-white resize-none focus:outline-2 focus:outline-white'
              placeholder='Type your response...'
              disabled={submittingAnswer}
            />
            <button
              onClick={handleSubmitText}
              disabled={inputValue.trim() === "" || submittingAnswer}
              className={`w-[480px] h-[60px] rounded-full p-4 text-black transition duration-200 ease-in-out ${
                inputValue.trim() === "" || submittingAnswer
                  ? "bg-transparent border border-white/30 text-white cursor-not-allowed"
                  : "bg-white hover:bg-gray-200"
              }`}
            >
              {submittingAnswer ? "Submitting..." : "Submit"}
            </button>
          </>
        ) : (
          (
            Object.keys(commonAnswerMap) as Array<keyof typeof commonAnswerMap>
          ).map((text) => (
            <button
              key={text}
              className='w-[480px] h-[60px] rounded-full bg-transparent border border-white/30 text-white text-[20px] font-medium hover:bg-white/20'
              onClick={() => handleOptionClick(text)}
              disabled={submittingAnswer}
            >
              {text}
            </button>
          ))
        )}
      </div>
    </div>
  );
}
