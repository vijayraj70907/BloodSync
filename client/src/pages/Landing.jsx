import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Landing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const openChat = () => {
    window.dispatchEvent(new CustomEvent('open-chat'));
    setMenuOpen(false);
  };

  const features = [
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#CC0000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
        </svg>
      ),
      title: 'AI Assistant',
      desc: 'Ask about compatibility, eligibility, and donation guidelines — powered by OpenRouter AI.',
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#CC0000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
        </svg>
      ),
      title: 'Smart Matching',
      desc: 'Donors ranked by availability, proximity, cooldown status, and response rate.',
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#CC0000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
      ),
      title: 'Compatibility Logic',
      desc: 'O- donors appear in O+ searches. Full WHO compatibility built in.',
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#CC0000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/>
        </svg>
      ),
      title: 'India-Wide',
      desc: 'All 28 states covered. City search with automatic state-wide fallback.',
    },
  ];

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: '#FFF8F8', minHeight: '100vh' }}>

      <style>{`
        @media (max-width: 768px) {
          .nav-links { display: none !important; }
          .nav-links.open { display: flex !important; flex-direction: column; position: absolute; top: 68px; left: 0; right: 0; background: white; border-bottom: 1px solid #F3F4F6; padding: 12px 6%; gap: 4px; z-index: 99; }
          .hero-section { flex-direction: column !important; padding: 40px 6% 40px !important; }
          .hero-visual { display: none !important; }
          .hero-left { max-width: 100% !important; }
          .stats-row { gap: 12px !important; }
          .how-grid { grid-template-columns: 1fr !important; }
          .features-grid { grid-template-columns: 1fr 1fr !important; }
          .footer-inner { flex-direction: column !important; gap: 12px !important; align-items: flex-start !important; }
          .cta-section h2 { font-size: 28px !important; }
          .hamburger { display: flex !important; }
          .nav-auth { display: none !important; }
          .nav-auth.open { display: flex !important; }
        }
        @media (max-width: 480px) {
          .features-grid { grid-template-columns: 1fr !important; }
        }
        .hamburger { display: none; background: none; border: none; cursor: pointer; padding: 8px; flex-direction: column; gap: 5px; }
        .hamburger span { display: block; width: 22px; height: 2px; background: #444; border-radius: 2px; }
      `}</style>

      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 6%', height: 68,
        position: 'sticky', top: 0,
        background: 'rgba(255,248,248,0.97)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(204,0,0,0.08)',
        zIndex: 100,
      }}>
        <Link to="/">
          <img src="/logo.png" alt="BloodSync" style={{ height: 52 }} />
        </Link>

        <div className={`nav-links ${menuOpen ? 'open' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); setMenuOpen(false); }} style={{
            fontSize: 14, color: '#444', background: 'none',
            border: 'none', padding: '7px 14px', borderRadius: 8,
            fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
          }}>About</button>
          {[
            { label: 'Requests', to: '/requests' },
            { label: 'Find Donors', to: '/search' },
          ].map(l => (
            <Link key={l.label} to={l.to} onClick={() => setMenuOpen(false)} style={{
              fontSize: 14, color: '#444', textDecoration: 'none',
              padding: '7px 14px', borderRadius: 8, fontWeight: 500,
            }}>{l.label}</Link>
          ))}
          <button onClick={openChat} style={{
            fontSize: 14, color: '#444', background: 'none',
            border: 'none', padding: '7px 14px', borderRadius: 8,
            fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
          }}>How It Works</button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="nav-auth" style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {user ? (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: '#FFF0EF', border: '1px solid #FDE8E8',
                borderRadius: 50, padding: '5px 14px 5px 6px', cursor: 'pointer',
              }} onClick={() => navigate('/dashboard')}>
                <div style={{
                  width: 30, height: 30, borderRadius: '50%',
                  background: '#CC0000', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 800, color: 'white', flexShrink: 0,
                }}>
                  {user.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#CC0000' }}>
                  {user.name?.split(' ')[0]}
                </span>
              </div>
            ) : (
              <>
                <Link to="/login" style={{
                  fontSize: 14, color: '#111', textDecoration: 'none',
                  padding: '8px 20px', borderRadius: 50,
                  border: '1.5px solid #ddd', fontWeight: 500, background: 'white',
                }}>Sign In</Link>
                <Link to="/register" style={{
                  fontSize: 14, color: 'white', textDecoration: 'none',
                  padding: '8px 22px', borderRadius: 50,
                  background: '#CC0000', fontWeight: 600,
                }}>Join as Donor</Link>
              </>
            )}
          </div>

          <button className="hamburger" onClick={() => setMenuOpen(p => !p)}>
            <span /><span /><span />
          </button>
        </div>
      </nav>

      <section className="hero-section" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '70px 6% 60px', maxWidth: 1280, margin: '0 auto', gap: 40,
      }}>
        <div className="hero-left" style={{ flex: 1, maxWidth: 540 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'white', border: '1px solid #F5C6C2',
            borderRadius: 50, padding: '6px 16px', marginBottom: 28,
          }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#CC0000' }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: '#CC0000', letterSpacing: 0.5 }}>
              REAL-TIME BLOOD MATCHING
            </span>
          </div>

          <h1 style={{
            fontSize: 'clamp(36px, 5.5vw, 72px)', fontWeight: 900,
            lineHeight: 1.04, letterSpacing: '-2.5px', margin: '0 0 20px', color: '#0F0F0F',
          }}>
            Save Lives.<br />
            <span style={{ color: '#CC0000' }}>Find Donors.</span><br />
            Right Now.
          </h1>

          <p style={{
            fontSize: 16, color: '#6B7280', lineHeight: 1.75,
            maxWidth: 420, marginBottom: 36, fontWeight: 400,
          }}>
            BloodSync connects patients with compatible donors across India instantly. No waiting. No uncertainty. Just lives saved.
          </p>

          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 28 }}>
            {user ? (
              <Link to="/dashboard" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                textDecoration: 'none', padding: '14px 30px',
                background: '#CC0000', color: 'white',
                borderRadius: 50, fontSize: 15, fontWeight: 700,
              }}>Go to Dashboard</Link>
            ) : (
              <Link to="/register" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                textDecoration: 'none', padding: '14px 30px',
                background: '#CC0000', color: 'white',
                borderRadius: 50, fontSize: 15, fontWeight: 700,
              }}>I Am a Donor</Link>
            )}
            <Link to="/search" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              textDecoration: 'none', padding: '14px 28px',
              background: 'white', color: '#111',
              borderRadius: 50, fontSize: 15, fontWeight: 600,
              border: '1.5px solid #E5E7EB',
            }}>Find Blood Now</Link>
          </div>

          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            {['Verified donors', 'Free forever', 'India-wide network'].map(t => (
              <span key={t} style={{ fontSize: 13, color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ color: '#16A34A', fontWeight: 800 }}>&#10003;</span> {t}
              </span>
            ))}
          </div>
        </div>

        <div className="hero-visual" style={{ flex: 1, maxWidth: 520, position: 'relative', minHeight: 420 }}>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 340, height: 340, borderRadius: '50%', background: 'rgba(204,0,0,0.06)', border: '1px solid rgba(204,0,0,0.1)' }} />
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 240, height: 240, borderRadius: '50%', background: 'rgba(204,0,0,0.08)', border: '1px solid rgba(204,0,0,0.12)' }} />
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src="/icon.png" alt="BloodSync Icon" style={{ width: 130, height: 130, objectFit: 'contain' }} />
          </div>
          <div style={{ position: 'absolute', top: 24, right: 0, ...floatCard }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#16A34A' }} />
              <span style={{ fontSize: 13, fontWeight: 700 }}>Rahul S. — O+ — 2.3km</span>
            </div>
            <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 3 }}>Available now · Guwahati</div>
          </div>
          <div style={{ position: 'absolute', top: '40%', left: -16, ...floatCard }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#CC0000' }} />
              <span style={{ fontSize: 13, fontWeight: 700 }}>3 donors nearby</span>
            </div>
          </div>
          <div style={{ position: 'absolute', bottom: 80, right: -10, ...floatCard, borderColor: '#FDE8E8' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#CC0000' }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#CC0000' }}>CRITICAL — A- Needed</span>
            </div>
            <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 3 }}>GMCH Guwahati · 2 min ago</div>
          </div>
          <div style={{ position: 'absolute', bottom: 16, left: 0, ...floatCard, background: '#F0FDF4', borderColor: '#BBF7D0' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#16A34A' }}>Donation Complete</span>
            <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 3 }}>+1 life saved today</div>
          </div>
        </div>
      </section>

      <div style={{ borderTop: '1px solid rgba(204,0,0,0.1)', borderBottom: '1px solid rgba(204,0,0,0.1)', padding: '28px 6%', background: 'white' }}>
        <div className="stats-row" style={{ maxWidth: 900, margin: '0 auto', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 20 }}>
          {[
            { num: '8 Blood Groups', label: 'all compatible types' },
            { num: '28 States', label: 'India-wide coverage' },
            { num: '56 Days', label: 'WHO cooldown tracked' },
            { num: '< 1 min', label: 'to post a request' },
          ].map(s => (
            <div key={s.num} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 15, fontWeight: 800, color: '#CC0000' }}>{s.num}</span>
              <span style={{ fontSize: 13, color: '#9CA3AF' }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      <section id="how" style={{ padding: '60px 6%', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 44 }}>
          <span style={sectionBadge}>HOW IT WORKS</span>
          <h2 style={{ fontSize: 'clamp(26px, 4vw, 38px)', fontWeight: 900, letterSpacing: '-1.5px', marginTop: 14, color: '#0F0F0F' }}>
            Find a donor in <span style={{ color: '#CC0000' }}>3 simple steps</span>
          </h2>
        </div>
        <div className="how-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          {[
            { step: '01', title: 'Search donors', desc: 'Enter blood group and city. Our algorithm ranks donors by availability, proximity, and reliability.' },
            { step: '02', title: 'Post emergency', desc: 'Need blood urgently? Post a request in seconds. Matching donors in your area are shown instantly.' },
            { step: '03', title: 'Connect and save', desc: 'Call the donor directly. No middlemen, no delays. Real people helping real people.' },
          ].map(s => (
            <div key={s.step} style={{ background: 'white', borderRadius: 20, border: '1px solid #F3F4F6', padding: '32px 28px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 16, right: 20, fontSize: 52, fontWeight: 900, color: '#FDE8E8', lineHeight: 1, letterSpacing: '-2px' }}>{s.step}</div>
              <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 10, color: '#0F0F0F' }}>{s.title}</h3>
              <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.7 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ background: '#FFF8F8', padding: '60px 6%' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <span style={sectionBadge}>FEATURES</span>
            <h2 style={{ fontSize: 'clamp(26px, 4vw, 38px)', fontWeight: 900, letterSpacing: '-1.5px', marginTop: 14, color: '#0F0F0F' }}>
              Built for <span style={{ color: '#CC0000' }}>emergencies</span>
            </h2>
          </div>
          <div className="features-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 16 }}>
            {features.map(f => (
              <div key={f.title} style={{ background: 'white', borderRadius: 16, border: '1px solid #F3F4F6', padding: '24px' }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: '#FFF0EF', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  marginBottom: 14,
                }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 8, color: '#0F0F0F' }}>{f.title}</h3>
                <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.65 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-section" style={{ background: '#CC0000', padding: '60px 6%', textAlign: 'center' }}>
        <h2 style={{ fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 900, color: 'white', letterSpacing: '-1.5px', marginBottom: 14 }}>
          Ready to save a life?
        </h2>
        <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.75)', marginBottom: 32 }}>
          Register as a donor and be ready when someone needs you most.
        </p>
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
          {user ? (
            <Link to="/dashboard" style={{ textDecoration: 'none', padding: '14px 32px', background: 'white', color: '#CC0000', borderRadius: 50, fontSize: 15, fontWeight: 800 }}>Go to Dashboard</Link>
          ) : (
            <Link to="/register" style={{ textDecoration: 'none', padding: '14px 32px', background: 'white', color: '#CC0000', borderRadius: 50, fontSize: 15, fontWeight: 800 }}>Register as Donor</Link>
          )}
          <Link to="/search" style={{ textDecoration: 'none', padding: '14px 32px', background: 'transparent', color: 'white', borderRadius: 50, fontSize: 15, fontWeight: 600, border: '2px solid rgba(255,255,255,0.4)' }}>Find Donors</Link>
        </div>
      </section>

      <footer style={{ background: '#0F0F0F', padding: '28px 6%' }}>
        <div className="footer-inner" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <img src="/logo.png" alt="BloodSync" style={{ height: 36, filter: 'brightness(0) invert(1)' }} />
          <span style={{ fontSize: 13, color: '#4B5563' }}>Built for saving lives · India · 2026</span>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            {[{ label: 'Find Donors', to: '/search' }, { label: 'Requests', to: '/requests' }, { label: 'Register', to: '/register' }].map(l => (
              <Link key={l.label} to={l.to} style={{ fontSize: 13, color: '#6B7280', textDecoration: 'none' }}>{l.label}</Link>
            ))}
          </div>
        </div>
      </footer>

    </div>
  );
}

const floatCard = {
  background: 'white', borderRadius: 14,
  padding: '12px 16px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.10)',
  border: '1px solid #F3F4F6', minWidth: 180,
};

const sectionBadge = {
  display: 'inline-block',
  background: '#FFF0EF', color: '#CC0000',
  fontSize: 12, fontWeight: 700,
  padding: '5px 16px', borderRadius: 50,
  border: '1px solid #FDE8E8', letterSpacing: 0.5,
};