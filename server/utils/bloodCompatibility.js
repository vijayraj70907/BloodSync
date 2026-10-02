/**
 * Standard ABO / Rh Blood Transfusion Compatibility Module
 */

const DONATION_COMPATIBILITY = {
  'O-':  ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
  'O+':  ['O+', 'A+', 'B+', 'AB+'],
  'A-':  ['A-', 'A+', 'AB-', 'AB+'],
  'A+':  ['A+', 'AB+'],
  'B-':  ['B-', 'B+', 'AB-', 'AB+'],
  'B+':  ['B+', 'AB+'],
  'AB-': ['AB-', 'AB+'],
  'AB+': ['AB+'],
};

const RECEIVING_COMPATIBILITY = {
  'O-':  ['O-'],
  'O+':  ['O-', 'O+'],
  'A-':  ['O-', 'A-'],
  'A+':  ['O-', 'O+', 'A-', 'A+'],
  'B-':  ['O-', 'B-'],
  'B+':  ['O-', 'O+', 'B-', 'B+'],
  'AB-': ['O-', 'A-', 'B-', 'AB-'],
  'AB+': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
};

/**
 * Gets blood groups that the specified donor group can donate to.
 * @param {string} bloodGroup 
 * @returns {Array<string>}
 */
function getDonationCompatibility(bloodGroup) {
  return DONATION_COMPATIBILITY[bloodGroup] || [bloodGroup];
}

/**
 * Gets blood groups that the specified recipient group can receive blood from.
 * @param {string} bloodGroup 
 * @returns {Array<string>}
 */
function getReceivingCompatibility(bloodGroup) {
  return RECEIVING_COMPATIBILITY[bloodGroup] || [bloodGroup];
}

/**
 * Checks whether a donor blood group can donate to a recipient blood group.
 * @param {string} donorGroup 
 * @param {string} recipientGroup 
 * @returns {boolean}
 */
function canDonateTo(donorGroup, recipientGroup) {
  if (!donorGroup || !recipientGroup) return false;
  const compatibleRecipients = getDonationCompatibility(donorGroup);
  return compatibleRecipients.includes(recipientGroup);
}

/**
 * Checks whether a recipient blood group can receive blood from a donor blood group.
 * @param {string} recipientGroup 
 * @param {string} donorGroup 
 * @returns {boolean}
 */
function canReceiveFrom(recipientGroup, donorGroup) {
  if (!recipientGroup || !donorGroup) return false;
  const compatibleDonors = getReceivingCompatibility(recipientGroup);
  return compatibleDonors.includes(donorGroup);
}

module.exports = {
  DONATION_COMPATIBILITY,
  RECEIVING_COMPATIBILITY,
  getDonationCompatibility,
  getReceivingCompatibility,
  canDonateTo,
  canReceiveFrom,
};
