require('newrelic');
import express from 'express';
import fs from 'fs';
import logger from './api/common/log';
import bodyParser from 'body-parser';
import config from './server-config';
import expressPromiseRouter from 'express-promise-router';
import expressContentLength from 'express-content-length-validator';
import cookieSession from 'cookie-session';
import https from 'https';
import forceSSL from 'express-force-ssl';
import helmet from 'helmet';
import hpp from 'hpp';
import csp from 'helmet-csp';
import raven from 'raven';
import redis from './config/redis';
import csvimport from './config/import';
import {routes} from './config/routes/v2';

const app = express();

console.log("Currently Running On : " , process.env.NODE_ENV);

app.use(raven.middleware.express.requestHandler('https://547e29c8a3854f969ff5912c76f34ef0:62c29411c70e46df81438b09d05526b0@sentry.io/106191'));

app.set('forceSSLOptions', {
  enable301Redirects: true,
  trustXFPHeader: false,
  httpsPort: 4443,
  sslRequiredMessage: 'SSL Required.'
});
app.use(forceSSL);

app.use(helmet());
app.use(helmet.referrerPolicy());
app.use(helmet.frameguard({ action: 'deny' }));

app.use(csp({
  directives: {
    defaultSrc: ["'self'"],
    styleSrc : ["'self'"]
  }
}));

var oneDayInSeconds = 86400;
app.use(helmet.hpkp({
  maxAge: oneDayInSeconds,
  sha256s: ['AbCdEfSeTyLBvTjEOhGD1627853=', 'ZyXwYuBdQsPIUVxNGRDAKGgxhJVu456=']
}));

app.use(helmet.noCache());

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use(hpp());

var MAX_CONTENT_LENGTH_ACCEPTED = 9999; 
app.use(expressContentLength.validateMax({max: MAX_CONTENT_LENGTH_ACCEPTED, status: 400, message: "stop max size for the content-length!"})); // max size accepted for the content-length


var expiryDate = new Date(Date.now() + 60 * 60 * 1000) // 1 hour
app.use(cookieSession({
  name: 'tmcookie',
  keys: ['dfgEzfGDFrDFfgDh456dsrf34gDf48fg34hg7', 'fgdfg73465ghFghtxcDfdfdgdsfTfghxfdgedryYh'],
  cookie: {
    secure: true,
    httpOnly: true,
    expires: expiryDate
  }
}));

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


// route with appropriate version prefix
Object.keys(routes).forEach(r => {
  const router = expressPromiseRouter();
  // pass promise route to route assigner
  routes[r](router);
  app.use(`/api/${r}`, router);
});

app.use(raven.middleware.express.errorHandler('https://547e29c8a3854f969ff5912c76f34ef0:62c29411c70e46df81438b09d05526b0@sentry.io/106191'));

app.use(function (err, req, res, next) {
  if (err) {
    console.log(err);
    if (typeof err.status != "undefined")   res.status(err.status);
    res.error(err.message || err);
  }
});

var https_port = (process.env.HTTPS_PORT || 4443);

var options = {
  //new location of evssl certs
  cert: fs.readFileSync('/etc/nginx/ssl/tacticalmastery_cf.crt'),
  key: fs.readFileSync('/etc/nginx/ssl/tacticalmastery_cf.key'),
  requestCert: true
};

https.createServer(options,app).listen(https_port);
console.log("HTTPS Server Started at port : " + https_port);

