import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { getCmsContent } from "@/lib/cms";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const FALLBACK_SYSTEM_PROMPT = `
Eres el asistente virtual oficial de Training Studio Gym. Tu tono es motivador, cercano y profesional.
Responde dudas sobre horarios, precios y servicios. No des consejos médicos.
`;

export async function POST(req: Request) {
  try {
    const { history, message } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "API key no configurada. Revisa tu .env.local" },
        { status: 500 }
      );
    }

    const cms = await getCmsContent();
    const systemPrompt = cms.chatbot_system_prompt?.trim() || FALLBACK_SYSTEM_PROMPT;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: "Contexto del sistema (lee pero no respondas a esto): " + systemPrompt }],
        },
        {
          role: "model",
          parts: [{ text: "Entendido. Actuaré como el asistente virtual de Training Studio Gym." }],
        },
        ...history,
      ],
    });

    const result = await chat.sendMessage(message);
    const responseText = result.response.text();

    return NextResponse.json({ response: responseText });
  } catch (error) {
    console.error("Gemini Error:", error);
    return NextResponse.json(
      { error: "Hubo un error procesando tu solicitud." },
      { status: 500 }
    );
  }
}
