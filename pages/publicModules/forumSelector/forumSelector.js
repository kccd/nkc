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
        selectedForumsId: [],
        disabledForumsId: [],
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
        },
        forumsObj: function forumsObj() {
          var forums = this.forums;
          var obj = {};

          var _iterator5 = _createForOfIteratorHelper(forums),
              _step5;

          try {
            for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
              var f = _step5.value;
              obj[f.fid] = f;

              var _iterator6 = _createForOfIteratorHelper(f.childForums),
                  _step6;

              try {
                for (_iterator6.s(); !(_step6 = _iterator6.n()).done;) {
                  var ff = _step6.value;
                  obj[ff.fid] = ff;
                }
              } catch (err) {
                _iterator6.e(err);
              } finally {
                _iterator6.f();
              }
            }
          } catch (err) {
            _iterator5.e(err);
          } finally {
            _iterator5.f();
          }

          return obj;
        },
        disabledForumCategoriesId: function disabledForumCategoriesId() {
          var selectedForumsId = this.selectedForumsId,
              forumsObj = this.forumsObj,
              forumCategoriesId = this.forumCategoriesId,
              forumCategoriesObj = this.forumCategoriesObj;
          var arr = [];
          var excludedForumCategoriesId = [];

          var _iterator7 = _createForOfIteratorHelper(selectedForumsId),
              _step7;

          try {
            for (_iterator7.s(); !(_step7 = _iterator7.n()).done;) {
              var fid = _step7.value;
              var forum = forumsObj[fid];
              if (!forum) continue;
              var index = arr.indexOf(forum.categoryId);
              if (index !== -1) continue;
              var category = forumCategoriesObj[forum.categoryId];
              if (!category) continue;
              var excludedCategoriesId = category.excludedCategoriesId;
              excludedForumCategoriesId = excludedForumCategoriesId.concat(excludedCategoriesId);
            }
          } catch (err) {
            _iterator7.e(err);
          } finally {
            _iterator7.f();
          }

          arr = [];

          var _iterator8 = _createForOfIteratorHelper(excludedForumCategoriesId),
              _step8;

          try {
            for (_iterator8.s(); !(_step8 = _iterator8.n()).done;) {
              var cid = _step8.value;
              if (arr.includes(cid)) continue;
              arr.push(cid);
            }
          } catch (err) {
            _iterator8.e(err);
          } finally {
            _iterator8.f();
          }

          return arr;
        },
        disabledAllForumsId: function disabledAllForumsId() {
          return this.disabledForumsId.concat(this.selectedForumsId);
        },
        forumCategoriesId: function forumCategoriesId() {
          return this.forumCategories.map(function (fc) {
            return fc._id;
          });
        },
        forumCategoriesObj: function forumCategoriesObj() {
          var forumCategories = this.forumCategories;
          var obj = {};

          var _iterator9 = _createForOfIteratorHelper(forumCategories),
              _step9;

          try {
            for (_iterator9.s(); !(_step9 = _iterator9.n()).done;) {
              var fc = _step9.value;
              obj[fc._id] = fc;
            }
          } catch (err) {
            _iterator9.e(err);
          } finally {
            _iterator9.f();
          }

          return obj;
        }
      },
      mounted: function mounted() {},
      methods: {
        getUrl: NKC.methods.tools.getUrl,
        open: function open(callback) {
          var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
          self.callback = callback;
          var _options$disabledForu = options.disabledForumsId,
              disabledForumsId = _options$disabledForu === void 0 ? [] : _options$disabledForu,
              _options$selectedForu = options.selectedForumsId,
              selectedForumsId = _options$selectedForu === void 0 ? [] : _options$selectedForu,
              _options$from = options.from,
              from = _options$from === void 0 ? 'writable' : _options$from;
          this.disabledForumsId = disabledForumsId;
          this.selectedForumsId = selectedForumsId;
          this.resetSelector();
          self.showPanel();
          nkcAPI("/f?t=selector&f=".concat(from), 'GET').then(function (data) {
            self.app.loading = false;
            self.app.initForums(data);
          }); // .catch(sweetError)
        },
        close: function close() {
          self.hidePanel();
          this.resetSelector();
        },
        selectForumCategory: function selectForumCategory(c) {
          if (this.disabledForumCategoriesId.includes(c._id)) return;
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

          var _iterator10 = _createForOfIteratorHelper(forums),
              _step10;

          try {
            for (_iterator10.s(); !(_step10 = _iterator10.n()).done;) {
              var f = _step10.value;
              if (!forumsObj[f.categoryId]) forumsObj[f.categoryId] = [];
              forumsObj[f.categoryId].push(f);
            }
          } catch (err) {
            _iterator10.e(err);
          } finally {
            _iterator10.f();
          }

          var _iterator11 = _createForOfIteratorHelper(forumCategories),
              _step11;

          try {
            for (_iterator11.s(); !(_step11 = _iterator11.n()).done;) {
              var _c = _step11.value;
              _c.forums = forumsObj[_c._id] || [];
            }
          } catch (err) {
            _iterator11.e(err);
          } finally {
            _iterator11.f();
          }

          this.forums = forums;
          this.forumCategories = forumCategories;
          this.subscribeForumsId = subscribeForumsId;
          var category = null;

          for (var i = forumCategories.length - 1; i >= 0; i--) {
            var c = forumCategories[i];
            if (this.disabledForumCategoriesId.includes(c._id)) continue;
            category = c;

            if (this.selectedForumCategory && this.selectedForumCategory._id === c._id) {
              break;
            }
          }

          if (category) {
            this.selectForumCategory(category);
          } else {
            this.resetSelector();
          }
        },
        selectParentForum: function selectParentForum(pf) {
          if (this.disabledAllForumsId.includes(pf.fid)) return;
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
          if (this.disabledAllForumsId.includes(f.fid)) return;
          this.selectedThreadType = '';
          this.selectedForum = f;

          if (f.threadTypes.length === 0) {
            this.selectThreadType('none');
          }
        },
        selectThreadType: function selectThreadType(tt) {
          this.selectedThreadType = tt;
        },
        next: function next() {
          this.showThreadTypes = true;
        },
        previous: function previous() {
          this.showThreadTypes = false;
          this.selectedThreadType = '';
        },
        resetSelector: function resetSelector() {
          this.selectedForumCategory = '';
          this.selectedForum = '';
          this.selectedParentForum = '';
          this.selectedThreadType = '';
          this.showThreadTypes = false;
        },
        submit: function submit() {
          var selectedForum = this.selectedForum,
              selectedThreadType = this.selectedThreadType;
          if (!selectedForum) return sweetError("\u8BF7\u9009\u62E9\u4E13\u4E1A");
          if (!selectedThreadType) return sweetError("\u8BF7\u9009\u62E9\u6587\u7AE0\u5206\u7C7B");
          self.callback({
            forum: selectedForum,
            threadType: selectedThreadType === 'none' ? null : selectedThreadType,
            fid: selectedForum.fid,
            cid: selectedThreadType === 'none' ? '' : selectedThreadType.cid
          });
          this.close();
        }
      }
    });
    return _this;
  }

  _createClass(ForumSelector, [{
    key: "open",
    value: function open(props, options) {
      this.app.open(props, options);
    }
  }]);

  return ForumSelector;
}(NKC.modules.DraggablePanel);

NKC.modules.ForumSelector = ForumSelector;

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwYWdlcy9wdWJsaWNNb2R1bGVzL2ZvcnVtU2VsZWN0b3IvZm9ydW1TZWxlY3Rvci5tanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUNBTSxhOzs7OztBQUNKLDJCQUFjO0FBQUE7O0FBQUE7O0FBQ1osUUFBTSxLQUFLLHlCQUFYO0FBQ0EsOEJBQU0sS0FBTjs7QUFDQSxRQUFNLElBQUksZ0NBQVY7O0FBQ0EsSUFBQSxJQUFJLENBQUMsR0FBTCxHQUFXLENBQUMsQ0FBQyxLQUFELENBQVo7QUFDQSxJQUFBLElBQUksQ0FBQyxHQUFMLEdBQVcsSUFBSSxHQUFKLENBQVE7QUFDakIsTUFBQSxFQUFFLEVBQUUsS0FBSyxHQUFHLEtBREs7QUFFakIsTUFBQSxJQUFJLEVBQUU7QUFDSixRQUFBLE9BQU8sRUFBRSxJQURMO0FBRUo7QUFDQSxRQUFBLE1BQU0sRUFBRSxFQUhKO0FBSUosUUFBQSxlQUFlLEVBQUUsRUFKYjtBQUtKLFFBQUEsaUJBQWlCLEVBQUUsRUFMZjtBQU1KLFFBQUEscUJBQXFCLEVBQUUsRUFObkI7QUFPSixRQUFBLG1CQUFtQixFQUFFLEVBUGpCO0FBUUosUUFBQSxhQUFhLEVBQUUsRUFSWDtBQVNKLFFBQUEsa0JBQWtCLEVBQUUsRUFUaEI7QUFVSixRQUFBLGdCQUFnQixFQUFFLEVBVmQ7QUFXSixRQUFBLGdCQUFnQixFQUFFLEVBWGQ7QUFZSixRQUFBLGVBQWUsRUFBRTtBQVpiLE9BRlc7QUFnQmpCLE1BQUEsUUFBUSxFQUFFO0FBQ1IsUUFBQSxTQURRLHVCQUNJO0FBQUEsY0FDSCxlQURHLEdBQ3dCLElBRHhCLENBQ0gsZUFERztBQUFBLGNBQ2MsTUFEZCxHQUN3QixJQUR4QixDQUNjLE1BRGQ7QUFFVixjQUFNLE9BQU8sR0FBRyxFQUFoQjtBQUNBLGNBQU0sU0FBUyxHQUFHLEVBQWxCOztBQUhVLHFE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a0JBQWtCLEtBQUssTUFBdkIsR0FBK0IsSUFBL0IsR0FBcUMsa0JBRnJDO0FBR1osWUFBQSxHQUFHLEVBQUUsYUFBYSxDQUFDLEdBSFA7QUFJWixZQUFBLEdBQUcsRUFBRSxrQkFBa0IsS0FBSyxNQUF2QixHQUErQixFQUEvQixHQUFtQyxrQkFBa0IsQ0FBQztBQUovQyxXQUFkO0FBTUEsZUFBSyxLQUFMO0FBQ0Q7QUE5R007QUFyR1EsS0FBUixDQUFYO0FBTFk7QUEyTmI7Ozs7eUJBQ0ksSyxFQUFPLE8sRUFBUztBQUNuQixXQUFLLEdBQUwsQ0FBUyxJQUFULENBQWMsS0FBZCxFQUFxQixPQUFyQjtBQUNEOzs7O0VBL055QixHQUFHLENBQUMsT0FBSixDQUFZLGM7O0FBaU94QyxHQUFHLENBQUMsT0FBSixDQUFZLGFBQVosR0FBNEIsYUFBNUIiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJjbGFzcyBGb3J1bVNlbGVjdG9yIGV4dGVuZHMgTktDLm1vZHVsZXMuRHJhZ2dhYmxlUGFuZWwge1xyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgY29uc3QgZG9tSWQgPSBgI21vZHVsZUZvcnVtU2VsZWN0b3JgO1xyXG4gICAgc3VwZXIoZG9tSWQpO1xyXG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XHJcbiAgICBzZWxmLmRvbSA9ICQoZG9tSWQpO1xyXG4gICAgc2VsZi5hcHAgPSBuZXcgVnVlKHtcclxuICAgICAgZWw6IGRvbUlkICsgJ0FwcCcsXHJcbiAgICAgIGRhdGE6IHtcclxuICAgICAgICBsb2FkaW5nOiB0cnVlLFxyXG4gICAgICAgIC8vIOS4k+S4muaVsOe7hFxyXG4gICAgICAgIGZvcnVtczogW10sXHJcbiAgICAgICAgZm9ydW1DYXRlZ29yaWVzOiBbXSxcclxuICAgICAgICBzdWJzY3JpYmVGb3J1bXNJZDogW10sXHJcbiAgICAgICAgc2VsZWN0ZWRGb3J1bUNhdGVnb3J5OiAnJyxcclxuICAgICAgICBzZWxlY3RlZFBhcmVudEZvcnVtOiAnJyxcclxuICAgICAgICBzZWxlY3RlZEZvcnVtOiAnJyxcclxuICAgICAgICBzZWxlY3RlZFRocmVhZFR5cGU6ICcnLFxyXG4gICAgICAgIHNlbGVjdGVkRm9ydW1zSWQ6IFtdLFxyXG4gICAgICAgIGRpc2FibGVkRm9ydW1zSWQ6IFtdLFxyXG4gICAgICAgIHNob3dUaHJlYWRUeXBlczogZmFsc2UsXHJcbiAgICAgIH0sXHJcbiAgICAgIGNvbXB1dGVkOiB7XHJcbiAgICAgICAgZm9ydW1EYXRhKCkge1xyXG4gICAgICAgICAgY29uc3Qge2ZvcnVtQ2F0ZWdvcmllcywgZm9ydW1zfSA9IHRoaXM7XHJcbiAgICAgICAgICBjb25zdCByZXN1bHRzID0gW107XHJcbiAgICAgICAgICBjb25zdCBmb3J1bXNPYmogPSBbXTtcclxuICAgICAgICAgIGZvcihjb25zdCBmIG9mIGZvcnVtcykge1xyXG4gICAgICAgICAgICAgaWYoIWZvcnVtc09ialtmLmNhdGVnb3J5SWRdKSBmb3J1bXNPYmpbZi5jYXRlZ29yeUlkXSA9IFtdO1xyXG4gICAgICAgICAgICBmb3J1bXNPYmpbZi5jYXRlZ29yeUlkXS5wdXNoKGYpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgZm9yKGNvbnN0IGMgb2YgZm9ydW1DYXRlZ29yaWVzKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGYgPSBmb3J1bXNPYmpbYy5faWRdO1xyXG4gICAgICAgICAgICBpZighZikgY29udGludWU7XHJcbiAgICAgICAgICAgIGMuZm9ydW1zID0gZjtcclxuICAgICAgICAgICAgcmVzdWx0cy5wdXNoKGMpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgcmV0dXJuIHJlc3VsdHM7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBzdWJzY3JpYmVGb3J1bXMoKSB7XHJcbiAgICAgICAgICBjb25zdCB7Zm9ydW1zLCBzdWJzY3JpYmVGb3J1bXNJZH0gPSB0aGlzO1xyXG4gICAgICAgICAgaWYoIXN1YnNjcmliZUZvcnVtc0lkLmxlbmd0aCkgcmV0dXJuIFtdO1xyXG4gICAgICAgICAgY29uc3QgcmVzdWx0cyA9IFtdO1xyXG4gICAgICAgICAgZm9yKGNvbnN0IGYgb2YgZm9ydW1zKSB7XHJcbiAgICAgICAgICAgIGZvcihjb25zdCBjZiBvZiBmLmNoaWxkRm9ydW1zKSB7XHJcbiAgICAgICAgICAgICAgaWYoIXN1YnNjcmliZUZvcnVtc0lkLmluY2x1ZGVzKGNmLmZpZCkpIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgIHJlc3VsdHMucHVzaChjZik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHJldHVybiByZXN1bHRzO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZm9ydW1zT2JqKCkge1xyXG4gICAgICAgICAgY29uc3Qge2ZvcnVtc30gPSB0aGlzO1xyXG4gICAgICAgICAgY29uc3Qgb2JqID0ge307XHJcbiAgICAgICAgICBmb3IoY29uc3QgZiBvZiBmb3J1bXMpIHtcclxuICAgICAgICAgICAgb2JqW2YuZmlkXSA9IGY7XHJcbiAgICAgICAgICAgIGZvcihjb25zdCBmZiBvZiBmLmNoaWxkRm9ydW1zKSB7XHJcbiAgICAgICAgICAgICAgb2JqW2ZmLmZpZF0gPSBmZjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgcmV0dXJuIG9iajtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGRpc2FibGVkRm9ydW1DYXRlZ29yaWVzSWQoKSB7XHJcbiAgICAgICAgICBjb25zdCB7XHJcbiAgICAgICAgICAgIHNlbGVjdGVkRm9ydW1zSWQsIGZvcnVtc09iaixcclxuICAgICAgICAgICAgZm9ydW1DYXRlZ29yaWVzSWQsIGZvcnVtQ2F0ZWdvcmllc09ialxyXG4gICAgICAgICAgfSA9IHRoaXM7XHJcbiAgICAgICAgICBsZXQgYXJyID0gW107XHJcbiAgICAgICAgICBsZXQgZXhjbHVkZWRGb3J1bUNhdGVnb3JpZXNJZCA9IFtdO1xyXG4gICAgICAgICAgZm9yKGNvbnN0IGZpZCBvZiBzZWxlY3RlZEZvcnVtc0lkKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGZvcnVtID0gZm9ydW1zT2JqW2ZpZF07XHJcbiAgICAgICAgICAgIGlmKCFmb3J1bSkgY29udGludWU7XHJcbiAgICAgICAgICAgIGNvbnN0IGluZGV4ID0gYXJyLmluZGV4T2YoZm9ydW0uY2F0ZWdvcnlJZCk7XHJcbiAgICAgICAgICAgIGlmKGluZGV4ICE9PSAtMSkgY29udGludWU7XHJcbiAgICAgICAgICAgIGNvbnN0IGNhdGVnb3J5ID0gZm9ydW1DYXRlZ29yaWVzT2JqW2ZvcnVtLmNhdGVnb3J5SWRdO1xyXG4gICAgICAgICAgICBpZighY2F0ZWdvcnkpIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICBjb25zdCB7XHJcbiAgICAgICAgICAgICAgZXhjbHVkZWRDYXRlZ29yaWVzSWRcclxuICAgICAgICAgICAgfSA9IGNhdGVnb3J5O1xyXG4gICAgICAgICAgICBleGNsdWRlZEZvcnVtQ2F0ZWdvcmllc0lkID0gZXhjbHVkZWRGb3J1bUNhdGVnb3JpZXNJZC5jb25jYXQoZXhjbHVkZWRDYXRlZ29yaWVzSWQpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgYXJyID0gW107XHJcbiAgICAgICAgICBmb3IoY29uc3QgY2lkIG9mIGV4Y2x1ZGVkRm9ydW1DYXRlZ29yaWVzSWQpIHtcclxuICAgICAgICAgICAgaWYoYXJyLmluY2x1ZGVzKGNpZCkpIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICBhcnIucHVzaChjaWQpO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIHJldHVybiBhcnI7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBkaXNhYmxlZEFsbEZvcnVtc0lkKCkge1xyXG4gICAgICAgICAgcmV0dXJuIHRoaXMuZGlzYWJsZWRGb3J1bXNJZC5jb25jYXQodGhpcy5zZWxlY3RlZEZvcnVtc0lkKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGZvcnVtQ2F0ZWdvcmllc0lkKCkge1xyXG4gICAgICAgICAgcmV0dXJuIHRoaXMuZm9ydW1DYXRlZ29yaWVzLm1hcChmYyA9PiBmYy5faWQpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZm9ydW1DYXRlZ29yaWVzT2JqKCkge1xyXG4gICAgICAgICAgY29uc3Qge2ZvcnVtQ2F0ZWdvcmllc30gPSB0aGlzO1xyXG4gICAgICAgICAgY29uc3Qgb2JqID0ge307XHJcbiAgICAgICAgICBmb3IoY29uc3QgZmMgb2YgZm9ydW1DYXRlZ29yaWVzKSB7XHJcbiAgICAgICAgICAgIG9ialtmYy5faWRdID0gZmM7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICByZXR1cm4gb2JqO1xyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAgbW91bnRlZCgpIHtcclxuXHJcbiAgICAgIH0sXHJcbiAgICAgIG1ldGhvZHM6IHtcclxuICAgICAgICBnZXRVcmw6IE5LQy5tZXRob2RzLnRvb2xzLmdldFVybCxcclxuICAgICAgICBvcGVuKGNhbGxiYWNrLCBvcHRpb25zID0ge30pIHtcclxuICAgICAgICAgIHNlbGYuY2FsbGJhY2sgPSBjYWxsYmFjaztcclxuICAgICAgICAgIGNvbnN0IHtcclxuICAgICAgICAgICAgZGlzYWJsZWRGb3J1bXNJZCA9IFtdLFxyXG4gICAgICAgICAgICBzZWxlY3RlZEZvcnVtc0lkID0gW10sXHJcbiAgICAgICAgICAgIGZyb20gPSAnd3JpdGFibGUnXHJcbiAgICAgICAgICB9ID0gb3B0aW9ucztcclxuICAgICAgICAgIHRoaXMuZGlzYWJsZWRGb3J1bXNJZCA9IGRpc2FibGVkRm9ydW1zSWQ7XHJcbiAgICAgICAgICB0aGlzLnNlbGVjdGVkRm9ydW1zSWQgPSBzZWxlY3RlZEZvcnVtc0lkO1xyXG4gICAgICAgICAgdGhpcy5yZXNldFNlbGVjdG9yKCk7XHJcbiAgICAgICAgICBzZWxmLnNob3dQYW5lbCgpO1xyXG4gICAgICAgICAgbmtjQVBJKGAvZj90PXNlbGVjdG9yJmY9JHtmcm9tfWAsICdHRVQnKVxyXG4gICAgICAgICAgICAudGhlbihkYXRhID0+IHtcclxuICAgICAgICAgICAgICBzZWxmLmFwcC5sb2FkaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgc2VsZi5hcHAuaW5pdEZvcnVtcyhkYXRhKTtcclxuICAgICAgICAgICAgfSlcclxuXHJcbiAgICAgICAgICAgIC8vIC5jYXRjaChzd2VldEVycm9yKVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgY2xvc2UoKSB7XHJcbiAgICAgICAgICBzZWxmLmhpZGVQYW5lbCgpO1xyXG4gICAgICAgICAgdGhpcy5yZXNldFNlbGVjdG9yKCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBzZWxlY3RGb3J1bUNhdGVnb3J5KGMpIHtcclxuICAgICAgICAgIGlmKHRoaXMuZGlzYWJsZWRGb3J1bUNhdGVnb3JpZXNJZC5pbmNsdWRlcyhjLl9pZCkpIHJldHVybjtcclxuICAgICAgICAgIHRoaXMuc2VsZWN0ZWRGb3J1bUNhdGVnb3J5ID0gYztcclxuICAgICAgICAgIHRoaXMuc2VsZWN0ZWRGb3J1bSA9ICcnO1xyXG4gICAgICAgICAgdGhpcy5zZWxlY3RlZFBhcmVudEZvcnVtID0gJyc7XHJcbiAgICAgICAgICB0aGlzLnNlbGVjdGVkVGhyZWFkVHlwZSA9ICcnO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgaW5pdEZvcnVtcyhkYXRhKSB7XHJcbiAgICAgICAgICBjb25zdCB7Zm9ydW1DYXRlZ29yaWVzLCBmb3J1bXMsIHN1YnNjcmliZUZvcnVtc0lkfSA9IGRhdGE7XHJcbiAgICAgICAgICBjb25zdCBmb3J1bXNPYmogPSBbXTtcclxuICAgICAgICAgIGZvcihjb25zdCBmIG9mIGZvcnVtcykge1xyXG4gICAgICAgICAgICBpZighZm9ydW1zT2JqW2YuY2F0ZWdvcnlJZF0pIGZvcnVtc09ialtmLmNhdGVnb3J5SWRdID0gW107XHJcbiAgICAgICAgICAgIGZvcnVtc09ialtmLmNhdGVnb3J5SWRdLnB1c2goZik7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBmb3IoY29uc3QgYyBvZiBmb3J1bUNhdGVnb3JpZXMpIHtcclxuICAgICAgICAgICAgYy5mb3J1bXMgPSBmb3J1bXNPYmpbYy5faWRdIHx8IFtdO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgdGhpcy5mb3J1bXMgPSBmb3J1bXM7XHJcbiAgICAgICAgICB0aGlzLmZvcnVtQ2F0ZWdvcmllcyA9IGZvcnVtQ2F0ZWdvcmllcztcclxuICAgICAgICAgIHRoaXMuc3Vic2NyaWJlRm9ydW1zSWQgPSBzdWJzY3JpYmVGb3J1bXNJZDtcclxuICAgICAgICAgIGxldCBjYXRlZ29yeSA9IG51bGw7XHJcbiAgICAgICAgICBmb3IobGV0IGkgPSBmb3J1bUNhdGVnb3JpZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcclxuICAgICAgICAgICAgY29uc3QgYyA9IGZvcnVtQ2F0ZWdvcmllc1tpXTtcclxuICAgICAgICAgICAgaWYodGhpcy5kaXNhYmxlZEZvcnVtQ2F0ZWdvcmllc0lkLmluY2x1ZGVzKGMuX2lkKSkgY29udGludWU7XHJcbiAgICAgICAgICAgIGNhdGVnb3J5ID0gYztcclxuICAgICAgICAgICAgaWYoXHJcbiAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZEZvcnVtQ2F0ZWdvcnkgJiZcclxuICAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkRm9ydW1DYXRlZ29yeS5faWQgPT09IGMuX2lkXHJcbiAgICAgICAgICAgICkge1xyXG4gICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBpZihjYXRlZ29yeSkge1xyXG4gICAgICAgICAgICB0aGlzLnNlbGVjdEZvcnVtQ2F0ZWdvcnkoY2F0ZWdvcnkpO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5yZXNldFNlbGVjdG9yKCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBzZWxlY3RQYXJlbnRGb3J1bShwZikge1xyXG4gICAgICAgICAgaWYodGhpcy5kaXNhYmxlZEFsbEZvcnVtc0lkLmluY2x1ZGVzKHBmLmZpZCkpIHJldHVybjtcclxuICAgICAgICAgIHRoaXMuc2VsZWN0ZWRQYXJlbnRGb3J1bSA9IHBmO1xyXG4gICAgICAgICAgdGhpcy5zZWxlY3RlZEZvcnVtID0gJyc7XHJcbiAgICAgICAgICB0aGlzLnNlbGVjdGVkVGhyZWFkVHlwZSA9ICcnO1xyXG4gICAgICAgICAgaWYodGhpcy5zZWxlY3RlZFBhcmVudEZvcnVtLmNoaWxkRm9ydW1zLmxlbmd0aCA9PT0gMSkge1xyXG4gICAgICAgICAgICB0aGlzLnNlbGVjdEZvcnVtKHRoaXMuc2VsZWN0ZWRQYXJlbnRGb3J1bS5jaGlsZEZvcnVtc1swXSk7XHJcbiAgICAgICAgICB9IGVsc2UgaWYodGhpcy5zZWxlY3RlZFBhcmVudEZvcnVtLmNoaWxkRm9ydW1zLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICB0aGlzLnNlbGVjdEZvcnVtKHRoaXMuc2VsZWN0ZWRQYXJlbnRGb3J1bSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBzZWxlY3RGb3J1bShmKSB7XHJcbiAgICAgICAgICBpZih0aGlzLmRpc2FibGVkQWxsRm9ydW1zSWQuaW5jbHVkZXMoZi5maWQpKSByZXR1cm47XHJcbiAgICAgICAgICB0aGlzLnNlbGVjdGVkVGhyZWFkVHlwZSA9ICcnO1xyXG4gICAgICAgICAgdGhpcy5zZWxlY3RlZEZvcnVtID0gZjtcclxuICAgICAgICAgIGlmKGYudGhyZWFkVHlwZXMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0VGhyZWFkVHlwZSgnbm9uZScpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc2VsZWN0VGhyZWFkVHlwZSh0dCkge1xyXG4gICAgICAgICAgdGhpcy5zZWxlY3RlZFRocmVhZFR5cGUgPSB0dDtcclxuICAgICAgICB9LFxyXG4gICAgICAgIG5leHQoKSB7XHJcbiAgICAgICAgICB0aGlzLnNob3dUaHJlYWRUeXBlcyA9IHRydWU7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBwcmV2aW91cygpIHtcclxuICAgICAgICAgIHRoaXMuc2hvd1RocmVhZFR5cGVzID0gZmFsc2U7XHJcbiAgICAgICAgICB0aGlzLnNlbGVjdGVkVGhyZWFkVHlwZSA9ICcnO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcmVzZXRTZWxlY3RvcigpIHtcclxuICAgICAgICAgIHRoaXMuc2VsZWN0ZWRGb3J1bUNhdGVnb3J5ID0gJyc7XHJcbiAgICAgICAgICB0aGlzLnNlbGVjdGVkRm9ydW0gPSAnJztcclxuICAgICAgICAgIHRoaXMuc2VsZWN0ZWRQYXJlbnRGb3J1bSA9ICcnO1xyXG4gICAgICAgICAgdGhpcy5zZWxlY3RlZFRocmVhZFR5cGUgPSAnJztcclxuICAgICAgICAgIHRoaXMuc2hvd1RocmVhZFR5cGVzID0gZmFsc2U7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBzdWJtaXQoKSB7XHJcbiAgICAgICAgICBjb25zdCB7c2VsZWN0ZWRGb3J1bSwgc2VsZWN0ZWRUaHJlYWRUeXBlfSA9IHRoaXM7XHJcbiAgICAgICAgICBpZighc2VsZWN0ZWRGb3J1bSkgcmV0dXJuIHN3ZWV0RXJyb3IoYOivt+mAieaLqeS4k+S4mmApO1xyXG4gICAgICAgICAgaWYoIXNlbGVjdGVkVGhyZWFkVHlwZSkgcmV0dXJuIHN3ZWV0RXJyb3IoYOivt+mAieaLqeaWh+eroOWIhuexu2ApO1xyXG4gICAgICAgICAgc2VsZi5jYWxsYmFjayh7XHJcbiAgICAgICAgICAgIGZvcnVtOiBzZWxlY3RlZEZvcnVtLFxyXG4gICAgICAgICAgICB0aHJlYWRUeXBlOiBzZWxlY3RlZFRocmVhZFR5cGUgPT09ICdub25lJz8gbnVsbDogc2VsZWN0ZWRUaHJlYWRUeXBlLFxyXG4gICAgICAgICAgICBmaWQ6IHNlbGVjdGVkRm9ydW0uZmlkLFxyXG4gICAgICAgICAgICBjaWQ6IHNlbGVjdGVkVGhyZWFkVHlwZSA9PT0gJ25vbmUnPyAnJzogc2VsZWN0ZWRUaHJlYWRUeXBlLmNpZFxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgICB0aGlzLmNsb3NlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9KVxyXG4gIH1cclxuICBvcGVuKHByb3BzLCBvcHRpb25zKSB7XHJcbiAgICB0aGlzLmFwcC5vcGVuKHByb3BzLCBvcHRpb25zKTtcclxuICB9XHJcbn1cclxuTktDLm1vZHVsZXMuRm9ydW1TZWxlY3RvciA9IEZvcnVtU2VsZWN0b3I7XHJcbiJdfQ==
