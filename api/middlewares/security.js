//Middleware for security
//Entry points, ip tampering, and so on
//it makes api return 403 error and sets `req.session.isBot` to true


import config from './../../server-config';

//This is first pages of site, that real users usually visits
//TODO - verify that nothing is missing
const validEntryPoints = [
  '/',
  '/index.html',
  '/checkout.html',
  '/us_headlampoffer.html',
  '/customercare.html',
  '/partner.html',
  '/press.html',
  '/privacy.html',
  '/receipt.html',
  '/terms.html',
  '/tm3.html',
  '/us_batteryoffer.html'
];

exports.getIp = function (req) {
//https://support.cloudflare.com/hc/en-us/articles/200170986-How-does-CloudFlare-handle-HTTP-Request-headers-
  if (config.ENV !== 'development' && req.headers['cf-connecting-ip']) {
    return req.headers['cf-connecting-ip'];
  }
//http://stackoverflow.com/a/10849772/1885921
  return req.headers['x-forwarded-for'] || req.connection.remoteAddress;
};

exports.punishForEnteringSiteFromBadLocation = function (req, res, next) {
  if (req.session) {
    if (validEntryPoints.indexOf(req.session.entryPoint) === -1) {
      if (config.ENV !== 'production') {
        res.set('X-PUNISHEDBY', 'BAD LOCATION');
      }
      req.session.isBot = true;
      return res.status(403).send('Invalid API Key');
    }
    return next();
  }
  return res.status(403).send('Invalid API Key');
};


exports.punishForChangingIP = function (req, res, next) {
  if (req.session) {
    let rIp = getIp(req);
    if (req.session.ip !== rIp) {
      if (config.ENV !== 'production') {
        res.set('X-PUNISHEDBY', 'BAD LOCATION');
      }
      req.session.isBot = true;
      return res.status(403).send('Invalid API Key');
    }
    return next();
  }
  return res.status(403).send('Invalid API Key');
};

exports.punishForChangingUserAgent = function (req, res, next) {
  if (req.session) {
    let ua = req.get('User-Agent');
    if (req.session.userAgent !== ua) {
      if (config.ENV !== 'production') {
        res.set('X-PUNISHEDBY', 'BAD UA');
      }
      req.session.isBot = true;
      return res.status(403).send('Invalid API Key');
    }
    return next();
  }
  return res.status(403).send('Invalid API Key');
};
