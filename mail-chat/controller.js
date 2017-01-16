var Room = require('./../models/room');
var Email = require('./../models/email');
var User = require('../models/user');
var UserController = require('../controllers/user');
var mailer = require('../controllers/mailer.js');
var site = require('../config/site.js');

function createOrGetRoom(email, cb, update) {
    if (update) {
        var callback = cb;

        cb = function (err, room, update) {
            if (err) {
                return callback(err);
            }

            room.modified = Date.now();
            room.save(function (err) {
                return callback(err, room, update);
            });
        }
    }

    UserController.userByEmail(email, function (err, user) {
        if (err) {
            return cb(err);
        }

        if (!user) {
            return cb({
                message: "User Not Found"
            });
        }

        Room.findOne({
            for: user.id
        }, function (err, room) {
            if (err) {
                return cb(err);
            }

            if (room) {
                return cb(null, room);
            }

            room = new Room();
            room.for = user.id;
            room.save(function (err) {
                if (err) {
                    return cb(err);
                }

                var notify = room.toObject();
                notify.for = user;
                notifyAboutNewRoom(notify);

                return cb(null, room, true);
            })
        })
    })
}

var RoomListeners = [];
var MessageListeners = [];

function notifyAboutNewRoom(room) {
    RoomListeners.forEach(s=>s(room));
}

function registerForRoom(cb) {
    RoomListeners.push(cb);
}

function notifyAboutNewMessage(message) {
    MessageListeners.forEach(s=>s(message));
}

function registerForMessage(cb) {
    MessageListeners.push(cb);
}

function mailReceived(mail) {
    var from = mail.from;
    createOrGetRoom(from, function (err, room) {
        if (err) {
            return console.log(err);
        }
        var m = new Email(mail);
        m.room = room.id;

        m.save(function (err) {
            if (err) {
                console.log(err);
            }

            notifyAboutNewMessage(m);

            room.unread = (room.unread || 0) + 1;

            room.save(function (err) {
                console.log(err);
            })
        })
    }, true);
}

function mailSend(mail, cb) {
    var to = mail.to;
    var from = mail.from;

    mail.from = site.email;
    mail.subject = 'Locdel Support';
    var m = mailer.create();
    m.sendMail(mail, function (err) {
        if (err) {
            return cb(err);
        }

        mail.from = from;
        mail.date = Date.now();
        createOrGetRoom(to, function (err, room) {
            if (err) {
                return cb(err);
            }
            var m = new Email(mail);
            m.room = room.id;

            m.save(function (err) {
                cb(err);
            })
        }, true);
    });

}

function getRooms(userId, cb) {
    var filter = {};

    if (userId) {
        filter.for = userId;
    }

    Room.find(filter).populate('for').exec(function (err, rooms) {
        // if user still not have room but our user create simple one
        if (!err && !rooms.length && userId) {
            // check is our user
            return User.findById(userId, function (e, user) {
                if (e || !user) {
                    return cb(err, rooms)
                }

                // create room
                var r = new Room();
                r.for = userId;
                r.save(function (ee, room) {
                    if (ee) {
                        return cb(err, rooms);
                    }

                    // recursive call
                    return getRooms(userId, cb);
                })
            });

        }

        cb(err, rooms);
    })
}

function getEmails(roomId, cb) {
    Email.find({
        room: roomId
    }, function (err, emails) {
        cb(err, emails);
    })
}

function setRead(roomId) {
    Room.update({_id: roomId}, {$set: {unread: 0}}, function (err) {
        if (err) {
            console.log(err);
        }
    });
}

module.exports = {
    room: createOrGetRoom,
    onMail: mailReceived,
    onSend: mailSend,
    listenForRoom: registerForRoom,
    listenForMessage: registerForMessage,
    rooms: getRooms,
    emails: getEmails,
    setRead: setRead
};