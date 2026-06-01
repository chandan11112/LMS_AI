import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User, Loader2, Minimize2 } from "lucide-react";
import api from "../../utils/api";

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "assistant",
      content: "Hi! I'm LearnKro AI Assistant 🎓 How can I help you today? I can answer questions about courses, quizzes, and platform features.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { id: Date.now(), role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const conversationHistory = messages.slice(1).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const { data } = await api.post("/chatbot/chat", {
        message: userMessage.content,
        conversationHistory,
      });

      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: "assistant", content: data.reply },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: "assistant", content: "Sorry, I'm having trouble connecting. Please try again." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    "How do I enroll in a course?",
    "How does AI quiz work?",
    "How to track my progress?",
  ];

  return (
    <>
      {/* Chat window */}
      {isOpen && !isMinimized && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-50 w-80 sm:w-96 animate-slide-up">
          <div className="glass-dark rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col" style={{ height: "500px" }}>
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-700 to-primary-600 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">LearnKro Assistant</p>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    <p className="text-xs text-primary-200">Online</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setIsMinimized(true)} className="text-white/70 hover:text-white transition-colors">
                  <Minimize2 className="w-4 h-4" />
                </button>
                <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    msg.role === "assistant"
                      ? "bg-primary-600/30 text-primary-400"
                      : "bg-accent-500/30 text-accent-400"
                  }`}>
                    {msg.role === "assistant" ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>
                  <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                    msg.role === "assistant"
                      ? "bg-white/5 text-gray-200 rounded-tl-none"
                      : "bg-primary-600/80 text-white rounded-tr-none"
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-2">
                  <div className="w-7 h-7 rounded-xl bg-primary-600/30 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-primary-400" />
                  </div>
                  <div className="bg-white/5 px-3 py-2 rounded-2xl rounded-tl-none">
                    <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick prompts */}
            {messages.length === 1 && (
              <div className="px-4 pb-2 flex flex-wrap gap-1.5">
                {quickPrompts.map((p) => (
                  <button
                    key={p}
                    onClick={() => { setInput(p); }}
                    className="text-xs px-2.5 py-1.5 glass rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="p-3 border-t border-white/5">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Ask anything..."
                  className="input text-sm py-2"
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || isLoading}
                  className="w-10 h-10 bg-primary-600 hover:bg-primary-500 disabled:opacity-50 rounded-xl flex items-center justify-center transition-colors flex-shrink-0"
                >
                  <Send className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FAB button */}
      <button
        onClick={() => { setIsOpen(!isOpen); setIsMinimized(false); }}
        className="fixed bottom-6 right-4 sm:right-6 z-50 w-14 h-14 bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl shadow-2xl shadow-primary-600/40 flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-200"
      >
        {isOpen ? <X className="w-6 h-6 text-white" /> : <MessageCircle className="w-6 h-6 text-white" />}
        {!isOpen && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-dark-950 animate-pulse" />
        )}
      </button>
    </>
  );
}
