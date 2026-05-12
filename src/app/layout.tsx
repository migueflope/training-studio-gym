import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Chatbot } from "@/components/ui/Chatbot";
import { AuthModalProvider } from "@/components/auth/AuthModalProvider";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-body",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

const SITE_URL = "https://trainingstudio.com.co";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Training Studio Gym | Cartagena",
  description:
    "Entrena la mente. Transforma el cuerpo. Gimnasio premium en Cartagena con entrenamiento personalizado y rutinas inteligentes asistidas por IA.",
  keywords:
    "gimnasio en Cartagena, gym Mamonal, entrenamiento personalizado Cartagena, Training Studio Gym",
  openGraph: {
    type: "website",
    locale: "es_CO",
    url: SITE_URL,
    siteName: "Training Studio Gym",
    title: "Training Studio Gym | Cartagena",
    description:
      "Entrena la mente. Transforma el cuerpo. Gimnasio premium en Cartagena con entrenamiento personalizado y rutinas inteligentes asistidas por IA.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Training Studio Gym | Cartagena",
    description:
      "Entrena la mente. Transforma el cuerpo. Gimnasio premium en Cartagena.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark scroll-smooth">
      <body className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} font-body min-h-screen bg-background text-foreground antialiased overflow-x-hidden selection:bg-primary selection:text-primary-foreground`}>
        <AuthModalProvider>
          {children}
          <Chatbot />
        </AuthModalProvider>
      </body>
    </html>
  );
}
