"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Arrow from "../../../public/arrow.svg";
import TransitCard from "./TransitCard";
import { useRouter } from "next/navigation";
import { ROUTES } from "../routes";

// Define an interface for better type safety and readability
interface Question {
  id: number;
  question: string;
  position: number;
  use_common_answer: boolean;
  // Use a union type for score_type if you have specific expected values,
  // otherwise, 'string' is fine for generic cases.
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
  const [questions, setQuestions] = useState<Question[]>([]); // Use Question interface
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [animate, setAnimate] = useState(true);
  const [textVisible, setTextVisible] = useState(true);
  const [fillPercentage, setFillPercentage] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({
    composure: 0,
    confidence: 0,
    competitiveness: 0,
    commitment: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // Added for better error display

  useEffect(() => {
    // при каждом переключении вопроса: сброс → включение анимации
    setAnimate(false);
    const timer = setTimeout(() => setAnimate(true), 50);
    return () => clearTimeout(timer);
  }, [selectedIndex]);

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

  useEffect(() => {
    const fetchHITEQuestions = async () => {
      setLoading(true);
      setError(null); // Clear previous errors
      try {
        const response = await fetch(
          "https://dashboard-athena.space/api/assessments/"
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const hite = data.results.find(
          (a: any) => a.name === "HITE Assessment"
        );

        if (hite && hite.questions && hite.questions.length > 0) {
          const sortedQuestions: Question[] = hite.questions.sort(
            (a: Question, b: Question) => a.position - b.position
          );
          setQuestions(sortedQuestions);
          // Reset fill percentage and scores on new assessment load
          setFillPercentage(0);
          setScores({
            composure: 0,
            confidence: 0,
            competitiveness: 0,
            commitment: 0,
          });
        } else {
          console.warn(
            "HITE Assessment or its questions not found in the fetched data. Showing error message."
          );
          setError(
            "HITE Assessment questions not found. Please check API data."
          );
        }
      } catch (e: any) {
        console.error("Error fetching assessments:", e);
        setError(`Failed to load assessment: ${e.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchHITEQuestions();
  }, []);

  // Centralized function to finalize assessment and navigate
  const finalizeAssessment = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("hiteScores", JSON.stringify(scores));
      // Assuming level 2 is the next step after HITE Assessment
    }

    localStorage.setItem("showDiscoverPopup", "true");
    localStorage.setItem("level", "1");
    router.push("/first-assessment");
  };

  const handleAnswer = async (choiceIndex: number) => {
    const currentQuestion = questions[selectedIndex];

    // Defensive check: ensure current question exists and has score_type
    if (
      !currentQuestion ||
      typeof currentQuestion.score_type === "undefined" ||
      currentQuestion.score_type === null
    ) {
      console.warn(
        `Question at index ${selectedIndex} is malformed or missing score_type. Skipping API submission and advancing locally.`
      );
      const nextIndexAfterSkip = selectedIndex + 1;
      if (nextIndexAfterSkip < questions.length) {
        setSelectedIndex(nextIndexAfterSkip);
        setFillPercentage(
          Math.floor((nextIndexAfterSkip / questions.length) * 100)
        );
      } else {
        finalizeAssessment(); // All questions processed (including skips), move to score page
      }
      return;
    }

    // --- NEW STRICTER SCORING LOGIC ---
    // The common answers are indexed 0-4:
    // 0: Strongly disagree
    // 1: Disagree
    // 2: Neutral
    // 3: Agree
    // 4: Strongly Agree

    let pointsForCurrentAnswer = 0;
    // Map choiceIndex to points (0, 1, or 2) to get scores into the 4-7 range
    if (choiceIndex === 2) {
      // Neutral
      pointsForCurrentAnswer = 1;
    } else if (choiceIndex === 3 || choiceIndex === 4) {
      // Agree or Strongly Agree
      pointsForCurrentAnswer = 2;
    }
    // Strongly Disagree (0) and Disagree (1) will implicitly get 0 points by this logic.

    // Apply reverse scoring if applicable
    // If reverse_scoring is true, and choiceIndex was high (e.g., Strongly Agree), it means a *low* score
    // So, we flip the points: max_points - current_points.
    // Max points per question is now 2 (Strongly Agree/Agree without reverse scoring).
    const scoreToApply = currentQuestion.reverse_scoring
      ? 2 - pointsForCurrentAnswer
      : pointsForCurrentAnswer;

    const updatedScores = {
      ...scores,
      [currentQuestion.score_type]:
        (scores[currentQuestion.score_type] ?? 0) + scoreToApply,
    };
    setScores(updatedScores);

    // --- Common answer enum mapping for API (unchanged) ---
    const commonAnswerMap = [
      "strong_disagree",
      "disagree",
      "neutral",
      "agree",
      "strong_agree",
    ];
    const commonAnswerForApi = currentQuestion.use_common_answer
      ? commonAnswerMap[choiceIndex]
      : null;

    // --- Get user ID from localStorage ---
    const userIdRaw = localStorage.getItem("userId");
    const userId = userIdRaw ? parseInt(userIdRaw, 10) : 0;

    if (isNaN(userId) || userId === 0) {
      console.error(
        "User ID not found in localStorage or is invalid. Cannot submit answer to API."
      );
      // Allow progression even if API submission fails due to missing user ID
    } else {
      try {
        const payload = {
          question: currentQuestion.id,
          answer: null, // HITE assessment uses common answers
          common_answer: commonAnswerForApi,
          user: userId,
        };

        const response = await fetch(
          "https://dashboard-athena.space/api/members-answers/",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              // You might need an Authorization header here if your API is protected
              // 'Authorization': `Bearer ${localStorage.getItem("authToken")}`,
            },
            body: JSON.stringify(payload),
          }
        );

        // Attempt to parse JSON response for detailed errors
        let responseData;
        try {
          responseData = await response.json();
        } catch (jsonError) {
          console.warn(
            "API response was not valid JSON, logging as text. Error:",
            jsonError
          );
          responseData = await response.text(); // Fallback to text
        }

        if (!response.ok) {
          console.error(
            "Failed to submit answer to API. Status:",
            response.status,
            "Details:",
            responseData
          );
          setError(
            `API submission error (Status: ${
              response.status
            }): ${JSON.stringify(responseData)}`
          );
        } else {
          console.log("Answer submitted successfully to API:", responseData);
        }
      } catch (error: any) {
        console.error("Network error or issue during API call:", error);
        setError(`Network error: ${error.message}`);
      }
    }

    // --- Progression logic (local state update and routing) ---
    const nextIndex = selectedIndex + 1;

    if (nextIndex >= questions.length) {
      finalizeAssessment(); // All questions answered, finalize and navigate
    } else {
      setSelectedIndex(nextIndex);
      setFillPercentage(Math.floor((nextIndex / questions.length) * 100));
    }
  };

  // --- UI Rendering ---
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

  // Handle case where HITE Assessment might not be found or has no questions
  if (questions.length === 0 && !loading) {
    return (
      <div className='absolute inset-0 flex flex-col items-center justify-center text-white mt-10 px-6'>
        <h1 className='mt-18 mb-10 font-bold text-[37px]'>
          No HITE Assessment Questions Found
        </h1>
        <p className='text-[14px] text-center text-white/80'>
          It looks like the HITE Assessment is unavailable. Please check the
          backend configuration or try again later.
        </p>
      </div>
    );
  }

  // This block handles the "You Did It" screen when all questions are processed locally
  if (selectedIndex >= questions.length) {
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

  const currentQuestion = questions[selectedIndex];

  // Defensive check for currentQuestion before rendering its properties
  if (!currentQuestion) {
    console.error(
      "currentQuestion is null/undefined during render. This should not happen if questions array is handled correctly."
    );
    return (
      <div className='absolute inset-0 flex items-center justify-center text-white text-2xl'>
        An unexpected display error occurred. Please refresh.
      </div>
    );
  }

  return (
    <div className='absolute inset-0 flex flex-col items-center text-white mt-10 px-6'>
      <div className='flex flex-col items-start'>
        <h1 className='mt-18 mb-10 flex items-start font-bold text-[24px]'>
          <Image
            src={Arrow}
            alt='Arrow'
            width={32}
            height={32}
            className='mr-4'
          />
          HITE Assessment
        </h1>

        <div className='w-[465px] h-[10px] mx-auto bg-white/10 rounded-[12px] overflow-hidden'>
          <div
            className='h-full bg-white transition-all duration-500 ease-in-out rounded-[12px]'
            style={{ width: `${fillPercentage}%` }}
          />
        </div>

        <div
          className={`mt-12 mb-12 w-[474px] h-[40px] transition-opacity duration-300 ease-in-out ${
            textVisible ? "opacity-100" : "opacity-0"
          }`}
          key={selectedIndex} // Можно ключем сменить для принудительного rerender
        >
          <p className='text-[20px] text-left'>
            {questions[selectedIndex]?.question}
          </p>
        </div>
      </div>

      <div className='space-y-4 flex flex-col'>
        {/* Render common answer buttons only if use_common_answer is true for the current question */}
        {currentQuestion.use_common_answer ? (
          [
            "Strongly disagree",
            "Disagree",
            "Neutral",
            "Agree",
            "Strongly agree",
          ].map((text, index) => (
            <button
              key={index}
              className='w-[480px] h-[60px] rounded-full bg-transparent border border-white/30 text-white text-[20px] fw-[500] transition duration-200 ease-in-out hover:bg-white/20'
              style={{
                background: "rgba(255, 255, 255, 0.04)",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                borderRadius: "30px",
              }}
              onClick={() => handleAnswer(index)}
            >
              {text}
            </button>
          ))
        ) : (
          <div className='text-white/70 text-center'>
            <p>
              This question requires a text answer. UI not implemented for text
              input.
            </p>
            <p className='mt-2 text-sm'>
              Please implement a text input and a submit button for question ID:{" "}
              {currentQuestion.id}.
            </p>
            <button
              className='w-[480px] h-[60px] rounded-full bg-blue-500/50 border border-blue-500/70 text-white text-[20px] fw-[500] transition duration-200 ease-in-out hover:bg-blue-600/50 mt-4'
              onClick={async () => {
                // Made async to await potential API call
                console.warn(
                  "Skipping text-based question submission as UI is not implemented."
                );
                const userIdRaw =
                  typeof window !== "undefined"
                    ? localStorage.getItem("userId")
                    : null;
                const userId = userIdRaw ? parseInt(userIdRaw, 10) : 0;

                if (userId !== 0) {
                  try {
                    const response = await fetch(
                      "https://dashboard-athena.space/api/members-answers/",
                      {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          question: currentQuestion.id,
                          answer: "N/A - Text input not handled by UI", // Placeholder answer
                          common_answer: null,
                          user: userId,
                        }),
                      }
                    );
                    if (!response.ok)
                      console.error(
                        "Failed to submit placeholder answer for text question."
                      );
                    else
                      console.log("Submitted placeholder for text question.");
                  } catch (err) {
                    console.error("Network error submitting placeholder:", err);
                  }
                } else {
                  console.warn(
                    "User ID missing, cannot submit placeholder answer for text question."
                  );
                }

                const nextIndex = selectedIndex + 1;
                if (nextIndex < questions.length) {
                  setSelectedIndex(nextIndex);
                  setFillPercentage(
                    Math.floor((nextIndex / questions.length) * 100)
                  );
                } else {
                  finalizeAssessment();
                }
              }}
            >
              Next Question (Skip Input)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
