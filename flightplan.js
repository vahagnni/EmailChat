/**
 * Created by vahagn on 10/13/16.
 */
// flightplan.js
var plan = require('flightplan');
var configs = require('./config/config');
var host = configs.hosts[0];
var os = require('os');
var home = os.homedir();

plan.target('production', [
    {
        host: host.host,
        username: host.username,
        password: host.password,
        agent: process.env.SSH_AUTH_SOCK
    }
]);

var tmpDir = 'tmp-' + new Date().getTime();

// run commands on localhost
plan.local(['deploy'], function (local) {
    local.log('Run build');

    local.log('Copy files to remote hosts');
    var filesToCopy = local.exec('git ls-files', {silent: true});
    // rsync files to all the target's remote hosts
    local.transfer(filesToCopy, '~/' + tmpDir);
});

// run commands on the target's remote hosts
plan.remote(['deploy'], function (remote) {
    remote.log('Move Previous revision');
    remote.sudo('rm -rf ~/app-previous', {user: 'locdel'});
    remote.exec('mv ~/app ~/app-previous');
    remote.log('Move folder to Locdel root');
    remote.sudo('cp -R ~/' + tmpDir + ' ~/app', {user: 'locdel'});
    remote.sudo('mkdir -p shared/pids', {user: 'locdel'});
    remote.sudo('mkdir -p shared/log', {user: 'locdel'});
    remote.rm('-rf ~/' + tmpDir);

    remote.log('Install dependencies');
    remote.with('cd ~/app', function () {
        remote.exec('npm install');
        remote.log('Run grunt');
        remote.exec('grunt', {user: 'locdel'});
    });

    remote.log('Reload application');
    remote.sudo('[ -e ~/shared/pids/node.pid ] && sudo restart node || sudo start node', {user: 'locdel'});
    remote.rm('-rf ~/app-previous');
    remote.log('Application deployed successfully');
});

plan.local(['config'], function (local) {
    local.log("Run config");
    local.log('Copy files to remote hosts');
    // rsync files to all the target's remote hosts
    local.with(`cd ${home}/locdel-config`, function () {
        var files = local.find(`.`);
        local.transfer(files, '~/' + tmpDir);
    })
});

plan.remote(['config'], function (remote) {
    remote.log('Move Previous revision');
    remote.sudo('rm -rf ~/locdel-config-previous', {user: 'locdel'});
    remote.sudo('mkdir -p ~/locdel-config', {user: 'locdel'});
    remote.exec('mv ~/locdel-config ~/locdel-config-previous');
    remote.log('Move folder to opt');
    remote.sudo('cp -R  ~/' + tmpDir + ' ~/locdel-config', {user: 'locdel'});
    remote.rm('-rf ~/' + tmpDir);
    remote.log('Config deployed successfully');
});

plan.remote(['restart'], function (remote) {
    remote.log('Restart application');
    remote.sudo('[ -e ~/shared/pids/node.pid ] && sudo restart node || sudo start node', {user: 'locdel'});
    remote.log('Application restarted successfully');
});