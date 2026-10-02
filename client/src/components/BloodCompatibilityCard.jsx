import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import {
  BLOOD_GROUPS,
  getDonationCompatibility,
  getReceivingCompatibility,
} from '../utils/bloodCompatibility';

// ─── Inline Donor Preview Panel ────────────────────────────────────────────────
function DonorPreviewPanel({ bloodGroup, compatibleGroups, onViewAll, onClose }) {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterState, setFilterState] = useState('');
  const [fetched, setFetched] = useState(false);

  // Fetch donors on first render of this panel
  const fetchDonors = useCallback(async () => {
    if (fetched) return;
    setFetched(true);
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('bloodGroup', bloodGroup);
      if (filterState) params.append('state', filterState);
      const { data } = await api.get(`/search?${params}`);
      setDonors(data.donors || []);
    } catch {
      setDonors([]);
    } finally {
      setLoading(false);
    }
  }, [bloodGroup, fetched, filterState]);

  // Trigger fetch immediately
  useState(() => { fetchDonors(); });

  const handleStateFilter = async (state) => {
    setFilterState(state);
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('bloodGroup', bloodGroup);
      if (state) params.append('state', state);
      const { data } = await api.get(`/search?${params}`);
      setDonors(data.donors || []);
    } catch {
      setDonors([]);
    } finally {
      setLoading(false);
    }
  };

  const STATES_LIST = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar',
    'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana',
    'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
    'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya',
    'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana',
    'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Andaman and Nicobar Islands', 'Chandigarh',
    'Dadra and Nagar Haveli and Daman and Diu', 'Delhi',
    'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
  ];

  // Group donors by blood group for easy scanning
  const groupedByBG = {};
  donors.forEach(d => {
    if (!groupedByBG[d.bloodGroup]) groupedByBG[d.bloodGroup] = [];
    groupedByBG[d.bloodGroup].push(d);
  });

  return (
    <div
      style={{
        marginTop: 16,
        background: 'linear-gradient(135deg, #FFF8F8 0%, #F0F7FF 100%)',
        border: '1.5px solid #FDE8E8',
        borderRadius: 14,
        overflow: 'hidden',
        animation: 'slideDown 0.25s ease',
      }}
    >
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .donor-mini-card:hover { background: white !important; box-shadow: 0 4px 12px rgba(139,0,0,0.08) !important; transform: translateY(-1px); }
        .donor-mini-card { transition: all 0.15s ease !important; }
        .state-filter-btn:hover { background: #FFF0EF !important; border-color: #8B0000 !important; color: #8B0000 !important; }
      `}</style>

      {/* Panel Header */}
      <div style={{
        background: 'linear-gradient(90deg, #8B0000 0%, #C41E3A 100%)',
        padding: '14px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 10,
      }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: 'white', display: 'flex', alignItems: 'center', gap: 8 }}>
            🔍 Compatible Donors for <span style={{ background: 'rgba(255,255,255,0.2)', padding: '2px 10px', borderRadius: 8, fontSize: 16 }}>{bloodGroup}</span>
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', marginTop: 3 }}>
            Accepting blood from: {compatibleGroups.join(', ')}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            onClick={onViewAll}
            style={{
              background: 'white',
              color: '#8B0000',
              border: 'none',
              padding: '6px 14px',
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            View All Donors →
          </button>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.15)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.3)',
              padding: '6px 12px',
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            ✕ Close
          </button>
        </div>
      </div>

      {/* State Filter Bar */}
      <div style={{ padding: '12px 20px', borderBottom: '1px solid #FDE8E8', background: 'white' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
          Filter by State:
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <button
            type="button"
            className="state-filter-btn"
            onClick={() => handleStateFilter('')}
            style={{
              padding: '4px 12px',
              borderRadius: 20,
              fontSize: 11,
              fontWeight: 700,
              cursor: 'pointer',
              border: filterState === '' ? '2px solid #8B0000' : '1px solid #E5E7EB',
              background: filterState === '' ? '#FFF0EF' : 'white',
              color: filterState === '' ? '#8B0000' : '#6B7280',
              transition: 'all 0.15s',
            }}
          >
            All India
          </button>
          {STATES_LIST.map(s => (
            <button
              key={s}
              type="button"
              className="state-filter-btn"
              onClick={() => handleStateFilter(s)}
              style={{
                padding: '4px 12px',
                borderRadius: 20,
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
                border: filterState === s ? '2px solid #8B0000' : '1px solid #E5E7EB',
                background: filterState === s ? '#FFF0EF' : 'white',
                color: filterState === s ? '#8B0000' : '#6B7280',
                transition: 'all 0.15s',
                whiteSpace: 'nowrap',
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Donor Results */}
      <div style={{ padding: '16px 20px', maxHeight: 420, overflowY: 'auto' }}>
        {loading && (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>🔍</div>
            <div style={{ fontSize: 13, color: '#9CA3AF', fontWeight: 600 }}>Finding eligible donors...</div>
          </div>
        )}

        {!loading && donors.length === 0 && (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>😔</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#374151', marginBottom: 4 }}>No eligible donors found</div>
            <div style={{ fontSize: 12, color: '#9CA3AF' }}>
              Donors who recently donated (within 3 months) are hidden for safety.
              {filterState && ' Try selecting a different state.'}
            </div>
          </div>
        )}

        {!loading && donors.length > 0 && (
          <>
            {/* Summary by blood group */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
                {donors.length} Eligible Donor{donors.length > 1 ? 's' : ''} Found
                {filterState ? ` in ${filterState}` : ' Across India'}
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                {Object.entries(groupedByBG).map(([bg, list]) => (
                  <div key={bg} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    background: '#FFF0EF', border: '1.5px solid #FDE8E8',
                    borderRadius: 20, padding: '3px 10px',
                    fontSize: 12, fontWeight: 800, color: '#8B0000',
                  }}>
                    🩸 {bg}
                    <span style={{ background: '#8B0000', color: 'white', borderRadius: 20, padding: '1px 6px', fontSize: 10 }}>
                      {list.length}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Grouped by blood type sections */}
            {Object.entries(groupedByBG).map(([bg, bgDonors]) => (
              <div key={bg} style={{ marginBottom: 18 }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10,
                  paddingBottom: 8, borderBottom: '2px solid #FDE8E8',
                }}>
                  <span style={{
                    background: '#8B0000', color: 'white',
                    fontSize: 13, fontWeight: 900, padding: '3px 10px', borderRadius: 8,
                  }}>{bg}</span>
                  <span style={{ fontSize: 12, color: '#6B7280', fontWeight: 600 }}>
                    {bgDonors.length} donor{bgDonors.length > 1 ? 's' : ''} eligible
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 8 }}>
                  {bgDonors.slice(0, 6).map((donor, idx) => {
                    const initials = donor.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                    const daysSince = donor.lastDonation
                      ? Math.floor((new Date() - new Date(donor.lastDonation)) / (1000 * 60 * 60 * 24))
                      : null;
                    const isTopMatch = donor.score >= 70 || idx === 0;

                    return (
                      <div
                        key={donor._id || idx}
                        className="donor-mini-card"
                        style={{
                          background: isTopMatch ? '#FFF8F8' : '#FAFAFA',
                          border: isTopMatch ? '1.5px solid #FCA5A5' : '1px solid #F3F4F6',
                          borderRadius: 10,
                          padding: '12px',
                          cursor: 'default',
                          position: 'relative',
                        }}
                      >
                        {isTopMatch && idx === 0 && (
                          <div style={{
                            position: 'absolute', top: -1, right: 8,
                            background: '#8B0000', color: 'white',
                            fontSize: 9, fontWeight: 800,
                            padding: '2px 6px', borderRadius: '0 0 6px 6px',
                          }}>
                            🤖 AI TOP MATCH
                          </div>
                        )}

                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                          <div style={{
                            width: 34, height: 34, borderRadius: '50%',
                            background: '#FFF0EF', border: '1.5px solid #FDE8E8',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 12, fontWeight: 800, color: '#8B0000', flexShrink: 0,
                          }}>
                            {initials}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: '#111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {donor.name}
                            </div>
                            <div style={{ fontSize: 11, color: '#6B7280', marginTop: 1 }}>
                              📍 {donor.city}, {donor.state}
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 4 }}>
                          <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                            <span style={{
                              background: '#F0FDF4', border: '1px solid #BBF7D0',
                              color: '#166534', fontSize: 9, fontWeight: 700,
                              padding: '2px 6px', borderRadius: 10,
                            }}>🟢 Eligible</span>
                            {daysSince !== null && (
                              <span style={{ fontSize: 10, color: '#9CA3AF' }}>Last {daysSince}d ago</span>
                            )}
                            {donor.donationCount > 0 && (
                              <span style={{ fontSize: 10, color: '#9CA3AF' }}>{donor.donationCount} donations</span>
                            )}
                          </div>

                          {donor.phone && (
                            <a
                              href={`tel:${donor.phone}`}
                              style={{
                                display: 'inline-flex', alignItems: 'center',
                                textDecoration: 'none', background: '#8B0000',
                                color: 'white', padding: '4px 10px',
                                borderRadius: 6, fontSize: 11, fontWeight: 700,
                                whiteSpace: 'nowrap',
                              }}
                            >
                              📞 Call
                            </a>
                          )}
                        </div>

                        {/* ML Match Score bar */}
                        {donor.score && (
                          <div style={{ marginTop: 8 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
                              <span style={{ fontSize: 9, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.3 }}>ML Match</span>
                              <span style={{ fontSize: 10, fontWeight: 700, color: '#374151' }}>{donor.score}%</span>
                            </div>
                            <div style={{ width: '100%', height: 3, background: '#F3F4F6', borderRadius: 2 }}>
                              <div style={{
                                height: '100%', borderRadius: 2,
                                background: donor.score >= 80 ? '#16A34A' : donor.score >= 60 ? '#D97706' : '#8B0000',
                                width: `${donor.score}%`,
                                transition: 'width 0.6s ease',
                              }} />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {bgDonors.length > 6 && (
                  <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 6, textAlign: 'center', fontStyle: 'italic' }}>
                    +{bgDonors.length - 6} more {bg} donors — <button type="button" onClick={onViewAll} style={{ background: 'none', border: 'none', color: '#8B0000', fontWeight: 700, cursor: 'pointer', fontSize: 12 }}>View All →</button>
                  </div>
                )}
              </div>
            ))}

            {/* CTA Footer */}
            <div style={{
              marginTop: 16, padding: '14px',
              background: 'white', borderRadius: 10,
              border: '1px solid #EBEBEB',
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', flexWrap: 'wrap', gap: 10,
            }}>
              <div style={{ fontSize: 12, color: '#6B7280' }}>
                Showing top results. Use the full search for advanced filters.
              </div>
              <button
                type="button"
                onClick={onViewAll}
                style={{
                  background: '#8B0000', color: 'white',
                  border: 'none', padding: '8px 18px',
                  borderRadius: 8, fontSize: 12, fontWeight: 700,
                  cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6,
                }}
              >
                🔍 View All Compatible Donors
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Main BloodCompatibilityCard ───────────────────────────────────────────────
export default function BloodCompatibilityCard({ userBloodGroup, onOpenEditProfile }) {
  const navigate = useNavigate();

  const [selectedGroup, setSelectedGroup] = useState(userBloodGroup || 'O+');
  const [showChartModal, setShowChartModal] = useState(false);
  const [showDonorPanel, setShowDonorPanel] = useState(false);

  const activeGroup = selectedGroup || userBloodGroup || 'O+';

  const donateToGroups = getDonationCompatibility(activeGroup);
  const receiveFromGroups = getReceivingCompatibility(activeGroup);

  const isUserSelectedGroup = userBloodGroup && activeGroup === userBloodGroup;

  const handleFindDonors = () => {
    setShowDonorPanel(prev => !prev);
  };

  const handleViewAllDonors = () => {
    navigate(`/search?bloodGroup=${encodeURIComponent(activeGroup)}`);
  };

  const handleFindRequests = () => {
    navigate(`/requests?bloodGroup=${encodeURIComponent(activeGroup)}`);
  };

  return (
    <div
      style={{
        background: 'white',
        border: '1px solid #EBEBEB',
        borderRadius: 14,
        padding: '22px 24px',
        marginBottom: 20,
        boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
      }}
    >
      {/* Header Row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: '#FFF0EF',
              border: '1.5px solid #FDE8E8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
              flexShrink: 0,
            }}
          >
            🩸
          </div>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: '#111', margin: 0 }}>
              Blood Donation Compatibility
            </h3>
            <p style={{ fontSize: 12, color: '#6B7280', margin: '2px 0 0' }}>
              Transfusion rules for donors &amp; recipients based on ABO/Rh typing
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowChartModal(true)}
          style={{
            background: '#F9FAFB',
            border: '1px solid #E5E7EB',
            color: '#374151',
            padding: '6px 14px',
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          📊 View Full Compatibility Chart
        </button>
      </div>

      {/* User Blood Group Prompt if not configured */}
      {!userBloodGroup && (
        <div
          style={{
            background: '#FFFBEB',
            border: '1px solid #FDE68A',
            borderRadius: 10,
            padding: '12px 16px',
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 10,
          }}
        >
          <div style={{ fontSize: 13, color: '#92400E', fontWeight: 600 }}>
            ⚠️ Add your blood group to see your personalized compatibility breakdown.
          </div>
          <button
            type="button"
            onClick={onOpenEditProfile}
            style={{
              background: '#8B0000',
              color: 'white',
              border: 'none',
              padding: '6px 14px',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Update Blood Group
          </button>
        </div>
      )}

      {/* Interactive Selector Pill Bar */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
          Select Blood Group to Explore:
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {BLOOD_GROUPS.map((bg) => {
            const isSelected = bg === activeGroup;
            const isMyGroup = bg === userBloodGroup;
            return (
              <button
                key={bg}
                type="button"
                onClick={() => {
                  setSelectedGroup(bg);
                  setShowDonorPanel(false); // reset panel on group change
                }}
                style={{
                  padding: '6px 14px',
                  borderRadius: 20,
                  fontSize: 13,
                  fontWeight: 800,
                  cursor: 'pointer',
                  border: isSelected ? '2px solid #8B0000' : '1px solid #E5E7EB',
                  background: isSelected ? '#FFF0EF' : 'white',
                  color: isSelected ? '#8B0000' : '#374151',
                  transition: 'all 0.15s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  boxShadow: isSelected ? '0 2px 6px rgba(139,0,0,0.15)' : 'none',
                }}
              >
                {bg}
                {isMyGroup && <span style={{ fontSize: 10, color: '#8B0000' }}>(You)</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Blood Group Header */}
      <div
        style={{
          background: '#F9FAFB',
          border: '1px solid #F3F4F6',
          borderRadius: 12,
          padding: '16px',
          marginBottom: 4,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 13, color: '#6B7280', fontWeight: 600 }}>Currently Selected:</span>
            <span
              style={{
                background: '#8B0000',
                color: 'white',
                fontSize: 16,
                fontWeight: 900,
                padding: '4px 12px',
                borderRadius: 8,
              }}
            >
              {activeGroup}
            </span>
            {isUserSelectedGroup && (
              <span style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', color: '#166534', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 12 }}>
                👤 Your Registered Blood Group
              </span>
            )}
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handleFindDonors}
              style={{
                background: showDonorPanel ? '#6B0000' : '#8B0000',
                color: 'white',
                border: 'none',
                padding: '7px 14px',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                transition: 'background 0.15s',
                boxShadow: showDonorPanel ? '0 0 0 3px rgba(139,0,0,0.25)' : 'none',
              }}
            >
              {showDonorPanel ? '▲ Hide Donors' : '🔍 Find Compatible Donors'} ({receiveFromGroups.join(', ')})
            </button>
            <button
              type="button"
              onClick={handleFindRequests}
              style={{
                background: 'white',
                color: '#8B0000',
                border: '1.5px solid #8B0000',
                padding: '7px 14px',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              ❤️ Find Compatible Patients
            </button>
          </div>
        </div>

        {/* Dynamic Dual Compatibility Flow Visualization */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="compatibility-flow-grid">
          {/* CAN DONATE TO Block */}
          <div
            style={{
              background: '#FFF0EF',
              border: '1.5px solid #FDE8E8',
              borderRadius: 12,
              padding: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: 16 }}>❤️</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#8B0000' }}>
                  Can Donate To ({donateToGroups.length} Group{donateToGroups.length > 1 ? 's' : ''})
                </div>
                <div style={{ fontSize: 11, color: '#991B1B' }}>
                  Patients who can safely receive red cells from {activeGroup}
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'center', margin: '8px 0', fontSize: 14, color: '#8B0000', fontWeight: 800 }}>
              🩸 [{activeGroup}] ➔ 🩸
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
              {donateToGroups.map((bg) => (
                <div
                  key={bg}
                  style={{
                    background: 'white',
                    border: '1.5px solid #FCA5A5',
                    color: '#8B0000',
                    fontSize: 14,
                    fontWeight: 900,
                    padding: '6px 12px',
                    borderRadius: 8,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  }}
                >
                  {bg}
                </div>
              ))}
            </div>
          </div>

          {/* CAN RECEIVE FROM Block */}
          <div
            style={{
              background: '#EFF6FF',
              border: '1.5px solid #BFDBFE',
              borderRadius: 12,
              padding: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: 16 }}>💙</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#1E40AF' }}>
                  Can Receive From ({receiveFromGroups.length} Group{receiveFromGroups.length > 1 ? 's' : ''})
                </div>
                <div style={{ fontSize: 11, color: '#1E3A8A' }}>
                  Compatible donor groups for {activeGroup} recipients
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'center', margin: '8px 0', fontSize: 14, color: '#1E40AF', fontWeight: 800 }}>
              🩸 ➔ 🩸 [{activeGroup}]
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
              {receiveFromGroups.map((bg) => (
                <div
                  key={bg}
                  style={{
                    background: 'white',
                    border: '1.5px solid #93C5FD',
                    color: '#1E40AF',
                    fontSize: 14,
                    fontWeight: 900,
                    padding: '6px 12px',
                    borderRadius: 8,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  }}
                >
                  {bg}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Inline Donor Preview Panel (toggled by button) ── */}
      {showDonorPanel && (
        <DonorPreviewPanel
          key={activeGroup} // remount when blood group changes
          bloodGroup={activeGroup}
          compatibleGroups={receiveFromGroups}
          onViewAll={handleViewAllDonors}
          onClose={() => setShowDonorPanel(false)}
        />
      )}

      {/* Medical Disclaimer */}
      <div style={{ fontSize: 11, color: '#9CA3AF', fontStyle: 'italic', lineHeight: 1.5, borderTop: '1px dashed #E5E7EB', paddingTop: 10, marginTop: 14 }}>
        ℹ️ <strong>Medical Disclaimer:</strong> Compatibility shown is for general red blood cell transfusion guidance. Actual blood transfusion decisions require blood typing, crossmatching, and medical supervision by certified healthcare professionals.
      </div>

      {/* Full Compatibility Chart Modal */}
      {showChartModal && (
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
              maxWidth: 680,
              width: '100%',
              padding: '24px',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.15)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: '#111', margin: 0 }}>
                  🩸 ABO &amp; Rh Blood Transfusion Compatibility Chart
                </h3>
                <p style={{ fontSize: 12, color: '#6B7280', margin: '2px 0 0' }}>
                  Standard Red Blood Cell (RBC) compatibility reference table
                </p>
              </div>
              <button
                onClick={() => setShowChartModal(false)}
                style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#9CA3AF' }}
              >
                ✕
              </button>
            </div>

            <div style={{ overflowX: 'auto', marginBottom: 16 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#F9FAFB', borderBottom: '2px solid #E5E7EB' }}>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 800, color: '#374151' }}>Blood Group</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 800, color: '#8B0000' }}>❤️ Can Donate To</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 800, color: '#1E40AF' }}>💙 Can Receive From</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 800, color: '#111' }}>🔍 Find Donors</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { bg: 'O-', donate: 'All Blood Groups (Universal Donor)', receive: 'O-' },
                    { bg: 'O+', donate: 'O+, A+, B+, AB+', receive: 'O-, O+' },
                    { bg: 'A-', donate: 'A-, A+, AB-, AB+', receive: 'O-, A-' },
                    { bg: 'A+', donate: 'A+, AB+', receive: 'O-, O+, A-, A+' },
                    { bg: 'B-', donate: 'B-, B+, AB-, AB+', receive: 'O-, B-' },
                    { bg: 'B+', donate: 'B+, AB+', receive: 'O-, O+, B-, B+' },
                    { bg: 'AB-', donate: 'AB-, AB+', receive: 'O-, A-, B-, AB-' },
                    { bg: 'AB+', donate: 'AB+ (Universal Recipient)', receive: 'All Blood Groups' },
                  ].map((row, idx) => {
                    const isUserRow = row.bg === userBloodGroup;
                    return (
                      <tr
                        key={row.bg}
                        style={{
                          borderBottom: '1px solid #F3F4F6',
                          background: isUserRow ? '#FFF0EF' : idx % 2 === 0 ? 'white' : '#FAFAFA',
                        }}
                      >
                        <td style={{ padding: '10px 12px', fontWeight: 900, color: '#111' }}>
                          <span style={{ background: '#FFF0EF', border: '1px solid #FDE8E8', color: '#8B0000', padding: '3px 8px', borderRadius: 6 }}>
                            {row.bg}
                          </span>
                          {isUserRow && <span style={{ fontSize: 10, color: '#8B0000', marginLeft: 6 }}>(You)</span>}
                        </td>
                        <td style={{ padding: '10px 12px', color: '#8B0000', fontWeight: 600 }}>{row.donate}</td>
                        <td style={{ padding: '10px 12px', color: '#1E40AF', fontWeight: 600 }}>{row.receive}</td>
                        <td style={{ padding: '10px 12px' }}>
                          <button
                            type="button"
                            onClick={() => {
                              setShowChartModal(false);
                              setSelectedGroup(row.bg);
                              setShowDonorPanel(true);
                            }}
                            style={{
                              background: '#8B0000', color: 'white',
                              border: 'none', padding: '4px 10px',
                              borderRadius: 6, fontSize: 11, fontWeight: 700,
                              cursor: 'pointer', whiteSpace: 'nowrap',
                            }}
                          >
                            🔍 Find
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div style={{ textAlign: 'right' }}>
              <button
                type="button"
                onClick={() => setShowChartModal(false)}
                style={{
                  padding: '9px 20px',
                  background: '#8B0000',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Close Chart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
