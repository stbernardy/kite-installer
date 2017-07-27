'use strict';

const AccountManager = require('../account-manager');
const {handleResponseData} = require('../utils');

module.exports = class CheckEmail {
  constructor({name, retryStep} = {}) {
    this.name = name;
    this.retryStep = retryStep;
  }

  start(data) {
    return AccountManager.checkEmail(data)
    .then(resp => Promise.all([
      Promise.resolve(resp.statusCode),
      handleResponseData(resp),
    ]))
    .then(([status, raw]) => {
      const json = status === 200 ? {} : JSON.parse(raw);
      switch (status) {
        case 200:
          return {
            email: data.email,
            invalid: false,
            exists: false,
            hasPassword: false,
            reason: null,
          };
        case 403:
        case 404:
        case 409:
          if (json.email_invalid) {
            const err = new Error(json.fail_reason);
            err.data = {
              email: data.email,
              invalid: json.email_invalid,
              exists: json.account_exists,
              hasPassword: json.has_password,
              reason: json.fail_reason,
            };
            throw err;
          } else {
            return {
              email: data.email,
              invalid: json.email_invalid,
              exists: json.account_exists,
              hasPassword: json.has_password,
              reason: json.fail_reason,
            };
          }
        case 500: {
          const err = new Error('Server error while checking email');
          err.data = {
            email: data.email,
          };
          throw err;
        }
      }
      return undefined;
    });
  }
};