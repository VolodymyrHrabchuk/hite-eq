"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Arrow from "../../../public/arrow.svg";
import { useRouter } from "next/navigation";
import { ROUTES } from "../routes";

// Define a type for your question structure
interface Question {
  id: number;
  question: string;
  position: number;
  use_common_answer: boolean; // Indicates if it uses common answers or free text
  score_type: string;
  reverse_scoring: boolean;
  assessment: number;
}

// Define a type for the API response structure for assessments
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

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [fillPercentage, setFillPercentage] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [textVisible, setTextVisible] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Common answers for 'use_common_answer: true' questions (DISPLAY TEXT)
  const commonAnswers = [
    "Strongly disagree",
    "Disagree",
    "Neutral",
    "Agree",
    "Strongly Agree",
  ];

  const [scores, setScores] = useState<Record<string, number>>({
    composure: 0,
    confidence: 0,
    competitiveness: 0,
    commitment: 0,
  });

  // Map DISPLAY TEXT to the API-EXPECTED VALUE
  const commonAnswerMap: Record<string, string> = {
    "Strongly disagree": "strong_disagree",
    Disagree: "disagree",
    Neutral: "neutral",
    Agree: "agree",
    "Strongly Agree": "strong_agree",
  };

  const handleBack = () => {
    if (selectedIndex > 0) {
      const prev = selectedIndex - 1;
      setSelectedIndex(prev);
      setFillPercentage(Math.floor(((prev + 1) / questions.length) * 100));
    } else {
      router.back();
    }
  };

  useEffect(() => {
    // При смене вопроса сначала скрыть текст
    setTextVisible(false);

    // Через 300ms показать текст и обновить fillPercentage
    const timer = setTimeout(() => {
      setTextVisible(true);
      setFillPercentage(
        Math.floor(((selectedIndex + 1) / questions.length) * 100)
      );
    }, 50);

    return () => clearTimeout(timer);
  }, [selectedIndex, questions.length]);
  // --- API Call to Fetch Questions ---
  useEffect(() => {
    const fetchQuestions = async () => {
      console.log("Fetching Discover assessment questions...");
      setLoadingQuestions(true);
      setError(null);
      try {
        const response = await fetch(
          "https://dashboard-athena.space/api/assessments/"
        );
        if (!response.ok) {
          throw new Error(
            `Failed to fetch assessments: ${response.statusText}`
          );
        }
        const data: AssessmentAPIResponse = await response.json();

        const discoverAssessment = data.results.find(
          (assessment) =>
            assessment.name === "Discover" && assessment.type === "discover"
        );

        if (discoverAssessment && discoverAssessment.questions.length > 0) {
          const sortedQuestions = discoverAssessment.questions.sort(
            (a, b) => a.position - b.position
          );
          setQuestions(sortedQuestions);
          console.log("Fetched Discover questions:", sortedQuestions);
          setFillPercentage(0);
        } else {
          setError("Discover assessment or its questions not found.");
          setQuestions([]);
        }
      } catch (err: any) {
        console.error("Error fetching assessment questions:", err);
        setError(`Failed to load questions: ${err.message}`);
        setQuestions([]);
      } finally {
        setLoadingQuestions(false);
      }
    };

    fetchQuestions();
  }, []);

  // --- API Call to Submit Answers ---
  // Payload type to conditionally allow 'answer' OR 'common_answer'
  type AnswerPayload = {
    question: number;
    user: number;
  } & (
    | { answer: string; common_answer?: never } // For free-text questions
    | { common_answer: string; answer?: never }
  ); // For common-answer questions

  const submitAnswerToApi = async (answerPayload: AnswerPayload) => {
    setSubmittingAnswer(true);
    setError(null);

    try {
      console.log(
        "Submitting answer payload:",
        JSON.stringify(answerPayload, null, 2)
      );

      const response = await fetch(
        "https://dashboard-athena.space/api/members-answers/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            // Add Authorization header if needed
          },
          body: JSON.stringify(answerPayload),
        }
      );

      let responseData: any;
      const contentType = response.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        try {
          responseData = await response.json();
        } catch (jsonParseError) {
          console.error("Failed to parse JSON response:", jsonParseError);
          setError(
            `Server responded with JSON content-type but invalid JSON. Status: ${response.status}.`
          );
          return false;
        }
      } else {
        responseData = await response.text();
        console.error(
          "Server returned non-JSON response (likely error):",
          responseData
        );
      }

      if (!response.ok) {
        console.error(
          "Failed to submit answer. Status:",
          response.status,
          "Details:",
          responseData
        );
        let errorMessage = `Failed to submit answer (Status: ${response.status}).`;

        if (typeof responseData === "object" && responseData !== null) {
          const apiErrors = Object.values(responseData).flat().join("; ");
          errorMessage += ` Details: ${apiErrors}`;
        } else if (
          typeof responseData === "string" &&
          responseData.length > 0
        ) {
          errorMessage += ` Server Message: ${responseData.substring(0, 500)}${
            responseData.length > 500 ? "..." : ""
          }`;
        }

        setError(errorMessage);
        return false;
      }

      console.log("Answer submitted successfully:", responseData);
      return true;
    } catch (err: any) {
      console.error(
        "Network or unexpected error during answer submission:",
        err
      );
      setError(`An unexpected error occurred: ${err.message}`);
      return false;
    } finally {
      setSubmittingAnswer(false);
    }
  };

  // --- Logic to Proceed to Next Question / Finish Assessment ---
  const proceedToNextQuestion = () => {
    const newFillPercentage = Math.min(
      100,
      ((selectedIndex + 1) / questions.length) * 100
    );
    setFillPercentage(newFillPercentage);

    if (selectedIndex < questions.length - 1) {
      setSelectedIndex((prev) => prev + 1);
      setInputValue("");
    } else {
      // сохраняем свежие Discover-скоры
      localStorage.setItem("discoverScores", JSON.stringify(scores));
      // ставим флаг, что нужно показать попап про Train
      localStorage.setItem("showTrainPopup", "true");
      // апгрейдим уровень
      localStorage.setItem("level", "2");
      // переходим на Score
      router.push(ROUTES.SCORE);
    }
  };

  // --- Event Handlers for UI Interactions ---
  const handleOptionClick = async (optionText: string) => {
    const currentQuestion = questions[selectedIndex];
    if (!currentQuestion) return;

    const userId =
      typeof window !== "undefined" ? localStorage.getItem("userId") : null;
    if (!userId) {
      setError("User ID not found. Please log in first.");
      return;
    }

    // IMPORTANT: Map the display text to the API-expected value for common answers
    const apiValue = commonAnswerMap[optionText];
    if (!apiValue) {
      setError(
        `Invalid common answer mapping for: "${optionText}". Please check commonAnswerMap.`
      );
      return;
    }
    // 1) вычисляем очки: Neutral=1, Agree/StrongAgree=2, Disagree/StrongDisagree=0
    const choiceIndex = commonAnswers.indexOf(optionText);
    let pts = choiceIndex === 2 ? 1 : choiceIndex >= 3 ? 2 : 0;
    // 2) компенсируем reverse_scoring
    if (currentQuestion.reverse_scoring) pts = 2 - pts;
    // 3) обновляем локальный стейт
    setScores((prev) => ({
      ...prev,
      [currentQuestion.score_type]:
        (prev[currentQuestion.score_type] || 0) + pts,
    }));
    // For common answer questions, send 'common_answer'
    const payload: AnswerPayload = {
      question: currentQuestion.id,
      common_answer: apiValue, // Send the mapped string value here (e.g., "strong_disagree")
      user: parseInt(userId, 10),
    };

    const success = await submitAnswerToApi(payload);
    if (success) {
      proceedToNextQuestion();
    }
  };

  const handleSubmitInputAnswer = async () => {
    if (inputValue.trim() === "") return;

    const currentQuestion = questions[selectedIndex];
    if (!currentQuestion) return;

    const userId =
      typeof window !== "undefined" ? localStorage.getItem("userId") : null;
    if (!userId) {
      setError("User ID not found. Please log in first.");
      return;
    }

    // For free-text questions, send 'answer'
    const payload: AnswerPayload = {
      question: currentQuestion.id,
      answer: inputValue, // Send the user's input here
      user: parseInt(userId, 10),
    };

    const success = await submitAnswerToApi(payload);
    if (success) {
      proceedToNextQuestion();
    }
  };

  // --- Determine current question and its type ---
  const currentQuestion = questions[selectedIndex];
  const isInputQuestion = currentQuestion
    ? !currentQuestion.use_common_answer
    : false;

  // --- Conditional Rendering for Loading, Error, and No Questions ---
  if (loadingQuestions) {
    return (
      <div className='absolute inset-0 flex items-center justify-center text-white text-xl'>
        Loading Discover questions... 🔄
      </div>
    );
  }

  if (error) {
    return (
      <div className='absolute inset-0 flex flex-col items-center justify-center text-red-500 text-center px-4'>
        <p className='text-xl'>Error loading assessment:</p>
        <p className='text-sm mt-2'>{error}</p>
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
        No "Discover" assessment questions found. Please check API. 🤔
      </div>
    );
  }

  return (
    <div className='absolute inset-0 flex flex-col items-center text-white mt-10 px-6'>
      <div className='flex flex-col items-start'>
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
          Discover
        </h1>

        <div
          className='relative mx-auto'
          style={{
            width: "465px",
            height: "10px",
          }}
        >
          {/* фоновой трек */}
          <div className='absolute inset-0 bg-white/10 rounded-[12px]' />
          {/* заполнение */}
          <div
            className='absolute inset-y-0 left-0 bg-white rounded-[12px]
                transition-all duration-500 ease-in-out'
            style={{ width: `${fillPercentage}%` }}
          />
        </div>

        <div
          className={`mt-12 mb-12 w-[474px] h-[40px] transition-opacity duration-300 ease-in-out ${
            textVisible ? "opacity-100" : "opacity-0"
          }`}
          key={selectedIndex} // Можно ключем сменить для принудительного rerender
        >
          <p className='text-[20px] text-left'>{currentQuestion?.question}</p>
        </div>
      </div>

      <div className='space-y-4 flex flex-col'>
        {isInputQuestion ? (
          <>
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className='w-[480px] h-[250px] p-4 rounded-xl bg-transparent border border-white/30 text-white resize-none  focus:outline-2 focus:outline-white'
              placeholder='Type your answer...'
              disabled={submittingAnswer}
            />
            <button
              onClick={handleSubmitInputAnswer}
              disabled={inputValue.trim() === "" || submittingAnswer}
              className={`w-[480px] h-[60px] rounded-full transition duration-200 ease-in-out ${
                inputValue.trim() !== "" && !submittingAnswer
                  ? "bg-white text-black"
                  : "bg-white/20 text-white/50 cursor-not-allowed"
              }`}
            >
              {submittingAnswer ? "Submitting..." : "Submit"}
            </button>
          </>
        ) : (
          commonAnswers.map((text, index) => (
            <button
              key={index}
              className='w-[480px] h-[60px] rounded-full bg-transparent border border-white/30 text-white text-[20px] fw-[500] transition duration-200 ease-in-out hover:bg-white/20'
              style={{
                background: "rgba(255, 255, 255, 0.04)",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                borderRadius: "30px",
              }}
              onClick={() => handleOptionClick(text)}
              disabled={submittingAnswer}
              aria-label={text}
            >
              {text}
            </button>
          ))
        )}
      </div>
    </div>
  );
}
