import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PasswordInput from '../components/PasswordInput';
import PhoneInput from '../components/PhoneInput';
import GoogleAuthButton from '../components/GoogleAuthButton';
import { isValidGoogleMapsUrl } from '../utils/urlUtils';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar',
  'Chhattisgarh', 'Delhi', 'Goa', 'Gujarat', 'Haryana',
  'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
  'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya',
  'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan',
  'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
];

const SECURITY_QUESTIONS = [
  'What was the name of your first school?',
  'What is your favorite place?',
  'What was your childhood nickname?',
  'What is your favorite food?',
];

export default function Register() {
  const navigate = useNavigate();
  const { register, loginWithGoogle, loading } = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    bloodGroup: '',
    state: '',
    city: '',
    locationLink: '',
    securityQuestion: SECURITY_QUESTIONS[0],
    securityAnswer: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.locationLink && !isValidGoogleMapsUrl(form.locationLink)) {
      setError('Please provide a valid Google Maps location link (e.g. https://maps.google.com/...)');
      return;
    }

    const result = await register(form);
    if (result.success) navigate('/dashboard');
    else setError(result.message);
  };

  const handleGoogleAuth = async (payload) => {
    setError('');
    const result = await loginWithGoogle(payload);
    if (result.success) navigate('/dashboard');
    else setError(result.message);
  };

  const inputStyle = {
    width: '100%',
    padding: '9px 12px',
    border: '1.5px solid #E5E7EB',
    borderRadius: 8,
    fontSize: 13,
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
    marginBottom: 4,
    letterSpacing: 0.5,
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @media (max-width: 768px) {
          .register-left { display: none !important; }
          .register-right { width: 100% !important; padding: 1.5rem !important; align-items: flex-start !important; }
          .register-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* Left Branding Panel */}
      <div
        className="register-left"
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
            JOIN AS A DONOR
          </span>
          <h2 style={{ fontSize: 62, fontWeight: 900, color: 'white', letterSpacing: '-2.5px', lineHeight: 1.02, margin: '0 0 24px' }}>
            Become a<br />
            <span style={{ color: '#FFAAAA' }}>Lifesaver</span><br />
            Today.
          </h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.55)', lineHeight: 1.75, maxWidth: 380, margin: 0 }}>
            Register as a donor and be the reason someone gets to go home to their family today.
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

      {/* Right Form Panel */}
      <div
        className="register-right"
        style={{
          width: '50%',
          background: '#FFF8F8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          overflowY: 'auto',
        }}
      >
        <div
          style={{
            background: 'white',
            borderRadius: 20,
            border: '1px solid #E5E7EB',
            padding: '2rem',
            width: '100%',
            maxWidth: 460,
            boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <img src="/logo.png" alt="BloodSync" style={{ height: 40 }} />
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#0F0F0F', letterSpacing: '-0.5px' }}>Create account</div>
              <div style={{ fontSize: 12, color: '#9CA3AF' }}>Join as a blood donor</div>
            </div>
          </div>

          {error && (
            <div style={{ background: '#FEF2F2', color: '#8B0000', border: '1px solid #FDE8E8', borderRadius: 8, padding: '8px 12px', fontSize: 12, marginBottom: 12 }}>
              {error}
            </div>
          )}

          {/* Google Sign In */}
          <div style={{ marginBottom: 14 }}>
            <GoogleAuthButton onGoogleSuccess={handleGoogleAuth} text="Continue with Google" />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div style={{ flex: 1, height: 1, background: '#E5E7EB' }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.5 }}>OR REGISTER WITH EMAIL</span>
            <div style={{ flex: 1, height: 1, background: '#E5E7EB' }} />
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div className="register-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={labelStyle}>FULL NAME</label>
                <input style={inputStyle} name="name" placeholder="Rahul Bora" value={form.name} onChange={handleChange} required />
              </div>
              <div>
                <label style={labelStyle}>PHONE NUMBER (🇮🇳 +91)</label>
                <PhoneInput value={form.phone} onChange={handleChange} name="phone" placeholder="9876543210" required />
              </div>
            </div>

            <div>
              <label style={labelStyle}>EMAIL ADDRESS</label>
              <input style={inputStyle} name="email" type="email" placeholder="you@email.com" value={form.email} onChange={handleChange} required />
            </div>

            <div>
              <label style={labelStyle}>PASSWORD</label>
              <PasswordInput value={form.password} onChange={handleChange} name="password" placeholder="Min 6 characters" required minLength={6} />
            </div>

            <div className="register-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={labelStyle}>BLOOD GROUP</label>
                <select style={inputStyle} name="bloodGroup" value={form.bloodGroup} onChange={handleChange} required>
                  <option value="">Select</option>
                  {BLOOD_GROUPS.map((bg) => (
                    <option key={bg}>{bg}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>STATE</label>
                <select style={inputStyle} name="state" value={form.state} onChange={handleChange} required>
                  <option value="">Select state</option>
                  {STATES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="register-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={labelStyle}>CITY</label>
                <input style={inputStyle} name="city" placeholder="Guwahati" value={form.city} onChange={handleChange} required />
              </div>
              <div>
                <label style={labelStyle}>📍 GOOGLE MAPS LOCATION <span style={{ color: '#9CA3AF', fontWeight: 400 }}>(OPTIONAL)</span></label>
                <input style={inputStyle} name="locationLink" placeholder="https://maps.google.com/..." value={form.locationLink} onChange={handleChange} />
              </div>
            </div>

            {/* Security Question Section */}
            <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 10, padding: 10, marginTop: 2 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#6B7280', letterSpacing: 0.5, marginBottom: 6 }}>ACCOUNT RECOVERY SECURITY QUESTION</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div>
                  <label style={labelStyle}>SECURITY QUESTION</label>
                  <select style={inputStyle} name="securityQuestion" value={form.securityQuestion} onChange={handleChange} required>
                    {SECURITY_QUESTIONS.map((q) => (
                      <option key={q} value={q}>{q}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>YOUR SECURITY ANSWER</label>
                  <input style={inputStyle} name="securityAnswer" placeholder="Answer to your security question" value={form.securityAnswer} onChange={handleChange} required />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '11px',
                background: '#8B0000',
                color: 'white',
                border: 'none',
                borderRadius: 50,
                fontSize: 14,
                fontWeight: 800,
                cursor: 'pointer',
                fontFamily: 'inherit',
                marginTop: 6,
                letterSpacing: '0.3px',
              }}
            >
              {loading ? 'Creating account...' : 'Register as Donor →'}
            </button>
          </form>

          <div style={{ height: 1, background: '#F3F4F6', margin: '14px 0' }} />

          <p style={{ textAlign: 'center', fontSize: 12, color: '#6B7280', margin: 0 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#8B0000', fontWeight: 700, textDecoration: 'none' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}