require('../server/model/user_model.js');
const dbHandler = require('./db-handler');

const app = require('../index.js');
const request = require('supertest');
var agent = request(app);

const mockTwilioClient = require('../server/lib/twilioClient');

describe('index routes', () => {
  beforeAll(async () => await dbHandler.connect());

  afterAll(async () => {
    await dbHandler.clearDatabase();
    await dbHandler.closeDatabase();
  });

  describe('POST /api/verification/start', () => {
    describe('when all parameters are sent', () => {
      test('returns 200 on success', async() => {
        mockTwilioClient.verifications = jest.fn(() => Promise.resolve({sid: 'sid'}));

        let result = await agent
          .post('/api/verification/start')
          .send({phoneNumber: '222 333 4444', via: 'SMS'});

        expect(result.statusCode).toBe(200);
        expect(result.body).toEqual({"sid": "sid"});
      });

      test('returns 500 on errors', async() => {
        mockTwilioClient.verifications = jest.fn(() => Promise.reject('error!'));

        let result = await agent
          .post('/api/verification/start')
          .send({phoneNumber: '222 333 4444', via: 'SMS'});

        expect(result.statusCode).toBe(500);
        expect(result.body).toEqual('error!');
      });
    });

    describe('when a parameter is missing', () => {
      test('returns 500', async() => {
        let result = await agent
          .post('/api/verification/start')
          .send({ via: 'SMS'});

        expect(result.statusCode).toBe(500);
        expect(result.body).toEqual({"error": "Missing fields"});
      });
    });
  });

  describe('POST /api/verification/verify', () => {
    describe('when all parameters are sent', () => {
      test('returns 200 if verification check is approved', async() => {
        mockTwilioClient.verificationChecks = jest.fn(() => Promise.resolve({status: 'approved'}));

        let result = await agent
          .post('/api/verification/verify')
          .send({phoneNumber: '222 333 4444', token: 'token'});

        expect(result.statusCode).toEqual(200);
        expect(result.body).toEqual({"status": "approved"});
      });

      test('returns 401 if verification check is not approved', async() => {
        mockTwilioClient.verificationChecks = jest.fn(() => Promise.resolve({status: 'not_approved'}));

        let result = await agent
          .post('/api/verification/verify')
          .send({phoneNumber: '222 333 4444', token: 'token'});

        expect(result.statusCode).toEqual(401);
        expect(result.body).toEqual('Wrong code');
      });
    });

    describe('when a parameter is missing', () => {
      test('returns 500', async() => {
        let result = await agent
          .post('/api/verification/verify')
          .send({ phoneNumber: '222 333 444'});

        expect(result.statusCode).toBe(500);
        expect(result.body).toEqual({"error": "Missing fields"});
      });
    });
  });

  describe('protected paths', () => {
    describe('when user logged in', () => {
      test('keeps in the path', (done) => {
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
          expect(res.header['location']).toBe('/2fa/');
          done();
        })
        
      });
    });

    describe('when user is not logged in', () => {
      test('redirects to login path', (done) => {
        agent
          .get('/2fa')
          .send({})
          .redirects(1)
          .end((err,res) => {
            if (err){
              return done('should not fail');
            }
            expect(res.header['location']).toBe('/login');
            done();
          })
      });
    });
  });
});
