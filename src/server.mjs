import http from 'http';
import https from 'https';
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






app.use(reUpdate.express(basePath, clientPath));
//https://evanhahn.com/express-dot-static-deep-dive/
app.use(express.static(clientPath, {
  index: 'index.html'
}));


var p = path.join(basePath, serverPath);
var credentials = {
  key: fs.readFileSync(path.join(p, '/private.key')),
  cert: fs.readFileSync(path.join(p, '/certificate.crt')),
  ca: fs.readFileSync(path.join(p, '/ca_bundle.crt')),
};

//start an HTTP redirect server
var httpServer = http.createServer(function(req, res){
  res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
  res.end();
  //res.redirect('https://' + req.headers.host + req.url);
  //console.log('https://' + req.headers.host + req.url);
});
httpServer.listen(80);

//start the server and log to the console
var httpsServer = https.createServer(credentials, app);
httpsServer.listen(443, function(){
    var host = 'localhost';
    var port = httpsServer.address().port;
    console.log('listening on http://' + host + ':' + port + '/');
});
