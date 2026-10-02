import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AppLayout from '../components/AppLayout';
import PhoneInput from '../components/PhoneInput';
import PasswordInput from '../components/PasswordInput';
import api from '../api/axios';
import { openInMaps, isValidGoogleMapsUrl } from '../utils/urlUtils';
import { getEligibilityInfo } from '../utils/dateUtils';

import BloodCompatibilityCard from '../components/BloodCompatibilityCard';

export default function Dashboard() {
  const { user, updateProfile, deleteAccount } = useAuth();
  const navigate = useNavigate();
  const [isAvailable, setIsAvailable] = useState(user?.isAvailable ?? true);
  const [requests, setRequests] = useState([]);
  const [donorStats, setDonorStats] = useState(null);
  const [loadingToggle, setLoadingToggle] = useState(false);

  // Edit Profile Modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    city: user?.city || '',
    state: user?.state || '',
    locationLink: user?.locationLink || '',
  });
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  // Delete Account Modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    api.get('/requests').then(({ data }) => setRequests(data.requests.slice(0, 4))).catch(() => {});
    api.get('/donors/stats').then(({ data }) => {
      if (data.success) setDonorStats(data.stats);
    }).catch(() => {});
  }, []);

  const handleToggle = async () => {
    setLoadingToggle(true);
    try {
      await api.put('/donors/availability', { isAvailable: !isAvailable });
      setIsAvailable((p) => !p);
    } finally {
      setLoadingToggle(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditError('');
    setEditSuccess('');

    if (editForm.locationLink && !isValidGoogleMapsUrl(editForm.locationLink)) {
      setEditError('Please provide a valid Google Maps location link (e.g. https://maps.google.com/...)');
      return;
    }

    setEditLoading(true);
    const result = await updateProfile(editForm);
    setEditLoading(false);

    if (result.success) {
      setEditSuccess('Profile & location updated successfully!');
      setTimeout(() => {
        setShowEditModal(false);
        setEditSuccess('');
      }, 1200);
    } else {
      setEditError(result.message);
    }
  };

  const handleDeleteSubmit = async (e) => {
    e.preventDefault();
    setDeleteError('');
    setDeleteLoading(true);

    const result = await deleteAccount(deletePassword);
    setDeleteLoading(false);

    if (result.success) {
      navigate('/login');
    } else {
      setDeleteError(result.message);
    }
  };

  const timeAgo = (date) => {
    const mins = Math.floor((new Date() - new Date(date)) / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const urgencyColor = (u) => {
    if (u === 'critical') return { color: '#8B0000', bg: '#FEF2F2', border: '#FDE8E8' };
    if (u === 'urgent') return { color: '#92400E', bg: '#FFFBEB', border: '#FDE68A' };
    return { color: '#1E40AF', bg: '#EFF6FF', border: '#BFDBFE' };
  };

  const stats = [
    { label: 'Total donations', value: user?.donationCount ?? 0, sub: 'lifetime' },
    { label: 'Lives impacted', value: (user?.donationCount ?? 0) * 3, sub: 'estimated' },
    { label: 'Response rate', value: `${Math.round((user?.responseRate ?? 1) * 100)}%`, sub: 'all time' },
    { label: 'Blood group', value: user?.bloodGroup, sub: 'registered' },
  ];

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

  const eligibility = getEligibilityInfo(user?.nextEligibleDate, user?.lastDonation);

  return (
    <AppLayout title="Dashboard">
      <style>{`
        @media (max-width: 768px) {
          .stats-grid { grid-template-columns: 1fr 1fr !important; }
          .dash-mid-grid { grid-template-columns: 1fr !important; }
          .requests-table-header { display: none !important; }
          .requests-table-row { grid-template-columns: 1fr !important; gap: 6px !important; }
          .dash-action-grid { grid-template-columns: 1fr !important; }
          .req-location-col { display: none !important; }
          .req-time-col { display: none !important; }
          .compatibility-flow-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* Top Stats Grid */}
      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
        {stats.map((s) => (
          <div key={s.label} style={{ background: 'white', border: '1px solid #EBEBEB', borderRadius: 12, padding: '18px 20px' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', letterSpacing: 0.5, marginBottom: 8, textTransform: 'uppercase' }}>{s.label}</div>
            <div style={{ fontSize: 32, fontWeight: 900, color: '#111', letterSpacing: '-1px', lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: '#C4C9D4', marginTop: 4 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Donor 3-Month Eligibility Card Banner */}
      <div style={{
        background: eligibility.isEligible ? '#F0FDF4' : '#FFFBEB',
        border: `1.5px solid ${eligibility.isEligible ? '#BBF7D0' : '#FDE68A'}`,
        borderRadius: 12,
        padding: '18px 20px',
        marginBottom: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            background: eligibility.isEligible ? '#DCFCE7' : '#FEF3C7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 22,
            flexShrink: 0,
          }}>
            {eligibility.isEligible ? '🟢' : '🟠'}
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: eligibility.isEligible ? '#166534' : '#92400E' }}>
              {eligibility.isEligible ? '🟢 Eligible to Donate' : '🟠 Donation Recovery Period (Recently Donated)'}
            </div>
            <div style={{ fontSize: 13, color: eligibility.isEligible ? '#15803D' : '#B45309', marginTop: 2 }}>
              {eligibility.isEligible
                ? "You're currently eligible to receive blood donation requests from patients."
                : `Your next donation eligibility date is: ${eligibility.nextEligibleFormatted || '3 months post-donation'}. (${eligibility.remainingDays} days remaining)`}
            </div>
          </div>
        </div>

        {!eligibility.isEligible && (
          <div style={{
            background: 'white',
            border: '1px solid #FDE68A',
            borderRadius: 8,
            padding: '8px 14px',
            fontSize: 12,
            fontWeight: 700,
            color: '#B45309',
          }}>
            ⏳ {eligibility.remainingDays} Days Cooldown Remaining
          </div>
        )}
      </div>

      {/* 🩸 Blood Donation Compatibility Feature Card */}
      <BloodCompatibilityCard
        userBloodGroup={user?.bloodGroup}
        onOpenEditProfile={() => {
          setEditForm({
            name: user?.name || '',
            phone: user?.phone || '',
            city: user?.city || '',
            state: user?.state || '',
            locationLink: user?.locationLink || '',
          });
          setEditError('');
          setEditSuccess('');
          setShowEditModal(true);
        }}
      />

      {/* Middle Grid: Availability & Profile */}
      <div className="dash-mid-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Availability Status Card */}
        <div style={{ background: 'white', border: '1px solid #EBEBEB', borderRadius: 12, padding: '20px' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#111', marginBottom: 16 }}>Availability Status</div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 16px',
              borderRadius: 10,
              background: isAvailable ? '#F0FDF4' : '#F9FAFB',
              border: `1px solid ${isAvailable ? '#BBF7D0' : '#E5E7EB'}`,
              marginBottom: 14,
            }}
          >
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: isAvailable ? '#166534' : '#374151' }}>
                {isAvailable ? 'You are available' : 'You are unavailable'}
              </div>
              <div style={{ fontSize: 12, color: isAvailable ? '#4ADE80' : '#9CA3AF', marginTop: 2 }}>
                {isAvailable ? 'Visible to requesters' : 'Hidden from search'}
              </div>
            </div>
            <div
              onClick={!loadingToggle ? handleToggle : undefined}
              style={{
                width: 44,
                height: 24,
                borderRadius: 12,
                cursor: 'pointer',
                background: isAvailable ? '#16A34A' : '#D1D5DB',
                position: 'relative',
                transition: 'background 0.25s',
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: 18,
                  height: 18,
                  background: 'white',
                  borderRadius: '50%',
                  position: 'absolute',
                  top: 3,
                  left: isAvailable ? 23 : 3,
                  transition: 'left 0.25s',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                }}
              />
            </div>
          </div>
          <div style={{ fontSize: 12, color: '#9CA3AF', lineHeight: 1.6 }}>
            Location: <span style={{ color: '#374151', fontWeight: 500 }}>{user?.city}, {user?.state}</span>
          </div>
        </div>

        {/* Profile Summary Card with Location */}
        <div style={{ background: 'white', border: '1px solid #EBEBEB', borderRadius: 12, padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>Profile summary</div>
            <button
              onClick={() => {
                setEditForm({
                  name: user?.name || '',
                  phone: user?.phone || '',
                  city: user?.city || '',
                  state: user?.state || '',
                  locationLink: user?.locationLink || '',
                });
                setEditError('');
                setEditSuccess('');
                setShowEditModal(true);
              }}
              style={{ background: 'none', border: 'none', color: '#8B0000', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
            >
              Edit Profile
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: '#FFF0EF',
                border: '2px solid #FDE8E8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16,
                fontWeight: 800,
                color: '#8B0000',
                flexShrink: 0,
              }}
            >
              {user?.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</div>
              <div style={{ fontSize: 12, color: '#9CA3AF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</div>
            </div>
            <div style={{ background: '#FFF0EF', border: '1.5px solid #FDE8E8', color: '#8B0000', fontWeight: 800, fontSize: 14, padding: '4px 8px', borderRadius: 8, flexShrink: 0 }}>
              {user?.bloodGroup}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
            {[
              { label: 'City', value: user?.city },
              { label: 'State', value: user?.state },
              { label: 'Phone', value: user?.phone },
              { label: 'Since', value: new Date(user?.createdAt || Date.now()).getFullYear() },
            ].map((f) => (
              <div key={f.label} style={{ background: '#F9FAFB', borderRadius: 8, padding: '8px 10px' }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: '#9CA3AF', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 2 }}>{f.label}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.value}</div>
              </div>
            ))}
          </div>

          {/* Donor Google Maps Location Display */}
          <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 12, color: '#6B7280' }}>
              Maps Location:{' '}
              {user?.locationLink ? (
                <span style={{ color: '#111', fontWeight: 500 }}>Saved</span>
              ) : (
                <span style={{ color: '#9CA3AF', fontStyle: 'italic' }}>Location not available</span>
              )}
            </div>
            {user?.locationLink ? (
              <button
                type="button"
                onClick={() => openInMaps(user.locationLink)}
                style={{
                  background: '#FFF0EF',
                  border: '1px solid #FDE8E8',
                  color: '#8B0000',
                  padding: '4px 10px',
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                📍 View Location on Maps
              </button>
            ) : (
              <span style={{ fontSize: 11, color: '#9CA3AF' }}>No link provided</span>
            )}
          </div>
        </div>
      </div>

      {/* Admin / Platform Donor Statistics Card */}
      {donorStats && (
        <div style={{ background: 'white', border: '1px solid #EBEBEB', borderRadius: 12, padding: '20px', marginBottom: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#111', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            📊 Platform Donor Analytics & Eligibility Statistics
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 14 }}>
            <div style={{ background: '#F9FAFB', borderRadius: 8, padding: '12px', border: '1px solid #F3F4F6' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>Total Donors</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: '#111', marginTop: 2 }}>{donorStats.totalDonors}</div>
            </div>
            <div style={{ background: '#F0FDF4', borderRadius: 8, padding: '12px', border: '1px solid #BBF7D0' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#166534', textTransform: 'uppercase' }}>Eligible Donors</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: '#15803D', marginTop: 2 }}>{donorStats.eligibleDonors}</div>
            </div>
            <div style={{ background: '#FFFBEB', borderRadius: 8, padding: '12px', border: '1px solid #FDE68A' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#92400E', textTransform: 'uppercase' }}>In Recovery (Cooldown)</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: '#B45309', marginTop: 2 }}>{donorStats.ineligibleDonors}</div>
            </div>
            <div style={{ background: '#EFF6FF', borderRadius: 8, padding: '12px', border: '1px solid #BFDBFE' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#1E40AF', textTransform: 'uppercase' }}>Eligible This Month</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: '#1D4ED8', marginTop: 2 }}>{donorStats.eligibleThisMonth}</div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Emergency Requests */}
      <div style={{ background: 'white', border: '1px solid #EBEBEB', borderRadius: 12, padding: '20px', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>Recent emergency requests</div>
          <Link to="/requests" style={{ fontSize: 12, color: '#8B0000', textDecoration: 'none', fontWeight: 600 }}>
            View all
          </Link>
        </div>

        {requests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px', color: '#9CA3AF', fontSize: 13 }}>No active requests right now</div>
        ) : (
          <div>
            <div className="requests-table-header" style={{ display: 'grid', gridTemplateColumns: '80px 1fr 120px 120px 80px', gap: 12, padding: '0 12px 10px', borderBottom: '1px solid #F3F4F6', marginBottom: 4 }}>
              {['Group', 'Patient & Hospital', 'Location', 'Urgency', 'Time'].map((h) => (
                <div key={h} style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', letterSpacing: 0.5, textTransform: 'uppercase' }}>{h}</div>
              ))}
            </div>
            {requests.map((req) => {
              const uc = urgencyColor(req.urgency);
              return (
                <div key={req._id} className="requests-table-row" style={{ display: 'grid', gridTemplateColumns: '80px 1fr 120px 120px 80px', gap: 12, alignItems: 'center', padding: '12px', borderRadius: 8, borderBottom: '1px solid #F9FAFB' }}>
                  <div style={{ background: '#FFF0EF', border: '1.5px solid #FDE8E8', color: '#8B0000', fontWeight: 800, fontSize: 13, padding: '3px 8px', borderRadius: 6, width: 'fit-content' }}>{req.bloodGroup}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>{req.patientName}</div>
                    <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 1 }}>{req.hospital}</div>
                    <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 1 }}>{req.city}, {req.state} · {timeAgo(req.createdAt)}</div>
                  </div>
                  <div className="req-location-col" style={{ fontSize: 12, color: '#6B7280' }}>{req.city}, {req.state}</div>
                  <div style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: uc.bg, color: uc.color, border: `1px solid ${uc.border}`, width: 'fit-content' }}>
                    {req.urgency.charAt(0).toUpperCase() + req.urgency.slice(1)}
                  </div>
                  <div className="req-time-col" style={{ fontSize: 11, color: '#9CA3AF' }}>{timeAgo(req.createdAt)}</div>
                </div>
              );
            })}
          </div>
        )}

        <div className="dash-action-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 16 }}>
          <Link to="/emergency" style={{ textAlign: 'center', textDecoration: 'none', background: '#8B0000', color: 'white', padding: '10px', borderRadius: 8, fontSize: 13, fontWeight: 700 }}>
            Post Emergency Request
          </Link>
          <Link to="/search" style={{ textAlign: 'center', textDecoration: 'none', background: 'white', color: '#111', padding: '10px', borderRadius: 8, fontSize: 13, fontWeight: 600, border: '1px solid #E5E7EB' }}>
            Find Donors
          </Link>
        </div>
      </div>

      {/* Settings & Danger Zone: Permanent Account Deletion */}
      <div style={{ background: '#FFF5F5', border: '1px solid #FEE2E2', borderRadius: 12, padding: '20px' }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: '#991B1B', marginBottom: 4 }}>Account Settings & Privacy</div>
        <div style={{ fontSize: 12, color: '#7F1D1D', marginBottom: 14 }}>
          Manage your account preference or permanently delete your donor account.
        </div>
        <button
          type="button"
          onClick={() => {
            setDeletePassword('');
            setDeleteError('');
            setShowDeleteModal(true);
          }}
          style={{
            background: 'white',
            color: '#DC2626',
            border: '1.5px solid #FCA5A5',
            padding: '8px 16px',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          🗑 Delete Account
        </button>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'white', borderRadius: 16, maxWidth: 460, width: '100%', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#111', margin: 0 }}>Edit Profile & Location</h3>
              <button onClick={() => setShowEditModal(false)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#9CA3AF' }}>✕</button>
            </div>

            {editError && <div style={{ background: '#FEF2F2', color: '#8B0000', border: '1px solid #FDE8E8', borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 14 }}>{editError}</div>}
            {editSuccess && <div style={{ background: '#F0FDF4', color: '#166534', border: '1px solid #BBF7D0', borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 14 }}>{editSuccess}</div>}

            <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={labelStyle}>FULL NAME</label>
                <input style={inputStyle} value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} required />
              </div>
              <div>
                <label style={labelStyle}>PHONE NUMBER (🇮🇳 +91)</label>
                <PhoneInput value={editForm.phone} onChange={(val) => setEditForm({ ...editForm, phone: val.target.value })} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={labelStyle}>CITY</label>
                  <input style={inputStyle} value={editForm.city} onChange={(e) => setEditForm({ ...editForm, city: e.target.value })} required />
                </div>
                <div>
                  <label style={labelStyle}>STATE</label>
                  <input style={inputStyle} value={editForm.state} onChange={(e) => setEditForm({ ...editForm, state: e.target.value })} required />
                </div>
              </div>
              <div>
                <label style={labelStyle}>📍 GOOGLE MAPS LOCATION LINK</label>
                <input style={inputStyle} placeholder="https://maps.google.com/..." value={editForm.locationLink} onChange={(e) => setEditForm({ ...editForm, locationLink: e.target.value })} />
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                <button type="button" onClick={() => setShowEditModal(false)} style={{ padding: '10px 16px', background: 'white', border: '1px solid #E5E5E5', borderRadius: 8, fontSize: 13, fontWeight: 600 }}>
                  Cancel
                </button>
                <button type="submit" disabled={editLoading} style={{ flex: 1, padding: '10px 16px', background: '#8B0000', color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                  {editLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'white', borderRadius: 16, maxWidth: 420, width: '100%', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', border: '1px solid #FEE2E2' }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#FEF2F2', border: '1px solid #FDE8E8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: '#DC2626', marginBottom: 14 }}>
              ⚠️
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#111', margin: '0 0 8px' }}>Permanent Account Deletion</h3>
            <p style={{ fontSize: 13, color: '#4B5563', lineHeight: 1.5, margin: '0 0 16px', fontWeight: 500 }}>
              Are you sure you want to permanently delete your account? This action cannot be undone.
            </p>

            {deleteError && <div style={{ background: '#FEF2F2', color: '#8B0000', border: '1px solid #FDE8E8', borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 14 }}>{deleteError}</div>}

            <form onSubmit={handleDeleteSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={labelStyle}>ENTER YOUR PASSWORD TO CONFIRM</label>
                <PasswordInput value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} placeholder="Confirm your password" required />
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" onClick={() => setShowDeleteModal(false)} style={{ flex: 1, padding: '11px', background: 'white', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" disabled={deleteLoading} style={{ flex: 1, padding: '11px', background: '#DC2626', color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                  {deleteLoading ? 'Deleting...' : 'Delete Permanently'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}