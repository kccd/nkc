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
        description: ''
      });
    },
    remove: function remove(index, arr) {
      arr.splice(index, 1);
    }
  }
});

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwYWdlcy9leHBlcmltZW50YWwvc2V0dGluZ3MvZm9ydW0vZm9ydW0ubWpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7QUNBQSxJQUFNLElBQUksR0FBRyxHQUFHLENBQUMsT0FBSixDQUFZLFdBQVosQ0FBd0IsTUFBeEIsQ0FBYjtBQUVBLElBQU0sR0FBRyxHQUFHLElBQUksR0FBSixDQUFRO0FBQ2xCLEVBQUEsRUFBRSxFQUFFLE1BRGM7QUFFbEIsRUFBQSxJQUFJLEVBQUU7QUFDSixJQUFBLFNBQVMsRUFBRSxFQURQO0FBRUosSUFBQSxNQUFNLEVBQUUsSUFBSSxDQUFDLE1BRlQ7QUFHSixJQUFBLGFBQWEsRUFBRSxJQUFJLENBQUMsYUFIaEI7QUFJSixJQUFBLGVBQWUsRUFBRSxJQUFJLENBQUM7QUFKbEIsR0FGWTtBQVFsQixFQUFBLE9BUmtCLHFCQVFSO0FBQ1IsSUFBQSxVQUFVLENBQUMsWUFBTTtBQUNmLE1BQUEsZUFBZSxDQUFDLFNBQWhCO0FBQ0QsS0FGUyxFQUVQLEdBRk8sQ0FBVjtBQUdELEdBWmlCO0FBYWxCLEVBQUEsT0FBTyxFQUFFO0FBQ1AsSUFBQSxNQUFNLEVBQUUsR0FBRyxDQUFDLE9BQUosQ0FBWSxLQUFaLENBQWtCLE1BRG5CO0FBRVAsSUFBQSxJQUZPLGdCQUVGLEtBRkUsRUFFSyxHQUZMLEVBRVUsU0FGVixFQUVxQjtBQUMxQixVQUNHLEtBQUssS0FBSyxDQUFWLElBQWUsU0FBUyxLQUFLLE1BQTlCLElBQ0MsS0FBSyxHQUFHLENBQVIsS0FBYyxHQUFHLENBQUMsTUFBbEIsSUFBNEIsU0FBUyxLQUFLLE9BRjdDLEVBR0U7QUFDRixVQUFNLEtBQUssR0FBRyxHQUFHLENBQUMsS0FBRCxDQUFqQjs7QUFDQSxVQUFJLE1BQUo7O0FBQ0EsVUFBRyxTQUFTLEtBQUssTUFBakIsRUFBeUI7QUFDdkIsUUFBQSxNQUFNLEdBQUcsS0FBSyxHQUFHLENBQWpCO0FBQ0QsT0FGRCxNQUVPO0FBQ0wsUUFBQSxNQUFNLEdBQUcsS0FBSyxHQUFHLENBQWpCO0FBQ0Q7O0FBQ0QsVUFBTSxNQUFNLEdBQUcsR0FBRyxDQUFDLE1BQUQsQ0FBbEI7QUFDQSxNQUFBLEdBQUcsQ0FBQyxNQUFELENBQUgsR0FBYyxLQUFkO0FBQ0EsTUFBQSxHQUFHLENBQUMsR0FBSixDQUFRLEdBQVIsRUFBYSxLQUFiLEVBQW9CLE1BQXBCO0FBQ0QsS0FqQk07QUFrQlAsSUFBQSxJQWxCTyxrQkFrQkE7QUFDTCxVQUFNLE1BQU0sR0FBRyxLQUFLLE1BQUwsQ0FBWSxHQUFaLENBQWdCLFVBQUEsQ0FBQztBQUFBLGVBQUksQ0FBQyxDQUFDLEdBQU47QUFBQSxPQUFqQixDQUFmO0FBREssVUFFRSxlQUZGLEdBRXFCLElBRnJCLENBRUUsZUFGRjtBQUFBLFVBR0UsV0FIRixHQUdpQixHQUFHLENBQUMsT0FBSixDQUFZLFNBSDdCLENBR0UsV0FIRjtBQUlMLE1BQUEsT0FBTyxDQUFDLE9BQVIsR0FDRyxJQURILENBQ1EsWUFBTTtBQUFBLG1EQUNNLGVBRE47QUFBQTs7QUFBQTtBQUNWLDhEQUFpQztBQUFBLGdCQUF2QixFQUF1QjtBQUMvQixZQUFBLFdBQVcsQ0FBQyxFQUFFLENBQUMsSUFBSixFQUFVO0FBQ25CLGNBQUEsSUFBSSxFQUFFLEtBRGE7QUFFbkIsY0FBQSxTQUFTLEVBQUUsQ0FGUTtBQUduQixjQUFBLFNBQVMsRUFBRTtBQUhRLGFBQVYsQ0FBWDtBQUtBLFlBQUEsV0FBVyxDQUFDLEVBQUUsQ0FBQyxXQUFKLEVBQWlCO0FBQzFCLGNBQUEsSUFBSSxFQUFFLE1BRG9CO0FBRTFCLGNBQUEsU0FBUyxFQUFFLENBRmU7QUFHMUIsY0FBQSxTQUFTLEVBQUU7QUFIZSxhQUFqQixDQUFYO0FBS0Q7QUFaUztBQUFBO0FBQUE7QUFBQTtBQUFBOztBQWFWLGVBQU8sTUFBTSxDQUFDLG1CQUFELEVBQXNCLEtBQXRCLEVBQTZCO0FBQUMsVUFBQSxNQUFNLEVBQU4sTUFBRDtBQUFTLFVBQUEsVUFBVSxFQUFFO0FBQXJCLFNBQTdCLENBQWI7QUFDRCxPQWZILEVBZ0JHLElBaEJILENBZ0JRLFlBQU07QUFDVixRQUFBLFlBQVksQ0FBQyxNQUFELENBQVo7QUFDRCxPQWxCSCxXQW1CUyxVQW5CVDtBQW9CRCxLQTFDTTtBQTJDUCxJQUFBLFFBM0NPLHNCQTJDSTtBQUNULFVBQU0sU0FBUyxHQUFHLEtBQUssU0FBdkI7QUFDQSxVQUFNLElBQUksR0FBRyxJQUFiO0FBQ0EsTUFBQSxPQUFPLENBQUMsT0FBUixHQUNHLElBREgsQ0FDUSxZQUFNO0FBQ1YsWUFBRyxDQUFDLFNBQUosRUFBZSxNQUFNLFVBQU47QUFDZixlQUFPLGFBQWEsMkRBQVksU0FBWix3QkFBcEI7QUFDRCxPQUpILEVBS0csSUFMSCxDQUtRLFlBQU07QUFDVixlQUFPLE1BQU0sQ0FBQyxJQUFELEVBQU8sTUFBUCxFQUFlO0FBQUMsVUFBQSxXQUFXLEVBQUU7QUFBZCxTQUFmLENBQWI7QUFDRCxPQVBILEVBUUcsSUFSSCxDQVFRLFVBQUEsSUFBSSxFQUFJO0FBQ1osUUFBQSxZQUFZLENBQUMsTUFBRCxDQUFaLENBRFksQ0FFWjtBQUNELE9BWEgsV0FZUyxVQVpUO0FBYUQsS0EzRE07QUE0RFAsSUFBQSxnQkE1RE8sOEJBNERZO0FBQ2pCLFdBQUssZUFBTCxDQUFxQixJQUFyQixDQUEwQjtBQUN4QixRQUFBLElBQUksRUFBRSxFQURrQjtBQUV4QixRQUFBLFdBQVcsRUFBRTtBQUZXLE9BQTFCO0FBSUQsS0FqRU07QUFrRVAsSUFBQSxNQWxFTyxrQkFrRUEsS0FsRUEsRUFrRU8sR0FsRVAsRUFrRVk7QUFDakIsTUFBQSxHQUFHLENBQUMsTUFBSixDQUFXLEtBQVgsRUFBa0IsQ0FBbEI7QUFDRDtBQXBFTTtBQWJTLENBQVIsQ0FBWiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsImNvbnN0IGRhdGEgPSBOS0MubWV0aG9kcy5nZXREYXRhQnlJZCgnZGF0YScpO1xyXG5cclxuY29uc3QgYXBwID0gbmV3IFZ1ZSh7XHJcbiAgZWw6ICcjYXBwJyxcclxuICBkYXRhOiB7XHJcbiAgICBmb3J1bU5hbWU6ICcnLFxyXG4gICAgZm9ydW1zOiBkYXRhLmZvcnVtcyxcclxuICAgIGZvcnVtU2V0dGluZ3M6IGRhdGEuZm9ydW1TZXR0aW5ncyxcclxuICAgIGZvcnVtQ2F0ZWdvcmllczogZGF0YS5mb3J1bUNhdGVnb3JpZXMsXHJcbiAgfSxcclxuICBtb3VudGVkKCkge1xyXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgIGZsb2F0Rm9ydW1QYW5lbC5pbml0UGFuZWwoKTtcclxuICAgIH0sIDUwMClcclxuICB9LFxyXG4gIG1ldGhvZHM6IHtcclxuICAgIGdldFVybDogTktDLm1ldGhvZHMudG9vbHMuZ2V0VXJsLFxyXG4gICAgbW92ZShpbmRleCwgYXJyLCBkaXJlY3Rpb24pIHtcclxuICAgICAgaWYoXHJcbiAgICAgICAgKGluZGV4ID09PSAwICYmIGRpcmVjdGlvbiA9PT0gJ2xlZnQnKSB8fFxyXG4gICAgICAgIChpbmRleCArIDEgPT09IGFyci5sZW5ndGggJiYgZGlyZWN0aW9uID09PSAncmlnaHQnKVxyXG4gICAgICApIHJldHVybjtcclxuICAgICAgY29uc3QgZm9ydW0gPSBhcnJbaW5kZXhdO1xyXG4gICAgICBsZXQgX2luZGV4O1xyXG4gICAgICBpZihkaXJlY3Rpb24gPT09ICdsZWZ0Jykge1xyXG4gICAgICAgIF9pbmRleCA9IGluZGV4IC0gMTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBfaW5kZXggPSBpbmRleCArIDE7XHJcbiAgICAgIH1cclxuICAgICAgY29uc3QgX2ZvcnVtID0gYXJyW19pbmRleF07XHJcbiAgICAgIGFycltfaW5kZXhdID0gZm9ydW07XHJcbiAgICAgIFZ1ZS5zZXQoYXJyLCBpbmRleCwgX2ZvcnVtKTtcclxuICAgIH0sXHJcbiAgICBzYXZlKCkge1xyXG4gICAgICBjb25zdCBmaWRBcnIgPSB0aGlzLmZvcnVtcy5tYXAoZiA9PiBmLmZpZCk7XHJcbiAgICAgIGNvbnN0IHtmb3J1bUNhdGVnb3JpZXN9ID0gdGhpcztcclxuICAgICAgY29uc3Qge2NoZWNrU3RyaW5nfSA9IE5LQy5tZXRob2RzLmNoZWNrRGF0YTtcclxuICAgICAgUHJvbWlzZS5yZXNvbHZlKClcclxuICAgICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICBmb3IoY29uc3QgZmMgb2YgZm9ydW1DYXRlZ29yaWVzKSB7XHJcbiAgICAgICAgICAgIGNoZWNrU3RyaW5nKGZjLm5hbWUsIHtcclxuICAgICAgICAgICAgICBuYW1lOiAn5YiG57G75ZCNJyxcclxuICAgICAgICAgICAgICBtaW5MZW5ndGg6IDEsXHJcbiAgICAgICAgICAgICAgbWF4TGVuZ3RoOiAyMFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgY2hlY2tTdHJpbmcoZmMuZGVzY3JpcHRpb24sIHtcclxuICAgICAgICAgICAgICBuYW1lOiAn5YiG57G75LuL57uNJyxcclxuICAgICAgICAgICAgICBtaW5MZW5ndGg6IDAsXHJcbiAgICAgICAgICAgICAgbWF4TGVuZ3RoOiAxMDBcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICByZXR1cm4gbmtjQVBJKCcvZS9zZXR0aW5ncy9mb3J1bScsICdQVVQnLCB7ZmlkQXJyLCBjYXRlZ29yaWVzOiBmb3J1bUNhdGVnb3JpZXN9KTtcclxuICAgICAgICB9KVxyXG4gICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgIHN3ZWV0U3VjY2Vzcygn5L+d5a2Y5oiQ5YqfJyk7XHJcbiAgICAgICAgfSlcclxuICAgICAgICAuY2F0Y2goc3dlZXRFcnJvcik7XHJcbiAgICB9LFxyXG4gICAgYWRkRm9ydW0oKSB7XHJcbiAgICAgIGNvbnN0IGZvcnVtTmFtZSA9IHRoaXMuZm9ydW1OYW1lO1xyXG4gICAgICBjb25zdCBzZWxmID0gdGhpcztcclxuICAgICAgUHJvbWlzZS5yZXNvbHZlKClcclxuICAgICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICBpZighZm9ydW1OYW1lKSB0aHJvdyAn5LiT5Lia5ZCN56ew5LiN6IO95Li656m6JztcclxuICAgICAgICAgIHJldHVybiBzd2VldFF1ZXN0aW9uKGDnoa7lrpropoHliJvlu7rkuJPkuJrjgIwke2ZvcnVtTmFtZX3jgI3lkJfvvJ9gKTtcclxuICAgICAgICB9KVxyXG4gICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgIHJldHVybiBua2NBUEkoJy9mJywgJ1BPU1QnLCB7ZGlzcGxheU5hbWU6IGZvcnVtTmFtZX0pXHJcbiAgICAgICAgfSlcclxuICAgICAgICAudGhlbihkYXRhID0+IHtcclxuICAgICAgICAgIHN3ZWV0U3VjY2Vzcygn5Yib5bu65oiQ5YqfJyk7XHJcbiAgICAgICAgICAvLyBzZWxmLmZvcnVtcyA9IGRhdGEuZm9ydW1zO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLmNhdGNoKHN3ZWV0RXJyb3IpO1xyXG4gICAgfSxcclxuICAgIGFkZEZvcnVtQ2F0ZWdvcnkoKSB7XHJcbiAgICAgIHRoaXMuZm9ydW1DYXRlZ29yaWVzLnB1c2goe1xyXG4gICAgICAgIG5hbWU6ICcnLFxyXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnJ1xyXG4gICAgICB9KTtcclxuICAgIH0sXHJcbiAgICByZW1vdmUoaW5kZXgsIGFycikge1xyXG4gICAgICBhcnIuc3BsaWNlKGluZGV4LCAxKTtcclxuICAgIH1cclxuICB9XHJcbn0pO1xyXG4iXX0=
