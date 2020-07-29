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
    forumCategories: data.forumCategories
  },
  mounted: function mounted() {
    setTimeout(function () {
      floatForumPanel.initPanel();
    }, 500);
  },
  methods: {
    getUrl: NKC.methods.tools.getUrl,
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
      var forumCategories = this.forumCategories;
      var checkString = NKC.methods.checkData.checkString;
      Promise.resolve().then(function () {
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
          categories: forumCategories
        });
      }).then(function () {
        sweetSuccess('保存成功');
      })["catch"](sweetError);
    },
    addForum: function addForum() {
      var forumName = this.forumName;
      Promise.resolve().then(function () {
        if (!forumName) throw '专业名称不能为空';
        return sweetQuestion("\u786E\u5B9A\u8981\u521B\u5EFA\u4E13\u4E1A\u300C".concat(forumName, "\u300D\u5417\uFF1F"));
      }).then(function () {
        return nkcAPI('/f', 'POST', {
          displayName: forumName
        });
      }).then(function (data) {
        sweetSuccess('创建成功，正在前往专业设置');
        setTimeout(function () {
          NKC.methods.visitUrl("/f/".concat(data.forum.fid, "/settings"));
        }, 2000);
      })["catch"](sweetError);
    },
    addForumCategory: function addForumCategory() {
      this.forumCategories.push({
        name: '',
        description: ''
      });
    },
    remove: function remove(index, arr) {
      arr.splice(index, 1);
    }
  }
});

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9fYnJvd3Nlci1wYWNrQDYuMS4wQGJyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInBhZ2VzL2V4cGVyaW1lbnRhbC9zZXR0aW5ncy9mb3J1bS9mb3J1bS5tanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztBQ0FBLElBQU0sSUFBSSxHQUFHLEdBQUcsQ0FBQyxPQUFKLENBQVksV0FBWixDQUF3QixNQUF4QixDQUFiO0FBRUEsSUFBTSxHQUFHLEdBQUcsSUFBSSxHQUFKLENBQVE7QUFDbEIsRUFBQSxFQUFFLEVBQUUsTUFEYztBQUVsQixFQUFBLElBQUksRUFBRTtBQUNKLElBQUEsU0FBUyxFQUFFLEVBRFA7QUFFSixJQUFBLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFGVDtBQUdKLElBQUEsYUFBYSxFQUFFLElBQUksQ0FBQyxhQUhoQjtBQUlKLElBQUEsZUFBZSxFQUFFLElBQUksQ0FBQztBQUpsQixHQUZZO0FBUWxCLEVBQUEsT0FSa0IscUJBUVI7QUFDUixJQUFBLFVBQVUsQ0FBQyxZQUFNO0FBQ2YsTUFBQSxlQUFlLENBQUMsU0FBaEI7QUFDRCxLQUZTLEVBRVAsR0FGTyxDQUFWO0FBR0QsR0FaaUI7QUFhbEIsRUFBQSxPQUFPLEVBQUU7QUFDUCxJQUFBLE1BQU0sRUFBRSxHQUFHLENBQUMsT0FBSixDQUFZLEtBQVosQ0FBa0IsTUFEbkI7QUFFUCxJQUFBLElBRk8sZ0JBRUYsS0FGRSxFQUVLLEdBRkwsRUFFVSxTQUZWLEVBRXFCO0FBQzFCLFVBQ0csS0FBSyxLQUFLLENBQVYsSUFBZSxTQUFTLEtBQUssTUFBOUIsSUFDQyxLQUFLLEdBQUcsQ0FBUixLQUFjLEdBQUcsQ0FBQyxNQUFsQixJQUE0QixTQUFTLEtBQUssT0FGN0MsRUFHRTtBQUNGLFVBQU0sS0FBSyxHQUFHLEdBQUcsQ0FBQyxLQUFELENBQWpCOztBQUNBLFVBQUksTUFBSjs7QUFDQSxVQUFHLFNBQVMsS0FBSyxNQUFqQixFQUF5QjtBQUN2QixR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ZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsImNvbnN0IGRhdGEgPSBOS0MubWV0aG9kcy5nZXREYXRhQnlJZCgnZGF0YScpO1xyXG5cclxuY29uc3QgYXBwID0gbmV3IFZ1ZSh7XHJcbiAgZWw6ICcjYXBwJyxcclxuICBkYXRhOiB7XHJcbiAgICBmb3J1bU5hbWU6ICcnLFxyXG4gICAgZm9ydW1zOiBkYXRhLmZvcnVtcyxcclxuICAgIGZvcnVtU2V0dGluZ3M6IGRhdGEuZm9ydW1TZXR0aW5ncyxcclxuICAgIGZvcnVtQ2F0ZWdvcmllczogZGF0YS5mb3J1bUNhdGVnb3JpZXMsXHJcbiAgfSxcclxuICBtb3VudGVkKCkge1xyXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgIGZsb2F0Rm9ydW1QYW5lbC5pbml0UGFuZWwoKTtcclxuICAgIH0sIDUwMClcclxuICB9LFxyXG4gIG1ldGhvZHM6IHtcclxuICAgIGdldFVybDogTktDLm1ldGhvZHMudG9vbHMuZ2V0VXJsLFxyXG4gICAgbW92ZShpbmRleCwgYXJyLCBkaXJlY3Rpb24pIHtcclxuICAgICAgaWYoXHJcbiAgICAgICAgKGluZGV4ID09PSAwICYmIGRpcmVjdGlvbiA9PT0gJ2xlZnQnKSB8fFxyXG4gICAgICAgIChpbmRleCArIDEgPT09IGFyci5sZW5ndGggJiYgZGlyZWN0aW9uID09PSAncmlnaHQnKVxyXG4gICAgICApIHJldHVybjtcclxuICAgICAgY29uc3QgZm9ydW0gPSBhcnJbaW5kZXhdO1xyXG4gICAgICBsZXQgX2luZGV4O1xyXG4gICAgICBpZihkaXJlY3Rpb24gPT09ICdsZWZ0Jykge1xyXG4gICAgICAgIF9pbmRleCA9IGluZGV4IC0gMTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBfaW5kZXggPSBpbmRleCArIDE7XHJcbiAgICAgIH1cclxuICAgICAgY29uc3QgX2ZvcnVtID0gYXJyW19pbmRleF07XHJcbiAgICAgIGFycltfaW5kZXhdID0gZm9ydW07XHJcbiAgICAgIFZ1ZS5zZXQoYXJyLCBpbmRleCwgX2ZvcnVtKTtcclxuICAgIH0sXHJcbiAgICBzYXZlKCkge1xyXG4gICAgICBjb25zdCBmaWRBcnIgPSB0aGlzLmZvcnVtcy5tYXAoZiA9PiBmLmZpZCk7XHJcbiAgICAgIGNvbnN0IHtmb3J1bUNhdGVnb3JpZXN9ID0gdGhpcztcclxuICAgICAgY29uc3Qge2NoZWNrU3RyaW5nfSA9IE5LQy5tZXRob2RzLmNoZWNrRGF0YTtcclxuICAgICAgUHJvbWlzZS5yZXNvbHZlKClcclxuICAgICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICBmb3IoY29uc3QgZmMgb2YgZm9ydW1DYXRlZ29yaWVzKSB7XHJcbiAgICAgICAgICAgIGNoZWNrU3RyaW5nKGZjLm5hbWUsIHtcclxuICAgICAgICAgICAgICBuYW1lOiAn5YiG57G75ZCNJyxcclxuICAgICAgICAgICAgICBtaW5MZW5ndGg6IDEsXHJcbiAgICAgICAgICAgICAgbWF4TGVuZ3RoOiAyMFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgY2hlY2tTdHJpbmcoZmMuZGVzY3JpcHRpb24sIHtcclxuICAgICAgICAgICAgICBuYW1lOiAn5YiG57G75LuL57uNJyxcclxuICAgICAgICAgICAgICBtaW5MZW5ndGg6IDAsXHJcbiAgICAgICAgICAgICAgbWF4TGVuZ3RoOiAxMDBcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICByZXR1cm4gbmtjQVBJKCcvZS9zZXR0aW5ncy9mb3J1bScsICdQVVQnLCB7ZmlkQXJyLCBjYXRlZ29yaWVzOiBmb3J1bUNhdGVnb3JpZXN9KTtcclxuICAgICAgICB9KVxyXG4gICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgIHN3ZWV0U3VjY2Vzcygn5L+d5a2Y5oiQ5YqfJyk7XHJcbiAgICAgICAgfSlcclxuICAgICAgICAuY2F0Y2goc3dlZXRFcnJvcik7XHJcbiAgICB9LFxyXG4gICAgYWRkRm9ydW0oKSB7XHJcbiAgICAgIGNvbnN0IGZvcnVtTmFtZSA9IHRoaXMuZm9ydW1OYW1lO1xyXG4gICAgICBQcm9taXNlLnJlc29sdmUoKVxyXG4gICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgIGlmKCFmb3J1bU5hbWUpIHRocm93ICfkuJPkuJrlkI3np7DkuI3og73kuLrnqbonO1xyXG4gICAgICAgICAgcmV0dXJuIHN3ZWV0UXVlc3Rpb24oYOehruWumuimgeWIm+W7uuS4k+S4muOAjCR7Zm9ydW1OYW1lfeOAjeWQl++8n2ApO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgcmV0dXJuIG5rY0FQSSgnL2YnLCAnUE9TVCcsIHtkaXNwbGF5TmFtZTogZm9ydW1OYW1lfSlcclxuICAgICAgICB9KVxyXG4gICAgICAgIC50aGVuKGRhdGEgPT4ge1xyXG4gICAgICAgICAgc3dlZXRTdWNjZXNzKCfliJvlu7rmiJDlip/vvIzmraPlnKjliY3lvoDkuJPkuJrorr7nva4nKTtcclxuICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICBOS0MubWV0aG9kcy52aXNpdFVybChgL2YvJHtkYXRhLmZvcnVtLmZpZH0vc2V0dGluZ3NgKTtcclxuICAgICAgICAgIH0sIDIwMDApO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLmNhdGNoKHN3ZWV0RXJyb3IpO1xyXG4gICAgfSxcclxuICAgIGFkZEZvcnVtQ2F0ZWdvcnkoKSB7XHJcbiAgICAgIHRoaXMuZm9ydW1DYXRlZ29yaWVzLnB1c2goe1xyXG4gICAgICAgIG5hbWU6ICcnLFxyXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnJ1xyXG4gICAgICB9KTtcclxuICAgIH0sXHJcbiAgICByZW1vdmUoaW5kZXgsIGFycikge1xyXG4gICAgICBhcnIuc3BsaWNlKGluZGV4LCAxKTtcclxuICAgIH1cclxuICB9XHJcbn0pXHJcblxyXG4iXX0=
