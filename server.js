'use strict';
require('@risingstack/trace');
import express from 'express';

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

import helmet from 'helmet';
import hpp from 'hpp';
import csp from 'helmet-csp';

import {routes} from './config/routes/v2';

//https://starlightgroup.atlassian.net/browse/SG-8
//protect /api/v2/ from session tampering
import security from './api/middlewares/security.js';

const app = express();
console.log("Currently Running On : " , config.ENV);

//hemlet headers - do not remove
app.use(helmet());
app.use(helmet.referrerPolicy());
app.use(helmet.frameguard({ action: 'deny' }));
/*/
//under construction
app.use(csp({
  // some examples
  // 
  // Specify directives as normal.
  directives: {
    defaultSrc: ["'self'",'cdn.jsdelivr.net','*.segment.com','segment.com','*.wistia.com', '*.akamaihd.net', 'blob:'],
    scriptSrc: [
      "'self'",
      "'unsafe-inline'", //they say, it can be dangerous
      'cdn.jsdelivr.net',
      'cdn.rawgit.com',
      '*.wistia.com',
      '*.litix.io'
      // "'sha256-LC866cQ9tlE73BIp/WFYbgTYkS859vx0Hfk5RBVENLo='"
    ],
    styleSrc: [
      "'self'",
      'cdn.jsdelivr.net',
      'fonts.googleapis.com',
      '*.segment.com',
      "'unsafe-inline'"
      // "'sha256-6EANf3q7TA3PzDpgLK8msCpC3+5Oq9al9X2vFTn/4Zo='",
      // "'sha256-7YxZjqgD/pE+dM1CMFFeuqfzrw5kL6AzVXgC130wbtc='",
      // "'sha256-68t8GdqcvIIBWHbcG8ZlsUUhN/8isFuMo7CI53+xcSM='"
      ],
    fontSrc: ["'self'",'fonts.gstatic.com', 'cdn.jsdelivr.net', 'data:'],
    imgSrc: ["'self'", 'data:', '*.akamaihd.net','*.wistia.com'],
    sandbox: ['allow-forms', 'allow-scripts'],
    reportUri: 'https://a434819b5a5f4bfeeaa5d47c8af8ac87.report-uri.io/r/default/csp/reportOnly', //https://report-uri.io/account/setup/
    // objectSrc: ["'none'"],
    mediaSrc: ['data:'],
    upgradeInsecureRequests: true
  },

  // This module will detect common mistakes in your directives and throw errors
  // if it finds any. To disable this, enable "loose mode".
  loose: false,

  // Set to true if you only want browsers to report errors, not block them.
  // You may also set this to a function(req, res) in order to decide dynamically
  // whether to use reportOnly mode, e.g., to allow for a dynamic kill switch.
  reportOnly: false,

  // Set to true if you want to blindly set all headers: Content-Security-Policy,
  // X-WebKit-CSP, and X-Content-Security-Policy.
  setAllHeaders: false,

  // Set to true if you want to disable CSP on Android where it can be buggy.
  disableAndroid: false,

  // Set to false if you want to completely disable any user-agent sniffing.
  // This may make the headers less compatible but it will be much faster.
  // This defaults to `true`.
  browserSniff: true
}));
*/
app.use(helmet.hpkp({
  maxAge: 2592000, //30 days
  sha256s: [
//new - generated here - https://report-uri.io/home/pkp_hash
    /*
     Here is your PKP hash for ssl369830.cloudflaressl.com: pin-sha256="EZpO1a5wa3q9eyxOxvTaSVciRXlm57R6fYJ2gsIbrJg="
     Here is your PKP hash for COMODO ECC Domain Validation Secure Server CA 2: pin-sha256="x9SZw6TwIqfmvrLZ/kz1o0Ossjmn728BnBKpUFqGNVM="
     Here is your PKP hash for COMODO ECC Certification Authority: pin-sha256="58qRu/uxh4gFezqAcERupSkRYBlBAvfcw7mEjGPLnNU="
     Here is your PKP hash for AddTrust External CA Root: pin-sha256="lCppFqbkrlJ3EcVFAkeip0+44VaoJUymbnOaEUk7tEU="
     */

    'EZpO1a5wa3q9eyxOxvTaSVciRXlm57R6fYJ2gsIbrJg=',
    'x9SZw6TwIqfmvrLZ/kz1o0Ossjmn728BnBKpUFqGNVM=',
    '58qRu/uxh4gFezqAcERupSkRYBlBAvfcw7mEjGPLnNU=',
    'lCppFqbkrlJ3EcVFAkeip0+44VaoJUymbnOaEUk7tEU=',
//old
//     'AbCdEfSeTyLBvTjEOhGD1627853=',
//     'ZyXwYuBdQsPIUVxNGRDAKGgxhJVu456='
  ]
}));

// app.use(helmet.noCache());

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
  saveUninitialized: true,
  cookie: { //http://stackoverflow.com/a/14570856/1885921
    secure: config.ENV === 'production'
  }
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
    res.cookie('XSRF-TOKEN', token, {secure: config.ENV === 'production'});
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
//app.use('/api', security.punishForChangingIP); //TODO write with proper IP in production
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

app.use(function (err, req, res, next) {
  if (err) {
      console.log(err)
    if (err.code === 'EBADCSRFTOKEN') {
      res.status(403).send('Invalid API Key');
    }else {
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


if(!module.parent) {
  http
    .createServer(app)
    .listen(config.PORT, config.HOST, function (error) {
      if(error){
        throw error;
      }
      console.log("HTTP Server Started at %s:%s", config.HOST, config.PORT);
    });
}

module.exports = exports = app;
