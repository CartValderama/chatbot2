'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

type UserType = 'patient' | 'doctor';

export function useAuth(requiredUserType?: UserType) {
  const router = useRouter();
  const { user, profile, getCurrentUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const hasCheckedAuth = useRef(false);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;

    const checkAuth = async () => {
      // Prevent multiple auth checks
      if (hasCheckedAuth.current) {
        return;
      }

      setIsLoading(true);

      try {
        // If no user in store, try to get current user
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
          router.push('/auth');
          setIsLoading(false);
          return;
        }

        // If user type is required, check authorization
        if (requiredUserType && currentProfile) {
          if (currentProfile.user_type !== requiredUserType) {
            // Redirect to correct dashboard
            hasCheckedAuth.current = true;
            const correctDashboard = currentProfile.user_type === 'patient'
              ? '/patient-dashboard'
              : '/doctor-dashboard';
            router.push(correctDashboard);
            setIsLoading(false);
            return;
          }
        }

        hasCheckedAuth.current = true;
        setIsAuthorized(true);
        setIsLoading(false);
      } catch (error) {
        console.error('Auth check error:', error);
        if (isMounted.current) {
          hasCheckedAuth.current = true;
          setIsLoading(false);
          router.push('/auth');
        }
      }
    };

    checkAuth();

    // Cleanup function
    return () => {
      isMounted.current = false;
    };
  }, [user, profile, requiredUserType, router, getCurrentUser]);

  return { user, profile, isLoading, isAuthorized };
}
