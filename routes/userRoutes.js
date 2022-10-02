const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');

router.post('/signup', authController.signUp);

router.post('/login', authController.logIn);

router
  .route('/')
  .get(authController.protect, userController.getUsers)
  .post(
    authController.protect,
    authController.restrictTo('admin'),
    userController.addUser
  );

router
  .route('/:id')
  .get(
    authController.protect,
    authController.restrictTo('admin'),
    userController.getUser
  )
  .patch(
    authController.protect,
    authController.restrictTo('admin'),
    userController.updateUser
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    userController.deleteUser
  );
module.exports = router;
