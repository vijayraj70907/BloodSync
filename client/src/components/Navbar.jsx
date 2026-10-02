import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 6%', height: 64,
      background: 'rgba(255,248,248,0.95)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(204,0,0,0.08)',
      position: 'sticky', top: 0, zIndex: 100,
    }}>
      <Link to="/">
        <img src="/logo.png" alt="BloodSync" style={{ height: 160 }} />
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <Link to="/requests" style={navLink}>Requests</Link>
        <Link to="/search" style={navLink}>Find Donors</Link>
        {user && <Link to="/emergency" style={navLink}>Post Emergency</Link>}
        {user && <Link to="/dashboard" style={navLink}>Dashboard</Link>}
      </div>

      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        {user ? (
          <>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: '#FFF0EF', borderRadius: 50,
              padding: '6px 14px', border: '1px solid #FDE8E8',
            }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#16A34A' }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: '#CC0000' }}>
                {user.bloodGroup}
              </span>
              <span style={{ fontSize: 13, color: '#444', fontWeight: 500 }}>
                {user.name?.split(' ')[0]}
              </span>
            </div>
            <button onClick={handleLogout} style={{
              fontSize: 13, color: '#111',
              padding: '7px 18px', borderRadius: 50,
              border: '1.5px solid #ddd', fontWeight: 500,
              background: 'white', cursor: 'pointer',
            }}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" style={{
              fontSize: 14, color: '#111', textDecoration: 'none',
              padding: '7px 18px', borderRadius: 50,
              border: '1.5px solid #ddd', fontWeight: 500, background: 'white',
            }}>Sign In</Link>
            <Link to="/register" style={{
              fontSize: 14, color: 'white', textDecoration: 'none',
              padding: '7px 20px', borderRadius: 50,
              background: '#CC0000', fontWeight: 600,
            }}>Join as Donor →</Link>
          </>
        )}
      </div>
    </nav>
  );
}

const navLink = {
  fontSize: 14, color: '#444', textDecoration: 'none',
  padding: '7px 14px', borderRadius: 8, fontWeight: 500,
};