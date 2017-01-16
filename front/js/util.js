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