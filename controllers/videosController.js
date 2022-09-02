const { createCustomError } = require('../errors/customError');
const CatchAsync = require('../middlewares/CatchAsync');
const Video = require('../models/Video');

exports.getVideos = CatchAsync(async (req, res, next) => {
  //duplicating req.query
  const queryObj = { ...req.query };
  const excludedFields = ['sort', 'limit', 'page', 'fields', 'search'];

  //excluding sort limit page and fields from query object
  excludedFields.forEach((el) => delete queryObj[el]);

  let queryStr = JSON.stringify(queryObj);
  queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

  let query = Video.find(JSON.parse(queryStr));

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

  if (req.query.search) {
    query.find({
      $or: [
        { title: { $regex: '.*' + req.query.search + '.*', $options: 'i' } },
        {
          subject: { $regex: '.*' + req.query.search + '.*', $options: 'i' },
        },
      ],
    });
    // query.find({
    //   subject: { $regex: '.*' + req.query.search + '.*', $options: 'i' },
    // });
  }
  const limit = req.query.limit * 1 || 20;
  const page = req.query.page * 1 || 1;
  const skip = (page - 1) * limit;

  query = query.skip(skip).limit(limit);

  if (req.query.page) {
    const numVideos = await Video.countDocuments();
    if (skip >= numVideos) throw new Error("This page doesn't exist");
  }

  const videos = await query;

  res.status(200).json({
    status: 'success',
    results: videos.length,
    data: videos,
  });
});

exports.addVideo = CatchAsync(async (req, res, next) => {
  const {
    type,
    title,
    description,
    branch,
    semester,
    subject,
    videoLink,
    createdAt,
    lastEdited,
    creator,
  } = req.body;

  const newVideo = {
    type,
    title,
    description,
    branch,
    semester,
    subject,
    videoLink,
    createdAt,
    lastEdited,
    creator,
  };

  const data = await Video.create(newVideo);

  res.status(201).json({
    status: 'success',
    data,
  });
});

exports.deleteVideo = CatchAsync(async (req, res, next) => {
  const { id } = req.params;

  if (!(await Engineering.findById(id))) {
    return next(createCustomError('Video not found', 404));
  }
  await Video.findByIdAndDelete(id);

  res.status(200).json({
    status: 'success',
    message: 'Deleted',
  });
});

exports.updateVideo = CatchAsync(async (req, res, next) => {
  const video = await Video.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!video) next(createCustomError('No video found with this id', 404));

  res.status(204).json({
    status: 'Success',
    data: video,
  });
});
