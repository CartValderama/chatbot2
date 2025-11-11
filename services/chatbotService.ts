import type { ChatMessage } from "@/types/database";

/**
 * Chatbot Service
 * Handles message interactions and Groq AI integration via /api/chat endpoint
 */

export const chatbotService = {
  /**
   * Send a message to the AI and get a response
   * Calls our /api/chat endpoint which handles Groq integration with function calling
   */
  async getAIResponse(
    userId: number,
    userMessage: string,
    accessToken: string
  ): Promise<{ success: boolean; response?: string; messageId?: number; error?: string }> {
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          userId,
          message: userMessage,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API error: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        success: data.success,
        response: data.response,
        messageId: data.messageId,
      };
    } catch (error) {
      console.error("Error getting AI response:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get AI response",
      };
    }
  },

  /**
   * Load chat history from database for a specific user
   * This is used when user opens the chat to show previous conversation
   */
  async loadChatHistory(
    userId: number,
    accessToken: string
  ): Promise<{ success: boolean; messages?: ChatMessage[]; error?: string }> {
    try {
      // Use patientService to load chat messages
      const { patientService } = await import("@/services/patientService");
      const messages = await patientService.getChatMessages(userId);

      return {
        success: true,
        messages: messages || [],
      };
    } catch (error) {
      console.error("Error loading chat history:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to load chat history",
        messages: [],
      };
    }
  },

  /**
   * Analyze user intent from message
   * Can be enhanced with AI/NLP
   */
  async analyzeIntent(message: string): Promise<string> {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes("medication") || lowerMessage.includes("medicine") || lowerMessage.includes("pill")) {
      return "medication_query";
    }

    if (lowerMessage.includes("appointment") || lowerMessage.includes("doctor")) {
      return "appointment_query";
    }

    if (lowerMessage.includes("remind") || lowerMessage.includes("reminder")) {
      return "reminder_request";
    }

    if (lowerMessage.includes("hello") || lowerMessage.includes("hi") || lowerMessage.includes("hey")) {
      return "greeting";
    }

    if (lowerMessage.includes("help")) {
      return "help_request";
    }

    return "general_query";
  },

};
