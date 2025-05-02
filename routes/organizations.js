const express = require('express');
const {
  getOrganizations,
  getOrganization,
  createOrganization,
  updateOrganization,
  deleteOrganization
} = require('../controllers/organizationController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router
  .route('/')
  .get(getOrganizations)
  .post(protect, authorize('admin'), createOrganization);

router
  .route('/:id')
  .get(getOrganization)
  .put(protect, authorize('admin'), updateOrganization)
  .delete(protect, authorize('admin'), deleteOrganization);

module.exports = router; 