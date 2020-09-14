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
        needThreadType: true,
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
              from = _options$from === void 0 ? 'writable' : _options$from,
              _options$needThreadTy = options.needThreadType,
              needThreadType = _options$needThreadTy === void 0 ? true : _options$needThreadTy;
          this.disabledForumsId = disabledForumsId;
          this.selectedForumsId = selectedForumsId;
          this.needThreadType = needThreadType;
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
        },
        fastSubmit: function fastSubmit() {
          var selectedForum = this.selectedForum;
          if (!selectedForum) return sweetError("\u8BF7\u9009\u62E9\u4E13\u4E1A");
          self.callback({
            forum: selectedForum,
            fid: selectedForum.fid
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwYWdlcy9wdWJsaWNNb2R1bGVzL2ZvcnVtU2VsZWN0b3IvZm9ydW1TZWxlY3Rvci5tanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUNBTSxhOzs7OztBQUNKLDJCQUFjO0FBQUE7O0FBQUE7O0FBQ1osUUFBTSxLQUFLLHlCQUFYO0FBQ0EsOEJBQU0sS0FBTjs7QUFDQSxRQUFNLElBQUksZ0NBQVY7O0FBQ0EsSUFBQSxJQUFJLENBQUMsR0FBTCxHQUFXLENBQUMsQ0FBQyxLQUFELENBQVo7QUFDQSxJQUFBLElBQUksQ0FBQyxHQUFMLEdBQVcsSUFBSSxHQUFKLENBQVE7QUFDakIsTUFBQSxFQUFFLEVBQUUsS0FBSyxHQUFHLEtBREs7QUFFakIsTUFBQSxJQUFJLEVBQUU7QUFDSixRQUFBLE9BQU8sRUFBRSxJQURMO0FBRUo7QUFDQSxRQUFBLE1BQU0sRUFBRSxFQUhKO0FBSUosUUFBQSxlQUFlLEVBQUUsRUFKYjtBQUtKLFFBQUEsaUJBQWlCLEVBQUUsRUFMZjtBQU1KLFFBQUEscUJBQXFCLEVBQUUsRUFObkI7QUFPSixRQUFBLG1CQUFtQixFQUFFLEVBUGpCO0FBUUosUUFBQSxhQUFhLEVBQUUsRUFSWDtBQVNKLFFBQUEsa0JBQWtCLEVBQUUsRUFUaEI7QUFVSixRQUFBLGdCQUFnQixFQUFFLEVBVmQ7QUFXSixRQUFBLGdCQUFnQixFQUFFLEVBWGQ7QUFhSixRQUFBLGNBQWMsRUFBRSxJQWJaO0FBY0osUUFBQSxlQUFlLEVBQUU7QUFkYixPQUZXO0FBa0JqQixNQUFBLFFBQVEsRUFBRTtBQUNSLFFBQUEsU0FEUSx1QkFDSTtBQUFBLGNBQ0gsZUFERyxHQUN3QixJQUR4QixDQUNILGVBREc7QUFBQSxjQUNjLE1BRGQsR0FDd0IsSUFEeEIsQ0FDYyxNQURkO0FBRVYsY0FBTSxPQUFPLEdBQUcsRUFBaEI7QUFDQSxjQUFN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Q0FBQyxrQkFBSixFQUF3QixPQUFPLFVBQVUsOENBQWpCO0FBQ3hCLFVBQUEsSUFBSSxDQUFDLFFBQUwsQ0FBYztBQUNaLFlBQUEsS0FBSyxFQUFFLGFBREs7QUFFWixZQUFBLFVBQVUsRUFBRSxrQkFBa0IsS0FBSyxNQUF2QixHQUErQixJQUEvQixHQUFxQyxrQkFGckM7QUFHWixZQUFBLEdBQUcsRUFBRSxhQUFhLENBQUMsR0FIUDtBQUlaLFlBQUEsR0FBRyxFQUFFLGtCQUFrQixLQUFLLE1BQXZCLEdBQStCLEVBQS9CLEdBQW1DLGtCQUFrQixDQUFDO0FBSi9DLFdBQWQ7QUFNQSxlQUFLLEtBQUw7QUFDRCxTQWhITTtBQWlIUCxRQUFBLFVBakhPLHdCQWlITTtBQUFBLGNBQ0osYUFESSxHQUNhLElBRGIsQ0FDSixhQURJO0FBRVgsY0FBRyxDQUFDLGFBQUosRUFBbUIsT0FBTyxVQUFVLGtDQUFqQjtBQUNuQixVQUFBLElBQUksQ0FBQyxRQUFMLENBQWM7QUFDWixZQUFBLEtBQUssRUFBRSxhQURLO0FBRVosWUFBQSxHQUFHLEVBQUUsYUFBYSxDQUFDO0FBRlAsV0FBZDtBQUlBLGVBQUssS0FBTDtBQUNEO0FBekhNO0FBdkdRLEtBQVIsQ0FBWDtBQUxZO0FBd09iOzs7O3lCQUNJLEssRUFBTyxPLEVBQVM7QUFDbkIsV0FBSyxHQUFMLENBQVMsSUFBVCxDQUFjLEtBQWQsRUFBcUIsT0FBckI7QUFDRDs7OztFQTVPeUIsR0FBRyxDQUFDLE9BQUosQ0FBWSxjOztBQThPeEMsR0FBRyxDQUFDLE9BQUosQ0FBWSxhQUFaLEdBQTRCLGFBQTVCIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiY2xhc3MgRm9ydW1TZWxlY3RvciBleHRlbmRzIE5LQy5tb2R1bGVzLkRyYWdnYWJsZVBhbmVsIHtcclxuICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIGNvbnN0IGRvbUlkID0gYCNtb2R1bGVGb3J1bVNlbGVjdG9yYDtcclxuICAgIHN1cGVyKGRvbUlkKTtcclxuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xyXG4gICAgc2VsZi5kb20gPSAkKGRvbUlkKTtcclxuICAgIHNlbGYuYXBwID0gbmV3IFZ1ZSh7XHJcbiAgICAgIGVsOiBkb21JZCArICdBcHAnLFxyXG4gICAgICBkYXRhOiB7XHJcbiAgICAgICAgbG9hZGluZzogdHJ1ZSxcclxuICAgICAgICAvLyDkuJPkuJrmlbDnu4RcclxuICAgICAgICBmb3J1bXM6IFtdLFxyXG4gICAgICAgIGZvcnVtQ2F0ZWdvcmllczogW10sXHJcbiAgICAgICAgc3Vic2NyaWJlRm9ydW1zSWQ6IFtdLFxyXG4gICAgICAgIHNlbGVjdGVkRm9ydW1DYXRlZ29yeTogJycsXHJcbiAgICAgICAgc2VsZWN0ZWRQYXJlbnRGb3J1bTogJycsXHJcbiAgICAgICAgc2VsZWN0ZWRGb3J1bTogJycsXHJcbiAgICAgICAgc2VsZWN0ZWRUaHJlYWRUeXBlOiAnJyxcclxuICAgICAgICBzZWxlY3RlZEZvcnVtc0lkOiBbXSxcclxuICAgICAgICBkaXNhYmxlZEZvcnVtc0lkOiBbXSxcclxuXHJcbiAgICAgICAgbmVlZFRocmVhZFR5cGU6IHRydWUsXHJcbiAgICAgICAgc2hvd1RocmVhZFR5cGVzOiBmYWxzZSxcclxuICAgICAgfSxcclxuICAgICAgY29tcHV0ZWQ6IHtcclxuICAgICAgICBmb3J1bURhdGEoKSB7XHJcbiAgICAgICAgICBjb25zdCB7Zm9ydW1DYXRlZ29yaWVzLCBmb3J1bXN9ID0gdGhpcztcclxuICAgICAgICAgIGNvbnN0IHJlc3VsdHMgPSBbXTtcclxuICAgICAgICAgIGNvbnN0IGZvcnVtc09iaiA9IFtdO1xyXG4gICAgICAgICAgZm9yKGNvbnN0IGYgb2YgZm9ydW1zKSB7XHJcbiAgICAgICAgICAgICBpZighZm9ydW1zT2JqW2YuY2F0ZWdvcnlJZF0pIGZvcnVtc09ialtmLmNhdGVnb3J5SWRdID0gW107XHJcbiAgICAgICAgICAgIGZvcnVtc09ialtmLmNhdGVnb3J5SWRdLnB1c2goZik7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBmb3IoY29uc3QgYyBvZiBmb3J1bUNhdGVnb3JpZXMpIHtcclxuICAgICAgICAgICAgY29uc3QgZiA9IGZvcnVtc09ialtjLl9pZF07XHJcbiAgICAgICAgICAgIGlmKCFmKSBjb250aW51ZTtcclxuICAgICAgICAgICAgYy5mb3J1bXMgPSBmO1xyXG4gICAgICAgICAgICByZXN1bHRzLnB1c2goYyk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICByZXR1cm4gcmVzdWx0cztcclxuICAgICAgICB9LFxyXG4gICAgICAgIHN1YnNjcmliZUZvcnVtcygpIHtcclxuICAgICAgICAgIGNvbnN0IHtmb3J1bXMsIHN1YnNjcmliZUZvcnVtc0lkfSA9IHRoaXM7XHJcbiAgICAgICAgICBpZighc3Vic2NyaWJlRm9ydW1zSWQubGVuZ3RoKSByZXR1cm4gW107XHJcbiAgICAgICAgICBjb25zdCByZXN1bHRzID0gW107XHJcbiAgICAgICAgICBmb3IoY29uc3QgZiBvZiBmb3J1bXMpIHtcclxuICAgICAgICAgICAgZm9yKGNvbnN0IGNmIG9mIGYuY2hpbGRGb3J1bXMpIHtcclxuICAgICAgICAgICAgICBpZighc3Vic2NyaWJlRm9ydW1zSWQuaW5jbHVkZXMoY2YuZmlkKSkgY29udGludWU7XHJcbiAgICAgICAgICAgICAgcmVzdWx0cy5wdXNoKGNmKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgcmV0dXJuIHJlc3VsdHM7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBmb3J1bXNPYmooKSB7XHJcbiAgICAgICAgICBjb25zdCB7Zm9ydW1zfSA9IHRoaXM7XHJcbiAgICAgICAgICBjb25zdCBvYmogPSB7fTtcclxuICAgICAgICAgIGZvcihjb25zdCBmIG9mIGZvcnVtcykge1xyXG4gICAgICAgICAgICBvYmpbZi5maWRdID0gZjtcclxuICAgICAgICAgICAgZm9yKGNvbnN0IGZmIG9mIGYuY2hpbGRGb3J1bXMpIHtcclxuICAgICAgICAgICAgICBvYmpbZmYuZmlkXSA9IGZmO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICByZXR1cm4gb2JqO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZGlzYWJsZWRGb3J1bUNhdGVnb3JpZXNJZCgpIHtcclxuICAgICAgICAgIGNvbnN0IHtcclxuICAgICAgICAgICAgc2VsZWN0ZWRGb3J1bXNJZCwgZm9ydW1zT2JqLFxyXG4gICAgICAgICAgICBmb3J1bUNhdGVnb3JpZXNJZCwgZm9ydW1DYXRlZ29yaWVzT2JqXHJcbiAgICAgICAgICB9ID0gdGhpcztcclxuICAgICAgICAgIGxldCBhcnIgPSBbXTtcclxuICAgICAgICAgIGxldCBleGNsdWRlZEZvcnVtQ2F0ZWdvcmllc0lkID0gW107XHJcbiAgICAgICAgICBmb3IoY29uc3QgZmlkIG9mIHNlbGVjdGVkRm9ydW1zSWQpIHtcclxuICAgICAgICAgICAgY29uc3QgZm9ydW0gPSBmb3J1bXNPYmpbZmlkXTtcclxuICAgICAgICAgICAgaWYoIWZvcnVtKSBjb250aW51ZTtcclxuICAgICAgICAgICAgY29uc3QgaW5kZXggPSBhcnIuaW5kZXhPZihmb3J1bS5jYXRlZ29yeUlkKTtcclxuICAgICAgICAgICAgaWYoaW5kZXggIT09IC0xKSBjb250aW51ZTtcclxuICAgICAgICAgICAgY29uc3QgY2F0ZWdvcnkgPSBmb3J1bUNhdGVnb3JpZXNPYmpbZm9ydW0uY2F0ZWdvcnlJZF07XHJcbiAgICAgICAgICAgIGlmKCFjYXRlZ29yeSkgY29udGludWU7XHJcbiAgICAgICAgICAgIGNvbnN0IHtcclxuICAgICAgICAgICAgICBleGNsdWRlZENhdGVnb3JpZXNJZFxyXG4gICAgICAgICAgICB9ID0gY2F0ZWdvcnk7XHJcbiAgICAgICAgICAgIGV4Y2x1ZGVkRm9ydW1DYXRlZ29yaWVzSWQgPSBleGNsdWRlZEZvcnVtQ2F0ZWdvcmllc0lkLmNvbmNhdChleGNsdWRlZENhdGVnb3JpZXNJZCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBhcnIgPSBbXTtcclxuICAgICAgICAgIGZvcihjb25zdCBjaWQgb2YgZXhjbHVkZWRGb3J1bUNhdGVnb3JpZXNJZCkge1xyXG4gICAgICAgICAgICBpZihhcnIuaW5jbHVkZXMoY2lkKSkgY29udGludWU7XHJcbiAgICAgICAgICAgIGFyci5wdXNoKGNpZCk7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgcmV0dXJuIGFycjtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGRpc2FibGVkQWxsRm9ydW1zSWQoKSB7XHJcbiAgICAgICAgICByZXR1cm4gdGhpcy5kaXNhYmxlZEZvcnVtc0lkLmNvbmNhdCh0aGlzLnNlbGVjdGVkRm9ydW1zSWQpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZm9ydW1DYXRlZ29yaWVzSWQoKSB7XHJcbiAgICAgICAgICByZXR1cm4gdGhpcy5mb3J1bUNhdGVnb3JpZXMubWFwKGZjID0+IGZjLl9pZCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBmb3J1bUNhdGVnb3JpZXNPYmooKSB7XHJcbiAgICAgICAgICBjb25zdCB7Zm9ydW1DYXRlZ29yaWVzfSA9IHRoaXM7XHJcbiAgICAgICAgICBjb25zdCBvYmogPSB7fTtcclxuICAgICAgICAgIGZvcihjb25zdCBmYyBvZiBmb3J1bUNhdGVnb3JpZXMpIHtcclxuICAgICAgICAgICAgb2JqW2ZjLl9pZF0gPSBmYztcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHJldHVybiBvYmo7XHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICBtb3VudGVkKCkge1xyXG5cclxuICAgICAgfSxcclxuICAgICAgbWV0aG9kczoge1xyXG4gICAgICAgIGdldFVybDogTktDLm1ldGhvZHMudG9vbHMuZ2V0VXJsLFxyXG4gICAgICAgIG9wZW4oY2FsbGJhY2ssIG9wdGlvbnMgPSB7fSkge1xyXG4gICAgICAgICAgc2VsZi5jYWxsYmFjayA9IGNhbGxiYWNrO1xyXG4gICAgICAgICAgY29uc3Qge1xyXG4gICAgICAgICAgICBkaXNhYmxlZEZvcnVtc0lkID0gW10sXHJcbiAgICAgICAgICAgIHNlbGVjdGVkRm9ydW1zSWQgPSBbXSxcclxuICAgICAgICAgICAgZnJvbSA9ICd3cml0YWJsZScsXHJcbiAgICAgICAgICAgIG5lZWRUaHJlYWRUeXBlID0gdHJ1ZVxyXG4gICAgICAgICAgfSA9IG9wdGlvbnM7XHJcbiAgICAgICAgICB0aGlzLmRpc2FibGVkRm9ydW1zSWQgPSBkaXNhYmxlZEZvcnVtc0lkO1xyXG4gICAgICAgICAgdGhpcy5zZWxlY3RlZEZvcnVtc0lkID0gc2VsZWN0ZWRGb3J1bXNJZDtcclxuICAgICAgICAgIHRoaXMubmVlZFRocmVhZFR5cGUgPSBuZWVkVGhyZWFkVHlwZTtcclxuICAgICAgICAgIHRoaXMucmVzZXRTZWxlY3RvcigpO1xyXG4gICAgICAgICAgc2VsZi5zaG93UGFuZWwoKTtcclxuICAgICAgICAgIG5rY0FQSShgL2Y/dD1zZWxlY3RvciZmPSR7ZnJvbX1gLCAnR0VUJylcclxuICAgICAgICAgICAgLnRoZW4oZGF0YSA9PiB7XHJcbiAgICAgICAgICAgICAgc2VsZi5hcHAubG9hZGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgIHNlbGYuYXBwLmluaXRGb3J1bXMoZGF0YSk7XHJcbiAgICAgICAgICAgIH0pXHJcblxyXG4gICAgICAgICAgICAvLyAuY2F0Y2goc3dlZXRFcnJvcilcclxuICAgICAgICB9LFxyXG4gICAgICAgIGNsb3NlKCkge1xyXG4gICAgICAgICAgc2VsZi5oaWRlUGFuZWwoKTtcclxuICAgICAgICAgIHRoaXMucmVzZXRTZWxlY3RvcigpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc2VsZWN0Rm9ydW1DYXRlZ29yeShjKSB7XHJcbiAgICAgICAgICBpZih0aGlzLmRpc2FibGVkRm9ydW1DYXRlZ29yaWVzSWQuaW5jbHVkZXMoYy5faWQpKSByZXR1cm47XHJcbiAgICAgICAgICB0aGlzLnNlbGVjdGVkRm9ydW1DYXRlZ29yeSA9IGM7XHJcbiAgICAgICAgICB0aGlzLnNlbGVjdGVkRm9ydW0gPSAnJztcclxuICAgICAgICAgIHRoaXMuc2VsZWN0ZWRQYXJlbnRGb3J1bSA9ICcnO1xyXG4gICAgICAgICAgdGhpcy5zZWxlY3RlZFRocmVhZFR5cGUgPSAnJztcclxuICAgICAgICB9LFxyXG4gICAgICAgIGluaXRGb3J1bXMoZGF0YSkge1xyXG4gICAgICAgICAgY29uc3Qge2ZvcnVtQ2F0ZWdvcmllcywgZm9ydW1zLCBzdWJzY3JpYmVGb3J1bXNJZH0gPSBkYXRhO1xyXG4gICAgICAgICAgY29uc3QgZm9ydW1zT2JqID0gW107XHJcbiAgICAgICAgICBmb3IoY29uc3QgZiBvZiBmb3J1bXMpIHtcclxuICAgICAgICAgICAgaWYoIWZvcnVtc09ialtmLmNhdGVnb3J5SWRdKSBmb3J1bXNPYmpbZi5jYXRlZ29yeUlkXSA9IFtdO1xyXG4gICAgICAgICAgICBmb3J1bXNPYmpbZi5jYXRlZ29yeUlkXS5wdXNoKGYpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgZm9yKGNvbnN0IGMgb2YgZm9ydW1DYXRlZ29yaWVzKSB7XHJcbiAgICAgICAgICAgIGMuZm9ydW1zID0gZm9ydW1zT2JqW2MuX2lkXSB8fCBbXTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHRoaXMuZm9ydW1zID0gZm9ydW1zO1xyXG4gICAgICAgICAgdGhpcy5mb3J1bUNhdGVnb3JpZXMgPSBmb3J1bUNhdGVnb3JpZXM7XHJcbiAgICAgICAgICB0aGlzLnN1YnNjcmliZUZvcnVtc0lkID0gc3Vic2NyaWJlRm9ydW1zSWQ7XHJcbiAgICAgICAgICBsZXQgY2F0ZWdvcnkgPSBudWxsO1xyXG4gICAgICAgICAgZm9yKGxldCBpID0gZm9ydW1DYXRlZ29yaWVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGMgPSBmb3J1bUNhdGVnb3JpZXNbaV07XHJcbiAgICAgICAgICAgIGlmKHRoaXMuZGlzYWJsZWRGb3J1bUNhdGVnb3JpZXNJZC5pbmNsdWRlcyhjLl9pZCkpIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICBjYXRlZ29yeSA9IGM7XHJcbiAgICAgICAgICAgIGlmKFxyXG4gICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRGb3J1bUNhdGVnb3J5ICYmXHJcbiAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZEZvcnVtQ2F0ZWdvcnkuX2lkID09PSBjLl9pZFxyXG4gICAgICAgICAgICApIHtcclxuICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgaWYoY2F0ZWdvcnkpIHtcclxuICAgICAgICAgICAgdGhpcy5zZWxlY3RGb3J1bUNhdGVnb3J5KGNhdGVnb3J5KTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMucmVzZXRTZWxlY3RvcigpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc2VsZWN0UGFyZW50Rm9ydW0ocGYpIHtcclxuICAgICAgICAgIGlmKHRoaXMuZGlzYWJsZWRBbGxGb3J1bXNJZC5pbmNsdWRlcyhwZi5maWQpKSByZXR1cm47XHJcbiAgICAgICAgICB0aGlzLnNlbGVjdGVkUGFyZW50Rm9ydW0gPSBwZjtcclxuICAgICAgICAgIHRoaXMuc2VsZWN0ZWRGb3J1bSA9ICcnO1xyXG4gICAgICAgICAgdGhpcy5zZWxlY3RlZFRocmVhZFR5cGUgPSAnJztcclxuICAgICAgICAgIGlmKHRoaXMuc2VsZWN0ZWRQYXJlbnRGb3J1bS5jaGlsZEZvcnVtcy5sZW5ndGggPT09IDEpIHtcclxuICAgICAgICAgICAgdGhpcy5zZWxlY3RGb3J1bSh0aGlzLnNlbGVjdGVkUGFyZW50Rm9ydW0uY2hpbGRGb3J1bXNbMF0pO1xyXG4gICAgICAgICAgfSBlbHNlIGlmKHRoaXMuc2VsZWN0ZWRQYXJlbnRGb3J1bS5jaGlsZEZvcnVtcy5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgdGhpcy5zZWxlY3RGb3J1bSh0aGlzLnNlbGVjdGVkUGFyZW50Rm9ydW0pO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc2VsZWN0Rm9ydW0oZikge1xyXG4gICAgICAgICAgaWYodGhpcy5kaXNhYmxlZEFsbEZvcnVtc0lkLmluY2x1ZGVzKGYuZmlkKSkgcmV0dXJuO1xyXG4gICAgICAgICAgdGhpcy5zZWxlY3RlZFRocmVhZFR5cGUgPSAnJztcclxuICAgICAgICAgIHRoaXMuc2VsZWN0ZWRGb3J1bSA9IGY7XHJcbiAgICAgICAgICBpZihmLnRocmVhZFR5cGVzLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICB0aGlzLnNlbGVjdFRocmVhZFR5cGUoJ25vbmUnKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIHNlbGVjdFRocmVhZFR5cGUodHQpIHtcclxuICAgICAgICAgIHRoaXMuc2VsZWN0ZWRUaHJlYWRUeXBlID0gdHQ7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBuZXh0KCkge1xyXG4gICAgICAgICAgdGhpcy5zaG93VGhyZWFkVHlwZXMgPSB0cnVlO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcHJldmlvdXMoKSB7XHJcbiAgICAgICAgICB0aGlzLnNob3dUaHJlYWRUeXBlcyA9IGZhbHNlO1xyXG4gICAgICAgICAgdGhpcy5zZWxlY3RlZFRocmVhZFR5cGUgPSAnJztcclxuICAgICAgICB9LFxyXG4gICAgICAgIHJlc2V0U2VsZWN0b3IoKSB7XHJcbiAgICAgICAgICB0aGlzLnNlbGVjdGVkRm9ydW1DYXRlZ29yeSA9ICcnO1xyXG4gICAgICAgICAgdGhpcy5zZWxlY3RlZEZvcnVtID0gJyc7XHJcbiAgICAgICAgICB0aGlzLnNlbGVjdGVkUGFyZW50Rm9ydW0gPSAnJztcclxuICAgICAgICAgIHRoaXMuc2VsZWN0ZWRUaHJlYWRUeXBlID0gJyc7XHJcbiAgICAgICAgICB0aGlzLnNob3dUaHJlYWRUeXBlcyA9IGZhbHNlO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc3VibWl0KCkge1xyXG4gICAgICAgICAgY29uc3Qge3NlbGVjdGVkRm9ydW0sIHNlbGVjdGVkVGhyZWFkVHlwZX0gPSB0aGlzO1xyXG4gICAgICAgICAgaWYoIXNlbGVjdGVkRm9ydW0pIHJldHVybiBzd2VldEVycm9yKGDor7fpgInmi6nkuJPkuJpgKTtcclxuICAgICAgICAgIGlmKCFzZWxlY3RlZFRocmVhZFR5cGUpIHJldHVybiBzd2VldEVycm9yKGDor7fpgInmi6nmlofnq6DliIbnsbtgKTtcclxuICAgICAgICAgIHNlbGYuY2FsbGJhY2soe1xyXG4gICAgICAgICAgICBmb3J1bTogc2VsZWN0ZWRGb3J1bSxcclxuICAgICAgICAgICAgdGhyZWFkVHlwZTogc2VsZWN0ZWRUaHJlYWRUeXBlID09PSAnbm9uZSc/IG51bGw6IHNlbGVjdGVkVGhyZWFkVHlwZSxcclxuICAgICAgICAgICAgZmlkOiBzZWxlY3RlZEZvcnVtLmZpZCxcclxuICAgICAgICAgICAgY2lkOiBzZWxlY3RlZFRocmVhZFR5cGUgPT09ICdub25lJz8gJyc6IHNlbGVjdGVkVGhyZWFkVHlwZS5jaWRcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgdGhpcy5jbG9zZSgpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZmFzdFN1Ym1pdCgpIHtcclxuICAgICAgICAgIGNvbnN0IHtzZWxlY3RlZEZvcnVtfSA9IHRoaXM7XHJcbiAgICAgICAgICBpZighc2VsZWN0ZWRGb3J1bSkgcmV0dXJuIHN3ZWV0RXJyb3IoYOivt+mAieaLqeS4k+S4mmApO1xyXG4gICAgICAgICAgc2VsZi5jYWxsYmFjayh7XHJcbiAgICAgICAgICAgIGZvcnVtOiBzZWxlY3RlZEZvcnVtLFxyXG4gICAgICAgICAgICBmaWQ6IHNlbGVjdGVkRm9ydW0uZmlkLFxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgICB0aGlzLmNsb3NlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9KVxyXG4gIH1cclxuICBvcGVuKHByb3BzLCBvcHRpb25zKSB7XHJcbiAgICB0aGlzLmFwcC5vcGVuKHByb3BzLCBvcHRpb25zKTtcclxuICB9XHJcbn1cclxuTktDLm1vZHVsZXMuRm9ydW1TZWxlY3RvciA9IEZvcnVtU2VsZWN0b3I7XHJcbiJdfQ==
