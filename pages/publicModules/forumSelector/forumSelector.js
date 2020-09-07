(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

var ForumSelector = /*#__PURE__*/function (_NKC$modules$Draggabl) {
  _inherits(ForumSelector, _NKC$modules$Draggabl);

  var _super = _createSuper(ForumSelector);

  function ForumSelector() {
    var _this;

    _classCallCheck(this, ForumSelector);

    var domId = "#moduleForumSelector";
    _this = _super.call(this, domId);

    var self = _assertThisInitialized(_this);

    self.dom = $(domId);
    self.app = new Vue({
      el: domId + 'App',
      data: {
        loading: true,
        // 专业数组
        forums: [],
        // 专业树状结构
        forumTree: [],
        forumCategories: [],
        selectedForumCategory: ''
      },
      computed: {
        forumData: function forumData() {
          var forumCategories = this.forumCategories,
              forums = this.forums;
          var results = [];
          var forumsObj = [];

          var _iterator = _createForOfIteratorHelper(forums),
              _step;

          try {
            for (_iterator.s(); !(_step = _iterator.n()).done;) {
              var f = _step.value;
              if (!forumsObj[f.categoryId]) forumsObj[f.categoryId] = [];
              forumsObj[f.categoryId].push(f);
            }
          } catch (err) {
            _iterator.e(err);
          } finally {
            _iterator.f();
          }

          var _iterator2 = _createForOfIteratorHelper(forumCategories),
              _step2;

          try {
            for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
              var c = _step2.value;
              var _f = forumsObj[c._id];
              if (!_f) continue;
              c.forums = _f;
              results.push(c);
            }
          } catch (err) {
            _iterator2.e(err);
          } finally {
            _iterator2.f();
          }

          return results;
        }
      },
      mounted: function mounted() {},
      methods: {
        open: function open() {
          self.showPanel();
          nkcAPI('/f', 'GET').then(function (data) {
            self.app.loading = false;
            self.app.initForums(data);
            console.log(data);
          }); // .catch(sweetError)
        },
        close: function close() {
          self.hidePanel();
        },
        selectForumCategory: function selectForumCategory(c) {
          this.selectedForumCategory = c;
        },
        initForums: function initForums(data) {
          var forumCategories = data.forumCategories,
              forums = data.forums;
          var forumsObj = [];

          var _iterator3 = _createForOfIteratorHelper(forums),
              _step3;

          try {
            for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
              var f = _step3.value;
              if (!forumsObj[f.categoryId]) forumsObj[f.categoryId] = [];
              forumsObj[f.categoryId].push(f);
              var cf = [];
              this.getForumChildForums(cf, f.childrenForums);
              f.cf = cf;
            }
          } catch (err) {
            _iterator3.e(err);
          } finally {
            _iterator3.f();
          }

          var _iterator4 = _createForOfIteratorHelper(forumCategories),
              _step4;

          try {
            for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
              var c = _step4.value;
              c.forums = forumsObj[c._id] || [];
            }
          } catch (err) {
            _iterator4.e(err);
          } finally {
            _iterator4.f();
          }

          this.forums = forums;
          this.forumCategories = forumCategories;
          this.selectedForumCategory = forumCategories[0];
        },
        getForumChildForums: function getForumChildForums(results, arr) {
          var _iterator5 = _createForOfIteratorHelper(arr),
              _step5;

          try {
            for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
              var ff = _step5.value;

              if (!ff.childrenForums || ff.childrenForums.length === 0) {
                results.push(ff);
              } else {
                this.getForumChildForums(results, ff.childrenForums);
              }
            }
          } catch (err) {
            _iterator5.e(err);
          } finally {
            _iterator5.f();
          }
        }
      }
    });
    return _this;
  }

  _createClass(ForumSelector, [{
    key: "open",
    value: function open(props) {
      this.app.open(props);
    }
  }]);

  return ForumSelector;
}(NKC.modules.DraggablePanel);

NKC.modules.ForumSelector = ForumSelector;

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwYWdlcy9wdWJsaWNNb2R1bGVzL2ZvcnVtU2VsZWN0b3IvZm9ydW1TZWxlY3Rvci5tanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUNBTSxhOzs7OztBQUNKLDJCQUFjO0FBQUE7O0FBQUE7O0FBQ1osUUFBTSxLQUFLLHlCQUFYO0FBQ0EsOEJBQU0sS0FBTjs7QUFDQSxRQUFNLElBQUksZ0NBQVY7O0FBQ0EsSUFBQSxJQUFJLENBQUMsR0FBTCxHQUFXLENBQUMsQ0FBQyxLQUFELENBQVo7QUFDQSxJQUFBLElBQUksQ0FBQyxHQUFMLEdBQVcsSUFBSSxHQUFKLENBQVE7QUFDakIsTUFBQSxFQUFFLEVBQUUsS0FBSyxHQUFHLEtBREs7QUFFakIsTUFBQSxJQUFJLEVBQUU7QUFDSixRQUFBLE9BQU8sRUFBRSxJQURMO0FBRUo7QUFDQSxRQUFBLE1BQU0sRUFBRSxFQUhKO0FBSUo7QUFDQSxRQUFBLFNBQVMsRUFBRSxFQUxQO0FBTUosUUFBQSxlQUFlLEVBQUUsRUFOYjtBQU9KLFFBQUEscUJBQXFCLEVBQUU7QUFQbkIsT0FGVztBQVdqQixNQUFBLFFBQVEsRUFBRTtBQUNSLFFBQUEsU0FEUSx1QkFDSTtBQUFBLGNBQ0gsZUFERyxHQUN3QixJQUR4QixDQUNILGVBREc7QUFBQSxjQUNjLE1BRGQsR0FDd0IsSUFEeEIsQ0FDYyxNQURkO0FBRVYsY0FBTSxPQUFPLEdBQUcsRUFBaEI7QUFDQSxjQUFNLFNBQVMsR0FBRyxFQUFsQjs7QUFIVSxxREFJSyxNQUpMO0FBQUE7O0FBQUE7QUFJVixnRUFBdUI7QUFBQSxrQkFBYixDQUFhO0FBQ3BCLGtCQUFHLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxVQUFILENBQWIsRUFBNkIsU0FBUyxDQUFDLENBQUMsQ0FBQyxVQUFILENBQVQsR0FBMEIsRUFBMUI7QUFDOUIsY0FBQSxTQUFT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YSxFQUFiO0FBQ0QsZUFGRCxNQUVPO0FBQ0wscUJBQUssbUJBQUwsQ0FBeUIsT0FBekIsRUFBa0MsRUFBRSxDQUFDLGNBQXJDO0FBQ0Q7QUFDRjtBQVArQjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBUWpDO0FBMUNNO0FBaENRLEtBQVIsQ0FBWDtBQUxZO0FBa0ZiOzs7O3lCQUNJLEssRUFBTztBQUNWLFdBQUssR0FBTCxDQUFTLElBQVQsQ0FBYyxLQUFkO0FBQ0Q7Ozs7RUF0RnlCLEdBQUcsQ0FBQyxPQUFKLENBQVksYzs7QUF3RnhDLEdBQUcsQ0FBQyxPQUFKLENBQVksYUFBWixHQUE0QixhQUE1QiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsImNsYXNzIEZvcnVtU2VsZWN0b3IgZXh0ZW5kcyBOS0MubW9kdWxlcy5EcmFnZ2FibGVQYW5lbCB7XHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICBjb25zdCBkb21JZCA9IGAjbW9kdWxlRm9ydW1TZWxlY3RvcmA7XHJcbiAgICBzdXBlcihkb21JZCk7XHJcbiAgICBjb25zdCBzZWxmID0gdGhpcztcclxuICAgIHNlbGYuZG9tID0gJChkb21JZCk7XHJcbiAgICBzZWxmLmFwcCA9IG5ldyBWdWUoe1xyXG4gICAgICBlbDogZG9tSWQgKyAnQXBwJyxcclxuICAgICAgZGF0YToge1xyXG4gICAgICAgIGxvYWRpbmc6IHRydWUsXHJcbiAgICAgICAgLy8g5LiT5Lia5pWw57uEXHJcbiAgICAgICAgZm9ydW1zOiBbXSxcclxuICAgICAgICAvLyDkuJPkuJrmoJHnirbnu5PmnoRcclxuICAgICAgICBmb3J1bVRyZWU6IFtdLFxyXG4gICAgICAgIGZvcnVtQ2F0ZWdvcmllczogW10sXHJcbiAgICAgICAgc2VsZWN0ZWRGb3J1bUNhdGVnb3J5OiAnJ1xyXG4gICAgICB9LFxyXG4gICAgICBjb21wdXRlZDoge1xyXG4gICAgICAgIGZvcnVtRGF0YSgpIHtcclxuICAgICAgICAgIGNvbnN0IHtmb3J1bUNhdGVnb3JpZXMsIGZvcnVtc30gPSB0aGlzO1xyXG4gICAgICAgICAgY29uc3QgcmVzdWx0cyA9IFtdO1xyXG4gICAgICAgICAgY29uc3QgZm9ydW1zT2JqID0gW107XHJcbiAgICAgICAgICBmb3IoY29uc3QgZiBvZiBmb3J1bXMpIHtcclxuICAgICAgICAgICAgIGlmKCFmb3J1bXNPYmpbZi5jYXRlZ29yeUlkXSkgZm9ydW1zT2JqW2YuY2F0ZWdvcnlJZF0gPSBbXTtcclxuICAgICAgICAgICAgZm9ydW1zT2JqW2YuY2F0ZWdvcnlJZF0ucHVzaChmKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGZvcihjb25zdCBjIG9mIGZvcnVtQ2F0ZWdvcmllcykge1xyXG4gICAgICAgICAgICBjb25zdCBmID0gZm9ydW1zT2JqW2MuX2lkXTtcclxuICAgICAgICAgICAgaWYoIWYpIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICBjLmZvcnVtcyA9IGY7XHJcbiAgICAgICAgICAgIHJlc3VsdHMucHVzaChjKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHJldHVybiByZXN1bHRzO1xyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAgbW91bnRlZCgpIHtcclxuXHJcbiAgICAgIH0sXHJcbiAgICAgIG1ldGhvZHM6IHtcclxuICAgICAgICBvcGVuKCkge1xyXG4gICAgICAgICAgc2VsZi5zaG93UGFuZWwoKTtcclxuICAgICAgICAgIG5rY0FQSSgnL2YnLCAnR0VUJylcclxuICAgICAgICAgICAgLnRoZW4oZGF0YSA9PiB7XHJcbiAgICAgICAgICAgICAgc2VsZi5hcHAubG9hZGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgIHNlbGYuYXBwLmluaXRGb3J1bXMoZGF0YSk7XHJcbiAgICAgICAgICAgICAgY29uc29sZS5sb2coZGF0YSk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC8vIC5jYXRjaChzd2VldEVycm9yKVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgY2xvc2UoKSB7XHJcbiAgICAgICAgICBzZWxmLmhpZGVQYW5lbCgpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc2VsZWN0Rm9ydW1DYXRlZ29yeShjKSB7XHJcbiAgICAgICAgICB0aGlzLnNlbGVjdGVkRm9ydW1DYXRlZ29yeSA9IGM7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBpbml0Rm9ydW1zKGRhdGEpIHtcclxuICAgICAgICAgIGNvbnN0IHtmb3J1bUNhdGVnb3JpZXMsIGZvcnVtc30gPSBkYXRhO1xyXG4gICAgICAgICAgY29uc3QgZm9ydW1zT2JqID0gW107XHJcbiAgICAgICAgICBmb3IoY29uc3QgZiBvZiBmb3J1bXMpIHtcclxuICAgICAgICAgICAgaWYoIWZvcnVtc09ialtmLmNhdGVnb3J5SWRdKSBmb3J1bXNPYmpbZi5jYXRlZ29yeUlkXSA9IFtdO1xyXG4gICAgICAgICAgICBmb3J1bXNPYmpbZi5jYXRlZ29yeUlkXS5wdXNoKGYpO1xyXG4gICAgICAgICAgICBjb25zdCBjZiA9IFtdO1xyXG4gICAgICAgICAgICB0aGlzLmdldEZvcnVtQ2hpbGRGb3J1bXMoY2YsIGYuY2hpbGRyZW5Gb3J1bXMpO1xyXG4gICAgICAgICAgICBmLmNmID0gY2Y7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBmb3IoY29uc3QgYyBvZiBmb3J1bUNhdGVnb3JpZXMpIHtcclxuICAgICAgICAgICAgYy5mb3J1bXMgPSBmb3J1bXNPYmpbYy5faWRdIHx8IFtdO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgdGhpcy5mb3J1bXMgPSBmb3J1bXM7XHJcbiAgICAgICAgICB0aGlzLmZvcnVtQ2F0ZWdvcmllcyA9IGZvcnVtQ2F0ZWdvcmllcztcclxuICAgICAgICAgIHRoaXMuc2VsZWN0ZWRGb3J1bUNhdGVnb3J5ID0gZm9ydW1DYXRlZ29yaWVzWzBdO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2V0Rm9ydW1DaGlsZEZvcnVtcyhyZXN1bHRzLCBhcnIpIHtcclxuICAgICAgICAgIGZvcihjb25zdCBmZiBvZiBhcnIpIHtcclxuICAgICAgICAgICAgaWYoIWZmLmNoaWxkcmVuRm9ydW1zIHx8IGZmLmNoaWxkcmVuRm9ydW1zLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgIHJlc3VsdHMucHVzaChmZik7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgdGhpcy5nZXRGb3J1bUNoaWxkRm9ydW1zKHJlc3VsdHMsIGZmLmNoaWxkcmVuRm9ydW1zKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSlcclxuICB9XHJcbiAgb3Blbihwcm9wcykge1xyXG4gICAgdGhpcy5hcHAub3Blbihwcm9wcyk7XHJcbiAgfVxyXG59XHJcbk5LQy5tb2R1bGVzLkZvcnVtU2VsZWN0b3IgPSBGb3J1bVNlbGVjdG9yO1xyXG4iXX0=
