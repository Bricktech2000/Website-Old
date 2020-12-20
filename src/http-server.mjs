import http from 'http';
import path from 'path';
import fs from 'fs';
import express from 'express';
var app = express();

//https://stackoverflow.com/questions/8817423/node-dirname-not-defined
const basePath = path.resolve(); //__dirname
const serverPath = 'server';
const clientPath = 'client';
//https://stackoverflow.com/questions/58384179/syntaxerror-cannot-use-import-statement-outside-a-module
import { reUpdate } from './reUpdate-server.js';
reUpdate.log();



//https://medium.com/dailyjs/how-to-prevent-your-node-js-process-from-crashing-5d40247b8ab2
//https://stackoverflow.com/questions/19882344/node-js-server-crashing-without-error-message
process.on('uncaughtException',  function(exception      ){ console.log(exception);       });
process.on('unhandledRejection', function(reason, promise){ console.log(promise, reason); });

app.use(reUpdate.express(basePath, clientPath));
//https://evanhahn.com/express-dot-static-deep-dive/
app.use(express.static(clientPath, {
  index: 'index.html'
}));


//start the server and log to the console
var httpServer = http.createServer(app);
httpServer.listen(80, function(){
    var host = 'localhost';
    var port = httpServer.address().port;
    console.log('listening on http://' + host + ':' + port + '/');
});
