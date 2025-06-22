const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const resourceController = require('../controllers/resourceController');

const router = express.Router();

// Protect all routes in this router
router.use(protect);

// CRUD for resources
router.route('/')
  .get(resourceController.getResources)
  .post(authorize('admin', 'trainer'), resourceController.createResource);

router.route('/:id')
  .get(resourceController.getResource)
  .put(authorize('admin', 'trainer'), resourceController.updateResource)
  .delete(authorize('admin', 'trainer'), resourceController.deleteResource);

// Check resource availability
router.get('/:id/availability', resourceController.checkAvailability);

// Assign a resource to a course
router.post('/:id/assign/:courseId', authorize('admin', 'trainer'), resourceController.assignResourceToCourse);

// List resources for a course
router.get('/course/:courseId', resourceController.getResourcesForCourse);

module.exports = router;