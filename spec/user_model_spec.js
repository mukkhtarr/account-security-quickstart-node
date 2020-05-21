require('../server/model/user_model.js');

const expect = require('chai').expect

var mongoose = require('mongoose');
var User = mongoose.model('User');

const dbHandler = require('./db-handler');

describe('user model', () => {
  before(async () => await dbHandler.connect());

  afterEach(async () => await dbHandler.clearDatabase());

  after(async () => await dbHandler.closeDatabase());

  describe('attributes', () => {
    it('has the fields: username, email, authyId and hashed_password', () => {
      var user_schema = User.schema.paths;
      expect(user_schema['username']).to.exist;
      expect(user_schema['email']).to.exist;
      expect(user_schema['authyId']).to.exist;
      expect(user_schema['hashed_password']).to.exist;
    });
  });

  describe('required fields', () => {
    it('has username and email as required', async() => {
      var user = new User();
      try {
        await user.validate();
      }catch(error){
        expect(error.errors.username).to.exist;
        expect(error.errors.email).to.exist;
      }
    });
  });
});
