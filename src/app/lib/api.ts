// lib/api.ts
export const API_BASE = "https://dashboard-athena.space/api";

// 1. Создаём пользователя и сразу указываем team=1.
export async function createUser(payload: {
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  team?: number;
}) {
  const body = { ...payload, team: payload.team ?? 1 };
  const res = await fetch(`${API_BASE}/users/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    // если сервер вернул ошибку — кидаем объект с detail
    throw await res.json().catch(() => new Error(res.statusText));
  }
  return res.json(); // { id, email, … }
}

// 2. Берём оценки уже из состава команды №1
export async function getUserScores(userId: string) {
  const TEAM_ID = 1;
  const res = await fetch(`${API_BASE}/teams/${TEAM_ID}/`);
  if (!res.ok) throw new Error(`Status ${res.status}`);

  const team = await res.json();
  const uid = parseInt(userId, 10);
  const member = (team.members ?? []).find((m: any) => m.id === uid);

  if (!member) {
    console.error("Team payload:", team);
    throw new Error("Member not found in team.members");
  }
  if (!member.mentality) {
    console.error("Member payload:", member);
    throw new Error("Member.mentality not found");
  }

  // API возвращает composure, competitiveness, confidence, drive
  const { composure, competitiveness, confidence, drive } = member.mentality;
  return {
    composure_score:       Number(composure),
    competitiveness_score: Number(competitiveness),
    confidence_score:      Number(confidence),
    commitment_score:      Number(drive),  // мапим drive → commitment
    unlocked_level:        0,
  };
}