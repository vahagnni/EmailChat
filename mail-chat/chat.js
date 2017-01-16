var controller = require('./controller');
var socketIO = require('socket.io');

var io = null;

controller.listenForRoom(function (room) {
    io.emit('newroom', room);
});

controller.listenForMessage(function (message) {
    io.emit('new-message', message);
});

// mail listener
require('./mail-notifier');

function create(app) {
    if (!io) {
        io = socketIO(app);
    }

    io.on('connection', function (socket) {
        socket.on('rooms-get', function (userId) {
            controller.rooms(userId, function (err, rooms) {
                rooms = err ? [] : rooms;
                socket.emit('rooms', rooms);
            });
        });

        socket.on('room-changed', function (roomId) {
            controller.emails(roomId, function (err, emails) {
                var res = err ? null : emails;

                socket.emit('room-messages', emails);
            })
        });

        socket.on('room-read', function (roomId) {
            controller.setRead(roomId);
        });

        socket.on("message", function (msg) {
            controller.onSend(msg, function (err) {
                var res = err ? false : true;
                socket.emit('ok', res)
            });
        });
    });
}

module.exports = create;