// Load the http module to create an http server.
var http = require('http'),
    express = require('express'),
    mongoose = require('mongoose'),
    bodyParser = require('body-parser'),
    flash = require('connect-flash'),
    errorhandler = require('errorhandler'),
    expressSession = require('express-session'),
    util = require('util');

var app = express();

// env
MongoStore = require('connect-mongo')(expressSession);
app.use(expressSession({
    secret: 'LucyInTheSkyWithDiamonds',
    resave: true,
    saveUninitialized: true,
    cookie: {maxAge: 2628000000},
    store: new MongoStore({mongooseConnection: mongoose.connection})
}));

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(flash());
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/site'));
app.use(express.static(__dirname + '/public'));
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(errorhandler({dumpExceptions: true, showStack: true}));

//init routes
var routers = require('./routes/index.js');

app.use(routers);

mongoose.connect('mongodb://localhost/emailchat', {},
    function (a) {
        if (a) {
            util.log("Cannot connect to DB");
        }
        else {
            util.log("Connected to DB");
        }
    });

var server = app.listen(8000, function () {
    util.log('Start working.....');
    // if run as root, downgrade to the owner of this file
    if (process.getuid() === 0)
        require('fs').stat(__filename, function (err, stats) {
            if (err) return console.log(err);
            process.setuid(stats.uid);
        });
});

// mail server
require('./mail-chat/chat')(server);
