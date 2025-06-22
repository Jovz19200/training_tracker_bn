const Attendance = require('../models/Attendance');
const Enrollment = require('../models/Enrollment');
const Schedule = require('../models/Schedule');

// Create attendance record
exports.createAttendance = async (req, res) => {
  try {
    const { enrollment, session, status, checkInTime, checkOutTime, duration, verificationMethod, notes, excuseReason } = req.body;
    // Validate enrollment and session
    const foundEnrollment = await Enrollment.findById(enrollment);
    if (!foundEnrollment) return res.status(404).json({ success: false, message: 'Enrollment not found' });
    const foundSession = await Schedule.findById(session);
    if (!foundSession) return res.status(404).json({ success: false, message: 'Session not found' });
    const attendance = await Attendance.create({ enrollment, session, status, checkInTime, checkOutTime, duration, verificationMethod, notes, excuseReason });
    res.status(201).json({ success: true, data: attendance });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Get all attendance records (optionally filter by enrollment, session, user, course)
exports.getAttendances = async (req, res) => {
  try {
    const filter = {};
    if (req.query.enrollment) filter.enrollment = req.query.enrollment;
    if (req.query.session) filter.session = req.query.session;
    // Populate user and course from enrollment
    const attendances = await Attendance.find(filter)
      .populate({ path: 'enrollment', populate: [{ path: 'user' }, { path: 'course' }] })
      .populate('session');
    res.status(200).json({ success: true, count: attendances.length, data: attendances });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Get a specific attendance record
exports.getAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id)
      .populate({ path: 'enrollment', populate: [{ path: 'user' }, { path: 'course' }] })
      .populate('session');
    if (!attendance) return res.status(404).json({ success: false, message: 'Attendance not found' });
    res.status(200).json({ success: true, data: attendance });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Update an attendance record
exports.updateAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate({ path: 'enrollment', populate: [{ path: 'user' }, { path: 'course' }] })
      .populate('session');
    if (!attendance) return res.status(404).json({ success: false, message: 'Attendance not found' });
    res.status(200).json({ success: true, data: attendance });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Delete an attendance record
exports.deleteAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findByIdAndDelete(req.params.id);
    if (!attendance) return res.status(404).json({ success: false, message: 'Attendance not found' });
    res.status(200).json({ success: true, message: 'Attendance deleted' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Manual attendance for a session
exports.manualAttendance = async (req, res) => {
  try {
    const { sessionId, attendance } = req.body;
    if (!sessionId || !Array.isArray(attendance)) {
      return res.status(400).json({ success: false, message: 'sessionId and attendance array are required' });
    }
    const session = await Schedule.findById(sessionId);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }
    const results = [];
    for (const entry of attendance) {
      const { enrollmentId, status, notes, excuseReason } = entry;
      const enrollment = await Enrollment.findById(enrollmentId);
      if (!enrollment) {
        results.push({ enrollmentId, success: false, message: 'Enrollment not found' });
        continue;
      }
      // Upsert attendance record
      let attendanceRecord = await Attendance.findOne({ enrollment: enrollmentId, session: sessionId });
      if (attendanceRecord) {
        attendanceRecord.status = status;
        attendanceRecord.notes = notes;
        attendanceRecord.excuseReason = excuseReason;
        attendanceRecord.verificationMethod = 'manual';
        await attendanceRecord.save();
        results.push({ enrollmentId, success: true, action: 'updated' });
      } else {
        attendanceRecord = await Attendance.create({
          enrollment: enrollmentId,
          session: sessionId,
          status,
          notes,
          excuseReason,
          verificationMethod: 'manual'
        });
        results.push({ enrollmentId, success: true, action: 'created' });
      }
    }
    res.status(200).json({ success: true, results });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}; 