const express = require('express');
const { getUsers, getUser, createUser, updateUser, deleteUser } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');
const { getUserDisability, updateUserDisability } = require('../controllers/disabilityController');

const router = express.Router();


router.route('/')
  .post(createUser);
 
router.use(protect);
router.use(authorize('admin'));

router.route('/')
  .get(getUsers)


router.route('/:id')
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser);

// Disability info routes
router.get('/:id/disability', protect, getUserDisability);
router.put('/:id/disability', protect, updateUserDisability);

module.exports = router;