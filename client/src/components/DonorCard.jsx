import { openInMaps } from '../utils/urlUtils';

export default function DonorCard({ donor }) {
  const getScoreColor = (score) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-amber-500';
    return 'bg-red-400';
  };

  const daysSinceLastDonation = donor.lastDonation
    ? Math.floor((new Date() - new Date(donor.lastDonation)) / (1000 * 60 * 60 * 24))
    : null;

  const initials = donor.name
    ? donor.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'D';

  const isRecommended = donor.isRecommended || donor.score >= 70;

  return (
    <div className={`bg-white border ${isRecommended ? 'border-red-300 ring-1 ring-red-200' : 'border-gray-200'} rounded-xl p-4 flex items-center gap-4 hover:shadow-md transition-all`}>
      {/* Avatar */}
      <div className="w-11 h-11 rounded-full bg-red-50 border-2 border-red-100 flex items-center justify-center font-bold text-red-600 text-sm flex-shrink-0">
        {initials}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-gray-900 text-sm">{donor.name}</span>
          {isRecommended && (
            <span className="bg-red-50 border border-red-200 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
              🤖 AI Recommended
            </span>
          )}
          <span className="bg-green-50 border border-green-200 text-green-700 text-[10px] font-semibold px-2 py-0.5 rounded-full">
            🟢 Eligible
          </span>
        </div>

        <div className="text-xs text-gray-500 flex gap-3 mt-1 flex-wrap items-center">
          <span>📍 {donor.city}, {donor.state}</span>
          {donor.distance !== undefined && donor.distance !== null && (
            <span className="font-semibold text-gray-700">📏 {donor.distance} km</span>
          )}
          <span>{donor.donationCount || 0} donations</span>
          {daysSinceLastDonation !== null && (
            <span>Last donated {daysSinceLastDonation}d ago</span>
          )}
        </div>

        <div className="mt-2">
          {donor.locationLink ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                openInMaps(donor.locationLink);
              }}
              className="inline-flex items-center gap-1 text-xs font-semibold text-red-700 bg-red-50 border border-red-100 px-2.5 py-1 rounded-md hover:bg-red-100 transition-colors"
            >
              📍 View Location on Maps
            </button>
          ) : (
            <span className="text-xs text-gray-400 italic">Location not available</span>
          )}
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3 flex-shrink-0 flex-wrap">
        {/* Score bar */}
        <div className="text-right hidden sm:block">
          <div className="text-xs text-gray-400 mb-1">ML Match</div>
          <div className="flex items-center gap-1.5">
            <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${getScoreColor(donor.score || donor.scorePercent || 75)}`}
                style={{ width: `${donor.score || donor.scorePercent || 75}%` }}
              />
            </div>
            <span className="text-xs font-medium text-gray-600">{donor.score || donor.scorePercent || 75}%</span>
          </div>
        </div>

        {/* Availability */}
        <div className="text-center">
          <div className={`text-xs font-medium flex items-center gap-1 ${donor.isAvailable !== false ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-2 h-2 rounded-full ${donor.isAvailable !== false ? 'bg-green-500' : 'bg-gray-300'}`} />
            {donor.isAvailable !== false ? 'Available' : 'Unavailable'}
          </div>
        </div>

        {/* Blood group badge */}
        <div className="bg-red-50 border border-red-200 text-red-600 font-bold text-lg px-3 py-1.5 rounded-lg leading-none">
          {donor.bloodGroup}
        </div>
      </div>
    </div>
  );
}