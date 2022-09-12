const express = require('express');
const engineeringController = require('../controllers/engineeringController');
const router = express.Router({ mergeParams: true });
const uploadFile = require('../middlewares/uploadFile');
router
  .route('/')
  .get(engineeringController.getFiles)
  .post(engineeringController.addFile);

router
  .route('/:id')
  .get(engineeringController.getFile)
  .patch(engineeringController.updateFile)
  .delete(engineeringController.deleteFile);
module.exports = router;
