const mongoose = require('mongoose');

const VideoSchema = new mongoose.Schema({
  type: {
    type: String,
    required: [true, 'Video type is required'],
    enum: ['Topic Video', 'Solution Video', 'Engineering Life', 'Others'],
  },
  title: {
    type: String,
    required: [true, 'Videoa title is required'],
  },

  description: {
    type: String,
  },
  branch: {
    type: [String],
    // required: [true, 'Branch is required'],
  },
  semester: {
    type: String,
    enum: ['1', '2', '3', '4', '5', '6', '7', '8'],
    // required: [true, 'Semester is required'],
  },
  subject: {
    type: String,
  },
  videoLink: {
    type: String,
    required: [true, 'Video Link is required'],
  },
  thumbnail: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  lastEdited: {
    type: Date,
  },
  author: {
    type: String,
  },
});

const Engineering = mongoose.model('Video', VideoSchema);
module.exports = Video;
