"use client";

import { useState } from "react";
import { LoginForm } from "./login-form";
import { SignupForm } from "./signup-form";
import { GalleryVerticalEnd } from "lucide-react";

export default function Auth() {
  const [view, setView] = useState<"login" | "signup">("login");

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        {/* Brand */}
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-4" />
            </div>
            MediCare
          </a>
        </div>

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

      {/* Right Section */}
      <div className="bg-muted relative hidden lg:block"></div>
    </div>
  );
}
