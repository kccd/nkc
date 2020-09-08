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
        forumCategories: [],
        subscribeForumsId: [],
        selectedForumCategory: '',
        selectedParentForum: '',
        selectedForum: '',
        selectedThreadType: '',
        showThreadTypes: false
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
        },
        subscribeForums: function subscribeForums() {
          var forums = this.forums,
              subscribeForumsId = this.subscribeForumsId;
          if (!subscribeForumsId.length) return [];
          var results = [];

          var _iterator3 = _createForOfIteratorHelper(forums),
              _step3;

          try {
            for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
              var f = _step3.value;

              var _iterator4 = _createForOfIteratorHelper(f.childForums),
                  _step4;

              try {
                for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
                  var cf = _step4.value;
                  if (!subscribeForumsId.includes(cf.fid)) continue;
                  results.push(cf);
                }
              } catch (err) {
                _iterator4.e(err);
              } finally {
                _iterator4.f();
              }
            }
          } catch (err) {
            _iterator3.e(err);
          } finally {
            _iterator3.f();
          }

          return results;
        }
      },
      mounted: function mounted() {},
      methods: {
        getUrl: NKC.methods.tools.getUrl,
        open: function open() {
          this.resetSelector();
          self.showPanel();
          nkcAPI('/f?t=selector', 'GET').then(function (data) {
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
          this.selectedForum = '';
          this.selectedParentForum = '';
          this.selectedThreadType = '';
        },
        initForums: function initForums(data) {
          var forumCategories = data.forumCategories,
              forums = data.forums,
              subscribeForumsId = data.subscribeForumsId;
          var forumsObj = [];

          var _iterator5 = _createForOfIteratorHelper(forums),
              _step5;

          try {
            for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
              var f = _step5.value;
              if (!forumsObj[f.categoryId]) forumsObj[f.categoryId] = [];
              forumsObj[f.categoryId].push(f);
            }
          } catch (err) {
            _iterator5.e(err);
          } finally {
            _iterator5.f();
          }

          var _iterator6 = _createForOfIteratorHelper(forumCategories),
              _step6;

          try {
            for (_iterator6.s(); !(_step6 = _iterator6.n()).done;) {
              var c = _step6.value;
              c.forums = forumsObj[c._id] || [];
            }
          } catch (err) {
            _iterator6.e(err);
          } finally {
            _iterator6.f();
          }

          this.forums = forums;
          this.forumCategories = forumCategories;
          this.subscribeForumsId = subscribeForumsId;
          this.selectedForumCategory = forumCategories[0];
        },
        selectParentForum: function selectParentForum(pf) {
          this.selectedParentForum = pf;
          this.selectedForum = '';
          this.selectedThreadType = '';

          if (this.selectedParentForum.childForums.length === 1) {
            this.selectForum(this.selectedParentForum.childForums[0]);
          } else if (this.selectedParentForum.childForums.length === 0) {
            this.selectForum(this.selectedParentForum);
          }
        },
        selectForum: function selectForum(f) {
          this.selectedThreadType = '';

          if (this.selectedForum === f) {
            this.selectedForum = '';
          } else {
            this.selectedForum = f;

            if (f.threadTypes.length === 0) {
              this.selectThreadType('none');
            }
          }
        },
        selectThreadType: function selectThreadType(tt) {
          if (this.selectedThreadType === tt) {
            this.selectedThreadType = '';
          } else {
            this.selectedThreadType = tt;
          }
        },
        next: function next() {
          this.showThreadTypes = true;
        },
        previous: function previous() {
          this.showThreadTypes = false;
          this.selectedThreadType = '';
        },
        resetSelector: function resetSelector() {
          this.selectedForum = '';
          this.selectedParentForum = '';
          this.selectedThreadType = '';
          this.showThreadTypes = false;
        },
        submit: function submit() {}
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwYWdlcy9wdWJsaWNNb2R1bGVzL2ZvcnVtU2VsZWN0b3IvZm9ydW1TZWxlY3Rvci5tanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUNBTSxhOzs7OztBQUNKLDJCQUFjO0FBQUE7O0FBQUE7O0FBQ1osUUFBTSxLQUFLLHlCQUFYO0FBQ0EsOEJBQU0sS0FBTjs7QUFDQSxRQUFNLElBQUksZ0NBQVY7O0FBQ0EsSUFBQSxJQUFJLENBQUMsR0FBTCxHQUFXLENBQUMsQ0FBQyxLQUFELENBQVo7QUFDQSxJQUFBLElBQUksQ0FBQyxHQUFMLEdBQVcsSUFBSSxHQUFKLENBQVE7QUFDakIsTUFBQSxFQUFFLEVBQUUsS0FBSyxHQUFHLEtBREs7QUFFakIsTUFBQSxJQUFJLEVBQUU7QUFDSixRQUFBLE9BQU8sRUFBRSxJQURMO0FBRUo7QUFDQSxRQUFBLE1BQU0sRUFBRSxFQUhKO0FBSUosUUFBQSxlQUFlLEVBQUUsRUFKYjtBQUtKLFFBQUEsaUJBQWlCLEVBQUUsRUFMZjtBQU1KLFFBQUEscUJBQXFCLEVBQUUsRUFObkI7QUFPSixRQUFBLG1CQUFtQixFQUFFLEVBUGpCO0FBUUosUUFBQSxhQUFhLEVBQUUsRUFSWDtBQVNKLFFBQUEsa0JBQWtCLEVBQUUsRUFUaEI7QUFXSixRQUFBLGVBQWUsRUFBRTtBQVhiLE9BRlc7QUFlakIsTUFBQSxRQUFRLEVBQUU7QUFDUixRQUFBLFNBRFEsdUJBQ0k7QUFBQSxjQUNILGVBREcsR0FDd0IsSUFEeEIsQ0FDSCxlQURHO0FBQUEsY0FDYyxNQURkLEdBQ3dCLElBRHhCLENBQ2MsTUFEZDtBQUVWLGNBQU0sT0FBTyxHQUFHLEVBQWhCO0FBQ0EsY0FBTSxTQUFTLEdBQUcsRUFBbEI7O0FBSFUscURBSUssTUFKTDtBQUFBOztBQUFBO0FBSVYsZ0VBQXVCO0FBQUEsa0JBQWIsQ0FBYTtBQUNwQixr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QVosR0FBNEIsYUFBNUIiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJjbGFzcyBGb3J1bVNlbGVjdG9yIGV4dGVuZHMgTktDLm1vZHVsZXMuRHJhZ2dhYmxlUGFuZWwge1xyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgY29uc3QgZG9tSWQgPSBgI21vZHVsZUZvcnVtU2VsZWN0b3JgO1xyXG4gICAgc3VwZXIoZG9tSWQpO1xyXG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XHJcbiAgICBzZWxmLmRvbSA9ICQoZG9tSWQpO1xyXG4gICAgc2VsZi5hcHAgPSBuZXcgVnVlKHtcclxuICAgICAgZWw6IGRvbUlkICsgJ0FwcCcsXHJcbiAgICAgIGRhdGE6IHtcclxuICAgICAgICBsb2FkaW5nOiB0cnVlLFxyXG4gICAgICAgIC8vIOS4k+S4muaVsOe7hFxyXG4gICAgICAgIGZvcnVtczogW10sXHJcbiAgICAgICAgZm9ydW1DYXRlZ29yaWVzOiBbXSxcclxuICAgICAgICBzdWJzY3JpYmVGb3J1bXNJZDogW10sXHJcbiAgICAgICAgc2VsZWN0ZWRGb3J1bUNhdGVnb3J5OiAnJyxcclxuICAgICAgICBzZWxlY3RlZFBhcmVudEZvcnVtOiAnJyxcclxuICAgICAgICBzZWxlY3RlZEZvcnVtOiAnJyxcclxuICAgICAgICBzZWxlY3RlZFRocmVhZFR5cGU6ICcnLFxyXG5cclxuICAgICAgICBzaG93VGhyZWFkVHlwZXM6IGZhbHNlLFxyXG4gICAgICB9LFxyXG4gICAgICBjb21wdXRlZDoge1xyXG4gICAgICAgIGZvcnVtRGF0YSgpIHtcclxuICAgICAgICAgIGNvbnN0IHtmb3J1bUNhdGVnb3JpZXMsIGZvcnVtc30gPSB0aGlzO1xyXG4gICAgICAgICAgY29uc3QgcmVzdWx0cyA9IFtdO1xyXG4gICAgICAgICAgY29uc3QgZm9ydW1zT2JqID0gW107XHJcbiAgICAgICAgICBmb3IoY29uc3QgZiBvZiBmb3J1bXMpIHtcclxuICAgICAgICAgICAgIGlmKCFmb3J1bXNPYmpbZi5jYXRlZ29yeUlkXSkgZm9ydW1zT2JqW2YuY2F0ZWdvcnlJZF0gPSBbXTtcclxuICAgICAgICAgICAgZm9ydW1zT2JqW2YuY2F0ZWdvcnlJZF0ucHVzaChmKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGZvcihjb25zdCBjIG9mIGZvcnVtQ2F0ZWdvcmllcykge1xyXG4gICAgICAgICAgICBjb25zdCBmID0gZm9ydW1zT2JqW2MuX2lkXTtcclxuICAgICAgICAgICAgaWYoIWYpIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICBjLmZvcnVtcyA9IGY7XHJcbiAgICAgICAgICAgIHJlc3VsdHMucHVzaChjKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHJldHVybiByZXN1bHRzO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc3Vic2NyaWJlRm9ydW1zKCkge1xyXG4gICAgICAgICAgY29uc3Qge2ZvcnVtcywgc3Vic2NyaWJlRm9ydW1zSWR9ID0gdGhpcztcclxuICAgICAgICAgIGlmKCFzdWJzY3JpYmVGb3J1bXNJZC5sZW5ndGgpIHJldHVybiBbXTtcclxuICAgICAgICAgIGNvbnN0IHJlc3VsdHMgPSBbXTtcclxuICAgICAgICAgIGZvcihjb25zdCBmIG9mIGZvcnVtcykge1xyXG4gICAgICAgICAgICBmb3IoY29uc3QgY2Ygb2YgZi5jaGlsZEZvcnVtcykge1xyXG4gICAgICAgICAgICAgIGlmKCFzdWJzY3JpYmVGb3J1bXNJZC5pbmNsdWRlcyhjZi5maWQpKSBjb250aW51ZTtcclxuICAgICAgICAgICAgICByZXN1bHRzLnB1c2goY2YpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICByZXR1cm4gcmVzdWx0cztcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIG1vdW50ZWQoKSB7XHJcblxyXG4gICAgICB9LFxyXG4gICAgICBtZXRob2RzOiB7XHJcbiAgICAgICAgZ2V0VXJsOiBOS0MubWV0aG9kcy50b29scy5nZXRVcmwsXHJcbiAgICAgICAgb3BlbigpIHtcclxuICAgICAgICAgIHRoaXMucmVzZXRTZWxlY3RvcigpO1xyXG4gICAgICAgICAgc2VsZi5zaG93UGFuZWwoKTtcclxuICAgICAgICAgIG5rY0FQSSgnL2Y/dD1zZWxlY3RvcicsICdHRVQnKVxyXG4gICAgICAgICAgICAudGhlbihkYXRhID0+IHtcclxuICAgICAgICAgICAgICBzZWxmLmFwcC5sb2FkaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgc2VsZi5hcHAuaW5pdEZvcnVtcyhkYXRhKTtcclxuICAgICAgICAgICAgICBjb25zb2xlLmxvZyhkYXRhKTtcclxuICAgICAgICAgICAgfSlcclxuXHJcbiAgICAgICAgICAgIC8vIC5jYXRjaChzd2VldEVycm9yKVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgY2xvc2UoKSB7XHJcbiAgICAgICAgICBzZWxmLmhpZGVQYW5lbCgpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc2VsZWN0Rm9ydW1DYXRlZ29yeShjKSB7XHJcbiAgICAgICAgICB0aGlzLnNlbGVjdGVkRm9ydW1DYXRlZ29yeSA9IGM7XHJcbiAgICAgICAgICB0aGlzLnNlbGVjdGVkRm9ydW0gPSAnJztcclxuICAgICAgICAgIHRoaXMuc2VsZWN0ZWRQYXJlbnRGb3J1bSA9ICcnO1xyXG4gICAgICAgICAgdGhpcy5zZWxlY3RlZFRocmVhZFR5cGUgPSAnJztcclxuICAgICAgICB9LFxyXG4gICAgICAgIGluaXRGb3J1bXMoZGF0YSkge1xyXG4gICAgICAgICAgY29uc3Qge2ZvcnVtQ2F0ZWdvcmllcywgZm9ydW1zLCBzdWJzY3JpYmVGb3J1bXNJZH0gPSBkYXRhO1xyXG4gICAgICAgICAgY29uc3QgZm9ydW1zT2JqID0gW107XHJcbiAgICAgICAgICBmb3IoY29uc3QgZiBvZiBmb3J1bXMpIHtcclxuICAgICAgICAgICAgaWYoIWZvcnVtc09ialtmLmNhdGVnb3J5SWRdKSBmb3J1bXNPYmpbZi5jYXRlZ29yeUlkXSA9IFtdO1xyXG4gICAgICAgICAgICBmb3J1bXNPYmpbZi5jYXRlZ29yeUlkXS5wdXNoKGYpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgZm9yKGNvbnN0IGMgb2YgZm9ydW1DYXRlZ29yaWVzKSB7XHJcbiAgICAgICAgICAgIGMuZm9ydW1zID0gZm9ydW1zT2JqW2MuX2lkXSB8fCBbXTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHRoaXMuZm9ydW1zID0gZm9ydW1zO1xyXG4gICAgICAgICAgdGhpcy5mb3J1bUNhdGVnb3JpZXMgPSBmb3J1bUNhdGVnb3JpZXM7XHJcbiAgICAgICAgICB0aGlzLnN1YnNjcmliZUZvcnVtc0lkID0gc3Vic2NyaWJlRm9ydW1zSWQ7XHJcbiAgICAgICAgICB0aGlzLnNlbGVjdGVkRm9ydW1DYXRlZ29yeSA9IGZvcnVtQ2F0ZWdvcmllc1swXTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHNlbGVjdFBhcmVudEZvcnVtKHBmKSB7XHJcbiAgICAgICAgICB0aGlzLnNlbGVjdGVkUGFyZW50Rm9ydW0gPSBwZjtcclxuICAgICAgICAgIHRoaXMuc2VsZWN0ZWRGb3J1bSA9ICcnO1xyXG4gICAgICAgICAgdGhpcy5zZWxlY3RlZFRocmVhZFR5cGUgPSAnJztcclxuICAgICAgICAgIGlmKHRoaXMuc2VsZWN0ZWRQYXJlbnRGb3J1bS5jaGlsZEZvcnVtcy5sZW5ndGggPT09IDEpIHtcclxuICAgICAgICAgICAgdGhpcy5zZWxlY3RGb3J1bSh0aGlzLnNlbGVjdGVkUGFyZW50Rm9ydW0uY2hpbGRGb3J1bXNbMF0pO1xyXG4gICAgICAgICAgfSBlbHNlIGlmKHRoaXMuc2VsZWN0ZWRQYXJlbnRGb3J1bS5jaGlsZEZvcnVtcy5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgdGhpcy5zZWxlY3RGb3J1bSh0aGlzLnNlbGVjdGVkUGFyZW50Rm9ydW0pO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc2VsZWN0Rm9ydW0oZikge1xyXG4gICAgICAgICAgdGhpcy5zZWxlY3RlZFRocmVhZFR5cGUgPSAnJztcclxuICAgICAgICAgIGlmKHRoaXMuc2VsZWN0ZWRGb3J1bSA9PT0gZikge1xyXG4gICAgICAgICAgICB0aGlzLnNlbGVjdGVkRm9ydW0gPSAnJztcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRGb3J1bSA9IGY7XHJcbiAgICAgICAgICAgIGlmKGYudGhyZWFkVHlwZXMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgdGhpcy5zZWxlY3RUaHJlYWRUeXBlKCdub25lJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIHNlbGVjdFRocmVhZFR5cGUodHQpIHtcclxuICAgICAgICAgIGlmKHRoaXMuc2VsZWN0ZWRUaHJlYWRUeXBlID09PSB0dCkge1xyXG4gICAgICAgICAgICB0aGlzLnNlbGVjdGVkVGhyZWFkVHlwZSA9ICcnXHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLnNlbGVjdGVkVGhyZWFkVHlwZSA9IHR0O1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgbmV4dCgpIHtcclxuICAgICAgICAgIHRoaXMuc2hvd1RocmVhZFR5cGVzID0gdHJ1ZTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHByZXZpb3VzKCkge1xyXG4gICAgICAgICAgdGhpcy5zaG93VGhyZWFkVHlwZXMgPSBmYWxzZTtcclxuICAgICAgICAgIHRoaXMuc2VsZWN0ZWRUaHJlYWRUeXBlID0gJyc7XHJcbiAgICAgICAgfSxcclxuICAgICAgICByZXNldFNlbGVjdG9yKCkge1xyXG4gICAgICAgICAgdGhpcy5zZWxlY3RlZEZvcnVtID0gJyc7XHJcbiAgICAgICAgICB0aGlzLnNlbGVjdGVkUGFyZW50Rm9ydW0gPSAnJztcclxuICAgICAgICAgIHRoaXMuc2VsZWN0ZWRUaHJlYWRUeXBlID0gJyc7XHJcbiAgICAgICAgICB0aGlzLnNob3dUaHJlYWRUeXBlcyA9IGZhbHNlO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc3VibWl0KCkge1xyXG5cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0pXHJcbiAgfVxyXG4gIG9wZW4ocHJvcHMpIHtcclxuICAgIHRoaXMuYXBwLm9wZW4ocHJvcHMpO1xyXG4gIH1cclxufVxyXG5OS0MubW9kdWxlcy5Gb3J1bVNlbGVjdG9yID0gRm9ydW1TZWxlY3RvcjtcclxuIl19
