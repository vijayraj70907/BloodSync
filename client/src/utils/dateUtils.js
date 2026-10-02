export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

export const getRemainingDays = (nextEligibleDateStr) => {
  if (!nextEligibleDateStr) return 0;
  const target = new Date(nextEligibleDateStr);
  const now = new Date();
  if (isNaN(target.getTime()) || target <= now) return 0;

  const diffTime = target.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const getEligibilityInfo = (nextEligibleDateStr, lastDonationStr) => {
  if (!nextEligibleDateStr) {
    return {
      isEligible: true,
      status: 'eligible',
      statusBadge: '🟢 Eligible',
      message: 'You are eligible to accept new blood donation requests.',
      remainingDays: 0,
      nextEligibleFormatted: '',
      lastDonationFormatted: lastDonationStr ? formatDate(lastDonationStr) : '',
      countdownText: 'Eligible today',
    };
  }

  const targetDate = new Date(nextEligibleDateStr);
  const now = new Date();

  if (isNaN(targetDate.getTime()) || targetDate <= now) {
    return {
      isEligible: true,
      status: 'eligible',
      statusBadge: '🟢 Eligible',
      message: 'You are eligible to accept new blood donation requests.',
      remainingDays: 0,
      nextEligibleFormatted: formatDate(nextEligibleDateStr),
      lastDonationFormatted: lastDonationStr ? formatDate(lastDonationStr) : '',
      countdownText: 'Eligible today',
    };
  }

  const remainingDays = Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const formattedNextDate = formatDate(nextEligibleDateStr);

  let countdownText = `Eligible in ${remainingDays} day${remainingDays > 1 ? 's' : ''}`;
  if (remainingDays === 1) countdownText = 'Eligible tomorrow';
  if (remainingDays === 0) countdownText = 'Eligible today';

  return {
    isEligible: false,
    status: 'cooldown',
    statusBadge: '🔴 Currently Not Eligible',
    message: `You are in a 3-month cooldown period. Next eligible date: ${formattedNextDate}`,
    remainingDays,
    nextEligibleFormatted: formattedNextDate,
    lastDonationFormatted: lastDonationStr ? formatDate(lastDonationStr) : '',
    countdownText,
  };
};
