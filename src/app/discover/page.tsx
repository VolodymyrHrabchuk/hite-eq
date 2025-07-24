"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Arrow from "../../../public/arrow.svg";
import { useRouter } from "next/navigation";
import { ROUTES } from "../routes";

interface Question {
  id: number;
  question: string;
  position: number;
  use_common_answer: boolean;
  score_type: string;
  reverse_scoring: boolean;
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

  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [fillPercentage, setFillPercentage] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [textVisible, setTextVisible] = useState(true);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [scores, setScores] = useState<Record<string, number>>({
    composure: 0,
    confidence: 0,
    competitiveness: 0,
    commitment: 0,
  });

  const commonAnswers = [
    "Strongly disagree",
    "Disagree",
    "Neutral",
    "Agree",
    "Strongly Agree",
  ];
  const commonAnswerMap: Record<string, string> = {
    "Strongly disagree": "strong_disagree",
    Disagree: "disagree",
    Neutral: "neutral",
    Agree: "agree",
    "Strongly Agree": "strong_agree",
  };

  // Безопасный расчёт прогресса
  const updateProgress = (index: number) => {
    const total = questions.length || 1;
    setFillPercentage(Math.floor(((index + 1) / total) * 100));
  };

  const handleBack = () => {
    if (selectedIndex > 0) {
      const prev = selectedIndex - 1;
      setSelectedIndex(prev);
      updateProgress(prev);
    } else {
      router.back();
    }
  };

  // Анимация текста и прогресса
  useEffect(() => {
    setTextVisible(false);
    const t = setTimeout(() => {
      setTextVisible(true);
      updateProgress(selectedIndex);
    }, 50);
    return () => clearTimeout(t);
  }, [selectedIndex, questions.length]);

  // Fetch questions
  useEffect(() => {
    const fetchQuestions = async () => {
      setLoadingQuestions(true);
      setError(null);
      try {
        const response = await fetch(
          "https://dashboard-athena.space/api/assessments/"
        );
        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.statusText}`);
        }
        const data: AssessmentAPIResponse = await response.json();
        const discover = data.results.find(
          (a) => a.name === "Discover" && a.type === "discover"
        );
        if (discover?.questions.length) {
          const sorted = discover.questions.sort(
            (a, b) => a.position - b.position
          );
          setQuestions(sorted);
          setFillPercentage(Math.floor((1 / sorted.length) * 100));
        } else {
          setError("Discover assessment or its questions not found.");
        }
      } catch (e: any) {
        setError(`Failed to load questions: ${e.message}`);
      } finally {
        setLoadingQuestions(false);
      }
    };
    fetchQuestions();
  }, []);

  // Сохраняем ответ локально
  const saveLocalAnswer = (
    questionId: number,
    score: number,
    commonAnswer: string | null,
    textAnswer?: string
  ) => {
    const stored = JSON.parse(localStorage.getItem("answers") || "[]");
    stored.push({
      questionId,
      score,
      score_type: questions[selectedIndex]?.score_type,
      commonAnswer,
      answer: textAnswer ?? null,
    });
    localStorage.setItem("answers", JSON.stringify(stored));
  };

  const submitAnswerToApi = async (payload: any) => {
    setSubmittingAnswer(true);
    try {
      await fetch("https://dashboard-athena.space/api/members-answers/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch {
      console.warn("API submission failed, continuing flow");
    } finally {
      setSubmittingAnswer(false);
    }
  };

  const proceedToNext = () => {
    const next = selectedIndex + 1;
    if (next < questions.length) {
      setSelectedIndex(next);
      updateProgress(next);
      setInputValue("");
    } else {
      // Финализация
      localStorage.setItem("discoverScores", JSON.stringify(scores));
      localStorage.setItem("showTrainPopup", "true");
      localStorage.setItem("level", "2");
      router.push(ROUTES.SCORE);
    }
  };

  const handleOptionClick = async (text: string) => {
    const current = questions[selectedIndex];
    if (!current) return;

    // Подсчет очков
    const idx = commonAnswers.indexOf(text);
    let pts = idx === 2 ? 1 : idx >= 3 ? 2 : 0;
    if (current.reverse_scoring) pts = 2 - pts;
    setScores((s) => ({
      ...s,
      [current.score_type]: (s[current.score_type] || 0) + pts,
    }));

    // Сохраняем локально
    const commonAns = commonAnswerMap[text] ?? null;
    saveLocalAnswer(current.id, pts, commonAns);

    // Опционально на бэке
    const userId = localStorage.getItem("userId");
    if (userId) {
      await submitAnswerToApi({
        question: current.id,
        user: parseInt(userId, 10),
        common_answer: commonAns!,
      });
    }

    proceedToNext();
  };

  const handleSubmitInputAnswer = async () => {
    const current = questions[selectedIndex];
    if (!current || !inputValue.trim()) return;

    // Текстовый ответ — без системы очков
    saveLocalAnswer(current.id, 0, null, inputValue.trim());

    // Опционально на бэке
    const userId = localStorage.getItem("userId");
    if (userId) {
      await submitAnswerToApi({
        question: current.id,
        user: parseInt(userId, 10),
        answer: inputValue.trim(),
      });
    }

    proceedToNext();
  };

  if (loadingQuestions) {
    return (
      <div className='absolute inset-0 flex items-center justify-center text-white text-xl'>
        Loading Discover questions... 🔄
      </div>
    );
  }

  if (error) {
    return (
      <div className='absolute inset-0 flex flex-col items-center justify-center text-red-500 px-4 text-center'>
        <p className='text-xl'>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className='mt-4 px-6 py-2 bg-white text-black rounded-full'
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className='absolute inset-0 flex items-center justify-center text-white text-xl'>
        No "Discover" assessment questions found. Please check API. 🤔
      </div>
    );
  }

  const current = questions[selectedIndex];
  const isInput = !current.use_common_answer;

  return (
    <div className='absolute inset-0 flex flex-col items-center text-white mt-10 px-6'>
      <div className='flex flex-col items-start'>
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
          Discover
        </h1>

        <div className='relative mx-auto' style={{ width: 465, height: 10 }}>
          <div className='absolute inset-0 bg-white/10 rounded-[12px]' />
          <div
            className='absolute inset-y-0 left-0 bg-white rounded-[12px] transition-all duration-500 ease-in-out'
            style={{ width: `${fillPercentage}%` }}
          />
        </div>

        <div
          className={`mt-12 mb-12 w-[474px] h-[40px] transition-opacity duration-300 ease-in-out ${
            textVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          <p className='text-[20px] text-left'>{current.question}</p>
        </div>
      </div>

      <div className='space-y-4 flex flex-col'>
        {isInput ? (
          <>
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className='w-[480px] h-[250px] p-4 rounded-xl bg-transparent border border-white/30 text-white resize-none focus:outline-2 focus:outline-white'
              placeholder='Type your answer...'
              disabled={submittingAnswer}
            />
            <button
              onClick={handleSubmitInputAnswer}
              disabled={!inputValue.trim() || submittingAnswer}
              className={`w-[480px] h-[60px] rounded-full transition duration-200 ease-in-out ${
                inputValue.trim() && !submittingAnswer
                  ? "bg-white text-black"
                  : "bg-white/20 text-white/50 cursor-not-allowed"
              }`}
            >
              {submittingAnswer ? "Submitting..." : "Submit"}
            </button>
          </>
        ) : (
          commonAnswers.map((txt, i) => (
            <button
              key={i}
              onClick={() => handleOptionClick(txt)}
              disabled={submittingAnswer}
              className='w-[480px] h-[60px] rounded-full bg-transparent border border-white/30 text-white text-[20px] hover:bg-white/20 transition'
            >
              {txt}
            </button>
          ))
        )}
      </div>
    </div>
  );
}
