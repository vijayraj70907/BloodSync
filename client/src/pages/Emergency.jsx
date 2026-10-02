import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import PhoneInput from '../components/PhoneInput';
import api from '../api/axios';
import { isValidGoogleMapsUrl, openInMaps } from '../utils/urlUtils';

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

export default function Emergency() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    patientName: '',
    bloodGroup: '',
    units: 1,
    hospital: '',
    state: '',
    city: '',
    contactPhone: '',
    locationLink: '',
    message: '',
    urgency: 'urgent',
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (form.locationLink && !isValidGoogleMapsUrl(form.locationLink)) {
      setLoading(false);
      setError('Please provide a valid Google Maps link (e.g. https://maps.google.com/...)');
      return;
    }

    try {
      await api.post('/requests', form);
      navigate('/requests');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post request');
    } finally {
      setLoading(false);
    }
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
    marginBottom: 5,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  };

  const sectionStyle = {
    background: 'white',
    border: '1px solid #EBEBEB',
    borderRadius: 12,
    padding: '20px 24px',
    marginBottom: 14,
  };

  const sectionTitleStyle = {
    fontSize: 13,
    fontWeight: 700,
    color: '#111',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottom: '1px solid #F3F4F6',
  };

  return (
    <AppLayout title="Post Emergency Request">
      <style>{`
        @media (max-width: 768px) {
          .patient-grid { grid-template-columns: 1fr !important; }
          .hospital-grid { grid-template-columns: 1fr !important; }
          .urgency-grid { grid-template-columns: 1fr !important; }
          .emerg-section { padding: 16px !important; }
        }
      `}</style>

      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <div
          style={{
            background: '#FEF2F2',
            border: '1px solid #FDE8E8',
            borderRadius: 10,
            padding: '12px 16px',
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#8B0000', flexShrink: 0 }} />
          <span style={{ fontSize: 13, color: '#8B0000', fontWeight: 500 }}>
            This request will be visible to all registered donors. Please provide accurate location & contact information.
          </span>
        </div>

        {error && (
          <div style={{ background: '#FEF2F2', color: '#8B0000', border: '1px solid #FDE8E8', borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 14 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Patient Details */}
          <div className="emerg-section" style={sectionStyle}>
            <div style={sectionTitleStyle}>Patient information</div>
            <div className="patient-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 120px', gap: 14 }}>
              <div>
                <label style={labelStyle}>Patient name</label>
                <input style={inputStyle} name="patientName" placeholder="Full name" value={form.patientName} onChange={handleChange} required />
              </div>
              <div>
                <label style={labelStyle}>Blood group required</label>
                <select style={inputStyle} name="bloodGroup" value={form.bloodGroup} onChange={handleChange} required>
                  <option value="">Select</option>
                  {BLOOD_GROUPS.map((bg) => (
                    <option key={bg}>{bg}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Units needed</label>
                <input style={inputStyle} name="units" type="number" min="1" max="10" value={form.units} onChange={handleChange} required />
              </div>
            </div>
          </div>

          {/* Hospital & Location */}
          <div className="emerg-section" style={sectionStyle}>
            <div style={sectionTitleStyle}>Hospital & Location</div>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Hospital name</label>
              <input style={inputStyle} name="hospital" placeholder="e.g. GMCH Guwahati" value={form.hospital} onChange={handleChange} required />
            </div>

            <div className="hospital-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 14 }}>
              <div>
                <label style={labelStyle}>State</label>
                <select style={inputStyle} name="state" value={form.state} onChange={handleChange} required>
                  <option value="">Select state</option>
                  {STATES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>City</label>
                <input style={inputStyle} name="city" placeholder="e.g. Guwahati" value={form.city} onChange={handleChange} required />
              </div>
              <div>
                <label style={labelStyle}>Contact phone (🇮🇳 +91)</label>
                <PhoneInput value={form.contactPhone} onChange={handleChange} name="contactPhone" placeholder="9876543210" required />
              </div>
            </div>

            {/* Google Maps Location Input */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                <label style={{ ...labelStyle, marginBottom: 0 }}>📍 PATIENT LOCATION (GOOGLE MAPS LINK)</label>
                {form.locationLink && (
                  <button
                    type="button"
                    onClick={() => openInMaps(form.locationLink)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#8B0000',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    📍 Open in Maps
                  </button>
                )}
              </div>
              <input
                style={inputStyle}
                name="locationLink"
                placeholder="Paste Google Maps location link (e.g. https://maps.google.com/...)"
                value={form.locationLink}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Urgency & Additional Details */}
          <div className="emerg-section" style={sectionStyle}>
            <div style={sectionTitleStyle}>Urgency & Details</div>
            <div className="urgency-grid" style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 14 }}>
              <div>
                <label style={labelStyle}>Urgency level</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
                  {[
                    { val: 'critical', label: 'Critical', desc: 'Immediate — within hours', color: '#8B0000', bg: '#FEF2F2' },
                    { val: 'urgent', label: 'Urgent', desc: 'Within 24 hours', color: '#92400E', bg: '#FFFBEB' },
                    { val: 'moderate', label: 'Moderate', desc: 'Within a few days', color: '#1E40AF', bg: '#EFF6FF' },
                  ].map((u) => (
                    <label
                      key={u.val}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '10px 12px',
                        borderRadius: 8,
                        cursor: 'pointer',
                        border: `1.5px solid ${form.urgency === u.val ? u.color : '#E5E7EB'}`,
                        background: form.urgency === u.val ? u.bg : 'white',
                        transition: 'all 0.15s',
                      }}
                    >
                      <input type="radio" name="urgency" value={u.val} checked={form.urgency === u.val} onChange={handleChange} style={{ display: 'none' }} />
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: form.urgency === u.val ? u.color : '#D1D5DB', flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: form.urgency === u.val ? u.color : '#374151' }}>{u.label}</div>
                        <div style={{ fontSize: 11, color: '#9CA3AF' }}>{u.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label style={labelStyle}>
                  Additional message <span style={{ color: '#C4C9D4', fontWeight: 400, textTransform: 'none' }}>(optional)</span>
                </label>
                <textarea
                  style={{ ...inputStyle, resize: 'none', height: 132, verticalAlign: 'top' }}
                  name="message"
                  placeholder="Any additional information for donors..."
                  value={form.message}
                  onChange={handleChange}
                  rows={6}
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1,
                minWidth: 160,
                padding: '12px',
                background: '#8B0000',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 800,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              {loading ? 'Posting...' : 'Post Emergency Request'}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              style={{
                padding: '12px 24px',
                background: 'white',
                color: '#374151',
                border: '1px solid #E5E7EB',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}