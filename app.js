var createError  = require('http-errors');
var express      = require('express');
var path         = require('path');
var cookieParser = require('cookie-parser');
var logger       = require('morgan');
/* flash message */
let flash        = require('express-flash');
let session      = require('express-session');
let fileupload   = require('express-fileupload');

const indexRouter        = require('./routes/index');
const usersRouter        = require('./routes/users');
const adminRouter        = require('./routes/admin');
const categoryRouter     = require('./routes/category');
const bookRouter         = require('./routes/book');
const userRouter         = require('./routes/user');
const issueBookRouter    = require('./routes/issuebook');
const returnBookRouter   = require('./routes/return-book');
const settingsBookRouter = require('./routes/settings');
const loginRouter 　　　  = require('./routes/login');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');





/* MIDDLEWARE */
app.use(session({
  name: "my_session",
  secret:"my_secret",
  resave:false,
  saveUninitialized: true
}))

app.use(fileupload({
  createParentPath:true
}))

app.use(flash())
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));





// adding assets for admin routes
// /adminや/admin/:anyのルートの場合publicフォルダーをみるように指定するとlayoutが決まる
app.use('/admin',express.static(path.join(__dirname, 'public')));
app.use('/admin/:any',express.static(path.join(__dirname, 'public')));





/* Routes
  [3000/, ejs:index.js]
*/
app.use('/', indexRouter);


/* Routes
  [3000/users, ejs:users]
*/

app.use('/users', usersRouter);

/* Routes
  [3000/admin, ejs:admin/dashboard]
*/
app.use('/', adminRouter);


/* Routes
  [3000/admin/add-category, ejs:admin/add-category]
  [3000/admin/list-category, ejs:admin/list-category]
*/

app.use('/', categoryRouter);

/* Routes
  [3000/admin/add-book, ejs:admin/add-book]
  [3000/admin/list-book, ejs:admin/list-book]
*/
app.use('/', bookRouter)


/* Routes
  [3000/admin/add-user, ejs:admin/add-user]
  [3000/admin/list-user, ejs:admin/list-user]
*/
app.use('/', userRouter)

/* Routes
  [3000/admin/issue-book, ejs:admin/issue-a-book]
  [3000/admin/list-issue-book, ejs:admin/issue-history]
*/
app.use('/',issueBookRouter)


/* Routes
  [3000/admin/return-book, ejs:admin/return-a-book]
  [3000/admin/return-list-book, ejs:admin/return-list]
*/
app.use('/',returnBookRouter)

/* Routes
  [3000/admin/currency-setting, ejs:admin/currency-setting]
  [3000/admin/days-setting, ejs:admin/day-setting]
*/
app.use('/',settingsBookRouter)


/* Routes
  [3000/admin/login, ejs:admin/login]
*/
app.use('/', loginRouter)





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
  res.render('error');
});

module.exports = app;
