import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { label: 'Dashboard', to: '/dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { label: 'Find Donors', to: '/search', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
  { label: 'Requests', to: '/requests', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' },
  { label: 'Emergency', to: '/emergency', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
];

export default function AppLayout({ children, title }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: "'DM Sans', sans-serif", background: '#F4F5F7', overflow: 'hidden' }}>
      <style>{`
        @media (max-width: 768px) {
          .sidebar { transform: translateX(-100%); transition: transform 0.25s; }
          .sidebar.open { transform: translateX(0); }
          .sidebar-overlay { display: block !important; }
          .main-content { margin-left: 0 !important; }
          .bottom-nav { display: flex !important; }
          .top-header { padding: 0 16px !important; }
          .main-inner { padding: 16px !important; padding-bottom: 80px !important; }
        }
        .sidebar-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 49; }
        .bottom-nav { display: none; position: fixed; bottom: 0; left: 0; right: 0; background: white; border-top: 1px solid #EBEBEB; z-index: 50; padding: 8px 0 4px; }
        .bottom-nav-item { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 3px; text-decoration: none; padding: 4px 0; }
      `}</style>

      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`} style={{
        width: 240, background: 'white', borderRight: '1px solid #EBEBEB',
        display: 'flex', flexDirection: 'column', flexShrink: 0,
        height: '100vh', position: 'fixed', left: 0, top: 0, zIndex: 50,
      }}>
        <div style={{ padding: '20px 20px 14px', borderBottom: '1px solid #F3F4F6' }}>
          <Link to="/" onClick={() => setSidebarOpen(false)}>
            <img src="/logo.png" alt="logo" style={{ height: 44, width: 'auto', display: 'block', objectFit: 'contain' }} />
          </Link>
        </div>

        <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {navItems.map(item => {
            const active = location.pathname === item.to;
            return (
              <Link key={item.to} to={item.to} onClick={() => setSidebarOpen(false)} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 12px', borderRadius: 8, textDecoration: 'none',
                fontSize: 14, fontWeight: active ? 600 : 400,
                color: active ? '#8B0000' : '#4B5563',
                background: active ? '#FFF0EF' : 'transparent',
                transition: 'all 0.15s',
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d={item.icon} />
                </svg>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: '16px 20px', borderTop: '1px solid #F3F4F6' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{
              width: 34, height: 34, borderRadius: '50%',
              background: '#FFF0EF', border: '1.5px solid #FDE8E8',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 800, color: '#8B0000', flexShrink: 0,
            }}>{initials}</div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</div>
              <div style={{ fontSize: 11, color: '#9CA3AF' }}>{user?.bloodGroup} · {user?.city}</div>
            </div>
          </div>
          <button onClick={handleLogout} style={{
            width: '100%', padding: '8px', background: 'transparent',
            border: '1px solid #E5E7EB', borderRadius: 8,
            fontSize: 13, color: '#6B7280', cursor: 'pointer',
            fontFamily: 'inherit', fontWeight: 500,
          }}>Sign out</button>
        </div>
      </div>

      <div className="main-content" style={{ marginLeft: 240, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div className="top-header" style={{
          height: 56, background: 'white', borderBottom: '1px solid #EBEBEB',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 28px', flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => setSidebarOpen(p => !p)} style={{
              display: 'none', background: 'none', border: 'none',
              cursor: 'pointer', padding: 4, flexDirection: 'column', gap: 4,
              alignItems: 'center', justifyContent: 'center',
            }} className="menu-btn">
              <span style={{ display: 'block', width: 20, height: 2, background: '#444', borderRadius: 2 }} />
              <span style={{ display: 'block', width: 20, height: 2, background: '#444', borderRadius: 2 }} />
              <span style={{ display: 'block', width: 20, height: 2, background: '#444', borderRadius: 2 }} />
            </button>
            <h1 style={{ fontSize: 16, fontWeight: 700, color: '#111', margin: 0 }}>{title}</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: user?.isAvailable ? '#16A34A' : '#D1D5DB' }} />
            <span style={{ fontSize: 13, color: '#6B7280', fontWeight: 500 }}>
              {user?.isAvailable ? 'Available' : 'Unavailable'}
            </span>
            <div style={{ background: '#FFF0EF', border: '1px solid #FDE8E8', borderRadius: 6, padding: '3px 10px', marginLeft: 4 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#8B0000' }}>{user?.bloodGroup}</span>
            </div>
          </div>
        </div>

        <div className="main-inner" style={{ flex: 1, overflow: 'auto', padding: '24px 28px' }}>
          {children}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .menu-btn { display: flex !important; }
        }
      `}</style>

      <nav className="bottom-nav">
        {navItems.map(item => {
          const active = location.pathname === item.to;
          return (
            <Link key={item.to} to={item.to} className="bottom-nav-item" style={{ color: active ? '#8B0000' : '#9CA3AF' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d={item.icon} />
              </svg>
              <span style={{ fontSize: 10, fontWeight: active ? 700 : 400 }}>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}