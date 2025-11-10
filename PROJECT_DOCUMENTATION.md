# HealthCare Assistant Chatbot - Komplett Prosjektdokumentasjon

## Innholdsfortegnelse
1. [Prosjektoversikt](#prosjektoversikt)
2. [Arkitektur og Filstruktur](#arkitektur-og-filstruktur)
3. [Frontend-struktur](#frontend-struktur)
4. [Backend og Services](#backend-og-services)
5. [Database-schema](#database-schema)
6. [Autentisering og Autorisasjon](#autentisering-og-autorisasjon)
7. [Dataflyt](#dataflyt)
8. [AI/LLM-integrasjon (Groq)](#aillm-integrasjon-groq)
9. [State Management](#state-management)
10. [Deployment og Konfigurasjon](#deployment-og-konfigurasjon)

---

## Prosjektoversikt

### Formål
En fullstack helsehjelp-applikasjon for eldre brukere med AI-drevet chatbot for å:
- Administrere medisiner og resepter
- Holde oversikt over legetimer
- Motta påminnelser om medisintaking
- Kommunisere med en AI-assistent om helsespørsmål
- Spore vitale helseparametere

### Teknologistakk

#### Core
- **Next.js 16.0.1** - React-framework med App Router
- **React 19.2.0** - UI-bibliotek med React Compiler aktivert
- **TypeScript 5** - Type safety

#### Backend/Database
- **Supabase** - PostgreSQL database + autentisering
  - Connection pooling
  - Row Level Security (RLS)
  - JWT-based authentication

#### State Management
- **Zustand 5.0.8** - Lightweight state management med localStorage persistence

#### UI/Styling
- **Tailwind CSS 4** - Utility-first CSS
- **shadcn/ui** - Accessible React-komponenter basert på Radix UI
- **Lucide Icons + Tabler Icons** - Icon-biblioteker

#### Forms & Validation
- **React Hook Form 7.65.0** - Performant form-håndtering
- **Zod 4.1.12** - TypeScript-first schema validation

#### Data Visualization
- **Recharts 2.15.4** - React charting library
- **TanStack Table 8.21.3** - Headless table library

### Prosjektstatistikk
- **Total kodebase**: ~10,308 linjer kode
- **Komponenter**: 30+ React-komponenter
- **Services**: 5 service-lag
- **Stores**: 4 Zustand stores
- **Database-tabeller**: 7 hovedtabeller

---

## Arkitektur og Filstruktur

### Rotstruktur
```
C:\Kodeprosjekter\chatbot2\
├── .env                          # Miljøvariabler (Supabase + AI API)
├── package.json                  # Avhengigheter og scripts
├── tsconfig.json                 # TypeScript-konfigurasjon
├── next.config.ts                # Next.js-konfigurasjon
├── components.json               # shadcn/ui konfigurasjon
├── eslint.config.mjs            # ESLint med React Compiler
├── postcss.config.mjs           # PostCSS med Tailwind
├── app/                         # Next.js App Router (pages)
│   ├── page.tsx                 # Landing page
│   ├── layout.tsx               # Root layout
│   ├── globals.css              # Global styles + Tailwind
│   ├── auth/                    # Autentiseringsside
│   ├── (patient)/               # Pasient-ruter (route group)
│   │   ├── patient-dashboard/
│   │   └── chatbot/
│   └── (admin)/                 # Admin-ruter (route group)
│       └── admin-dashboard/
├── api/                         # Supabase client setup
│   └── supabaseClient.ts
├── components/                  # React-komponenter
│   ├── auth/                    # Login/signup-komponenter
│   ├── chatbot/                 # Chat-interface
│   ├── dashboard/               # Admin/pasient dashboards
│   └── ui/                      # shadcn/ui komponenter (25+)
├── hooks/                       # Custom React hooks
│   ├── useAuth.ts               # Autentisering og autorisasjon
│   ├── useSessionManager.ts     # Auto session refresh
│   └── useSupabaseKeepAlive.ts  # Keep Supabase warm
├── lib/                         # Utility-funksjoner
│   └── utils.ts                 # cn() for Tailwind merging
├── providers/                   # Context providers
│   ├── auth-provider.tsx        # AuthProvider wrapper
│   └── keep-alive-provider.tsx  # KeepAliveProvider wrapper
├── services/                    # API-tjenester
│   ├── authService.ts           # Autentisering
│   ├── chatbotService.ts        # AI chatbot (GROQ-integrasjonspunkt)
│   ├── patientService.ts        # Pasient-data
│   ├── adminService.ts          # Admin CRUD
│   └── keepAliveService.ts      # Standalone keep-alive
├── stores/                      # Zustand state management
│   ├── authStore.ts             # Auth state
│   ├── chatbotStore.ts          # Chat messages
│   ├── patientStore.ts          # Pasient-data
│   └── adminStore.ts            # Admin-data
├── types/                       # TypeScript type definitions
│   ├── database.ts              # Database schema types
│   └── auth.ts                  # Auth-relaterte types
└── public/                      # Statiske filer
```

### Konfigurasjonsdetaljer

#### Environment Variables (`.env`)
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://yjqcftbnyqvxxpsnfylq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# AI API (Groq) - MÅ LEGGES TIL
NEXT_PUBLIC_AI_API_ENDPOINT=https://api.groq.com/openai/v1/chat/completions
NEXT_PUBLIC_AI_API_KEY=gsk_din_groq_api_key_her
```

#### Next.js Config (`next.config.ts`)
```typescript
const nextConfig: NextConfig = {
  reactCompiler: true,  // React 19 Compiler aktivert
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" }
    ]
  }
};
```

#### TypeScript Config
- Target: ES2017
- Module: ESNext med bundler resolution
- Strict mode aktivert
- Path aliases: `@/*` → rotmappen

---

## Frontend-struktur

### Next.js App Router - Routing-strategi

#### Sider og Routes

##### 1. Landing Page (`app/page.tsx`)
- **Route**: `/`
- **Formål**: Marketing-side for elderly care
- **Hovedfunksjoner**:
  - Feature highlights
  - CTA-knapper til `/auth`
  - Responsivt design

##### 2. Autentisering (`app/auth/page.tsx`)
- **Route**: `/auth`
- **Formål**: Login/Signup-side
- **Komponenter**: `Authentication` wrapper med `LoginForm`/`SignupForm`
- **Layout**: Bildebakgrunn + form-card

##### 3. Pasient Dashboard (`app/(patient)/patient-dashboard/page.tsx`)
- **Route**: `/patient-dashboard`
- **Beskyttelse**: `useAuth("user")`
- **Hovedfunksjoner**:
  - Viser dagens påminnelser
  - Aktive resepter med medisininfo
  - "Ask Your Assistant"-knapp til chatbot
  - Read-only visning av data

##### 4. Chatbot (`app/(patient)/chatbot/page.tsx`)
- **Route**: `/chatbot`
- **Beskyttelse**: `useAuth("user")`
- **Hovedfunksjoner**:
  - Fullskjerm chat-interface
  - Header med brukerprofil og logout
  - Integrert med `chatbotStore`

##### 5. Admin Dashboard (`app/(admin)/admin-dashboard/page.tsx`)
- **Route**: `/admin-dashboard`
- **Beskyttelse**: `useAuth("admin")`
- **Hovedfunksjoner**:
  - Statistikk-kort (pasienter, resepter, helsedata, påminnelser)
  - Multi-view sidebar navigation
  - CRUD-interfaces for alle entiteter

#### Route Groups
- `(patient)` - Grupperer pasient-relaterte ruter
- `(admin)` - Grupperer admin-relaterte ruter
- Disse gruppene tillater ulike layouts uten å påvirke URL-strukturen

### React-komponenter

#### A. Autentiseringskomponenter (`components/auth/`)

##### `authentication.tsx`
Hovedwrapper for autentiseringsflyt:
```typescript
export function Authentication() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="auth-container">
      <Tabs value={isLogin ? "login" : "signup"}>
        <TabsList>
          <TabsTrigger onClick={() => setIsLogin(true)}>Login</TabsTrigger>
          <TabsTrigger onClick={() => setIsLogin(false)}>Sign Up</TabsTrigger>
        </TabsList>
        <TabsContent value="login">
          <LoginForm />
        </TabsContent>
        <TabsContent value="signup">
          <SignupForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

##### `login-form.tsx`
Login-skjema med validering:
- **Validering**: React Hook Form + Zod
- **Fields**: Email, Password
- **Submit-logikk**:
  1. Validerer input
  2. Kaller `authStore.login(email, password)`
  3. Redirecter basert på rolle:
     - `user` → `/chatbot`
     - `admin` → `/admin-dashboard`

Nøkkelkode:
```typescript
const onSubmit = async (data: LoginFormData) => {
  const success = await authStore.login({
    email: data.email,
    password: data.password,
  });

  if (success) {
    const role = authStore.profile?.role;
    if (role === "admin") {
      router.push("/admin-dashboard");
    } else {
      router.push("/chatbot");
    }
  } else {
    toast.error("Invalid credentials");
  }
};
```

##### `signup-form.tsx`
Registreringsskjema med fullstendig brukerprofil:
- **Fields**: First Name, Last Name, Email, Password, Birth Date, Gender, Phone, Address
- **Submit-logikk**: Kaller `authStore.signup(signupData)`

#### B. Chatbot-komponenter (`components/chatbot/`)

##### `chat.tsx`
**Lokasjon**: `components/chatbot/chat.tsx`

Hovedchat-interface med følgende funksjoner:
- **Message Display**: Viser chat-historikk (User/Bot)
- **Message Input**: Textarea med send-knapp
- **Loading State**: Viser "typing..." når bot svarer
- **Auto-scroll**: Scroller til nyeste melding

Nøkkelkode:
```typescript
export function Chat() {
  const { messages, isSending, sendMessage } = useChatbotStore();
  const { profile } = useAuthStore();
  const [messageText, setMessageText] = useState("");

  const handleSendMessage = async () => {
    if (!messageText.trim() || !profile) return;

    const success = await sendMessage(profile.user_id, messageText);
    if (success) {
      setMessageText("");
    }
  };

  return (
    <div className="chat-container">
      {/* Message list */}
      <div className="messages">
        {messages.map((msg) => (
          <div key={msg.message_id} className={msg.sender_type}>
            <p>{msg.message_text}</p>
            <span>{formatTime(msg.timestamp)}</span>
          </div>
        ))}
      </div>

      {/* Input area */}
      <div className="input-area">
        <Textarea
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          placeholder="Ask me anything..."
        />
        <Button onClick={handleSendMessage} disabled={isSending}>
          {isSending ? "Sending..." : "Send"}
        </Button>
      </div>
    </div>
  );
}
```

**Viktig**: Fallback-meldinger vises hvis AI ikke er konfigurert (linjer 47-50).

#### C. Dashboard-komponenter (`components/dashboard/`)

##### `app-sidebar.tsx`
Admin sidebar med navigasjon:
- **Seksjoner**:
  - Overview
  - Patients
  - Medicines
  - Doctors
  - Prescriptions
  - Health Records
  - Reminders
- **Ikoner**: Lucide icons
- **State**: Aktiv seksjon highlightes

##### `manage-medicines.tsx`, `manage-doctors.tsx`, etc.
CRUD-komponenter med DataTable:
- **DataTable**: TanStack Table med sorting, filtering
- **Actions**: Edit, Delete-knapper per rad
- **Drawer**: Slide-in form for create/edit
- **Toast**: Notifications på success/error

Typisk CRUD-flyt:
```typescript
export function ManageMedicines() {
  const { medicines, createMedicine, updateMedicine, deleteMedicine } =
    useAdminStore();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);

  const handleSubmit = async (data: MedicineFormData) => {
    if (selectedMedicine) {
      // Update
      await updateMedicine(selectedMedicine.medicine_id, data);
    } else {
      // Create
      await createMedicine(data);
    }
    setIsDrawerOpen(false);
    toast.success("Medicine saved successfully");
  };

  return (
    <div>
      <Button onClick={() => setIsDrawerOpen(true)}>New Medicine</Button>
      <DataTable data={medicines} columns={medicineColumns} />
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <MedicineForm onSubmit={handleSubmit} initialData={selectedMedicine} />
      </Drawer>
    </div>
  );
}
```

#### D. UI-komponenter (`components/ui/`)
shadcn/ui-bibliotek med 25+ komponenter (alle i `components/ui/`):

**Forms**:
- `input.tsx` - Tekstfelt
- `button.tsx` - Knapper med varianter
- `select.tsx` - Dropdown
- `checkbox.tsx` - Checkboxes
- `label.tsx` - Form labels
- `textarea.tsx` - Tekstområde

**Layout**:
- `card.tsx` - Innholdskort
- `sheet.tsx` - Slide-in panel
- `drawer.tsx` - Bottom drawer
- `dialog.tsx` - Modal dialog
- `sidebar.tsx` - Navigasjonssidebar

**Feedback**:
- `toast.tsx` / Sonner - Notifications
- `alert-dialog.tsx` - Bekreftelsesdialog
- `badge.tsx` - Status badges

**Data**:
- `table.tsx` - Tabellkomponenter
- `tabs.tsx` - Tab-navigation
- `tooltip.tsx` - Hover-tips

**Navigation**:
- `breadcrumb.tsx` - Breadcrumb-navigasjon
- `dropdown-menu.tsx` - Dropdown-meny

### Custom Hooks

#### `useAuth` (`hooks/useAuth.ts`)
**Lokasjon**: `hooks/useAuth.ts`

Håndterer autentisering og autorisasjon med role-based access control:

```typescript
export function useAuth(requiredRole?: UserRole) {
  const router = useRouter();
  const { user, profile, _hasHydrated } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // 1. Venter på Zustand hydration
    if (!_hasHydrated) return;

    // 2. Sjekker om bruker er logget inn
    if (!user || !profile) {
      router.push("/auth");
      return;
    }

    // 3. Sjekker rolle hvis påkrevd
    if (requiredRole && profile.role !== requiredRole) {
      // Redirect til riktig dashboard basert på faktisk rolle
      if (profile.role === "admin") {
        router.push("/admin-dashboard");
      } else {
        router.push("/patient-dashboard");
      }
      return;
    }

    // 4. Alt OK - brukeren er autorisert
    setIsAuthorized(true);
    setIsLoading(false);
  }, [user, profile, _hasHydrated, requiredRole, router]);

  return { user, profile, isLoading, isAuthorized };
}
```

**Bruk i pages**:
```typescript
// I patient-dashboard/page.tsx
const { profile, isLoading, isAuthorized } = useAuth("user");

if (isLoading) return <LoadingSpinner />;
if (!isAuthorized) return null;
```

#### `useSessionManager` (`hooks/useSessionManager.ts`)
**Lokasjon**: `hooks/useSessionManager.ts`

Automatisk session refresh for å forhindre token-utløp:

```typescript
export function useSessionManager(options?: {
  refreshInterval?: number;  // default: 25000ms
  debug?: boolean;
  enableAutoRefresh?: boolean;
}) {
  const { getValidSession } = useAuthStore();

  useEffect(() => {
    // 1. Lytter til Supabase auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
          // Oppdater authStore med ny session
          authStore.setState({ session });
        }
      }
    );

    // 2. Auto-refresh hvert 25. sekund
    const interval = setInterval(async () => {
      await getValidSession();
    }, options?.refreshInterval || 25000);

    return () => {
      authListener.subscription.unsubscribe();
      clearInterval(interval);
    };
  }, []);
}
```

#### `useSupabaseKeepAlive` (`hooks/useSupabaseKeepAlive.ts`)
**Lokasjon**: `hooks/useSupabaseKeepAlive.ts`

Holder Supabase-instansen varm (forhindrer cold starts):

```typescript
export function useSupabaseKeepAlive(config?: {
  interval?: number;  // default: 300000ms (5 min)
  debug?: boolean;
}) {
  useEffect(() => {
    const interval = setInterval(async () => {
      // Ping Supabase auth for å holde connection varm
      await supabase.auth.getSession();
    }, config?.interval || 300000);

    return () => clearInterval(interval);
  }, []);
}
```

---

## Backend og Services

### Supabase Client Setup

#### `api/supabaseClient.ts`
**Lokasjon**: `api/supabaseClient.ts`

Oppsett av Supabase-klienten:
```typescript
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,        // Lagrer session i localStorage
    autoRefreshToken: true,      // Auto-refresh før utløp
    detectSessionInUrl: true,    // OAuth redirect-håndtering
    storage: window.localStorage // Eksplisitt localStorage
  }
});
```

### Services Layer

#### A. `authService` (`services/authService.ts`)
**Lokasjon**: `services/authService.ts` (143 linjer)

Håndterer all autentiseringslogikk:

##### Metoder:

**1. `signup(data: SignupData)`**
```typescript
async signup(data: SignupData): Promise<AuthResponse> {
  // 1. Opprett Supabase Auth-bruker
  const { data: authData, error: authError } =
    await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    });

  if (authError) return { error: authError.message };

  // 2. Opprett user-record i database
  const { data: userData, error: dbError } =
    await supabase.from("users").insert([{
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email,
      birth_date: data.birthDate,
      gender: data.gender,
      phone: data.phone,
      address: data.address,
      role: "user",  // Default rolle
      primary_doctor_id: data.primaryDoctorId || null,
    }]).select().single();

  if (dbError) return { error: dbError.message };

  // 3. Hent session
  const { data: { session } } = await supabase.auth.getSession();

  return {
    user: authData.user,
    profile: userData as UserProfile,
    session,
    error: null
  };
}
```

**2. `login(data: LoginData)`**
```typescript
async login(data: LoginData): Promise<LoginResponse> {
  // 1. Autentiser via Supabase Auth
  const { data: authData, error: authError } =
    await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

  if (authError) return { error: authError.message };

  // 2. Hent brukerprofil fra database
  const { data: userData, error: dbError } =
    await supabase
      .from("users")
      .select("*")
      .eq("email", authData.user.email)
      .single();

  if (dbError) return { error: dbError.message };

  return {
    user: authData.user,
    profile: userData as UserProfile,
    error: null
  };
}
```

**3. `logout()`**
```typescript
async logout(): Promise<void> {
  await supabase.auth.signOut();
}
```

**4. `getCurrentUser()`**
```typescript
async getCurrentUser(): Promise<User | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}
```

#### B. `chatbotService` (`services/chatbotService.ts`)
**Lokasjon**: `services/chatbotService.ts` (178 linjer)

**KRITISK FOR GROQ-INTEGRASJON**

##### Konfigurasjon:
```typescript
const AI_API_ENDPOINT =
  process.env.NEXT_PUBLIC_AI_API_ENDPOINT || "/api/chat";
const AI_API_KEY =
  process.env.NEXT_PUBLIC_AI_API_KEY || "";
```

##### Hovedmetoder:

**1. `getAIResponse()` - GROQ INTEGRASJONSPUNKT**
```typescript
async getAIResponse(
  userMessage: string,
  conversationHistory?: ChatMessage[]
): Promise<{ success: boolean; response?: string; error?: string }> {
  try {
    // DETTE ER HVOR GROQ API-KALLET SKAL VÆRE
    const response = await fetch(AI_API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${AI_API_KEY}`
      },
      body: JSON.stringify({
        message: userMessage,
        history: conversationHistory?.map(msg => ({
          role: msg.sender_type === "User" ? "user" : "assistant",
          content: msg.message_text
        }))
      })
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      success: true,
      response: data.response || data.message || "I'm here to help!"
    };
  } catch (error) {
    console.error("AI Response error:", error);

    // Fallback til generert svar
    return {
      success: false,
      error: error.message
    };
  }
}
```

**2. `analyzeIntent()` - Enkel intent-detection**
```typescript
async analyzeIntent(message: string): Promise<string> {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes("medication") || lowerMessage.includes("medicine")) {
    return "medication_query";
  }
  if (lowerMessage.includes("appointment") || lowerMessage.includes("doctor")) {
    return "appointment_query";
  }
  if (lowerMessage.includes("remind") || lowerMessage.includes("reminder")) {
    return "reminder_request";
  }
  if (lowerMessage.includes("health") || lowerMessage.includes("vitals")) {
    return "health_query";
  }
  if (lowerMessage.includes("prescription")) {
    return "prescription_query";
  }

  return "general_query";
}
```

**3. `generateHealthResponse()` - Fallback når AI ikke tilgjengelig**
```typescript
async generateHealthResponse(userMessage: string): Promise<string> {
  const lowerMessage = userMessage.toLowerCase();

  // Hardkodede responser basert på keywords
  if (lowerMessage.includes("medication")) {
    return "I can help you with your medications. What would you like to know?";
  }
  if (lowerMessage.includes("appointment")) {
    return "I can help you manage your appointments. Would you like to schedule one?";
  }
  if (lowerMessage.includes("remind")) {
    return "I can set up reminders for you. What would you like to be reminded about?";
  }

  return "I'm here to help with your health management. Feel free to ask me anything!";
}
```

**4. `formatConversationHistory()` - Formaterer chat-historikk**
```typescript
formatConversationHistory(messages: ChatMessage[]): string {
  return messages
    .map((msg) => `${msg.sender_type}: ${msg.message_text}`)
    .join("\n");
}
```

#### C. `patientService` (`services/patientService.ts`)
**Lokasjon**: `services/patientService.ts` (221 linjer)

Håndterer pasient-data:

##### Session-validering:
```typescript
async function hasActiveSession(): Promise<boolean> {
  const { data: { session } } = await supabase.auth.getSession();
  return session !== null;
}
```

##### Metoder:

**1. `getPrescriptions(userId: number)`**
```typescript
async getPrescriptions(userId: number): Promise<Prescription[]> {
  if (!await hasActiveSession()) return [];

  const { data, error } = await supabase
    .from("prescriptions")
    .select(`
      *,
      medicine:medicines(*),
      doctor:doctors(*)
    `)
    .eq("user_id", userId)
    .order("created_date", { ascending: false });

  if (error) {
    console.error("Error fetching prescriptions:", error);
    return [];
  }

  return data as Prescription[];
}
```

**2. `getReminders(userId: number)`**
```typescript
async getReminders(userId: number): Promise<Reminder[]> {
  if (!await hasActiveSession()) return [];

  const { data, error } = await supabase
    .from("reminders")
    .select("*")
    .eq("user_id", userId)
    .order("reminder_datetime", { ascending: true });

  if (error) {
    console.error("Error fetching reminders:", error);
    return [];
  }

  return data as Reminder[];
}
```

**3. `getChatMessages(userId: number)`**
```typescript
async getChatMessages(userId: number): Promise<ChatMessage[]> {
  if (!await hasActiveSession()) return [];

  const { data, error } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("user_id", userId)
    .order("timestamp", { ascending: true });

  if (error) {
    console.error("Error fetching chat messages:", error);
    return [];
  }

  return data as ChatMessage[];
}
```

**4. `getHealthRecords(userId: number)`**
```typescript
async getHealthRecords(userId: number): Promise<HealthRecord[]> {
  if (!await hasActiveSession()) return [];

  const { data, error } = await supabase
    .from("health_records")
    .select("*")
    .eq("user_id", userId)
    .order("date_time", { ascending: false });

  if (error) {
    console.error("Error fetching health records:", error);
    return [];
  }

  return data as HealthRecord[];
}
```

#### D. `adminService` (`services/adminService.ts`)
**Lokasjon**: `services/adminService.ts` (669 linjer)

Håndterer alle admin CRUD-operasjoner:

##### Medicines CRUD:

```typescript
// CREATE
async createMedicine(
  medicine: Omit<Medicine, "medicine_id" | "created_date">
): Promise<Result<Medicine>> {
  const { data, error } = await supabase
    .from("medicines")
    .insert([medicine])
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, data: data as Medicine };
}

// UPDATE
async updateMedicine(
  id: number,
  updates: Partial<Medicine>
): Promise<Result<Medicine>> {
  const { data, error } = await supabase
    .from("medicines")
    .update(updates)
    .eq("medicine_id", id)
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, data: data as Medicine };
}

// DELETE
async deleteMedicine(id: number): Promise<Result<void>> {
  const { error } = await supabase
    .from("medicines")
    .delete()
    .eq("medicine_id", id);

  if (error) return { success: false, error: error.message };
  return { success: true };
}
```

##### Getters:

```typescript
async getAllPatients(): Promise<AdminUser[]> {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("role", "user")
    .order("registration_date", { ascending: false });

  if (error) return [];
  return data as AdminUser[];
}

async getAllMedicines(): Promise<Medicine[]> {
  const { data, error } = await supabase
    .from("medicines")
    .select("*")
    .order("created_date", { ascending: false });

  if (error) return [];
  return data as Medicine[];
}
```

**Samme struktur for**:
- Doctors (create/update/delete/getAll)
- Prescriptions (create/update/delete/getAll)
- Health Records (create/update/delete/getAll)
- Reminders (create/update/delete/getAll)

---

## Database-schema

### Database-typer (`types/database.ts`)

Alle TypeScript-interfaces er definert i `types/database.ts` (333 linjer).

#### 1. **users** (Brukere)
```typescript
export interface User {
  user_id: number;              // Primary key (auto-increment)
  first_name: string;           // Fornavn
  last_name: string;            // Etternavn
  birth_date?: string;          // Fødselsdato (YYYY-MM-DD)
  gender?: "Male" | "Female" | "Other";
  phone?: string;               // Telefonnummer
  email?: string;               // E-post (unik)
  address?: string;             // Adresse
  role: "user" | "admin";       // Rolle (default: "user")
  primary_doctor_id?: number;   // FK til doctors-tabellen
  registration_date: string;    // Timestamp (auto)
}
```

**Relasjoner**:
- `primary_doctor_id` → `doctors.doctor_id` (many-to-one)
- `user_id` ← `prescriptions.user_id` (one-to-many)
- `user_id` ← `health_records.user_id` (one-to-many)
- `user_id` ← `reminders.user_id` (one-to-many)
- `user_id` ← `chat_messages.user_id` (one-to-many)

#### 2. **doctors** (Leger)
```typescript
export interface Doctor {
  doctor_id: number;            // Primary key (auto-increment)
  name: string;                 // Lege navn
  speciality?: string;          // Spesialitet (Kardiologi, etc.)
  phone?: string;               // Telefonnummer
  email?: string;               // E-post
  hospital?: string;            // Sykehus
  license_number?: string;      // Lisensnummer
  created_date: string;         // Timestamp (auto)
}
```

**Relasjoner**:
- `doctor_id` ← `users.primary_doctor_id` (one-to-many)
- `doctor_id` ← `prescriptions.doctor_id` (one-to-many)

#### 3. **medicines** (Medisiner)
```typescript
export interface Medicine {
  medicine_id: number;          // Primary key (auto-increment)
  name: string;                 // Medisinnavn
  type?: string;                // Type (Tablet, Syrup, Injection, etc.)
  dosage?: string;              // Dosering (e.g., "500mg")
  side_effects?: string;        // Bivirkninger
  instructions?: string;        // Bruksanvisning
  created_date: string;         // Timestamp (auto)
}
```

**Relasjoner**:
- `medicine_id` ← `prescriptions.medicine_id` (one-to-many)

#### 4. **prescriptions** (Resepter)
```typescript
export interface Prescription {
  prescription_id: number;      // Primary key (auto-increment)
  user_id: number;              // FK til users
  doctor_id: number;            // FK til doctors
  medicine_id: number;          // FK til medicines
  start_date: string;           // Startdato (YYYY-MM-DD)
  end_date?: string;            // Sluttdato (null = pågående)
  dosage?: string;              // Dosering
  frequency?: string;           // Frekvens ("2 times daily", etc.)
  instructions?: string;        // Spesielle instruksjoner
  created_date: string;         // Timestamp (auto)

  // Joined data (fra queries med .select())
  medicine?: Medicine;          // Joined medicine-data
  user?: User;                  // Joined user-data
  doctor?: Doctor;              // Joined doctor-data
}
```

**Relasjoner**:
- `user_id` → `users.user_id` (many-to-one)
- `doctor_id` → `doctors.doctor_id` (many-to-one)
- `medicine_id` → `medicines.medicine_id` (many-to-one)
- `prescription_id` ← `reminders.prescription_id` (one-to-many)

#### 5. **health_records** (Helsedata/Vitale parametere)
```typescript
export interface HealthRecord {
  record_id: number;            // Primary key (auto-increment)
  user_id: number;              // FK til users
  date_time: string;            // Timestamp for målingen
  heart_rate?: number;          // Puls (BPM)
  blood_pressure?: string;      // Blodtrykk (e.g., "120/80")
  blood_sugar?: number;         // Blodsukker (mg/dL)
  temperature?: number;         // Kroppstemperatur (Celsius)
  notes?: string;               // Notater
  created_date: string;         // Timestamp (auto)
}
```

**Relasjoner**:
- `user_id` → `users.user_id` (many-to-one)

#### 6. **reminders** (Påminnelser)
```typescript
export interface Reminder {
  reminder_id: number;          // Primary key (auto-increment)
  user_id: number;              // FK til users
  prescription_id: number;      // FK til prescriptions
  reminder_datetime: string;    // Når påminnelsen skal sendes
  status: "Pending" | "Sent" | "Acknowledged" | "Missed";
  notes?: string;               // Ekstra notater
  created_date: string;         // Timestamp (auto)
}
```

**Relasjoner**:
- `user_id` → `users.user_id` (many-to-one)
- `prescription_id` → `prescriptions.prescription_id` (many-to-one)

#### 7. **chat_messages** (Chat-historikk)
```typescript
export interface ChatMessage {
  message_id: number;           // Primary key (auto-increment)
  user_id: number;              // FK til users
  message_text: string;         // Meldingstekst
  sender_type: "User" | "Bot";  // Hvem som sendte meldingen
  timestamp: string;            // Når meldingen ble sendt
  intent?: string;              // Detektert intent (medication_query, etc.)
}
```

**Relasjoner**:
- `user_id` → `users.user_id` (many-to-one)

### Database-relasjonsdiagram

```
users (user_id)
  ├─> doctors (primary_doctor_id → doctor_id)
  │
  ├─< prescriptions (user_id)
  │     ├─> doctors (doctor_id)
  │     ├─> medicines (medicine_id)
  │     └─< reminders (prescription_id)
  │
  ├─< health_records (user_id)
  │
  ├─< reminders (user_id)
  │
  └─< chat_messages (user_id)

doctors (doctor_id)
  ├─< users (primary_doctor_id)
  └─< prescriptions (doctor_id)

medicines (medicine_id)
  └─< prescriptions (medicine_id)
```

---

## Autentisering og Autorisasjon

### Autentiseringsflyt (Detaljert)

#### 1. Signup-prosess

```
Bruker → SignupForm (components/auth/signup-form.tsx)
  │
  ├─ Fyller inn skjema:
  │  - First Name, Last Name
  │  - Email, Password
  │  - Birth Date, Gender
  │  - Phone, Address
  │
  ├─ React Hook Form validering (Zod schema)
  │
  ├─ handleSubmit → authStore.signup(signupData)
  │
  └─> authService.signup():
       │
       ├─ 1. Opprett Supabase Auth-bruker:
       │      supabase.auth.signUp({ email, password })
       │      → Bruker får verification email (hvis konfigurert)
       │      → Auth user opprettes i Supabase Auth
       │
       ├─ 2. Opprett user-record i database:
       │      supabase.from("users").insert({
       │        first_name, last_name, email,
       │        birth_date, gender, phone, address,
       │        role: "user",  // Default
       │        primary_doctor_id: null
       │      })
       │
       ├─ 3. Hent session:
       │      supabase.auth.getSession()
       │      → access_token, refresh_token, expires_at
       │
       ├─ 4. Returner:
       │      { user, profile, session, error: null }
       │
       └─> authStore oppdateres:
            - user: Supabase User-objekt
            - profile: UserProfile med rolle
            - session: Session-objekt
            - Lagres i localStorage (Zustand persist)

Redirect basert på rolle:
  - role === "user" → /chatbot
  - role === "admin" → /admin-dashboard
```

#### 2. Login-prosess

```
Bruker → LoginForm (components/auth/login-form.tsx)
  │
  ├─ Fyller inn:
  │  - Email
  │  - Password
  │
  ├─ React Hook Form validering
  │
  ├─ handleSubmit → authStore.login({ email, password })
  │
  └─> authService.login():
       │
       ├─ 1. Autentiser via Supabase Auth:
       │      supabase.auth.signInWithPassword({ email, password })
       │      → Returnerer { user, session } hvis suksess
       │
       ├─ 2. Hent brukerprofil fra database:
       │      supabase.from("users")
       │        .select("*")
       │        .eq("email", user.email)
       │        .single()
       │      → Returnerer UserProfile med rolle
       │
       ├─ 3. Returner:
       │      { user, profile, error: null }
       │
       └─> authStore oppdateres:
            - user: Supabase User-objekt
            - profile: UserProfile (inkl. rolle)
            - session: fra Supabase
            - Lagres i localStorage

Redirect basert på rolle:
  - role === "user" → /chatbot
  - role === "admin" → /admin-dashboard
```

#### 3. Session Refresh (Automatisk)

```
AuthProvider (providers/auth-provider.tsx)
  │
  ├─ Wrappet rundt hele appen i app/layout.tsx
  │
  └─> useSessionManager():
       │
       ├─ 1. Initial session load:
       │      supabase.auth.getSession()
       │      → Laster session fra localStorage
       │      → Oppdaterer authStore
       │
       ├─ 2. Lytter til auth state changes:
       │      supabase.auth.onAuthStateChange((event, session) => {
       │        if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
       │          authStore.setState({ session });
       │        }
       │      })
       │
       └─ 3. Auto-refresh interval (hvert 25. sekund):
            setInterval(() => {
              getValidSession();  // Sjekker og refresher om nødvendig
            }, 25000);

getValidSession() i authStore:
  │
  ├─ 1. Sjekk om session eksisterer
  │
  ├─ 2. Sjekk om session er valid:
  │      expires_at > (now + 30 sekunder buffer)
  │
  ├─ 3. Hvis invalid/utgått:
  │      supabase.auth.refreshSession()
  │      → Henter nye tokens fra Supabase
  │      → Oppdaterer authStore med ny session
  │
  └─ 4. Returner valid session
```

**Viktig**: Alle API-kall går via `getValidSession()` før sending, så tokens er ALLTID fresh.

### Autorisasjonsflyt

#### Protected Routes med `useAuth`

```typescript
// I en protected page (f.eks. patient-dashboard/page.tsx)
export default function PatientDashboard() {
  const { profile, isLoading, isAuthorized } = useAuth("user");

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthorized) {
    return null;  // Redirect skjer i useAuth
  }

  // Render page innhold
  return <div>Patient Dashboard...</div>;
}
```

**useAuth-logikk**:
```
1. Venter på Zustand hydration (_hasHydrated === true)
   → Sikrer at localStorage er lastet inn

2. Henter user og profile fra authStore

3. Sjekker om bruker er logget inn:
   - Hvis ingen user → router.push("/auth")

4. Sjekker rolle (hvis requiredRole er spesifisert):
   - Hvis profile.role !== requiredRole:
     - Admin → router.push("/admin-dashboard")
     - User → router.push("/patient-dashboard")

5. Hvis alt OK:
   - setIsAuthorized(true)
   - setIsLoading(false)
```

#### Role-based Redirect Matrix

| Faktisk rolle | Forsøker å aksessere | Resultat                      |
|---------------|---------------------|-------------------------------|
| `user`        | `/chatbot`          | ✅ Tillatt                    |
| `user`        | `/patient-dashboard`| ✅ Tillatt                    |
| `user`        | `/admin-dashboard`  | ❌ Redirect → `/patient-dashboard` |
| `admin`       | `/admin-dashboard`  | ✅ Tillatt                    |
| `admin`       | `/chatbot`          | ❌ Redirect → `/admin-dashboard` |
| `admin`       | `/patient-dashboard`| ❌ Redirect → `/admin-dashboard` |
| `null`        | Any protected route | ❌ Redirect → `/auth`         |

### Sikkerhet

#### 1. JWT-basert autentisering
- **Access Token**: Sendes med alle API-requests i Authorization header
- **Refresh Token**: Brukes til å fornye access token
- **Auto-refresh**: Skjer automatisk før token utløper

#### 2. Row Level Security (RLS)
Supabase RLS bør være konfigurert for å sikre at:
- Brukere kun kan se sine egne data
- Admins kan se all data
- Eksempel policy:
  ```sql
  -- Brukere kan kun se sine egne resepter
  CREATE POLICY "Users can view own prescriptions"
  ON prescriptions
  FOR SELECT
  USING (auth.uid() = user_id);
  ```

#### 3. Session Persistence
- **localStorage**: Session lagres i localStorage via Zustand persist
- **Auto-refresh**: Session fornyes hvert 25. sekund
- **Aldri utløpt**: Buffering sikrer at token aldri utløper under bruk

#### 4. Keep-Alive System
- **Supabase Keep-Alive**: Pinger Supabase hvert 5. minutt
- **Forhindrer cold starts**: Holder connection pool varm
- **Implementert i**: `KeepAliveProvider` + `useSupabaseKeepAlive`

---

## Dataflyt

### Oversikt over dataflyt i applikasjonen

```
User Interaction (UI)
        ↓
React Component
        ↓
Zustand Store (State Management)
        ↓
Service Layer (API Abstraction)
        ↓
Supabase Client
        ↓
PostgreSQL Database / Supabase Auth
        ↓
Response tilbage gennem samme lag
```

### A. Autentiseringsflyt (Login)

```
1. User → LoginForm.tsx
   - Fyller inn email + password
   - Klikker "Login"

2. LoginForm → handleSubmit()
   - Validerer med React Hook Form + Zod
   - Kaller: authStore.login({ email, password })

3. authStore.login() (stores/authStore.ts)
   - Kaller: authService.login(data)
   - Venter på response

4. authService.login() (services/authService.ts)
   a) supabase.auth.signInWithPassword({ email, password })
      → Returnerer { user, session }

   b) supabase.from("users").select("*").eq("email", user.email).single()
      → Returnerer UserProfile med rolle

   c) Returner { user, profile, error: null }

5. authStore mottar response
   - Oppdaterer state:
     - user: Supabase User
     - profile: UserProfile (med rolle)
     - session: { access_token, refresh_token, expires_at }
   - Lagrer i localStorage (persist middleware)
   - Returner success: true

6. LoginForm → Redirect
   - Sjekker profile.role
   - role === "admin" → router.push("/admin-dashboard")
   - role === "user" → router.push("/chatbot")

7. Protected Page → useAuth()
   - Validerer bruker og rolle
   - Renderer innhold hvis autorisert
```

### B. Chatbot-meldingsflyt (KRITISK FOR GROQ)

```
1. User → Chat.tsx (components/chatbot/chat.tsx)
   - Skriver melding i textarea
   - Klikker "Send"

2. Chat.tsx → handleSendMessage()
   - Validerer at messageText ikke er tom
   - Henter userId fra authStore.profile
   - Kaller: chatbotStore.sendMessage(userId, messageText)

3. chatbotStore.sendMessage() (stores/chatbotStore.ts)
   a) Validerer session:
      const session = await authStore.getValidSession();
      - getValidSession() sjekker om token er valid
      - Refresher om nødvendig

   b) Legger til brukermelding i state:
      const userMessage: ChatMessage = {
        message_id: Date.now(),  // Temporary ID
        user_id: userId,
        message_text: messageText,
        sender_type: "User",
        timestamp: new Date().toISOString(),
        intent: undefined
      };
      set((state) => ({
        messages: [...state.messages, userMessage]
      }));

   c) Analyser intent:
      const intent = await chatbotService.analyzeIntent(messageText);

   d) Hent AI-respons:
      const aiResponse = await chatbotService.getAIResponse(
        messageText,
        get().messages  // Full conversation history
      );

   e) Hvis success, legg til bot-melding:
      const botMessage: ChatMessage = {
        message_id: Date.now() + 1,
        user_id: userId,
        message_text: aiResponse.response,
        sender_type: "Bot",
        timestamp: new Date().toISOString(),
        intent: intent
      };
      set((state) => ({
        messages: [...state.messages, botMessage],
        isSending: false
      }));

4. chatbotService.getAIResponse() (services/chatbotService.ts)
   ⚠️ GROQ INTEGRASJONSPUNKT ⚠️

   a) Forbered request:
      const response = await fetch(AI_API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${AI_API_KEY}`
        },
        body: JSON.stringify({
          message: userMessage,
          history: conversationHistory?.map(msg => ({
            role: msg.sender_type === "User" ? "user" : "assistant",
            content: msg.message_text
          }))
        })
      });

   b) Parse response:
      const data = await response.json();
      return {
        success: true,
        response: data.response || data.message
      };

   c) Hvis fejl, returner fallback:
      return {
        success: false,
        error: error.message
      };

5. Chat.tsx → UI opdatering
   - Zustand notificerer komponenten om state-ændring
   - messages-arrayet opdateres
   - Ny melding renderes i chat
   - Auto-scroll til bunden
```

### C. Admin CRUD-flyt (Eksempel: Opprett medisin)

```
1. Admin → ManageMedicines.tsx (components/dashboard/manage-medicines.tsx)
   - Klikker "New Medicine"
   - Drawer åpner med MedicineForm

2. MedicineForm
   - Admin fyller inn:
     - Name
     - Type (Tablet, Syrup, etc.)
     - Dosage
     - Side Effects
     - Instructions
   - Klikker "Save"

3. MedicineForm → handleSubmit()
   - Validerer med React Hook Form + Zod
   - Kaller: adminStore.createMedicine(medicineData)

4. adminStore.createMedicine() (stores/adminStore.ts)
   a) Validerer session:
      const session = await authStore.getValidSession();

   b) Kaller: adminService.createMedicine(medicine)

   c) Hvis success:
      - Legger til ny medisin i state
      - Trigger re-render av DataTable
      - Returner { success: true, data }

5. adminService.createMedicine() (services/adminService.ts)
   a) INSERT til database:
      const { data, error } = await supabase
        .from("medicines")
        .insert([medicine])
        .select()
        .single();

   b) Hvis error:
      return { success: false, error: error.message };

   c) Hvis success:
      return { success: true, data: data as Medicine };

6. ManageMedicines → UI opdatering
   - adminStore.medicines opdateres
   - DataTable re-renderes med ny rad
   - Toast-notification: "Medicine created successfully"
   - Drawer lukkes
```

### D. Pasient Dashboard Data Load

```
1. PatientDashboard.tsx → useEffect()
   - Kjører ved komponent mount
   - Henter userId fra authStore.profile
   - Kaller: patientStore.fetchAllPatientData(userId)

2. patientStore.fetchAllPatientData() (stores/patientStore.ts)
   Kjører parallelt:
   a) fetchPrescriptions(userId)
   b) fetchReminders(userId)
   c) fetchHealthRecords(userId)
   d) fetchChatMessages(userId)

3. Hver fetch-metode:
   a) Kaller tilsvarende patientService-metode
   b) Oppdaterer relevant state:
      set({ prescriptions: data })
      set({ reminders: data })
      set({ healthRecords: data })
      set({ chatMessages: data })

4. patientService (services/patientService.ts)
   - Validerer session: hasActiveSession()
   - Henter data fra Supabase:

     For prescriptions (med joined data):
     supabase.from("prescriptions")
       .select(`
         *,
         medicine:medicines(*),
         doctor:doctors(*)
       `)
       .eq("user_id", userId)
       .order("created_date", { ascending: false });

   - Returner data

5. PatientDashboard → Render
   - Viser dagens påminnelser (filtrert fra reminders)
   - Viser aktive resepter (prescriptions med end_date === null)
   - Viser medisininfo fra joined medicine-data
```

### Session-validering i alle API-kall

**Viktig**: Før HVER API-request sjekkes session-validitet:

```typescript
// I alle stores før API-kall:
const session = await useAuthStore.getState().getValidSession();

if (!session) {
  // Bruker er ikke logget inn - redirect
  return { success: false, error: "Not authenticated" };
}

// Fortsett med API-kall...
```

**getValidSession()-logikk**:
```typescript
async getValidSession(): Promise<Session | null> {
  const { session, sessionExpiresAt } = get();

  // 1. Sjekk om session eksisterer
  if (!session) return null;

  // 2. Sjekk om session er valid (med 30s buffer)
  const now = Date.now();
  const expiresAt = sessionExpiresAt || session.expires_at * 1000;

  if (expiresAt - now > 30000) {
    // Session er fortsatt valid
    return session;
  }

  // 3. Session utgår snart eller er utgått - refresh
  await this.refreshSession();

  return get().session;
}
```

---

## AI/LLM-integrasjon (Groq)

### Nåværende Status

Applikasjonen har **placeholder-implementering** for AI-funksjonalitet. Alt er klart for Groq-integrasjon, men API-kall er ikke implementert ennå.

### Konfigurasjonsvariabler

**Fil**: `services/chatbotService.ts` (linjer 8-10)

```typescript
const AI_API_ENDPOINT =
  process.env.NEXT_PUBLIC_AI_API_ENDPOINT || "/api/chat";
const AI_API_KEY =
  process.env.NEXT_PUBLIC_AI_API_KEY || "";
```

**Nåværende status**: Ingen verdier satt i `.env`

**For Groq-integrasjon**, legg til i `.env`:
```env
NEXT_PUBLIC_AI_API_ENDPOINT=https://api.groq.com/openai/v1/chat/completions
NEXT_PUBLIC_AI_API_KEY=gsk_din_groq_api_key_her
```

### Groq API-integrasjonspunkt

**Fil**: `services/chatbotService.ts`, metode `getAIResponse()` (linjer 17-58)

#### Nåværende implementering (Placeholder):

```typescript
async getAIResponse(
  userMessage: string,
  conversationHistory?: ChatMessage[]
): Promise<{ success: boolean; response?: string; error?: string }> {
  try {
    // TODO: GROQ API INTEGRATION
    const response = await fetch(AI_API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${AI_API_KEY}`
      },
      body: JSON.stringify({
        message: userMessage,
        history: conversationHistory?.map(msg => ({
          role: msg.sender_type === "User" ? "user" : "assistant",
          content: msg.message_text
        }))
      })
    });

    const data = await response.json();
    return {
      success: true,
      response: data.response || data.message || "I'm here to help!"
    };
  } catch (error) {
    console.error("AI Response error:", error);

    // Fallback til generert svar
    const fallbackResponse = await this.generateHealthResponse(userMessage);
    return {
      success: false,
      error: error.message
    };
  }
}
```

#### Groq-tilpasset implementering:

Groq bruker **OpenAI-kompatibelt API-format**. Her er hvordan du tilpasser:

```typescript
async getAIResponse(
  userMessage: string,
  conversationHistory?: ChatMessage[]
): Promise<{ success: boolean; response?: string; error?: string }> {
  try {
    // Forbered messages-array i OpenAI-format
    const messages = [
      {
        role: "system",
        content: `You are a helpful healthcare assistant for elderly patients.
                  Your role is to:
                  - Provide clear, compassionate guidance about medications
                  - Help with appointment scheduling and reminders
                  - Answer health-related questions in simple terms
                  - Always encourage users to consult their doctor for serious concerns

                  Be patient, kind, and use simple language.`
      },
      // Legg til conversation history
      ...(conversationHistory?.map(msg => ({
        role: msg.sender_type === "User" ? "user" : "assistant",
        content: msg.message_text
      })) || []),
      // Legg til current message
      {
        role: "user",
        content: userMessage
      }
    ];

    // Groq API-kall
    const response = await fetch(AI_API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${AI_API_KEY}`
      },
      body: JSON.stringify({
        model: "mixtral-8x7b-32768",  // Eller annen Groq-modell
        messages: messages,
        temperature: 0.7,              // Kreativitet (0-2)
        max_tokens: 1024,              // Maks svar-lengde
        top_p: 1,
        stream: false                  // Kan settes til true for streaming
      })
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Groq returnerer i OpenAI-format:
    // { choices: [{ message: { role: "assistant", content: "..." } }] }
    const aiMessage = data.choices?.[0]?.message?.content;

    if (!aiMessage) {
      throw new Error("No response from Groq API");
    }

    return {
      success: true,
      response: aiMessage
    };

  } catch (error) {
    console.error("Groq AI Response error:", error);

    // Fallback til hardkodet svar
    const fallbackResponse = await this.generateHealthResponse(userMessage);
    return {
      success: false,
      response: fallbackResponse,
      error: error.message
    };
  }
}
```

### Groq-modeller

Tilgjengelige Groq-modeller (per januar 2025):

| Modell | Model ID | Context Window | Beskrivelse |
|--------|----------|----------------|-------------|
| Mixtral 8x7B | `mixtral-8x7b-32768` | 32,768 tokens | Balansert ytelse og hastighet |
| Llama 3.1 70B | `llama-3.1-70b-versatile` | 131,072 tokens | Høy kvalitet, stor context |
| Llama 3.1 8B | `llama-3.1-8b-instant` | 131,072 tokens | Rask, lavere kvalitet |
| Gemma 2 9B | `gemma2-9b-it` | 8,192 tokens | Google's modell |

**Anbefaling**: Start med `mixtral-8x7b-32768` for balanse mellom kvalitet og hastighet.

### Conversation History-format

Groq forventer OpenAI-format med `messages`-array:

```typescript
messages: [
  {
    role: "system",
    content: "You are a helpful healthcare assistant..."
  },
  {
    role: "user",
    content: "How do I take my blood pressure medication?"
  },
  {
    role: "assistant",
    content: "Take your blood pressure medication as prescribed by your doctor..."
  },
  {
    role: "user",
    content: "When should I take it?"
  }
]
```

**Konvertering fra ChatMessage[]**:
```typescript
conversationHistory?.map(msg => ({
  role: msg.sender_type === "User" ? "user" : "assistant",
  content: msg.message_text
}))
```

### Streaming (Valgfritt)

Groq støtter streaming for real-time responser:

```typescript
const response = await fetch(AI_API_ENDPOINT, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${AI_API_KEY}`
  },
  body: JSON.stringify({
    model: "mixtral-8x7b-32768",
    messages: messages,
    stream: true  // Aktiver streaming
  })
});

// Håndter stream
const reader = response.body.getReader();
const decoder = new TextDecoder();
let fullResponse = "";

while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  const chunk = decoder.decode(value);
  const lines = chunk.split("\n");

  for (const line of lines) {
    if (line.startsWith("data: ")) {
      const data = JSON.parse(line.slice(6));
      const content = data.choices?.[0]?.delta?.content;
      if (content) {
        fullResponse += content;
        // Oppdater UI her for real-time visning
      }
    }
  }
}

return { success: true, response: fullResponse };
```

### Fallback-system

Hvis Groq API feiler, bruker systemet hardkodede responser:

**Fil**: `services/chatbotService.ts`, metode `generateHealthResponse()` (linjer 100-143)

```typescript
async generateHealthResponse(userMessage: string): Promise<string> {
  const lowerMessage = userMessage.toLowerCase();

  if (lowerMessage.includes("medication") || lowerMessage.includes("medicine")) {
    return "I can help you with your medications. What would you like to know about your prescriptions?";
  }

  if (lowerMessage.includes("appointment") || lowerMessage.includes("doctor")) {
    return "I can help you manage your appointments. Would you like to schedule a visit with your doctor?";
  }

  if (lowerMessage.includes("remind") || lowerMessage.includes("reminder")) {
    return "I can set up reminders for you. What would you like to be reminded about?";
  }

  if (lowerMessage.includes("health") || lowerMessage.includes("vitals")) {
    return "I can help you track your health records. Would you like to view your recent vitals?";
  }

  if (lowerMessage.includes("prescription")) {
    return "I can help you with your prescriptions. Would you like to see your active prescriptions?";
  }

  // Default response
  return "I'm here to help with your health management. You can ask me about medications, appointments, reminders, or your health records. How can I assist you today?";
}
```

### Intent-analyse

**Fil**: `services/chatbotService.ts`, metode `analyzeIntent()` (linjer 60-98)

Enkel keyword-basert intent-detection:

```typescript
async analyzeIntent(message: string): Promise<string> {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes("medication") || lowerMessage.includes("medicine")) {
    return "medication_query";
  }
  if (lowerMessage.includes("appointment") || lowerMessage.includes("doctor")) {
    return "appointment_query";
  }
  if (lowerMessage.includes("remind") || lowerMessage.includes("reminder")) {
    return "reminder_request";
  }
  if (lowerMessage.includes("health") || lowerMessage.includes("vitals")) {
    return "health_query";
  }
  if (lowerMessage.includes("prescription")) {
    return "prescription_query";
  }

  return "general_query";
}
```

**Potensielle intents**:
- `medication_query` - Spørsmål om medisiner
- `appointment_query` - Legetime-relatert
- `reminder_request` - Be om påminnelse
- `health_query` - Helsedata/vitaler
- `prescription_query` - Resept-relatert
- `general_query` - Andre spørsmål

### Integrasjonssjekkliste

For å implementere Groq:

- [ ] 1. Opprett Groq API-konto på https://console.groq.com
- [ ] 2. Generer API-nøkkel
- [ ] 3. Legg til environment variables i `.env`:
  ```env
  NEXT_PUBLIC_AI_API_ENDPOINT=https://api.groq.com/openai/v1/chat/completions
  NEXT_PUBLIC_AI_API_KEY=gsk_din_groq_api_key_her
  ```
- [ ] 4. Tilpass `getAIResponse()`-metoden i `services/chatbotService.ts`
- [ ] 5. Velg Groq-modell (anbefalt: `mixtral-8x7b-32768`)
- [ ] 6. Tilpass system prompt for healthcare-kontekst
- [ ] 7. Test chat-funksjonalitet
- [ ] 8. Finjuster temperature og max_tokens
- [ ] 9. Implementer error handling
- [ ] 10. (Valgfritt) Implementer streaming for real-time responser

### Testing etter Groq-integrasjon

1. **Basic test**:
   - Logg inn som bruker
   - Gå til `/chatbot`
   - Send melding: "Hva er mine medisiner?"
   - Verifiser at Groq svarer

2. **Conversation history test**:
   - Send flere meldinger i sekvens
   - Verifiser at AI husker kontekst

3. **Fallback test**:
   - Sett feil API-key
   - Verifiser at fallback-responser vises

4. **Intent test**:
   - Test forskjellige typer spørsmål
   - Verifiser at intent detekteres korrekt

---

## State Management

### Zustand Stores

Applikasjonen bruker **Zustand 5.0.8** for global state management. Zustand er et lightweight alternativ til Redux med mindre boilerplate.

#### Fordeler med Zustand:
- Ingen providers nødvendig (direkte import)
- TypeScript-first
- Enkelt å teste
- Persist middleware for localStorage
- Minimalt boilerplate

### Store-oversikt

#### 1. authStore (`stores/authStore.ts`)

**Fil**: `stores/authStore.ts` (330 linjer)

**Ansvar**: Autentisering, session management, og brukerdata

##### State:
```typescript
interface AuthState {
  // User data
  user: User | null;              // Supabase User-objekt
  profile: UserProfile | null;    // DB user record med rolle
  session: Session | null;        // access_token, refresh_token, expires_at

  // Session tracking
  lastSessionCheck: number | null;
  sessionExpiresAt: number | null;

  // Hydration (for persist middleware)
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;

  // Actions
  signup: (data: SignupData) => Promise<boolean>;
  login: (data: LoginData) => Promise<boolean>;
  logout: () => Promise<void>;
  getValidSession: () => Promise<Session | null>;
  refreshSession: () => Promise<void>;
}
```

##### Key Methods:

**signup()**:
```typescript
signup: async (data: SignupData) => {
  const result = await authService.signup(data);

  if (result.error) {
    toast.error(result.error);
    return false;
  }

  set({
    user: result.user,
    profile: result.profile,
    session: result.session,
    sessionExpiresAt: result.session?.expires_at * 1000
  });

  return true;
}
```

**login()**:
```typescript
login: async (data: LoginData) => {
  const result = await authService.login(data);

  if (result.error) {
    toast.error(result.error);
    return false;
  }

  set({
    user: result.user,
    profile: result.profile,
    session: result.session,
    sessionExpiresAt: result.session?.expires_at * 1000
  });

  return true;
}
```

**getValidSession()** - VIKTIGSTE METODEN:
```typescript
getValidSession: async () => {
  const { session, sessionExpiresAt } = get();

  // Sjekk om session eksisterer
  if (!session) return null;

  // Sjekk om session er valid (med 30s buffer)
  const now = Date.now();
  const expiresAt = sessionExpiresAt || session.expires_at * 1000;

  if (expiresAt - now > 30000) {
    // Session er fortsatt valid
    set({ lastSessionCheck: now });
    return session;
  }

  // Session utgår snart - refresh
  await get().refreshSession();
  return get().session;
}
```

**refreshSession()**:
```typescript
refreshSession: async () => {
  const { data, error } = await supabase.auth.refreshSession();

  if (error || !data.session) {
    // Refresh failed - logg ut
    set({
      user: null,
      profile: null,
      session: null,
      sessionExpiresAt: null
    });
    return;
  }

  // Oppdater med ny session
  set({
    session: data.session,
    sessionExpiresAt: data.session.expires_at * 1000,
    lastSessionCheck: Date.now()
  });
}
```

**logout()**:
```typescript
logout: async () => {
  await authService.logout();

  // Clear state
  set({
    user: null,
    profile: null,
    session: null,
    lastSessionCheck: null,
    sessionExpiresAt: null
  });

  // Redirect til login
  window.location.href = "/auth";
}
```

##### Persistence:
```typescript
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // ... state og actions
    }),
    {
      name: "auth-storage",  // localStorage key
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      }
    }
  )
);
```

#### 2. chatbotStore (`stores/chatbotStore.ts`)

**Fil**: `stores/chatbotStore.ts` (155 linjer)

**Ansvar**: Chat-meldinger og AI-interaksjon

##### State:
```typescript
interface ChatbotState {
  messages: ChatMessage[];      // All chat messages
  isSending: boolean;           // Loading state

  // Actions
  sendMessage: (userId: number, messageText: string) => Promise<boolean>;
  addMessage: (message: ChatMessage) => void;
  clearMessages: () => void;
}
```

##### Key Method: sendMessage()

```typescript
sendMessage: async (userId: number, messageText: string) => {
  set({ isSending: true });

  try {
    // 1. Validerer session
    const session = await useAuthStore.getState().getValidSession();
    if (!session) {
      toast.error("Session expired. Please login again.");
      return false;
    }

    // 2. Legg til brukermelding
    const userMessage: ChatMessage = {
      message_id: Date.now(),
      user_id: userId,
      message_text: messageText,
      sender_type: "User",
      timestamp: new Date().toISOString(),
      intent: undefined
    };

    set((state) => ({
      messages: [...state.messages, userMessage]
    }));

    // 3. Analyser intent
    const intent = await chatbotService.analyzeIntent(messageText);

    // 4. Hent AI-respons
    const conversationHistory = get().messages;
    const aiResponse = await chatbotService.getAIResponse(
      messageText,
      conversationHistory
    );

    // 5. Legg til bot-svar
    if (aiResponse.success && aiResponse.response) {
      const botMessage: ChatMessage = {
        message_id: Date.now() + 1,
        user_id: userId,
        message_text: aiResponse.response,
        sender_type: "Bot",
        timestamp: new Date().toISOString(),
        intent: intent
      };

      set((state) => ({
        messages: [...state.messages, botMessage]
      }));

      return true;
    } else {
      // Fallback hvis AI feiler
      const fallbackMessage = await chatbotService.generateHealthResponse(messageText);

      const botMessage: ChatMessage = {
        message_id: Date.now() + 1,
        user_id: userId,
        message_text: fallbackMessage,
        sender_type: "Bot",
        timestamp: new Date().toISOString(),
        intent: intent
      };

      set((state) => ({
        messages: [...state.messages, botMessage]
      }));

      return true;
    }
  } catch (error) {
    console.error("Send message error:", error);
    toast.error("Failed to send message");
    return false;
  } finally {
    set({ isSending: false });
  }
}
```

#### 3. patientStore (`stores/patientStore.ts`)

**Fil**: `stores/patientStore.ts` (156 linjer)

**Ansvar**: Pasient-data (resepter, påminnelser, helsedata)

##### State:
```typescript
interface PatientState {
  // Data
  prescriptions: Prescription[];
  reminders: Reminder[];
  chatMessages: ChatMessage[];
  healthRecords: HealthRecord[];

  // Loading states
  isLoadingPrescriptions: boolean;
  isLoadingReminders: boolean;
  isLoadingHealthRecords: boolean;

  // Actions
  fetchAllPatientData: (userId: number) => Promise<void>;
  fetchPrescriptions: (userId: number) => Promise<void>;
  fetchReminders: (userId: number) => Promise<void>;
  fetchChatMessages: (userId: number) => Promise<void>;
  fetchHealthRecords: (userId: number) => Promise<void>;
}
```

##### Key Method: fetchAllPatientData()

```typescript
fetchAllPatientData: async (userId: number) => {
  // Henter all data parallelt
  await Promise.all([
    get().fetchPrescriptions(userId),
    get().fetchReminders(userId),
    get().fetchChatMessages(userId),
    get().fetchHealthRecords(userId)
  ]);
}
```

##### Eksempel: fetchPrescriptions()

```typescript
fetchPrescriptions: async (userId: number) => {
  set({ isLoadingPrescriptions: true });

  try {
    const data = await patientService.getPrescriptions(userId);
    set({ prescriptions: data });
  } catch (error) {
    console.error("Error fetching prescriptions:", error);
    toast.error("Failed to load prescriptions");
  } finally {
    set({ isLoadingPrescriptions: false });
  }
}
```

#### 4. adminStore (`stores/adminStore.ts`)

**Fil**: `stores/adminStore.ts` (858 linjer)

**Ansvar**: Admin-data og CRUD-operasjoner

##### State:
```typescript
interface AdminState {
  // Data
  prescribedMedicines: Medicine[];
  medicines: Medicine[];
  prescriptions: Prescription[];
  users: AdminUser[];
  doctors: Doctor[];
  healthRecords: HealthRecord[];
  reminders: Reminder[];

  // Loading states
  isLoadingMedicines: boolean;
  isLoadingPrescriptions: boolean;
  // ... etc for hver entitet

  // Fetch methods
  fetchAllAdminData: () => Promise<void>;
  fetchMedicines: () => Promise<void>;
  fetchPrescriptions: () => Promise<void>;
  fetchUsers: () => Promise<void>;
  fetchDoctors: () => Promise<void>;
  fetchHealthRecords: () => Promise<void>;
  fetchReminders: () => Promise<void>;

  // CRUD for Medicines
  createMedicine: (medicine: Omit<Medicine, "medicine_id" | "created_date">) => Promise<Result<Medicine>>;
  updateMedicine: (id: number, updates: Partial<Medicine>) => Promise<Result<Medicine>>;
  deleteMedicine: (id: number) => Promise<Result<void>>;

  // CRUD for Doctors
  createDoctor: (...) => Promise<Result<Doctor>>;
  updateDoctor: (...) => Promise<Result<Doctor>>;
  deleteDoctor: (...) => Promise<Result<void>>;

  // CRUD for Prescriptions
  createPrescription: (...) => Promise<Result<Prescription>>;
  updatePrescription: (...) => Promise<Result<Prescription>>;
  deletePrescription: (...) => Promise<Result<void>>;

  // CRUD for Health Records
  createHealthRecord: (...) => Promise<Result<HealthRecord>>;
  updateHealthRecord: (...) => Promise<Result<HealthRecord>>;
  deleteHealthRecord: (...) => Promise<Result<void>>;

  // CRUD for Reminders
  createReminder: (...) => Promise<Result<Reminder>>;
  updateReminder: (...) => Promise<Result<Reminder>>;
  deleteReminder: (...) => Promise<Result<void>>;
}
```

##### Eksempel: createMedicine()

```typescript
createMedicine: async (medicine) => {
  try {
    // Validerer session
    const session = await useAuthStore.getState().getValidSession();
    if (!session) {
      return { success: false, error: "Not authenticated" };
    }

    // API-kall
    const result = await adminService.createMedicine(medicine);

    if (result.success && result.data) {
      // Oppdater state
      set((state) => ({
        medicines: [...state.medicines, result.data]
      }));

      toast.success("Medicine created successfully");
      return result;
    }

    toast.error(result.error || "Failed to create medicine");
    return result;

  } catch (error) {
    console.error("Create medicine error:", error);
    return { success: false, error: error.message };
  }
}
```

### Bruk av Stores i Komponenter

#### Eksempel 1: useAuth i protected page
```typescript
function PatientDashboard() {
  const { profile } = useAuthStore();
  const { fetchAllPatientData, prescriptions, reminders } = usePatientStore();

  useEffect(() => {
    if (profile) {
      fetchAllPatientData(profile.user_id);
    }
  }, [profile]);

  return (
    <div>
      <h1>Welcome, {profile?.first_name}!</h1>
      {/* Render data */}
    </div>
  );
}
```

#### Eksempel 2: Chat-komponent
```typescript
function Chat() {
  const { messages, isSending, sendMessage } = useChatbotStore();
  const { profile } = useAuthStore();
  const [input, setInput] = useState("");

  const handleSend = async () => {
    if (!profile) return;
    await sendMessage(profile.user_id, input);
    setInput("");
  };

  return (
    <div>
      {messages.map(msg => (
        <div key={msg.message_id}>{msg.message_text}</div>
      ))}
      <input value={input} onChange={e => setInput(e.target.value)} />
      <button onClick={handleSend} disabled={isSending}>Send</button>
    </div>
  );
}
```

---

## Deployment og Konfigurasjon

### Build Scripts

**Fil**: `package.json`

```json
{
  "scripts": {
    "dev": "next dev",           // Development server (port 3000)
    "build": "next build",       // Production build
    "start": "next start",       // Production server
    "lint": "eslint"             // ESLint-sjekk
  }
}
```

### Development

```bash
# Installer dependencies
npm install

# Start development server
npm run dev

# Åpne http://localhost:3000
```

### Production Build

```bash
# Bygg for produksjon
npm run build

# Start produksjonsserver
npm start
```

**Build output**:
- `.next/` - Optimized build output
- Static assets pre-rendered
- Server Components kompilert
- API routes som serverless functions

### Deployment til Vercel

#### 1. Installer Vercel CLI
```bash
npm i -g vercel
```

#### 2. Deploy
```bash
vercel deploy
```

#### 3. Environment Variables i Vercel

Gå til Vercel Dashboard → Project Settings → Environment Variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://yjqcftbnyqvxxpsnfylq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Groq API
NEXT_PUBLIC_AI_API_ENDPOINT=https://api.groq.com/openai/v1/chat/completions
NEXT_PUBLIC_AI_API_KEY=gsk_din_groq_api_key_her
```

**Viktig**: Alle environment variables MÅ settes i Vercel for at applikasjonen skal fungere i produksjon.

#### 4. Domain Setup

- Vercel gir automatisk `.vercel.app` domain
- Custom domain kan legges til i Project Settings

### Build-optimalisering

#### React 19 Compiler

**Aktivert i** `next.config.ts`:
```typescript
const nextConfig: NextConfig = {
  reactCompiler: true  // Automatisk memoization
};
```

**Fordeler**:
- Automatisk `useMemo` og `useCallback`
- Bedre performance uten manuell optimalisering
- Redusert re-rendering

#### Image Optimization

Next.js Image-component optimaliserer automatisk:
```typescript
import Image from "next/image";

<Image
  src="/path/to/image.jpg"
  width={500}
  height={300}
  alt="Description"
/>
```

**Fordeler**:
- Automatisk responsiv skalering
- Lazy loading
- WebP/AVIF-konvertering
- Optimalisert for Vercel CDN

#### Code Splitting

Next.js gjør automatisk code splitting:
- Hver page er en separat chunk
- Shared components bundlet smart
- Dynamic imports for on-demand loading:

```typescript
import dynamic from "next/dynamic";

const HeavyComponent = dynamic(() => import("./HeavyComponent"), {
  loading: () => <p>Loading...</p>
});
```

### Monitoring og Logging

#### Vercel Analytics

Legg til i `app/layout.tsx`:
```typescript
import { Analytics } from "@vercel/analytics/react";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

#### Error Tracking

Integrer Sentry eller lignende:
```bash
npm install @sentry/nextjs
```

### Performance Checklist

- [x] React Compiler aktivert
- [x] Image optimization via Next.js Image
- [x] Code splitting automatisk
- [ ] Analytics installert (valgfritt)
- [ ] Error tracking (valgfritt)
- [ ] Lighthouse score > 90
- [ ] Core Web Vitals optimalisert

---

## Vedlegg

### Nyttige Kommandoer

```bash
# Development
npm run dev              # Start dev server
npm run build            # Production build
npm run start            # Start production server
npm run lint             # Run ESLint

# Vercel
vercel deploy            # Deploy til preview
vercel --prod            # Deploy til production
vercel env pull          # Hent environment variables

# Supabase (hvis du bruker Supabase CLI)
supabase start           # Start local Supabase
supabase db reset        # Reset database
supabase db push         # Push schema changes
```

### Viktige Filer for Groq-integrasjon

1. **`.env`** - Legg til API credentials
2. **`services/chatbotService.ts`** - Tilpass `getAIResponse()`
3. **`components/chatbot/chat.tsx`** - Fjern fallback-varsel etter integrasjon

### Support og Ressurser

- **Next.js Docs**: https://nextjs.org/docs
- **Supabase Docs**: https://supabase.com/docs
- **Groq Docs**: https://console.groq.com/docs
- **Zustand Docs**: https://docs.pmnd.rs/zustand
- **shadcn/ui**: https://ui.shadcn.com

### Kontaktinformasjon for Prosjektet

- **Repository**: C:\Kodeprosjekter\chatbot2
- **Database**: Supabase (yjqcftbnyqvxxpsnfylq.supabase.co)
- **Framework**: Next.js 16.0.1
- **Node Version**: 18+ anbefalt

---

**Dokumentasjon oppdatert**: 2025-11-10
**Versjon**: 1.0.0
**Status**: Klar for Groq-integrasjon
