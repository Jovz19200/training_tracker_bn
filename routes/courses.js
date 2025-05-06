const express = require('express');
const { getCourses, getCourse, createCourse, updateCourse, deleteCourse } = require('../controllers/courseController');
const { protect, authorize } = require('../middleware/auth');
const { upload } = require('../utils/uploadImage');

const router = express.Router();

router.route('/')
  .get(getCourses)
  .post(protect, authorize('admin', 'trainer'), upload.single('thumbnail'), createCourse);

router.route('/:id')
  .get(getCourse)
  .put(protect, authorize('admin', 'trainer'), upload.single('thumbnail'), updateCourse)
  .delete(protect, authorize('admin', 'trainer'), deleteCourse);

module.exports = router;