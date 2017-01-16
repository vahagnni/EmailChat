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
ll.directive('fileSelect', [
    function () {
        function postLink(scope, element, attrs) {
            element.css({
                position: 'absolute',
                visibility: 'hidden'
            });

            element.on('change', function (event) {
                var fileList = event.target.files,
                    files = [];
                for (var i = 0; i < fileList.length; i++) {
                    files.push(fileList.item(i));
                }

                if (files.length > 0) {
                    scope.$emit('upload', files, scope.$eval(attrs.fileSelect));
                }

                element.val('');
            });

            // forward clicks from neighboring button to this element
            element.next('button').on('click', function (event) {
                event.stopPropagation();

                element[0].click();
            });

            element.on('click', function (event) {
                event.stopPropagation();
            });
        }

        return {
            link: postLink
        };
    }
]);

ll.service('fileUpload', ['$http', function ($http) {
    this.upload = function (file, cb) {
        var fd = new FormData();
        fd.append('file', file);

        var url = '/api/upload';

        $http.post(url, fd, {
            transformRequest: angular.identity,
            headers: {'Content-Type': undefined}
        }).success(function (data) {
            if (data.status === 'OK') {
                return cb(null, data);
            }

            cb(data);
        }).error(function () {
            cb(true)
        });
    }
}]);

ll.directive('uploader', ['fileUpload', function (fileUpload) {
    function link(scope) {
        scope.$on('upload', function (event, files) {
            var file = files[0];
            scope.loading = true;

            fileUpload.upload(file, function (err, data) {
                scope.loading = false;
                if (!err) {
                    var attachment = {
                        path: data.url,
                        filename: file.name,
                        contentType: file.type,
                        size: file.size
                    };

                    scope.$emit('uploaded', attachment);
                }
            });
        })
    }

    return {
        restrict: 'E',
        scope: {
            text: '@'
        },
        link: link,
        template: '<div class="uploader">' +
        '<input type="file" file-select>' +
        '<loading-button content="{{text || \'Attach\'}}" loading="loading" type="primary"></loading-button>'
    }
}]);
ll.constant('dateFormat', function (date) {
    var m = moment(date);
    var month = moment.months()[m.month()];
    var day = m.date();
    var timestamp = m.format("H:mm:ss");

    var TODAY = moment().startOf('day');
    var isToday = m.isSame(TODAY, 'd');

    if (isToday) {
        return timestamp;
    }

    return day + ' of ' + month;
}).filter('dateFormat', ['dateFormat', function (dateFormat) {
    return function (date) {
        return dateFormat(date);
    }
}]);