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
        // 外部传入 已选择的专业ID 用于禁止选择已选专业 且参与专业分类的互斥判断
        selectedForumsId: [],
        // 外部传入 屏蔽的专业 同上
        disabledForumsId: [],
        // 外部传入 高亮的专业
        highlightForumId: '',
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
              needThreadType = _options$needThreadTy === void 0 ? true : _options$needThreadTy,
              _options$highlightFor = options.highlightForumId,
              highlightForumId = _options$highlightFor === void 0 ? '' : _options$highlightFor;
          this.disabledForumsId = disabledForumsId;
          this.selectedForumsId = selectedForumsId;
          this.needThreadType = needThreadType;
          this.highlightForumId = highlightForumId;
          this.resetSelector();
          self.showPanel();
          nkcAPI("/f?t=selector&f=".concat(from), 'GET').then(function (data) {
            self.app.loading = false;
            self.app.initForums(data);
          })["catch"](function (err) {
            console.log(err);
            sweetError(err);
          });
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

          this.highlightForum();
        },
        highlightForum: function highlightForum() {
          var forumData = this.forumData,
              highlightForumId = this.highlightForumId;
          if (!highlightForumId) return;

          var _selectedCategory, _selectedParentForum, _selectedForum;

          var _iterator12 = _createForOfIteratorHelper(forumData),
              _step12;

          try {
            loop1: for (_iterator12.s(); !(_step12 = _iterator12.n()).done;) {
              var c = _step12.value;
              _selectedCategory = c;

              var _iterator13 = _createForOfIteratorHelper(c.forums),
                  _step13;

              try {
                for (_iterator13.s(); !(_step13 = _iterator13.n()).done;) {
                  var pf = _step13.value;
                  _selectedParentForum = pf;

                  var _iterator14 = _createForOfIteratorHelper(pf.childForums),
                      _step14;

                  try {
                    for (_iterator14.s(); !(_step14 = _iterator14.n()).done;) {
                      var f = _step14.value;

                      if (highlightForumId === f.fid) {
                        _selectedForum = f;
                        break loop1;
                      }
                    }
                  } catch (err) {
                    _iterator14.e(err);
                  } finally {
                    _iterator14.f();
                  }
                }
              } catch (err) {
                _iterator13.e(err);
              } finally {
                _iterator13.f();
              }
            }
          } catch (err) {
            _iterator12.e(err);
          } finally {
            _iterator12.f();
          }

          if (_selectedForum) {
            this.selectedForumCategory = _selectedCategory;
            this.selectedParentForum = _selectedParentForum;
            this.selectedForum = _selectedForum;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwYWdlcy9wdWJsaWNNb2R1bGVzL2ZvcnVtU2VsZWN0b3IvZm9ydW1TZWxlY3Rvci5tanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUNBTSxhOzs7OztBQUNKLDJCQUFjO0FBQUE7O0FBQUE7O0FBQ1osUUFBTSxLQUFLLHlCQUFYO0FBQ0EsOEJBQU0sS0FBTjs7QUFDQSxRQUFNLElBQUksZ0NBQVY7O0FBQ0EsSUFBQSxJQUFJLENBQUMsR0FBTCxHQUFXLENBQUMsQ0FBQyxLQUFELENBQVo7QUFDQSxJQUFBLElBQUksQ0FBQyxHQUFMLEdBQVcsSUFBSSxHQUFKLENBQVE7QUFDakIsTUFBQSxFQUFFLEVBQUUsS0FBSyxHQUFHLEtBREs7QUFFakIsTUFBQSxJQUFJLEVBQUU7QUFDSixRQUFBLE9BQU8sRUFBRSxJQURMO0FBRUo7QUFDQSxRQUFBLE1BQU0sRUFBRSxFQUhKO0FBSUosUUFBQSxlQUFlLEVBQUUsRUFKYjtBQUtKLFFBQUEsaUJBQWlCLEVBQUUsRUFMZjtBQU1KLFFBQUEscUJBQXFCLEVBQUUsRUFObkI7QUFPSixRQUFBLG1CQUFtQixFQUFFLEVBUGpCO0FBUUosUUFBQSxhQUFhLEVBQUUsRUFSWDtBQVNKLFFBQUEsa0JBQWtCLEVBQUUsRUFUaEI7QUFXSjtBQUNBLFFBQUEsZ0JBQWdCLEVBQUUsRUFaZDtBQWFKO0FBQ0EsUUFBQSxnQkFBZ0IsRUFBRSxFQWRkO0FBZUo7QUFDQSxRQUFBLGdCQUFnQixFQUFFLEVBaEJkO0FBa0JKLFFBQUEsY0FBYyxFQUFFLElBbEJaO0FBbUJKLFFBQUEsZUFBZSxFQUFFO0FBbkJiLE9BRlc7QUF1QmpCLE1BQUEsUUFBUSxFQUFFO0FBQ1IsUUFBQSxTQURRLHVCQUNJO0FBQUEsY0FDSCxlQURHLEdBQ3dCLElBRHhCLENBQ0gsZUFERztBQUFBLGNBQ2MsTUFEZCxHQUN3QixJQUR4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QTtBQUFBLGNBQ2Usa0JBRGYsR0FDcUMsSUFEckMsQ0FDZSxrQkFEZjtBQUVQLGNBQUcsQ0FBQyxhQUFKLEVBQW1CLE9BQU8sVUFBVSxrQ0FBakI7QUFDbkIsY0FBRyxDQUFDLGtCQUFKLEVBQXdCLE9BQU8sVUFBVSw4Q0FBakI7QUFDeEIsVUFBQSxJQUFJLENBQUMsUUFBTCxDQUFjO0FBQ1osWUFBQSxLQUFLLEVBQUUsYUFESztBQUVaLFlBQUEsVUFBVSxFQUFFLGtCQUFrQixLQUFLLE1BQXZCLEdBQStCLElBQS9CLEdBQXFDLGtCQUZyQztBQUdaLFlBQUEsR0FBRyxFQUFFLGFBQWEsQ0FBQyxHQUhQO0FBSVosWUFBQSxHQUFHLEVBQUUsa0JBQWtCLEtBQUssTUFBdkIsR0FBK0IsRUFBL0IsR0FBbUMsa0JBQWtCLENBQUM7QUFKL0MsV0FBZDtBQU1BLGVBQUssS0FBTDtBQUNELFNBNUlNO0FBNklQLFFBQUEsVUE3SU8sd0JBNklNO0FBQUEsY0FDSixhQURJLEdBQ2EsSUFEYixDQUNKLGFBREk7QUFFWCxjQUFHLENBQUMsYUFBSixFQUFtQixPQUFPLFVBQVUsa0NBQWpCO0FBQ25CLFVBQUEsSUFBSSxDQUFDLFFBQUwsQ0FBYztBQUNaLFlBQUEsS0FBSyxFQUFFLGFBREs7QUFFWixZQUFBLEdBQUcsRUFBRSxhQUFhLENBQUM7QUFGUCxXQUFkO0FBSUEsZUFBSyxLQUFMO0FBQ0Q7QUFySk07QUE1R1EsS0FBUixDQUFYO0FBTFk7QUF5UWI7Ozs7eUJBQ0ksSyxFQUFPLE8sRUFBUztBQUNuQixXQUFLLEdBQUwsQ0FBUyxJQUFULENBQWMsS0FBZCxFQUFxQixPQUFyQjtBQUNEOzs7O0VBN1F5QixHQUFHLENBQUMsT0FBSixDQUFZLGM7O0FBK1F4QyxHQUFHLENBQUMsT0FBSixDQUFZLGFBQVosR0FBNEIsYUFBNUIiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJjbGFzcyBGb3J1bVNlbGVjdG9yIGV4dGVuZHMgTktDLm1vZHVsZXMuRHJhZ2dhYmxlUGFuZWwge1xyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgY29uc3QgZG9tSWQgPSBgI21vZHVsZUZvcnVtU2VsZWN0b3JgO1xyXG4gICAgc3VwZXIoZG9tSWQpO1xyXG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XHJcbiAgICBzZWxmLmRvbSA9ICQoZG9tSWQpO1xyXG4gICAgc2VsZi5hcHAgPSBuZXcgVnVlKHtcclxuICAgICAgZWw6IGRvbUlkICsgJ0FwcCcsXHJcbiAgICAgIGRhdGE6IHtcclxuICAgICAgICBsb2FkaW5nOiB0cnVlLFxyXG4gICAgICAgIC8vIOS4k+S4muaVsOe7hFxyXG4gICAgICAgIGZvcnVtczogW10sXHJcbiAgICAgICAgZm9ydW1DYXRlZ29yaWVzOiBbXSxcclxuICAgICAgICBzdWJzY3JpYmVGb3J1bXNJZDogW10sXHJcbiAgICAgICAgc2VsZWN0ZWRGb3J1bUNhdGVnb3J5OiAnJyxcclxuICAgICAgICBzZWxlY3RlZFBhcmVudEZvcnVtOiAnJyxcclxuICAgICAgICBzZWxlY3RlZEZvcnVtOiAnJyxcclxuICAgICAgICBzZWxlY3RlZFRocmVhZFR5cGU6ICcnLFxyXG5cclxuICAgICAgICAvLyDlpJbpg6jkvKDlhaUg5bey6YCJ5oup55qE5LiT5LiaSUQg55So5LqO56aB5q2i6YCJ5oup5bey6YCJ5LiT5LiaIOS4lOWPguS4juS4k+S4muWIhuexu+eahOS6kuaWpeWIpOaWrVxyXG4gICAgICAgIHNlbGVjdGVkRm9ydW1zSWQ6IFtdLFxyXG4gICAgICAgIC8vIOWklumDqOS8oOWFpSDlsY/olL3nmoTkuJPkuJog5ZCM5LiKXHJcbiAgICAgICAgZGlzYWJsZWRGb3J1bXNJZDogW10sXHJcbiAgICAgICAgLy8g5aSW6YOo5Lyg5YWlIOmrmOS6rueahOS4k+S4mlxyXG4gICAgICAgIGhpZ2hsaWdodEZvcnVtSWQ6ICcnLFxyXG5cclxuICAgICAgICBuZWVkVGhyZWFkVHlwZTogdHJ1ZSxcclxuICAgICAgICBzaG93VGhyZWFkVHlwZXM6IGZhbHNlLFxyXG4gICAgICB9LFxyXG4gICAgICBjb21wdXRlZDoge1xyXG4gICAgICAgIGZvcnVtRGF0YSgpIHtcclxuICAgICAgICAgIGNvbnN0IHtmb3J1bUNhdGVnb3JpZXMsIGZvcnVtc30gPSB0aGlzO1xyXG4gICAgICAgICAgY29uc3QgcmVzdWx0cyA9IFtdO1xyXG4gICAgICAgICAgY29uc3QgZm9ydW1zT2JqID0gW107XHJcbiAgICAgICAgICBmb3IoY29uc3QgZiBvZiBmb3J1bXMpIHtcclxuICAgICAgICAgICAgIGlmKCFmb3J1bXNPYmpbZi5jYXRlZ29yeUlkXSkgZm9ydW1zT2JqW2YuY2F0ZWdvcnlJZF0gPSBbXTtcclxuICAgICAgICAgICAgZm9ydW1zT2JqW2YuY2F0ZWdvcnlJZF0ucHVzaChmKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGZvcihjb25zdCBjIG9mIGZvcnVtQ2F0ZWdvcmllcykge1xyXG4gICAgICAgICAgICBjb25zdCBmID0gZm9ydW1zT2JqW2MuX2lkXTtcclxuICAgICAgICAgICAgaWYoIWYpIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICBjLmZvcnVtcyA9IGY7XHJcbiAgICAgICAgICAgIHJlc3VsdHMucHVzaChjKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHJldHVybiByZXN1bHRzO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc3Vic2NyaWJlRm9ydW1zKCkge1xyXG4gICAgICAgICAgY29uc3Qge2ZvcnVtcywgc3Vic2NyaWJlRm9ydW1zSWR9ID0gdGhpcztcclxuICAgICAgICAgIGlmKCFzdWJzY3JpYmVGb3J1bXNJZC5sZW5ndGgpIHJldHVybiBbXTtcclxuICAgICAgICAgIGNvbnN0IHJlc3VsdHMgPSBbXTtcclxuICAgICAgICAgIGZvcihjb25zdCBmIG9mIGZvcnVtcykge1xyXG4gICAgICAgICAgICBmb3IoY29uc3QgY2Ygb2YgZi5jaGlsZEZvcnVtcykge1xyXG4gICAgICAgICAgICAgIGlmKCFzdWJzY3JpYmVGb3J1bXNJZC5pbmNsdWRlcyhjZi5maWQpKSBjb250aW51ZTtcclxuICAgICAgICAgICAgICByZXN1bHRzLnB1c2goY2YpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICByZXR1cm4gcmVzdWx0cztcclxuICAgICAgICB9LFxyXG4gICAgICAgIGZvcnVtc09iaigpIHtcclxuICAgICAgICAgIGNvbnN0IHtmb3J1bXN9ID0gdGhpcztcclxuICAgICAgICAgIGNvbnN0IG9iaiA9IHt9O1xyXG4gICAgICAgICAgZm9yKGNvbnN0IGYgb2YgZm9ydW1zKSB7XHJcbiAgICAgICAgICAgIG9ialtmLmZpZF0gPSBmO1xyXG4gICAgICAgICAgICBmb3IoY29uc3QgZmYgb2YgZi5jaGlsZEZvcnVtcykge1xyXG4gICAgICAgICAgICAgIG9ialtmZi5maWRdID0gZmY7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHJldHVybiBvYmo7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBkaXNhYmxlZEZvcnVtQ2F0ZWdvcmllc0lkKCkge1xyXG4gICAgICAgICAgY29uc3Qge1xyXG4gICAgICAgICAgICBzZWxlY3RlZEZvcnVtc0lkLCBmb3J1bXNPYmosXHJcbiAgICAgICAgICAgIGZvcnVtQ2F0ZWdvcmllc0lkLCBmb3J1bUNhdGVnb3JpZXNPYmpcclxuICAgICAgICAgIH0gPSB0aGlzO1xyXG4gICAgICAgICAgbGV0IGFyciA9IFtdO1xyXG4gICAgICAgICAgbGV0IGV4Y2x1ZGVkRm9ydW1DYXRlZ29yaWVzSWQgPSBbXTtcclxuICAgICAgICAgIGZvcihjb25zdCBmaWQgb2Ygc2VsZWN0ZWRGb3J1bXNJZCkge1xyXG4gICAgICAgICAgICBjb25zdCBmb3J1bSA9IGZvcnVtc09ialtmaWRdO1xyXG4gICAgICAgICAgICBpZighZm9ydW0pIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICBjb25zdCBpbmRleCA9IGFyci5pbmRleE9mKGZvcnVtLmNhdGVnb3J5SWQpO1xyXG4gICAgICAgICAgICBpZihpbmRleCAhPT0gLTEpIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICBjb25zdCBjYXRlZ29yeSA9IGZvcnVtQ2F0ZWdvcmllc09ialtmb3J1bS5jYXRlZ29yeUlkXTtcclxuICAgICAgICAgICAgaWYoIWNhdGVnb3J5KSBjb250aW51ZTtcclxuICAgICAgICAgICAgY29uc3Qge1xyXG4gICAgICAgICAgICAgIGV4Y2x1ZGVkQ2F0ZWdvcmllc0lkXHJcbiAgICAgICAgICAgIH0gPSBjYXRlZ29yeTtcclxuICAgICAgICAgICAgZXhjbHVkZWRGb3J1bUNhdGVnb3JpZXNJZCA9IGV4Y2x1ZGVkRm9ydW1DYXRlZ29yaWVzSWQuY29uY2F0KGV4Y2x1ZGVkQ2F0ZWdvcmllc0lkKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGFyciA9IFtdO1xyXG4gICAgICAgICAgZm9yKGNvbnN0IGNpZCBvZiBleGNsdWRlZEZvcnVtQ2F0ZWdvcmllc0lkKSB7XHJcbiAgICAgICAgICAgIGlmKGFyci5pbmNsdWRlcyhjaWQpKSBjb250aW51ZTtcclxuICAgICAgICAgICAgYXJyLnB1c2goY2lkKTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICByZXR1cm4gYXJyO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZGlzYWJsZWRBbGxGb3J1bXNJZCgpIHtcclxuICAgICAgICAgIHJldHVybiB0aGlzLmRpc2FibGVkRm9ydW1zSWQuY29uY2F0KHRoaXMuc2VsZWN0ZWRGb3J1bXNJZCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBmb3J1bUNhdGVnb3JpZXNJZCgpIHtcclxuICAgICAgICAgIHJldHVybiB0aGlzLmZvcnVtQ2F0ZWdvcmllcy5tYXAoZmMgPT4gZmMuX2lkKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGZvcnVtQ2F0ZWdvcmllc09iaigpIHtcclxuICAgICAgICAgIGNvbnN0IHtmb3J1bUNhdGVnb3JpZXN9ID0gdGhpcztcclxuICAgICAgICAgIGNvbnN0IG9iaiA9IHt9O1xyXG4gICAgICAgICAgZm9yKGNvbnN0IGZjIG9mIGZvcnVtQ2F0ZWdvcmllcykge1xyXG4gICAgICAgICAgICBvYmpbZmMuX2lkXSA9IGZjO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgcmV0dXJuIG9iajtcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIG1vdW50ZWQoKSB7XHJcblxyXG4gICAgICB9LFxyXG4gICAgICBtZXRob2RzOiB7XHJcbiAgICAgICAgZ2V0VXJsOiBOS0MubWV0aG9kcy50b29scy5nZXRVcmwsXHJcbiAgICAgICAgb3BlbihjYWxsYmFjaywgb3B0aW9ucyA9IHt9KSB7XHJcbiAgICAgICAgICBzZWxmLmNhbGxiYWNrID0gY2FsbGJhY2s7XHJcbiAgICAgICAgICBjb25zdCB7XHJcbiAgICAgICAgICAgIGRpc2FibGVkRm9ydW1zSWQgPSBbXSxcclxuICAgICAgICAgICAgc2VsZWN0ZWRGb3J1bXNJZCA9IFtdLFxyXG4gICAgICAgICAgICBmcm9tID0gJ3dyaXRhYmxlJyxcclxuICAgICAgICAgICAgbmVlZFRocmVhZFR5cGUgPSB0cnVlLFxyXG4gICAgICAgICAgICBoaWdobGlnaHRGb3J1bUlkID0gJydcclxuICAgICAgICAgIH0gPSBvcHRpb25zO1xyXG4gICAgICAgICAgdGhpcy5kaXNhYmxlZEZvcnVtc0lkID0gZGlzYWJsZWRGb3J1bXNJZDtcclxuICAgICAgICAgIHRoaXMuc2VsZWN0ZWRGb3J1bXNJZCA9IHNlbGVjdGVkRm9ydW1zSWQ7XHJcbiAgICAgICAgICB0aGlzLm5lZWRUaHJlYWRUeXBlID0gbmVlZFRocmVhZFR5cGU7XHJcbiAgICAgICAgICB0aGlzLmhpZ2hsaWdodEZvcnVtSWQgPSBoaWdobGlnaHRGb3J1bUlkO1xyXG4gICAgICAgICAgdGhpcy5yZXNldFNlbGVjdG9yKCk7XHJcbiAgICAgICAgICBzZWxmLnNob3dQYW5lbCgpO1xyXG4gICAgICAgICAgbmtjQVBJKGAvZj90PXNlbGVjdG9yJmY9JHtmcm9tfWAsICdHRVQnKVxyXG4gICAgICAgICAgICAudGhlbihkYXRhID0+IHtcclxuICAgICAgICAgICAgICBzZWxmLmFwcC5sb2FkaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgc2VsZi5hcHAuaW5pdEZvcnVtcyhkYXRhKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLmNhdGNoKGVyciA9PiB7XHJcbiAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyKTtcclxuICAgICAgICAgICAgICBzd2VldEVycm9yKGVycik7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgY2xvc2UoKSB7XHJcbiAgICAgICAgICBzZWxmLmhpZGVQYW5lbCgpO1xyXG4gICAgICAgICAgdGhpcy5yZXNldFNlbGVjdG9yKCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBzZWxlY3RGb3J1bUNhdGVnb3J5KGMpIHtcclxuICAgICAgICAgIGlmKHRoaXMuZGlzYWJsZWRGb3J1bUNhdGVnb3JpZXNJZC5pbmNsdWRlcyhjLl9pZCkpIHJldHVybjtcclxuICAgICAgICAgIHRoaXMuc2VsZWN0ZWRGb3J1bUNhdGVnb3J5ID0gYztcclxuICAgICAgICAgIHRoaXMuc2VsZWN0ZWRGb3J1bSA9ICcnO1xyXG4gICAgICAgICAgdGhpcy5zZWxlY3RlZFBhcmVudEZvcnVtID0gJyc7XHJcbiAgICAgICAgICB0aGlzLnNlbGVjdGVkVGhyZWFkVHlwZSA9ICcnO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgaW5pdEZvcnVtcyhkYXRhKSB7XHJcbiAgICAgICAgICBjb25zdCB7Zm9ydW1DYXRlZ29yaWVzLCBmb3J1bXMsIHN1YnNjcmliZUZvcnVtc0lkfSA9IGRhdGE7XHJcbiAgICAgICAgICBjb25zdCBmb3J1bXNPYmogPSBbXTtcclxuICAgICAgICAgIGZvcihjb25zdCBmIG9mIGZvcnVtcykge1xyXG4gICAgICAgICAgICBpZighZm9ydW1zT2JqW2YuY2F0ZWdvcnlJZF0pIGZvcnVtc09ialtmLmNhdGVnb3J5SWRdID0gW107XHJcbiAgICAgICAgICAgIGZvcnVtc09ialtmLmNhdGVnb3J5SWRdLnB1c2goZik7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBmb3IoY29uc3QgYyBvZiBmb3J1bUNhdGVnb3JpZXMpIHtcclxuICAgICAgICAgICAgYy5mb3J1bXMgPSBmb3J1bXNPYmpbYy5faWRdIHx8IFtdO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgdGhpcy5mb3J1bXMgPSBmb3J1bXM7XHJcbiAgICAgICAgICB0aGlzLmZvcnVtQ2F0ZWdvcmllcyA9IGZvcnVtQ2F0ZWdvcmllcztcclxuICAgICAgICAgIHRoaXMuc3Vic2NyaWJlRm9ydW1zSWQgPSBzdWJzY3JpYmVGb3J1bXNJZDtcclxuICAgICAgICAgIGxldCBjYXRlZ29yeSA9IG51bGw7XHJcbiAgICAgICAgICBmb3IobGV0IGkgPSBmb3J1bUNhdGVnb3JpZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcclxuICAgICAgICAgICAgY29uc3QgYyA9IGZvcnVtQ2F0ZWdvcmllc1tpXTtcclxuICAgICAgICAgICAgaWYodGhpcy5kaXNhYmxlZEZvcnVtQ2F0ZWdvcmllc0lkLmluY2x1ZGVzKGMuX2lkKSkgY29udGludWU7XHJcbiAgICAgICAgICAgIGNhdGVnb3J5ID0gYztcclxuICAgICAgICAgICAgaWYoXHJcbiAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZEZvcnVtQ2F0ZWdvcnkgJiZcclxuICAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkRm9ydW1DYXRlZ29yeS5faWQgPT09IGMuX2lkXHJcbiAgICAgICAgICAgICkge1xyXG4gICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBpZihjYXRlZ29yeSkge1xyXG4gICAgICAgICAgICB0aGlzLnNlbGVjdEZvcnVtQ2F0ZWdvcnkoY2F0ZWdvcnkpO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5yZXNldFNlbGVjdG9yKCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICB0aGlzLmhpZ2hsaWdodEZvcnVtKCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBoaWdobGlnaHRGb3J1bSgpIHtcclxuICAgICAgICAgIGNvbnN0IHtmb3J1bURhdGEsIGhpZ2hsaWdodEZvcnVtSWR9ID0gdGhpcztcclxuICAgICAgICAgIGlmKCFoaWdobGlnaHRGb3J1bUlkKSByZXR1cm47XHJcbiAgICAgICAgICBsZXQgX3NlbGVjdGVkQ2F0ZWdvcnksIF9zZWxlY3RlZFBhcmVudEZvcnVtLCBfc2VsZWN0ZWRGb3J1bTtcclxuICAgICAgICAgIGxvb3AxOlxyXG4gICAgICAgICAgZm9yKGNvbnN0IGMgb2YgZm9ydW1EYXRhKSB7XHJcbiAgICAgICAgICAgIF9zZWxlY3RlZENhdGVnb3J5ID0gYztcclxuICAgICAgICAgICAgZm9yKGNvbnN0IHBmIG9mIGMuZm9ydW1zKSB7XHJcbiAgICAgICAgICAgICAgX3NlbGVjdGVkUGFyZW50Rm9ydW0gPSBwZjtcclxuICAgICAgICAgICAgICBmb3IoY29uc3QgZiBvZiBwZi5jaGlsZEZvcnVtcykge1xyXG4gICAgICAgICAgICAgICAgaWYoaGlnaGxpZ2h0Rm9ydW1JZCA9PT0gZi5maWQpIHtcclxuICAgICAgICAgICAgICAgICAgX3NlbGVjdGVkRm9ydW0gPSBmO1xyXG4gICAgICAgICAgICAgICAgICBicmVhayBsb29wMTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGlmKF9zZWxlY3RlZEZvcnVtKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRGb3J1bUNhdGVnb3J5ID0gX3NlbGVjdGVkQ2F0ZWdvcnk7XHJcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRQYXJlbnRGb3J1bSA9IF9zZWxlY3RlZFBhcmVudEZvcnVtO1xyXG4gICAgICAgICAgICB0aGlzLnNlbGVjdGVkRm9ydW0gPSBfc2VsZWN0ZWRGb3J1bTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIHNlbGVjdFBhcmVudEZvcnVtKHBmKSB7XHJcbiAgICAgICAgICBpZih0aGlzLmRpc2FibGVkQWxsRm9ydW1zSWQuaW5jbHVkZXMocGYuZmlkKSkgcmV0dXJuO1xyXG4gICAgICAgICAgdGhpcy5zZWxlY3RlZFBhcmVudEZvcnVtID0gcGY7XHJcbiAgICAgICAgICB0aGlzLnNlbGVjdGVkRm9ydW0gPSAnJztcclxuICAgICAgICAgIHRoaXMuc2VsZWN0ZWRUaHJlYWRUeXBlID0gJyc7XHJcbiAgICAgICAgICBpZih0aGlzLnNlbGVjdGVkUGFyZW50Rm9ydW0uY2hpbGRGb3J1bXMubGVuZ3RoID09PSAxKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0Rm9ydW0odGhpcy5zZWxlY3RlZFBhcmVudEZvcnVtLmNoaWxkRm9ydW1zWzBdKTtcclxuICAgICAgICAgIH0gZWxzZSBpZih0aGlzLnNlbGVjdGVkUGFyZW50Rm9ydW0uY2hpbGRGb3J1bXMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0Rm9ydW0odGhpcy5zZWxlY3RlZFBhcmVudEZvcnVtKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIHNlbGVjdEZvcnVtKGYpIHtcclxuICAgICAgICAgIGlmKHRoaXMuZGlzYWJsZWRBbGxGb3J1bXNJZC5pbmNsdWRlcyhmLmZpZCkpIHJldHVybjtcclxuICAgICAgICAgIHRoaXMuc2VsZWN0ZWRUaHJlYWRUeXBlID0gJyc7XHJcbiAgICAgICAgICB0aGlzLnNlbGVjdGVkRm9ydW0gPSBmO1xyXG4gICAgICAgICAgaWYoZi50aHJlYWRUeXBlcy5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgdGhpcy5zZWxlY3RUaHJlYWRUeXBlKCdub25lJyk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBzZWxlY3RUaHJlYWRUeXBlKHR0KSB7XHJcbiAgICAgICAgICB0aGlzLnNlbGVjdGVkVGhyZWFkVHlwZSA9IHR0O1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgbmV4dCgpIHtcclxuICAgICAgICAgIHRoaXMuc2hvd1RocmVhZFR5cGVzID0gdHJ1ZTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHByZXZpb3VzKCkge1xyXG4gICAgICAgICAgdGhpcy5zaG93VGhyZWFkVHlwZXMgPSBmYWxzZTtcclxuICAgICAgICAgIHRoaXMuc2VsZWN0ZWRUaHJlYWRUeXBlID0gJyc7XHJcbiAgICAgICAgfSxcclxuICAgICAgICByZXNldFNlbGVjdG9yKCkge1xyXG4gICAgICAgICAgdGhpcy5zZWxlY3RlZEZvcnVtQ2F0ZWdvcnkgPSAnJztcclxuICAgICAgICAgIHRoaXMuc2VsZWN0ZWRGb3J1bSA9ICcnO1xyXG4gICAgICAgICAgdGhpcy5zZWxlY3RlZFBhcmVudEZvcnVtID0gJyc7XHJcbiAgICAgICAgICB0aGlzLnNlbGVjdGVkVGhyZWFkVHlwZSA9ICcnO1xyXG4gICAgICAgICAgdGhpcy5zaG93VGhyZWFkVHlwZXMgPSBmYWxzZTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHN1Ym1pdCgpIHtcclxuICAgICAgICAgIGNvbnN0IHtzZWxlY3RlZEZvcnVtLCBzZWxlY3RlZFRocmVhZFR5cGV9ID0gdGhpcztcclxuICAgICAgICAgIGlmKCFzZWxlY3RlZEZvcnVtKSByZXR1cm4gc3dlZXRFcnJvcihg6K+36YCJ5oup5LiT5LiaYCk7XHJcbiAgICAgICAgICBpZighc2VsZWN0ZWRUaHJlYWRUeXBlKSByZXR1cm4gc3dlZXRFcnJvcihg6K+36YCJ5oup5paH56ug5YiG57G7YCk7XHJcbiAgICAgICAgICBzZWxmLmNhbGxiYWNrKHtcclxuICAgICAgICAgICAgZm9ydW06IHNlbGVjdGVkRm9ydW0sXHJcbiAgICAgICAgICAgIHRocmVhZFR5cGU6IHNlbGVjdGVkVGhyZWFkVHlwZSA9PT0gJ25vbmUnPyBudWxsOiBzZWxlY3RlZFRocmVhZFR5cGUsXHJcbiAgICAgICAgICAgIGZpZDogc2VsZWN0ZWRGb3J1bS5maWQsXHJcbiAgICAgICAgICAgIGNpZDogc2VsZWN0ZWRUaHJlYWRUeXBlID09PSAnbm9uZSc/ICcnOiBzZWxlY3RlZFRocmVhZFR5cGUuY2lkXHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICAgIHRoaXMuY2xvc2UoKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGZhc3RTdWJtaXQoKSB7XHJcbiAgICAgICAgICBjb25zdCB7c2VsZWN0ZWRGb3J1bX0gPSB0aGlzO1xyXG4gICAgICAgICAgaWYoIXNlbGVjdGVkRm9ydW0pIHJldHVybiBzd2VldEVycm9yKGDor7fpgInmi6nkuJPkuJpgKTtcclxuICAgICAgICAgIHNlbGYuY2FsbGJhY2soe1xyXG4gICAgICAgICAgICBmb3J1bTogc2VsZWN0ZWRGb3J1bSxcclxuICAgICAgICAgICAgZmlkOiBzZWxlY3RlZEZvcnVtLmZpZCxcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgdGhpcy5jbG9zZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSlcclxuICB9XHJcbiAgb3Blbihwcm9wcywgb3B0aW9ucykge1xyXG4gICAgdGhpcy5hcHAub3Blbihwcm9wcywgb3B0aW9ucyk7XHJcbiAgfVxyXG59XHJcbk5LQy5tb2R1bGVzLkZvcnVtU2VsZWN0b3IgPSBGb3J1bVNlbGVjdG9yO1xyXG4iXX0=
