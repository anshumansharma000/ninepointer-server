const User = require('../models/User');
const CatchAsync = require('../middlewares/CatchAsync');
const { createCustomError } = require('../errors/customError');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getUsers = CatchAsync(async (req, res, next) => {
  //duplicating req.query
  const queryObj = { ...req.query };
  const excludedFields = ['sort', 'limit', 'page', 'fields', 'search'];

  //excluding sort limit page and fields from query object
  excludedFields.forEach((el) => delete queryObj[el]);

  let queryStr = JSON.stringify(queryObj);
  queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

  let query = User.find(JSON.parse(queryStr));

  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }

  if (req.query.fields) {
    const fields = req.query.fields.split(',').join(' ');
    query = query.select(fields);
  } else {
    query = query.select('-__v -password');
  }

  if (req.query.search) {
    query.find({
      $or: [
        { username: { $regex: '.*' + req.query.search + '.*', $options: 'i' } },
        {
          name: { $regex: '.*' + req.query.search + '.*', $options: 'i' },
        },
      ],
    });
    // query.find({
    //   subject: { $regex: '.*' + req.query.search + '.*', $options: 'i' },
    // });
  }
  let queryAlt = query.model.find().merge(query).skip(0).limit(0);
  // console.log(queryAlt);
  // let docs = await queryAlt;
  // let numDocs = docs.length;

  const limit = req.query.limit * 1 || 10;
  const page = req.query.page * 1 || 1;
  const skip = (page - 1) * limit;

  query = query.skip(skip).limit(limit);
  if (req.query.page) {
    const numUsers = await User.countDocuments();
    if (skip >= numVideos) throw new Error("This page doesn't exist");
  }

  const [users, count] = await Promise.all([query, queryAlt.count()]);

  res.status(200).json({
    status: 'success',
    results: users.length,
    data: users,
    count,
  });
});

exports.getUser = CatchAsync(async (req, res, next) => {
  const { id } = req.params;

  if (!id) return next(createCustomError('Please specify the id', 401));
  const data = await User.findById(id);

  if (!data) {
    return next(createCustomError('No user found with the given Id', 404));
  }

  res.json({
    status: 'success',
    data,
  });
});

exports.addUser = CatchAsync(async (req, res, next) => {
  const filteredBody = filterObj(
    req.body,
    'username',
    'email',
    'password',
    'name',
    'profilePhoto',
    'passwordConfirm',
    'phone',
    'role'
  );

  if (
    !filteredBody.username ||
    !filteredBody.password ||
    !filteredBody.email ||
    filteredBody.passwordConfirm
  ) {
    return next(
      createCustomError(
        'Incomplete user data for a new user. Please check again.',
        400
      )
    );
  }

  const user = await User.create(filteredBody);
  res.status(201).json({ status: 'success' });
});

exports.updateUser = CatchAsync(async (req, res, next) => {
  //Update user data
  const filteredBody = filterObj(
    req.body,
    'username',
    'email',
    'password',
    'name',
    'profilePhoto',
    'passwordConfirm',
    'phone',
    'role'
  );
  const updatedUser = await User.findByIdAndUpdate(
    req.params.id,
    filteredBody,
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    status: 'Success',
    message: 'User Data updated.',
    updatedUser,
  });
});

exports.updateMe = CatchAsync(async (req, res, next) => {
  //Create error if user tries to update password
  if (req.body.password || req.body.passwordConfirm)
    return next(
      createCustomError(
        "This route doesn't support password change. Try the dedicated route.",
        400
      )
    );
  //Update user data
  const filteredBody = filterObj(req.body, 'name', 'email');
  const updatedUser = await User.findByIdAndUpdate(req.user._id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'Success',
    message: 'User Data updated.',
    updatedUser,
  });
});

exports.deleteMe = CatchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, { active: false });

  res.status(200).json({
    status: 'Success',
    message: 'User Deleted Successfully',
  });
});
exports.deleteUser = CatchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.params.id, { active: false });

  res.status(200).json({
    status: 'Success',
    message: 'User Deleted Successfully',
  });
});
