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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwYWdlcy9mb3J1bS9zZXR0aW5ncy9wZXJtaXNzaW9uLm1qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7O0FDQUEsSUFBTSxJQUFJLEdBQUcsR0FBRyxDQUFDLE9BQUosQ0FBWSxXQUFaLENBQXdCLE1BQXhCLENBQWI7QUFDQSxJQUFNLFVBQVUsR0FBRyxJQUFJLEdBQUcsQ0FBQyxPQUFKLENBQVksVUFBaEIsRUFBbkI7QUFDQSxJQUFNLEdBQUcsR0FBRyxJQUFJLEdBQUosQ0FBUTtBQUNsQixFQUFBLEVBQUUsRUFBRSxNQURjO0FBRWxCLEVBQUEsSUFBSSxFQUFFO0FBQ0osSUFBQSxLQUFLLEVBQUUsSUFBSSxDQUFDLEtBRFI7QUFFSixJQUFBLEtBQUssRUFBRSxJQUFJLENBQUMsS0FGUjtBQUdKLElBQUEsTUFBTSxFQUFFLElBQUksQ0FBQyxNQUhUO0FBSUosSUFBQSxVQUFVLEVBQUUsSUFBSSxDQUFDLFVBSmI7QUFLSixJQUFBLFVBQVUsRUFBRSxJQUFJLENBQUMsU0FMYjtBQU1KLElBQUEsYUFBYSxFQUFFLElBQUksQ0FBQyxhQU5oQjtBQU9KLElBQUEsTUFBTSxFQUFFLEtBUEo7QUFRSixJQUFBLFVBQVUsRUFBRSxJQUFJLENBQUM7QUFSYixHQUZZO0FBWWxCLEVBQUEsUUFBUSxFQUFFO0FBQ1IsSUFBQSxLQURRLG1CQUNBO0FBQUEsVUFDQyxVQURELEdBQ2UsSUFEZixDQUNDLFVBREQ7QUFFTixVQUFNLEtBQUssR0FBRyxFQUFkOztBQUZNLGlEQUdTLFVBSFQ7QUFBQTs7QUFBQTtBQUdOLDREQUEyQjtBQUFBLGNBQWpCLENBQWlCO0FBQ3pCLFVBQUEsS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFILENBQUwsR0FBZSxDQUFmO0FBQ0Q7QUFMSztBQUFBO0FBQUE7QUFBQTtBQUFBOztBQU1OLGFBQU8sS0FBUDtBQUNELEtBUk87QUFTUixJQUFBLFlBQVksRUFB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WCxDQUNFLEtBREY7QUFFTCxXQUFLLE1BQUwsR0FBYyxJQUFkO0FBQ0EsVUFBTSxJQUFJLEdBQUcsSUFBYjtBQUNBLGFBQU8sTUFBTSxjQUFPLEtBQUssQ0FBQyxHQUFiLDJCQUF3QyxLQUF4QyxFQUErQztBQUMxRCxRQUFBLEtBQUssRUFBTDtBQUQwRCxPQUEvQyxDQUFOLENBR0osSUFISSxDQUdDLFlBQU07QUFDVixRQUFBLFlBQVksQ0FBQyxNQUFELENBQVo7QUFDQSxRQUFBLElBQUksQ0FBQyxNQUFMLEdBQWMsS0FBZDtBQUNELE9BTkksV0FPRSxVQUFBLEdBQUcsRUFBSTtBQUNaLFFBQUEsSUFBSSxDQUFDLE1BQUwsR0FBYyxLQUFkO0FBQ0EsUUFBQSxVQUFVLENBQUMsR0FBRCxDQUFWO0FBQ0QsT0FWSSxDQUFQO0FBV0Q7QUF4RE07QUFuQ1MsQ0FBUixDQUFaIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiY29uc3QgZGF0YSA9IE5LQy5tZXRob2RzLmdldERhdGFCeUlkKCdkYXRhJyk7XHJcbmNvbnN0IHNlbGVjdFVzZXIgPSBuZXcgTktDLm1vZHVsZXMuU2VsZWN0VXNlcigpO1xyXG5jb25zdCBhcHAgPSBuZXcgVnVlKHtcclxuICBlbDogJyNhcHAnLFxyXG4gIGRhdGE6IHtcclxuICAgIGZvcnVtOiBkYXRhLmZvcnVtLFxyXG4gICAgcm9sZXM6IGRhdGEucm9sZXMsXHJcbiAgICBncmFkZXM6IGRhdGEuZ3JhZGVzLFxyXG4gICAgcGVybWlzc2lvbjogZGF0YS5wZXJtaXNzaW9uLFxyXG4gICAgb3BlcmF0aW9uczogZGF0YS5vcGVyYXRpb24sXHJcbiAgICBsaWJyYXJ5Q2xvc2VkOiBkYXRhLmxpYnJhcnlDbG9zZWQsXHJcbiAgICBzYXZpbmc6IGZhbHNlLFxyXG4gICAgbW9kZXJhdG9yczogZGF0YS5tb2RlcmF0b3JzXHJcbiAgfSxcclxuICBjb21wdXRlZDoge1xyXG4gICAgdXNlcnMoKSB7XHJcbiAgICAgIGNvbnN0IHttb2RlcmF0b3JzfSA9IHRoaXM7XHJcbiAgICAgIGNvbnN0IHVzZXJzID0ge307XHJcbiAgICAgIGZvcihjb25zdCB1IG9mIG1vZGVyYXRvcnMpIHtcclxuICAgICAgICB1c2Vyc1t1LnVpZF0gPSB1O1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiB1c2VycztcclxuICAgIH0sXHJcbiAgICBvcGVyYXRpb25zSWQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICB2YXIgYXJyID0gW107XHJcbiAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCB0aGlzLm9wZXJhdGlvbnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBhcnIucHVzaCh0aGlzLm9wZXJhdGlvbnNbaV0ubmFtZSk7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIGFycjtcclxuICAgIH1cclxuICB9LFxyXG4gIG1vdW50ZWQoKSB7XHJcbiAgICB0aGlzLmluaXRVc2VyUGFuZWwoKTtcclxuICB9LFxyXG4gIHVwZGF0ZWQoKSB7XHJcbiAgICB0aGlzLmluaXRVc2VyUGFuZWwoKTtcclxuICB9LFxyXG4gIG1ldGhvZHM6IHtcclxuICAgIGluaXRVc2VyUGFuZWwoKSB7XHJcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgIHdpbmRvdy5mbG9hdFVzZXJQYW5lbC5pbml0UGFuZWwoKTtcclxuICAgICAgfSwgNTAwKVxyXG4gICAgfSxcclxuICAgIHNlbGVjdEFsbDogZnVuY3Rpb24ocCkge1xyXG4gICAgICBpZihwLm9wZXJhdGlvbnNJZC5sZW5ndGggPT09IHRoaXMub3BlcmF0aW9uc0lkLmxlbmd0aCkge1xyXG4gICAgICAgIHAub3BlcmF0aW9uc0lkID0gW107XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcC5vcGVyYXRpb25zSWQgPSB0aGlzLm9wZXJhdGlvbnNJZDtcclxuICAgICAgfVxyXG4gICAgfSxcclxuICAgIHJlbW92ZU1vZGVyYXRvcihpbmRleCkge1xyXG4gICAgICB0aGlzLmZvcnVtLm1vZGVyYXRvcnMuc3BsaWNlKGluZGV4LCAxKTtcclxuICAgIH0sXHJcbiAgICBhZGRNb2RlcmF0b3IoKSB7XHJcbiAgICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xyXG4gICAgICBzZWxlY3RVc2VyLm9wZW4oZGF0YSA9PiB7XHJcbiAgICAgICAgY29uc3Qge3VzZXJzLCB1c2Vyc0lkfSA9IGRhdGE7XHJcbiAgICAgICAgc2VsZi5tb2RlcmF0b3JzID0gc2VsZi5tb2RlcmF0b3JzLmNvbmNhdCh1c2Vycyk7XHJcbiAgICAgICAgZm9yKGNvbnN0IHVpZCBvZiB1c2Vyc0lkKSB7XHJcbiAgICAgICAgICBpZighc2VsZi5mb3J1bS5tb2RlcmF0b3JzLmluY2x1ZGVzKHVpZCkpIHNlbGYuZm9ydW0ubW9kZXJhdG9ycy5wdXNoKHVpZCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgIH0sXHJcbiAgICBsaWJyYXJ5T3BlcmF0aW9uKGZpZCwgdHlwZSkge1xyXG4gICAgICBjb25zdCBzZWxmID0gdGhpcztcclxuICAgICAgbmtjQVBJKFwiL2YvXCIgKyBmaWQgKyBcIi9saWJyYXJ5XCIsIFwiUE9TVFwiLCB7XHJcbiAgICAgICAgdHlwZTogdHlwZVxyXG4gICAgICB9KVxyXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgICAgICAgIGNvbnN0IHtsaWJyYXJ5Q2xvc2VkLCBsaWJyYXJ5fSA9IGRhdGE7XHJcbiAgICAgICAgICBzZWxmLmZvcnVtLmxpZCA9IGxpYnJhcnkuX2lkO1xyXG4gICAgICAgICAgc2VsZi5saWJyYXJ5Q2xvc2VkID0gbGlicmFyeUNsb3NlZDtcclxuICAgICAgICAgIHN3ZWV0U3VjY2VzcyhcIuaJp+ihjOaIkOWKn1wiKTtcclxuICAgICAgICB9KVxyXG4gICAgICAgIC5jYXRjaChmdW5jdGlvbihkYXRhKSB7XHJcbiAgICAgICAgICBzd2VldEVycm9yKGRhdGEpO1xyXG4gICAgICAgIH0pXHJcbiAgICB9LFxyXG4gICAgc2F2ZSgpIHtcclxuICAgICAgY29uc3Qge2ZvcnVtfSA9IHRoaXM7XHJcbiAgICAgIHRoaXMuc2F2aW5nID0gdHJ1ZTtcclxuICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XHJcbiAgICAgIHJldHVybiBua2NBUEkoYC9mLyR7Zm9ydW0uZmlkfS9zZXR0aW5ncy9wZXJtaXNzaW9uYCwgJ1BVVCcsIHtcclxuICAgICAgICBmb3J1bVxyXG4gICAgICB9KVxyXG4gICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgIHN3ZWV0U3VjY2Vzcygn5L+d5a2Y5oiQ5YqfJyk7XHJcbiAgICAgICAgICBzZWxmLnNhdmluZyA9IGZhbHNlO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLmNhdGNoKGVyciA9PiB7XHJcbiAgICAgICAgICBzZWxmLnNhdmluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgc3dlZXRFcnJvcihlcnIpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH1cclxufSk7XHJcbiJdfQ==
