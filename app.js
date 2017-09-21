const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const expressSession = require('express-session');
// const userVersion = require('./server/helpers/user-version');
const app = express();

const NotFoundError = require('./server/errors/api').NotFoundError;

// db
require('./server/db');

// view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
// app.set('user-version', userVersion);

// base
//app.use(favicon(__dirname + '/dist/favicon.ico'));
app.use(logger('dev'));

app.use(expressValidator({
  customValidators: {
    isEqual: (value1, value2) => {
      return value1 === value2;
    }
  }
}));
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());
app.use(cookieParser());

// static file
app.use(express.static(path.join(__dirname, 'dist')));

// session
app.use(expressSession({
  secret: 'lsj8wu35oiQAF-CUMAV9PGFY8W9-GR-SODHGFJ03W85U4T0Q249U25PQKgas',
  resave: false,
  saveUninitialized: false
}));

// authentication
require('./server/auth')(app);

// routes
require('./server/routes')(app);

// errors
app.use(function(req, res, next) {
  next(new NotFoundError());
});

app.use(function(err, req, res, next) {
  //  if (req.url.match(/^\/api\//)) {
  var obj = {
    status: 'error',
    type: err.name,
    message: err.message,
    stack: err.stack
  };
  if(err.name === 'FieldsValidationError') obj.fields = err.fields;
  res.status(err.status || 500).json(obj);
  /*  } else {
      res.render('error', {
        message: err.message,
        error: err
      });
    }*/
});

// Catch all other routes and return the index file
/*
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});
*/

module.exports = app;
