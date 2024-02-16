const express = require('express');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');
const postRouter = require('./postRoutes');

const router = express.Router({ mergeParams: true });

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

router.use(authController.protect);

router.patch('/updateMyPassword', authController.updatePassword);
router.use('/:userId/posts', postRouter);

router.get(
  '/me',
  authController.restrictTo('user'),
  userController.getMe,
  userController.getUser
);
router.patch(
  '/updateMe',
  authController.restrictTo('user'),
  userController.updateMe
);
router.delete(
  '/deleteMe',
  authController.restrictTo('user'),
  userController.deleteMe
);

router.delete(
  '/delete-account',
  authController.restrictTo('user', 'admin'),
  userController.deleteAccount
);

router
  .route('/')
  .get(authController.restrictTo('admin'), userController.getAllUsers)
  .post(authController.restrictTo('admin'), userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

router.get(
  '/follow/:id',
  authController.restrictTo('user'),
  userController.following
);
router.get(
  '/unfollow/:id',
  authController.restrictTo('user'),
  userController.Unfollowing
);

module.exports = router;
