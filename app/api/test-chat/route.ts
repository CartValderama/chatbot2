/**
 * TEST API ROUTE - Kan slettes etter testing
 *
 * Tester /api/chat endpoint med mock session
 *
 * Åpne: http://localhost:3000/api/test-chat?message=Hei&userId=1
 */

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const message = searchParams.get("message") || "Hva er mine medisiner?";
  const userId = searchParams.get("userId") || "1";

  try {
    // Simuler et chat API-kall
    // Merk: I produksjon må du ha en gyldig access token

    return NextResponse.json({
      info: "For å teste /api/chat, bruk følgende curl-kommando:",
      example: `
curl -X POST http://localhost:3000/api/chat \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \\
  -d '{"userId": ${userId}, "message": "${message}"}'
      `,
      note: "Du må først logge inn for å få en access token.",
      steps: [
        "1. Gå til http://localhost:3000/auth",
        "2. Logg inn med din bruker",
        "3. Åpne developer console (F12)",
        "4. Gå til Application > Local Storage > auth-storage",
        "5. Kopier 'access_token' fra session-objektet",
        "6. Bruk den i Authorization header",
      ],
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Ukjent feil",
      },
      { status: 500 }
    );
  }
}
