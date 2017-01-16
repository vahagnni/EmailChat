var express = require('express');
var apiRouter = express.Router();

require('./upload.js')(apiRouter);
require('./api.js')(apiRouter);

module.exports = apiRouter;