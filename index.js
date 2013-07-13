// vim: expandtab:ts=4:sw=4:softtabstop=4:smarttab

var cmdUsers = "c:\\bin\\users.exe";

var spawn = require('child_process').spawn;

function findSessionId(user, cb) {
    var users = spawn(cmdUsers);
    var allData = '';
    users.stdout.on('data', function (data) {
        var data = data.toString();
        allData += data;
    });
    users.on('close', function () {
        var lines = allData.split('\r\n');
        var sessionId;
        var iterate = true;
        var userFound = false;
        lines.forEach(function (line) {
            if (!iterate) return;
            if (/Session ID/.test(line)) {
                var parts = line.split(' : ');
                sessionId = parts[1];
            }
            if (/Domain\\User/.test(line)) {
                var parts = line.split(' : ');
                var fullUser = parts[1].toLowerCase();
                var localUser = fullUser;
                if (fullUser.indexOf('\\') >= 0) {
                    localUser = fullUser.split('\\')[1];
                }
                if (user == localUser) {
                    cb(sessionId);
                    iterate = false;
                    userFound = true;
                    return;
                }
            }
        });
        if (!userFound) cb(null);
    });
}
