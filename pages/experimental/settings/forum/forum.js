(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var data = NKC.methods.getDataById('data');
var app = new Vue({
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
          fidArr: fidArr,
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
    }
  }
});

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwYWdlcy9leHBlcmltZW50YWwvc2V0dGluZ3MvZm9ydW0vZm9ydW0ubWpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7QUNBQSxJQUFNLElBQUksR0FBRyxHQUFHLENBQUMsT0FBSixDQUFZLFdBQVosQ0FBd0IsTUFBeEIsQ0FBYjtBQUNBLE9BQU8sQ0FBQyxHQUFSLENBQVksSUFBWjtBQUNBLElBQU0sR0FBRyxHQUFHLElBQUksR0FBSixDQUFRO0FBQ2xCLEVBQUEsRUFBRSxFQUFFLE1BRGM7QUFFbEIsRUFBQSxJQUFJLEVBQUU7QUFDSixJQUFBLFNBQVMsRUFBRSxFQURQO0FBRUosSUFBQSxNQUFNLEVBQUUsSUFBSSxDQUFDLE1BRlQ7QUFHSixJQUFBLGFBQWEsRUFBRSxJQUFJLENBQUMsYUFIaEI7QUFJSixJQUFBLGVBQWUsRUFBRSxJQUFJLENBQUMsZUFKbEI7QUFLSixJQUFBLFFBQVEsRUFBRTtBQUxOLEdBRlk7QUFTbEIsRUFBQSxPQVRrQixxQkFTUjtBQUNSLElBQUEsVUFBVSxDQUFDLFlBQU07QUFDZixNQUFBLGVBQWUsQ0FBQyxTQUFoQjtBQUNELEtBRlMsRUFFUCxHQUZPLENBQVY7QUFHRCxHQWJpQjtBQWNsQixFQUFBLE9BQU8sRUFBRTtBQUNQLElBQUEsTUFBTSxFQUFFLEdBQUcsQ0FBQyxPQUFKLENBQVksS0FBWixDQUFrQixNQURuQjtBQUVQLElBQUEsWUFGTywwQkFFUTtBQUNiLFVBQU0sSUFBSSxHQUFHLElBQWI7QUFDQSxNQUFBLGFBQWEsNEVBQWIsQ0FDRyxJQURILENBQ1EsWUFBTTtBQUNWLFFBQUEsSUFBSSxDQUFDLFFBQUwsR0FBZ0IsSUFBaEI7QUFDQSxlQUFPLE1BQU0sc0JBQXNCLE1BQXRCLENBQWI7QUFDRCxPQUpILEVBS0csSUFMSCxDQUtRLFlBQU07QUFDVixRQUFBLFlBQVksNEJBQVo7QUFDQSxRQUFBLElBQUksQ0FBQyxR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S0csSUFMSCxDQUtRLFlBQU07QUFDVixlQUFPLE1BQU0sQ0FBQyxJQUFELEVBQU8sTUFBUCxFQUFlO0FBQUMsVUFBQSxXQUFXLEVBQUU7QUFBZCxTQUFmLENBQWI7QUFDRCxPQVBILEVBUUcsSUFSSCxDQVFRLFVBQUEsSUFBSSxFQUFJO0FBQ1osUUFBQSxZQUFZLENBQUMsTUFBRCxDQUFaLENBRFksQ0FFWjtBQUNELE9BWEgsV0FZUyxVQVpUO0FBYUQsS0E5RU07QUErRVAsSUFBQSxnQkEvRU8sOEJBK0VZO0FBQ2pCLFdBQUssZUFBTCxDQUFxQixJQUFyQixDQUEwQjtBQUN4QixRQUFBLElBQUksRUFBRSxFQURrQjtBQUV4QixRQUFBLFdBQVcsRUFBRSxFQUZXO0FBR3hCLFFBQUEsWUFBWSxFQUFFO0FBSFUsT0FBMUI7QUFLRCxLQXJGTTtBQXNGUCxJQUFBLE1BdEZPLGtCQXNGQSxLQXRGQSxFQXNGTyxHQXRGUCxFQXNGWTtBQUNqQixNQUFBLEdBQUcsQ0FBQyxNQUFKLENBQVcsS0FBWCxFQUFrQixDQUFsQjtBQUNEO0FBeEZNO0FBZFMsQ0FBUixDQUFaIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiY29uc3QgZGF0YSA9IE5LQy5tZXRob2RzLmdldERhdGFCeUlkKCdkYXRhJyk7XHJcbmNvbnNvbGUubG9nKGRhdGEpO1xyXG5jb25zdCBhcHAgPSBuZXcgVnVlKHtcclxuICBlbDogJyNhcHAnLFxyXG4gIGRhdGE6IHtcclxuICAgIGZvcnVtTmFtZTogJycsXHJcbiAgICBmb3J1bXM6IGRhdGEuZm9ydW1zLFxyXG4gICAgZm9ydW1TZXR0aW5nczogZGF0YS5mb3J1bVNldHRpbmdzLFxyXG4gICAgZm9ydW1DYXRlZ29yaWVzOiBkYXRhLmZvcnVtQ2F0ZWdvcmllcyxcclxuICAgIHVwZGF0aW5nOiBmYWxzZSxcclxuICB9LFxyXG4gIG1vdW50ZWQoKSB7XHJcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgZmxvYXRGb3J1bVBhbmVsLmluaXRQYW5lbCgpO1xyXG4gICAgfSwgNTAwKVxyXG4gIH0sXHJcbiAgbWV0aG9kczoge1xyXG4gICAgZ2V0VXJsOiBOS0MubWV0aG9kcy50b29scy5nZXRVcmwsXHJcbiAgICB1cGRhdGVGb3J1bXMoKSB7XHJcbiAgICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xyXG4gICAgICBzd2VldFF1ZXN0aW9uKGDnoa7lrpropoHliLfmlrDmiYDmnInkuJPkuJrkv6Hmga/vvJ9gKVxyXG4gICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgIHNlbGYudXBkYXRpbmcgPSB0cnVlO1xyXG4gICAgICAgICAgcmV0dXJuIG5rY0FQSShgL2Uvc2V0dGluZ3MvZm9ydW1gLCAnUE9TVCcpO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgc3dlZXRTdWNjZXNzKGDliLfmlrDmiJDlip9gKTtcclxuICAgICAgICAgIHNlbGYudXBkYXRpbmcgPSBmYWxzZTtcclxuICAgICAgICB9KVxyXG4gICAgICAgIC5jYXRjaChlcnIgPT4ge1xyXG4gICAgICAgICAgc3dlZXRFcnJvcihlcnIpO1xyXG4gICAgICAgICAgc2VsZi51cGRhdGluZyA9IGZhbHNlO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIG1vdmUoaW5kZXgsIGFyciwgZGlyZWN0aW9uKSB7XHJcbiAgICAgIGlmKFxyXG4gICAgICAgIChpbmRleCA9PT0gMCAmJiBkaXJlY3Rpb24gPT09ICdsZWZ0JykgfHxcclxuICAgICAgICAoaW5kZXggKyAxID09PSBhcnIubGVuZ3RoICYmIGRpcmVjdGlvbiA9PT0gJ3JpZ2h0JylcclxuICAgICAgKSByZXR1cm47XHJcbiAgICAgIGNvbnN0IGZvcnVtID0gYXJyW2luZGV4XTtcclxuICAgICAgbGV0IF9pbmRleDtcclxuICAgICAgaWYoZGlyZWN0aW9uID09PSAnbGVmdCcpIHtcclxuICAgICAgICBfaW5kZXggPSBpbmRleCAtIDE7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgX2luZGV4ID0gaW5kZXggKyAxO1xyXG4gICAgICB9XHJcbiAgICAgIGNvbnN0IF9mb3J1bSA9IGFycltfaW5kZXhdO1xyXG4gICAgICBhcnJbX2luZGV4XSA9IGZvcnVtO1xyXG4gICAgICBWdWUuc2V0KGFyciwgaW5kZXgsIF9mb3J1bSk7XHJcbiAgICB9LFxyXG4gICAgc2F2ZSgpIHtcclxuICAgICAgY29uc3QgZmlkQXJyID0gdGhpcy5mb3J1bXMubWFwKGYgPT4gZi5maWQpO1xyXG4gICAgICBjb25zdCB7Zm9ydW1DYXRlZ29yaWVzLCBmb3J1bVNldHRpbmdzfSA9IHRoaXM7XHJcbiAgICAgIGNvbnN0IHtyZWN5Y2xlfSA9IGZvcnVtU2V0dGluZ3M7XHJcbiAgICAgIGNvbnN0IHtjaGVja1N0cmluZ30gPSBOS0MubWV0aG9kcy5jaGVja0RhdGE7XHJcbiAgICAgIFByb21pc2UucmVzb2x2ZSgpXHJcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgaWYoIXJlY3ljbGUpIHRocm93ICfor7fovpPlhaXlm57mlLbnq5nkuJPkuJpJRCc7XHJcbiAgICAgICAgICBmb3IoY29uc3QgZmMgb2YgZm9ydW1DYXRlZ29yaWVzKSB7XHJcbiAgICAgICAgICAgIGNoZWNrU3RyaW5nKGZjLm5hbWUsIHtcclxuICAgICAgICAgICAgICBuYW1lOiAn5YiG57G75ZCNJyxcclxuICAgICAgICAgICAgICBtaW5MZW5ndGg6IDEsXHJcbiAgICAgICAgICAgICAgbWF4TGVuZ3RoOiAyMFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgY2hlY2tTdHJpbmcoZmMuZGVzY3JpcHRpb24sIHtcclxuICAgICAgICAgICAgICBuYW1lOiAn5YiG57G75LuL57uNJyxcclxuICAgICAgICAgICAgICBtaW5MZW5ndGg6IDAsXHJcbiAgICAgICAgICAgICAgbWF4TGVuZ3RoOiAxMDBcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgcmV0dXJuIG5rY0FQSSgnL2Uvc2V0dGluZ3MvZm9ydW0nLCAnUFVUJywge2ZpZEFyciwgY2F0ZWdvcmllczogZm9ydW1DYXRlZ29yaWVzLCByZWN5Y2xlfSk7XHJcbiAgICAgICAgfSlcclxuICAgICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICBzd2VldFN1Y2Nlc3MoJ+S/neWtmOaIkOWKnycpO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLmNhdGNoKHN3ZWV0RXJyb3IpO1xyXG4gICAgfSxcclxuICAgIGFkZEZvcnVtKCkge1xyXG4gICAgICBjb25zdCBmb3J1bU5hbWUgPSB0aGlzLmZvcnVtTmFtZTtcclxuICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XHJcbiAgICAgIFByb21pc2UucmVzb2x2ZSgpXHJcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgaWYoIWZvcnVtTmFtZSkgdGhyb3cgJ+S4k+S4muWQjeensOS4jeiDveS4uuepuic7XHJcbiAgICAgICAgICByZXR1cm4gc3dlZXRRdWVzdGlvbihg56Gu5a6a6KaB5Yib5bu65LiT5Lia44CMJHtmb3J1bU5hbWV944CN5ZCX77yfYCk7XHJcbiAgICAgICAgfSlcclxuICAgICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICByZXR1cm4gbmtjQVBJKCcvZicsICdQT1NUJywge2Rpc3BsYXlOYW1lOiBmb3J1bU5hbWV9KVxyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLnRoZW4oZGF0YSA9PiB7XHJcbiAgICAgICAgICBzd2VldFN1Y2Nlc3MoJ+WIm+W7uuaIkOWKnycpO1xyXG4gICAgICAgICAgLy8gc2VsZi5mb3J1bXMgPSBkYXRhLmZvcnVtcztcclxuICAgICAgICB9KVxyXG4gICAgICAgIC5jYXRjaChzd2VldEVycm9yKTtcclxuICAgIH0sXHJcbiAgICBhZGRGb3J1bUNhdGVnb3J5KCkge1xyXG4gICAgICB0aGlzLmZvcnVtQ2F0ZWdvcmllcy5wdXNoKHtcclxuICAgICAgICBuYW1lOiAnJyxcclxuICAgICAgICBkZXNjcmlwdGlvbjogJycsXHJcbiAgICAgICAgZGlzcGxheVN0eWxlOiAnc2ltcGxlJ1xyXG4gICAgICB9KTtcclxuICAgIH0sXHJcbiAgICByZW1vdmUoaW5kZXgsIGFycikge1xyXG4gICAgICBhcnIuc3BsaWNlKGluZGV4LCAxKTtcclxuICAgIH1cclxuICB9XHJcbn0pO1xyXG4iXX0=
