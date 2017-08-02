'use strict';

// const {Emitter, CompositeDisposable} = require('atom');
// const {addDisposableEventListener} = require('../../atom-helper');
const Install = require('../../install');

class InstallElement extends HTMLElement {
  static initClass() {
    const elementClass = document.registerElement('kite-atom-install', {
      prototype: this.prototype,
    });
    atom.views.addViewProvider(Install, model => {
      const element = new elementClass();
      element.setModel(model);
      return element;
    });
    return elementClass;
  }

  createdCallback() {
    this.classList.add('native-key-bindings');
  }

  detachedCallback() {
    this.subscription && this.subscription.dispose();
    delete this.install;
    delete this.subscription;
  }

  setModel(install) {
    this.install = install;

    this.subscription = this.install.onDidChangeCurrentStep(() => {
      this.updateView();
    });
  }

  getModel() {
    return this.install;
  }

  updateView() {
    const view = this.install.getCurrentStepView();
    if (view) {
      if (this.children.length) {
        [].slice.call(this.children).forEach(n => this.removeChild(n));
      }
      this.appendChild(view);
      view.setInstall(this.install);
    }
  }
}

module.exports = InstallElement.initClass();