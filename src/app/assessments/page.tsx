// page.tsx or HiteAssessmentFlow.tsx
'use client';
import { useState } from 'react';
import StartScreen from '../components/StartScreen';
import Assessment from '../components/Assessment';

export default function HiteAssessmentFlow() {
  const [started, setStarted] = useState(false);

  return (
    <>
      {!started ? (
        <StartScreen onStart={() => setStarted(true)} />
      ) : (
        <Assessment />
      )}
    </>
  );
}
