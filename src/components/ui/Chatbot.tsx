"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, Bot, User, Loader2 } from "lucide-react";

type Message = {
  id: string;
  role: "user" | "model";
  text: string;
};

export function Chatbot() {
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

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

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
            className="fixed bottom-24 right-4 md:right-8 w-[350px] h-[500px] z-50 bg-card border border-border shadow-[0_0_40px_rgba(212,175,55,0.15)] rounded-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-secondary/80 p-4 border-b border-border flex justify-between items-center backdrop-blur-md">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm leading-none">Training IA</h3>
                  <span className="text-xs text-success flex items-center gap-1 mt-1">
                    <span className="w-2 h-2 rounded-full bg-success animate-pulse" /> En línea
                  </span>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background/50">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`flex gap-2 max-w-[85%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                    <div className={`w-6 h-6 rounded-full flex shrink-0 items-center justify-center mt-1 ${msg.role === "user" ? "bg-accent text-accent-foreground" : "bg-primary text-primary-foreground"}`}>
                      {msg.role === "user" ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                    </div>
                    <div className={`p-3 rounded-2xl text-sm ${msg.role === "user" ? "bg-accent text-accent-foreground rounded-tr-sm" : "bg-secondary text-foreground rounded-tl-sm"}`}>
                      {msg.text}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex gap-2 max-w-[85%] flex-row">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex shrink-0 items-center justify-center mt-1">
                      <Bot className="w-3 h-3" />
                    </div>
                    <div className="p-3 rounded-2xl bg-secondary text-foreground rounded-tl-sm flex items-center gap-1">
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
            <div className="p-3 bg-secondary/30 border-t border-border">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Escribe un mensaje..."
                  className="flex-1 bg-background border border-border rounded-full px-4 py-2 text-sm focus:outline-none focus:border-primary transition-colors"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100 shrink-0"
                >
                  <Send className="w-4 h-4 ml-0.5" />
                </button>
              </form>
              <div className="flex gap-2 mt-2 overflow-x-auto pb-1 scrollbar-hide">
                <button type="button" onClick={() => setInput("¿Qué plan me recomiendas?")} className="text-[10px] whitespace-nowrap bg-background border border-border px-2 py-1 rounded-full text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                  ¿Qué plan me recomiendas?
                </button>
                <button type="button" onClick={() => setInput("Quiero agendar valoración")} className="text-[10px] whitespace-nowrap bg-background border border-border px-2 py-1 rounded-full text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                  Quiero agendar valoración
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-24 md:bottom-6 right-4 md:right-8 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-[0_0_20px_rgba(212,175,55,0.4)] flex items-center justify-center z-50 hover:scale-110 transition-transform hover:shadow-[0_0_30px_rgba(212,175,55,0.6)]"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </button>
    </>
  );
}
