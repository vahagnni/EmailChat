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