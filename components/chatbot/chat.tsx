"use client";

import { useState, useRef, useEffect } from "react";
import { useChatbotStore } from "@/stores/chatbotStore";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export function Chat() {
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { messages, isSending, isLoadingHistory, error, sendMessage } = useChatbotStore();
  const { profile } = useAuthStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputMessage.trim()) {
      toast.error("Please enter a message");
      return;
    }

    if (!profile?.user_id) {
      toast.error("Please log in to send messages");
      return;
    }

    const messageText = inputMessage.trim();
    setInputMessage("");

    const success = await sendMessage(profile.user_id, messageText);

    if (!success) {
      toast.error("Failed to send message. Please try again.");
    }

    // Keep focus on input after sending
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-6">
        {isLoadingHistory ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-sm text-gray-500">Loading chat history...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <svg
              className="w-16 h-16 text-gray-400 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Welcome to CareBuddy
            </h3>
            <p className="text-sm text-gray-500 max-w-md">
              I&apos;m here to help you with medication reminders, appointments,
              and health questions. How can I assist you today?
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.message_id}
              className={`flex gap-3 ${
                message.sender_type === "User" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[55%] rounded-2xl px-5 py-4 ${
                  message.sender_type === "User"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-900"
                }`}
              >
                {message.intent === "medication_reminder" && (
                  <div className="flex items-center gap-2 mb-2">
                    <svg
                      className="w-5 h-5 text-yellow-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                    </svg>
                    <span className="font-semibold text-base">
                      Medication Reminder:
                    </span>
                  </div>
                )}
                <p className="text-base whitespace-pre-wrap leading-relaxed">
                  {message.message_text}
                </p>
                <p
                  className={`text-xs mt-2 ${
                    message.sender_type === "User"
                      ? "text-blue-100"
                      : "text-gray-500"
                  }`}
                >
                  {new Date(message.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t bg-white p-6">
        <form
          onSubmit={handleSendMessage}
          className="flex gap-3 items-center max-w-6xl mx-auto"
        >
          <Input
            ref={inputRef}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={`Type a message to ${
              profile?.first_name || "your"
            } caregiver...`}
            disabled={isSending}
            className="flex-1 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 h-14 text-lg px-5"
            autoFocus
          />
          <Button
            type="button"
            variant="outline"
            className="px-6 py-4 h-14 rounded-lg border-gray-300 hover:bg-gray-50 text-base"
            disabled={isSending}
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
              />
            </svg>
            Voice
          </Button>
          <Button
            type="submit"
            disabled={isSending || !inputMessage.trim()}
            className="px-8 py-4 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </Button>
        </form>
      </div>
    </div>
  );
}
