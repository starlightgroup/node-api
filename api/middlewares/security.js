//Middleware for security
//Entry points, ip tampering, and so on
//it makes api return 403 error and sets `req.session.isBot` to true

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


exports.punishForEnteringSiteFromBadLocation = function (req, res, next) {
  if (req.session) {
    if (validEntryPoints.indexOf(req.session.entryPoint) === -1) {
      req.session.isBot = true;
      return res.status(403).send('Invalid API Key');
    }
    return next();
  }
  return res.status(403).send('Invalid API Key');
};


exports.punishForChangingIP = function (req, res, next) {
  if (req.session) {
    let rIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    if (req.session.ip !== rIp) {
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
      req.session.isBot = true;
      return res.status(403).send('Invalid API Key');
    }
    return next();
  }
  return res.status(403).send('Invalid API Key');
};
