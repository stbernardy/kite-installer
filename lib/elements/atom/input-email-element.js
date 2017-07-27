'use strict';

const {Emitter, CompositeDisposable} = require('atom');
const {addDisposableEventListener} = require('../../atom-helper');

class InputEmailElement extends HTMLElement {
  static initClass() {
    return document.registerElement('kite-atom-input-email', {
      prototype: this.prototype,
    });
  }

  get data() { return {email: this.input.value}; }

  createdCallback() {
    this.emitter = new Emitter();
    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(this.emitter);

    this.innerHTML = `
    <div>
      <p>Great! While Kite is installing, sign in with your email address.</p>
    </div>

    <form>
      <input name="email" type="email" required></input>
      <button class="btn btn-primary btn-block">Continue</button>
      <div class="status hidden"></div>
    </form>

    `;

    this.form = this.querySelector('form');
    this.input = this.querySelector('input');
    this.submit = this.querySelector('button');
    this.status = this.querySelector('.status');

    this.subscriptions.add(addDisposableEventListener(this.form, 'submit', () => {
      this.hideError();
      this.emitter.emit('did-submit');
    }));
  }

  onDidSubmit(listener) {
    this.emitter.on('did-submit', listener);
  }

  setEmail(email) {
    this.input.value = email || '';
  }

  hideError() {
    this.status.textContent = '';
    this.status.classList.add('hidden');
  }

  setError(err) {
    if (err) {
      this.status.textContent = err.message;
      this.status.classList.remove('hidden');
    } else {
      this.hideError();
    }
  }
}

module.exports = InputEmailElement.initClass();
