import { openInMaps } from '../utils/urlUtils';
import { getEligibilityInfo } from '../utils/dateUtils';

export default function RequestCard({
  request,
  currentUser,
  onEdit,
  onDelete,
  onAccept,
  onDecline,
  loadingAction,
}) {
  const isOwner =
    currentUser &&
    (currentUser._id === request.postedBy?._id || currentUser._id === request.postedBy);

  const acceptedDonors = request.acceptedDonors || [];
  const declinedDonors = request.declinedDonors || [];
  
  const hasAcceptedByMe =
    currentUser &&
    acceptedDonors.some(
      (d) => (d.donor?._id || d.donor) === currentUser._id
    );

  const hasDeclinedByMe =
    currentUser &&
    declinedDonors.some(
      (dId) => (dId?._id || dId) === currentUser._id
    );

  const totalUnits = request.units || 1;
  const acceptedUnits = request.acceptedUnits || acceptedDonors.length || 0;
  const remainingUnits = Math.max(0, totalUnits - acceptedUnits);

  // Check donor cooldown eligibility
  const eligibility = getEligibilityInfo(currentUser?.nextEligibleDate, currentUser?.lastDonation);

  const timeAgo = (date) => {
    if (!date) return '';
    const mins = Math.floor((new Date() - new Date(date)) / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const getStatusBadge = () => {
    if (request.status === 'fulfilled' || remainingUnits === 0) {
      return { label: '🔵 Fulfilled', bg: '#EFF6FF', color: '#1E40AF', border: '#BFDBFE' };
    }
    if (request.status === 'accepted' || acceptedUnits > 0) {
      return { label: '🟢 Accepted', bg: '#F0FDF4', color: '#166534', border: '#BBF7D0' };
    }
    if (request.status === 'expired') {
      return { label: '🔴 Expired', bg: '#FEF2F2', color: '#991B1B', border: '#FCA5A5' };
    }
    return { label: '🟡 Pending', bg: '#FFFBEB', color: '#92400E', border: '#FDE68A' };
  };

  const statusBadge = getStatusBadge();

  return (
    <div
      style={{
        background: 'white',
        border: '1px solid #EBEBEB',
        borderRadius: 12,
        padding: '18px 20px',
        position: 'relative',
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
        transition: 'all 0.2s ease',
      }}
    >
      {/* Top Header Row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
          <div
            style={{
              background: '#FFF0EF',
              border: '1.5px solid #FDE8E8',
              color: '#8B0000',
              fontWeight: 900,
              fontSize: 16,
              padding: '6px 12px',
              borderRadius: 8,
              flexShrink: 0,
              lineHeight: 1,
            }}
          >
            {request.bloodGroup}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#111', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {request.patientName}
            </div>
            <div style={{ fontSize: 12, color: '#6B7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {request.hospital}
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              padding: '4px 10px',
              borderRadius: 20,
              background: statusBadge.bg,
              color: statusBadge.color,
              border: `1px solid ${statusBadge.border}`,
              whiteSpace: 'nowrap',
            }}
          >
            {statusBadge.label}
          </span>
        </div>
      </div>

      {/* Meta Information Row */}
      <div style={{ display: 'flex', gap: 12, fontSize: 12, color: '#6B7280', flexWrap: 'wrap', marginBottom: 12 }}>
        <span>📍 {request.city}, {request.state}</span>
        <span>⏰ {timeAgo(request.createdAt)}</span>
        <span style={{ color: '#9CA3AF', marginLeft: 'auto' }}>
          Posted by {request.postedBy?.name || 'User'}
        </span>
      </div>

      {/* Units Tracker Bar */}
      <div
        style={{
          background: '#F9FAFB',
          border: '1px solid #F3F4F6',
          borderRadius: 8,
          padding: '8px 12px',
          display: 'flex',
          gap: 14,
          fontSize: 12,
          fontWeight: 600,
          color: '#374151',
          flexWrap: 'wrap',
          alignItems: 'center',
          marginBottom: 12,
        }}
      >
        <span>🩸 {totalUnits} unit{totalUnits > 1 ? 's' : ''} needed</span>
        <span style={{ color: '#166534' }}>✅ {acceptedUnits} unit{acceptedUnits !== 1 ? 's' : ''} accepted</span>
        {remainingUnits > 0 ? (
          <span style={{ color: '#92400E' }}>⏳ {remainingUnits} unit{remainingUnits !== 1 ? 's' : ''} remaining</span>
        ) : (
          <span style={{ color: '#1E40AF' }}>🎉 Fully Matched</span>
        )}
      </div>

      {/* Google Maps Location Button */}
      {request.locationLink && (
        <div style={{ marginBottom: 12 }}>
          <button
            type="button"
            onClick={() => openInMaps(request.locationLink)}
            style={{
              background: '#FFF0EF',
              border: '1px solid #FDE8E8',
              color: '#8B0000',
              padding: '5px 12px',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
            }}
          >
            📍 Open in Maps
          </button>
        </div>
      )}

      {/* Message if present */}
      {request.message && (
        <div style={{ marginBottom: 14, padding: '10px 12px', background: '#F9FAFB', borderRadius: 8, fontSize: 12, color: '#6B7280', lineHeight: 1.5 }}>
          {request.message}
        </div>
      )}

      {/* Accepted Donors List (Visible to Requester and Donors) */}
      {acceptedDonors.length > 0 && (
        <div style={{ marginTop: 12, marginBottom: 14, padding: '10px 12px', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#166534', letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 6 }}>
            ACCEPTED BY ({acceptedDonors.length} DONOR{acceptedDonors.length > 1 ? 'S' : ''}):
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {acceptedDonors.map((ad, idx) => {
              const dInfo = ad.donor || {};
              return (
                <div key={dInfo._id || idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, color: '#15803D', flexWrap: 'wrap', gap: 6 }}>
                  <div style={{ fontWeight: 700 }}>
                    👤 {dInfo.name || 'Donor'} ({dInfo.bloodGroup || 'Donor'})
                  </div>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    {dInfo.phone && (
                      <a href={`tel:${dInfo.phone}`} style={{ color: '#166534', fontWeight: 800, textDecoration: 'underline' }}>
                        📞 {dInfo.phone}
                      </a>
                    )}
                    {dInfo.locationLink && (
                      <button
                        type="button"
                        onClick={() => openInMaps(dInfo.locationLink)}
                        style={{ background: 'white', border: '1px solid #BBF7D0', borderRadius: 4, padding: '2px 6px', fontSize: 10, color: '#166534', cursor: 'pointer', fontWeight: 700 }}
                      >
                        📍 Maps
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Bottom Actions Row */}
      <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
        {/* Requester Action Controls: Edit & Delete */}
        {isOwner ? (
          <div style={{ display: 'flex', gap: 8, width: '100%', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={() => onEdit && onEdit(request)}
              style={{
                background: 'white',
                border: '1.5px solid #E5E7EB',
                color: '#374151',
                padding: '7px 16px',
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              ✏️ Edit
            </button>
            <button
              type="button"
              onClick={() => onDelete && onDelete(request)}
              style={{
                background: '#FEF2F2',
                border: '1.5px solid #FDE8E8',
                color: '#DC2626',
                padding: '7px 16px',
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              🗑️ Delete
            </button>
          </div>
        ) : (
          /* Donor Action Controls: Accept & Decline */
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: 10, flexWrap: 'wrap' }}>
            {request.contactPhone && (
              <a
                href={`tel:${request.contactPhone}`}
                style={{
                  textDecoration: 'none',
                  background: '#8B0000',
                  color: 'white',
                  padding: '7px 16px',
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                📞 Call Patient
              </a>
            )}

            {hasAcceptedByMe ? (
              <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', color: '#166534', fontWeight: 800, fontSize: 12, padding: '6px 14px', borderRadius: 6 }}>
                🟢 Accepted by you
              </div>
            ) : hasDeclinedByMe ? (
              <div style={{ background: '#F3F4F6', color: '#9CA3AF', fontWeight: 600, fontSize: 12, padding: '6px 14px', borderRadius: 6 }}>
                ❌ Declined
              </div>
            ) : remainingUnits > 0 ? (
              !eligibility.isEligible ? (
                // Donor is in cooldown — show cannot accept
                <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 6, padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto' }}>
                  <span style={{ fontSize: 12 }}>🔴</span>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 800, color: '#92400E' }}>Cooldown Active</div>
                    <div style={{ fontSize: 10, color: '#B45309' }}>Eligible: {eligibility.nextEligibleFormatted}</div>
                  </div>
                </div>
              ) : (
              <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
                <button
                  type="button"
                  disabled={loadingAction}
                  onClick={() => onDecline && onDecline(request)}
                  style={{
                    background: 'white',
                    border: '1.5px solid #E5E7EB',
                    color: '#6B7280',
                    padding: '7px 14px',
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  ❌ Decline
                </button>
                <button
                  type="button"
                  disabled={loadingAction}
                  onClick={() => onAccept && onAccept(request)}
                  style={{
                    background: '#16A34A',
                    color: 'white',
                    border: 'none',
                    padding: '7px 18px',
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                  }}
                >
                  ✅ Accept Request
                </button>
              </div>
              )
            ) : (
              <div style={{ fontSize: 12, color: '#9CA3AF', fontWeight: 600 }}>All units fulfilled</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}