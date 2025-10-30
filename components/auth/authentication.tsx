"use client";

import { useState } from "react";
import { LoginForm } from "./login-form";
import { SignupForm } from "./signup-form";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";

export default function Auth() {
  const [view, setView] = useState<"login" | "signup">("login");

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="bg-muted relative hidden lg:block overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1584515933487-779824d29309?q=80&w=2070&auto=format&fit=crop"
          alt="Abstract illustration of elderly care"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/60 to-black/20" />
        <div className="absolute bottom-8 left-8 right-8 text-white">
          <h2 className="text-3xl font-bold mb-2">Caring for Your Health</h2>
          <p className="text-lg opacity-90">
            Your trusted companion for medication management and health
            reminders
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-4 p-6">
        {/* Brand */}

        <Link href={"/"} className="w-fit">
          <ArrowLeft className="w-5 h-5" />
        </Link>

        {/* Form Section */}
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-md">
            {view === "login" ? (
              <LoginForm setView={setView} />
            ) : (
              <SignupForm setView={setView} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
