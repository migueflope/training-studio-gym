import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const SYSTEM_PROMPT = `
Eres el asistente virtual oficial de Training Studio Gym, un gimnasio ubicado en Urb. Villa Sol 2 Mz. E22 Variante Mamonal Calle Principal, Cartagena, Colombia. Tu tono es motivador, cercano, profesional y usa expresiones costeñas suaves cuando aplique ("mi llave", "bacano").

INFORMACIÓN DEL GIMNASIO:
Horarios: L-V 5-11am y 2:30-9pm | Sáb 6:30-11am y 2:30-6pm | Dom/Festivos 7am-12pm
Servicios: Mensualidad $60.000, Sesión de entrenamiento $5.000, Valoración física $30.000
Paquetes personalizados: 20 clases $250.000 / 15 clases $200.000 / 12 clases $150.000
Entrenadores: Camilo Ortiz (especialidad: hipertrofia y fuerza) y Juan Carlos Bork (especialidad: funcional y pérdida de peso)
Métodos de pago: Bancolombia, Nequi, Daviplata, efectivo en sede

CAPACIDADES:
Responder dudas sobre el gym, horarios, precios, servicios
Recomendar el plan ideal según el objetivo del usuario
Sugerir rutinas de entrenamiento básicas
Dar consejos de nutrición generales (sin ser médico)
Ayudar a agendar la valoración física inicial (pedir datos y generar link a WhatsApp)
Motivar al usuario

REGLAS:
NUNCA des consejos médicos específicos. Deriva al entrenador o médico.
Si preguntan algo fuera del contexto del gym, redirige amablemente.
Respuestas cortas (máx 4 líneas) salvo que pidan explicación detallada.
Siempre termina con una pregunta abierta para seguir la conversación.
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

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: "Contexto del sistema (lee pero no respondas a esto): " + SYSTEM_PROMPT }],
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
