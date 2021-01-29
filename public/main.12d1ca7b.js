// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"E64j":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
 * CONST
 */
var ROW_CLASS = 'js-schedule-day';
var CELL_CLASS = 'js-schedule-cell';
var COLUMN_CLASS = 'js-schedule-hour';
var SELECTED_CLASS = '__selected';
var HOVERED_CLASS = '__hovered';
var WEEKDAY_ATTR = 'data-weekday';
var HOUR_ATTR = 'data-hour';
/**
 * @param {HTMLElement} root
 * @param {string} className
 * @returns {HTMLElement[]}
 */

function byClass(root, className) {
  if (root) {
    if (root.nodeType === 11) {
      // == Node.DOCUMENT_FRAGMENT_NODE
      var result = [];

      for (var df = 0; df < root.childNodes.length; df++) {
        var childNode = root.childNodes[df];

        if (childNode.getElementsByClassName) {
          result = result.concat(Array.prototype.slice.call(childNode.getElementsByClassName(className)));
        }
      }

      return result;
    }

    return Array.prototype.slice.call(root.getElementsByClassName(className));
  }

  return [];
}

var Schedule = /*#__PURE__*/function () {
  function Schedule(element) {
    var _this = this;

    _classCallCheck(this, Schedule);

    this._element = element;
    this.rows = byClass(element, ROW_CLASS);
    this.cells = byClass(element, CELL_CLASS);
    var weekdays = this.weekdays = [];
    this.rows.forEach(function (row) {
      weekdays.push(row.getAttribute(WEEKDAY_ATTR));
    });
    this.modelSelected = {};
    this.modelHovered = {};
    this.weekdays.forEach(function (weekday) {
      _this.modelSelected[weekday] = [];
      _this.modelHovered[weekday] = [];
    });
    this.boundOnMouseUp = this.onMouseUp.bind(this);
    window.addEventListener('mouseup', this.boundOnMouseUp);

    this._element.addEventListener('click', this, false);

    this._element.addEventListener('mousedown', this, false);

    this._element.addEventListener('mouseup', this, false);

    this._element.addEventListener('mouseover', this, false);

    this._element.addEventListener('mouseout', this, false);
  }

  _createClass(Schedule, [{
    key: "handleEvent",

    /**
     * @param {Event} event
     */
    value: function handleEvent(event) {
      switch (event.type) {
        case 'click':
          if (event.target.classList.contains(ROW_CLASS)) {
            this.onChooseRow(event);
          }

          if (event.target.classList.contains(COLUMN_CLASS)) {
            this.onChooseColumn(event);
          }

          break;

        case 'mousedown':
          if (event.target.classList.contains(CELL_CLASS)) {
            this.onMouseDown(event);
          }

          break;

        case 'mouseup':
          if (event.target.classList.contains(CELL_CLASS)) {
            this.onMouseUp(event);
          }

          break;

        case 'mouseover':
          if (event.target.classList.contains(CELL_CLASS)) {
            this.onHover(event);
          }

          if (event.target.classList.contains(ROW_CLASS)) {
            this.onHoveredRow(event, true);
          }

          if (event.target.classList.contains(COLUMN_CLASS)) {
            this.onHoveredColumn(event, true);
          }

          break;

        case 'mouseout':
          if (event.target.classList.contains(ROW_CLASS)) {
            this.onHoveredRow(event, false);
          }

          if (event.target.classList.contains(COLUMN_CLASS)) {
            this.onHoveredColumn(event, false);
          }

          break;
      }
    }
    /**
     * @param {Object} model
     */

  }, {
    key: "setDefaults",
    value: function setDefaults(model) {
      this.weekdays.forEach(function (weekday) {
        if (!model[weekday]) {
          model[weekday] = {};
        }
      });
    }
  }, {
    key: "render",

    /**
     *
     */
    value: function render() {
      var modelSelected = this.modelSelected;
      var modelHovered = this.modelHovered;
      var count = 0;
      this.cells.forEach(function (cell) {
        var weekday = cell.getAttribute(WEEKDAY_ATTR);
        var hour = cell.getAttribute(HOUR_ATTR);
        var selected = modelSelected[weekday][hour];
        var hovered = modelHovered[weekday][hour];

        if (selected) {
          count += 1;
        }

        cell.classList.toggle(SELECTED_CLASS, selected === true);
        cell.classList.toggle(HOVERED_CLASS, hovered === true);
      });
    }
  }, {
    key: "onChooseRow",

    /**
     * @param {Event} event
     */
    value: function onChooseRow(event) {
      var weekday = event.target.getAttribute(WEEKDAY_ATTR);
      var model = this.modelSelected;
      var hour,
          select = false;

      for (hour = 0; hour < 24; hour++) {
        if (!model[weekday][hour.toString()]) {
          select = true;
        }
      }

      for (hour = 0; hour < 24; hour++) {
        model[weekday][hour.toString()] = select;
      }

      this.render();
    }
  }, {
    key: "onChooseColumn",

    /**
     * @param {Event} event
     */
    value: function onChooseColumn(event) {
      var hour = event.target.getAttribute(HOUR_ATTR);
      var model = this.modelSelected;
      var select = false;
      this.weekdays.forEach(function (weekday) {
        if (!model[weekday][hour]) {
          select = true;
        }
      });
      this.weekdays.forEach(function (weekday) {
        model[weekday][hour] = select;
      });
      this.render();
    }
  }, {
    key: "onHoveredRow",

    /**
     * @param {Boolean} flag
     * @param {Event} event
     */
    value: function onHoveredRow(event, flag) {
      if (this.start || this.end) {
        return;
      }

      var weekday = event.target.getAttribute(WEEKDAY_ATTR);

      for (var hour = 0; hour < 24; hour++) {
        this.modelHovered[weekday][hour] = flag;
      }

      this.render();
    }
  }, {
    key: "onHoveredColumn",

    /**
     * @param {Event} event
     * @param {Boolean} flag
     */
    value: function onHoveredColumn(event, flag) {
      if (this.selection) {
        return;
      }

      var hour = event.target.getAttribute(HOUR_ATTR);
      var modelHovered = this.modelHovered;
      this.weekdays.forEach(function (weekday) {
        modelHovered[weekday][hour] = flag;
      });
      this.render();
    }
  }, {
    key: "onMouseDown",

    /**
     * @param {Event} event
     */
    value: function onMouseDown(event) {
      event.preventDefault();
      var weekday = event.target.getAttribute(WEEKDAY_ATTR);
      var hour = event.target.getAttribute(HOUR_ATTR);
      this.selection = {
        start: {
          weekday: weekday,
          hour: hour
        },
        end: {
          weekday: weekday,
          hour: hour
        }
      };
    }
  }, {
    key: "onMouseUp",

    /**
     *
     */
    value: function onMouseUp() {
      if (!this.selection) {
        return;
      }

      var modelSelected = this.modelSelected;
      var select = false;
      this.overRectangle(this.selection.start, this.selection.end, function (weekday, hour) {
        if (!modelSelected[weekday][hour]) {
          select = true;
        }
      });
      this.overRectangle(this.selection.start, this.selection.end, function (weekday, hour) {
        modelSelected[weekday][hour] = select;
      });
      this.modelHovered = {};
      this.setDefaults(this.modelHovered);
      this.selection = null;
      this.render();
    }
  }, {
    key: "onHover",

    /**
     * @param {Event} event
     */
    value: function onHover(event) {
      var weekday = event.target.getAttribute(WEEKDAY_ATTR);
      var hour = event.target.getAttribute(HOUR_ATTR);

      if (!this.selection) {
        return;
      }

      this.selection.end = {
        weekday: weekday,
        hour: hour
      };
      var modelHovered = this.modelHovered = {};
      this.setDefaults(this.modelHovered);
      this.overRectangle(this.selection.start, this.selection.end, function (weekday, hour) {
        modelHovered[weekday][hour] = true;
      });
      this.render();
    }
  }, {
    key: "overRectangle",

    /**
     * @param {Object} start
     * @param {Object} end
     * @param {Function} fn
     */
    value: function overRectangle(start, end, fn) {
      var firsWeekdayIndex = this.weekdays.indexOf(start.weekday);
      var lastWeekdayIndex = this.weekdays.indexOf(end.weekday);
      var startWeekdayIndex = Math.min(firsWeekdayIndex, lastWeekdayIndex);
      var endWeekdayIndex = Math.max(firsWeekdayIndex, lastWeekdayIndex);
      var startHour = Math.min(end.hour, parseInt(start.hour));
      var endHour = Math.max(end.hour, parseInt(start.hour));

      for (var weekdayIndex = startWeekdayIndex; weekdayIndex <= endWeekdayIndex; weekdayIndex++) {
        var weekday = this.weekdays[weekdayIndex];

        for (var hour = startHour; hour <= endHour; hour++) {
          fn(weekday, hour);
        }
      }
    }
  }, {
    key: "destroy",
    value: function destroy() {
      window.removeEventListener('mouseup', this.boundOnMouseUp);

      this._element.removeEventListener('click', this, false);

      this._element.removeEventListener('mousedown', this, false);

      this._element.removeEventListener('mouseup', this, false);

      this._element.removeEventListener('mouseover', this, false);

      this._element.removeEventListener('mouseout', this, false);
    }
  }]);

  return Schedule;
}();

exports.default = Schedule;
},{}],"epB2":[function(require,module,exports) {
"use strict";

var _schedule = _interopRequireDefault(require("./schedule.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var element = document.getElementById('schedule');
var schedule = new _schedule.default(element);
},{"./schedule.js":"E64j"}]},{},["epB2"], null)
//# sourceMappingURL=/main.12d1ca7b.js.map