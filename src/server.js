import http from 'http';
import https from 'https';
import path from 'path';
import fs from 'fs';
import express from 'express';
import bodyParser from 'body-parser';
import webPush from 'web-push';
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

//https://enable-cors.org/server_expressjs.html
app.use(function(req, res, next){
  res.header("Access-Control-Allow-Origin", "https://webcache.googleusercontent.com"); //cached version of page for debugging
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

var vapidDetails = {
  public: fs.readFileSync(path.join('./client/', 'public_vapid.key')),
  private: fs.readFileSync(path.join('./server/', 'private_vapid.key')),
};

webPush.setVapidDetails(
  'mailto:bricktech2000@gmail.com',
  vapidDetails.public.toString(),
  vapidDetails.private.toString()
);
var subscription;
app.post('/subscribe', bodyParser.json(), async function(req, res){
  subscription = req.body;
  //https://stackoverflow.com/questions/12899061/creating-a-file-only-if-it-doesnt-exist-in-node-js
  var subscriptions = JSON.parse(await fs.promises.readFile('./server/subscriptions.json'));
  subscriptions[subscription.endpoint] = subscription;
  fs.writeFile('./server/subscriptions.json', JSON.stringify(subscriptions), {flag: 'w'}, (err) => {
    if(err) console.log(err);
  });
  res.status(201).json({});
});
app.use(reUpdate.express(basePath, clientPath));

//https://evanhahn.com/express-dot-static-deep-dive/
app.use(express.static(clientPath, {
  index: 'index.html'
}));


var p = '/etc/letsencrypt/live/emilien.ml/';
var credentials = {
  key: fs.readFileSync(path.join(p, 'privkey.pem')),
  cert: fs.readFileSync(path.join(p, 'fullchain.pem')),
  //ca: fs.readFileSync(path.join(p, '')),
};

//start an HTTP redirect server
var httpServer = http.createServer(function(req, res){
  res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
  res.end();
});
httpServer.listen(80);

//start the server and log to the console
var httpsServer = https.createServer(credentials, app);
httpsServer.listen(443, function(){
    var host = 'localhost';
    var port = httpsServer.address().port;
    console.log(`listening on ${host}:${port}\n`);
});
