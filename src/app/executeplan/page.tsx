"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Arrow from "../../../public/arrow.svg";
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

interface AssessmentAPIResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: {
    id: number;
    name: string;
    description: string;
    is_active: boolean;
    type: string | null;
    position: number;
    questions: Question[];
  }[];
}

export default function Assessment() {
  const router = useRouter();

  // 1) данные из API
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loadingQ, setLoadingQ] = useState(true);
  const [errorQ, setErrorQ] = useState<string | null>(null);

  // 2) UI-состояния
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [fillPercentage, setFillPercentage] = useState(0);
  const [animate, setAnimate] = useState(true);
  const [submittingAnswer, setSubmittingAnswer] = useState(false);

  // 3) маппинг для ответов типа common
  const commonAnswerMap: Record<string, string> = {
    "Strongly disagree": "strong_disagree",
    Disagree: "disagree",
    Neutral: "neutral",
    Agree: "agree",
    "Strongly Agree": "strong_agree",
  };

  // 4) Анимация при смене вопроса
  useEffect(() => {
    setAnimate(false);
    const t = setTimeout(() => setAnimate(true), 50);
    return () => clearTimeout(t);
  }, [selectedIndex]);

  // 5) Безопасный расчёт прогресса
  const updateProgress = (index: number) => {
    const total = questions.length || 1;
    setFillPercentage((index / total) * 100);
  };

  // 6) Кнопка «Назад»
  const handleBack = () => {
    if (selectedIndex > 0) {
      const prev = selectedIndex - 1;
      setSelectedIndex(prev);
      updateProgress(prev);
      setInputValue("");
    } else {
      router.back();
    }
  };

  // 7) Загрузка вопросов «Execute»
  useEffect(() => {
    (async () => {
      setLoadingQ(true);
      setErrorQ(null);
      try {
        const res = await fetch(`${API_BASE}/assessments/`);
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const data: AssessmentAPIResponse = await res.json();
        const exec = data.results.find(
          (a) => a.name === "Execute" || a.type === "execute"
        );
        if (!exec?.questions?.length) {
          throw new Error("Execute assessment not found");
        }
        const sorted = exec.questions.sort((a, b) => a.position - b.position);
        setQuestions(sorted);
        updateProgress(0);
      } catch (e: any) {
        setErrorQ(e.message);
      } finally {
        setLoadingQ(false);
      }
    })();
  }, []);

  // 8) Отправка на бэкенд
  async function submitAnswerToApi(payload: any) {
    setSubmittingAnswer(true);
    try {
      await fetch(`${API_BASE}/members-answers/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (e) {
      console.warn("Network error sending answer:", e);
    } finally {
      setSubmittingAnswer(false);
    }
  }

  // 9) Обработчик «общих» ответов
  const handleOptionClick = async (text: string) => {
    if (submittingAnswer) return;
    const q = questions[selectedIndex];
    const mapped = commonAnswerMap[text];
    if (!mapped) {
      console.error("No mapping for answer:", text);
      return;
    }

    // Собираем полезoad
    const payload: any = {
      question_id: q.id,
      common_answer: mapped,
    };
    const userId = localStorage.getItem("userId");
    if (userId) payload.user_id = parseInt(userId, 10);

    await submitAnswerToApi(payload);

    const next = selectedIndex + 1;
    if (next >= questions.length) {
      router.push(ROUTES.AFFIRMATION);
      return;
    }
    setSelectedIndex(next);
    updateProgress(next);
    setInputValue("");
  };

  // 10) Обработчик текстового ответа
  const handleSubmitText = async () => {
    if (submittingAnswer || !inputValue.trim()) return;
    const q = questions[selectedIndex];

    const payload: any = {
      question_id: q.id,
      answer: inputValue.trim(),
    };
    const userId = localStorage.getItem("userId");
    if (userId) payload.user_id = parseInt(userId, 10);

    await submitAnswerToApi(payload);

    const next = selectedIndex + 1;
    if (next >= questions.length) {
      router.push(ROUTES.AFFIRMATION);
      return;
    }
    setSelectedIndex(next);
    updateProgress(next);
    setInputValue("");
  };

  // 11) Loading / Error / Empty
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

  // 12) Основной рендер
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
          className='mt-18 mb-10 flex items-start font-bold text-[24px] cursor-pointer'
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
          Object.keys(commonAnswerMap).map((text) => (
            <button
              key={text}
              onClick={() => handleOptionClick(text)}
              disabled={submittingAnswer}
              className='w-[480px] h-[60px] rounded-full bg-transparent border border-white/30 text-white text-[20px] font-medium hover:bg-white/20 transition'
            >
              {text}
            </button>
          ))
        )}
      </div>
    </div>
  );
}
