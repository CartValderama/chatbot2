/**
 * TypeScript types for Groq integration
 *
 * Defines types for:
 * - Function calling definitions
 * - API request/response formats
 * - Chat messages
 */

import type { ChatMessage } from "@/types/database";

// Groq function definition
export interface GroqFunction {
  name: string;
  description: string;
  parameters: {
    type: "object";
    properties: Record<string, unknown>;
    required?: string[];
  };
}

// Function execution result
export interface FunctionResult {
  name: string;
  content: string; // JSON string med resultat
}

// Chat API request
export interface ChatRequest {
  userId: number;
  message: string;
}

// Chat API response
export interface ChatResponse {
  success: boolean;
  response?: string;
  messageId?: number;
  error?: string;
}

// Groq message format (OpenAI-compatible)
export interface GroqMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  name?: string; // For tool results
  tool_calls?: GroqToolCall[];
}

// Groq tool call
export interface GroqToolCall {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string; // JSON string
  };
}

// Tool choice
export type ToolChoice = "none" | "auto" | "required";
