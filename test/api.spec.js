'use strict';
import supertest from 'supertest';
import app from '../server.js';
import util from 'util';
import {expect} from 'chai';
import {assert} from 'chai';

require('should');

const sessionIdCookieRegex = /^PHPSESSID\=([^\;]+)\; Path=\/\; HttpOnly/;
const csrfTokenCookieRegex = /^XSRF\-TOKEN\=([^\;]+)\; Path=\//;

function extractCookie(res, rgx) {
  let
    cookies = res.headers['set-cookie'],
    val,
    matched = false;
  cookies.map(function (c) {
    if (!matched) {
      let results = rgx.exec(c);
      if (results) {
        val = results[1];
        matched = true;
      }
    }
  });
  if (matched) {
    return val;
  }
  return false;
}


describe('web application', function () {
  let
    sessionId, //being used in all requests
    csrfToken;

  it('has 200 and pong on /api/v2/ping', function (done) {
    supertest(app)
      .get('/api/v2/ping')
      .expect('X-Powered-By', 'TacticalMastery')
      .expect(200, {msg: 'PONG'})
      .end(function (error, res) {
        if (error) {
          return done(error);
        }
        // console.log('/api/v2/ping cookies ',res.headers['set-cookie']);
        let sId = extractCookie(res, sessionIdCookieRegex);
        if (sId === false) {
          return done(new Error('PHPSESSID not set!'));
        }
        let csrf = extractCookie(res, csrfTokenCookieRegex);
        if (csrf === false) {
          return done(new Error('XSRF-TOKEN not set!'));
        }
        sessionId = sId;
        csrfToken = csrf;
        done();
      });
  });

  describe('testing sessions', function () {
// https://starlightgroup.atlassian.net/browse/SG-5
    it('sets proper data for /api/v2/testSession WITH session token provided', function (done) {
      supertest(app)
        .get('/api/v2/testSession')
        .set('Cookie', [util.format('PHPSESSID=%s', sessionId)])
        .expect('X-Powered-By', 'TacticalMastery')
        .expect(200)
        .end(function (error, res) {
          if (error) {
            return done(error);
          }
          // console.log('/api/v2/testSession with session token cookies ',res.headers['set-cookie']);

          res.body.ip.should.exist;
          res.body.entryPoint.should.be.equal('/api/v2/ping');
          res.body.userAgent.should.match(/^node-superagent/);

          let csrf = extractCookie(res, csrfTokenCookieRegex);
          if (csrf === false) {
            return done(new Error('XSRF-TOKEN not set!'));
          }
          csrfToken = csrf;

          let sId = extractCookie(res, sessionIdCookieRegex);
          if (sId === false) {
            return done();
          }
          return done(new Error('PHPSESSID is reset! Bad session behaviour'));
        });
    });

    it('sets proper data for /api/v2/testSession WITHOUT session token provided', function (done) {
      supertest(app)
        .get('/api/v2/testSession')
        .expect('X-Powered-By', 'TacticalMastery')
        .expect(200)
        .end(function (error, res) {
          if (error) {
            return done(error);
          }
          // console.log('/api/v2/testSession 2 without session token cookies ',res.headers['set-cookie']);

          res.body.ip.should.exist;
          res.body.entryPoint.should.be.equal('/api/v2/testSession');
          res.body.userAgent.should.match(/^node-superagent/);

          let csrf = extractCookie(res, csrfTokenCookieRegex);
          if (csrf === false) {
            return done(new Error('XSRF-TOKEN not set!'));
          }
          csrfToken = csrf;

          let sId = extractCookie(res, sessionIdCookieRegex);

          if (sId === false) {
            return done(new Error('PHPSESSID not set!'));
          }
          sessionId = sId;
          done();
        });
    });
  });

  it('has 200 and pong on /api/v2/state/:state', function (done) {
    supertest(app)
      .get('/api/v2/state/00544')
      .set('Cookie', [util.format('PHPSESSID=%s', sessionId)])
      .expect(200)
      .end(function (err, res) {
        if (err) {
          return done(err);
        }
        res.body.should.exist;
        res.body.data.should.exist;
        res.body.data.state.should.exist;
        res.body.data.state.should.be.equal('NY');
        done();
      });
  });


  it('has 200 on POST /api/v2/add-contact', function (done) {
    supertest(app)
      .post('/api/v2/add-contact')
      .set('Cookie', [util.format('PHPSESSID=%s', sessionId)])
      .send({
        FirstName: 'test_FirstName',
        LastName: 'test_LastName',
        Email: 'test@email.com',
        Phone: '222-222-4444',
        _csrf: csrfToken
      })
      .expect(200, function (error, res) {
        if (error) {
          return done(error);
        }
        let csrf = extractCookie(res, csrfTokenCookieRegex);
        if (csrf === false) {
          return done(new Error('XSRF-TOKEN not set!'));
        }
        csrfToken = csrf;
        done();
      });
  });

  it('has 403 on POST /api/v2/add-contact with missing CSRF token', function (done) {
    supertest(app)
      .post('/api/v2/add-contact')
      .set('Cookie', [util.format('PHPSESSID=%s', sessionId)])
      .send({
        FirstName: 'test_FirstName',
        LastName: 'test_LastName',
        Email: 'test@email.com',
        Phone: '222-222-4444',
        // _csrf: csrfToken
      })
      .expect(403,'Invalid API Key')
      .end(function (error, res) {
        if (error) {
          return done(error);
        }
        let csrf = extractCookie(res, csrfTokenCookieRegex);
        if (csrf === false) {
          return done(new Error('XSRF-TOKEN not set!'));
        }
        csrfToken = csrf;
        done();
      });
  });

  it('has 403 on POST /api/v2/add-contact with bad CSRF token', function (done) {
    supertest(app)
      .post('/api/v2/add-contact')
      .set('Cookie', [util.format('PHPSESSID=%s', sessionId)])
      .send({
        FirstName: 'test_FirstName',
        LastName: 'test_LastName',
        Email: 'test@email.com',
        Phone: '222-222-4444',
        _csrf: 'Во имя Отца, и Сына, и Святаго духа, аминь!'
      })
      .expect(403,'Invalid API Key')
      .end(function (error, res) {
        if (error) {
          return done(error);
        }
        let csrf = extractCookie(res, csrfTokenCookieRegex);
        if (csrf === false) {
          return done(new Error('XSRF-TOKEN not set!'));
        }
        csrfToken = csrf;
        done();
      });
  });


  it('has 200 on POST /api/v2/update-contact', function (done) {
    supertest(app)
      .post('/api/v2/update-contact')
      .set('Cookie', [util.format('PHPSESSID=%s', sessionId)])
      .send({
        firstName: 'test_FirstName_updated',
        lastName: 'test_LastName_updated',
        emailAddress: 'test@email.com',
        phoneNumber: '111-222-3333',
        _csrf: csrfToken
      })
      .expect(200, function (error, res) {
        if (error) {
          return done(error);
        }
        let csrf = extractCookie(res, csrfTokenCookieRegex);
        if (csrf === false) {
          return done(new Error('XSRF-TOKEN not set!'));
        }
        csrfToken = csrf;
        done();
      });
  });

  it('has 403 on POST /api/v2/update-contact with missing CSRF token', function (done) {
    supertest(app)
      .post('/api/v2/update-contact')
      .set('Cookie', [util.format('PHPSESSID=%s', sessionId)])
      .send({
        firstName: 'test_FirstName_updated',
        lastName: 'test_LastName_updated',
        emailAddress: 'test@email.com',
        phoneNumber: '111-222-3333'
        // _csrf: csrfToken
      })
      .expect(403,'Invalid API Key')
      .end(function (error, res) {
        if (error) {
          return done(error);
        }
        let csrf = extractCookie(res, csrfTokenCookieRegex);
        if (csrf === false) {
          return done(new Error('XSRF-TOKEN not set!'));
        }
        csrfToken = csrf;
        done();
      });
  });

  it('has 403 on POST /api/v2/update-contact with bad CSRF token', function (done) {
    supertest(app)
      .post('/api/v2/update-contact')
      .set('Cookie', [util.format('PHPSESSID=%s', sessionId)])
      .send({
        firstName: 'test_FirstName_updated',
        lastName: 'test_LastName_updated',
        emailAddress: 'test@email.com',
        phoneNumber: '111-222-3333',
        _csrf: 'Во имя Отца, и Сына, и Святаго духа, аминь!'
      })
      .expect(403,'Invalid API Key')
      .end(function (error, res) {
        if (error) {
          return done(error);
        }
        let csrf = extractCookie(res, csrfTokenCookieRegex);
        if (csrf === false) {
          return done(new Error('XSRF-TOKEN not set!'));
        }
        csrfToken = csrf;
        done();
      });
  });
});