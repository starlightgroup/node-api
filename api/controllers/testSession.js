import config from '../../server-config';


// this is handler for testing proper behaviour of sessions.
// on production it will return 404 error
// on development - usefull info of sessions populated
// related to performing unit tests for
// https://starlightgroup.atlassian.net/browse/SG-5

const testSession = function (req, res, next) {
  if (config.ENV === 'production') {
    res.sendStatus(404);
  } else {
    res
      .status(200)
      .json({
        'ip': req.session.ip,
        'entryPoint': req.session.entryPoint,
        'userAgent': req.session.userAgent
      });
  }
};

export default testSession;