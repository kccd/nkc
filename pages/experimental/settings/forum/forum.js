(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var data = NKC.methods.getDataById('data');
var forums = [];
var levels = [];

var func = function func(arr) {
  var level = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
  var index = levels.indexOf(level);
  if (index === -1) levels.push(level);

  var _iterator = _createForOfIteratorHelper(arr),
      _step;

  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var f = _step.value;
      f.level = level;
      forums.push(f);

      if (f.childForums && f.childForums.length) {
        func(f.childForums, level + 1);
      }
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
};

func(data.forums);
window.app = new Vue({
  el: '#app',
  data: {
    levels: levels,
    selectedLevels: levels,
    selectedReviewForumCert: data.forumSettings.reviewNewForumCert || [],
    selectedNewForumCert: data.forumSettings.openNewForumCert || [],
    selectedNewForumGrade: data.forumSettings.openNewForumGrade || [],
    selectedRelationship: data.forumSettings.openNewForumRelationship,
    forumName: '',
    forums: forums,
    forumSettings: data.forumSettings,
    forumCategories: data.forumCategories,
    reviewNewForumCerts: data.certs.roles,
    reviewNewForumGrades: data.certs.grades,
    reviewNewForumGuide: data.forumSettings.reviewNewForumGuide,
    founderGuide: data.forumSettings.founderGuide,
    updating: false
  },
  mounted: function mounted() {
    setTimeout(function () {
      floatForumPanel.initPanel();
    }, 500);
  },
  computed: {
    listTypeCount: function listTypeCount() {
      var forums = this.forums;
      var type = {
        "abstract": 0,
        brief: 0,
        minimalist: 0
      };

      var _iterator2 = _createForOfIteratorHelper(forums),
          _step2;

      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var f = _step2.value;
          type[f.threadListStyle.type]++;
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }

      return type;
    },
    coverCount: function coverCount() {
      var forums = this.forums;
      var type = {
        left: 0,
        right: 0,
        "null": 0
      };

      var _iterator3 = _createForOfIteratorHelper(forums),
          _step3;

      try {
        for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
          var f = _step3.value;
          type[f.threadListStyle.cover]++;
        }
      } catch (err) {
        _iterator3.e(err);
      } finally {
        _iterator3.f();
      }

      return type;
    }
  },
  methods: {
    getUrl: NKC.methods.tools.getUrl,
    updateForums: function updateForums() {
      var self = this;
      sweetQuestion("\u786E\u5B9A\u8981\u5237\u65B0\u6240\u6709\u4E13\u4E1A\u4FE1\u606F\uFF1F").then(function () {
        self.updating = true;
        return nkcAPI("/e/settings/forum", 'POST');
      }).then(function () {
        sweetSuccess("\u5237\u65B0\u6210\u529F");
        self.updating = false;
      })["catch"](function (err) {
        sweetError(err);
        self.updating = false;
      });
    },
    move: function move(index, arr, direction) {
      if (index === 0 && direction === 'left' || index + 1 === arr.length && direction === 'right') return;
      var forum = arr[index];

      var _index;

      if (direction === 'left') {
        _index = index - 1;
      } else {
        _index = index + 1;
      }

      var _forum = arr[_index];
      arr[_index] = forum;
      Vue.set(arr, index, _forum);
    },
    save: function save() {
      var fidArr = this.forums.map(function (f) {
        return f.fid;
      });
      var forumCategories = this.forumCategories,
          forumSettings = this.forumSettings,
          selectedReviewForumCert = this.selectedReviewForumCert,
          reviewNewForumGuide = this.reviewNewForumGuide,
          founderGuide = this.founderGuide,
          selectedNewForumCert = this.selectedNewForumCert,
          selectedNewForumGrade = this.selectedNewForumGrade,
          selectedRelationship = this.selectedRelationship;
      var recycle = forumSettings.recycle,
          archive = forumSettings.archive;
      var checkString = NKC.methods.checkData.checkString;
      var forumsInfo = this.getForumsInfo();
      Promise.resolve().then(function () {
        if (!recycle) throw '请输入回收站专业ID';
        if (!archive) throw '请输入归档专业ID';

        var _iterator4 = _createForOfIteratorHelper(forumCategories),
            _step4;

        try {
          for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
            var fc = _step4.value;
            checkString(fc.name, {
              name: '分类名',
              minLength: 1,
              maxLength: 20
            });
            checkString(fc.description, {
              name: '分类介绍',
              minLength: 0,
              maxLength: 100
            });
          }
        } catch (err) {
          _iterator4.e(err);
        } finally {
          _iterator4.f();
        }

        return nkcAPI('/e/settings/forum', 'PUT', {
          forumsInfo: forumsInfo,
          categories: forumCategories,
          recycle: recycle,
          archive: archive,
          selectedReviewForumCert: selectedReviewForumCert,
          reviewNewForumGuide: reviewNewForumGuide,
          founderGuide: founderGuide,
          selectedNewForumCert: selectedNewForumCert,
          selectedNewForumGrade: selectedNewForumGrade,
          selectedRelationship: selectedRelationship
        });
      }).then(function () {
        sweetSuccess('保存成功');
      })["catch"](sweetError);
    },
    addForum: function addForum() {
      var forumName = this.forumName;
      var self = this;
      Promise.resolve().then(function () {
        if (!forumName) throw '专业名称不能为空';
        return sweetQuestion("\u786E\u5B9A\u8981\u521B\u5EFA\u4E13\u4E1A\u300C".concat(forumName, "\u300D\u5417\uFF1F"));
      }).then(function () {
        return nkcAPI('/f', 'POST', {
          displayName: forumName
        });
      }).then(function (data) {
        sweetSuccess('创建成功'); // self.forums = data.forums;
      })["catch"](sweetError);
    },
    addForumCategory: function addForumCategory() {
      this.forumCategories.push({
        name: '',
        description: '',
        displayStyle: 'simple'
      });
    },
    remove: function remove(index, arr) {
      arr.splice(index, 1);
    },
    getInput: function getInput() {
      var input = document.getElementsByTagName('input');
      var results = {
        style: [],
        allStyle: [],
        cover: [],
        allCover: [],
        order: []
      };

      for (var i = 0; i < input.length; i++) {
        var dom = $(input[i]);
        var name = dom.attr('data-name');

        if (name === 'forumThreadList') {
          results.style.push(dom);
        } else if (name === 'forumCover') {
          results.cover.push(dom);
        } else if (name === 'allThreadList') {
          results.allStyle.push(dom);
        } else if (name === 'allCover') {
          results.allCover.push(dom);
        } else if (name === 'forumOrder') {
          results.order.push(dom);
        }
      }

      return results;
    },
    selectAllThreadListStyle: function selectAllThreadListStyle(t) {
      var forums = this.forums;

      var _iterator5 = _createForOfIteratorHelper(forums),
          _step5;

      try {
        for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
          var f = _step5.value;
          f.threadListStyle.type = t;
        }
      } catch (err) {
        _iterator5.e(err);
      } finally {
        _iterator5.f();
      }
    },
    selectAllCover: function selectAllCover(t) {
      var forums = this.forums;

      var _iterator6 = _createForOfIteratorHelper(forums),
          _step6;

      try {
        for (_iterator6.s(); !(_step6 = _iterator6.n()).done;) {
          var f = _step6.value;
          f.threadListStyle.cover = t;
        }
      } catch (err) {
        _iterator6.e(err);
      } finally {
        _iterator6.f();
      }
    },
    getForumsInfo: function getForumsInfo() {
      var forums = this.forums;
      var results = [];

      var _iterator7 = _createForOfIteratorHelper(forums),
          _step7;

      try {
        for (_iterator7.s(); !(_step7 = _iterator7.n()).done;) {
          var forum = _step7.value;
          results.push({
            fid: forum.fid,
            threadListStyle: {
              type: forum.threadListStyle.type,
              cover: forum.threadListStyle.cover
            },
            order: forum.order
          });
        }
      } catch (err) {
        _iterator7.e(err);
      } finally {
        _iterator7.f();
      }

      return results;
    }
  }
});

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwYWdlcy9leHBlcmltZW50YWwvc2V0dGluZ3MvZm9ydW0vZm9ydW0ubWpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7QUNBQSxJQUFNLElBQUksR0FBRyxHQUFHLENBQUMsT0FBSixDQUFZLFdBQVosQ0FBd0IsTUFBeEIsQ0FBYjtBQUVBLElBQU0sTUFBTSxHQUFHLEVBQWY7QUFFQSxJQUFNLE1BQU0sR0FBRyxFQUFmOztBQUVBLElBQU0sSUFBSSxHQUFHLFNBQVAsSUFBTyxDQUFDLEdBQUQsRUFBb0I7QUFBQSxNQUFkLEtBQWMsdUVBQU4sQ0FBTTtBQUMvQixNQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsT0FBUCxDQUFlLEtBQWYsQ0FBZDtBQUNBLE1BQUcsS0FBSyxLQUFLLENBQUMsQ0FBZCxFQUFpQixNQUFNLENBQUMsSUFBUCxDQUFZLEtBQVo7O0FBRmMsNkNBR2hCLEdBSGdCO0FBQUE7O0FBQUE7QUFHL0Isd0RBQW9CO0FBQUEsVUFBVixDQUFVO0FBQ2xCLE1BQUEsQ0FBQyxDQUFDLEtBQUYsR0FBVSxLQUFWO0FBQ0EsTUFBQSxNQUFNLENBQUMsSUFBUCxDQUFZLENBQVo7O0FBQ0EsVUFBRyxDQUFDLENBQUMsV0FBRixJQUFpQixDQUFDLENBQUMsV0FBRixDQUFjLE1BQWxDLEVBQTBDO0FBQ3hDLFFBQUEsSUFBSSxDQUFDLENBQUMsQ0FBQyxXQUFILEVBQWdCLEtBQUssR0FBRyxDQUF4QixDQUFKO0FBQ0Q7QUFDRjtBQVQ4QjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBVWhDLENBVkQ7O0FBWUEsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFOLENBQUo7QUFFQSxNQUFNLENBQUMsR0FBUCxHQUFhLElBQUksR0FBSixDQUFRO0FBQ25CLEVBQUEsRUFBRSxFQUFFLE1BRGU7QUFFbkIsRUFBQSxJQUFJLEVBQUU7QUFDSixJQUFBLE1BQU0sRUFBTixNQURJO0FBRUos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Y2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiY29uc3QgZGF0YSA9IE5LQy5tZXRob2RzLmdldERhdGFCeUlkKCdkYXRhJyk7XHJcblxyXG5jb25zdCBmb3J1bXMgPSBbXTtcclxuXHJcbmNvbnN0IGxldmVscyA9IFtdO1xyXG5cclxuY29uc3QgZnVuYyA9IChhcnIsIGxldmVsID0gMSkgPT4ge1xyXG4gIGNvbnN0IGluZGV4ID0gbGV2ZWxzLmluZGV4T2YobGV2ZWwpO1xyXG4gIGlmKGluZGV4ID09PSAtMSkgbGV2ZWxzLnB1c2gobGV2ZWwpO1xyXG4gIGZvcihjb25zdCBmIG9mIGFycikge1xyXG4gICAgZi5sZXZlbCA9IGxldmVsO1xyXG4gICAgZm9ydW1zLnB1c2goZik7XHJcbiAgICBpZihmLmNoaWxkRm9ydW1zICYmIGYuY2hpbGRGb3J1bXMubGVuZ3RoKSB7XHJcbiAgICAgIGZ1bmMoZi5jaGlsZEZvcnVtcywgbGV2ZWwgKyAxKTtcclxuICAgIH1cclxuICB9XHJcbn07XHJcblxyXG5mdW5jKGRhdGEuZm9ydW1zKTtcclxuXHJcbndpbmRvdy5hcHAgPSBuZXcgVnVlKHtcclxuICBlbDogJyNhcHAnLFxyXG4gIGRhdGE6IHtcclxuICAgIGxldmVscyxcclxuICAgIHNlbGVjdGVkTGV2ZWxzOiBsZXZlbHMsXHJcbiAgICBzZWxlY3RlZFJldmlld0ZvcnVtQ2VydDogZGF0YS5mb3J1bVNldHRpbmdzLnJldmlld05ld0ZvcnVtQ2VydCB8fCBbXSxcclxuICAgIHNlbGVjdGVkTmV3Rm9ydW1DZXJ0OiBkYXRhLmZvcnVtU2V0dGluZ3Mub3Blbk5ld0ZvcnVtQ2VydCB8fCBbXSxcclxuICAgIHNlbGVjdGVkTmV3Rm9ydW1HcmFkZTogZGF0YS5mb3J1bVNldHRpbmdzLm9wZW5OZXdGb3J1bUdyYWRlIHx8IFtdLFxyXG4gICAgc2VsZWN0ZWRSZWxhdGlvbnNoaXA6IGRhdGEuZm9ydW1TZXR0aW5ncy5vcGVuTmV3Rm9ydW1SZWxhdGlvbnNoaXAsXHJcbiAgICBmb3J1bU5hbWU6ICcnLFxyXG4gICAgZm9ydW1zLFxyXG4gICAgZm9ydW1TZXR0aW5nczogZGF0YS5mb3J1bVNldHRpbmdzLFxyXG4gICAgZm9ydW1DYXRlZ29yaWVzOiBkYXRhLmZvcnVtQ2F0ZWdvcmllcyxcclxuICAgIHJldmlld05ld0ZvcnVtQ2VydHM6IGRhdGEuY2VydHMucm9sZXMsXHJcbiAgICByZXZpZXdOZXdGb3J1bUdyYWRlczogZGF0YS5jZXJ0cy5ncmFkZXMsXHJcbiAgICByZXZpZXdOZXdGb3J1bUd1aWRlOiBkYXRhLmZvcnVtU2V0dGluZ3MucmV2aWV3TmV3Rm9ydW1HdWlkZSxcclxuICAgIGZvdW5kZXJHdWlkZTogZGF0YS5mb3J1bVNldHRpbmdzLmZvdW5kZXJHdWlkZSxcclxuICAgIHVwZGF0aW5nOiBmYWxzZSxcclxuICB9LFxyXG4gIG1vdW50ZWQoKSB7XHJcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgZmxvYXRGb3J1bVBhbmVsLmluaXRQYW5lbCgpO1xyXG4gICAgfSwgNTAwKVxyXG4gIH0sXHJcbiAgY29tcHV0ZWQ6IHtcclxuICAgIGxpc3RUeXBlQ291bnQoKSB7XHJcbiAgICAgIGNvbnN0IHtmb3J1bXN9ID0gdGhpcztcclxuICAgICAgY29uc3QgdHlwZSA9IHtcclxuICAgICAgICBhYnN0cmFjdDogMCxcclxuICAgICAgICBicmllZjogMCxcclxuICAgICAgICBtaW5pbWFsaXN0OiAwXHJcbiAgICAgIH07XHJcbiAgICAgIGZvcihjb25zdCBmIG9mIGZvcnVtcykge1xyXG4gICAgICAgIHR5cGVbZi50aHJlYWRMaXN0U3R5bGUudHlwZV0gKys7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHR5cGU7XHJcbiAgICB9LFxyXG4gICAgY292ZXJDb3VudCgpIHtcclxuICAgICAgY29uc3Qge2ZvcnVtc30gPSB0aGlzO1xyXG4gICAgICBjb25zdCB0eXBlID0ge1xyXG4gICAgICAgIGxlZnQ6IDAsXHJcbiAgICAgICAgcmlnaHQ6IDAsXHJcbiAgICAgICAgXCJudWxsXCI6IDBcclxuICAgICAgfTtcclxuICAgICAgZm9yKGNvbnN0IGYgb2YgZm9ydW1zKSB7XHJcbiAgICAgICAgdHlwZVtmLnRocmVhZExpc3RTdHlsZS5jb3Zlcl0gKys7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHR5cGU7XHJcbiAgICB9XHJcbiAgfSxcclxuICBtZXRob2RzOiB7XHJcbiAgICBnZXRVcmw6IE5LQy5tZXRob2RzLnRvb2xzLmdldFVybCxcclxuICAgIHVwZGF0ZUZvcnVtcygpIHtcclxuICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XHJcbiAgICAgIHN3ZWV0UXVlc3Rpb24oYOehruWumuimgeWIt+aWsOaJgOacieS4k+S4muS/oeaBr++8n2ApXHJcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgc2VsZi51cGRhdGluZyA9IHRydWU7XHJcbiAgICAgICAgICByZXR1cm4gbmtjQVBJKGAvZS9zZXR0aW5ncy9mb3J1bWAsICdQT1NUJyk7XHJcbiAgICAgICAgfSlcclxuICAgICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICBzd2VldFN1Y2Nlc3MoYOWIt+aWsOaIkOWKn2ApO1xyXG4gICAgICAgICAgc2VsZi51cGRhdGluZyA9IGZhbHNlO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLmNhdGNoKGVyciA9PiB7XHJcbiAgICAgICAgICBzd2VldEVycm9yKGVycik7XHJcbiAgICAgICAgICBzZWxmLnVwZGF0aW5nID0gZmFsc2U7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG4gICAgbW92ZShpbmRleCwgYXJyLCBkaXJlY3Rpb24pIHtcclxuICAgICAgaWYoXHJcbiAgICAgICAgKGluZGV4ID09PSAwICYmIGRpcmVjdGlvbiA9PT0gJ2xlZnQnKSB8fFxyXG4gICAgICAgIChpbmRleCArIDEgPT09IGFyci5sZW5ndGggJiYgZGlyZWN0aW9uID09PSAncmlnaHQnKVxyXG4gICAgICApIHJldHVybjtcclxuICAgICAgY29uc3QgZm9ydW0gPSBhcnJbaW5kZXhdO1xyXG4gICAgICBsZXQgX2luZGV4O1xyXG4gICAgICBpZihkaXJlY3Rpb24gPT09ICdsZWZ0Jykge1xyXG4gICAgICAgIF9pbmRleCA9IGluZGV4IC0gMTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBfaW5kZXggPSBpbmRleCArIDE7XHJcbiAgICAgIH1cclxuICAgICAgY29uc3QgX2ZvcnVtID0gYXJyW19pbmRleF07XHJcbiAgICAgIGFycltfaW5kZXhdID0gZm9ydW07XHJcbiAgICAgIFZ1ZS5zZXQoYXJyLCBpbmRleCwgX2ZvcnVtKTtcclxuICAgIH0sXHJcbiAgICBzYXZlKCkge1xyXG4gICAgICBjb25zdCBmaWRBcnIgPSB0aGlzLmZvcnVtcy5tYXAoZiA9PiBmLmZpZCk7XHJcbiAgICAgIGNvbnN0IHtcclxuICAgICAgICBmb3J1bUNhdGVnb3JpZXMsXHJcbiAgICAgICAgZm9ydW1TZXR0aW5ncyxcclxuICAgICAgICBzZWxlY3RlZFJldmlld0ZvcnVtQ2VydCxcclxuICAgICAgICByZXZpZXdOZXdGb3J1bUd1aWRlLFxyXG4gICAgICAgIGZvdW5kZXJHdWlkZSxcclxuICAgICAgICBzZWxlY3RlZE5ld0ZvcnVtQ2VydCxcclxuICAgICAgICBzZWxlY3RlZE5ld0ZvcnVtR3JhZGUsXHJcbiAgICAgICAgc2VsZWN0ZWRSZWxhdGlvbnNoaXBcclxuICAgICAgfSA9IHRoaXM7XHJcbiAgICAgIGNvbnN0IHtyZWN5Y2xlLCBhcmNoaXZlfSA9IGZvcnVtU2V0dGluZ3M7XHJcbiAgICAgIGNvbnN0IHtjaGVja1N0cmluZ30gPSBOS0MubWV0aG9kcy5jaGVja0RhdGE7XHJcbiAgICAgIGNvbnN0IGZvcnVtc0luZm8gPSB0aGlzLmdldEZvcnVtc0luZm8oKTtcclxuICAgICAgUHJvbWlzZS5yZXNvbHZlKClcclxuICAgICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICBpZighcmVjeWNsZSkgdGhyb3cgJ+ivt+i+k+WFpeWbnuaUtuermeS4k+S4mklEJztcclxuICAgICAgICAgIGlmKCFhcmNoaXZlKSB0aHJvdyAn6K+36L6T5YWl5b2S5qGj5LiT5LiaSUQnO1xyXG4gICAgICAgICAgZm9yKGNvbnN0IGZjIG9mIGZvcnVtQ2F0ZWdvcmllcykge1xyXG4gICAgICAgICAgICBjaGVja1N0cmluZyhmYy5uYW1lLCB7XHJcbiAgICAgICAgICAgICAgbmFtZTogJ+WIhuexu+WQjScsXHJcbiAgICAgICAgICAgICAgbWluTGVuZ3RoOiAxLFxyXG4gICAgICAgICAgICAgIG1heExlbmd0aDogMjBcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGNoZWNrU3RyaW5nKGZjLmRlc2NyaXB0aW9uLCB7XHJcbiAgICAgICAgICAgICAgbmFtZTogJ+WIhuexu+S7i+e7jScsXHJcbiAgICAgICAgICAgICAgbWluTGVuZ3RoOiAwLFxyXG4gICAgICAgICAgICAgIG1heExlbmd0aDogMTAwXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIHJldHVybiBua2NBUEkoJy9lL3NldHRpbmdzL2ZvcnVtJywgJ1BVVCcsIHtcclxuICAgICAgICAgICAgZm9ydW1zSW5mbyxcclxuICAgICAgICAgICAgY2F0ZWdvcmllczogZm9ydW1DYXRlZ29yaWVzLFxyXG4gICAgICAgICAgICByZWN5Y2xlLFxyXG4gICAgICAgICAgICBhcmNoaXZlLFxyXG4gICAgICAgICAgICBzZWxlY3RlZFJldmlld0ZvcnVtQ2VydCxcclxuICAgICAgICAgICAgcmV2aWV3TmV3Rm9ydW1HdWlkZSxcclxuICAgICAgICAgICAgZm91bmRlckd1aWRlLFxyXG4gICAgICAgICAgICBzZWxlY3RlZE5ld0ZvcnVtQ2VydCxcclxuICAgICAgICAgICAgc2VsZWN0ZWROZXdGb3J1bUdyYWRlLFxyXG4gICAgICAgICAgICBzZWxlY3RlZFJlbGF0aW9uc2hpcFxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfSlcclxuICAgICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICBzd2VldFN1Y2Nlc3MoJ+S/neWtmOaIkOWKnycpO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLmNhdGNoKHN3ZWV0RXJyb3IpO1xyXG4gICAgfSxcclxuICAgIGFkZEZvcnVtKCkge1xyXG4gICAgICBjb25zdCBmb3J1bU5hbWUgPSB0aGlzLmZvcnVtTmFtZTtcclxuICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XHJcbiAgICAgIFByb21pc2UucmVzb2x2ZSgpXHJcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgaWYoIWZvcnVtTmFtZSkgdGhyb3cgJ+S4k+S4muWQjeensOS4jeiDveS4uuepuic7XHJcbiAgICAgICAgICByZXR1cm4gc3dlZXRRdWVzdGlvbihg56Gu5a6a6KaB5Yib5bu65LiT5Lia44CMJHtmb3J1bU5hbWV944CN5ZCX77yfYCk7XHJcbiAgICAgICAgfSlcclxuICAgICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICByZXR1cm4gbmtjQVBJKCcvZicsICdQT1NUJywge2Rpc3BsYXlOYW1lOiBmb3J1bU5hbWV9KVxyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLnRoZW4oZGF0YSA9PiB7XHJcbiAgICAgICAgICBzd2VldFN1Y2Nlc3MoJ+WIm+W7uuaIkOWKnycpO1xyXG4gICAgICAgICAgLy8gc2VsZi5mb3J1bXMgPSBkYXRhLmZvcnVtcztcclxuICAgICAgICB9KVxyXG4gICAgICAgIC5jYXRjaChzd2VldEVycm9yKTtcclxuICAgIH0sXHJcbiAgICBhZGRGb3J1bUNhdGVnb3J5KCkge1xyXG4gICAgICB0aGlzLmZvcnVtQ2F0ZWdvcmllcy5wdXNoKHtcclxuICAgICAgICBuYW1lOiAnJyxcclxuICAgICAgICBkZXNjcmlwdGlvbjogJycsXHJcbiAgICAgICAgZGlzcGxheVN0eWxlOiAnc2ltcGxlJ1xyXG4gICAgICB9KTtcclxuICAgIH0sXHJcbiAgICByZW1vdmUoaW5kZXgsIGFycikge1xyXG4gICAgICBhcnIuc3BsaWNlKGluZGV4LCAxKTtcclxuICAgIH0sXHJcbiAgICBnZXRJbnB1dCgpIHtcclxuICAgICAgY29uc3QgaW5wdXQgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaW5wdXQnKTtcclxuICAgICAgY29uc3QgcmVzdWx0cyA9IHtcclxuICAgICAgICBzdHlsZTogW10sXHJcbiAgICAgICAgYWxsU3R5bGU6IFtdLFxyXG4gICAgICAgIGNvdmVyOiBbXSxcclxuICAgICAgICBhbGxDb3ZlcjogW10sXHJcbiAgICAgICAgb3JkZXI6IFtdXHJcbiAgICAgIH07XHJcbiAgICAgIGZvcihsZXQgaSA9IDA7IGkgPCBpbnB1dC5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGNvbnN0IGRvbSA9ICQoaW5wdXRbaV0pO1xyXG4gICAgICAgIGNvbnN0IG5hbWUgPSBkb20uYXR0cignZGF0YS1uYW1lJyk7XHJcbiAgICAgICAgaWYobmFtZSA9PT0gJ2ZvcnVtVGhyZWFkTGlzdCcpIHtcclxuICAgICAgICAgIHJlc3VsdHMuc3R5bGUucHVzaChkb20pO1xyXG4gICAgICAgIH0gZWxzZSBpZihuYW1lID09PSAnZm9ydW1Db3ZlcicpIHtcclxuICAgICAgICAgIHJlc3VsdHMuY292ZXIucHVzaChkb20pO1xyXG4gICAgICAgIH0gZWxzZSBpZihuYW1lID09PSAnYWxsVGhyZWFkTGlzdCcpIHtcclxuICAgICAgICAgIHJlc3VsdHMuYWxsU3R5bGUucHVzaChkb20pO1xyXG4gICAgICAgIH0gZWxzZSBpZihuYW1lID09PSAnYWxsQ292ZXInKSB7XHJcbiAgICAgICAgICByZXN1bHRzLmFsbENvdmVyLnB1c2goZG9tKTtcclxuICAgICAgICB9IGVsc2UgaWYobmFtZSA9PT0gJ2ZvcnVtT3JkZXInKSB7XHJcbiAgICAgICAgICByZXN1bHRzLm9yZGVyLnB1c2goZG9tKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHJlc3VsdHM7XHJcbiAgICB9LFxyXG4gICAgc2VsZWN0QWxsVGhyZWFkTGlzdFN0eWxlKHQpIHtcclxuICAgICAgY29uc3Qge2ZvcnVtc30gPSB0aGlzO1xyXG4gICAgICBmb3IoY29uc3QgZiBvZiBmb3J1bXMpIHtcclxuICAgICAgICBmLnRocmVhZExpc3RTdHlsZS50eXBlID0gdDtcclxuICAgICAgfVxyXG4gICAgfSxcclxuICAgIHNlbGVjdEFsbENvdmVyKHQpIHtcclxuICAgICAgY29uc3Qge2ZvcnVtc30gPSB0aGlzO1xyXG4gICAgICBmb3IoY29uc3QgZiBvZiBmb3J1bXMpIHtcclxuICAgICAgICBmLnRocmVhZExpc3RTdHlsZS5jb3ZlciA9IHQ7XHJcbiAgICAgIH1cclxuICAgIH0sXHJcbiAgICBnZXRGb3J1bXNJbmZvKCkge1xyXG4gICAgICBjb25zdCB7Zm9ydW1zfSA9IHRoaXM7XHJcbiAgICAgIGNvbnN0IHJlc3VsdHMgPSBbXTtcclxuICAgICAgZm9yKGNvbnN0IGZvcnVtIG9mIGZvcnVtcykge1xyXG4gICAgICAgIHJlc3VsdHMucHVzaCh7XHJcbiAgICAgICAgICBmaWQ6IGZvcnVtLmZpZCxcclxuICAgICAgICAgIHRocmVhZExpc3RTdHlsZToge1xyXG4gICAgICAgICAgICB0eXBlOiBmb3J1bS50aHJlYWRMaXN0U3R5bGUudHlwZSxcclxuICAgICAgICAgICAgY292ZXI6IGZvcnVtLnRocmVhZExpc3RTdHlsZS5jb3ZlcixcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICBvcmRlcjogZm9ydW0ub3JkZXJcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gcmVzdWx0cztcclxuICAgIH0sXHJcbiAgfVxyXG59KTtcclxuIl19
