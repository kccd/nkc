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
    forumName: '',
    forums: forums,
    forumSettings: data.forumSettings,
    forumCategories: data.forumCategories,
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
          forumSettings = this.forumSettings;
      var recycle = forumSettings.recycle;
      var checkString = NKC.methods.checkData.checkString;
      var forumsInfo = this.getForumsInfo();
      Promise.resolve().then(function () {
        if (!recycle) throw '请输入回收站专业ID';

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
          recycle: recycle
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwYWdlcy9leHBlcmltZW50YWwvc2V0dGluZ3MvZm9ydW0vZm9ydW0ubWpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7QUNBQSxJQUFNLElBQUksR0FBRyxHQUFHLENBQUMsT0FBSixDQUFZLFdBQVosQ0FBd0IsTUFBeEIsQ0FBYjtBQUVBLElBQU0sTUFBTSxHQUFHLEVBQWY7QUFFQSxJQUFNLE1BQU0sR0FBRyxFQUFmOztBQUVBLElBQU0sSUFBSSxHQUFHLFNBQVAsSUFBTyxDQUFDLEdBQUQsRUFBb0I7QUFBQSxNQUFkLEtBQWMsdUVBQU4sQ0FBTTtBQUMvQixNQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsT0FBUCxDQUFlLEtBQWYsQ0FBZDtBQUNBLE1BQUcsS0FBSyxLQUFLLENBQUMsQ0FBZCxFQUFpQixNQUFNLENBQUMsSUFBUCxDQUFZLEtBQVo7O0FBRmMsNkNBR2hCLEdBSGdCO0FBQUE7O0FBQUE7QUFHL0Isd0RBQW9CO0FBQUEsVUFBVixDQUFVO0FBQ2xCLE1BQUEsQ0FBQyxDQUFDLEtBQUYsR0FBVSxLQUFWO0FBQ0EsTUFBQSxNQUFNLENBQUMsSUFBUCxDQUFZLENBQVo7O0FBQ0EsVUFBRyxDQUFDLENBQUMsV0FBRixJQUFpQixDQUFDLENBQUMsV0FBRixDQUFjLE1BQWxDLEVBQTBDO0FBQ3hDLFFBQUEsSUFBSSxDQUFDLENBQUMsQ0FBQyxXQUFILEVBQWdCLEtBQUssR0FBRyxDQUF4QixDQUFKO0FBQ0Q7QUFDRjtBQVQ4QjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBVWhDLENBVkQ7O0FBWUEsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFOLENBQUo7QUFFQSxNQUFNLENBQUMsR0FBUCxHQUFhLElBQUksR0FBSixDQUFRO0FBQ25CLEVBQUEsRUFBRSxFQUFFLE1BRGU7QUFFbkIsRUFBQSxJQUFJLEVBQUU7QUFDSixJQUFBLE1BQU0sRUFBTixNQURJO0FBRUos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VCxJQURTLENBQ25CLE1BRG1COztBQUFBLGtEQUVYLE1BRlc7QUFBQTs7QUFBQTtBQUUxQiwrREFBdUI7QUFBQSxjQUFiLENBQWE7QUFDckIsVUFBQSxDQUFDLENBQUMsZUFBRixDQUFrQixJQUFsQixHQUF5QixDQUF6QjtBQUNEO0FBSnlCO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFLM0IsS0F6SE07QUEwSFAsSUFBQSxjQTFITywwQkEwSFEsQ0ExSFIsRUEwSFc7QUFBQSxVQUNULE1BRFMsR0FDQyxJQURELENBQ1QsTUFEUzs7QUFBQSxrREFFRCxNQUZDO0FBQUE7O0FBQUE7QUFFaEIsK0RBQXVCO0FBQUEsY0FBYixDQUFhO0FBQ3JCLFVBQUEsQ0FBQyxDQUFDLGVBQUYsQ0FBa0IsS0FBbEIsR0FBMEIsQ0FBMUI7QUFDRDtBQUplO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFLakIsS0EvSE07QUFnSVAsSUFBQSxhQWhJTywyQkFnSVM7QUFBQSxVQUNQLE1BRE8sR0FDRyxJQURILENBQ1AsTUFETztBQUVkLFVBQU0sT0FBTyxHQUFHLEVBQWhCOztBQUZjLGtEQUdLLE1BSEw7QUFBQTs7QUFBQTtBQUdkLCtEQUEyQjtBQUFBLGNBQWpCLEtBQWlCO0FBQ3pCLFVBQUEsT0FBTyxDQUFDLElBQVIsQ0FBYTtBQUNYLFlBQUEsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQURBO0FBRVgsWUFBQSxlQUFlLEVBQUU7QUFDZixjQUFBLElBQUksRUFBRSxLQUFLLENBQUMsZUFBTixDQUFzQixJQURiO0FBRWYsY0FBQSxLQUFLLEVBQUUsS0FBSyxDQUFDLGVBQU4sQ0FBc0I7QUFGZCxhQUZOO0FBTVgsWUFBQSxLQUFLLEVBQUUsS0FBSyxDQUFDO0FBTkYsV0FBYjtBQVFEO0FBWmE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFhZCxhQUFPLE9BQVA7QUFDRDtBQTlJTTtBQTFDVSxDQUFSLENBQWIiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJjb25zdCBkYXRhID0gTktDLm1ldGhvZHMuZ2V0RGF0YUJ5SWQoJ2RhdGEnKTtcclxuXHJcbmNvbnN0IGZvcnVtcyA9IFtdO1xyXG5cclxuY29uc3QgbGV2ZWxzID0gW107XHJcblxyXG5jb25zdCBmdW5jID0gKGFyciwgbGV2ZWwgPSAxKSA9PiB7XHJcbiAgY29uc3QgaW5kZXggPSBsZXZlbHMuaW5kZXhPZihsZXZlbCk7XHJcbiAgaWYoaW5kZXggPT09IC0xKSBsZXZlbHMucHVzaChsZXZlbCk7XHJcbiAgZm9yKGNvbnN0IGYgb2YgYXJyKSB7XHJcbiAgICBmLmxldmVsID0gbGV2ZWw7XHJcbiAgICBmb3J1bXMucHVzaChmKTtcclxuICAgIGlmKGYuY2hpbGRGb3J1bXMgJiYgZi5jaGlsZEZvcnVtcy5sZW5ndGgpIHtcclxuICAgICAgZnVuYyhmLmNoaWxkRm9ydW1zLCBsZXZlbCArIDEpO1xyXG4gICAgfVxyXG4gIH1cclxufTtcclxuXHJcbmZ1bmMoZGF0YS5mb3J1bXMpO1xyXG5cclxud2luZG93LmFwcCA9IG5ldyBWdWUoe1xyXG4gIGVsOiAnI2FwcCcsXHJcbiAgZGF0YToge1xyXG4gICAgbGV2ZWxzLFxyXG4gICAgc2VsZWN0ZWRMZXZlbHM6IGxldmVscyxcclxuICAgIGZvcnVtTmFtZTogJycsXHJcbiAgICBmb3J1bXMsXHJcbiAgICBmb3J1bVNldHRpbmdzOiBkYXRhLmZvcnVtU2V0dGluZ3MsXHJcbiAgICBmb3J1bUNhdGVnb3JpZXM6IGRhdGEuZm9ydW1DYXRlZ29yaWVzLFxyXG4gICAgdXBkYXRpbmc6IGZhbHNlLFxyXG4gIH0sXHJcbiAgbW91bnRlZCgpIHtcclxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICBmbG9hdEZvcnVtUGFuZWwuaW5pdFBhbmVsKCk7XHJcbiAgICB9LCA1MDApXHJcbiAgfSxcclxuICBjb21wdXRlZDoge1xyXG4gICAgbGlzdFR5cGVDb3VudCgpIHtcclxuICAgICAgY29uc3Qge2ZvcnVtc30gPSB0aGlzO1xyXG4gICAgICBjb25zdCB0eXBlID0ge1xyXG4gICAgICAgIGFic3RyYWN0OiAwLFxyXG4gICAgICAgIGJyaWVmOiAwLFxyXG4gICAgICAgIG1pbmltYWxpc3Q6IDBcclxuICAgICAgfTtcclxuICAgICAgZm9yKGNvbnN0IGYgb2YgZm9ydW1zKSB7XHJcbiAgICAgICAgdHlwZVtmLnRocmVhZExpc3RTdHlsZS50eXBlXSArKztcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gdHlwZTtcclxuICAgIH0sXHJcbiAgICBjb3ZlckNvdW50KCkge1xyXG4gICAgICBjb25zdCB7Zm9ydW1zfSA9IHRoaXM7XHJcbiAgICAgIGNvbnN0IHR5cGUgPSB7XHJcbiAgICAgICAgbGVmdDogMCxcclxuICAgICAgICByaWdodDogMCxcclxuICAgICAgICBcIm51bGxcIjogMFxyXG4gICAgICB9O1xyXG4gICAgICBmb3IoY29uc3QgZiBvZiBmb3J1bXMpIHtcclxuICAgICAgICB0eXBlW2YudGhyZWFkTGlzdFN0eWxlLmNvdmVyXSArKztcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gdHlwZTtcclxuICAgIH1cclxuICB9LFxyXG4gIG1ldGhvZHM6IHtcclxuICAgIGdldFVybDogTktDLm1ldGhvZHMudG9vbHMuZ2V0VXJsLFxyXG4gICAgdXBkYXRlRm9ydW1zKCkge1xyXG4gICAgICBjb25zdCBzZWxmID0gdGhpcztcclxuICAgICAgc3dlZXRRdWVzdGlvbihg56Gu5a6a6KaB5Yi35paw5omA5pyJ5LiT5Lia5L+h5oGv77yfYClcclxuICAgICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICBzZWxmLnVwZGF0aW5nID0gdHJ1ZTtcclxuICAgICAgICAgIHJldHVybiBua2NBUEkoYC9lL3NldHRpbmdzL2ZvcnVtYCwgJ1BPU1QnKTtcclxuICAgICAgICB9KVxyXG4gICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgIHN3ZWV0U3VjY2Vzcyhg5Yi35paw5oiQ5YqfYCk7XHJcbiAgICAgICAgICBzZWxmLnVwZGF0aW5nID0gZmFsc2U7XHJcbiAgICAgICAgfSlcclxuICAgICAgICAuY2F0Y2goZXJyID0+IHtcclxuICAgICAgICAgIHN3ZWV0RXJyb3IoZXJyKTtcclxuICAgICAgICAgIHNlbGYudXBkYXRpbmcgPSBmYWxzZTtcclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcbiAgICBtb3ZlKGluZGV4LCBhcnIsIGRpcmVjdGlvbikge1xyXG4gICAgICBpZihcclxuICAgICAgICAoaW5kZXggPT09IDAgJiYgZGlyZWN0aW9uID09PSAnbGVmdCcpIHx8XHJcbiAgICAgICAgKGluZGV4ICsgMSA9PT0gYXJyLmxlbmd0aCAmJiBkaXJlY3Rpb24gPT09ICdyaWdodCcpXHJcbiAgICAgICkgcmV0dXJuO1xyXG4gICAgICBjb25zdCBmb3J1bSA9IGFycltpbmRleF07XHJcbiAgICAgIGxldCBfaW5kZXg7XHJcbiAgICAgIGlmKGRpcmVjdGlvbiA9PT0gJ2xlZnQnKSB7XHJcbiAgICAgICAgX2luZGV4ID0gaW5kZXggLSAxO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIF9pbmRleCA9IGluZGV4ICsgMTtcclxuICAgICAgfVxyXG4gICAgICBjb25zdCBfZm9ydW0gPSBhcnJbX2luZGV4XTtcclxuICAgICAgYXJyW19pbmRleF0gPSBmb3J1bTtcclxuICAgICAgVnVlLnNldChhcnIsIGluZGV4LCBfZm9ydW0pO1xyXG4gICAgfSxcclxuICAgIHNhdmUoKSB7XHJcbiAgICAgIGNvbnN0IGZpZEFyciA9IHRoaXMuZm9ydW1zLm1hcChmID0+IGYuZmlkKTtcclxuICAgICAgY29uc3Qge2ZvcnVtQ2F0ZWdvcmllcywgZm9ydW1TZXR0aW5nc30gPSB0aGlzO1xyXG4gICAgICBjb25zdCB7cmVjeWNsZX0gPSBmb3J1bVNldHRpbmdzO1xyXG4gICAgICBjb25zdCB7Y2hlY2tTdHJpbmd9ID0gTktDLm1ldGhvZHMuY2hlY2tEYXRhO1xyXG4gICAgICBjb25zdCBmb3J1bXNJbmZvID0gdGhpcy5nZXRGb3J1bXNJbmZvKCk7XHJcbiAgICAgIFByb21pc2UucmVzb2x2ZSgpXHJcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgaWYoIXJlY3ljbGUpIHRocm93ICfor7fovpPlhaXlm57mlLbnq5nkuJPkuJpJRCc7XHJcbiAgICAgICAgICBmb3IoY29uc3QgZmMgb2YgZm9ydW1DYXRlZ29yaWVzKSB7XHJcbiAgICAgICAgICAgIGNoZWNrU3RyaW5nKGZjLm5hbWUsIHtcclxuICAgICAgICAgICAgICBuYW1lOiAn5YiG57G75ZCNJyxcclxuICAgICAgICAgICAgICBtaW5MZW5ndGg6IDEsXHJcbiAgICAgICAgICAgICAgbWF4TGVuZ3RoOiAyMFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgY2hlY2tTdHJpbmcoZmMuZGVzY3JpcHRpb24sIHtcclxuICAgICAgICAgICAgICBuYW1lOiAn5YiG57G75LuL57uNJyxcclxuICAgICAgICAgICAgICBtaW5MZW5ndGg6IDAsXHJcbiAgICAgICAgICAgICAgbWF4TGVuZ3RoOiAxMDBcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgcmV0dXJuIG5rY0FQSSgnL2Uvc2V0dGluZ3MvZm9ydW0nLCAnUFVUJywge2ZvcnVtc0luZm8sIGNhdGVnb3JpZXM6IGZvcnVtQ2F0ZWdvcmllcywgcmVjeWNsZX0pO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgc3dlZXRTdWNjZXNzKCfkv53lrZjmiJDlip8nKTtcclxuICAgICAgICB9KVxyXG4gICAgICAgIC5jYXRjaChzd2VldEVycm9yKTtcclxuICAgIH0sXHJcbiAgICBhZGRGb3J1bSgpIHtcclxuICAgICAgY29uc3QgZm9ydW1OYW1lID0gdGhpcy5mb3J1bU5hbWU7XHJcbiAgICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xyXG4gICAgICBQcm9taXNlLnJlc29sdmUoKVxyXG4gICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgIGlmKCFmb3J1bU5hbWUpIHRocm93ICfkuJPkuJrlkI3np7DkuI3og73kuLrnqbonO1xyXG4gICAgICAgICAgcmV0dXJuIHN3ZWV0UXVlc3Rpb24oYOehruWumuimgeWIm+W7uuS4k+S4muOAjCR7Zm9ydW1OYW1lfeOAjeWQl++8n2ApO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgcmV0dXJuIG5rY0FQSSgnL2YnLCAnUE9TVCcsIHtkaXNwbGF5TmFtZTogZm9ydW1OYW1lfSlcclxuICAgICAgICB9KVxyXG4gICAgICAgIC50aGVuKGRhdGEgPT4ge1xyXG4gICAgICAgICAgc3dlZXRTdWNjZXNzKCfliJvlu7rmiJDlip8nKTtcclxuICAgICAgICAgIC8vIHNlbGYuZm9ydW1zID0gZGF0YS5mb3J1bXM7XHJcbiAgICAgICAgfSlcclxuICAgICAgICAuY2F0Y2goc3dlZXRFcnJvcik7XHJcbiAgICB9LFxyXG4gICAgYWRkRm9ydW1DYXRlZ29yeSgpIHtcclxuICAgICAgdGhpcy5mb3J1bUNhdGVnb3JpZXMucHVzaCh7XHJcbiAgICAgICAgbmFtZTogJycsXHJcbiAgICAgICAgZGVzY3JpcHRpb246ICcnLFxyXG4gICAgICAgIGRpc3BsYXlTdHlsZTogJ3NpbXBsZSdcclxuICAgICAgfSk7XHJcbiAgICB9LFxyXG4gICAgcmVtb3ZlKGluZGV4LCBhcnIpIHtcclxuICAgICAgYXJyLnNwbGljZShpbmRleCwgMSk7XHJcbiAgICB9LFxyXG4gICAgZ2V0SW5wdXQoKSB7XHJcbiAgICAgIGNvbnN0IGlucHV0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2lucHV0Jyk7XHJcbiAgICAgIGNvbnN0IHJlc3VsdHMgPSB7XHJcbiAgICAgICAgc3R5bGU6IFtdLFxyXG4gICAgICAgIGFsbFN0eWxlOiBbXSxcclxuICAgICAgICBjb3ZlcjogW10sXHJcbiAgICAgICAgYWxsQ292ZXI6IFtdLFxyXG4gICAgICAgIG9yZGVyOiBbXVxyXG4gICAgICB9O1xyXG4gICAgICBmb3IobGV0IGkgPSAwOyBpIDwgaW5wdXQubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBjb25zdCBkb20gPSAkKGlucHV0W2ldKTtcclxuICAgICAgICBjb25zdCBuYW1lID0gZG9tLmF0dHIoJ2RhdGEtbmFtZScpO1xyXG4gICAgICAgIGlmKG5hbWUgPT09ICdmb3J1bVRocmVhZExpc3QnKSB7XHJcbiAgICAgICAgICByZXN1bHRzLnN0eWxlLnB1c2goZG9tKTtcclxuICAgICAgICB9IGVsc2UgaWYobmFtZSA9PT0gJ2ZvcnVtQ292ZXInKSB7XHJcbiAgICAgICAgICByZXN1bHRzLmNvdmVyLnB1c2goZG9tKTtcclxuICAgICAgICB9IGVsc2UgaWYobmFtZSA9PT0gJ2FsbFRocmVhZExpc3QnKSB7XHJcbiAgICAgICAgICByZXN1bHRzLmFsbFN0eWxlLnB1c2goZG9tKTtcclxuICAgICAgICB9IGVsc2UgaWYobmFtZSA9PT0gJ2FsbENvdmVyJykge1xyXG4gICAgICAgICAgcmVzdWx0cy5hbGxDb3Zlci5wdXNoKGRvbSk7XHJcbiAgICAgICAgfSBlbHNlIGlmKG5hbWUgPT09ICdmb3J1bU9yZGVyJykge1xyXG4gICAgICAgICAgcmVzdWx0cy5vcmRlci5wdXNoKGRvbSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiByZXN1bHRzO1xyXG4gICAgfSxcclxuICAgIHNlbGVjdEFsbFRocmVhZExpc3RTdHlsZSh0KSB7XHJcbiAgICAgIGNvbnN0IHtmb3J1bXN9ID0gdGhpcztcclxuICAgICAgZm9yKGNvbnN0IGYgb2YgZm9ydW1zKSB7XHJcbiAgICAgICAgZi50aHJlYWRMaXN0U3R5bGUudHlwZSA9IHQ7XHJcbiAgICAgIH1cclxuICAgIH0sXHJcbiAgICBzZWxlY3RBbGxDb3Zlcih0KSB7XHJcbiAgICAgIGNvbnN0IHtmb3J1bXN9ID0gdGhpcztcclxuICAgICAgZm9yKGNvbnN0IGYgb2YgZm9ydW1zKSB7XHJcbiAgICAgICAgZi50aHJlYWRMaXN0U3R5bGUuY292ZXIgPSB0O1xyXG4gICAgICB9XHJcbiAgICB9LFxyXG4gICAgZ2V0Rm9ydW1zSW5mbygpIHtcclxuICAgICAgY29uc3Qge2ZvcnVtc30gPSB0aGlzO1xyXG4gICAgICBjb25zdCByZXN1bHRzID0gW107XHJcbiAgICAgIGZvcihjb25zdCBmb3J1bSBvZiBmb3J1bXMpIHtcclxuICAgICAgICByZXN1bHRzLnB1c2goe1xyXG4gICAgICAgICAgZmlkOiBmb3J1bS5maWQsXHJcbiAgICAgICAgICB0aHJlYWRMaXN0U3R5bGU6IHtcclxuICAgICAgICAgICAgdHlwZTogZm9ydW0udGhyZWFkTGlzdFN0eWxlLnR5cGUsXHJcbiAgICAgICAgICAgIGNvdmVyOiBmb3J1bS50aHJlYWRMaXN0U3R5bGUuY292ZXIsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgb3JkZXI6IGZvcnVtLm9yZGVyXHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHJlc3VsdHM7XHJcbiAgICB9LFxyXG4gIH1cclxufSk7XHJcbiJdfQ==
