var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var methodOverride = require('method-override')
const session = require('express-session')
var recordarmeMiddleware = require("./middlewares/recordarmeMiddleware")
var cors = require('cors');


var app = express();

app.use(express.static(path.join(__dirname, '../public/')));
app.use(express.static(path.resolve(__dirname, 'avatar')));
app.use(express.urlencoded({ extended: false }));
app.use(logger('dev'));
app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use(methodOverride('_method'));
app.use(session({secret:'keyboard cat',resave: true,
saveUninitialized: true}));
app.use(recordarmeMiddleware);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


var indexRouter = require('./routes/indexRouter');
var productRouter = require('./routes/productRouter');
var userRouter = require('./routes/userRouter');
var apiRouter = require('./routes/api/userRouter');
var apiProductRouter = require('./routes/api/productRouter');
var connectionRouter = require('./routes/api/connectionRouter');
var articleRouter = require('./routes/api/articleRouter')


const Sequelize =require("sequelize")


app.use('/', indexRouter);
app.use('/products', productRouter);
app.use('/users', userRouter);
app.use('/api/users', apiRouter);
app.use('/api/products', apiProductRouter);
app.use('/api/connection', connectionRouter);
app.use('/api/article', articleRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error',{user:req.session.user});
});

module.exports = app;
