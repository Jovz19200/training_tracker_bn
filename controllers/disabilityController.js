const User = require('../models/User');

// Get disability info for a user
exports.getUserDisability = async (req, res) => {
  try {
    // Only self or admin can view
    if (req.user.id !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    const user = await User.findById(req.params.id).select('hasDisability disabilityType accessibilityNeeds');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update disability info for a user
exports.updateUserDisability = async (req, res) => {
  try {
    // Only self or admin can update
    if (req.user.id !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    const { hasDisability, disabilityType, accessibilityNeeds } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { hasDisability, disabilityType, accessibilityNeeds },
      { new: true, runValidators: true }
    ).select('hasDisability disabilityType accessibilityNeeds');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}; 