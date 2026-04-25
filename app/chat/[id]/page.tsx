"use client";

import { useParams } from "next/navigation";
import { characters } from "@/lib/characters";
import { useState, useRef, useEffect } from "react";

export default function ChatPage() {
  const { id } = useParams();
  const character = characters.find((c) => c.id === id);
  
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (!character) return <div className="text-white p-10">Character not found</div>;

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { role: "user", content: input };
    const newMessages = [...messages, userMessage];
    
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          character,
        }),
      });

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.response },
      ]);
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col max-w-3xl mx-auto border-x border-slate-800">
      {/* Header */}
      <header className="p-6 border-b border-slate-800 bg-slate-900/50">
        <h1 className="text-2xl font-bold text-orange-500">
          Council of {character.name}
        </h1>
        <p className="text-sm text-slate-400">Seeking wisdom from the past...</p>
      </header>

      {/* Chat Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] p-4 rounded-2xl ${
              m.role === "user" 
              ? "bg-orange-600 text-white rounded-br-none" 
              : "bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-none"
            }`}>
              <p className="text-sm leading-relaxed">{m.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-800 p-4 rounded-2xl rounded-bl-none text-sm animate-pulse text-slate-400">
              {character.name} is considering your words...
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-slate-800 bg-slate-900">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder={`Ask ${character.name} for advice...`}
            disabled={isLoading}
            className="flex-1 p-3 bg-slate-950 border border-slate-700 rounded-xl focus:outline-none focus:border-orange-500 transition"
          />
          <button
            onClick={sendMessage}
            disabled={isLoading}
            className="px-6 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-slate-700 text-white font-bold rounded-xl transition"
          >
            {isLoading ? "..." : "Send"}
          </button>
        </div>
      </div>
    </main>
  );
}