var ll = angular.module('app', ['ui.bootstrap']);

ll.directive('chat', ['user', '$timeout', '$sce', function (user, $timeout, $sce) {
    function link($scope) {
        var socket = io();

        $scope.room = {
            admin: {
                number: "1324"
            }
        };

        $scope.changeRoom = function (room) {
            $scope.room = room;
            $scope.fetching = true;
            socket.emit('room-changed', room._id);
        };

        $scope.rooms = [];

        $scope.roomDate = (room) => {
            return new Date(room.modified || room.created);
        };

        socket.on('connect', function () {
            socket.emit('rooms-get', $scope.single ? $scope.user : null);
        });

        socket.on('rooms', function (rooms) {
            $scope.rooms = rooms;
            if ($scope.single && $scope.rooms.length) {
                $scope.changeRoom(rooms[0]);
            }
            $scope.$apply();
        });

        socket.on('ok', function (ok) {
            $scope.messages.push($scope.pending);
            $scope.pending = {};
            $scope.sending = false;
            $scope.$apply();
        });

        socket.on('room-messages', function (messages) {
            $scope.messages = messages;
            $timeout(function () {
                $scope.fetching = false;
            }, 200);
            $scope.room.unread = 0;
            $scope.$apply();
            socket.emit('room-read', $scope.room._id);
        });

        socket.on('newroom', function (room) {
            $scope.rooms.push(room);
        });

        socket.on('new-message', function (message) {
            var roomId = message.room;

            if ($scope.room._id == roomId) {
                message.new = true;
                $scope.messages.push(message);

                socket.emit('room-read', $scope.room._id);
            } else {
                var room = $scope.rooms.find(function (r) {
                    return roomId === r._id;
                });

                room.unread = room.unread || 0;
                room.unread++;
            }

            room.modified = message.date;

            $scope.$apply();
        });

        $scope.html = function (text) {
            return $sce.trustAsHtml(text);
        };

        $scope.self = function (message) {
            if(!$scope.room.for){
                return;
            }

            return message.from !== $scope.room.for.email;
        };

        $scope.downloadPath = function (filename, path) {
            return 'download?path=' + encodeURIComponent(path) + '&filename=' + encodeURIComponent(filename);
        };

        $scope.pending = {};
        $scope.admin = {
            number: user.adminNumber || "Undefined",
            email: user.email
        };

        $scope.$on('uploaded', function (event, attachment) {
            event.stopPropagation();

            $scope.pending.attachments = $scope.pending.attachments || [];
            $scope.pending.attachments.push(attachment);
        });

        $scope.send = function () {
            $scope.pending.to = $scope.room.for.email;
            $scope.pending.from = $scope.admin.number;
            $scope.sending = true;

            socket.emit('message', $scope.pending);
        }
    }

    return {
        restrict: 'E',
        scope: {
            user: '=',
            single: '='
        },
        templateUrl: 'chat/chat.html',
        link: link
    }
}]).filter('room', function () {
    return function filter(room, type) {
        return room.filter(r=>r.for.type==type);
    }
});