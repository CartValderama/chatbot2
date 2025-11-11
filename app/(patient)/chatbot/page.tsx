"use client";

import { useAuth } from "@/hooks/useAuth";
import { useChatbotStore } from "@/stores/chatbotStore";
import { useEffect } from "react";
import { Chat } from "@/components/chatbot/chat";
import { Header } from "@/components/header";

export default function ChatbotPage() {
  const { profile, isLoading, isAuthorized } = useAuth("user");

  const { loadChatHistory, clearMessages } = useChatbotStore();

  useEffect(() => {
    // Load chat history when component mounts
    if (profile?.user_id) {
      loadChatHistory(profile.user_id);
    }

    // Cleanup messages when unmounting
    return () => {
      clearMessages();
    };
  }, [profile?.user_id, loadChatHistory, clearMessages]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAuthorized || !profile) {
    return null;
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Header
        variant="chatbot"
        userName={{
          firstName: profile.first_name || "",
          lastName: profile.last_name || "",
        }}
        userEmail={profile.email || ""}
      />

      {/* Chat Interface */}
      <main className="flex-1 max-w-4xl mx-auto w-full overflow-hidden">
        <div className="h-full">
          <Chat />
        </div>
      </main>
    </div>
  );
}
