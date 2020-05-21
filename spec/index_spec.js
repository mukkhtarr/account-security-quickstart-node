require('../server/model/user_model.js');

const expect = require('chai').expect
const nock = require('nock')
const request = require('supertest');

const dbHandler = require('./db-handler');

const app = require('../index.js');
var agent = request(app);

describe('index routes', () => {
  before(async () => await dbHandler.connect());

  afterEach(async () => await dbHandler.clearDatabase());

  afterEach(() => {
    nock.cleanAll();
  });

  after(async () => await dbHandler.closeDatabase());

  describe('POST /api/verification/start', () => {
    it('returns 200 on success', (done) => {
      nock('https://api.authy.com')
        .post('/protected/json/phones/verification/start')
        .reply(200);

      agent
      .post('/api/verification/start')
      .send({
        phone_number: '222 333 4444',
        country_code: '1',
        via: 'SMS'
      })
      .expect(200)
      .end(function (err, res) {
        if(err){
          return done('Should not fail');
        }
        done();
      });
    });

    it('returns 500 on failing', (done) => {
      nock('https://api.authy.com')
        .post('/protected/json/phones/verification/start')
        .reply(400);

      agent
      .post('/api/verification/start')
      .send({
        phone_number: '222',
        country_code: '1',
        via: 'SMS'
      })
      .expect(500)
      .end(function (err, res) {

        if(err){
          return done('should not fail');
        }
        done();
      });
    });
  });
  
  describe('protected paths', () => {
    context('when user logged in', () => {
      it('keeps in the path', (done) => {
        var session = {loggedIn: true}

        agent
        .get('/2fa')
        .set('session', session)
        .send({})
        .redirects(0)
        .end((err,res) => {
          if (err){
            return done('should not fail');
          }
          expect(res.header['location']).to.equal('/2fa/');
          done();
        })
        
      });
    });

    context('when user is not logged in', () => {
      it('redirects to login path', (done) => {
        agent
          .get('/2fa')
          .send({})
          .redirects(1)
          .end((err,res) => {
            if (err){
              return done('should not fail');
            }
            expect(res.header['location']).to.equal('/login');
            done();
          })
      });
    });
  });
});
