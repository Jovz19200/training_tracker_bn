const express = require('express');
const { getCourses, getCourse, createCourse, updateCourse, deleteCourse } = require('../controllers/courseController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get(getCourses)
  .post(protect, authorize('admin', 'trainer'), createCourse);

router.route('/:id')
  .get(getCourse)
  .put(protect, authorize('admin', 'trainer'), updateCourse)
  .delete(protect, authorize('admin', 'trainer'), deleteCourse);

module.exports = router;