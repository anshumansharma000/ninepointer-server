const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  type: {
    type: String,
    required: [true, 'Video type is required'],
    enum: ['Topic Video', 'Solution Video', 'Engineering Life', 'Others'],
  },
  title: {
    type: String,
    required: [true, 'Video title is required'],
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
  creator: {
    type: String,
  },
});

videoSchema.pre('save', function (next) {
  //Only add thumbnail link once after a video is added.
  if (!this.isNew) {
    return next();
  }
  //add the thumbnail link
  console.log(this.videoLink);
  console.log(this.videoLink.split('/')[3][0] == 'w');
  const videoId = this.videoLink.split('/')[3].startsWith('watch')
    ? this.videoLink.split('/')[3].split('=')[1]
    : this.videoLink.split('/')[3][0];
  console.log('videoId'.videoId);
  this.thumbnail = `https://img.youtube.com/vi/${videoId}/0.jpg`;
  next();
});

const Video = mongoose.model('Video', videoSchema);
module.exports = Video;
