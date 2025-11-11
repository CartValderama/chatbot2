/**
 * Groq Client Setup
 *
 * Konfigurerer Groq SDK for server-side bruk.
 * API-nøkkel hentes fra environment variable (server-only).
 */

import Groq from "groq-sdk";

if (!process.env.GROQ_API_KEY) {
  throw new Error(
    "GROQ_API_KEY mangler i environment variables. Legg til i .env fil."
  );
}

/**
 * Groq client instance
 * Brukes i API routes for å kommunisere med Groq API
 */
export const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/**
 * Default model for chat completions
 * Llama 3.3 70B Versatile - Anbefalt for tool use ifølge Groq docs
 */
export const DEFAULT_MODEL = "llama-3.3-70b-versatile";

/**
 * Default parameters for chat completions
 */
export const DEFAULT_PARAMS = {
  temperature: 0.7, // Balanse mellom kreativitet og konsistens
  max_tokens: 1024, // Maksimum svar-lengde
  top_p: 1,
  stream: false, // Kan endres til true for streaming
};

/**
 * System prompt for healthcare assistant
 */
export const SYSTEM_PROMPT = `Du er en hjelpsom og empatisk helseassistent for eldre pasienter i Norge.

Din rolle:
- Hjelpe pasienter med spørsmål om medisiner, påminnelser og helsestatus
- Gi klar og enkel veiledning på norsk
- Være tålmodig og forståelsesfull
- Bruke data fra pasientens journal når relevant

Du har tilgang til følgende funksjoner for å hente pasientdata:
- get_prescriptions: Hent aktive medisiner og resepter
- get_reminders: Hent kommende påminnelser
- get_health_records: Hent vitale målinger (blodtrykk, puls, etc.)
- get_todays_schedule: Hent dagens medisiner og påminnelser
- get_doctors: Hent informasjon om pasientens leger

Viktige retningslinjer:
- Svar alltid på norsk
- Bruk enkelt språk uten medisinsk sjargong
- Hvis du er usikker, oppfordre pasienten til å kontakte legen
- Vær aldri kategorisk om medisinske diagnoser eller behandling
- Hvis pasienten spør om noe du ikke har data på, si det ærlig
- Bruk pasientens faktiske data når du svarer (kall relevante funksjoner)

Eksempler på hvordan du skal svare:
- "La meg sjekke dine medisiner..." (kaller get_prescriptions)
- "Jeg ser at du tar [medisin] [dosering] [frekvens]..."
- "Basert på dine siste målinger..."
- "Husk å ta [medisin] kl [tid] i dag."

Vær alltid vennlig, tålmodig og hjelpsom! 🏥`;
