import Link from "next/link";
import {
  IconBell,
  IconMessage,
  IconHeart,
  IconClock,
  IconShieldCheck,
  IconChecklist,
} from "@tabler/icons-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <IconHeart className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-foreground">
                HealthCare Assistant
              </span>
            </div>
            <Link
              href="/auth"
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 my-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-muted text-foreground rounded-full text-xs font-medium">
              <IconMessage className="h-3.5 w-3.5" />
              AI-Powered Health Assistant
            </div>
            <h1 className="text-3xl lg:text-5xl font-bold text-foreground leading-tight">
              Never Miss Your <span className="text-primary">Medication</span>{" "}
              Again
            </h1>
            <p className="text-base text-muted-foreground">
              Your friendly AI chatbot companion that helps you stay on top of
              your health. Perfect for seniors and their caregivers - get timely
              reminders, track medications, and manage your health with ease.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/auth"
                className="inline-flex items-center justify-center px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors shadow-lg text-sm"
              >
                Start Free Today
              </Link>
              <button className="inline-flex items-center justify-center px-6 py-2.5 border-2 border-input text-foreground rounded-lg font-semibold hover:bg-accent hover:text-accent-foreground transition-colors text-sm">
                Learn More
              </button>
            </div>
            <div className="flex items-center gap-6 pt-2">
              <div className="flex items-center gap-2">
                <IconShieldCheck className="h-4 w-4 text-green-600" />
                <span className="text-xs text-muted-foreground">
                  HIPAA Compliant
                </span>
              </div>
              <div className="flex items-center gap-2">
                <IconHeart className="h-4 w-4 text-red-600" />
                <span className="text-xs text-muted-foreground">
                  Senior Friendly
                </span>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="relative bg-muted/50 rounded-3xl p-8 shadow-2xl">
              {/* Chat Interface Mockup */}
              <div className="bg-card rounded-2xl shadow-lg overflow-hidden border">
                <div className="bg-primary px-6 py-4 flex items-center gap-3">
                  <div className="h-10 w-10 bg-primary-foreground rounded-full flex items-center justify-center">
                    <IconMessage className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold text-primary-foreground">
                      Health Assistant
                    </div>
                    <div className="text-xs text-primary-foreground/80">
                      Always here to help
                    </div>
                  </div>
                </div>
                <div className="p-6 space-y-4 h-96 overflow-hidden bg-background">
                  <div className="flex gap-3">
                    <div className="h-8 w-8 bg-muted rounded-full flex items-center justify-center shrink-0">
                      <IconMessage className="h-5 w-5 text-primary" />
                    </div>
                    <div className="bg-muted rounded-2xl rounded-tl-none px-4 py-3 max-w-[80%]">
                      <p className="text-sm text-foreground">
                        Good morning! It&apos;s time to take your blood pressure
                        medication.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3 justify-end">
                    <div className="bg-primary rounded-2xl rounded-tr-none px-4 py-3 max-w-[80%]">
                      <p className="text-sm text-primary-foreground">
                        Thanks for reminding me!
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="h-8 w-8 bg-muted rounded-full flex items-center justify-center shrink-0">
                      <IconMessage className="h-5 w-5 text-primary" />
                    </div>
                    <div className="bg-muted rounded-2xl rounded-tl-none px-4 py-3 max-w-[80%]">
                      <p className="text-sm text-foreground">
                        You&apos;re welcome! Would you like me to log this in
                        your health records?
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Floating notification badge */}
            <div className="absolute -top-4 -right-4 bg-card rounded-xl shadow-lg px-4 py-3 flex items-center gap-3 border">
              <div className="h-10 w-10 bg-muted rounded-full flex items-center justify-center">
                <IconBell className="h-6 w-6 text-primary animate-pulse" />
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground">
                  Reminder Set
                </div>
                <div className="text-xs text-muted-foreground">
                  Medicine at 2:00 PM
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 my-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Everything You Need for Better Health
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Our AI-powered assistant makes managing your health simple and
            stress-free
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-card rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border">
            <div className="h-14 w-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
              <IconBell className="h-7 w-7 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-3">
              Smart Reminders
            </h3>
            <p className="text-muted-foreground">
              Get timely notifications for medications, appointments, and health
              check-ups. Never forget important health tasks again.
            </p>
          </div>

          <div className="bg-card rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border">
            <div className="h-14 w-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
              <IconMessage className="h-7 w-7 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-3">
              24/7 AI Chatbot
            </h3>
            <p className="text-muted-foreground">
              Ask questions about your medications, health conditions, or get
              general health advice anytime, day or night.
            </p>
          </div>

          <div className="bg-card rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border">
            <div className="h-14 w-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
              <IconChecklist className="h-7 w-7 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-3">
              Medication Tracking
            </h3>
            <p className="text-muted-foreground">
              Keep track of all your prescriptions, dosages, and schedules in
              one secure place. Share with family or caregivers easily.
            </p>
          </div>

          <div className="bg-card rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border">
            <div className="h-14 w-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
              <IconHeart className="h-7 w-7 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-3">
              Health Records
            </h3>
            <p className="text-muted-foreground">
              Store and access your vital signs, lab results, and medical
              history securely. All in one convenient dashboard.
            </p>
          </div>

          <div className="bg-card rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border">
            <div className="h-14 w-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
              <IconClock className="h-7 w-7 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-3">
              Simple & Easy
            </h3>
            <p className="text-muted-foreground">
              Designed with seniors in mind. Large text, clear buttons, and
              intuitive navigation make it easy to use for everyone.
            </p>
          </div>

          <div className="bg-card rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border">
            <div className="h-14 w-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
              <IconShieldCheck className="h-7 w-7 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-3">
              Secure & Private
            </h3>
            <p className="text-muted-foreground">
              Your health data is encrypted and protected. We follow strict
              HIPAA compliance to keep your information safe and private.
            </p>
          </div>
        </div>
      </section>

      {/* Benefits for Elderly Section */}
      <section className="bg-primary py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl font-bold text-primary-foreground mb-6">
                Made Especially for Seniors
              </h2>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="h-6 w-6 bg-primary-foreground/20 rounded-full flex items-center justify-center shrink-0 mt-1">
                    <svg
                      className="h-4 w-4 text-primary-foreground"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-primary-foreground mb-1">
                      Large, Clear Interface
                    </h3>
                    <p className="text-primary-foreground/80">
                      Easy-to-read text and buttons designed for better
                      visibility and accessibility
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="h-6 w-6 bg-primary-foreground/20 rounded-full flex items-center justify-center shrink-0 mt-1">
                    <svg
                      className="h-4 w-4 text-primary-foreground"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-primary-foreground mb-1">
                      Family Connection
                    </h3>
                    <p className="text-primary-foreground/80">
                      Share updates with family members and caregivers
                      automatically
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="h-6 w-6 bg-primary-foreground/20 rounded-full flex items-center justify-center shrink-0 mt-1">
                    <svg
                      className="h-4 w-4 text-primary-foreground"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-primary-foreground mb-1">
                      Gentle Reminders
                    </h3>
                    <p className="text-primary-foreground/80">
                      Friendly, non-intrusive notifications that respect your
                      daily routine
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-2xl p-8">
              <div className="bg-card rounded-xl p-6 border">
                <div className="flex items-start gap-4 mb-4">
                  <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center shrink-0">
                    <IconMessage className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-foreground mb-1">
                      &quot;This app changed my life!&quot;
                    </div>
                    <p className="text-sm text-muted-foreground">
                      I used to forget my medications all the time. Now the
                      chatbot reminds me gently, and I can even ask it questions
                      about my health. It&apos;s like having a personal nurse!
                    </p>
                    <div className="mt-3 text-sm font-medium text-foreground">
                      - Margaret, 72
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 my-10">
        <div className="bg-accent rounded-3xl p-12 text-center border">
          <h2 className="text-4xl font-bold text-accent-foreground mb-4">
            Ready to Take Control of Your Health?
          </h2>
          <p className="text-xl text-accent-foreground/80 mb-8 max-w-2xl mx-auto">
            Join thousands of seniors who are living healthier, more independent
            lives with our AI health assistant
          </p>
          <Link
            href="/auth"
            className="inline-flex items-center justify-center px-8 py-4 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors shadow-lg"
          >
            Get Started Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex items-center gap-2">
              <IconHeart className="h-6 w-6 text-primary" />
              <span className="font-bold text-foreground">
                HealthCare Assistant
              </span>
            </div>
            <div className="text-sm text-muted-foreground">
              © 2025 HealthCare Assistant. Making health management simple for
              everyone.
            </div>
            <div className="px-4 py-2 bg-muted/50 rounded-lg border border-border">
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold">Note:</span> This is a prototype
                developed as a project for Human-Computer Interaction (HCI)
                course.
                <br />
                Not intended for actual medical use (YET?).
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
