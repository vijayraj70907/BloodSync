const Request = require('../models/Request');
const User = require('../models/User');
const { isDonorEligible, addThreeMonths } = require('../utils/eligibility');

const createRequest = async (req, res) => {
  const { patientName, bloodGroup, units, hospital, state, city, contactPhone, message, urgency, locationLink } = req.body;

  try {
    const request = await Request.create({
      postedBy: req.user._id,
      patientName,
      bloodGroup,
      units,
      hospital,
      state,
      city,
      contactPhone,
      message,
      urgency,
      locationLink: locationLink || '',
    });

    const populatedRequest = await Request.findById(request._id)
      .populate('postedBy', 'name phone email bloodGroup city state')
      .populate('acceptedDonors.donor', 'name phone email bloodGroup city state locationLink');

    res.status(201).json(populatedRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getRequests = async (req, res) => {
  try {
    const { state, bloodGroup } = req.query;

    // ── DONOR / GENERAL VIEW ──
    // Only return requests that still need donors:
    //   'active'   = no acceptances yet
    //   'accepted' = partially accepted (acceptedUnits < units, more donors needed)
    // 'fulfilled', 'closed', 'expired' are intentionally excluded so fully-matched
    // requests do NOT appear as available donation opportunities.
    const query = {
      status: { $in: ['active', 'accepted'] },
    };

    if (state) query.state = { $regex: new RegExp(state, 'i') };
    if (bloodGroup) query.bloodGroup = bloodGroup;

    const requests = await Request.find(query)
      .populate('postedBy', 'name phone email bloodGroup city state')
      .populate('acceptedDonors.donor', 'name phone email bloodGroup city state locationLink')
      .sort({ createdAt: -1 });

    res.json({ count: requests.length, requests });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── GET MY REQUESTS (protected) ──
// Returns ALL requests posted by the logged-in user at any status.
// This is used by the patient/requester to see their own request history
// (including accepted/fulfilled ones) without polluting the general donor feed.
const getMyRequests = async (req, res) => {
  try {
    const requests = await Request.find({ postedBy: req.user._id })
      .populate('postedBy', 'name phone email bloodGroup city state')
      .populate('acceptedDonors.donor', 'name phone email bloodGroup city state locationLink')
      .sort({ createdAt: -1 });

    res.json({ count: requests.length, requests });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id)
      .populate('postedBy', 'name phone email bloodGroup city state')
      .populate('acceptedDonors.donor', 'name phone email bloodGroup city state locationLink');

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Backend Authorization Check: Only owner can edit
    if (request.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized: You can only edit your own blood requests' });
    }

    const { patientName, bloodGroup, units, hospital, state, city, contactPhone, message, urgency, locationLink, status } = req.body;

    if (patientName !== undefined) request.patientName = patientName;
    if (bloodGroup !== undefined) request.bloodGroup = bloodGroup;
    if (units !== undefined) request.units = units;
    if (hospital !== undefined) request.hospital = hospital;
    if (state !== undefined) request.state = state;
    if (city !== undefined) request.city = city;
    if (contactPhone !== undefined) request.contactPhone = contactPhone;
    if (message !== undefined) request.message = message;
    if (urgency !== undefined) request.urgency = urgency;
    if (locationLink !== undefined) request.locationLink = locationLink;
    if (status !== undefined) request.status = status;

    // Recalculate status based on units if needed
    if (request.acceptedUnits >= request.units) {
      request.status = 'fulfilled';
    } else if (request.acceptedUnits > 0 && request.status !== 'closed') {
      request.status = 'accepted';
    }

    await request.save();

    const updated = await Request.findById(request._id)
      .populate('postedBy', 'name phone email bloodGroup city state')
      .populate('acceptedDonors.donor', 'name phone email bloodGroup city state locationLink');

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Backend Authorization Check: Only owner can delete
    if (request.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized: You can only delete your own blood requests' });
    }

    await Request.findByIdAndDelete(req.params.id);

    res.json({ message: 'Blood request deleted successfully', _id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const acceptRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Donors cannot accept their own request
    if (request.postedBy.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot accept your own blood request' });
    }

    // Check if donor already accepted
    const alreadyAccepted = request.acceptedDonors.some(
      (d) => d.donor && d.donor.toString() === req.user._id.toString()
    );

    if (alreadyAccepted) {
      return res.status(400).json({ message: 'You have already accepted this blood request' });
    }

    // ── Guard: request must still be open for donations ──
    // 'fulfilled' means all required units are already matched.
    // 'closed'/'expired' means the request is no longer active.
    // This prevents race conditions where two donors simultaneously grab the last unit.
    if (
      request.status === 'fulfilled' ||
      request.status === 'closed' ||
      request.status === 'expired'
    ) {
      return res.status(400).json({
        message:
          request.status === 'fulfilled'
            ? 'This blood request has already been fully accepted by other donors.'
            : 'This blood request is no longer active.',
        requestFulfilled: true,
      });
    }

    // Also guard against acceptedUnits already reaching the limit
    // (handles the race where two concurrent requests both pass the status check)
    if ((request.acceptedUnits || 0) >= request.units) {
      return res.status(400).json({
        message: 'This blood request has already been fully accepted by other donors.',
        requestFulfilled: true,
      });
    }

    // ── 3-Month Eligibility Cooldown Check ──
    const donor = await User.findById(req.user._id);
    if (!donor) {
      return res.status(404).json({ message: 'Donor not found' });
    }

    if (!isDonorEligible(donor)) {
      const nextEligible = donor.nextEligibleDate ? addThreeMonths(donor.lastDonation || donor.nextEligibleDate) : addThreeMonths(donor.lastDonation);
      const nextDateFormatted = new Date(nextEligible).toLocaleDateString('en-GB', {
        day: 'numeric', month: 'long', year: 'numeric',
      });
      return res.status(400).json({
        message: `Donor is not eligible to donate yet. You are currently in a 3-month recovery period until ${nextDateFormatted}.`,
        cooldownActive: true,
        nextEligibleDate: nextEligible,
      });
    }

    // Add donor acceptance
    request.acceptedDonors.push({
      donor: req.user._id,
      units: 1,
      acceptedAt: new Date(),
    });

    request.acceptedUnits = (request.acceptedUnits || 0) + 1;

    if (request.acceptedUnits >= request.units) {
      request.status = 'fulfilled';
    } else {
      request.status = 'accepted';
    }

    await request.save();

    // ── Record Donation & Start 3-Month Cooldown on Donor ──
    const now = new Date();
    const nextEligibleDate = addThreeMonths(now);

    donor.lastDonation = now;
    donor.nextEligibleDate = nextEligibleDate;
    donor.donationCount = (donor.donationCount || 0) + 1;
    await donor.save();

    const updated = await Request.findById(request._id)
      .populate('postedBy', 'name phone email bloodGroup city state')
      .populate('acceptedDonors.donor', 'name phone email bloodGroup city state locationLink');

    res.json({
      ...updated.toObject(),
      donorEligibility: {
        lastDonation: donor.lastDonation,
        nextEligibleDate: donor.nextEligibleDate,
        donationCount: donor.donationCount,
        cooldownMonths: 3,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const declineRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.postedBy.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot decline your own request' });
    }

    // Add donor to declined list if not already present
    if (!request.declinedDonors.includes(req.user._id)) {
      request.declinedDonors.push(req.user._id);
      await request.save();
    }

    const updated = await Request.findById(request._id)
      .populate('postedBy', 'name phone email bloodGroup city state')
      .populate('acceptedDonors.donor', 'name phone email bloodGroup city state locationLink');

    res.json({ message: 'Request declined', request: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createRequest,
  getRequests,
  getMyRequests,
  getRequest,
  updateRequest,
  deleteRequest,
  acceptRequest,
  declineRequest,
};