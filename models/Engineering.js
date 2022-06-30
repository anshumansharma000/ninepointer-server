const mongoose = require('mongoose');

const EngineeringSchema = new mongoose.Schema({
  branch: {
    type: String,
    enum: [
      'Computer Science',
      'Electronics',
      'Electrical',
      'Chemical',
      'Civil',
      'Mechanical',
      'Common',
    ],
    required: [true, 'Branch is required'],
  },
  semester: {
    type: String,
    enum: ['1', '2', '3', '4', '5', '6', '7', '8'],
    required: [true, 'Semester is required'],
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
  },
  description: {
    type: String,
  },
  subject: {
    type: String,
  },
  contentType: {
    type: String,
    enum: ['solved paper', 'youtube video'],
    required: [true, 'Please specify the content type'],
  },
  contentLink: {
    type: String,
    // required: [true, 'Content Link is required'],
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

const Engineering = mongoose.model('EngineeringMaterial', EngineeringSchema);
module.exports = Engineering;
