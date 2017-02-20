'use strict';
/* global it, describe, process */

import rangeCheck from 'range_check';
import should from 'should';
import util from 'util';

//unit tests to prove https://starlightgroup.atlassian.net/browse/SG-35
//that middleware accepts only IPs from cloudflare servers

import security from './../api/middlewares/security';

function RequestMock(originatingIp){
  this.headers = {
    'x-forwarded-for': originatingIp
  };
  this.connection = {
    remoteAddress: originatingIp
  };
  return this;
}


function ResponseMock(done) {
  // return res
  //   .status(500)
  //   .end('NOT OK');
  this.final = done;
}

ResponseMock.prototype.status = function (code) {
  this.code = code;
  return this;
};

ResponseMock.prototype.end = function (message) {
  this.message = message;
  this.final(null, this.code, this.message)
};



describe('security', function () {
  let invalidIp = '193.41.76.172';
  let validIp = '103.21.244.2'; //http://jodies.de/ipcalc?host=103.21.244.0&mask1=22&mask2=
  let ipRange = '103.21.244.0/22';

  describe('range_check', function () {
    it('it works for good ip', function () {
      rangeCheck.inRange(validIp, ipRange).should.be.true;
    });

    it('it fails as intended for bad ip', function () {
      rangeCheck.inRange(invalidIp, ipRange).should.be.false;
    });
  });


  describe('#verifyThatSiteIsAccessedFromCloudflare', function () {
    it('is a function', function () {
      security.verifyThatSiteIsAccessedFromCloudflare.should.be.a.Function;
    });

    it('do not works with IPv4 from not cloudflare', function (done) {
      let
        req = new RequestMock(invalidIp),
        res = new ResponseMock(function (error, code, message) {
          should.not.exist(error);
          code.should.be.equal(500);
          message.should.be.equal('NOT OK');
          done();
        });
      security.verifyThatSiteIsAccessedFromCloudflare(req,res, function(error){
        if(error){
          done(error);
        }
      });
    });


    it('do works with IPv4 from cloudflare 1', function (done) {
      let
        req = new RequestMock('103.22.200.23'),
        res = new ResponseMock(function (error, code, message) {
          if(error){
            return done(error);
          }
          done(new Error(util.format('server responded with %s : %s', code, message)));
        });
      security.verifyThatSiteIsAccessedFromCloudflare(req,res, done);
    });

    it('do works with IPv4 from cloudflare 2', function (done) {
      let
        req = new RequestMock(validIp),
        res = new ResponseMock(function (error, code, message) {
          if(error){
            return done(error);
          }
          done(new Error(util.format('server responded with %s : %s', code, message)));
        });
      security.verifyThatSiteIsAccessedFromCloudflare(req,res, done);
    });


    it('do works with IPv4 from cloudflare 3', function (done) {
      let
        req = new RequestMock('197.234.240.21'),
        res = new ResponseMock(function (error, code, message) {
          if(error){
            return done(error);
          }
          done(new Error(util.format('server responded with %s : %s', code, message)));
        });
      security.verifyThatSiteIsAccessedFromCloudflare(req,res, done);
    });

//https://www.ultratools.com/tools/ipv6CIDRToRangeResult?ipAddress=2400%3Acb00%3A%3A%2F32
    it('do works with valid IPv6 from cloudflare', function (done) {
      let
        req = new RequestMock('2400:cb00:0:0:0:0:0:1'),
        res = new ResponseMock(function (error, code, message) {
          if(error){
            return done(error);
          }
          done(new Error(util.format('server responded with %s : %s', code, message)));
        });
      security.verifyThatSiteIsAccessedFromCloudflare(req,res, done);
    });

  });
});
