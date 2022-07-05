const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
const fileUpload = require('express-fileupload');

const errorHandler = require('./middlewares/errorHandler');

const engineeringRouter = require('./routes/engineeringRoutes');
const fileRouter = require('./routes/fileRouter');

app.use(cors());
app.use(fileUpload({ createParentPath: true }));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
  res.send('Hello from ninepointer!');
});

app.use('/api/v1/engineering/', engineeringRouter);
// app.use('/api/v1/engineering/pyq', fileRouter);

app.use(errorHandler);
module.exports = app;
