'use strict';

const AccountManager = require('../account-manager');
const {handleResponseData, parseSetCookies, findCookie} = require('../utils');

const BaseStep = require('./base-step');

module.exports = class Login extends BaseStep {
  start({account: {email}} = {}, install) {
    this.install = install;
    return new Promise((resolve, reject) => {
      this.subscriptions.add(install.on('did-submit-credentials', () =>
        resolve(this.onSubmit())));

      this.subscriptions.add(install.on('did-click-back', () => {
        resolve({step: this.options.backStep, data: {}});
      }));

      this.subscriptions.add(install.on('did-forgot-password', () => {
        AccountManager.resetPassword({email}).then(resp => {
          if (resp.statusCode === 200) {
            atom.notifications.addSuccess(
              `Instructions on how to reset your password should
               have been sent to ${email}`);
          }
          return;
        });
      }));
    });
  }

  onSubmit() {
    const data = this.view.data;
    this.install.updateState({error: null});
    return AccountManager.login(data)
    .then(resp => Promise.all([
      Promise.resolve(resp.statusCode),
      handleResponseData(resp),
      Promise.resolve(parseSetCookies(resp.headers['set-cookie'])),
    ]))
    .then(([status, raw, cookies]) => {
      switch (status) {
        case 200:
          return {
            account: {
              sessionId: findCookie(cookies, 'kite-session').Value,
            },
          };
        case 500:
          throw new Error('Server error during log in');
        default:
          throw new Error(`Unable to login: ${JSON.parse(raw).message}`);
      }
    });
  }
};