var fs = require('fs');
var envPath = './.env.js';
if (fs.existsSync(envPath)) {
    console.log("Adding environment variables");
    require(envPath);
}
var readLine = require ("readline");
if (process.platform === "win32"){
    var rl = readLine.createInterface ({
        input: process.stdin,
        output: process.stdout
    });

    rl.on ("SIGINT", function (){
        process.emit ("SIGINT");
    });

}

console.log("Creating tunnel");
var SauceTunnel = require('sauce-tunnel');
var tunnel = new SauceTunnel(process.env.SAUCE_USERNAME, process.env.SAUCE_ACCESS_KEY);

function done() {
    console.log("Closing tunnel");
    tunnel.stop(function () {
        console.log("Tunnel closed");
        process.exit();
    });
}

['SIGINT', 'SIGHUP', 'SIGQUIT', 'SIGABRT', 'SIGTERM'].forEach(function(signal) {
    process.on(signal, done);
});

console.log("Starting tunnel");
tunnel.start(function(status) {
    if (status) {
        console.log("Tunnel started successfully");
    } else {
        console.log("Failed to start tunnel successfully");
        process.exit(1);
    }
});
