import { DiagnosisResult } from '../types';

const API_BASE_URL = '';

export async function diagnosePlumbingIssueAI(
  symptoms: string,
  category: string,
  file?: File | null
): Promise<DiagnosisResult> {
  const formData = new FormData();
  formData.append('symptoms', symptoms);
  formData.append('category', category);

  if (file) {
    formData.append('file', file);
  }

  const res = await fetch(`${API_BASE_URL}/api/ai/diagnose`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => '');
    throw new Error(errorText || `AI 진단 요청 실패: ${res.status}`);
  }

  return res.json();
}

export async function getChatResponseAI(
  message: string,
  history: { role: 'user' | 'ai'; text: string }[] = []
): Promise<string> {
  const res = await fetch(`${API_BASE_URL}/api/ai/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message, history }),
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => '');
    throw new Error(errorText || `AI 채팅 요청 실패: ${res.status}`);
  }

  const data = await res.json();
  return data.response;
}