require('newrelic');
import express from 'express';
import fs from 'fs';
import morgan from 'morgan';
import logger from './api/common/log';
import cors from 'cors';
import bodyParser from 'body-parser';
import config from 'config3';
import expressPromiseRouter from 'express-promise-router';
import https from 'https';
import express_enforces_ssl from 'express-enforces-ssl';
import helmet from 'helmet';
import redis from './config/redis';
import csvimport from './config/import';
import * as routes from './config/routes';

//import './config/seed'

export const app = express();

app.enable('trust proxy');
app.use(express_enforces_ssl());
app.use(helmet())

app.set('superSecret', config.LOCALTABLE_SECRET);
app.use('/api', morgan('combined', {stream: logger.asStream('info')}));

app.use(cors());

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());


app.use(function (req, res, next) {
  res.set(`X-Powered-By`, `TacticalMastery`);
  next();
});

function logResponseBody(req, res, next) {
  var oldWrite = res.write,
    oldEnd = res.end;

  var chunks = [];

  res.write = function (chunk) {
    chunks.push(new Buffer(chunk));

    oldWrite.apply(res, arguments);
  };

  res.end = function (chunk) {
    if (chunk)
      chunks.push(new Buffer(chunk));

    var body = Buffer.concat(chunks).toString('utf8');
    logger.info(body);

    oldEnd.apply(res, arguments);
  };

  next();
}

app.use(logResponseBody);

// route with appropriate version prefix
Object.keys(routes).forEach(r => {
  const router = expressPromiseRouter();
  // pass promise route to route assigner
  routes[r](router);
  // '/' + v1_0 -> v1.0, prefix for routing middleware
  app.use(`/api/${r.replace('_', '.')}`, router);
});

app.use(function (err, req, res, next) {
  if (err) {
    console.log(err);
    if (typeof err.status != "undefined")   res.status(err.status);
    res.error(err.message || err);
  }
});

if(process.env.NODE_ENV === 'production') {
  var options = {
    cert: fs.readFileSync('/etc/nginx/ssl/tacticalmastery_chained.crt'),
    key: fs.readFileSync('/etc/nginx/ssl/tacticalmastery.key')
  };
  const server = https.createServer(options, app);
  server.listen(process.env.PORT || 4000);
}
else {
  app.listen(process.env.PORT || 4000);
}


if (process.env.PORT === undefined) {
  console.log("Server Started at port : " + 4000);
} else {
  console.log("Server Started at port : " + process.env.PORT);
}
