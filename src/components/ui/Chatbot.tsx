"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, Bot, User, Loader2 } from "lucide-react";
import { useDraggableButton } from "./DraggableButtonsContext";

type Message = {
  id: string;
  role: "user" | "model";
  text: string;
};

export function Chatbot({ hasProfile = false }: { hasProfile?: boolean }) {
  const pathname = usePathname();
  const draggable = useDraggableButton("chatbot");
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", role: "model", text: "¡Hola! Soy el asistente virtual de Training Studio Gym 💪 ¿En qué te puedo ayudar hoy?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const [tooltip, setTooltip] = useState<string | null>(null);

  const tooltips = [
    "¿Tienes dudas? Pregúntame 👇",
    "¿Ayuda con pagos? 💳",
    "¿Horarios del gym? 🕒",
    "¡Estoy aquí para ayudarte! 💪"
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Tooltip rotation logic
  useEffect(() => {
    if (isOpen) {
      setTooltip(null);
      return;
    }

    let tooltipIndex = 0;
    
    // Initial tooltip after 5 seconds
    const initialTimer = setTimeout(() => {
      setTooltip(tooltips[0]);
    }, 5000);

    // Rotate every 15 seconds
    const interval = setInterval(() => {
      tooltipIndex = (tooltipIndex + 1) % tooltips.length;
      setTooltip(tooltips[tooltipIndex]);
      
      // Auto-hide after 5 seconds
      setTimeout(() => setTooltip(null), 5000);
    }, 15000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [isOpen]);

  // Hide on the AuthWall (guests on the landing route) — it covers the
  // signup CTA on mobile and isn't useful before sign-in.
  if (!hasProfile && pathname === "/") return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput("");
    
    const newMessages: Message[] = [
      ...messages,
      { id: Date.now().toString(), role: "user", text: userMsg }
    ];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      // Format history for Gemini API
      const history = messages.slice(1).map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ history, message: userMsg })
      });

      const data = await res.json();
      
      if (res.ok) {
        setMessages(prev => [
          ...prev,
          { id: Date.now().toString(), role: "model", text: data.response }
        ]);
      } else {
        setMessages(prev => [
          ...prev,
          { id: Date.now().toString(), role: "model", text: "Ups, hubo un problema de conexión. Intenta de nuevo." }
        ]);
      }
    } catch (error) {
      setMessages(prev => [
        ...prev,
        { id: Date.now().toString(), role: "model", text: "Error de red. Verifica tu conexión." }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-4 md:right-8 w-[350px] h-[500px] z-50 bg-[#0a0a0a] border border-[#222] shadow-[0_0_40px_rgba(212,175,55,0.15)] rounded-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-[#111]/90 p-4 border-b border-[#222] flex justify-between items-center backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-transparent p-0 flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="https://jigwpntqxywjwruftwix.supabase.co/storage/v1/object/public/gym-media/logo-transparent.png" alt="GymBot" className="w-10 h-10 object-contain" />
                </div>
                <div>
                  <h3 className="font-bold text-sm leading-none text-white">GymBot</h3>
                  <span className="text-xs text-green-500 flex items-center gap-1 mt-1">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> En línea
                  </span>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0a0a0a]/50">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`flex gap-2 max-w-[85%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                    <div className={`w-8 h-8 rounded-full flex shrink-0 items-center justify-center mt-1 overflow-hidden ${msg.role === "user" ? "bg-accent" : "bg-black border border-primary/30"}`}>
                      {msg.role === "user" ? (
                        <User className="w-4 h-4 text-accent-foreground" />
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src="https://jigwpntqxywjwruftwix.supabase.co/storage/v1/object/public/gym-media/logo-transparent.png" alt="GymBot" className="w-7 h-7 object-contain" />
                      )}
                    </div>
                    <div className={`p-3 rounded-2xl text-sm ${msg.role === "user" ? "bg-accent text-accent-foreground rounded-tr-sm" : "bg-[#1a1a1a] text-white rounded-tl-sm border border-[#333]"}`}>
                      {msg.text}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex gap-2 max-w-[85%] flex-row">
                    <div className="w-8 h-8 rounded-full bg-black border border-primary/30 flex shrink-0 items-center justify-center mt-1 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="https://jigwpntqxywjwruftwix.supabase.co/storage/v1/object/public/gym-media/logo-transparent.png" alt="GymBot" className="w-7 h-7 object-contain" />
                    </div>
                    <div className="p-3 rounded-2xl bg-[#1a1a1a] border border-[#333] text-foreground rounded-tl-sm flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" />
                      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0.2s" }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0.4s" }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 bg-[#111] border-t border-[#222]">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Escribe un mensaje..."
                  className="flex-1 bg-black border border-[#333] text-white rounded-full px-4 py-2 text-sm focus:outline-none focus:border-primary transition-colors"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="w-10 h-10 rounded-full bg-primary text-black flex items-center justify-center hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100 shrink-0"
                >
                  <Send className="w-4 h-4 ml-0.5" />
                </button>
              </form>
              <div className="flex gap-2 mt-2 overflow-x-auto pb-1 scrollbar-hide">
                <button type="button" onClick={() => setInput("¿Qué plan me recomiendas?")} className="text-[10px] whitespace-nowrap bg-black border border-[#333] px-2 py-1 rounded-full text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                  ¿Qué plan me recomiendas?
                </button>
                <button type="button" onClick={() => setInput("Quiero agendar valoración")} className="text-[10px] whitespace-nowrap bg-black border border-[#333] px-2 py-1 rounded-full text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                  Quiero agendar valoración
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div 
        ref={draggable.ref}
        style={draggable.style}
        {...(draggable.dragHandlers ?? {})}
        className="fixed bottom-20 md:bottom-4 right-4 md:right-6 z-50 flex items-center justify-center"
      >
        <AnimatePresence>
          {tooltip && !isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              className="absolute bottom-full mb-4 right-0 px-4 py-2.5 bg-black/90 border border-primary/40 text-white text-xs font-semibold rounded-xl shadow-[0_0_20px_rgba(212,175,55,0.2)] cursor-pointer whitespace-nowrap flex flex-col items-center z-50"
              onClick={() => setIsOpen(true)}
            >
              {tooltip}
              {/* Downward pointing triangle */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-r-[8px] border-t-[8px] border-l-transparent border-r-transparent border-t-black drop-shadow-[0_2px_2px_rgba(212,175,55,0.5)]" />
              <div className="absolute -bottom-[9px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[9px] border-r-[9px] border-t-[9px] border-l-transparent border-r-transparent border-t-primary/50 -z-10" />
            </motion.div>
          )}
        </AnimatePresence>
        
        {!isOpen && (
          <motion.button
            onClick={() => setIsOpen(true)}
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            className="w-16 h-16 flex items-center justify-center hover:scale-110 transition-transform relative group drop-shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:drop-shadow-[0_0_30px_rgba(212,175,55,0.6)] cursor-pointer"
          >
            <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-[0_0_25px_rgba(212,175,55,0.7)] transition-transform group-hover:scale-110">
              <MessageSquare className="w-7 h-7 text-black fill-black" />
            </div>
          </motion.button>
        )}
      </div>
    </>
  );
}
