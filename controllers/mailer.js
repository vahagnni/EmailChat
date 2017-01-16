var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');

var create = function () {
    return nodemailer.createTransport(smtpTransport({
        service: 'gmail',
        auth: {
            user: "***",
            pass: "***"
        }
    }));
};

module.exports = {
    create: create
};
