import React, { useCallback, useEffect, useState } from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import Button from './ui/Button';
import Card from './ui/Card';
import { authService, getProfileFromUser } from '../lib/auth';
import type { AppUser } from '../types/user';

interface AuthScreenProps {
  onAuthSuccess: (userData: AppUser) => void;
}

function getMessageFromError(error: unknown): string {
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message: string }).message);
  }
  return 'Something went wrong. Please try again.';
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>('Checking your session...');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const syncSession = useCallback(async () => {
    try {
      const session = await authService.getSession();
      if (session?.user) {
        const profile = getProfileFromUser(session.user);
        if (profile) {
          onAuthSuccess(profile);
          return true;
        }
      }
    } catch {
      // ignore and fall back to direct user lookup
    }

    try {
      const user = await authService.getCurrentUser();
      const profile = getProfileFromUser(user);
      if (profile) {
        onAuthSuccess(profile);
        return true;
      }
    } catch {
      // still no user, user must authenticate
    }

    return false;
  }, [onAuthSuccess]);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    syncSession()
      .then((hasSession) => {
        if (isMounted) {
          setStatusMessage(hasSession ? 'Signing you in...' : null);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    const {
      data: { subscription },
    } = authService.onAuthStateChange((_event, session) => {
      if (!isMounted || !session?.user) {
        return;
      }

      const profile = getProfileFromUser(session.user);
      if (profile) {
        onAuthSuccess(profile);
        setStatusMessage(null);
        setErrorMessage(null);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [onAuthSuccess, syncSession]);

  const handleGoogleAuth = async () => {
    setErrorMessage(null);
    setStatusMessage('Redirecting to Google for secure sign-in...');
    setIsLoading(true);

    try {
      // Use the full URL including the port for more specific redirect
      await authService.signInWithGoogle(`${window.location.origin}${window.location.pathname}`);
    } catch (error) {
      setErrorMessage(getMessageFromError(error));
      setStatusMessage(null);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-body text-strong px-4 py-10 flex flex-col">
      <div className="max-w-md w-full mx-auto space-y-8">
        <header className="space-y-4 text-center">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-brand-600 text-inverse flex items-center justify-center shadow-soft">
            <Sparkles size={22} />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold">Sign in to Edutu</h1>
            <p className="text-soft">
              We use Google for secure, password-free access. Sign in to unlock personalised roadmaps, analytics,
              and your AI mentor.
            </p>
          </div>
        </header>

        <Card className="p-6 space-y-5">
          <Button
            type="button"
            onClick={handleGoogleAuth}
            disabled={isLoading}
            className="w-full justify-center gap-2 bg-gradient-to-r from-[#4285F4] to-[#3367D6] text-white hover:opacity-95 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Starting Google sign-in...</span>
              </>
            ) : (
              <>
                <Sparkles size={18} />
                <span>Continue with Google</span>
              </>
            )}
          </Button>

          <div className="rounded-2xl bg-surface-subtle px-4 py-3 text-sm text-muted">
            We only request your name and email. Edutu never sees your password.
          </div>
        </Card>

        {errorMessage && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</div>
        )}

        {statusMessage && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {statusMessage}
          </div>
        )}

        <p className="text-center text-xs text-muted">
          Having trouble? Make sure pop-ups are allowed for this site and try again.
        </p>
      </div>
    </div>
  );
};

export default AuthScreen;
