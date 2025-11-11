# 🚀 Groq-implementering: Komplett Sjekkliste

> **Sist oppdatert**: 2025-11-10
> **Status**: 🎉 Nesten ferdig! - Fase 1-5 fullført ✅ (71% ferdig)
> **Mål**: Integrere Groq med function calling, database-tilgang og persistent chat-historikk

---

## 📊 Fremdrift

- **Fase 1 - Oppsett**: ✅ 6/6 fullført
- **Fase 2 - Database Setup**: ✅ 3/3 fullført
- **Fase 3 - Groq Function Calling**: ✅ 5/5 fullført
- **Fase 4 - API Route**: ✅ 6/6 fullført
- **Fase 5 - Frontend**: ✅ 5/5 fullført
- **Fase 6 - Testing**: 🔄 Klar for testing - se TESTING_GUIDE.md
- **Fase 7 - Deployment**: ⬜ 0/3 fullført

**Total fremdrift**: 25/35 oppgaver (71%)
**Status**: ✅ Implementasjon ferdig - Klar for manuell testing!

---

## Fase 1: Oppsett og Konfigurasjon ✅

### 1.1 Groq API Setup
- [x] **Opprett Groq-konto**
  - Gå til https://console.groq.com
  - Registrer konto eller logg inn
  - Verifiser e-post hvis nødvendig

- [x] **Generer API-nøkkel**
  - Naviger til API Keys-seksjonen
  - Klikk "Create API Key"
  - Gi den et navn (f.eks. "Healthcare Chatbot - Development")
  - Kopier nøkkelen (begynner med `gsk_`)
  - ⚠️ **VIKTIG**: Lagre nøkkelen trygt - den vises kun én gang

- [x] **Legg til environment variable**
  - Åpne `.env`-filen i rotmappen
  - Legg til: `GROQ_API_KEY=gsk_din_api_nøkkel_her`
  - ⚠️ **OBS**: IKKE bruk `NEXT_PUBLIC_` prefix (skal være server-only)
  - ✅ Konfigurert korrekt i `.env`

### 1.2 Dependencies
- [x] **Installer Groq SDK**
  ```bash
  npm install groq-sdk
  ```
  - ✅ Installert: groq-sdk v0.34.0

- [x] **Verifiser andre dependencies**
  - ✅ `@supabase/supabase-js` v2.76.1 installert
  - ✅ `zod` v4.1.12 installert

### 1.3 TypeScript Types
- [x] **Opprett `lib/groq/types.ts`**
  - ✅ Definer types for Groq function calling
  - ✅ Definer types for API request/response
  - ✅ Fil opprettet med alle nødvendige types

---

## Fase 2: Database og Server Setup ✅

### 2.1 Server-side Supabase Client
- [x] **Opprett `api/supabaseServerClient.ts`**
  - ✅ Konfigurer Supabase client for server-side bruk
  - ✅ IKKE bruk window.localStorage (finnes ikke på server)
  - ✅ Database type lagt til i types/database.ts

- [x] **Test server-side client**
  - ✅ Verifisert at den kan koble til Supabase
  - ✅ Testet queries via /api/test-db endpoint
  - ✅ 3 brukere funnet i database

### 2.2 Database-verifisering
- [x] **Sjekk chat_messages-tabell**
  - ✅ chat_messages tabell eksisterer
  - ✅ 4 meldinger funnet i tabellen
  - ✅ Alle kolonner verifisert:
    - ✅ `message_id` (primary key)
    - ✅ `user_id` (foreign key til users)
    - ✅ `message_text` (text)
    - ✅ `sender_type` (enum: "User" | "Bot")
    - ✅ `timestamp` (timestamp)
    - ✅ `intent` (text, nullable)
  - ✅ Join queries fungerer (prescriptions + medicines testet)

---

## Fase 3: Groq Function Calling Setup ✅

### 3.1 Function Definitions
- [x] **Opprett `lib/groq/functions.ts`**
  - ✅ Definer `get_prescriptions` function
  - ✅ Definer `get_reminders` function
  - ✅ Definer `get_health_records` function
  - ✅ Definer `get_todays_schedule` function
  - ✅ Definer `get_doctors` function
  - ✅ `getFunctionDefinitions()` helper-funksjon opprettet

### 3.2 Function Handlers
- [x] **Opprett `lib/groq/handlers.ts`**
  - ✅ `handleGetPrescriptions(userId)` - Henter aktive resepter med joins
  - ✅ `handleGetReminders(userId)` - Henter fremtidige påminnelser
  - ✅ `handleGetHealthRecords(userId)` - Henter siste 10 målinger
  - ✅ `handleGetTodaysSchedule(userId)` - Dagens oversikt
  - ✅ `handleGetDoctors(userId)` - Legeinfo fra users og prescriptions

- [x] **Implementer `executeFunction(functionName, userId)`**
  - ✅ Router til riktig handler
  - ✅ Error handling for ukjente funksjoner

### 3.3 Groq Client
- [x] **Opprett `lib/groq/client.ts`**
  - ✅ Groq SDK importert og konfigurert
  - ✅ API-nøkkel fra environment (GROQ_API_KEY)
  - ✅ DEFAULT_MODEL definert (llama-3.3-70b-versatile) - Oppdatert 2025-11-10
  - ⚠️ **VIKTIG**: mixtral-8x7b-32768 er dekommisjonert
  - ✅ DEFAULT_PARAMS konfigurert
  - ✅ SYSTEM_PROMPT for healthcare assistant

### 3.4 Testing av Functions
- [x] **Test hver function handler individuelt**
  - ✅ Test API route opprettet: `/api/test-functions`
  - ✅ Alle 5 function handlers testet
  - ✅ `executeFunction()` routing verifisert
  - ✅ Data returneres korrekt (eller tom liste når ingen data)

---

## Fase 4: API Route Implementering ✅

### 4.1 Opprett Chat Endpoint
- [x] **Opprett `app/api/chat/route.ts`**
  - ✅ POST handler definert
  - ✅ Eksportert som `POST` function
  - ✅ 290 linjer med komplett logikk

### 4.2 Request Validering
- [x] **Valider incoming request**
  - ✅ Parse request body (userId, message)
  - ✅ Type checking (number, string)
  - ✅ Sjekk at meldingen ikke er tom
  - ✅ Returner 400 Bad Request hvis ugyldig

### 4.3 Session Validering
- [x] **Verifiser bruker-session**
  - ✅ Hent access token fra Authorization header
  - ✅ Valider med Supabase `getUser()`
  - ✅ Returner 401 Unauthorized hvis invalid

### 4.4 Database-lagring (User Message)
- [x] **Lagre brukermelding i database**
  - ✅ INSERT til `chat_messages` tabell med riktig format
  - ✅ Error handling implementert
  - ✅ Returnerer message_id

### 4.5 Groq Integration
- [x] **Hent chat-historikk fra database**
  - ✅ SELECT siste 20 meldinger
  - ✅ Konverterer til Groq message-format
  - ✅ Håndterer tom historikk

- [x] **System prompt**
  - ✅ Bruker SYSTEM_PROMPT fra client.ts
  - ✅ Healthcare assistant-kontekst inkludert

- [x] **Kall Groq API med function calling**
  - ✅ Sender alle messages (system + history + current)
  - ✅ Inkluderer function definitions via `getFunctionDefinitions()`
  - ✅ Model: llama-3.3-70b-versatile (oppdatert fra mixtral-8x7b-32768)
  - ✅ Default parametere brukt

- [x] **Håndter function calls**
  - ✅ Loop-logikk implementert (max 5 iterasjoner)
  - ✅ Eksekverer alle tool_calls parallelt
  - ✅ Sender results tilbake til Groq
  - ✅ Henter endelig svar

### 4.6 Database-lagring (Bot Response)
- [x] **Lagre bot-svar i database**
  - ✅ INSERT til `chat_messages` tabell
  - ✅ Riktig format med sender_type: "Bot"
  - ✅ Returnerer message_id

### 4.7 Response
- [x] **Returner svar til frontend**
  - ✅ Success format: `{ success: true, response, messageId }`
  - ✅ Error format: `{ success: false, error }`
  - ✅ Detaljert logging for debugging

---

## Fase 5: Frontend-oppdateringer ✅

### 5.1 ChatbotService
- [x] **Oppdater `services/chatbotService.ts`**
  - ✅ `getAIResponse()` kaller nå `/api/chat` med userId og accessToken
  - ✅ Sender userId, message og Authorization header
  - ✅ Fjernet gamle placeholder-kode
  - ✅ Lagt til `loadChatHistory()` metode
  - ✅ Beholdt `analyzeIntent()` (kan være nyttig)

### 5.2 ChatbotStore - Load History
- [x] **Legg til `loadChatHistory()` i `stores/chatbotStore.ts`**
  - ✅ State: `isLoadingHistory: boolean` lagt til
  - ✅ Metode: `loadChatHistory(userId)` implementert
  - ✅ Kaller `chatbotService.loadChatHistory()`
  - ✅ Oppdaterer messages i state
  - ✅ Full error handling

### 5.3 ChatbotStore - Send Message
- [x] **Oppdater `sendMessage()` i `stores/chatbotStore.ts`**
  - ✅ Kaller `chatbotService.getAIResponse(userId, message, token)`
  - ✅ Optimistisk update: legger til user-melding umiddelbart
  - ✅ Legger til bot-svar når det kommer
  - ✅ Fjerner optimistisk melding ved feil

### 5.4 Chat Component
- [x] **Oppdater `components/chatbot/chat.tsx`**
  - ✅ Bruker `isLoadingHistory` fra store
  - ✅ Viser spinner mens historikk lastes
  - ✅ Fjernet fallback-warning om AI

### 5.5 Chatbot Page
- [x] **Oppdater `app/(patient)/chatbot/page.tsx`**
  - ✅ useEffect kaller `loadChatHistory(userId)` ved mount
  - ✅ Henter userId fra authStore.profile

---

## Fase 6: Testing og Debugging

### 6.1 Setup Testing
- [ ] **Opprett testbruker i database**
  - Hvis ikke finnes: Registrer ny bruker
  - Legg til testdata:
    - Minst 2 medisiner/resepter
    - Minst 2 påminnelser
    - Minst 1 helserecord
    - Minst 1 lege

### 6.2 Backend Testing
- [ ] **Test `/api/chat` endpoint direkte**
  - Bruk Postman eller curl
  - Test med gyldig session
  - Verifiser at meldinger lagres i DB
  - Verifiser at bot-svar returneres
  - Test function calling:
    - Send: "Hva er mine medisiner?"
    - Verifiser at `get_prescriptions` kalles
    - Sjekk at faktisk data returneres

- [ ] **Test hver function handler**
  - Test `get_prescriptions` - skal returnere reseptdata
  - Test `get_reminders` - skal returnere påminnelser
  - Test `get_health_records` - skal returnere helsedata
  - Test `get_todays_schedule` - skal returnere dagens oversikt
  - Test `get_doctors` - skal returnere legeinfo

### 6.3 Frontend Testing
- [ ] **Test chat-historikk lasting**
  - Logg inn som testbruker
  - Naviger til /chatbot
  - Verifiser at historikk vises (hvis det finnes tidligere meldinger)
  - Sjekk at loading-spinner vises

- [ ] **Test meldingssending**
  - Send testmelding: "Hei!"
  - Verifiser at brukermelding vises umiddelbart
  - Verifiser at bot-svar kommer tilbake
  - Sjekk at begge meldinger lagres i DB

- [ ] **Test function calling end-to-end**
  - Send: "Hva er mine medisiner?"
  - Verifiser at bot svarer med faktiske medisindata
  - Send: "Hva er mine påminnelser?"
  - Verifiser at bot svarer med faktiske påminnelser
  - Send: "Hvordan er mitt blodtrykk?"
  - Verifiser at bot svarer med helsedata

### 6.4 Historikk-testing
- [ ] **Test chat-historikk persistence**
  - Send flere meldinger i en session
  - Logg ut
  - Logg inn igjen
  - Verifiser at all historikk er tilgjengelig
  - Verifiser at Groq har tilgang til historikk (send oppfølgingsspørsmål)

### 6.5 Error Handling
- [ ] **Test error scenarios**
  - Test med ugyldig session (skal få 401)
  - Test med feil userId (skal få 403/401)
  - Test med tom melding (skal få 400)
  - Test når Groq API er nede (skal få feilmelding)

---

## Fase 7: Deployment og Produksjon

### 7.1 Environment Variables
- [ ] **Legg til i Vercel Dashboard**
  - Gå til Project Settings → Environment Variables
  - Legg til `GROQ_API_KEY` (production key)
  - Verifiser at Supabase-keys er til stede
  - Deploy på nytt for å aktivere

### 7.2 Production Testing
- [ ] **Test i produksjon**
  - Deploy til Vercel
  - Test alle funksjoner igjen i prod-miljø
  - Sjekk at function calling fungerer
  - Sjekk at historikk lagres

### 7.3 Monitoring
- [ ] **Sett opp basic monitoring**
  - Sjekk Vercel-logs for errors
  - Overvåk Groq API usage i console.groq.com
  - Sjekk Supabase database for chat_messages vekst

---

## 🎉 Ferdig!

Når alle oppgaver er krysset av, er Groq-integrasjonen komplett med:
- ✅ Intelligent AI-assistent med tilgang til pasientdata
- ✅ Function calling for dynamisk datahenting
- ✅ Persistent chat-historikk i database
- ✅ Sikker server-side implementering
- ✅ Sømløs brukeropplevelse

---

## 📝 Notater og Issues

### Issues funnet under implementering:
- (Legg til issues her etter hvert)

### Fremtidige forbedringer:
- [ ] Streaming responses for real-time typing-effekt
- [ ] Bedre intent-detection
- [ ] Mulighet for pasienter å slette chat-historikk
- [ ] Voice input/output
- [ ] Notifikasjoner basert på AI-anbefalinger
- [ ] Admin-dashboard for å se chat-statistikk

---

## 🔗 Ressurser

- **Groq Docs**: https://console.groq.com/docs
- **Groq Function Calling**: https://console.groq.com/docs/tool-use
- **Next.js API Routes**: https://nextjs.org/docs/app/building-your-application/routing/route-handlers
- **Supabase Server-side Auth**: https://supabase.com/docs/guides/auth/server-side
- **PROJECT_DOCUMENTATION.md**: Se rotmappen for komplett prosjektdokumentasjon
