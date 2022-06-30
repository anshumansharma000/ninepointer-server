const app = require('./app');
const dotenv = require('dotenv');
const { default: mongoose } = require('mongoose');

dotenv.config({ path: './config.env' });

const PORT = process.env.PORT || 8080;

const dbString = process.env.MONGO_URI.replace(
  '<password>',
  process.env.MONGO_PASSWORD
);

const server = app.listen(PORT, () => {
  mongoose
    .connect(dbString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log('Database Connected');
    });
  console.log(`Listening on ${PORT}`);
});
