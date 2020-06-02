require('../server/model/user_model.js');

var mongoose = require('mongoose');
var User = mongoose.model('User');

const dbHandler = require('./db-handler');

describe('user model', () => {
  beforeAll(async () => await dbHandler.connect());

  afterAll(async () => {
    await dbHandler.clearDatabase();
    await dbHandler.closeDatabase()
  });

  describe('attributes', () => {
    test('has the fields: username, email, authyId and hashed_password', () => {
      var user_schema = User.schema.paths;
      expect(user_schema['username']).not.toBeFalsy();
      expect(user_schema['email']).not.toBeFalsy();
      expect(user_schema['authyId']).not.toBeFalsy();
      expect(user_schema['hashed_password']).not.toBeFalsy();
    });
  });

  describe('required fields', () => {
    test('has username and email as required', async() => {
      var user = new User();
      try {
        await user.validate();
      }catch(error){
        expect(error.errors.username).not.toBeFalsy();
        expect(error.errors.email).not.toBeFalsy();
      }
    });
  });
});
