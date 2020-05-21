var axios = require('axios');
var VERSION = "0.1";


module.exports = function (apiKey, apiUrl) {
    return new PhoneVerification(apiKey, apiUrl);
};

function PhoneVerification(apiKey, apiUrl) {
    this.apiKey = apiKey;
    this.apiURL = apiUrl || "https://api.authy.com";
    this.user_agent = "PhoneVerificationRegNode/" + VERSION + " (node " + process.version + ")";
    this.headers = {};

    this.init();
}

PhoneVerification.prototype.init = function () {
    this.headers = {
        "User-Agent": this.user_agent
    };
};

/**
 * Verify a phone number
 *
 * @param {!string} phone_number
 * @param {!string} country_code
 * @param {!string} token
 * @param {!function} callback
 */
PhoneVerification.prototype.verifyPhoneToken = function (phone_number, country_code, token, callback) {

    console.log('in verify phone');
    this._request("get", "/protected/json/phones/verification/check", {
            "api_key": this.apiKey,
            "verification_code": token,
            "phone_number": phone_number,
            "country_code": country_code
        },
        callback
    );
};

/**
 * Request a phone verification
 *
 * @param {!string} phone_number
 * @param {!string} country_code
 * @param {!string} via
 * @param {!function} callback
 */
PhoneVerification.prototype.requestPhoneVerification = function (phone_number, country_code, via, callback) {

    this._request("post", "/protected/json/phones/verification/start", {
            "api_key": this.apiKey,
            "phone_number": phone_number,
            "via": via,
            "country_code": country_code,
            "code_length": 4
        },
        callback
    );
};

PhoneVerification.prototype._request = function (type, path, params, callback, qs) {
    qs = qs || {};
    qs['api_key'] = this.apiKey;

    options = {
        url: this.apiURL + path,
        parms: params,
        headers: this.headers,
        qs: qs
    };

    console.log(options.url);

    var callback_check = function (response) {
        if (response.status === 200) {
            return callback(null, response.data);
        }
        throw response;
    }; 

    switch (type) {
        case "post":
            axios
                .post(options.url, params, options)
                .then(callback_check)
                .catch(function(err) {
                    callback(err.data || err)
                });
            break;

        case "get":
            axios
                .get(options.url, options)
                .then(callback_check)
                .catch(function (err) {
                    callback(err.data || err);
                });
            break;
    }
};
