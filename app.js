var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors');
var app = express();
app.use(cors({  
    origin:['http://localhost:8080'],
    methods:['GET','POST'],
}));

app.all('*',function (req, res, next) {
  res.header('Access-Control-Allow-Origin', 'http://localhost:8080');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
  next();
});

const publicRouter = require('./routes/public');
const authenticatedRouter = require('./routes/authenticated');

app.get('/game.html', (req, res)=>{
  res.sendFile(path.join(__dirname, './Build/index.html'));
})

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/api/public', publicRouter);
app.use('/api/authenticated', authenticatedRouter);
const history = require('connect-history-api-fallback');
app.use(express.static(path.join(__dirname, './dist')));
app.get('/', function(req, res, next){
    res.sendFile(__dirname+'/dist/index.html');
});
app.use(history());
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// // error handler
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};

//   // render the error page
//   res.status(err.status || 500);
//   res.render('error');
// });

module.exports = app;
