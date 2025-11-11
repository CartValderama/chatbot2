/**
 * Chat API Route
 *
 * Håndterer chat-meldinger med Groq AI-integrasjon og function calling.
 *
 * Flyt:
 * 1. Validerer request (userId, message)
 * 2. Validerer session
 * 3. Lagrer brukermelding i database
 * 4. Henter chat-historikk
 * 5. Sender til Groq med function calling
 * 6. Eksekverer functions ved behov
 * 7. Lagrer bot-svar i database
 * 8. Returnerer respons
 */

import { NextRequest, NextResponse } from "next/server";
import { createServerClientWithAuth } from "@/api/supabaseServerClient";
import { groq, DEFAULT_MODEL, DEFAULT_PARAMS, SYSTEM_PROMPT } from "@/lib/groq/client";
import { getFunctionDefinitions } from "@/lib/groq/functions";
import { executeFunction } from "@/lib/groq/handlers";
import type { ChatRequest, ChatResponse, GroqMessage } from "@/lib/groq/types";
import type { ChatMessage } from "@/types/database";

export async function POST(request: NextRequest) {
  try {
    // 1. PARSE REQUEST BODY
    const body: ChatRequest = await request.json();
    const { userId, message } = body;

    // 2. VALIDERING - Request
    if (!userId || !message) {
      return NextResponse.json(
        {
          success: false,
          error: "userId og message er påkrevd",
        } as ChatResponse,
        { status: 400 }
      );
    }

    if (typeof userId !== "number" || typeof message !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "Ugyldig datatype for userId eller message",
        } as ChatResponse,
        { status: 400 }
      );
    }

    if (message.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Melding kan ikke være tom",
        } as ChatResponse,
        { status: 400 }
      );
    }

    // 3. VALIDERING - Session
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          success: false,
          error: "Manglende eller ugyldig authorization header",
        } as ChatResponse,
        { status: 401 }
      );
    }

    const accessToken = authHeader.substring(7); // Fjern "Bearer "
    const supabase = createServerClientWithAuth(accessToken);

    // Verifiser at session er gyldig
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: "Ugyldig eller utgått session",
        } as ChatResponse,
        { status: 401 }
      );
    }

    // 4. LAGRE BRUKERMELDING I DATABASE
    const { data: userMessage, error: userMessageError } = await supabase
      .from("chat_messages")
      .insert({
        user_id: userId,
        message_text: message,
        sender_type: "User",
        timestamp: new Date().toISOString(),
      })
      .select()
      .single();

    if (userMessageError) {
      console.error("Error saving user message:", userMessageError);
      return NextResponse.json(
        {
          success: false,
          error: "Kunne ikke lagre melding",
        } as ChatResponse,
        { status: 500 }
      );
    }

    // 5. HENT CHAT-HISTORIKK (siste 20 meldinger)
    const { data: chatHistory, error: historyError } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("user_id", userId)
      .order("timestamp", { ascending: true })
      .limit(20);

    if (historyError) {
      console.error("Error fetching chat history:", historyError);
      // Fortsett uten historikk
    }

    // 6. FORBERED GROQ REQUEST
    const messages: GroqMessage[] = [
      {
        role: "system",
        content: SYSTEM_PROMPT,
      },
    ];

    // Legg til chat-historikk (unntatt siste melding som allerede er med)
    if (chatHistory && chatHistory.length > 1) {
      for (let i = 0; i < chatHistory.length - 1; i++) {
        const msg = chatHistory[i] as ChatMessage;
        messages.push({
          role: msg.sender_type === "User" ? "user" : "assistant",
          content: msg.message_text,
        });
      }
    }

    // Legg til nåværende brukermelding
    messages.push({
      role: "user",
      content: message,
    });

    // 7. GROQ API CALL MED FUNCTION CALLING
    console.log(`[Chat API] Sending request to Groq for userId ${userId}`);

    const tools = getFunctionDefinitions();
    console.log("[Chat API] Available tools:", tools.length);
    console.log("[Chat API] Tools:", JSON.stringify(tools, null, 2));
    console.log("[Chat API] Last user message:", message);

    let groqResponse = await groq.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: messages,
      tools: tools,
      tool_choice: "auto",
      ...DEFAULT_PARAMS,
    });

    let assistantMessage = groqResponse.choices[0]?.message;

    // DEBUG: Log Groq response
    console.log("[Chat API] Groq response:", JSON.stringify({
      content: assistantMessage?.content,
      tool_calls: assistantMessage?.tool_calls,
      has_tool_calls: !!assistantMessage?.tool_calls
    }));

    // 8. PARSE TEXT-BASED FUNCTION CALLS (fallback for models that don't support proper tool_calls)
    // Some Groq models return <function=name></function> in text instead of tool_calls
    if (!assistantMessage?.tool_calls && assistantMessage?.content) {
      const functionMatches = assistantMessage.content.matchAll(/<function=(\w+)><\/function>/g);
      const parsedToolCalls = Array.from(functionMatches).map((match, index) => ({
        id: `call_${Date.now()}_${index}`,
        type: "function" as const,
        function: {
          name: match[1],
          arguments: "{}"
        }
      }));

      if (parsedToolCalls.length > 0) {
        console.log("[Chat API] Parsed text-based function calls:", parsedToolCalls);
        assistantMessage.tool_calls = parsedToolCalls;
        // Remove function tags from content
        assistantMessage.content = assistantMessage.content.replace(/<function=\w+><\/function>/g, "").trim();
      }
    }

    // 9. HÅNDTER FUNCTION CALLS (loop til vi får final svar)
    const maxIterations = 5;
    let iteration = 0;

    while (assistantMessage?.tool_calls && iteration < maxIterations) {
      iteration++;
      console.log(`[Chat API] Function calling iteration ${iteration}`);

      // Legg til assistant message med tool_calls til historikk
      messages.push(assistantMessage as GroqMessage);

      // Eksekverer alle function calls
      const toolResults = await Promise.all(
        assistantMessage.tool_calls.map(async (toolCall) => {
          const functionName = toolCall.function.name;
          console.log(`[Chat API] Executing function: ${functionName}`);

          // Eksekverer funksjonen
          const result = await executeFunction(functionName, userId);
          console.log(`[Chat API] Function ${functionName} returned:`, result.substring(0, 200));

          return {
            role: "tool" as const,
            content: result,
            tool_call_id: toolCall.id,
          };
        })
      );

      // Legg til function results til historikk
      console.log(`[Chat API] Adding ${toolResults.length} tool results to message history`);
      for (const result of toolResults) {
        messages.push(result as GroqMessage);
      }

      // Kall Groq igjen med function results
      console.log(`[Chat API] Calling Groq again with function results...`);
      groqResponse = await groq.chat.completions.create({
        model: DEFAULT_MODEL,
        messages: messages,
        tools: getFunctionDefinitions(),
        tool_choice: "auto",
        ...DEFAULT_PARAMS,
      });

      assistantMessage = groqResponse.choices[0]?.message;
      console.log(`[Chat API] Groq 2nd response:`, JSON.stringify({
        content: assistantMessage?.content?.substring(0, 200),
        has_tool_calls: !!assistantMessage?.tool_calls
      }));
    }

    // 9. EKSTRAHER FINAL SVAR
    const botResponseText = assistantMessage?.content || "Jeg kunne ikke generere et svar. Prøv igjen.";

    // 10. LAGRE BOT-SVAR I DATABASE
    const { data: botMessage, error: botMessageError } = await supabase
      .from("chat_messages")
      .insert({
        user_id: userId,
        message_text: botResponseText,
        sender_type: "Bot",
        timestamp: new Date().toISOString(),
      })
      .select()
      .single();

    if (botMessageError) {
      console.error("Error saving bot message:", botMessageError);
      // Returner likevel svaret til brukeren
    }

    // 11. RETURNER SUKSESS
    console.log(`[Chat API] Successfully processed message for userId ${userId}`);

    return NextResponse.json(
      {
        success: true,
        response: botResponseText,
        messageId: botMessage?.message_id,
      } as ChatResponse,
      { status: 200 }
    );

  } catch (error: any) {
    console.error("[Chat API] Fatal error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Intern serverfeil",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      } as ChatResponse,
      { status: 500 }
    );
  }
}
