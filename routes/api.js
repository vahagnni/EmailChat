module.exports = function (router) {
    router.get('/chat-view', function (req, res) {
        res.render('chat');
    });

    router.get('/download', function (req, res) {
        var file = req.query.path;
        var name = req.query.filename;

        res.download(file, name);
    });

    router.get('/*', function (req, res) {
        res.render('index', {
            user: "ChatUser",
            env: process.env.NODE_ENV
        });
    });

};