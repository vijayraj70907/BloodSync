import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PasswordInput from '../components/PasswordInput';
import GoogleAuthButton from '../components/GoogleAuthButton';

export default function Login() {
  const navigate = useNavigate();
  const { login, loginWithGoogle, getSecurityQuestion, resetPasswordWithSecurity, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Forgot Password Modal State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: Email, 2: Security Question & Reset
  const [forgotEmail, setForgotEmail] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    const result = await login(email, password);
    if (result.success) navigate('/dashboard');
    else setError(result.message);
  };

  const handleGoogleAuth = async (payload) => {
    setError('');
    const result = await loginWithGoogle(payload);
    if (result.success) navigate('/dashboard');
    else setError(result.message);
  };

  const handleForgotFetchQuestion = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotLoading(true);
    const result = await getSecurityQuestion(forgotEmail);
    setForgotLoading(false);
    if (result.success) {
      setSecurityQuestion(result.securityQuestion);
      setForgotStep(2);
    } else {
      setForgotError(result.message);
    }
  };

  const handleForgotResetSubmit = async (e) => {
    e.preventDefault();
    setForgotError('');

    if (newPassword !== confirmNewPassword) {
      setForgotError('New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setForgotError('Password must be at least 6 characters');
      return;
    }

    setForgotLoading(true);
    const result = await resetPasswordWithSecurity(forgotEmail, securityAnswer, newPassword);
    setForgotLoading(false);

    if (result.success) {
      setShowForgotModal(false);
      setSuccessMsg('Password reset successfully! Please sign in with your new password.');
      setEmail(forgotEmail);
      setPassword('');
      setForgotStep(1);
      setForgotEmail('');
      setSecurityAnswer('');
      setNewPassword('');
      setConfirmNewPassword('');
    } else {
      setForgotError(result.message);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '11px 14px',
    border: '1.5px solid #E5E7EB',
    borderRadius: 8,
    fontSize: 14,
    fontFamily: 'inherit',
    outline: 'none',
    boxSizing: 'border-box',
    background: 'white',
    color: '#111',
  };

  const labelStyle = {
    fontSize: 11,
    fontWeight: 700,
    color: '#6B7280',
    display: 'block',
    marginBottom: 5,
    letterSpacing: 0.5,
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @media (max-width: 768px) {
          .login-left { display: none !important; }
          .login-right { width: 100% !important; padding: 1.5rem !important; }
        }
      `}</style>

      {/* Left Branding Section */}
      <div
        className="login-left"
        style={{
          width: '50%',
          background: '#8B0000',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '3rem 3.5rem',
          flexShrink: 0,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', bottom: -140, right: -140, width: 480, height: 480, borderRadius: '50%', background: 'rgba(0,0,0,0.2)' }} />
        <div style={{ position: 'absolute', top: -80, left: -80, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />

        <div style={{ position: 'relative', zIndex: 2 }}>
          <img src="/logo.png" alt="BloodSync" style={{ height: 72, filter: 'brightness(0) invert(1)' }} />
        </div>

        <div style={{ position: 'relative', zIndex: 2 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: 2, display: 'block', marginBottom: 20 }}>
            REAL-TIME BLOOD MATCHING
          </span>
          <h2 style={{ fontSize: 62, fontWeight: 900, color: 'white', letterSpacing: '-2.5px', lineHeight: 1.02, margin: '0 0 24px' }}>
            Find Blood.<br />
            <span style={{ color: '#FFAAAA' }}>Save Lives.</span><br />
            Right Now.
          </h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.55)', lineHeight: 1.75, maxWidth: 380, margin: 0 }}>
            India's real-time blood donor network connecting patients with verified donors across all 28 states.
          </p>
        </div>

        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ height: 1, background: 'rgba(255,255,255,0.12)', marginBottom: 24 }} />
          <div style={{ display: 'flex', gap: 40 }}>
            {[
              { num: '8 Groups', label: 'all compatible' },
              { num: '28', label: 'States covered' },
              { num: '< 1 min', label: 'to post request' },
            ].map((s) => (
              <div key={s.label}>
                <div style={{ fontSize: 22, fontWeight: 900, color: 'white', letterSpacing: '-1px' }}>{s.num}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 3, letterSpacing: 0.3 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Login Form Section */}
      <div
        className="login-right"
        style={{
          width: '50%',
          background: '#FFF8F8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
        }}
      >
        <div
          style={{
            background: 'white',
            borderRadius: 20,
            border: '1px solid #E5E7EB',
            padding: '2.5rem',
            width: '100%',
            maxWidth: 420,
            boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <img src="/logo.png" alt="BloodSync" style={{ height: 40 }} />
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#0F0F0F', letterSpacing: '-0.5px' }}>Welcome back</div>
              <div style={{ fontSize: 12, color: '#9CA3AF' }}>Sign in to your donor account</div>
            </div>
          </div>

          {/* Success Message Notification */}
          {successMsg && (
            <div style={{ background: '#F0FDF4', color: '#166534', border: '1px solid #BBF7D0', borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 16 }}>
              {successMsg}
            </div>
          )}

          {/* Error Message Notification */}
          {error && (
            <div style={{ background: '#FEF2F2', color: '#8B0000', border: '1px solid #FDE8E8', borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 16 }}>
              {error}
            </div>
          )}

          {/* Google OAuth Button */}
          <div style={{ marginBottom: 18 }}>
            <GoogleAuthButton onGoogleSuccess={handleGoogleAuth} text="Continue with Google" />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ flex: 1, height: 1, background: '#E5E7EB' }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.5 }}>OR</span>
            <div style={{ flex: 1, height: 1, background: '#E5E7EB' }} />
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={labelStyle}>EMAIL ADDRESS</label>
              <input style={inputStyle} type="email" placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                <label style={{ ...labelStyle, marginBottom: 0 }}>PASSWORD</label>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotModal(true);
                    setForgotStep(1);
                    setForgotError('');
                  }}
                  style={{ background: 'none', border: 'none', color: '#8B0000', fontSize: 12, fontWeight: 700, cursor: 'pointer', padding: 0 }}
                >
                  Forgot Password?
                </button>
              </div>
              <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password" required />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '13px',
                background: '#8B0000',
                color: 'white',
                border: 'none',
                borderRadius: 50,
                fontSize: 15,
                fontWeight: 800,
                cursor: 'pointer',
                fontFamily: 'inherit',
                marginTop: 4,
                letterSpacing: '0.3px',
              }}
            >
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>

          <div style={{ height: 1, background: '#F3F4F6', margin: '22px 0' }} />

          <p style={{ textAlign: 'center', fontSize: 13, color: '#6B7280', margin: 0 }}>
            New donor?{' '}
            <Link to="/register" style={{ color: '#8B0000', fontWeight: 700, textDecoration: 'none' }}>
              Create an account
            </Link>
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
            backdropFilter: 'blur(4px)',
          }}
        >
          <div
            style={{
              background: 'white',
              borderRadius: 16,
              maxWidth: 420,
              width: '100%',
              padding: '24px',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
              border: '1px solid #E5E7EB',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#111', margin: 0 }}>Reset Password</h3>
              <button
                onClick={() => setShowForgotModal(false)}
                style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#9CA3AF' }}
              >
                ✕
              </button>
            </div>

            {forgotError && (
              <div style={{ background: '#FEF2F2', color: '#8B0000', border: '1px solid #FDE8E8', borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 14 }}>
                {forgotError}
              </div>
            )}

            {forgotStep === 1 ? (
              <form onSubmit={handleForgotFetchQuestion} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <p style={{ fontSize: 13, color: '#6B7280', margin: 0, lineHeight: 1.5 }}>
                  Enter your registered email address to verify your account and retrieve your security question.
                </p>
                <div>
                  <label style={labelStyle}>REGISTERED EMAIL</label>
                  <input
                    style={inputStyle}
                    type="email"
                    placeholder="you@email.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={forgotLoading}
                  style={{
                    width: '100%',
                    padding: '11px',
                    background: '#8B0000',
                    color: 'white',
                    border: 'none',
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {forgotLoading ? 'Verifying Account...' : 'Continue →'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleForgotResetSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ background: '#F9FAFB', padding: '12px', borderRadius: 8, border: '1px solid #E5E7EB' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', letterSpacing: 0.5 }}>SECURITY QUESTION</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#111', marginTop: 3 }}>{securityQuestion}</div>
                </div>

                <div>
                  <label style={labelStyle}>YOUR SECURITY ANSWER</label>
                  <input
                    style={inputStyle}
                    type="text"
                    placeholder="Enter your security answer"
                    value={securityAnswer}
                    onChange={(e) => setSecurityAnswer(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label style={labelStyle}>NEW PASSWORD</label>
                  <PasswordInput
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    required
                    minLength={6}
                  />
                </div>

                <div>
                  <label style={labelStyle}>CONFIRM NEW PASSWORD</label>
                  <PasswordInput
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="Confirm new password"
                    required
                    minLength={6}
                  />
                </div>

                <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                  <button
                    type="button"
                    onClick={() => setForgotStep(1)}
                    style={{
                      padding: '11px',
                      background: 'white',
                      border: '1px solid #E5E7EB',
                      borderRadius: 8,
                      fontSize: 13,
                      fontWeight: 600,
                      color: '#374151',
                      cursor: 'pointer',
                    }}
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    style={{
                      flex: 1,
                      padding: '11px',
                      background: '#8B0000',
                      color: 'white',
                      border: 'none',
                      borderRadius: 8,
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {forgotLoading ? 'Updating Password...' : 'Save New Password'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}