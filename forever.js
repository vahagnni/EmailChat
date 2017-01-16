var forever = require('forever-monitor');
var os = require('os');
var path =  os.homedir();
var mail = require('./controllers/mailer');
var site = require('./config/site');

function sendMail(text) {
    var mailer = mail.create();

    var mailOptions = {
        to: site.engineeringSupport.join(','),
        from: site.email,
        subject: 'Locdel backend error',
        text: text,
        html: text.replace(/\r\n/g, '<br/>').replace(/\n/g, '<br/>'),
    };
    mailer.sendMail(mailOptions, function (err) {
    });
}

var child = new (forever.Monitor)(path + '/app/app.js', {
    max: 3,
    logFile: path + '/shared/forever.log',
    outFile: path + '/shared/forever-out.log',
    errFile: path + '/shared/forever-err.log'
});

child.on('stderr', function (err) {
    sendMail(JSON.stringify(String(err)));
});

child.on('exit', function () {
    sendMail('Emailchat backend down. Look previous messages to understand reason');
    console.log('app.js has exited after 3 restarts');
});

child.start();