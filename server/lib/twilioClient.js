var config = require('../config.js');
const twilio = require('twilio')(config.ACCOUNT_SID, config.AUTH_TOKEN);

module.exports = {
  verifications: (phoneNumber, via) => {
    return twilio.verify.services(config.VERIFY_SERVICE)
      .verifications
      .create({
        to: phoneNumber,
        channel: via
      })
      .then(response => Promise.resolve(response))
      .catch(err => Promise.reject(err));
  },
  verificationChecks: (phoneNumber, token) => {
    return twilio.verify.services(config.VERIFY_SERVICE)
      .verificationChecks
      .create({
          to: phoneNumber,
          code: token
      })
      .then(check => Promise.resolve(check))
      .catch(err => Promise.reject(err));
  }
}
