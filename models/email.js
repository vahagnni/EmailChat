var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var EmailSchema = new Schema({
    room: {
        type: 'ObjectId',
        ref: 'Room'
    },
    from: {
        type: 'String'
    },
    to: {
        type: 'String'
    },
    date: {
        type: 'Date'
    },
    received: {
        type: 'Date'
    },
    text: {
        type: 'String'
    },
    html: {
        type: 'String'
    },
    subject: {
        type: 'String'
    },
    attachments: [
        {
            path: {
                type: 'String'
            },
            filename: {
                type: 'String'
            },
            size: {
                type: 'Number'
            },
            contentType: {
                type: 'String'
            }
        }
    ]
});

var Email = mongoose.model('Email', EmailSchema);

module.exports = Email;
