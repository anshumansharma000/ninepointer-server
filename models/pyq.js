const mongoose = require('mongoose');

const pyqSchema = new mongoose.Schema({
  branch: {
    type: [String],
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
  year: {
    type: String,
    required: [true, 'Year is required'],
  },
  semester: {
    type: String,
    enum: ['1', '2', '3', '4', '5', '6', '7', '8'],
    required: [true, 'Semester is required'],
  },
  university: {
    type: String,
    required: [true, 'University is required'],
  },
  type: {
    type: String,
    enum: ['Regular', 'Back', 'Others', 'Both'],
  },
  subject: {
    type: String,
  },
  fileLink: {
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
  solutionLink: {
    type: String,
  },
});

const pyq = mongoose.model('pyq', pyqSchema);
module.exports = pyq;
