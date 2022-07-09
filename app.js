const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');

const errorHandler = require('./middlewares/errorHandler');

const engineeringRouter = require('./routes/engineeringRoutes');
const fileRouter = require('./routes/fileRouter');
app.use(helmet());
app.use(cors());

const limiter = rateLimit({
  max: 500,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP. Please try again later!',
});
app.use('/api', limiter);
app.use(fileUpload({ createParentPath: true }));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(mongoSanitize());
app.use(xss());
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
  res.send('Hello from ninepointer!');
});

app.use('/api/v1/engineering/', engineeringRouter);
// app.use('/api/v1/engineering/pyq', fileRouter);

app.use(errorHandler);
module.exports = app;
