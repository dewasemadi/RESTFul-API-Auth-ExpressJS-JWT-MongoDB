require('dotenv').config();
const path = require('path');
const logger = require('morgan');
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { CLIENT_BASE_URL } = process.env;

// db_connection
const DB_Connection = require('./db/db_config');
DB_Connection();

// routes
const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');

// app configuration
const app = express();
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// cors settings: in front end set axios <withCredentials: true>
app.use(
  cors({
    origin: CLIENT_BASE_URL,
    credentials: true,
  })
);

// endpoints
app.use('/', indexRouter);
app.use('/auth', authRouter);

module.exports = app;
