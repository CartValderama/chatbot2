import { create } from "zustand";
import { chatbotService } from "@/services/chatbotService";
import { useAuthStore } from './authStore';
import type { ChatMessage, SenderType } from "@/types/database";

interface ChatbotState {
  // Data
  messages: ChatMessage[];

  // Loading states
  isLoading: boolean;
  isSending: boolean;

  // Error state
  error: string | null;

  // Actions
  sendMessage: (userId: number, messageText: string) => Promise<boolean>;
  addMessage: (message: ChatMessage) => void;
  clearMessages: () => void;
  setError: (error: string | null) => void;
  loadMessages: (messages: ChatMessage[]) => void;
}

export const useChatbotStore = create<ChatbotState>((set, get) => ({
  // Initial state
  messages: [],
  isLoading: false,
  isSending: false,
  error: null,

  // Send a message and get AI response
  sendMessage: async (userId: number, messageText: string) => {
    set({ isSending: true, error: null });

    try {
      // Get valid session before making API calls
      const session = await useAuthStore.getState().getValidSession();
      if (!session) {
        console.warn('[ChatbotStore] No valid session available');
        set({
          isSending: false,
          error: 'Please log in to send messages',
        });
        return false;
      }

      // Create user message
      const userMessage: ChatMessage = {
        message_id: Date.now(), // Temporary ID
        user_id: userId,
        message_text: messageText,
        sender_type: "User" as SenderType,
        timestamp: new Date().toISOString(),
      };

      // Add user message to state
      set((state) => ({
        messages: [...state.messages, userMessage],
      }));

      // Analyze intent
      const intent = await chatbotService.analyzeIntent(messageText);

      // Get AI response
      const aiResult = await chatbotService.getAIResponse(
        messageText,
        get().messages
      );

      if (aiResult.success && aiResult.response) {
        // Create bot message
        const botMessage: ChatMessage = {
          message_id: Date.now() + 1, // Temporary ID
          user_id: userId,
          message_text: aiResult.response,
          sender_type: "Bot" as SenderType,
          timestamp: new Date().toISOString(),
          intent: intent,
        };

        // Add bot message to state
        set((state) => ({
          messages: [...state.messages, botMessage],
          isSending: false,
        }));

        return true;
      } else {
        // If AI fails, use fallback response
        const fallbackResponse = await chatbotService.generateHealthResponse(messageText);

        const botMessage: ChatMessage = {
          message_id: Date.now() + 1,
          user_id: userId,
          message_text: fallbackResponse,
          sender_type: "Bot" as SenderType,
          timestamp: new Date().toISOString(),
          intent: intent,
        };

        set((state) => ({
          messages: [...state.messages, botMessage],
          isSending: false,
        }));

        return true;
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      set({
        error: error instanceof Error ? error.message : "Failed to send message",
        isSending: false,
      });
      return false;
    }
  },

  // Add a message to state
  addMessage: (message: ChatMessage) => {
    set((state) => ({
      messages: [...state.messages, message],
    }));
  },

  // Clear all messages
  clearMessages: () => {
    set({ messages: [] });
  },

  // Set error
  setError: (error: string | null) => {
    set({ error });
  },

  // Load messages (e.g., from database or cache)
  loadMessages: (messages: ChatMessage[]) => {
    set({ messages });
  },
}));
