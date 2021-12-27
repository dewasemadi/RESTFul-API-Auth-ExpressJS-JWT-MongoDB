const mongoose = require('mongoose');
const { MONGO_URI } = process.env;

const DB_Connection = async () => {
  const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  };

  return await mongoose
    .connect(MONGO_URI, options)
    .then(() => console.log('Connected to MongoDB'))
    .catch((error) => {
      console.log(error);
    });
};

module.exports = DB_Connection;
