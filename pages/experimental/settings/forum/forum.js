(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var data = NKC.methods.getDataById('data');
window.app = new Vue({
  el: '#app',
  data: {
    forumName: '',
    forums: data.forums,
    forumSettings: data.forumSettings,
    forumCategories: data.forumCategories,
    updating: false
  },
  mounted: function mounted() {
    setTimeout(function () {
      floatForumPanel.initPanel();
    }, 500);
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

        var _iterator = _createForOfIteratorHelper(forumCategories),
            _step;

        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var fc = _step.value;
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
          _iterator.e(err);
        } finally {
          _iterator.f();
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
    getAllStyleInput: function getAllStyleInput() {},
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
      var _this$getInput = this.getInput(),
          style = _this$getInput.style,
          allStyle = _this$getInput.allStyle;

      var _iterator2 = _createForOfIteratorHelper(style),
          _step2;

      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var d = _step2.value;
          var value = d.attr('value');
          d.prop('checked', value === t);
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }

      var _iterator3 = _createForOfIteratorHelper(allStyle),
          _step3;

      try {
        for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
          var _d = _step3.value;

          var _value = _d.attr('value');

          _d.prop('checked', _value === t);
        }
      } catch (err) {
        _iterator3.e(err);
      } finally {
        _iterator3.f();
      }
    },
    selectAllCover: function selectAllCover(t) {
      var _this$getInput2 = this.getInput(),
          cover = _this$getInput2.cover,
          allCover = _this$getInput2.allCover;

      var _iterator4 = _createForOfIteratorHelper(cover),
          _step4;

      try {
        for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
          var d = _step4.value;
          var value = d.attr('value');
          d.prop('checked', value === t);
        }
      } catch (err) {
        _iterator4.e(err);
      } finally {
        _iterator4.f();
      }

      var _iterator5 = _createForOfIteratorHelper(allCover),
          _step5;

      try {
        for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
          var _d2 = _step5.value;

          var _value2 = _d2.attr('value');

          _d2.prop('checked', _value2 === t);
        }
      } catch (err) {
        _iterator5.e(err);
      } finally {
        _iterator5.f();
      }
    },
    getForumsInfo: function getForumsInfo() {
      var _this$getInput3 = this.getInput(),
          style = _this$getInput3.style,
          cover = _this$getInput3.cover,
          order = _this$getInput3.order;

      var styleObj = {},
          coverObj = {},
          orderObj = {};

      var _iterator6 = _createForOfIteratorHelper(style),
          _step6;

      try {
        for (_iterator6.s(); !(_step6 = _iterator6.n()).done;) {
          var s = _step6.value;
          if (!s.prop('checked')) continue;
          var value = s.attr('value');

          var _fid = s.attr('data-fid');

          styleObj[_fid] = value;
        }
      } catch (err) {
        _iterator6.e(err);
      } finally {
        _iterator6.f();
      }

      var _iterator7 = _createForOfIteratorHelper(cover),
          _step7;

      try {
        for (_iterator7.s(); !(_step7 = _iterator7.n()).done;) {
          var c = _step7.value;
          if (!c.prop('checked')) continue;

          var _value3 = c.attr('value');

          var _fid2 = c.attr('data-fid');

          coverObj[_fid2] = _value3;
        }
      } catch (err) {
        _iterator7.e(err);
      } finally {
        _iterator7.f();
      }

      var _iterator8 = _createForOfIteratorHelper(order),
          _step8;

      try {
        for (_iterator8.s(); !(_step8 = _iterator8.n()).done;) {
          var o = _step8.value;

          var _fid3 = o.attr('data-fid');

          orderObj[_fid3] = Number(o.val());
        }
      } catch (err) {
        _iterator8.e(err);
      } finally {
        _iterator8.f();
      }

      var results = [];

      for (var fid in styleObj) {
        if (!styleObj.hasOwnProperty(fid)) continue;
        results.push({
          fid: fid,
          threadListStyle: {
            type: styleObj[fid],
            cover: coverObj[fid]
          },
          order: orderObj[fid]
        });
      }

      return results;
    }
  }
});

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwYWdlcy9leHBlcmltZW50YWwvc2V0dGluZ3MvZm9ydW0vZm9ydW0ubWpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7QUNBQSxJQUFNLElBQUksR0FBRyxHQUFHLENBQUMsT0FBSixDQUFZLFdBQVosQ0FBd0IsTUFBeEIsQ0FBYjtBQUVBLE1BQU0sQ0FBQyxHQUFQLEdBQWEsSUFBSSxHQUFKLENBQVE7QUFDbkIsRUFBQSxFQUFFLEVBQUUsTUFEZTtBQUVuQixFQUFBLElBQUksRUFBRTtBQUNKLElBQUEsU0FBUyxFQUFFLEVBRFA7QUFFSixJQUFBLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFGVDtBQUdKLElBQUEsYUFBYSxFQUFFLElBQUksQ0FBQyxhQUhoQjtBQUlKLElBQUEsZUFBZSxFQUFFLElBQUksQ0FBQyxlQUpsQjtBQUtKLElBQUEsUUFBUSxFQUFFO0FBTE4sR0FGYTtBQVNuQixFQUFBLE9BVG1CLHFCQVNUO0FBQ1IsSUFBQSxVQUFVLENBQUMsWUFBTTtBQUNmLE1BQUEsZUFBZSxDQUFDLFNBQWhCO0FBQ0QsS0FGUyxFQUVQLEdBRk8sQ0FBVjtBQUdELEdBYmtCO0FBY25CLEVBQUEsT0FBTyxFQUFFO0FBQ1AsSUFBQSxNQUFNLEVBQUUsR0FBRyxDQUFDLE9BQUosQ0FBWSxLQUFaLENBQWtCLE1BRG5CO0FBRVAsSUFBQSxZQUZPLDBCQUVRO0FBQ2IsVUFBTSxJQUFJLEdBQUcsSUFBYjtBQUNBLE1BQUEsYUFBYSw0RUFBYixDQUNHLElBREgsQ0FDUSxZQUFNO0FBQ1YsUUFBQSxJQUFJLENBQUMsUUFBTCxHQUFnQixJQUFoQjtBQUNBLGVBQU8sTUFBTSxzQkFBc0IsTUFBdEIsQ0FBYjtBQUNELE9BSkgsRUFLRyxJQUxILENBS1EsWUFBTTtBQUNWLFFBQUEsWUFBWSw0QkFBWjtBQUNBLFFBQUEsSUFBSSxDQUFDLFFBQUwsR0FBZ0IsS0FBaEI7QUFDRCxPQVJI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QSxHQUFHLEVBQUgsR0FEVztBQUVYLFVBQUEsZUFBZSxFQUFFO0FBQ2YsWUFBQSxJQUFJLEVBQUUsUUFBUSxDQUFDLEdBQUQsQ0FEQztBQUVmLFlBQUEsS0FBSyxFQUFFLFFBQVEsQ0FBQyxHQUFEO0FBRkEsV0FGTjtBQU1YLFVBQUEsS0FBSyxFQUFFLFFBQVEsQ0FBQyxHQUFEO0FBTkosU0FBYjtBQVFEOztBQUNELGFBQU8sT0FBUDtBQUNEO0FBN0tNO0FBZFUsQ0FBUixDQUFiIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiY29uc3QgZGF0YSA9IE5LQy5tZXRob2RzLmdldERhdGFCeUlkKCdkYXRhJyk7XHJcblxyXG53aW5kb3cuYXBwID0gbmV3IFZ1ZSh7XHJcbiAgZWw6ICcjYXBwJyxcclxuICBkYXRhOiB7XHJcbiAgICBmb3J1bU5hbWU6ICcnLFxyXG4gICAgZm9ydW1zOiBkYXRhLmZvcnVtcyxcclxuICAgIGZvcnVtU2V0dGluZ3M6IGRhdGEuZm9ydW1TZXR0aW5ncyxcclxuICAgIGZvcnVtQ2F0ZWdvcmllczogZGF0YS5mb3J1bUNhdGVnb3JpZXMsXHJcbiAgICB1cGRhdGluZzogZmFsc2UsXHJcbiAgfSxcclxuICBtb3VudGVkKCkge1xyXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgIGZsb2F0Rm9ydW1QYW5lbC5pbml0UGFuZWwoKTtcclxuICAgIH0sIDUwMClcclxuICB9LFxyXG4gIG1ldGhvZHM6IHtcclxuICAgIGdldFVybDogTktDLm1ldGhvZHMudG9vbHMuZ2V0VXJsLFxyXG4gICAgdXBkYXRlRm9ydW1zKCkge1xyXG4gICAgICBjb25zdCBzZWxmID0gdGhpcztcclxuICAgICAgc3dlZXRRdWVzdGlvbihg56Gu5a6a6KaB5Yi35paw5omA5pyJ5LiT5Lia5L+h5oGv77yfYClcclxuICAgICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICBzZWxmLnVwZGF0aW5nID0gdHJ1ZTtcclxuICAgICAgICAgIHJldHVybiBua2NBUEkoYC9lL3NldHRpbmdzL2ZvcnVtYCwgJ1BPU1QnKTtcclxuICAgICAgICB9KVxyXG4gICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgIHN3ZWV0U3VjY2Vzcyhg5Yi35paw5oiQ5YqfYCk7XHJcbiAgICAgICAgICBzZWxmLnVwZGF0aW5nID0gZmFsc2U7XHJcbiAgICAgICAgfSlcclxuICAgICAgICAuY2F0Y2goZXJyID0+IHtcclxuICAgICAgICAgIHN3ZWV0RXJyb3IoZXJyKTtcclxuICAgICAgICAgIHNlbGYudXBkYXRpbmcgPSBmYWxzZTtcclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcbiAgICBtb3ZlKGluZGV4LCBhcnIsIGRpcmVjdGlvbikge1xyXG4gICAgICBpZihcclxuICAgICAgICAoaW5kZXggPT09IDAgJiYgZGlyZWN0aW9uID09PSAnbGVmdCcpIHx8XHJcbiAgICAgICAgKGluZGV4ICsgMSA9PT0gYXJyLmxlbmd0aCAmJiBkaXJlY3Rpb24gPT09ICdyaWdodCcpXHJcbiAgICAgICkgcmV0dXJuO1xyXG4gICAgICBjb25zdCBmb3J1bSA9IGFycltpbmRleF07XHJcbiAgICAgIGxldCBfaW5kZXg7XHJcbiAgICAgIGlmKGRpcmVjdGlvbiA9PT0gJ2xlZnQnKSB7XHJcbiAgICAgICAgX2luZGV4ID0gaW5kZXggLSAxO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIF9pbmRleCA9IGluZGV4ICsgMTtcclxuICAgICAgfVxyXG4gICAgICBjb25zdCBfZm9ydW0gPSBhcnJbX2luZGV4XTtcclxuICAgICAgYXJyW19pbmRleF0gPSBmb3J1bTtcclxuICAgICAgVnVlLnNldChhcnIsIGluZGV4LCBfZm9ydW0pO1xyXG4gICAgfSxcclxuICAgIHNhdmUoKSB7XHJcbiAgICAgIGNvbnN0IGZpZEFyciA9IHRoaXMuZm9ydW1zLm1hcChmID0+IGYuZmlkKTtcclxuICAgICAgY29uc3Qge2ZvcnVtQ2F0ZWdvcmllcywgZm9ydW1TZXR0aW5nc30gPSB0aGlzO1xyXG4gICAgICBjb25zdCB7cmVjeWNsZX0gPSBmb3J1bVNldHRpbmdzO1xyXG4gICAgICBjb25zdCB7Y2hlY2tTdHJpbmd9ID0gTktDLm1ldGhvZHMuY2hlY2tEYXRhO1xyXG4gICAgICBjb25zdCBmb3J1bXNJbmZvID0gdGhpcy5nZXRGb3J1bXNJbmZvKCk7XHJcbiAgICAgIFByb21pc2UucmVzb2x2ZSgpXHJcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgaWYoIXJlY3ljbGUpIHRocm93ICfor7fovpPlhaXlm57mlLbnq5nkuJPkuJpJRCc7XHJcbiAgICAgICAgICBmb3IoY29uc3QgZmMgb2YgZm9ydW1DYXRlZ29yaWVzKSB7XHJcbiAgICAgICAgICAgIGNoZWNrU3RyaW5nKGZjLm5hbWUsIHtcclxuICAgICAgICAgICAgICBuYW1lOiAn5YiG57G75ZCNJyxcclxuICAgICAgICAgICAgICBtaW5MZW5ndGg6IDEsXHJcbiAgICAgICAgICAgICAgbWF4TGVuZ3RoOiAyMFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgY2hlY2tTdHJpbmcoZmMuZGVzY3JpcHRpb24sIHtcclxuICAgICAgICAgICAgICBuYW1lOiAn5YiG57G75LuL57uNJyxcclxuICAgICAgICAgICAgICBtaW5MZW5ndGg6IDAsXHJcbiAgICAgICAgICAgICAgbWF4TGVuZ3RoOiAxMDBcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgcmV0dXJuIG5rY0FQSSgnL2Uvc2V0dGluZ3MvZm9ydW0nLCAnUFVUJywge2ZvcnVtc0luZm8sIGNhdGVnb3JpZXM6IGZvcnVtQ2F0ZWdvcmllcywgcmVjeWNsZX0pO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgc3dlZXRTdWNjZXNzKCfkv53lrZjmiJDlip8nKTtcclxuICAgICAgICB9KVxyXG4gICAgICAgIC5jYXRjaChzd2VldEVycm9yKTtcclxuICAgIH0sXHJcbiAgICBhZGRGb3J1bSgpIHtcclxuICAgICAgY29uc3QgZm9ydW1OYW1lID0gdGhpcy5mb3J1bU5hbWU7XHJcbiAgICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xyXG4gICAgICBQcm9taXNlLnJlc29sdmUoKVxyXG4gICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgIGlmKCFmb3J1bU5hbWUpIHRocm93ICfkuJPkuJrlkI3np7DkuI3og73kuLrnqbonO1xyXG4gICAgICAgICAgcmV0dXJuIHN3ZWV0UXVlc3Rpb24oYOehruWumuimgeWIm+W7uuS4k+S4muOAjCR7Zm9ydW1OYW1lfeOAjeWQl++8n2ApO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgcmV0dXJuIG5rY0FQSSgnL2YnLCAnUE9TVCcsIHtkaXNwbGF5TmFtZTogZm9ydW1OYW1lfSlcclxuICAgICAgICB9KVxyXG4gICAgICAgIC50aGVuKGRhdGEgPT4ge1xyXG4gICAgICAgICAgc3dlZXRTdWNjZXNzKCfliJvlu7rmiJDlip8nKTtcclxuICAgICAgICAgIC8vIHNlbGYuZm9ydW1zID0gZGF0YS5mb3J1bXM7XHJcbiAgICAgICAgfSlcclxuICAgICAgICAuY2F0Y2goc3dlZXRFcnJvcik7XHJcbiAgICB9LFxyXG4gICAgYWRkRm9ydW1DYXRlZ29yeSgpIHtcclxuICAgICAgdGhpcy5mb3J1bUNhdGVnb3JpZXMucHVzaCh7XHJcbiAgICAgICAgbmFtZTogJycsXHJcbiAgICAgICAgZGVzY3JpcHRpb246ICcnLFxyXG4gICAgICAgIGRpc3BsYXlTdHlsZTogJ3NpbXBsZSdcclxuICAgICAgfSk7XHJcbiAgICB9LFxyXG4gICAgcmVtb3ZlKGluZGV4LCBhcnIpIHtcclxuICAgICAgYXJyLnNwbGljZShpbmRleCwgMSk7XHJcbiAgICB9LFxyXG4gICAgZ2V0QWxsU3R5bGVJbnB1dCgpIHtcclxuXHJcbiAgICB9LFxyXG4gICAgZ2V0SW5wdXQoKSB7XHJcbiAgICAgIGNvbnN0IGlucHV0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2lucHV0Jyk7XHJcbiAgICAgIGNvbnN0IHJlc3VsdHMgPSB7XHJcbiAgICAgICAgc3R5bGU6IFtdLFxyXG4gICAgICAgIGFsbFN0eWxlOiBbXSxcclxuICAgICAgICBjb3ZlcjogW10sXHJcbiAgICAgICAgYWxsQ292ZXI6IFtdLFxyXG4gICAgICAgIG9yZGVyOiBbXVxyXG4gICAgICB9O1xyXG4gICAgICBmb3IobGV0IGkgPSAwOyBpIDwgaW5wdXQubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBjb25zdCBkb20gPSAkKGlucHV0W2ldKTtcclxuICAgICAgICBjb25zdCBuYW1lID0gZG9tLmF0dHIoJ2RhdGEtbmFtZScpO1xyXG4gICAgICAgIGlmKG5hbWUgPT09ICdmb3J1bVRocmVhZExpc3QnKSB7XHJcbiAgICAgICAgICByZXN1bHRzLnN0eWxlLnB1c2goZG9tKTtcclxuICAgICAgICB9IGVsc2UgaWYobmFtZSA9PT0gJ2ZvcnVtQ292ZXInKSB7XHJcbiAgICAgICAgICByZXN1bHRzLmNvdmVyLnB1c2goZG9tKTtcclxuICAgICAgICB9IGVsc2UgaWYobmFtZSA9PT0gJ2FsbFRocmVhZExpc3QnKSB7XHJcbiAgICAgICAgICByZXN1bHRzLmFsbFN0eWxlLnB1c2goZG9tKTtcclxuICAgICAgICB9IGVsc2UgaWYobmFtZSA9PT0gJ2FsbENvdmVyJykge1xyXG4gICAgICAgICAgcmVzdWx0cy5hbGxDb3Zlci5wdXNoKGRvbSk7XHJcbiAgICAgICAgfSBlbHNlIGlmKG5hbWUgPT09ICdmb3J1bU9yZGVyJykge1xyXG4gICAgICAgICAgcmVzdWx0cy5vcmRlci5wdXNoKGRvbSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiByZXN1bHRzO1xyXG4gICAgfSxcclxuICAgIHNlbGVjdEFsbFRocmVhZExpc3RTdHlsZSh0KSB7XHJcbiAgICAgIGNvbnN0IHtzdHlsZSwgYWxsU3R5bGV9ID0gdGhpcy5nZXRJbnB1dCgpO1xyXG4gICAgICBmb3IoY29uc3QgZCBvZiBzdHlsZSkge1xyXG4gICAgICAgIGNvbnN0IHZhbHVlID0gZC5hdHRyKCd2YWx1ZScpO1xyXG4gICAgICAgIGQucHJvcCgnY2hlY2tlZCcsIHZhbHVlID09PSB0KTtcclxuICAgICAgfVxyXG4gICAgICBmb3IoY29uc3QgZCBvZiBhbGxTdHlsZSkge1xyXG4gICAgICAgIGNvbnN0IHZhbHVlID0gZC5hdHRyKCd2YWx1ZScpO1xyXG4gICAgICAgIGQucHJvcCgnY2hlY2tlZCcsIHZhbHVlID09PSB0KTtcclxuICAgICAgfVxyXG4gICAgfSxcclxuICAgIHNlbGVjdEFsbENvdmVyKHQpIHtcclxuICAgICAgY29uc3Qge2NvdmVyLCBhbGxDb3Zlcn0gPSB0aGlzLmdldElucHV0KCk7XHJcbiAgICAgIGZvcihjb25zdCBkIG9mIGNvdmVyKSB7XHJcbiAgICAgICAgY29uc3QgdmFsdWUgPSBkLmF0dHIoJ3ZhbHVlJyk7XHJcbiAgICAgICAgZC5wcm9wKCdjaGVja2VkJywgdmFsdWUgPT09IHQpO1xyXG4gICAgICB9XHJcbiAgICAgIGZvcihjb25zdCBkIG9mIGFsbENvdmVyKSB7XHJcbiAgICAgICAgY29uc3QgdmFsdWUgPSBkLmF0dHIoJ3ZhbHVlJyk7XHJcbiAgICAgICAgZC5wcm9wKCdjaGVja2VkJywgdmFsdWUgPT09IHQpO1xyXG4gICAgICB9XHJcbiAgICB9LFxyXG4gICAgZ2V0Rm9ydW1zSW5mbygpIHtcclxuICAgICAgY29uc3Qge3N0eWxlLCBjb3Zlciwgb3JkZXJ9ID0gdGhpcy5nZXRJbnB1dCgpO1xyXG4gICAgICBjb25zdCBzdHlsZU9iaiA9IHt9LCBjb3Zlck9iaiA9IHt9LCBvcmRlck9iaiA9IHt9O1xyXG4gICAgICBmb3IoY29uc3QgcyBvZiBzdHlsZSkge1xyXG4gICAgICAgIGlmKCFzLnByb3AoJ2NoZWNrZWQnKSkgY29udGludWU7XHJcbiAgICAgICAgY29uc3QgdmFsdWUgPSBzLmF0dHIoJ3ZhbHVlJyk7XHJcbiAgICAgICAgY29uc3QgZmlkID0gcy5hdHRyKCdkYXRhLWZpZCcpO1xyXG4gICAgICAgIHN0eWxlT2JqW2ZpZF0gPSB2YWx1ZTtcclxuICAgICAgfVxyXG4gICAgICBmb3IoY29uc3QgYyBvZiBjb3Zlcikge1xyXG4gICAgICAgIGlmKCFjLnByb3AoJ2NoZWNrZWQnKSkgY29udGludWU7XHJcbiAgICAgICAgY29uc3QgdmFsdWUgPSBjLmF0dHIoJ3ZhbHVlJyk7XHJcbiAgICAgICAgY29uc3QgZmlkID0gYy5hdHRyKCdkYXRhLWZpZCcpO1xyXG4gICAgICAgIGNvdmVyT2JqW2ZpZF0gPSB2YWx1ZTtcclxuICAgICAgfVxyXG4gICAgICBmb3IoY29uc3QgbyBvZiBvcmRlcikge1xyXG4gICAgICAgIGNvbnN0IGZpZCA9IG8uYXR0cignZGF0YS1maWQnKTtcclxuICAgICAgICBvcmRlck9ialtmaWRdID0gTnVtYmVyKG8udmFsKCkpO1xyXG4gICAgICB9XHJcbiAgICAgIGNvbnN0IHJlc3VsdHMgPSBbXTtcclxuICAgICAgZm9yKGNvbnN0IGZpZCBpbiBzdHlsZU9iaikge1xyXG4gICAgICAgIGlmKCFzdHlsZU9iai5oYXNPd25Qcm9wZXJ0eShmaWQpKSBjb250aW51ZTtcclxuICAgICAgICByZXN1bHRzLnB1c2goe1xyXG4gICAgICAgICAgZmlkLFxyXG4gICAgICAgICAgdGhyZWFkTGlzdFN0eWxlOiB7XHJcbiAgICAgICAgICAgIHR5cGU6IHN0eWxlT2JqW2ZpZF0sXHJcbiAgICAgICAgICAgIGNvdmVyOiBjb3Zlck9ialtmaWRdLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIG9yZGVyOiBvcmRlck9ialtmaWRdXHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHJlc3VsdHM7XHJcbiAgICB9XHJcbiAgfVxyXG59KTtcclxuIl19
