const express = require('express');
const { getCourses, getCourse, createCourse, updateCourse, deleteCourse, getCoursesByOrganization, uploadCourseMaterial, deleteCourseMaterial, listCourseMaterials, downloadCourseMaterial } = require('../controllers/courseController');
const { createEnrollment, getCourseEnrollmentStats } = require('../controllers/enrollmentController');
const { protect, authorize } = require('../middleware/auth');
const { upload } = require('../utils/uploadImage');
const { uploadFile } = require('../utils/uploadFile');

const router = express.Router();

router.route('/')
  .get(getCourses)
  .post(protect, authorize('admin', 'trainer'), upload.single('thumbnail'), createCourse);

router.route('/organization/:organizationId')
  .get(getCoursesByOrganization);

// Course enrollment routes
router.route('/:courseId/enroll')
  .post(protect, createEnrollment);

router.route('/:courseId/enrollment-stats')
  .get(protect, authorize('admin', 'trainer'), getCourseEnrollmentStats);

router.route('/:id')
  .get(getCourse)
  .put(protect, authorize('admin', 'trainer'), upload.single('thumbnail'), updateCourse)
  .delete(protect, authorize('admin', 'trainer'), deleteCourse);

// Upload a material to a course
router.post('/:id/materials', protect, authorize('admin', 'trainer'), uploadFile.single('file'), uploadCourseMaterial);
// Delete a material from a course
router.delete('/:id/materials/:materialId', protect, authorize('admin', 'trainer'), deleteCourseMaterial);

// List all materials for a course
router.get('/:id/materials', protect, listCourseMaterials);
// Download a material file
router.get('/:id/materials/:materialId/download', protect, downloadCourseMaterial);

module.exports = router;