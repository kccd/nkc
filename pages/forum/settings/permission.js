(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var data = NKC.methods.getDataById('data');
var selectUser = new NKC.modules.SelectUser();
var app = new Vue({
  el: '#app',
  data: {
    forum: data.forum,
    roles: data.roles,
    grades: data.grades,
    permission: data.permission,
    operations: data.operation,
    libraryClosed: data.libraryClosed,
    saving: false,
    moderators: data.moderators
  },
  computed: {
    users: function users() {
      var moderators = this.moderators;
      var users = {};

      var _iterator = _createForOfIteratorHelper(moderators),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var u = _step.value;
          users[u.uid] = u;
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }

      return users;
    },
    operationsId: function operationsId() {
      var arr = [];

      for (var i = 0; i < this.operations.length; i++) {
        arr.push(this.operations[i].name);
      }

      return arr;
    }
  },
  mounted: function mounted() {
    this.initUserPanel();
  },
  updated: function updated() {
    this.initUserPanel();
  },
  methods: {
    initUserPanel: function initUserPanel() {
      setTimeout(function () {
        window.floatUserPanel.initPanel();
      }, 500);
    },
    selectAll: function selectAll(p) {
      if (p.operationsId.length === this.operationsId.length) {
        p.operationsId = [];
      } else {
        p.operationsId = this.operationsId;
      }
    },
    removeModerator: function removeModerator(index) {
      this.forum.moderators.splice(index, 1);
    },
    addModerator: function addModerator() {
      var self = this;
      selectUser.open(function (data) {
        var users = data.users,
            usersId = data.usersId;
        self.moderators = self.moderators.concat(users);

        var _iterator2 = _createForOfIteratorHelper(usersId),
            _step2;

        try {
          for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
            var uid = _step2.value;
            if (!self.forum.moderators.includes(uid)) self.forum.moderators.push(uid);
          }
        } catch (err) {
          _iterator2.e(err);
        } finally {
          _iterator2.f();
        }
      });
    },
    libraryOperation: function libraryOperation(fid, type) {
      var self = this;
      nkcAPI("/f/" + fid + "/library", "POST", {
        type: type
      }).then(function (data) {
        var libraryClosed = data.libraryClosed,
            library = data.library;
        self.forum.lid = library._id;
        self.libraryClosed = libraryClosed;
        sweetSuccess("执行成功");
      })["catch"](function (data) {
        sweetError(data);
      });
    },
    save: function save() {
      var forum = this.forum;
      this.saving = true;
      var self = this;
      return nkcAPI("/f/".concat(forum.fid, "/settings/permission"), 'PUT', {
        forum: forum
      }).then(function () {
        sweetSuccess('保存成功');
        self.saving = false;
      })["catch"](function (err) {
        self.saving = false;
        sweetError(err);
      });
    }
  }
});

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwYWdlcy9mb3J1bS9zZXR0aW5ncy9wZXJtaXNzaW9uLm1qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7O0FDQUEsSUFBTSxJQUFJLEdBQUcsR0FBRyxDQUFDLE9BQUosQ0FBWSxXQUFaLENBQXdCLE1BQXhCLENBQWI7QUFDQSxJQUFNLFVBQVUsR0FBRyxJQUFJLEdBQUcsQ0FBQyxPQUFKLENBQVksVUFBaEIsRUFBbkI7QUFDQSxJQUFNLEdBQUcsR0FBRyxJQUFJLEdBQUosQ0FBUTtBQUNsQixFQUFBLEVBQUUsRUFBRSxNQURjO0FBRWxCLEVBQUEsSUFBSSxFQUFFO0FBQ0osSUFBQSxLQUFLLEVBQUUsSUFBSSxDQUFDLEtBRFI7QUFFSixJQUFBLEtBQUssRUFBRSxJQUFJLENBQUMsS0FGUjtBQUdKLElBQUEsTUFBTSxFQUFFLElBQUksQ0FBQyxNQUhUO0FBSUosSUFBQSxVQUFVLEVBQUUsSUFBSSxDQUFDLFVBSmI7QUFLSixJQUFBLFVBQVUsRUFBRSxJQUFJLENBQUMsU0FMYjtBQU1KLElBQUEsYUFBYSxFQUFFLElBQUksQ0FBQyxhQU5oQjtBQU9KLElBQUEsTUFBTSxFQUFFLEtBUEo7QUFRSixJQUFBLFVBQVUsRUFBRSxJQUFJLENBQUM7QUFSYixHQUZZO0FBWWxCLEVBQUEsUUFBUSxFQUFFO0FBQ1IsSUFBQSxLQURRLG1CQUNBO0FBQUEsVUFDQyxVQURELEdBQ2UsSUFEZixDQUNDLFVBREQ7QUFFTixVQUFNLEtBQUssR0FBRyxFQUFkOztBQUZNLGlEQUdTLFVBSFQ7QUFBQTs7QUFBQTtBQUdOLDREQUEyQjtBQUFBLGNBQWpCLENBQWlCO0FBQ3pCLFVBQUEsS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFILENBQUwsR0FBZSxDQUFmO0FBQ0Q7QUFMSztBQUFBO0FBQUE7QUFBQTtBQUFBOztBQU1OLGFBQU8sS0FBUDtBQUNELEtBUk87QUFTUixJQUFBLFlBQVksRUFB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WCxDQUNFLEtBREY7QUFFTCxXQUFLLE1BQUwsR0FBYyxJQUFkO0FBQ0EsVUFBTSxJQUFJLEdBQUcsSUFBYjtBQUNBLGFBQU8sTUFBTSxjQUFPLEtBQUssQ0FBQyxHQUFiLDJCQUF3QyxLQUF4QyxFQUErQztBQUMxRCxRQUFBLEtBQUssRUFBTDtBQUQwRCxPQUEvQyxDQUFOLENBR0osSUFISSxDQUdDLFlBQU07QUFDVixRQUFBLFlBQVksQ0FBQyxNQUFELENBQVo7QUFDQSxRQUFBLElBQUksQ0FBQyxNQUFMLEdBQWMsS0FBZDtBQUNELE9BTkksV0FPRSxVQUFBLEdBQUcsRUFBSTtBQUNaLFFBQUEsSUFBSSxDQUFDLE1BQUwsR0FBYyxLQUFkO0FBQ0EsUUFBQSxVQUFVLENBQUMsR0FBRCxDQUFWO0FBQ0QsT0FWSSxDQUFQO0FBV0Q7QUF4RE07QUFuQ1MsQ0FBUixDQUFaIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiY29uc3QgZGF0YSA9IE5LQy5tZXRob2RzLmdldERhdGFCeUlkKCdkYXRhJyk7XG5jb25zdCBzZWxlY3RVc2VyID0gbmV3IE5LQy5tb2R1bGVzLlNlbGVjdFVzZXIoKTtcbmNvbnN0IGFwcCA9IG5ldyBWdWUoe1xuICBlbDogJyNhcHAnLFxuICBkYXRhOiB7XG4gICAgZm9ydW06IGRhdGEuZm9ydW0sXG4gICAgcm9sZXM6IGRhdGEucm9sZXMsXG4gICAgZ3JhZGVzOiBkYXRhLmdyYWRlcyxcbiAgICBwZXJtaXNzaW9uOiBkYXRhLnBlcm1pc3Npb24sXG4gICAgb3BlcmF0aW9uczogZGF0YS5vcGVyYXRpb24sXG4gICAgbGlicmFyeUNsb3NlZDogZGF0YS5saWJyYXJ5Q2xvc2VkLFxuICAgIHNhdmluZzogZmFsc2UsXG4gICAgbW9kZXJhdG9yczogZGF0YS5tb2RlcmF0b3JzXG4gIH0sXG4gIGNvbXB1dGVkOiB7XG4gICAgdXNlcnMoKSB7XG4gICAgICBjb25zdCB7bW9kZXJhdG9yc30gPSB0aGlzO1xuICAgICAgY29uc3QgdXNlcnMgPSB7fTtcbiAgICAgIGZvcihjb25zdCB1IG9mIG1vZGVyYXRvcnMpIHtcbiAgICAgICAgdXNlcnNbdS51aWRdID0gdTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB1c2VycztcbiAgICB9LFxuICAgIG9wZXJhdGlvbnNJZDogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgYXJyID0gW107XG4gICAgICBmb3IodmFyIGkgPSAwOyBpIDwgdGhpcy5vcGVyYXRpb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGFyci5wdXNoKHRoaXMub3BlcmF0aW9uc1tpXS5uYW1lKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBhcnI7XG4gICAgfVxuICB9LFxuICBtb3VudGVkKCkge1xuICAgIHRoaXMuaW5pdFVzZXJQYW5lbCgpO1xuICB9LFxuICB1cGRhdGVkKCkge1xuICAgIHRoaXMuaW5pdFVzZXJQYW5lbCgpO1xuICB9LFxuICBtZXRob2RzOiB7XG4gICAgaW5pdFVzZXJQYW5lbCgpIHtcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICB3aW5kb3cuZmxvYXRVc2VyUGFuZWwuaW5pdFBhbmVsKCk7XG4gICAgICB9LCA1MDApXG4gICAgfSxcbiAgICBzZWxlY3RBbGw6IGZ1bmN0aW9uKHApIHtcbiAgICAgIGlmKHAub3BlcmF0aW9uc0lkLmxlbmd0aCA9PT0gdGhpcy5vcGVyYXRpb25zSWQubGVuZ3RoKSB7XG4gICAgICAgIHAub3BlcmF0aW9uc0lkID0gW107XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwLm9wZXJhdGlvbnNJZCA9IHRoaXMub3BlcmF0aW9uc0lkO1xuICAgICAgfVxuICAgIH0sXG4gICAgcmVtb3ZlTW9kZXJhdG9yKGluZGV4KSB7XG4gICAgICB0aGlzLmZvcnVtLm1vZGVyYXRvcnMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICB9LFxuICAgIGFkZE1vZGVyYXRvcigpIHtcbiAgICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuICAgICAgc2VsZWN0VXNlci5vcGVuKGRhdGEgPT4ge1xuICAgICAgICBjb25zdCB7dXNlcnMsIHVzZXJzSWR9ID0gZGF0YTtcbiAgICAgICAgc2VsZi5tb2RlcmF0b3JzID0gc2VsZi5tb2RlcmF0b3JzLmNvbmNhdCh1c2Vycyk7XG4gICAgICAgIGZvcihjb25zdCB1aWQgb2YgdXNlcnNJZCkge1xuICAgICAgICAgIGlmKCFzZWxmLmZvcnVtLm1vZGVyYXRvcnMuaW5jbHVkZXModWlkKSkgc2VsZi5mb3J1bS5tb2RlcmF0b3JzLnB1c2godWlkKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSxcbiAgICBsaWJyYXJ5T3BlcmF0aW9uKGZpZCwgdHlwZSkge1xuICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gICAgICBua2NBUEkoXCIvZi9cIiArIGZpZCArIFwiL2xpYnJhcnlcIiwgXCJQT1NUXCIsIHtcbiAgICAgICAgdHlwZTogdHlwZVxuICAgICAgfSlcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgIGNvbnN0IHtsaWJyYXJ5Q2xvc2VkLCBsaWJyYXJ5fSA9IGRhdGE7XG4gICAgICAgICAgc2VsZi5mb3J1bS5saWQgPSBsaWJyYXJ5Ll9pZDtcbiAgICAgICAgICBzZWxmLmxpYnJhcnlDbG9zZWQgPSBsaWJyYXJ5Q2xvc2VkO1xuICAgICAgICAgIHN3ZWV0U3VjY2VzcyhcIuaJp+ihjOaIkOWKn1wiKTtcbiAgICAgICAgfSlcbiAgICAgICAgLmNhdGNoKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICBzd2VldEVycm9yKGRhdGEpO1xuICAgICAgICB9KVxuICAgIH0sXG4gICAgc2F2ZSgpIHtcbiAgICAgIGNvbnN0IHtmb3J1bX0gPSB0aGlzO1xuICAgICAgdGhpcy5zYXZpbmcgPSB0cnVlO1xuICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gICAgICByZXR1cm4gbmtjQVBJKGAvZi8ke2ZvcnVtLmZpZH0vc2V0dGluZ3MvcGVybWlzc2lvbmAsICdQVVQnLCB7XG4gICAgICAgIGZvcnVtXG4gICAgICB9KVxuICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgc3dlZXRTdWNjZXNzKCfkv53lrZjmiJDlip8nKTtcbiAgICAgICAgICBzZWxmLnNhdmluZyA9IGZhbHNlO1xuICAgICAgICB9KVxuICAgICAgICAuY2F0Y2goZXJyID0+IHtcbiAgICAgICAgICBzZWxmLnNhdmluZyA9IGZhbHNlO1xuICAgICAgICAgIHN3ZWV0RXJyb3IoZXJyKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICB9XG59KTtcbiJdfQ==
