const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

var validatePassword = function (password) {
  var regex = /^[a-zA-Z0-9!@#\$%\^\&*\)\(+=._-]{6,}$/g;
  return regex.test(password);
};

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  username: {
    type: String,
    unique: [true, 'Username already taken. Try another one.'],
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    unique: [true, 'This email already has an account.'],
    validate: [validator.isEmail, 'Please enter a valid email'],
  },
  phone: {
    type: String,
    validate: {
      validator: function (el) {
        var pattern = new RegExp('^[0-9]{10}$');
        return pattern.test(el);
      },
      message: 'Enter a valid phone number',
    },
  },
  password: {
    type: String,
    required: [true, 'Please enter your password'],
    minLength: 6,
    validate: [
      validatePassword,
      'Passsword must be at least 6 characters long and contain characters A-z, a-z, 0-9 and special characters',
    ],
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: "The passwords don't match",
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
  role: {
    type: String,
    enum: ['admin', 'employee', 'customer', 'manager'],
  },
  profilePhoto: {
    type: String,
  },
  dateCreated: {
    type: Date,
    default: Date.now(),
  },
  dob: {
    type: Date,
  },
});

UserSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

UserSchema.methods.changedPasswordAfter = function (jwtTimeStamp) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return jwtTimeStamp < changedTimeStamp;
  }
  return false;
};

UserSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
});

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);

  this.passwordConfirm = undefined;
  next();
});

const User = mongoose.model('User', UserSchema);
module.exports = User;
