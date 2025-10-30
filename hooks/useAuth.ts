"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import type { UserRole } from "@/types/database";

export function useAuth(requiredRole?: UserRole) {
  const router = useRouter();
  const { user, profile, getCurrentUser, _hasHydrated } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const hasCheckedAuth = useRef(false);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;

    const checkAuth = async () => {
      // Wait for hydration to complete before checking auth
      if (!_hasHydrated) {
        return;
      }

      // Prevent multiple auth checks
      if (hasCheckedAuth.current) {
        return;
      }

      setIsLoading(true);

      try {
        // If no user in store after hydration, try to get current user from Supabase
        if (!user) {
          await getCurrentUser();
        }

        // Check if component is still mounted
        if (!isMounted.current) return;

        const currentUser = useAuthStore.getState().user;
        const currentProfile = useAuthStore.getState().profile;

        // If no user, redirect to auth page
        if (!currentUser) {
          hasCheckedAuth.current = true;
          router.push("/auth");
          setIsLoading(false);
          return;
        }

        // If role is required, check authorization
        if (requiredRole && currentProfile) {
          if (currentProfile.role !== requiredRole) {
            // Redirect to correct dashboard
            hasCheckedAuth.current = true;
            const correctDashboard =
              currentProfile.role === "user"
                ? "/patient-dashboard"
                : "/admin-dashboard";
            router.push(correctDashboard);
            setIsLoading(false);
            return;
          }
        }

        hasCheckedAuth.current = true;
        setIsAuthorized(true);
        setIsLoading(false);
      } catch (error) {
        console.error("Auth check error:", error);
        if (isMounted.current) {
          hasCheckedAuth.current = true;
          setIsLoading(false);
          router.push("/auth");
        }
      }
    };

    checkAuth();

    // Cleanup function
    return () => {
      isMounted.current = false;
    };
  }, [user, profile, requiredRole, router, getCurrentUser, _hasHydrated]);

  return { user, profile, isLoading, isAuthorized };
}
