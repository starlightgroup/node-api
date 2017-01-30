'use strict';
import supertest from 'supertest';
import app from '../server.js';
import { expect } from 'chai'
import { assert } from 'chai'

describe('web application', function () {
  it('it has 200 and pong on /api/v2/ping', function (done) {
    supertest(app)
      .get('/api/v2/ping')
      .expect(200, {msg:'PONG'}, done);
  });
  it('it has 200 and pong on /api/v2/state/:state', function (done) {
    supertest(app)
      .get('/api/v2/state/00544')
      .expect(200)
      .end(function (err, res) {
        expect(res.body.data.state).to.equal('NY');
        done();
      });
  });
  it('it has 200  on /api/v2/add-contact', function (done) {
    supertest(app)
      .post('/api/v2/add-contact')
      .send({
            FirstName: 'test_FirstName',
            LastName: 'test_LastName',
            Email: 'test@email.com',
            Phone: '222-222-4444'
      })
      .expect(200, done);
  });
  it('it has 200  on /api/v2/update-contact', function (done) {
    supertest(app)
      .post('/api/v2/update-contact')
      .send({
            firstName: 'test_FirstName_updated',
            lastName: 'test_LastName_updated',
            emailAddress: 'test@email.com',
            phoneNumber: '111-222-3333'
      })
      .expect(200, done);
  });
});