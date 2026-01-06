import { useState, useRef, useEffect } from "react";
import { useAuth, checkAuthStatus, type User } from "~/contexts/AuthContext";
import { redirect } from "react-router";
import { SideNavigation } from "~/components/navigation/SideNavigation";
import { BottomNavigation } from "~/components/navigation/BottomNavigation";

interface ChatMessage {
  id: string;
  type: "user" | "ai";
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

interface AIResponse {
  success: boolean;
  data: {
    session_id: string;
    response: string;
    sql_query: string;
    query_result: any;
    suggestions: string[];
  };
  message: string;
  code: number;
  timestamp: string;
}

// Client-side auth check
export async function clientLoader(): Promise<{ user: User | null }> {
  console.log("[ai-assistant clientLoader] Checking auth status");

  const user = await checkAuthStatus();

  if (!user) {
    console.log("[ai-assistant clientLoader] Not authenticated, redirecting to login");
    throw redirect("/login");
  }

  console.log("[ai-assistant clientLoader] Auth successful, returning user data");
  return { user };
}

// Run clientLoader on hydration
clientLoader.hydrate = true as const;

export default function AIAssistant() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  console.log("AIAssistant component rendered, user:", user);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    console.log("sendMessage called");
    console.log("Checking conditions:", {
      inputText: inputText,
      inputTextTrimmed: inputText.trim(),
      hasInputText: !!inputText.trim(),
      isLoading: isLoading,
      user: user,
      hasUser: !!user,
    });

    if (!inputText.trim()) {
      console.log("BLOCKED: No input text");
      return;
    }

    if (isLoading) {
      console.log("BLOCKED: Already loading");
      return;
    }

    if (!user) {
      console.log("WARNING: No user, but continuing anyway for testing");
      // Temporarily skip user check for testing
    }

    console.log("All checks passed, proceeding with message send...");

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "user",
      content: inputText.trim(),
      timestamp: new Date(),
    };

    console.log("Adding user message to state...");
    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsLoading(true);

    try {
      console.log("Making API request to:", "/api/v1/ai/chat");
      console.log("Request payload:", {
        message: userMessage.content,
        user_id: user?.id || "test_user_123",
      });

      const response = await fetch("/api/v1/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage.content,
          user_id: "93730b67-ed7e-45ce-9bf7-20f67c049a3a",
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const aiResponse: AIResponse = await response.json();

      if (aiResponse.success) {
        const aiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: "ai",
          content: aiResponse.data.response,
          timestamp: new Date(),
          suggestions: aiResponse.data.suggestions,
        };

        setMessages((prev) => [...prev, aiMessage]);
      } else {
        throw new Error(aiResponse.message || "AI response failed");
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: "Sorry, an error occurred while sending the message. Please try again later.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    console.log("Key pressed:", e.key, "shiftKey:", e.shiftKey);
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      console.log("Enter pressed, calling sendMessage");
      sendMessage();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputText(suggestion);
  };

  const handleSendClick = () => {
    console.log("Send button clicked!");
    sendMessage();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Side Navigation - Web only */}
      <SideNavigation />
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Main Content */}
        <div className="flex-1 pb-20 md:pb-0">
          <div className="flex flex-col h-full max-w-4xl mx-auto p-4">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                AI Financial Assistant
              </h1>
              <p className="text-gray-600">
                I'm your personal financial data analysis assistant. I can help you query income, expenses, assets, liabilities, and other financial information.
              </p>
            </div>

            <div className="flex-1 flex flex-col bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                  <div className="text-center py-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                      <svg
                        className="w-8 h-8 text-blue-600"
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
                    <p className="text-gray-500">Start chatting with the AI assistant!</p>
                  </div>
                )}

                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${message.type === "user"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-900"
                        }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p
                        className={`text-xs mt-1 ${message.type === "user"
                            ? "text-blue-100"
                            : "text-gray-500"
                          }`}
                      >
                        {message.timestamp.toLocaleTimeString()}
                      </p>

                      {message.suggestions &&
                        message.suggestions.length > 0 && (
                          <div className="mt-3 space-y-2">
                            <p className="text-xs text-gray-600 font-medium">
                              Suggested questions:
                            </p>
                            {message.suggestions.map((suggestion, index) => (
                              <button
                                key={index}
                                onClick={() =>
                                  handleSuggestionClick(suggestion)
                                }
                                className="block w-full text-left text-xs px-2 py-1 bg-white border border-gray-200 rounded hover:bg-gray-50 text-gray-700"
                              >
                                {suggestion}
                              </button>
                            ))}
                          </div>
                        )}
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-lg bg-gray-100">
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-500">
                          AI is thinking...
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="border-t border-gray-200 p-4">
                <div className="flex space-x-3">
                  <div className="flex-1">
                    <textarea
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Enter your question..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={1}
                      disabled={isLoading}
                    />
                  </div>
                  <button
                    onClick={handleSendClick}
                    disabled={!inputText.trim() || isLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Bottom Navigation - Mobile only */}
      <BottomNavigation />
    </div>
  );
}
