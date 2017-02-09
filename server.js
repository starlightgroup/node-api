'use strict';
require('@risingstack/trace');
import express from 'express';
import fs from 'fs';
import logger from './api/common/log';
import bodyParser from 'body-parser';
import config from './server-config';
import expressPromiseRouter from 'express-promise-router';
import expressContentLength from 'express-content-length-validator';

//proper session implementation
//https://starlightgroup.atlassian.net/browse/SG-5
import expressSession from 'express-session'; //initialize sessions
import cookieParser from 'cookie-parser'; // parse cookies to start sessions from
import connectRedis from 'connect-redis';//store session data in redis database
import csurf from 'csurf'; //add CSRF protection https://www.npmjs.com/package/csurf
import redis from './config/redis.js'; //load redis client

import http from 'http';
import forceSSL from 'express-force-ssl';
import helmet from 'helmet';
import hpp from 'hpp';
import csp from 'helmet-csp';
import raven from 'raven';

import {routes} from './config/routes/v2';

//https://starlightgroup.atlassian.net/browse/SG-8
//protect /api/v2/ from session tampering
import security from './api/middlewares/security.js';

const app = express();
console.log("Currently Running On : " , config.ENV);


app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use(hpp());

//TODO how do we plan to serve assets using nodejs, if there is 9 kbytes limit on returned data? - Anatolij
const MAX_CONTENT_LENGTH_ACCEPTED = 9999;
app.use(expressContentLength.validateMax({max: MAX_CONTENT_LENGTH_ACCEPTED, status: 400, message: "stop max size for the content-length!"})); // max size accepted for the content-length


//https://starlightgroup.atlassian.net/browse/SG-5
//secure cookie based sessions being stored in redis
//setup redis powered sessions
//https://github.com/vodolaz095/hunt/blob/master/lib/http/expressApp.js#L236-L244
const RedisSessionStore = connectRedis(expressSession);
app.use(cookieParser(config.secret));
app.use(expressSession({
  key: 'PHPSESSID', //LOL, let they waste some time hacking this as PHP application, at least it will be detected by Cloudfare :-)
  store: new RedisSessionStore({
    prefix: 'starlight_session_',
    client: redis
  }),
  expireAfterSeconds: 3 * 60 * 60, //session is valid for 3 hours
  secret: config.secret,
  httpOnly: true,
  resave: true,
  saveUninitialized: true
}));
//end of SG-5

//protect from tampering session - basic example
//it saves IP and entry point into session.
//if IP changes, it is likely to be bot or somebody using tor
//if entryPoint is the api endpoint being called now, it is likely to be bot
//UPD this middleware only saves data, it do not punish bots yet)
//https://starlightgroup.atlassian.net/browse/SG-5
//https://starlightgroup.atlassian.net/browse/SG-8
//https://starlightgroup.atlassian.net/browse/SG-9
app.use(function sessionTamperingProtectionMiddleware(req, res, next) {
  res.set('X-Powered-By', 'TacticalMastery'); //do not expose, that it is expressJS application

  //http://stackoverflow.com/a/10849772/1885921
  if (!req.session.ip) {
    req.session.ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  }
  if (!req.session.entryPoint) {
    //http://expressjs.com/en/api.html#req.originalUrl
    req.session.entryPoint = req.originalUrl;
  }
  if (!req.session.userAgent) {
    req.session.userAgent = req.get('User-Agent');
  }
  next();
});


app.use(csurf({ cookie: false }));

//CSRF protection middleware with cookies
//provide CSRF token in Anatolij's way - it works with angular 1.x from the box
//https://starlightgroup.atlassian.net/browse/SG-14
app.use(function (req,res,next) {
  if (req.session) {
    const token = req.csrfToken();
    res.locals.csrf = token;
    res.cookie('XSRF-TOKEN', token);
  }
  next();
});
//END of SG-14


//This function IS NEVER used -- Anatolij
function logResponseBody(req, res, next) {
  const oldWrite = res.write,
    oldEnd = res.end;

  const chunks = [];

  res.write = function (chunk) {
    chunks.push(new Buffer(chunk));

    oldWrite.apply(res, arguments);
  };

  res.end = function (chunk) {
    if (chunk)
      chunks.push(new Buffer(chunk));

    const body = Buffer.concat(chunks).toString('utf8');
    logger.info(body);

    oldEnd.apply(res, arguments);
  };
  next();
}


//https://starlightgroup.atlassian.net/browse/SG-8
//secure /api/ from access by bots
//for additional info see function `sessionTamperingProtectionMiddleware` above
app.use('/api', security.punishForChangingIP);
app.use('/api', security.punishForChangingUserAgent);
app.use('/api', security.punishForEnteringSiteFromBadLocation);


// route with appropriate version prefix
Object.keys(routes).forEach(r => {
  const router = expressPromiseRouter();
  // pass promise route to route assigner
  routes[r](router);
  app.use(`/api/${r}`, router);
});

app.use(express.static('public'));

// app.use(raven.middleware.express.errorHandler('https://547e29c8a3854f969ff5912c76f34ef0:62c29411c70e46df81438b09d05526b0@sentry.io/106191'));

app.use(function (err, req, res, next) {
  if (err) {
    if (err.code === 'EBADCSRFTOKEN') {
      res.status(403).send('Invalid API Key');
    }else {
      console.log(err);
      if (typeof err.status != "undefined")   res.status(err.status);
      if(res.error){
        res.error(err.message || err);
      }else {
          res.status(err.code || 500 ).send(err.message || 'Server error');
      }
    }
  }
});

// var https_port = (process.env.HTTPS_PORT || 4443);

// var options = {
//   //new location of evssl certs
//   cert: fs.readFileSync('/etc/nginx/ssl/tacticalmastery_cf.crt'),
//   key: fs.readFileSync('/etc/nginx/ssl/tacticalmastery_cf.key'),
//   requestCert: true
// };

// https.createServer(options,app).listen(https_port);
// console.log("HTTPS Server Started at port : " + https_port);


http
  .createServer(app)
  .listen(config.PORT, config.HOST, function (error) {
    if(error){
      throw error;
    }
    console.log("HTTP Server Started at %s:%s", config.HOST, config.PORT );
  });

module.exports = exports = app;
