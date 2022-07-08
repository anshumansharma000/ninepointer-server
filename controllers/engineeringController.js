const { createCustomError } = require('../errors/customError');
const CatchAsync = require('../middlewares/CatchAsync');
const Engineering = require('../models/Engineering');
const Pyq = require('../models/pyq');
const path = require('path');

//create a new video
exports.createPost = CatchAsync(async (req, res, next) => {
  const {
    branch,
    semester,
    title,
    description,
    subject,
    contentType,
    contentLink,
    author,
  } = req.body;

  const post = {
    branch,
    semester,
    title,
    description,
    subject,
    contentType,
    contentLink,
    author,
  };

  const newPost = await Engineering.create(post);

  res.status(201).json({
    status: 'success',
    data: newPost,
  });
});

//delete a video
exports.deletePost = CatchAsync(async (req, res, next) => {
  const { branch, id } = req.params;

  if (!(await Engineering.findById(id))) {
    return next(createCustomError('Resource not found', 404));
  }
  await Engineering.findByIdAndDelete(id);

  res.status(200).json({
    status: 'success',
    message: 'Deleted',
  });
});

//get videos
exports.getPosts = CatchAsync(async (req, res, next) => {
  //duplicating req.query
  const queryObj = { ...req.query };
  const excludedFields = ['sort', 'limit', 'page', 'fields'];

  //excluding sort limit page and fields from query object
  excludedFields.forEach((el) => delete queryObj[el]);

  let queryStr = JSON.stringify(queryObj);
  queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

  let query = Engineering.find(JSON.parse(queryStr));

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
    query = query.select('-__v');
  }

  const limit = req.query.limit * 1 || 5;
  const page = req.query.page * 1 || 1;
  const skip = (page - 1) * limit;

  query = query.skip(skip).limit(limit);

  if (req.query.page) {
    const numPosts = await Engineering.countDocuments();
    if (skip >= numPosts) throw new Error("This page doesn't exist");
  }

  const posts = await query;

  res.status(200).json({
    status: 'success',
    results: posts.length,
    data: posts,
  });
});

//add a new pyq
exports.addFile = CatchAsync(async (req, res, next) => {
  const {
    branch,
    semester,
    university,
    subject,
    fileLink,
    author,
    year,
    type,
  } = req.body;
  //TODO:generate file link and add it in pyq object
  const pyq = {
    branch,
    semester,
    university,
    subject,
    fileLink,
    author,
    year,
    type,
  };

  console.log(pyq);

  const newPyq = await Pyq.create(pyq);

  res.status(201).json({
    status: 'success',
    data: newPyq,
  });
});

//get pyqs
exports.getFiles = CatchAsync(async (req, res, next) => {
  //duplicating req.query
  const queryObj = { ...req.query };
  const excludedFields = [
    'sort',
    'limit',
    'page',
    'fields',
    'subject',
    'branch',
  ];

  //excluding sort limit page and fields from query object
  excludedFields.forEach((el) => delete queryObj[el]);

  let queryStr = JSON.stringify(queryObj);
  queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
  let query = Pyq.find(JSON.parse(queryStr));

  if (req.query.branch)
    query.find({ $or: [{ branch: req.query.branch }, { branch: 'Common' }] });

  if (req.query.subject) {
    query.find({
      subject: { $regex: '.*' + req.query.subject + '.*', $options: 'i' },
    });
  }
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
    query = query.select('-__v');
  }

  const limit = req.query.limit * 1 || 10;
  const page = req.query.page * 1 || 1;
  const skip = (page - 1) * limit;

  query = query.skip(skip).limit(limit);

  if (req.query.page) {
    const numPyqs = await Pyq.countDocuments();
    if (skip >= numPyqs) throw new Error("This page doesn't exist");
  }

  const pyqs = await query;

  res.status(200).json({
    status: 'success',
    results: pyqs.length,
    data: pyqs,
  });
});

//upload file to server
exports.uploadFile = CatchAsync((req, res, next) => {
  console.log(req.body);
  console.log(req.files);
  //check for file
  if (!req.files) {
    //check for external file url
    if (req.body.url) {
      req.body.fileLink = req.body.url;
      next();
    } else {
      //if no file or url
      return next(createCustomError('File not found', 404));
    }
  } else {
    const file = req.files.file;
    console.log(file.mimetype);
    console.log(file);
    //check for pdf files
    if (file.mimetype != 'application/pdf') {
      return next(
        createCustomError(
          'File Type not supported. Please upload a pdf file. ',
          400
        )
      );
    }
    //create a file path for server file system
    const newFileName =
      req.body.branch +
      '-' +
      req.body.subject +
      '-' +
      req.body.year +
      Date.now() +
      '.pdf';
    uploadPath = __dirname + '/../public/pyqs/' + newFileName;
    //moving file to server file system
    file.mv(uploadPath, function (err) {
      if (err) console.log(err);
      console.log('File uploaded!');
    });

    console.log(req.hostname);
    devUrl = 'http://localhost:8000';
    stagingUrl = 'https://ninepointer-staging.herokuapp.com';
    const filePath = path.join(stagingUrl, `/pyqs/${newFileName}`);
    req.body.fileLink = filePath;
    console.log(filePath);
    next();
  }
});
