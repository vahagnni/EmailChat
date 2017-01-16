var multer = require('multer'),
    uuid = require('uuid'),
    fs = require('fs'),
    path = require('path'),
    imagesDest = path.resolve(__dirname, '../data/images'),
    attachmentDest = path.resolve(__dirname, '../data/attachment');


//create directory if doesn't exists
if (!fs.existsSync(imagesDest)) {
    fs.mkdirSync(imagesDest);
}

var attachment = multer({
    dest: attachmentDest
});

function init(app) {
    app.post(['/api/upload'], attachment.single('file'), function (req, res) {
        var newName = uuid.v4().replace(/-/g, ''),
            file = req.file;

        if (!file) {
            return res.send({
                "status": "error",
                "message": "File not found"
            });
        }

        var filePath = file.path,
            newFullName = newName + path.extname(file.originalname);

        fs.rename(filePath, file.destination + '/' + newFullName, function (err) {
            var name = err ? file.filename : newFullName;
            return res.send({
                'status': 'OK',
                'url': attachmentDest + '/' + name
            })
        });
    });
}

module.exports = init;