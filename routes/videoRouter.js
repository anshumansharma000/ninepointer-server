const express = require('express');
const router = express.Router({ mergeParams: true });
const videosController = require('../controllers/videosController');

router
  .route('/')
  .get(videosController.getVideos)
  .post(videosController.addVideo);

router
  .route('/:id')
  .get(videosController.getVideo)
  .patch(videosController.updateVideo)
  .delete(videosController.deleteVideo);

module.exports = router;
