const Resource = require('../models/Resource');
const Course = require('../models/Course');

// Create a new resource
exports.createResource = async (req, res) => {
  try {
    const resource = await Resource.create(req.body);
    res.status(201).json({ success: true, data: resource });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Get all resources (optionally filter by organization)
exports.getResources = async (req, res) => {
  try {
    const filter = {};
    if (req.query.organization) filter.organization = req.query.organization;
    const resources = await Resource.find(filter);
    res.status(200).json({ success: true, count: resources.length, data: resources });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Get a specific resource
exports.getResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ success: false, message: 'Resource not found' });
    res.status(200).json({ success: true, data: resource });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Update a resource
exports.updateResource = async (req, res) => {
  try {
    const resource = await Resource.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!resource) return res.status(404).json({ success: false, message: 'Resource not found' });
    res.status(200).json({ success: true, data: resource });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Delete a resource
exports.deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findByIdAndDelete(req.params.id);
    if (!resource) return res.status(404).json({ success: false, message: 'Resource not found' });
    res.status(204).json({ success: true, data: {} });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Check resource availability (simple: is available flag)
exports.checkAvailability = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ success: false, message: 'Resource not found' });
    res.status(200).json({ success: true, available: resource.availability });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Assign a resource to a course
exports.assignResourceToCourse = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ success: false, message: 'Resource not found' });
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    // Prevent duplicate assignment
    if (!course.resources.includes(resource._id)) {
      course.resources.push(resource._id);
      await course.save();
    }
    res.status(200).json({ success: true, message: 'Resource assigned to course', data: course });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// List resources for a course
exports.getResourcesForCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId).populate('resources');
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    res.status(200).json({ success: true, data: course.resources });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}; 