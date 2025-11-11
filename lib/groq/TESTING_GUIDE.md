# 🧪 Groq-integrasjon: Testing Guide

> **Opprettet**: 2025-11-10
> **Formål**: Manuell testing av Groq-integrasjonen med function calling og database-tilgang

---

## 📋 Pre-requisites (Sjekket ✅)

- ✅ Server kjører på http://localhost:3000
- ✅ Database har 3 brukere
- ✅ Database har 4 meldinger i chat_messages
- ✅ Alle tabeller og relasjoner fungerer
- ✅ Groq API-nøkkel konfigurert i .env

---

## 🎯 Testing Fase 6: End-to-End Testing

### Test 1: Login og Tilgang ✅

**Steg**:
1. Åpne http://localhost:3000/auth i browseren
2. Logg inn med en eksisterende bruker (eller opprett ny)
3. Verifiser at du blir redirectet til riktig dashboard

**Forventet resultat**:
- User → `/chatbot` eller `/patient-dashboard`
- Admin → `/admin-dashboard`

**Status**: ⬜ Ikke testet

---

### Test 2: Chat-historikk Lasting

**Steg**:
1. Naviger til http://localhost:3000/chatbot
2. Observer at chat-vinduet vises
3. Sjekk om historiske meldinger lastes (hvis du har sendt meldinger tidligere)

**Forventet resultat**:
- Viser loading-spinner først
- Deretter vises tidligere meldinger (hvis de finnes)
- Eller tom tilstand med velkomstmelding

**Indikatorer for suksess**:
- Developer Console (F12) viser ingen errors
- Network-tab viser ingen feilede requests
- Meldinger vises i riktig rekkefølge

**Status**: ⬜ Ikke testet

---

### Test 3: Send Enkel Melding (Uten Function Calling)

**Steg**:
1. Skriv en enkel hilsen: "Hei!"
2. Klikk "Send"
3. Observer responstid og svar

**Forventet resultat**:
- Brukermelding vises umiddelbart (optimistisk update)
- Bot-svar kommer tilbake innen 2-5 sekunder
- Bot-svar er på norsk og vennlig

**Debugging**:
- Åpne Developer Console (F12) → Network-tab
- Finn POST-request til `/api/chat`
- Sjekk:
  - Request payload: `{ userId: X, message: "Hei!" }`
  - Response: `{ success: true, response: "...", messageId: X }`
  - Status code: 200

**Status**: ⬜ Ikke testet

---

### Test 4: Function Calling - get_prescriptions

**Steg**:
1. Send melding: "Hva er mine medisiner?"
2. Observer bot-respons

**Forventet resultat**:
- Bot svarer basert på faktiske resepter fra databasen
- Hvis ingen resepter: "Ingen aktive resepter funnet"
- Hvis resepter finnes: Lister opp medisinene med dosering

**Hvordan verifisere function calling**:
1. Åpne Developer Console → Console-tab
2. Se etter log-meldinger:
   ```
   [Chat API] Sending request to Groq for userId X
   [Chat API] Function calling iteration 1
   [Chat API] Executing function: get_prescriptions
   [Chat API] Successfully processed message
   ```

**Debugging hvis feil**:
- Sjekk Network-tab for `/api/chat` request
- Response vil inneholde error-melding hvis noe feiler
- Sjekk Console for error logs

**Status**: ⬜ Ikke testet

---

### Test 5: Function Calling - get_reminders

**Steg**:
1. Send melding: "Hva er mine påminnelser?"
2. Observer bot-respons

**Forventet resultat**:
- Bot svarer basert på faktiske påminnelser fra databasen
- Hvis ingen: "Ingen kommende påminnelser funnet"
- Hvis finnes: Lister opp påminnelser med tid

**Status**: ⬜ Ikke testet

---

### Test 6: Function Calling - get_health_records

**Steg**:
1. Send melding: "Hvordan er mitt blodtrykk?"
2. Observer bot-respons

**Forventet resultat**:
- Bot svarer basert på faktiske helsemålinger
- Hvis ingen data: "Ingen helsedata funnet"
- Hvis data finnes: Presenterer siste målinger

**Status**: ⬜ Ikke testet

---

### Test 7: Function Calling - get_doctors

**Steg**:
1. Send melding: "Hvem er legen min?"
2. Observer bot-respons

**Forventet resultat**:
- Bot svarer basert på primary_doctor_id
- Hvis ingen lege: "Ingen legeinfo funnet"
- Hvis lege finnes: Viser lege-info

**Status**: ⬜ Ikke testet

---

### Test 8: Function Calling - get_todays_schedule

**Steg**:
1. Send melding: "Hva skal jeg gjøre i dag?"
2. Observer bot-respons

**Forventet resultat**:
- Bot kombinerer dagens påminnelser og medisiner
- Gir oversikt over dagens plan

**Status**: ⬜ Ikke testet

---

### Test 9: Conversation History (Kontekst)

**Steg**:
1. Send melding: "Hva er mine medisiner?"
2. Vent på svar
3. Send oppfølgingsspørsmål: "Når skal jeg ta dem?"

**Forventet resultat**:
- Bot husker kontekst fra forrige melding
- Svarer basert på medisiner diskutert i forrige svar
- Ikke trenger å spørre om medisinene igjen

**Status**: ⬜ Ikke testet

---

### Test 10: Error Handling - Ugyldig Session

**Steg**:
1. Åpne Developer Console → Application → Local Storage
2. Finn `auth-storage` og endre `expires_at` til fortiden
3. Prøv å sende melding

**Forventet resultat**:
- Får error-melding om utgått session
- Blir redirected til login
- Eller får beskjed om å logge inn igjen

**Status**: ⬜ Ikke testet

---

### Test 11: Performance - Responstid

**Steg**:
1. Send 5 forskjellige meldinger (med og uten function calling)
2. Mål responstid for hver

**Forventet resultat**:
- Enkle meldinger: < 3 sekunder
- Med 1 function call: 3-5 sekunder
- Med multiple function calls: 5-8 sekunder

**Status**: ⬜ Ikke testet

---

### Test 12: Database Persistence

**Steg**:
1. Send en melding
2. Logg ut
3. Logg inn igjen
4. Naviger til chatbot
5. Verifiser at meldingen fortsatt er der

**Forventet resultat**:
- All chat-historikk er persistent
- Meldinger vises i samme rekkefølge

**Status**: ⬜ Ikke testet

---

## 🐛 Debugging Tips

### Vanlige Problemer og Løsninger

#### Problem: "Session expired" error
**Løsning**:
- Session er utgått eller ugyldig
- Logg ut og inn igjen
- Sjekk at Supabase credentials er riktige i `.env`

#### Problem: Bot svarer ikke
**Løsning**:
- Sjekk Developer Console for errors
- Verifiser at GROQ_API_KEY er satt i `.env`
- Sjekk Network-tab for feilede requests
- Se på server-console for backend-errors

#### Problem: Function calling fungerer ikke
**Løsning**:
- Sjekk Console-logs for "[Chat API] Executing function: X"
- Hvis ingen logs: Groq kaller ikke funksjoner
- Sjekk at function definitions er sendt til Groq
- Verifiser at Groq-modellen støtter function calling

#### Problem: Meldinger lagres ikke i database
**Løsning**:
- Sjekk Network-tab for `/api/chat` response
- Response bør inneholde `messageId`
- Sjekk Supabase for nye entries i `chat_messages`
- Verifiser Supabase RLS policies

---

## 📊 Test Resultat Oppsummering

| Test | Status | Notater |
|------|--------|---------|
| 1. Login og Tilgang | ⬜ | |
| 2. Chat-historikk | ⬜ | |
| 3. Enkel Melding | ⬜ | |
| 4. get_prescriptions | ⬜ | |
| 5. get_reminders | ⬜ | |
| 6. get_health_records | ⬜ | |
| 7. get_doctors | ⬜ | |
| 8. get_todays_schedule | ⬜ | |
| 9. Conversation History | ⬜ | |
| 10. Error Handling | ⬜ | |
| 11. Performance | ⬜ | |
| 12. Database Persistence | ⬜ | |

**Total**: 0/12 tester fullført

---

## ✅ Når Testing er Fullført

Når alle tester er gjennomført og godkjent:

1. Oppdater `IMPLEMENTATION_CHECKLIST.md` Fase 6 som fullført
2. Gå videre til Fase 7 - Deployment
3. Konfigurer environment variables i Vercel
4. Deploy til produksjon
5. Kjør samme tester i prod-miljø

---

## 🔗 Nyttige Lenker

- **Local Dev**: http://localhost:3000
- **Login**: http://localhost:3000/auth
- **Chat**: http://localhost:3000/chatbot
- **Test DB**: http://localhost:3000/api/test-db
- **Test Functions**: http://localhost:3000/api/test-functions?userId=1
- **Groq Console**: https://console.groq.com

---

**Lykke til med testingen! 🚀**
