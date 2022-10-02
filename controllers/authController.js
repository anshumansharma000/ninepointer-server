const User = require('../models/User');
const CatchAsync = require('../middlewares/CatchAsync');
const { createCustomError } = require('../errors/customError');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.signUp = CatchAsync(async (req, res, next) => {
  const { username, email, password, passwordConfirm } = req.body;

  if (password !== passwordConfirm)
    return next(createCustomError("Passwords don't match", 401));
  const newUser = await User.create({
    username,
    email,
    password,
    passwordConfirm,
  });
  const token = signToken(newUser._id);
  res.status(200).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});

exports.logIn = CatchAsync(async (req, res, next) => {
  const { username, email, password } = req.body;
  if (!username && !email)
    return next(createCustomError('Username or email needed', 401));
  if (!password) return next(createCustomError('Password is needed', 401));

  const user = await User.findOne({
    $or: [{ email: email }, { username: username }],
  });

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(
      createCustomError('Incorrect email or username or password', 401)
    );
  }
  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token,
    data: user,
  });
});

exports.protect = CatchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return next(
      createCustomError(
        'You are not logged in. Please log in to continue.',
        401
      )
    );
  }

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const freshUser = await User.findById(decoded.id);

  if (!freshUser) return next(createCustomError('User no longer exists.', 401));
  //Implement changed password after request

  req.user = freshUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      next(createCustomError('Not Authorized', 403));
    }
    next();
  };
};
