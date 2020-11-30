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
      var typeName = {
        create: '开设',
        open: '开启',
        close: '关闭'
      }[type];
      sweetQuestion("\u786E\u5B9A\u8981".concat(typeName, "\u4E13\u680F\uFF1F")).then(function () {
        return nkcAPI("/f/" + fid + "/library", "POST", {
          type: type
        });
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwYWdlcy9mb3J1bS9zZXR0aW5ncy9wZXJtaXNzaW9uLm1qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7O0FDQUEsSUFBTSxJQUFJLEdBQUcsR0FBRyxDQUFDLE9BQUosQ0FBWSxXQUFaLENBQXdCLE1BQXhCLENBQWI7QUFDQSxJQUFNLFVBQVUsR0FBRyxJQUFJLEdBQUcsQ0FBQyxPQUFKLENBQVksVUFBaEIsRUFBbkI7QUFDQSxJQUFNLEdBQUcsR0FBRyxJQUFJLEdBQUosQ0FBUTtBQUNsQixFQUFBLEVBQUUsRUFBRSxNQURjO0FBRWxCLEVBQUEsSUFBSSxFQUFFO0FBQ0osSUFBQSxLQUFLLEVBQUUsSUFBSSxDQUFDLEtBRFI7QUFFSixJQUFBLEtBQUssRUFBRSxJQUFJLENBQUMsS0FGUjtBQUdKLElBQUEsTUFBTSxFQUFFLElBQUksQ0FBQyxNQUhUO0FBSUosSUFBQSxVQUFVLEVBQUUsSUFBSSxDQUFDLFVBSmI7QUFLSixJQUFBLFVBQVUsRUFBRSxJQUFJLENBQUMsU0FMYjtBQU1KLElBQUEsYUFBYSxFQUFFLElBQUksQ0FBQyxhQU5oQjtBQU9KLElBQUEsTUFBTSxFQUFFLEtBUEo7QUFRSixJQUFBLFVBQVUsRUFBRSxJQUFJLENBQUM7QUFSYixHQUZZO0FBWWxCLEVBQUEsUUFBUSxFQUFFO0FBQ1IsSUFBQSxLQURRLG1CQUNBO0FBQUEsVUFDQyxVQURELEdBQ2UsSUFEZixDQUNDLFVBREQ7QUFFTixVQUFNLEtBQUssR0FBRyxFQUFkOztBQUZNLGlEQUdTLFVBSFQ7QUFBQTs7QUFBQTtBQUdOLDREQUEyQjtBQUFBLGNBQWpCLENBQWlCO0FBQ3pCLFVBQUEsS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFILENBQUwsR0FBZSxDQUFmO0FBQ0Q7QUFMSztBQUFBO0FBQUE7QUFBQTtBQUFBOztBQU1OLGFBQU8sS0FBUDtBQUNELEtBUk87QUFTUixJQUFBLFlBQVksRUFB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TCxHQUFxQixhQUFyQjtBQUNBLFFBQUEsWUFBWSxDQUFDLE1BQUQsQ0FBWjtBQUNELE9BWEgsV0FZUyxVQUFTLElBQVQsRUFBZTtBQUNwQixRQUFBLFVBQVUsQ0FBQyxJQUFELENBQVY7QUFDRCxPQWRIO0FBZUQsS0FoRE07QUFpRFAsSUFBQSxJQWpETyxrQkFpREE7QUFBQSxVQUNFLEtBREYsR0FDVyxJQURYLENBQ0UsS0FERjtBQUVMLFdBQUssTUFBTCxHQUFjLElBQWQ7QUFDQSxVQUFNLElBQUksR0FBRyxJQUFiO0FBQ0EsYUFBTyxNQUFNLGNBQU8sS0FBSyxDQUFDLEdBQWIsMkJBQXdDLEtBQXhDLEVBQStDO0FBQzFELFFBQUEsS0FBSyxFQUFMO0FBRDBELE9BQS9DLENBQU4sQ0FHSixJQUhJLENBR0MsWUFBTTtBQUNWLFFBQUEsWUFBWSxDQUFDLE1BQUQsQ0FBWjtBQUNBLFFBQUEsSUFBSSxDQUFDLE1BQUwsR0FBYyxLQUFkO0FBQ0QsT0FOSSxXQU9FLFVBQUEsR0FBRyxFQUFJO0FBQ1osUUFBQSxJQUFJLENBQUMsTUFBTCxHQUFjLEtBQWQ7QUFDQSxRQUFBLFVBQVUsQ0FBQyxHQUFELENBQVY7QUFDRCxPQVZJLENBQVA7QUFXRDtBQWhFTTtBQW5DUyxDQUFSLENBQVoiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJjb25zdCBkYXRhID0gTktDLm1ldGhvZHMuZ2V0RGF0YUJ5SWQoJ2RhdGEnKTtcclxuY29uc3Qgc2VsZWN0VXNlciA9IG5ldyBOS0MubW9kdWxlcy5TZWxlY3RVc2VyKCk7XHJcbmNvbnN0IGFwcCA9IG5ldyBWdWUoe1xyXG4gIGVsOiAnI2FwcCcsXHJcbiAgZGF0YToge1xyXG4gICAgZm9ydW06IGRhdGEuZm9ydW0sXHJcbiAgICByb2xlczogZGF0YS5yb2xlcyxcclxuICAgIGdyYWRlczogZGF0YS5ncmFkZXMsXHJcbiAgICBwZXJtaXNzaW9uOiBkYXRhLnBlcm1pc3Npb24sXHJcbiAgICBvcGVyYXRpb25zOiBkYXRhLm9wZXJhdGlvbixcclxuICAgIGxpYnJhcnlDbG9zZWQ6IGRhdGEubGlicmFyeUNsb3NlZCxcclxuICAgIHNhdmluZzogZmFsc2UsXHJcbiAgICBtb2RlcmF0b3JzOiBkYXRhLm1vZGVyYXRvcnNcclxuICB9LFxyXG4gIGNvbXB1dGVkOiB7XHJcbiAgICB1c2VycygpIHtcclxuICAgICAgY29uc3Qge21vZGVyYXRvcnN9ID0gdGhpcztcclxuICAgICAgY29uc3QgdXNlcnMgPSB7fTtcclxuICAgICAgZm9yKGNvbnN0IHUgb2YgbW9kZXJhdG9ycykge1xyXG4gICAgICAgIHVzZXJzW3UudWlkXSA9IHU7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHVzZXJzO1xyXG4gICAgfSxcclxuICAgIG9wZXJhdGlvbnNJZDogZnVuY3Rpb24oKSB7XHJcbiAgICAgIHZhciBhcnIgPSBbXTtcclxuICAgICAgZm9yKHZhciBpID0gMDsgaSA8IHRoaXMub3BlcmF0aW9ucy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGFyci5wdXNoKHRoaXMub3BlcmF0aW9uc1tpXS5uYW1lKTtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gYXJyO1xyXG4gICAgfVxyXG4gIH0sXHJcbiAgbW91bnRlZCgpIHtcclxuICAgIHRoaXMuaW5pdFVzZXJQYW5lbCgpO1xyXG4gIH0sXHJcbiAgdXBkYXRlZCgpIHtcclxuICAgIHRoaXMuaW5pdFVzZXJQYW5lbCgpO1xyXG4gIH0sXHJcbiAgbWV0aG9kczoge1xyXG4gICAgaW5pdFVzZXJQYW5lbCgpIHtcclxuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgd2luZG93LmZsb2F0VXNlclBhbmVsLmluaXRQYW5lbCgpO1xyXG4gICAgICB9LCA1MDApXHJcbiAgICB9LFxyXG4gICAgc2VsZWN0QWxsOiBmdW5jdGlvbihwKSB7XHJcbiAgICAgIGlmKHAub3BlcmF0aW9uc0lkLmxlbmd0aCA9PT0gdGhpcy5vcGVyYXRpb25zSWQubGVuZ3RoKSB7XHJcbiAgICAgICAgcC5vcGVyYXRpb25zSWQgPSBbXTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBwLm9wZXJhdGlvbnNJZCA9IHRoaXMub3BlcmF0aW9uc0lkO1xyXG4gICAgICB9XHJcbiAgICB9LFxyXG4gICAgcmVtb3ZlTW9kZXJhdG9yKGluZGV4KSB7XHJcbiAgICAgIHRoaXMuZm9ydW0ubW9kZXJhdG9ycy5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgfSxcclxuICAgIGFkZE1vZGVyYXRvcigpIHtcclxuICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XHJcbiAgICAgIHNlbGVjdFVzZXIub3BlbihkYXRhID0+IHtcclxuICAgICAgICBjb25zdCB7dXNlcnMsIHVzZXJzSWR9ID0gZGF0YTtcclxuICAgICAgICBzZWxmLm1vZGVyYXRvcnMgPSBzZWxmLm1vZGVyYXRvcnMuY29uY2F0KHVzZXJzKTtcclxuICAgICAgICBmb3IoY29uc3QgdWlkIG9mIHVzZXJzSWQpIHtcclxuICAgICAgICAgIGlmKCFzZWxmLmZvcnVtLm1vZGVyYXRvcnMuaW5jbHVkZXModWlkKSkgc2VsZi5mb3J1bS5tb2RlcmF0b3JzLnB1c2godWlkKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIGxpYnJhcnlPcGVyYXRpb24oZmlkLCB0eXBlKSB7XHJcbiAgICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xyXG4gICAgICBjb25zdCB0eXBlTmFtZSA9IHtcclxuICAgICAgICBjcmVhdGU6ICflvIDorr4nLFxyXG4gICAgICAgIG9wZW46ICflvIDlkK8nLFxyXG4gICAgICAgIGNsb3NlOiAn5YWz6ZetJ1xyXG4gICAgICB9W3R5cGVdO1xyXG4gICAgICBzd2VldFF1ZXN0aW9uKGDnoa7lrpropoEke3R5cGVOYW1lfeS4k+agj++8n2ApXHJcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgcmV0dXJuIG5rY0FQSShcIi9mL1wiICsgZmlkICsgXCIvbGlicmFyeVwiLCBcIlBPU1RcIiwge1xyXG4gICAgICAgICAgICB0eXBlOiB0eXBlXHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9KVxyXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgICAgICAgIGNvbnN0IHtsaWJyYXJ5Q2xvc2VkLCBsaWJyYXJ5fSA9IGRhdGE7XHJcbiAgICAgICAgICBzZWxmLmZvcnVtLmxpZCA9IGxpYnJhcnkuX2lkO1xyXG4gICAgICAgICAgc2VsZi5saWJyYXJ5Q2xvc2VkID0gbGlicmFyeUNsb3NlZDtcclxuICAgICAgICAgIHN3ZWV0U3VjY2VzcyhcIuaJp+ihjOaIkOWKn1wiKTtcclxuICAgICAgICB9KVxyXG4gICAgICAgIC5jYXRjaChmdW5jdGlvbihkYXRhKSB7XHJcbiAgICAgICAgICBzd2VldEVycm9yKGRhdGEpO1xyXG4gICAgICAgIH0pXHJcbiAgICB9LFxyXG4gICAgc2F2ZSgpIHtcclxuICAgICAgY29uc3Qge2ZvcnVtfSA9IHRoaXM7XHJcbiAgICAgIHRoaXMuc2F2aW5nID0gdHJ1ZTtcclxuICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XHJcbiAgICAgIHJldHVybiBua2NBUEkoYC9mLyR7Zm9ydW0uZmlkfS9zZXR0aW5ncy9wZXJtaXNzaW9uYCwgJ1BVVCcsIHtcclxuICAgICAgICBmb3J1bVxyXG4gICAgICB9KVxyXG4gICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgIHN3ZWV0U3VjY2Vzcygn5L+d5a2Y5oiQ5YqfJyk7XHJcbiAgICAgICAgICBzZWxmLnNhdmluZyA9IGZhbHNlO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLmNhdGNoKGVyciA9PiB7XHJcbiAgICAgICAgICBzZWxmLnNhdmluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgc3dlZXRFcnJvcihlcnIpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH1cclxufSk7XHJcbiJdfQ==
