import { useState, useEffect, useRef } from "react";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: number;
}

interface ChatWidgetProps {}

const ChatWidget: React.FC<ChatWidgetProps> = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (messagesEndRef.current && messagesContainerRef.current) {
      const scrollContainer = messagesContainerRef.current;
      const scrollToBottom = () => {
        scrollContainer.scrollTo({
          top: scrollContainer.scrollHeight,
          behavior: "smooth",
        });
      };

      const timeoutId = setTimeout(scrollToBottom, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [messages, isTyping]);

  useEffect(() => {
    const savedSessionId = localStorage.getItem("chatSessionId");
    if (savedSessionId) {
      setSessionId(savedSessionId);
      loadHistory(savedSessionId);
    }
  }, []);

  const loadHistory = async (sessionId: string) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "/api";
      const baseUrl = apiUrl.endsWith("/api")
        ? apiUrl
        : apiUrl.endsWith("/")
        ? `${apiUrl}api`
        : `${apiUrl}/api`;
      const response = await fetch(`${baseUrl}/chat/history/${sessionId}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (err) {
      console.error("Failed to load history:", err);
    }
  };

  const sendMessage = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) return;

    if (trimmedInput.length > 5000) {
      setError("Message is too long. Please keep it under 5000 characters.");
      return;
    }

    setError(null);
    const userMessage: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: trimmedInput,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setIsTyping(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "/api";
      const baseUrl = apiUrl.endsWith("/api")
        ? apiUrl
        : apiUrl.endsWith("/")
        ? `${apiUrl}api`
        : `${apiUrl}/api`;
      const response = await fetch(`${baseUrl}/chat/message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: trimmedInput,
          sessionId: sessionId || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send message");
      }

      const data = await response.json();

      if (!sessionId && data.sessionId) {
        setSessionId(data.sessionId);
        localStorage.setItem("chatSessionId", data.sessionId);
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: data.reply,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err: any) {
      setError(err.message || "Failed to send message. Please try again.");
      setMessages((prev) => prev.filter((m) => m.id !== userMessage.id));
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const exampleQuestions = [
    "What's your return policy?",
    "Do you ship to USA?",
    "What are your support hours?",
    "What payment methods do you accept?",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 backdrop-blur-sm">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-6 py-5 relative overflow-hidden">
            <div className="absolute inset-0 bg-black opacity-5"></div>
            <div className="relative flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg ring-2 ring-white/30">
                    <svg
                      className="w-7 h-7 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
                </div>
                <div>
                  <h2 className="text-white font-bold text-xl tracking-tight">
                    AI Support Agent
                  </h2>
                  <p className="text-white/90 text-sm font-medium">
                    We're here to help you!
                  </p>
                </div>
              </div>
              {isTyping && (
                <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                  <span className="text-white text-sm font-medium">
                    Agent is typing
                  </span>
                  <div className="flex space-x-1.5">
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce animate-delay-0"></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce animate-delay-150"></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce animate-delay-300"></div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Messages Area */}
          <div
            ref={messagesContainerRef}
            className="h-[600px] overflow-y-auto px-6 py-6 bg-gradient-to-b from-gray-50 to-white custom-scrollbar"
          >
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in">
                <div className="mb-8 relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full blur-2xl opacity-20 animate-pulse"></div>
                  <div className="relative w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-xl">
                    <svg
                      className="w-12 h-12 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  How can we help you today?
                </h3>
                <p className="text-gray-600 mb-8 text-lg max-w-md">
                  Ask me anything about our store, shipping, returns, or
                  support. I'm here 24/7 to assist you!
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-lg">
                  {exampleQuestions.map((question, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setInput(question);
                        inputRef.current?.focus();
                      }}
                      className="group text-left px-5 py-3.5 bg-white rounded-xl border-2 border-gray-200 hover:border-indigo-400 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-300 text-sm font-medium text-gray-700 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                    >
                      <div className="flex items-center space-x-2">
                        <svg
                          className="w-4 h-4 text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 7l5 5m0 0l-5 5m5-5H6"
                          />
                        </svg>
                        <span>{question}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                {messages.map((message, index) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender === "user"
                        ? "justify-end"
                        : "justify-start"
                    } animate-slide-in animate-delay-dynamic`}
                    ref={(el) => {
                      if (el) {
                        el.style.setProperty(
                          "--animation-delay",
                          `${index * 50}ms`
                        );
                      }
                    }}
                  >
                    {message.sender === "ai" && (
                      <div className="flex-shrink-0 mr-3 mt-1">
                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
                          <svg
                            className="w-5 h-5 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M6.343 6.343l-.707.707m12.728 0l-.707-.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                            />
                          </svg>
                        </div>
                      </div>
                    )}
                    <div
                      className={`max-w-[75%] rounded-2xl px-5 py-3 shadow-lg transition-all duration-200 hover:shadow-xl ${
                        message.sender === "user"
                          ? "bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-br-sm"
                          : "bg-white text-gray-800 border border-gray-100 rounded-bl-sm"
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                        {message.text}
                      </p>
                      <p
                        className={`text-xs mt-2 font-medium ${
                          message.sender === "user"
                            ? "text-white/70"
                            : "text-gray-400"
                        }`}
                      >
                        {new Date(message.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    {message.sender === "user" && (
                      <div className="flex-shrink-0 ml-3 mt-1">
                        <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center shadow-md">
                          <svg
                            className="w-5 h-5 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start animate-fade-in">
                    <div className="flex-shrink-0 mr-3 mt-1">
                      <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
                        <svg
                          className="w-5 h-5 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M6.343 6.343l-.707.707m12.728 0l-.707-.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="bg-white border-2 border-indigo-100 rounded-2xl rounded-bl-sm px-5 py-3 shadow-lg">
                      <div className="flex space-x-1.5">
                        <div className="w-2.5 h-2.5 bg-indigo-400 rounded-full animate-bounce animate-delay-0"></div>
                        <div className="w-2.5 h-2.5 bg-purple-400 rounded-full animate-bounce animate-delay-150"></div>
                        <div className="w-2.5 h-2.5 bg-pink-400 rounded-full animate-bounce animate-delay-300"></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="px-6 py-3 bg-gradient-to-r from-red-50 to-pink-50 border-t-2 border-red-200 animate-slide-down">
              <div className="flex items-center space-x-3 text-red-700 text-sm">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-red-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
                <span className="flex-1 font-medium">{error}</span>
                <button
                  onClick={() => setError(null)}
                  className="flex-shrink-0 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full p-1 transition-colors"
                  aria-label="Close error message"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="px-6 py-5 bg-white border-t border-gray-100">
            <div className="flex items-end space-x-3">
              <div className="flex-1 relative">
                <div className="absolute left-4 top-3.5 pointer-events-none">
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </div>
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  disabled={isLoading}
                  rows={1}
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 resize-none disabled:bg-gray-50 disabled:cursor-not-allowed transition-all duration-200 text-gray-700 placeholder-gray-400 shadow-sm hover:border-gray-300 textarea-auto-resize"
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = "auto";
                    target.style.height = `${Math.min(
                      target.scrollHeight,
                      120
                    )}px`;
                  }}
                />
              </div>
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className="px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:hover:scale-100"
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <span>Send</span>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-3 text-center">
              Press{" "}
              <kbd className="px-2 py-1 bg-gray-100 rounded text-gray-600 font-mono">
                Enter
              </kbd>{" "}
              to send,{" "}
              <kbd className="px-2 py-1 bg-gray-100 rounded text-gray-600 font-mono">
                Shift+Enter
              </kbd>{" "}
              for new line
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatWidget;
