"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Arrow from "../../../public/arrow.svg";
import TransitCard from "./TransitCard";
import { useRouter } from "next/navigation";
import { ROUTES } from "../routes";
import { API_BASE } from "../lib/api";

// Интерфейс вопроса
interface Question {
  id: number;
  question: string;
  position: number;
  use_common_answer: boolean;
  score_type:
    | "composure"
    | "confidence"
    | "competitiveness"
    | "commitment"
    | string;
  reverse_scoring: boolean;
  assessment: number;
}

export default function Assessment() {
  const router = useRouter();

  // Состояние
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [textVisible, setTextVisible] = useState(true);
  const [fillPercentage, setFillPercentage] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({
    composure: 0,
    confidence: 0,
    competitiveness: 0,
    commitment: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Тексты и маппинг для общих ответов
  const commonAnswerText = [
    "Strongly disagree",
    "Disagree",
    "Neutral",
    "Agree",
    "Strongly agree",
  ];
  const commonAnswerMap = [
    "strong_disagree",
    "disagree",
    "neutral",
    "agree",
    "strong_agree",
  ];

  // Функция для безопасного обновления прогресса
  const updateProgress = (index: number) => {
    const total = questions.length || 1;
    setFillPercentage(Math.floor(((index + 1) / total) * 100));
  };

  // Получаем вопросы из API
  // Иcходный fetchQuestions — без updateProgress
  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/assessments/`);
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const data = await res.json();
        const hite = data.results.find(
          (a: any) => a.name === "HITE Assessment"
        );
        if (!hite?.questions?.length) throw new Error("Not found");
        const sorted = hite.questions.sort(
          (a: Question, b: Question) => a.position - b.position
        );
        setQuestions(sorted);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  // Новый эффект — сразу выставляем прогресс для первого вопроса,
  // прежде чем сработает анимация текста
  useEffect(() => {
    if (questions.length > 0) {
      // (1 / N) * 100%
      setFillPercentage(Math.floor((1 / questions.length) * 100));
      setSelectedIndex(0);
      setTextVisible(true);
    }
  }, [questions]);

  // Существующий эффект только для анимации текста и последующего updateProgress()
  useEffect(() => {
    if (questions.length === 0) return;
    setTextVisible(false);
    const t = setTimeout(() => {
      setTextVisible(true);
      updateProgress(selectedIndex);
    }, 50);
    return () => clearTimeout(t);
  }, [selectedIndex, questions.length]);

  // Завершение опроса
  const finalizeAssessment = () => {
    // сохраняем локально баллы
    localStorage.setItem("hiteScores", JSON.stringify(scores));
    localStorage.setItem("showDiscoverPopup", "true");
    localStorage.setItem("level", "1");
    router.push("/first-assessment");
  };

  // Обработчик ответа
  const handleAnswer = async (choiceIndex: number) => {
    const current = questions[selectedIndex];
    if (!current) return;

    // 1) Подсчет очков
    let pts = choiceIndex === 2 ? 1 : choiceIndex >= 3 ? 2 : 0;
    if (current.reverse_scoring) pts = 2 - pts;

    setScores((s) => ({
      ...s,
      [current.score_type]: (s[current.score_type] || 0) + pts,
    }));

    // 2) Сохраняем ответ локально
    const stored = JSON.parse(localStorage.getItem("answers") || "[]");
    stored.push({
      questionId: current.id,
      score: pts,
      score_type: current.score_type,
      commonAnswer: current.use_common_answer
        ? commonAnswerMap[choiceIndex]
        : null,
    });
    localStorage.setItem("answers", JSON.stringify(stored));

    // 3) Если есть userId — дублируем на бэкенд
    const userIdRaw = localStorage.getItem("userId");
    if (userIdRaw) {
      fetch(`${API_BASE}/members-answers/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: current.id,
          user: parseInt(userIdRaw, 10),
          common_answer: current.use_common_answer
            ? commonAnswerMap[choiceIndex]
            : undefined,
          answer: null,
        }),
      }).catch(() => {
        console.warn("Backend submission failed, but continuing flow");
      });
    }

    // 4) Переходим к следующему вопросу или завершаем
    const next = selectedIndex + 1;
    if (next >= questions.length) {
      finalizeAssessment();
    } else {
      setSelectedIndex(next);
    }
  };

  // Отображаем разные состояния
  if (loading) {
    return (
      <div className='absolute inset-0 flex items-center justify-center text-white text-2xl'>
        Loading assessment...
      </div>
    );
  }
  if (error) {
    return (
      <div className='absolute inset-0 flex flex-col items-center justify-center text-red-500 text-center px-4'>
        <p className='text-xl'>Error: {error}</p>
        <p className='text-sm mt-2'>Please try refreshing the page.</p>
      </div>
    );
  }
  if (questions.length === 0) {
    return (
      <div className='absolute inset-0 flex items-center justify-center text-white text-2xl'>
        No HITE Assessment Questions Found
      </div>
    );
  }
  if (selectedIndex >= questions.length) {
    // Конечный экран “You Did It”
    return (
      <div className='absolute inset-0 flex flex-col items-center text-white mt-10 px-6'>
        <h1 className='mt-18 mb-10 font-bold text-[37px]'>You Did It 🎉</h1>
        <p className='text-[14px] text-center text-white/80'>
          You've completed the HITE Assessment! Navigating to your results
          now...
        </p>
        <TransitCard width='243px' />
      </div>
    );
  }

  // Текущий вопрос
  const current = questions[selectedIndex];

  return (
    <div className='absolute inset-0 flex flex-col items-center text-white mt-10 px-6'>
      {/* Заголовок + кнопка назад */}
      <div className='flex flex-col items-start'>
        <h1
          className='mt-18 mb-10 flex items-start font-bold text-[24px] cursor-pointer'
          onClick={() => router.back()}
        >
          <Image
            src={Arrow}
            alt='Arrow'
            width={32}
            height={32}
            className='mr-4'
          />
          HITE Assessment
        </h1>

        {/* Прогресс-бар */}
        <div className='w-[465px] h-[10px] mx-auto bg-white/10 rounded-[12px] overflow-hidden'>
          <div
            className='h-full bg-white transition-all duration-500 ease-in-out rounded-[12px]'
            style={{ width: `${fillPercentage}%` }}
          />
        </div>

        {/* Вопрос */}
        <div
          className={`mt-12 mb-12 w-[474px] h-[40px] transition-opacity duration-300 ease-in-out ${
            textVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          <p className='text-[20px] text-left'>{current.question}</p>
        </div>
      </div>

      {/* Ответы */}
      <div className='space-y-4 flex flex-col'>
        {current.use_common_answer ? (
          commonAnswerText.map((txt, i) => (
            <button
              key={i}
              onClick={() => handleAnswer(i)}
              className='w-[480px] h-[60px] rounded-full bg-transparent border border-white/30 text-white text-[20px] hover:bg-white/20 transition'
            >
              {txt}
            </button>
          ))
        ) : (
          <div className='text-white/70 text-center'>
            <p>
              This question requires a text answer. UI not implemented for text
              input.
            </p>
            <p className='mt-2 text-sm'>
              Please implement a textarea + submit if needed.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
