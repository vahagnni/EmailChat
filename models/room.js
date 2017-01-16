var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var RoomSchema = new Schema({
    for: {
        type: 'ObjectId',
        ref: 'User'
    },
    created: {
        type: 'Date'
    },
    modified: {
        type: 'Date'
    },
    unread: {
        type: 'Number',
        default: 0
    }
});

RoomSchema.pre('save', function (next) {
    var now = new Date();
    if (!this.created) {
        this.created = now;
    }
    next();
});

var Room = mongoose.model('Room', RoomSchema);

module.exports = Room;
