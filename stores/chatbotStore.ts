import { create } from "zustand";
import { chatbotService } from "@/services/chatbotService";
import { useAuthStore } from './authStore';
import type { ChatMessage, SenderType } from "@/types/database";

interface ChatbotState {
  // Data
  messages: ChatMessage[];

  // Loading states
  isLoading: boolean;
  isLoadingHistory: boolean;
  isSending: boolean;

  // Error state
  error: string | null;

  // Actions
  loadChatHistory: (userId: number) => Promise<boolean>;
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
  isLoadingHistory: false,
  isSending: false,
  error: null,

  // Load chat history from database
  loadChatHistory: async (userId: number) => {
    set({ isLoadingHistory: true, error: null });

    try {
      const session = await useAuthStore.getState().getValidSession();
      if (!session) {
        console.warn('[ChatbotStore] No valid session for loading history');
        set({ isLoadingHistory: false, error: 'Please log in to view chat history' });
        return false;
      }

      const result = await chatbotService.loadChatHistory(userId, session.access_token);

      if (result.success && result.messages) {
        set({ messages: result.messages, isLoadingHistory: false });
        return true;
      } else {
        set({ isLoadingHistory: false, error: result.error || 'Failed to load history' });
        return false;
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
      set({
        isLoadingHistory: false,
        error: error instanceof Error ? error.message : 'Failed to load history',
      });
      return false;
    }
  },

  // Send a message and get AI response
  sendMessage: async (userId: number, messageText: string) => {
    set({ isSending: true, error: null });

    try {
      // Get valid session
      const session = await useAuthStore.getState().getValidSession();
      if (!session) {
        console.warn('[ChatbotStore] No valid session available');
        set({
          isSending: false,
          error: 'Please log in to send messages',
        });
        return false;
      }

      // Add user message optimistically (will be replaced by DB version)
      const tempUserMessage: ChatMessage = {
        message_id: Date.now(),
        user_id: userId,
        message_text: messageText,
        sender_type: "User" as SenderType,
        timestamp: new Date().toISOString(),
      };

      set((state) => ({
        messages: [...state.messages, tempUserMessage],
      }));

      // Call API - it handles everything (saving user msg, calling Groq, saving bot response)
      const aiResult = await chatbotService.getAIResponse(
        userId,
        messageText,
        session.access_token
      );

      if (aiResult.success && aiResult.response) {
        // Add bot message to state
        const botMessage: ChatMessage = {
          message_id: aiResult.messageId || Date.now() + 1,
          user_id: userId,
          message_text: aiResult.response,
          sender_type: "Bot" as SenderType,
          timestamp: new Date().toISOString(),
        };

        set((state) => ({
          messages: [...state.messages, botMessage],
          isSending: false,
        }));

        return true;
      } else {
        // Remove optimistic message on error
        set((state) => ({
          messages: state.messages.filter((msg) => msg.message_id !== tempUserMessage.message_id),
          isSending: false,
          error: aiResult.error || 'Failed to get AI response',
        }));
        return false;
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to send message',
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
