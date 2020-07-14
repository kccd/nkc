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

        return nkcAPI('/e/settings/forum', 'PATCH', {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwYWdlcy9leHBlcmltZW50YWwvc2V0dGluZ3MvZm9ydW0vZm9ydW0ubWpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7QUNBQSxJQUFNLElBQUksR0FBRyxHQUFHLENBQUMsT0FBSixDQUFZLFdBQVosQ0FBd0IsTUFBeEIsQ0FBYjtBQUVBLElBQU0sR0FBRyxHQUFHLElBQUksR0FBSixDQUFRO0FBQ2xCLEVBQUEsRUFBRSxFQUFFLE1BRGM7QUFFbEIsRUFBQSxJQUFJLEVBQUU7QUFDSixJQUFBLFNBQVMsRUFBRSxFQURQO0FBRUosSUFBQSxNQUFNLEVBQUUsSUFBSSxDQUFDLE1BRlQ7QUFHSixJQUFBLGFBQWEsRUFBRSxJQUFJLENBQUMsYUFIaEI7QUFJSixJQUFBLGVBQWUsRUFBRSxJQUFJLENBQUM7QUFKbEIsR0FGWTtBQVFsQixFQUFBLE9BUmtCLHFCQVFSO0FBQ1IsSUFBQSxVQUFVLENBQUMsWUFBTTtBQUNmLE1BQUEsZUFBZSxDQUFDLFNBQWhCO0FBQ0QsS0FGUyxFQUVQLEdBRk8sQ0FBVjtBQUdELEdBWmlCO0FBYWxCLEVBQUEsT0FBTyxFQUFFO0FBQ1AsSUFBQSxNQUFNLEVBQUUsR0FBRyxDQUFDLE9BQUosQ0FBWSxLQUFaLENBQWtCLE1BRG5CO0FBRVAsSUFBQSxJQUZPLGdCQUVGLEtBRkUsRUFFSyxHQUZMLEVBRVUsU0FGVixFQUVxQjtBQUMxQixVQUNHLEtBQUssS0FBSyxDQUFWLElBQWUsU0FBUyxLQUFLLE1BQTlCLElBQ0MsS0FBSyxHQUFHLENBQVIsS0FBYyxHQUFHLENBQUMsTUFBbEIsSUFBNEIsU0FBUyxLQUFLLE9BRjdDLEVBR0U7QUFDRixVQUFNLEtBQUssR0FBRyxHQUFHLENBQUMsS0FBRCxDQUFqQjs7QUFDQSxVQUFJLE1BQUo7O0FBQ0EsVUFBRyxTQUFTLEtBQUssTUFBakIsRUFBeUI7QUFDdkIsUUFBQSxNQUFNLEdBQUcsS0FBSyxH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Um9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJjb25zdCBkYXRhID0gTktDLm1ldGhvZHMuZ2V0RGF0YUJ5SWQoJ2RhdGEnKTtcclxuXHJcbmNvbnN0IGFwcCA9IG5ldyBWdWUoe1xyXG4gIGVsOiAnI2FwcCcsXHJcbiAgZGF0YToge1xyXG4gICAgZm9ydW1OYW1lOiAnJyxcclxuICAgIGZvcnVtczogZGF0YS5mb3J1bXMsXHJcbiAgICBmb3J1bVNldHRpbmdzOiBkYXRhLmZvcnVtU2V0dGluZ3MsXHJcbiAgICBmb3J1bUNhdGVnb3JpZXM6IGRhdGEuZm9ydW1DYXRlZ29yaWVzLFxyXG4gIH0sXHJcbiAgbW91bnRlZCgpIHtcclxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICBmbG9hdEZvcnVtUGFuZWwuaW5pdFBhbmVsKCk7XHJcbiAgICB9LCA1MDApXHJcbiAgfSxcclxuICBtZXRob2RzOiB7XHJcbiAgICBnZXRVcmw6IE5LQy5tZXRob2RzLnRvb2xzLmdldFVybCxcclxuICAgIG1vdmUoaW5kZXgsIGFyciwgZGlyZWN0aW9uKSB7XHJcbiAgICAgIGlmKFxyXG4gICAgICAgIChpbmRleCA9PT0gMCAmJiBkaXJlY3Rpb24gPT09ICdsZWZ0JykgfHxcclxuICAgICAgICAoaW5kZXggKyAxID09PSBhcnIubGVuZ3RoICYmIGRpcmVjdGlvbiA9PT0gJ3JpZ2h0JylcclxuICAgICAgKSByZXR1cm47XHJcbiAgICAgIGNvbnN0IGZvcnVtID0gYXJyW2luZGV4XTtcclxuICAgICAgbGV0IF9pbmRleDtcclxuICAgICAgaWYoZGlyZWN0aW9uID09PSAnbGVmdCcpIHtcclxuICAgICAgICBfaW5kZXggPSBpbmRleCAtIDE7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgX2luZGV4ID0gaW5kZXggKyAxO1xyXG4gICAgICB9XHJcbiAgICAgIGNvbnN0IF9mb3J1bSA9IGFycltfaW5kZXhdO1xyXG4gICAgICBhcnJbX2luZGV4XSA9IGZvcnVtO1xyXG4gICAgICBWdWUuc2V0KGFyciwgaW5kZXgsIF9mb3J1bSk7XHJcbiAgICB9LFxyXG4gICAgc2F2ZSgpIHtcclxuICAgICAgY29uc3QgZmlkQXJyID0gdGhpcy5mb3J1bXMubWFwKGYgPT4gZi5maWQpO1xyXG4gICAgICBjb25zdCB7Zm9ydW1DYXRlZ29yaWVzfSA9IHRoaXM7XHJcbiAgICAgIGNvbnN0IHtjaGVja1N0cmluZ30gPSBOS0MubWV0aG9kcy5jaGVja0RhdGE7XHJcbiAgICAgIFByb21pc2UucmVzb2x2ZSgpXHJcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgZm9yKGNvbnN0IGZjIG9mIGZvcnVtQ2F0ZWdvcmllcykge1xyXG4gICAgICAgICAgICBjaGVja1N0cmluZyhmYy5uYW1lLCB7XHJcbiAgICAgICAgICAgICAgbmFtZTogJ+WIhuexu+WQjScsXHJcbiAgICAgICAgICAgICAgbWluTGVuZ3RoOiAxLFxyXG4gICAgICAgICAgICAgIG1heExlbmd0aDogMjBcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGNoZWNrU3RyaW5nKGZjLmRlc2NyaXB0aW9uLCB7XHJcbiAgICAgICAgICAgICAgbmFtZTogJ+WIhuexu+S7i+e7jScsXHJcbiAgICAgICAgICAgICAgbWluTGVuZ3RoOiAwLFxyXG4gICAgICAgICAgICAgIG1heExlbmd0aDogMTAwXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgcmV0dXJuIG5rY0FQSSgnL2Uvc2V0dGluZ3MvZm9ydW0nLCAnUEFUQ0gnLCB7ZmlkQXJyLCBjYXRlZ29yaWVzOiBmb3J1bUNhdGVnb3JpZXN9KTtcclxuICAgICAgICB9KVxyXG4gICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgIHN3ZWV0U3VjY2Vzcygn5L+d5a2Y5oiQ5YqfJyk7XHJcbiAgICAgICAgfSlcclxuICAgICAgICAuY2F0Y2goc3dlZXRFcnJvcik7XHJcbiAgICB9LFxyXG4gICAgYWRkRm9ydW0oKSB7XHJcbiAgICAgIGNvbnN0IGZvcnVtTmFtZSA9IHRoaXMuZm9ydW1OYW1lO1xyXG4gICAgICBQcm9taXNlLnJlc29sdmUoKVxyXG4gICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgIGlmKCFmb3J1bU5hbWUpIHRocm93ICfkuJPkuJrlkI3np7DkuI3og73kuLrnqbonO1xyXG4gICAgICAgICAgcmV0dXJuIHN3ZWV0UXVlc3Rpb24oYOehruWumuimgeWIm+W7uuS4k+S4muOAjCR7Zm9ydW1OYW1lfeOAjeWQl++8n2ApO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgcmV0dXJuIG5rY0FQSSgnL2YnLCAnUE9TVCcsIHtkaXNwbGF5TmFtZTogZm9ydW1OYW1lfSlcclxuICAgICAgICB9KVxyXG4gICAgICAgIC50aGVuKGRhdGEgPT4ge1xyXG4gICAgICAgICAgc3dlZXRTdWNjZXNzKCfliJvlu7rmiJDlip/vvIzmraPlnKjliY3lvoDkuJPkuJrorr7nva4nKTtcclxuICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICBOS0MubWV0aG9kcy52aXNpdFVybChgL2YvJHtkYXRhLmZvcnVtLmZpZH0vc2V0dGluZ3NgKTtcclxuICAgICAgICAgIH0sIDIwMDApO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLmNhdGNoKHN3ZWV0RXJyb3IpO1xyXG4gICAgfSxcclxuICAgIGFkZEZvcnVtQ2F0ZWdvcnkoKSB7XHJcbiAgICAgIHRoaXMuZm9ydW1DYXRlZ29yaWVzLnB1c2goe1xyXG4gICAgICAgIG5hbWU6ICcnLFxyXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnJ1xyXG4gICAgICB9KTtcclxuICAgIH0sXHJcbiAgICByZW1vdmUoaW5kZXgsIGFycikge1xyXG4gICAgICBhcnIuc3BsaWNlKGluZGV4LCAxKTtcclxuICAgIH1cclxuICB9XHJcbn0pXHJcblxyXG4iXX0=
