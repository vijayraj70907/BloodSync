/**
 * Standard ABO / Rh Blood Transfusion Compatibility Utility for Frontend
 */

export const BLOOD_GROUPS = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];

export const DONATION_COMPATIBILITY = {
  'O-':  ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
  'O+':  ['O+', 'A+', 'B+', 'AB+'],
  'A-':  ['A-', 'A+', 'AB-', 'AB+'],
  'A+':  ['A+', 'AB+'],
  'B-':  ['B-', 'B+', 'AB-', 'AB+'],
  'B+':  ['B+', 'AB+'],
  'AB-': ['AB-', 'AB+'],
  'AB+': ['AB+'],
};

export const RECEIVING_COMPATIBILITY = {
  'O-':  ['O-'],
  'O+':  ['O-', 'O+'],
  'A-':  ['O-', 'A-'],
  'A+':  ['O-', 'O+', 'A-', 'A+'],
  'B-':  ['O-', 'B-'],
  'B+':  ['O-', 'O+', 'B-', 'B+'],
  'AB-': ['O-', 'A-', 'B-', 'AB-'],
  'AB+': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
};

export const getDonationCompatibility = (bloodGroup) => {
  return DONATION_COMPATIBILITY[bloodGroup] || [];
};

export const getReceivingCompatibility = (bloodGroup) => {
  return RECEIVING_COMPATIBILITY[bloodGroup] || [];
};

export const canDonateTo = (donorGroup, recipientGroup) => {
  if (!donorGroup || !recipientGroup) return false;
  return (DONATION_COMPATIBILITY[donorGroup] || []).includes(recipientGroup);
};

export const canReceiveFrom = (recipientGroup, donorGroup) => {
  if (!recipientGroup || !donorGroup) return false;
  return (RECEIVING_COMPATIBILITY[recipientGroup] || []).includes(donorGroup);
};
