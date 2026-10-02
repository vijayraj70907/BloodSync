import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import RequestCard from '../components/RequestCard';
import PhoneInput from '../components/PhoneInput';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { isValidGoogleMapsUrl } from '../utils/urlUtils';
import { formatDate } from '../utils/dateUtils';

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

export default function Requests() {
  const { user, refreshUser } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bloodGroup, setBloodGroup] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('bloodGroup') || '';
  });
  const [notification, setNotification] = useState({ message: '', type: '' });

  // Modal States
  const [editingRequest, setEditingRequest] = useState(null);
  const [editForm, setEditForm] = useState({
    patientName: '',
    bloodGroup: '',
    units: 1,
    hospital: '',
    state: '',
    city: '',
    contactPhone: '',
    locationLink: '',
    urgency: 'urgent',
    message: '',
  });
  const [editError, setEditError] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  const [deletingRequest, setDeletingRequest] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [acceptingRequest, setAcceptingRequest] = useState(null);
  const [acceptLoading, setAcceptLoading] = useState(false);

  // Cooldown Warning Modal state
  const [cooldownInfo, setCooldownInfo] = useState(null);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const params = bloodGroup ? `?bloodGroup=${bloodGroup}` : '';

      // Fetch 1: General donor feed — only active + partially-accepted requests
      const generalFetch = api.get(`/requests${params}`);

      // Fetch 2: The logged-in user's OWN requests at ALL statuses
      // (so patient can still see their fulfilled/accepted requests)
      const myFetch = api.get('/requests/my');

      const [generalRes, myRes] = await Promise.all([generalFetch, myFetch]);

      const generalRequests = generalRes.data.requests || [];
      const myRequests = myRes.data.requests || [];

      // Merge: own requests first (patient sees them at top), then donor feed
      // Deduplicate by _id so a request that is both in "mine" and "active" only appears once
      const seen = new Set();
      const merged = [];

      // Put own requests first (ensures patient always sees them)
      for (const r of myRequests) {
        if (!seen.has(r._id)) {
          seen.add(r._id);
          merged.push(r);
        }
      }

      // Then add remaining general requests (requests from others that are still available)
      for (const r of generalRequests) {
        if (!seen.has(r._id)) {
          seen.add(r._id);
          merged.push(r);
        }
      }

      setRequests(merged);
    } catch {
      // Ignore errors silently
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [bloodGroup]);


  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: '', type: '' }), 4000);
  };

  // Owner Edit Handlers
  const handleOpenEdit = (request) => {
    setEditingRequest(request);
    setEditForm({
      patientName: request.patientName || '',
      bloodGroup: request.bloodGroup || '',
      units: request.units || 1,
      hospital: request.hospital || '',
      state: request.state || '',
      city: request.city || '',
      contactPhone: request.contactPhone || '',
      locationLink: request.locationLink || '',
      urgency: request.urgency || 'urgent',
      message: request.message || '',
    });
    setEditError('');
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setEditError('');

    if (editForm.locationLink && !isValidGoogleMapsUrl(editForm.locationLink)) {
      setEditError('Please provide a valid Google Maps location link');
      return;
    }

    setEditLoading(true);
    try {
      const { data } = await api.put(`/requests/${editingRequest._id}`, editForm);
      setRequests((prev) =>
        prev.map((r) => (r._id === data._id ? data : r))
      );
      setEditingRequest(null);
      showToast('Blood request updated successfully!');
    } catch (err) {
      setEditError(err.response?.data?.message || 'Failed to update request');
    } finally {
      setEditLoading(false);
    }
  };

  // Owner Delete Handlers
  const handleOpenDelete = (request) => {
    setDeletingRequest(request);
  };

  const handleConfirmDelete = async () => {
    if (!deletingRequest) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/requests/${deletingRequest._id}`);
      setRequests((prev) => prev.filter((r) => r._id !== deletingRequest._id));
      setDeletingRequest(null);
      showToast('Blood request deleted successfully.');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete request', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Donor Accept Handlers
  const handleOpenAccept = (request) => {
    setAcceptingRequest(request);
  };

  const handleConfirmAccept = async () => {
    if (!acceptingRequest) return;
    setAcceptLoading(true);
    try {
      const { data } = await api.put(`/requests/${acceptingRequest._id}/accept`);

      // Strip donorEligibility from the request data before storing in state
      const { donorEligibility, ...requestData } = data;

      setRequests((prev) => {
        // If request is now fully fulfilled, remove it from the general feed
        // (owners still see it via their /my endpoint on next refresh)
        if (requestData.status === 'fulfilled') {
          // Keep it visible only for the owner (postedBy)
          const ownerId = requestData.postedBy?._id || requestData.postedBy;
          const isOwnerView = user && (user._id === ownerId);
          if (!isOwnerView) {
            return prev.filter((r) => r._id !== requestData._id);
          }
        }
        // Otherwise update it in place (partial acceptance — still needs more donors)
        return prev.map((r) => (r._id === requestData._id ? requestData : r));
      });
      setAcceptingRequest(null);

      // Update local auth context with new donation/eligibility info
      if (donorEligibility) {
        await refreshUser();
        // Show the cooldown warning modal
        setCooldownInfo(donorEligibility);
      } else {
        showToast('Thank you! You have accepted this blood request.');
      }
    } catch (err) {
      const errData = err.response?.data;
      if (errData?.cooldownActive) {
        showToast(errData.message, 'error');
      } else if (errData?.requestFulfilled) {
        // Another donor just accepted the last unit — remove it from the list
        // so this donor no longer sees it as available
        setRequests((prev) =>
          prev.filter((r) => r._id !== acceptingRequest._id)
        );
        setAcceptingRequest(null);
        showToast('This blood request has just been fulfilled by another donor.', 'info');
      } else {
        showToast(errData?.message || 'Failed to accept request', 'error');
      }
    } finally {
      setAcceptLoading(false);
    }
  };

  // Donor Decline Handler
  const handleDecline = async (request) => {
    try {
      const { data } = await api.put(`/requests/${request._id}/decline`);
      if (data.request) {
        setRequests((prev) =>
          prev.map((r) => (r._id === data.request._id ? data.request : r))
        );
      }
      showToast('Request declined', 'info');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to decline request', 'error');
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
    marginBottom: 4,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  };

  return (
    <AppLayout title="Emergency Requests">
      <style>{`
        @media (max-width: 768px) {
          .req-header { flex-direction: column !important; align-items: flex-start !important; gap: 10px !important; }
          .req-filter-row { width: 100%; }
          .req-filter-row select { width: 100%; }
          .req-post-btn { width: 100%; justify-content: center; }
        }
      `}</style>

      {/* Notification Toast */}
      {notification.message && (
        <div
          style={{
            position: 'fixed',
            top: 20,
            right: 20,
            zIndex: 2000,
            background: notification.type === 'error' ? '#FEF2F2' : notification.type === 'info' ? '#EFF6FF' : '#F0FDF4',
            color: notification.type === 'error' ? '#8B0000' : notification.type === 'info' ? '#1E40AF' : '#166534',
            border: `1px solid ${notification.type === 'error' ? '#FDE8E8' : notification.type === 'info' ? '#BFDBFE' : '#BBF7D0'}`,
            padding: '12px 20px',
            borderRadius: 8,
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          {notification.message}
        </div>
      )}

      {/* Header & Filter Controls */}
      <div className="req-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, gap: 10 }}>
        <div className="req-filter-row" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 13, color: '#6B7280', fontWeight: 500, whiteSpace: 'nowrap' }}>Filter:</span>
          <select
            value={bloodGroup}
            onChange={(e) => setBloodGroup(e.target.value)}
            style={{ padding: '6px 10px', border: '1.5px solid #E5E7EB', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', outline: 'none', background: 'white' }}
          >
            <option value="">All groups</option>
            {BLOOD_GROUPS.map((bg) => (
              <option key={bg}>{bg}</option>
            ))}
          </select>
        </div>
        <Link
          to="/emergency"
          className="req-post-btn"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            textDecoration: 'none',
            background: '#8B0000',
            color: 'white',
            padding: '8px 18px',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 700,
            whiteSpace: 'nowrap',
          }}
        >
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#FFAAAA' }} />
          Post Request
        </Link>
      </div>

      {loading && (
        <div style={{ background: 'white', border: '1px solid #EBEBEB', borderRadius: 12, padding: '48px', textAlign: 'center' }}>
          <div style={{ fontSize: 13, color: '#9CA3AF' }}>Loading requests...</div>
        </div>
      )}

      {!loading && requests.length === 0 && (
        <div style={{ background: 'white', border: '1px solid #EBEBEB', borderRadius: 12, padding: '48px 32px', textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, background: '#FFF0EF', borderRadius: 12, margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8B0000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#111', marginBottom: 6 }}>No active requests</div>
          <div style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 16 }}>There are no emergency requests right now</div>
          <Link to="/emergency" style={{ fontSize: 13, color: '#8B0000', textDecoration: 'none', fontWeight: 600 }}>
            Post the first request
          </Link>
        </div>
      )}

      {/* Requests List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {requests.map((req) => (
          <RequestCard
            key={req._id}
            request={req}
            currentUser={user}
            onEdit={handleOpenEdit}
            onDelete={handleOpenDelete}
            onAccept={handleOpenAccept}
            onDecline={handleDecline}
          />
        ))}
      </div>

      {/* Edit Request Modal */}
      {editingRequest && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'white', borderRadius: 16, maxWidth: 540, width: '100%', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#111', margin: 0 }}>✏️ Edit Blood Request</h3>
              <button onClick={() => setEditingRequest(null)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#9CA3AF' }}>✕</button>
            </div>

            {editError && <div style={{ background: '#FEF2F2', color: '#8B0000', border: '1px solid #FDE8E8', borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 14 }}>{editError}</div>}

            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 100px', gap: 10 }}>
                <div>
                  <label style={labelStyle}>Patient Name</label>
                  <input style={inputStyle} value={editForm.patientName} onChange={(e) => setEditForm({ ...editForm, patientName: e.target.value })} required />
                </div>
                <div>
                  <label style={labelStyle}>Blood Group</label>
                  <select style={inputStyle} value={editForm.bloodGroup} onChange={(e) => setEditForm({ ...editForm, bloodGroup: e.target.value })} required>
                    {BLOOD_GROUPS.map((bg) => (
                      <option key={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Units</label>
                  <input style={inputStyle} type="number" min="1" max="10" value={editForm.units} onChange={(e) => setEditForm({ ...editForm, units: parseInt(e.target.value) || 1 })} required />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Hospital Name</label>
                <input style={inputStyle} value={editForm.hospital} onChange={(e) => setEditForm({ ...editForm, hospital: e.target.value })} required />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={labelStyle}>State</label>
                  <select style={inputStyle} value={editForm.state} onChange={(e) => setEditForm({ ...editForm, state: e.target.value })} required>
                    {STATES.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>City</label>
                  <input style={inputStyle} value={editForm.city} onChange={(e) => setEditForm({ ...editForm, city: e.target.value })} required />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Contact Phone (🇮🇳 +91)</label>
                <PhoneInput value={editForm.contactPhone} onChange={(val) => setEditForm({ ...editForm, contactPhone: val.target.value })} required />
              </div>

              <div>
                <label style={labelStyle}>📍 Patient Location / Google Maps Link</label>
                <input style={inputStyle} placeholder="https://maps.google.com/..." value={editForm.locationLink} onChange={(e) => setEditForm({ ...editForm, locationLink: e.target.value })} />
              </div>

              <div>
                <label style={labelStyle}>Urgency</label>
                <select style={inputStyle} value={editForm.urgency} onChange={(e) => setEditForm({ ...editForm, urgency: e.target.value })}>
                  <option value="critical">Critical (Immediate)</option>
                  <option value="urgent">Urgent (24 hours)</option>
                  <option value="moderate">Moderate (Few days)</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>Additional Message</label>
                <textarea style={{ ...inputStyle, resize: 'none', height: 70 }} value={editForm.message} onChange={(e) => setEditForm({ ...editForm, message: e.target.value })} />
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                <button type="button" onClick={() => setEditingRequest(null)} style={{ padding: '10px 16px', background: 'white', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 13, fontWeight: 600 }}>
                  Cancel
                </button>
                <button type="submit" disabled={editLoading} style={{ flex: 1, padding: '10px 16px', background: '#8B0000', color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                  {editLoading ? 'Saving...' : 'Save Updates'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingRequest && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'white', borderRadius: 16, maxWidth: 400, width: '100%', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#FEF2F2', border: '1px solid #FDE8E8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: '#DC2626', marginBottom: 14 }}>
              🗑️
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 800, color: '#111', margin: '0 0 8px' }}>Delete Blood Request</h3>
            <p style={{ fontSize: 13, color: '#4B5563', lineHeight: 1.5, margin: '0 0 20px' }}>
              Are you sure you want to delete this blood request?
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" onClick={() => setDeletingRequest(null)} style={{ flex: 1, padding: '10px', background: 'white', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                Cancel
              </button>
              <button type="button" disabled={deleteLoading} onClick={handleConfirmDelete} style={{ flex: 1, padding: '10px', background: '#DC2626', color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                {deleteLoading ? 'Deleting...' : 'Delete Request'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Accept Confirmation Modal */}
      {acceptingRequest && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'white', borderRadius: 16, maxWidth: 420, width: '100%', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#F0FDF4', border: '1px solid #BBF7D0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: '#166534', marginBottom: 14 }}>
              🩺
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 800, color: '#111', margin: '0 0 8px' }}>Accept Blood Request</h3>
            <p style={{ fontSize: 13, color: '#4B5563', lineHeight: 1.5, margin: '0 0 8px' }}>
              Are you sure you want to accept this blood request for <strong>{acceptingRequest.patientName}</strong> ({acceptingRequest.bloodGroup}) at {acceptingRequest.hospital}?
            </p>
            <p style={{ fontSize: 12, color: '#6B7280', margin: '0 0 20px', fontStyle: 'italic' }}>
              Your donor profile contact details will be shared with the patient so you can coordinate the donation.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" onClick={() => setAcceptingRequest(null)} style={{ flex: 1, padding: '10px', background: 'white', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                Cancel
              </button>
              <button type="button" disabled={acceptLoading} onClick={handleConfirmAccept} style={{ flex: 1, padding: '10px', background: '#16A34A', color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 800, cursor: 'pointer' }}>
                {acceptLoading ? 'Processing...' : 'Accept'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cooldown Warning Modal — shown after successfully accepting a request */}
      {cooldownInfo && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'white', borderRadius: 18, maxWidth: 440, width: '100%', padding: '28px 24px', boxShadow: '0 24px 40px rgba(0,0,0,0.15)', border: '1px solid #FDE8E8' }}>
            {/* Icon */}
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, #FFF0EF, #FEE2E2)', border: '2px solid #FDE8E8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, marginBottom: 16 }}>
              🩸
            </div>
            <h3 style={{ fontSize: 19, fontWeight: 900, color: '#111', margin: '0 0 8px', lineHeight: 1.2 }}>
              Thank You for Donating! 🎉
            </h3>
            <p style={{ fontSize: 13, color: '#4B5563', lineHeight: 1.6, margin: '0 0 18px' }}>
              Your generous donation has been recorded. To protect your health, you must wait <strong>{cooldownInfo.cooldownDays} days</strong> before donating again.
            </p>

            {/* Eligibility Info Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18 }}>
              <div style={{ background: '#F9FAFB', borderRadius: 10, padding: '12px 14px', border: '1px solid #F3F4F6' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 4 }}>Donation Date</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#111' }}>{formatDate(cooldownInfo.lastDonation)}</div>
              </div>
              <div style={{ background: '#FFF0EF', borderRadius: 10, padding: '12px 14px', border: '1px solid #FDE8E8' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 4 }}>Next Eligible Date</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#8B0000' }}>{formatDate(cooldownInfo.nextEligibleDate)}</div>
              </div>
            </div>

            {/* Total donations */}
            <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 10, padding: '10px 14px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 20 }}>✅</span>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#166534' }}>Total Donations: {cooldownInfo.donationCount}</div>
                <div style={{ fontSize: 11, color: '#4ADE80' }}>Lives Impacted: ~{(cooldownInfo.donationCount || 1) * 3}</div>
              </div>
            </div>

            {/* Warning notice */}
            <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 8, padding: '10px 14px', marginBottom: 20, fontSize: 12, color: '#92400E', lineHeight: 1.5 }}>
              ⚠️ <strong>Cooldown Period Active:</strong> You will not be able to accept new blood donation requests until <strong>{formatDate(cooldownInfo.nextEligibleDate)}</strong>.
            </div>

            <button
              type="button"
              onClick={() => setCooldownInfo(null)}
              style={{
                width: '100%',
                padding: '12px',
                background: '#8B0000',
                color: 'white',
                border: 'none',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 800,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              I Understand — Close
            </button>
          </div>
        </div>
      )}
    </AppLayout>
  );
}