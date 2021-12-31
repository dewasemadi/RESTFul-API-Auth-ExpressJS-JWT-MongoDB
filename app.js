require('dotenv').config();
const path = require('path');
const logger = require('morgan');
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { CLIENT_BASE_URL } = process.env;
const { getStandardResponse } = require('./helpers/getStandardResponse');

// db_connection
const DB_Connection = require('./db/db_config');
DB_Connection();

// app configuration
const app = express();
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public'), { index: false }));

// cors settings: in front end set axios <withCredentials: true>
app.use(
  cors({
    origin: CLIENT_BASE_URL,
    credentials: true,
  })
);

// routes
const routes = require('./routes');
app.use(routes);
app.use((req, res, next) => {
  res.status(404).json(getStandardResponse(false, 'Invalid Request'));
  next();
});

module.exports = app;
