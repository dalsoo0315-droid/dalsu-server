console.log("🔥 AI SERVICE LOADED 🔥");
import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";

// Use process.env.GEMINI_API_KEY as per guidelines
const ai = new GoogleGenAI({ apiKey: "AIzaSyDxzUEYZKHTPmMYBZpLIFskGeH9pxbbrVQ" });

export async function diagnosePlumbingIssueAI(symptoms: string, category: string, file: File | null) {
  console.log("Starting AI Diagnosis...", { category, symptoms, hasFile: !!file });
  
  let parts: any[] = [
    { text: `당신은 "달수배관케어"의 전문 배관 진단 AI 마스터입니다. 
    사용자가 제공한 증상과 사진/영상을 분석하여 전문적인 진단 결과와 예상 견적을 제공하세요.
    모든 답변은 한국어로 작성하세요.
    
    카테고리: ${category}
    증상 설명: ${symptoms}
    
    다음 JSON 형식으로 응답하세요:
    - possibleCauses: { cause: string, probability: number } 의 배열 (가장 유력한 원인부터)
    - estimatedPriceRange: { min: number, max: number } (단위: 원, 숫자로만)
    - urgencyLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" 중 하나
    - recommendedService: 추천하는 구체적인 서비스 명칭
    - advice: 사용자가 지금 바로 취할 수 있는 조치나 주의사항` }
  ];

  if (file) {
    try {
      console.log("Converting file to base64...");
      const base64Data = await fileToBase64(file);
      parts.push({
        inlineData: {
          mimeType: file.type,
          data: base64Data.split(',')[1]
        }
      });
      console.log("File conversion complete.");
    } catch (e) {
      console.error("File conversion failed:", e);
    }
  }

  try {
    console.log("Calling Gemini API...");
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            possibleCauses: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  cause: { type: Type.STRING, description: "고장 원인" },
                  probability: { type: Type.NUMBER, description: "확률 (0-100)" }
                },
                required: ["cause", "probability"]
              }
            },
            estimatedPriceRange: {
              type: Type.OBJECT,
              properties: {
                min: { type: Type.NUMBER, description: "최소 예상 비용" },
                max: { type: Type.NUMBER, description: "최대 예상 비용" }
              },
              required: ["min", "max"]
            },
            urgencyLevel: { type: Type.STRING, enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"] },
            recommendedService: { type: Type.STRING, description: "추천 서비스 명칭" },
            advice: { type: Type.STRING, description: "사용자 조언" }
          },
          required: ["possibleCauses", "estimatedPriceRange", "urgencyLevel", "recommendedService", "advice"]
        }
      }
    });

    console.log("AI Response received:", response.text);
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("AI Diagnosis Error:", error);
    // Fallback with more realistic data based on category
    return {
      possibleCauses: [{ cause: "현장 확인이 필요한 복합적 문제", probability: 100 }],
      estimatedPriceRange: { min: 50000, max: 150000 },
      urgencyLevel: "MEDIUM",
      recommendedService: "전문가 현장 정밀 진단",
      advice: "AI 분석 중 일시적인 지연이 발생했습니다. 정확한 견적을 위해 기사님 방문 점검을 권장드립니다."
    };
  }
}

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}

export async function getChatResponseAI(message: string) {
  try {
    const chat = ai.chats.create({
      model: "gemini-3-flash-preview",
      config: {
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        systemInstruction: "You are 'Dalsu AI', a helpful plumbing assistant for Dalsu Plumbing Care. Answer questions about plumbing, maintenance, and how to use the app. Be professional, friendly, and concise. If the user has a serious leak, advise them to book a professional service immediately.",
      },
    });

    const response = await chat.sendMessage({ message });
    return response.text;
  } catch (error) {
    console.error("Chat Error:", error);
    return "죄송합니다. 현재 상담이 원활하지 않습니다. 잠시 후 다시 시도해주세요.";
  }
}
