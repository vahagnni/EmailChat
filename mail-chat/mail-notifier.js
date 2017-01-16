var notifier = require('mail-notifier');
var controller = require('./controller');
var fs = require('fs');
var uuid = require('uuid');
var path = require('path');
var attachmentsDirectory = path.resolve(__dirname, '../data/attachments');;
var util = require('util');

//create directory if doesn't exists
if (!fs.existsSync(attachmentsDirectory)) {
    fs.mkdirSync(attachmentsDirectory);
}


var imap = {
    user: 'support@locdel.com',
    password: 'locdel@admin',
    host: "imap.gmail.com",
    port: 993, // imap port
    tls: true,// use secure connection
    tlsOptions: {rejectUnauthorized: false}
};

var n = notifier(imap);

var saveAttachment = function (attachment, cb) {
    var buffer = new Buffer(attachment.content);
    var filePath = attachmentsDirectory + uuid.v4() + attachment.fileName;
    fs.writeFile(filePath, buffer, function (err) {
        if (err) {
            return cb(err);
        }

        cb(null, {
            path: filePath,
            filename: attachment.fileName,
            size: attachment.length,
            contentType: attachment.contentType
        })
    });
};

var processAttachments = function (attachemnts, cb) {
    if (!attachemnts || !attachemnts.length) {
        return cb([]);
    }

    var results = [];
    var l = attachemnts.length;
    var errors = null;

    for (var i = 0; i < attachemnts.length; i++) {
        saveAttachment(attachemnts[i], function (err, attachment) {
            l--;
            results.push(attachment);

            if (err) {
                errors = errors || [];
                errors.push(err);
            }
            if (l === 0) {
                return cb(errors, results);
            }
        })
    }
};


// RUn this forever
n.on('end', function () {
    n.start();
}).on('mail', function (mail) {
    processAttachments(mail.attachments, function (err, attachments) {
        if (err) {
            console.log(err)
        }

        var chatMail = {
            from: mail.from[0].address,
            to: mail.to[0].address,
            date: mail.date,
            received: mail.receivedDate,
            text: mail.text,
            html: mail.html,
            subject: mail.subject,
            attachments: attachments
        };

        controller.onMail(chatMail);
    })
}).on('error', function (err) {
    util.log("Error from imap: ");
    util.log(err);
    util.log("----------------------------------------");
}).start();