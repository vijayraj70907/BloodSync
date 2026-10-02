import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import AppLayout from '../components/AppLayout';
import api from '../api/axios';
import { openInMaps } from '../utils/urlUtils';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const STATES_AND_UTS = [
  // 28 States
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar',
  'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana',
  'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
  'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya',
  'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana',
  'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  // 8 Union Territories
  'Andaman and Nicobar Islands', 'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu', 'Delhi',
  'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
];

export default function Search() {
  const { user } = useAuth();
  const [form, setForm] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const bgParam = urlParams.get('bloodGroup');
    const stateParam = urlParams.get('state');
    const cityParam = urlParams.get('city');
    return {
      bloodGroup: bgParam || '',
      state: stateParam || user?.state || '',
      city: cityParam || '',
    };
  });
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [meta, setMeta] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const bgParam = urlParams.get('bloodGroup');
    const stateParam = urlParams.get('state') || form.state || user?.state || '';
    const cityParam = urlParams.get('city') || form.city || '';

    if (bgParam) {
      setLoading(true);
      setSearched(true);
      const searchParams = new URLSearchParams();
      searchParams.append('bloodGroup', bgParam);
      if (stateParam) searchParams.append('state', stateParam);
      if (cityParam) searchParams.append('city', cityParam);

      api.get(`/search?${searchParams}`)
        .then(({ data }) => {
          setDonors(data.donors || []);
          setMeta(data);
        })
        .catch(() => setDonors([]))
        .finally(() => setLoading(false));
    }
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!form.bloodGroup) return;

    setLoading(true);
    setSearched(true);
    setShowFilters(false);
    try {
      const searchParams = new URLSearchParams();
      searchParams.append('bloodGroup', form.bloodGroup);
      if (form.state) searchParams.append('state', form.state);
      if (form.city) searchParams.append('city', form.city);

      const { data } = await api.get(`/search?${searchParams}`);
      setDonors(data.donors || []);
      setMeta(data);
    } catch {
      setDonors([]);
    } finally {
      setLoading(false);
    }
  };

  const select = {
    width: '100%', padding: '9px 12px',
    border: '1.5px solid #E5E7EB', borderRadius: 8,
    fontSize: 13, fontFamily: 'inherit', outline: 'none',
    background: 'white', color: '#111', boxSizing: 'border-box',
  };

  const label = {
    fontSize: 11, fontWeight: 700, color: '#6B7280',
    display: 'block', marginBottom: 5, letterSpacing: 0.4,
    textTransform: 'uppercase',
  };

  const filterPanel = (
    <div style={{ background: 'white', border: '1px solid #EBEBEB', borderRadius: 12, padding: '20px' }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#111', marginBottom: 16 }}>Search filters</div>
      <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label style={label}>Blood group</label>
          <select style={select} name="bloodGroup" value={form.bloodGroup} onChange={handleChange} required>
            <option value="">Select group</option>
            {BLOOD_GROUPS.map(bg => <option key={bg}>{bg}</option>)}
          </select>
        </div>
        <div>
          <label style={label}>State / UT (Optional)</label>
          <select style={select} name="state" value={form.state} onChange={handleChange}>
            <option value="">All States & UTs</option>
            {STATES_AND_UTS.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label style={label}>City / District</label>
          <input style={select} name="city" value={form.city} onChange={handleChange} placeholder="e.g. Guwahati or Hyderabad" />
        </div>
        <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 6 }}>🤖 Smart ML Recommendation</div>
          <div style={{ fontSize: 12, color: '#9CA3AF', lineHeight: 1.6 }}>
            Donors are automatically filtered for 3-month eligibility & ranked by ML match algorithm.
          </div>
        </div>
        <button type="submit" disabled={loading} style={{
          width: '100%', padding: '10px', background: '#8B0000', color: 'white',
          border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700,
          cursor: 'pointer', fontFamily: 'inherit',
        }}>
          {loading ? 'Searching...' : 'Search Eligible Donors'}
        </button>
      </form>
    </div>
  );

  return (
    <AppLayout title="Find Donors">
      <style>{`
        @media (max-width: 768px) {
          .search-layout { grid-template-columns: 1fr !important; }
          .filter-sidebar { display: none !important; }
          .filter-sidebar.mobile-open { display: block !important; margin-bottom: 16px; }
          .filter-toggle-btn { display: flex !important; }
          .donor-card-right { flex-wrap: wrap; gap: 8px !important; }
          .match-score { display: none !important; }
        }
        .filter-toggle-btn { display: none; }
      `}</style>

      <button className="filter-toggle-btn" onClick={() => setShowFilters(p => !p)} style={{
        width: '100%', padding: '10px', marginBottom: 12,
        background: 'white', border: '1px solid #EBEBEB',
        borderRadius: 8, fontSize: 13, fontWeight: 600,
        cursor: 'pointer', fontFamily: 'inherit', color: '#374151',
        alignItems: 'center', justifyContent: 'center', gap: 8,
      }}>
        {showFilters ? 'Hide Filters' : 'Show Filters'}
      </button>

      <div className="search-layout" style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 16, alignItems: 'start' }}>
        <div className={`filter-sidebar ${showFilters ? 'mobile-open' : ''}`} style={{ position: 'sticky', top: 0 }}>
          {filterPanel}
        </div>

        <div>
          {!searched && (
            <div style={{ background: 'white', border: '1px solid #EBEBEB', borderRadius: 12, padding: '48px 32px', textAlign: 'center' }}>
              <div style={{ width: 48, height: 48, background: '#FFF0EF', borderRadius: 12, margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8B0000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
                </svg>
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#111', marginBottom: 6 }}>Find an eligible blood donor</div>
              <div style={{ fontSize: 13, color: '#9CA3AF' }}>Select blood group and state to view ML-recommended eligible donors across India</div>
            </div>
          )}

          {loading && (
            <div style={{ background: 'white', border: '1px solid #EBEBEB', borderRadius: 12, padding: '48px', textAlign: 'center' }}>
              <div style={{ fontSize: 13, color: '#9CA3AF' }}>Running eligibility check & ML donor ranking...</div>
            </div>
          )}

          {searched && !loading && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>
                  {donors.length > 0 ? `${donors.length} eligible donor${donors.length > 1 ? 's' : ''} found` : 'No eligible donors found'}
                  {meta?.city ? ` in ${meta.city}` : meta?.state ? ` in ${meta.state}` : ''}
                </div>
                {donors.length > 0 && <div style={{ fontSize: 12, color: '#9CA3AF' }}>Ranked by ML Recommendation Score</div>}
              </div>

              {donors.length === 0 && (
                <div style={{ background: 'white', border: '1px solid #EBEBEB', borderRadius: 12, padding: '48px', textAlign: 'center' }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 6 }}>No eligible donors found</div>
                  <div style={{ fontSize: 13, color: '#9CA3AF' }}>Donors who recently donated within the last 3 months are automatically hidden for safety. Try another location or blood group.</div>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {donors.map((donor, idx) => {
                  const initials = donor.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                  const daysSince = donor.lastDonation ? Math.floor((new Date() - new Date(donor.lastDonation)) / (1000 * 60 * 60 * 24)) : null;
                  const isTopRecommended = donor.isRecommended || (donor.score >= 70) || (idx === 0 && donor.score >= 60);

                  return (
                    <div key={donor._id || idx} style={{ background: 'white', border: isTopRecommended ? '1.5px solid #FCA5A5' : '1px solid #EBEBEB', borderRadius: 12, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', position: 'relative' }}>
                      <div style={{ width: 42, height: 42, borderRadius: '50%', background: '#FFF0EF', border: '1.5px solid #FDE8E8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: '#8B0000', flexShrink: 0 }}>
                        {initials}
                      </div>

                      <div style={{ flex: 1, minWidth: 200 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 3 }}>
                          <span style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>{donor.name}</span>
                          {isTopRecommended && (
                            <span style={{ background: '#FEF2F2', border: '1px solid #FDE8E8', color: '#8B0000', fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 12, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                              🤖 AI Recommended
                            </span>
                          )}
                          <span style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', color: '#166534', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 12 }}>
                            🟢 Eligible
                          </span>
                        </div>

                        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', fontSize: 12, color: '#6B7280' }}>
                          <span>📍 {donor.city}, {donor.state}</span>
                          {donor.distance !== undefined && donor.distance !== null && (
                            <span style={{ color: '#4B5563', fontWeight: 600 }}>📏 {donor.distance} km away</span>
                          )}
                          <span>{donor.donationCount || 0} donations</span>
                          {daysSince !== null && <span>Last {daysSince}d ago</span>}
                        </div>

                        {/* Maps Location button */}
                        <div style={{ marginTop: 6 }}>
                          {donor.locationLink ? (
                            <button
                              type="button"
                              onClick={() => openInMaps(donor.locationLink)}
                              style={{
                                background: '#FFF0EF',
                                border: '1px solid #FDE8E8',
                                color: '#8B0000',
                                padding: '3px 10px',
                                borderRadius: 6,
                                fontSize: 11,
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                              }}
                            >
                              📍 View Location on Maps
                            </button>
                          ) : (
                            <span style={{ fontSize: 11, color: '#9CA3AF', fontStyle: 'italic' }}>Location not available</span>
                          )}
                        </div>
                      </div>

                      <div className="donor-card-right" style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                        <div className="match-score">
                          <div style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 4, textAlign: 'right' }}>ML Match</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div style={{ width: 64, height: 4, background: '#F3F4F6', borderRadius: 2, overflow: 'hidden' }}>
                              <div style={{ height: '100%', borderRadius: 2, background: (donor.score || donor.scorePercent) >= 80 ? '#16A34A' : (donor.score || donor.scorePercent) >= 60 ? '#D97706' : '#8B0000', width: `${donor.score || donor.scorePercent || 75}%` }} />
                            </div>
                            <span style={{ fontSize: 12, fontWeight: 700, color: '#374151' }}>{donor.score || donor.scorePercent || 75}%</span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <div style={{ width: 7, height: 7, borderRadius: '50%', background: donor.isAvailable !== false ? '#16A34A' : '#D1D5DB' }} />
                          <span style={{ fontSize: 12, color: donor.isAvailable !== false ? '#16A34A' : '#9CA3AF', fontWeight: 500 }}>
                            {donor.isAvailable !== false ? 'Available' : 'Unavailable'}
                          </span>
                        </div>

                        <div style={{ background: '#FFF0EF', border: '1.5px solid #FDE8E8', color: '#8B0000', fontWeight: 800, fontSize: 14, padding: '4px 8px', borderRadius: 8 }}>
                          {donor.bloodGroup}
                        </div>

                        {donor.phone && (
                          <a href={`tel:${donor.phone}`} style={{
                            display: 'inline-flex', alignItems: 'center',
                            textDecoration: 'none', background: '#8B0000', color: 'white',
                            padding: '6px 14px', borderRadius: 6,
                            fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap',
                          }}>Call</a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}