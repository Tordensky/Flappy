// Since postinstall will also run when you run npm install
// localy we make sure it only runs in production

if (process.env.NODE_ENV === 'production') {
    // we basically just create a child process that will run the
    // production bundle command
    var child_process = require('child_process');
    child_process.exec("webpack -p --config webpack.production.config.js", function(error, stdout, stderr) {
        console.log('stdout: ', stdout);
        console.log('stderr: ', stderr);
        if ( error !== null ) {
            console.log('exec error ' + error);
        }
    });
}