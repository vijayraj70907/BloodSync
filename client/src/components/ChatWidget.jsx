import { useState, useRef, useEffect } from "react";
import api from "../api/axios";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi! I'm BloodSync AI. Ask me anything about blood donation, compatibility, or how BloodSync works.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("open-chat", handler);
    return () => window.removeEventListener("open-chat", handler);
  }, []);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMessage = input.trim();
    setInput("");
    const updatedMessages = [
      ...messages,
      { role: "user", content: userMessage },
    ];
    setMessages(updatedMessages);
    setLoading(true);
    try {
      const history = updatedMessages.slice(1, -1).map((m) => ({
        role: m.role,
        content: m.content,
      }));
      const { data } = await api.post("/chat", {
        message: userMessage,
        history,
      });
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, something went wrong. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickQuestions = [
    "Who can donate O−?",
    "How often can I donate?",
    "Am I eligible to donate?",
  ];

  return (
    <>
      <style>{`
        @keyframes chatbotFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-7px); }
        }
        .chat-fab-img {
          width: 96px;
          height: 96px;
          object-fit: contain;
          filter: drop-shadow(0 6px 18px rgba(0,0,0,0.28));
          animation: chatbotFloat 3s ease-in-out infinite;
          transition: transform 0.2s ease, filter 0.2s ease, opacity 0.2s ease;
        }
        .chat-fab-img:hover {
          transform: scale(1.1);
          filter: drop-shadow(0 10px 28px rgba(204,0,0,0.4));
          animation: none;
        }
        .chat-fab-img.is-open {
          opacity: 0.65;
          animation: none;
        }
        .chat-fab-img.is-open:hover {
          opacity: 0.9;
          transform: scale(1.05);
        }
      `}</style>

      {open && (
        <div
          className="fixed bottom-28 right-6 w-80 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 flex flex-col overflow-hidden"
          style={{ height: "420px" }}
        >
          <div className="bg-red-600 px-4 py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <div>
                <div className="text-white font-semibold text-sm">BloodSync AI</div>
                <div className="text-red-200 text-xs">Ask me anything</div>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-red-200 hover:text-white text-xl leading-none"
            >
              ×
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] px-3 py-2 rounded-xl text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-red-600 text-white rounded-br-sm"
                      : "bg-gray-100 text-gray-800 rounded-bl-sm"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 px-3 py-2 rounded-xl rounded-bl-sm">
                  <div className="flex gap-1 items-center h-4">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {messages.length === 1 && (
            <div className="px-3 pb-2 flex flex-wrap gap-1.5 flex-shrink-0">
              {quickQuestions.map((q) => (
                <button
                  key={q}
                  onClick={() => setInput(q)}
                  className="text-xs bg-red-50 text-red-600 border border-red-200 px-2.5 py-1 rounded-full hover:bg-red-100 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          <div className="px-3 py-2 border-t border-gray-200 flex gap-2 flex-shrink-0">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question..."
              className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-red-400"
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
            >
              Send
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        style={{
          position: "fixed",
          bottom: 16,
          right: 16,
          width: 96,
          height: 96,
          background: "transparent",
          border: "none",
          cursor: "pointer",
          zIndex: 200,
          padding: 0,
          borderRadius: "50%",
        }}
      >
        <img
          src="/chatbot.png"
          alt="Chat"
          className={`chat-fab-img ${open ? "is-open" : ""}`}
        />
      </button>
    </>
  );
}