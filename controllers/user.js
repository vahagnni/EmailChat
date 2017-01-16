var User = require('../models/user.js'),
    validator = require('validator');


function getUserByEmail(email, cb) {
    User.findOne({
        email: validator.normalizeEmail(email)
    }, function (err, user) {
        if (err || !user) {
            return callback({
                message: "Error..."
            });
        }

        cb(null, user);
    });
}

module.exports = {
    userByEmail: getUserByEmail,
};