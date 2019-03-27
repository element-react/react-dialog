/*!
 * dialog.js v0.0.1
 * (c) 2019-2019 jianxcao@126.com
 * Released under the MIT License.
 */
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('react')) :
    typeof define === 'function' && define.amd ? define(['react'], factory) :
    (global = global || self, global.dialog = factory(global.React));
}(this, function (React) { 'use strict';

    React = React && React.hasOwnProperty('default') ? React['default'] : React;

    var defaultOpt = {
      startIndex: 999
    };

    var DialogManager = function DialogManager () {
      this.startIndex = defaultOpt.startIndex;
      this.id = 1;
      this._cache = [];
    };

    var prototypeAccessors = { cache: { configurable: true } };
    prototypeAccessors.cache.get = function () {

    };
    DialogManager.prototype.addCache = function addCache () {

    };
    DialogManager.prototype.removeCache = function removeCache (id) {
      id = id.replace(/^dialog([0-9]+)$/, '$1');
    };
    DialogManager.prototype.getIndex = function getIndex () {
      return this.startIndex;
    };

    Object.defineProperties( DialogManager.prototype, prototypeAccessors );

    var dialogManager = new DialogManager();

    var Dialog = /*@__PURE__*/(function (superclass) {
      function Dialog () {
        superclass.apply(this, arguments);
      }

      if ( superclass ) Dialog.__proto__ = superclass;
      Dialog.prototype = Object.create( superclass && superclass.prototype );
      Dialog.prototype.constructor = Dialog;

      var prototypeAccessors = { dialogManager: { configurable: true } };

      prototypeAccessors.dialogManager.get = function () {
        return dialogManager;
      };

      Object.defineProperties( Dialog.prototype, prototypeAccessors );

      return Dialog;
    }(React.PureComponent));

    return Dialog;

}));
//# sourceMappingURL=dialog.js.map
