const express = require('express');
const engineeringController = require('../controllers/engineeringController');
const router = express.Router({ mergeParams: true });
const uploadFile = require('../middlewares/uploadFile');
router
  .route('/')
  .get(engineeringController.getFiles)
  .post(engineeringController.uploadFile, engineeringController.addFile);

module.exports = router;
