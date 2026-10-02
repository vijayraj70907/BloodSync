import { useState, useEffect } from 'react';

export default function GoogleAuthButton({ onGoogleSuccess, onError, text = 'Sign in with Google' }) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load Google Identity Services script dynamically if available
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    if (!window.google && !document.getElementById('google-jssdk')) {
      const script = document.createElement('script');
      script.id = 'google-jssdk';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if (window.google?.accounts?.id) {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: (response) => {
              if (response.credential) {
                onGoogleSuccess({ credential: response.credential });
              }
            },
          });
        }
      };
      document.body.appendChild(script);
    } else if (window.google?.accounts?.id) {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response) => {
          if (response.credential) {
            onGoogleSuccess({ credential: response.credential });
          }
        },
      });
    }
  }, []);

  const handleClick = () => {
    setLoading(true);
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    if (window.google?.accounts?.id && clientId) {
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // Fallback to manual click trigger if prompt is blocked or skipped
          triggerFallbackGoogleLogin();
        }
      });
    } else {
      triggerFallbackGoogleLogin();
    }
  };

  const triggerFallbackGoogleLogin = () => {
    // Prompt mock/dev user details if Client ID isn't configured yet, or guide user
    const emailPrompt = window.prompt("Google Sign-In Simulation:\nEnter your Google Email address:", "user@gmail.com");
    if (!emailPrompt) {
      setLoading(false);
      return;
    }

    onGoogleSuccess({
      userInfo: {
        email: emailPrompt,
        name: emailPrompt.split('@')[0],
        googleId: 'google_user_' + Date.now(),
      }
    });
    setLoading(false);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      style={{
        width: '100%',
        padding: '11px 16px',
        background: 'white',
        color: '#374151',
        border: '1.5px solid #E5E7EB',
        borderRadius: 50,
        fontSize: 14,
        fontWeight: 700,
        cursor: 'pointer',
        fontFamily: 'inherit',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        transition: 'all 0.15s ease',
      }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        />
      </svg>
      {loading ? 'Connecting...' : text}
    </button>
  );
}
