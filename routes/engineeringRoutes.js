const express = require('express');
const engineeringController = require('../controllers/engineeringController');
const router = express.Router({ mergeParams: true });
const fileRouter = require('./fileRouter');
const videoRouter = require('./videoRouter');
const userRouter = require('./userRoutes');

router
  .route('/')
  .get(engineeringController.getPosts)
  .post(engineeringController.createPost);

// router
//   .route('/:branch/:id')
//   .get()
//   .patch()
//   .delete(engineeringController.deletePost);

router.use('/pyq', fileRouter);
router.use('/video', videoRouter);
router.use('/user', userRouter);
module.exports = router;
