require('./models/Cache');
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const http = require('http');
const fs = require('fs')
const bodyParser = require('body-parser');
const config = require('../../config/config.js').get(process.env.NODE_ENV);

// create a write stream (in append mode)
const accessLogStream = fs.createWriteStream(path.join(__dirname, '../log/access.log'), {flags: 'a'})
 
// setup the logger

const indexRouter = require('./routes/index');
const cacheRouter = require('./routes/cache');

const app = express();


app.use(express.json());
// app.use(logger('combined', {stream: accessLogStream}));
app.use(logger('dev'))
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/', indexRouter);
app.use('/cache', cacheRouter);

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

/**
 * Get port from environment and store in Express.
 */

const port = config.serverPORT;
app.set('port', port);

/**
 * Create HTTP server.
 */

var server = http.createServer(app);


/**
 * DB connection
 */
mongoose.connect(config.dbName, config.OPTIONS); 

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log("database connectivity is done to db " + config.dbName + "....");
    server.listen(port);
    server.on('error', onError);
    server.on('listening', onListening);

});

/*// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});*/

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    var bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.log(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.log(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
    var addr = server.address();
    var bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
    console.log('Listening on ' + bind);
}

module.exports = app;
