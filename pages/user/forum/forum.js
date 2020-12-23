(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var data = NKC.methods.getDataById("data");
var stepCheckerMap = new Map([["protocol", // 开办指南
function (_ref) {
  var protocol = _ref.protocol;
  return protocol.haveReadProtocol ? {
    passed: true
  } : {
    passed: false,
    message: "请先仔细阅读开办指南"
  };
}], ["enter_info", // 录入信息
function (vm) {
  var enterInfo = vm.enterInfo,
      sendInvite = vm.sendInvite;

  if (!enterInfo.newForumName || !enterInfo.reason || !enterInfo.youWantToDo) {
    return {
      passed: false,
      message: "请先完整填写"
    };
  }

  if (sendInvite.userId.length < 2) {
    return {
      passed: false,
      message: "至少选择2个人"
    };
  } else {
    vm.commitData();
  }
}], ["sucess_section", // 提交成功提示
function (vm) {}]]);
var stepNames = Array.from(stepCheckerMap.keys());
new Vue({
  el: "#app",
  data: {
    step: 0,
    protocol: {
      haveReadProtocol: false
    },
    enterInfo: {
      newForumName: "",
      reason: "",
      youWantToDo: ""
    },
    sendInvite: {
      userId: [],
      users: []
    },
    myPForums: data.myPForums,
    reviewNewForumGuide: data.reviewNewForumGuide,
    buttonName: "提交",
    submitting: false
  },
  computed: {
    stepName: function stepName() {
      return stepNames[this.step] || stepNames[0];
    }
  },
  methods: {
    toStep: function toStep(index) {
      var checker = this.checker,
          stepName = this.stepName;

      var _checker = checker(stepName),
          passed = _checker.passed,
          message = _checker.message;

      return passed ? this.step = index : sweetError(message);
    },
    checker: function checker(stepName) {
      var vm = this;

      if (stepCheckerMap.has(stepName)) {
        var stepChecker = stepCheckerMap.get(stepName);
        return typeof stepChecker === "function" ? stepChecker(vm) : {};
      }

      return {};
    },
    selectUsers: function selectUsers() {
      var self = this;
      selectUserModule.open(function (data) {
        var users = data.users;

        var _iterator = _createForOfIteratorHelper(users),
            _step;

        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var user = _step.value;
            var uid = user.uid,
                username = user.username,
                avatar = user.avatar;
            if (self.sendInvite.userId.includes(uid)) continue;
            self.sendInvite.users.push({
              username: username,
              avatarUrl: NKC.methods.tools.getUrl('userAvatar', avatar),
              uid: uid
            });
            self.sendInvite.userId.push(uid);
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
      }, {
        userCount: 99
      });
    },
    deleteFounder: function deleteFounder(index) {
      this.sendInvite.users.splice(index, 1);
      this.sendInvite.userId.splice(index, 1);
    },
    commitData: function commitData() {
      var enterInfo = this.enterInfo,
          sendInvite = this.sendInvite;
      var self = this;
      self.buttonName = "提交中...";
      self.submitting = true;
      return nkcAPI("/u/".concat(NKC.configs.uid, "/forum"), "POST", {
        info: enterInfo,
        invites: sendInvite.userId
      }).then(function () {
        console.log("提交成功");
        self.buttonName = "提交";
        self.submitting = false;
        self.step = 2;
      })["catch"](function (data) {
        self.step = 1;
        sweetError(data);
      })["finally"](function () {
        self.buttonName = "提交";
        self.submitting = false;
      });
    }
  }
}); // 选择用户组件

var selectUserModule = new NKC.modules.SelectUser();

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwYWdlcy91c2VyL2ZvcnVtL2ZvcnVtLm1qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7O0FDQUEsSUFBSSxJQUFJLEdBQUcsR0FBRyxDQUFDLE9BQUosQ0FBWSxXQUFaLENBQXdCLE1BQXhCLENBQVg7QUFFQSxJQUFNLGNBQWMsR0FBRyxJQUFJLEdBQUosQ0FBUSxDQUM3QixDQUFDLFVBQUQsRUFBZ0I7QUFDZCxnQkFBdUI7QUFBQSxNQUFaLFFBQVksUUFBWixRQUFZO0FBQ3JCLFNBQU8sUUFBUSxDQUFDLGdCQUFULEdBQ0g7QUFBQyxJQUFBLE1BQU0sRUFBQztBQUFSLEdBREcsR0FFSDtBQUFDLElBQUEsTUFBTSxFQUFDLEtBQVI7QUFBZSxJQUFBLE9BQU8sRUFBRTtBQUF4QixHQUZKO0FBR0QsQ0FMSCxDQUQ2QixFQVE3QixDQUFDLFlBQUQsRUFBaUI7QUFDZixVQUFTLEVBQVQsRUFBYTtBQUFBLE1BQ0wsU0FESyxHQUNxQixFQURyQixDQUNMLFNBREs7QUFBQSxNQUNNLFVBRE4sR0FDcUIsRUFEckIsQ0FDTSxVQUROOztBQUVYLE1BQUcsQ0FBQyxTQUFTLENBQUMsWUFBWCxJQUEyQixDQUFDLFNBQVMsQ0FBQyxNQUF0QyxJQUFnRCxDQUFDLFNBQVMsQ0FBQyxXQUE5RCxFQUEyRTtBQUN6RSxXQUFPO0FBQUMsTUFBQSxNQUFNLEVBQUUsS0FBVDtBQUFnQixNQUFBLE9BQU8sRUFBRTtBQUF6QixLQUFQO0FBQ0Q7O0FBQ0QsTUFBRyxVQUFVLENBQUMsTUFBWCxDQUFrQixNQUFsQixHQUEyQixDQUE5QixFQUFpQztBQUMvQixXQUFPO0FBQUMsTUFBQSxNQUFNLEVBQUUsS0FBVDtBQUFnQixNQUFBLE9BQU8sRUFBRTtBQUF6QixLQUFQO0FBQ0QsR0FGRCxNQUVPO0FBQ0wsSUFBQSxFQUFFLENBQUMsVUFBSDtBQUNEO0FBQ0YsQ0FYSCxDQVI2QixFQXFCN0IsQ0FB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QUwsR0FBWSxDQUFaO0FBQ0EsUUFBQSxVQUFVLENBQUMsSUFBRCxDQUFWO0FBQ0QsT0FWSSxhQVdJLFlBQU07QUFDYixRQUFBLElBQUksQ0FBQyxVQUFMLEdBQWtCLElBQWxCO0FBQ0EsUUFBQSxJQUFJLENBQUMsVUFBTCxHQUFrQixLQUFsQjtBQUNELE9BZEksQ0FBUDtBQWVEO0FBMURNO0FBMUJILENBQVIsRSxDQXlGQTs7QUFDQSxJQUFNLGdCQUFnQixHQUFHLElBQUksR0FBRyxDQUFDLE9BQUosQ0FBWSxVQUFoQixFQUF6QiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsImxldCBkYXRhID0gTktDLm1ldGhvZHMuZ2V0RGF0YUJ5SWQoXCJkYXRhXCIpO1xyXG5cclxuY29uc3Qgc3RlcENoZWNrZXJNYXAgPSBuZXcgTWFwKFtcclxuICBbXCJwcm90b2NvbFwiLCAgICAvLyDlvIDlip7mjIfljZdcclxuICAgIGZ1bmN0aW9uKHsgcHJvdG9jb2wgfSkge1xyXG4gICAgICByZXR1cm4gcHJvdG9jb2wuaGF2ZVJlYWRQcm90b2NvbFxyXG4gICAgICAgID8ge3Bhc3NlZDp0cnVlfVxyXG4gICAgICAgIDoge3Bhc3NlZDpmYWxzZSwgbWVzc2FnZTogXCLor7flhYjku5Tnu4bpmIXor7vlvIDlip7mjIfljZdcIn1cclxuICAgIH1cclxuICBdLFxyXG4gIFtcImVudGVyX2luZm9cIiwgICAvLyDlvZXlhaXkv6Hmga9cclxuICAgIGZ1bmN0aW9uKHZtKSB7XHJcbiAgICAgIGxldCB7IGVudGVySW5mbywgc2VuZEludml0ZSB9ID0gdm07XHJcbiAgICAgIGlmKCFlbnRlckluZm8ubmV3Rm9ydW1OYW1lIHx8ICFlbnRlckluZm8ucmVhc29uIHx8ICFlbnRlckluZm8ueW91V2FudFRvRG8pIHtcclxuICAgICAgICByZXR1cm4ge3Bhc3NlZDogZmFsc2UsIG1lc3NhZ2U6IFwi6K+35YWI5a6M5pW05aGr5YaZXCJ9XHJcbiAgICAgIH1cclxuICAgICAgaWYoc2VuZEludml0ZS51c2VySWQubGVuZ3RoIDwgMikge1xyXG4gICAgICAgIHJldHVybiB7cGFzc2VkOiBmYWxzZSwgbWVzc2FnZTogXCLoh7PlsJHpgInmi6ky5Liq5Lq6XCJ9XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdm0uY29tbWl0RGF0YSgpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgXSxcclxuICBbXCJzdWNlc3Nfc2VjdGlvblwiLCAgLy8g5o+Q5Lqk5oiQ5Yqf5o+Q56S6XHJcbiAgICBmdW5jdGlvbih2bSkge1xyXG5cclxuICAgIH1cclxuICBdXHJcbl0pXHJcblxyXG5jb25zdCBzdGVwTmFtZXMgPSBBcnJheS5mcm9tKHN0ZXBDaGVja2VyTWFwLmtleXMoKSk7XHJcblxyXG5uZXcgVnVlKHtcclxuICBlbDogXCIjYXBwXCIsXHJcbiAgZGF0YToge1xyXG4gICAgc3RlcDogMCxcclxuICAgIHByb3RvY29sOiB7XHJcbiAgICAgIGhhdmVSZWFkUHJvdG9jb2w6IGZhbHNlLFxyXG4gICAgfSxcclxuICAgIGVudGVySW5mbzoge1xyXG4gICAgICBuZXdGb3J1bU5hbWU6IFwiXCIsXHJcbiAgICAgIHJlYXNvbjogXCJcIixcclxuICAgICAgeW91V2FudFRvRG86IFwiXCJcclxuICAgIH0sXHJcbiAgICBzZW5kSW52aXRlOiB7XHJcbiAgICAgIHVzZXJJZDogW10sXHJcbiAgICAgIHVzZXJzOiBbXVxyXG4gICAgfSxcclxuICAgIG15UEZvcnVtczogZGF0YS5teVBGb3J1bXMsXHJcbiAgICByZXZpZXdOZXdGb3J1bUd1aWRlOiBkYXRhLnJldmlld05ld0ZvcnVtR3VpZGUsXHJcbiAgICBidXR0b25OYW1lOiBcIuaPkOS6pFwiLFxyXG4gICAgc3VibWl0dGluZzogZmFsc2VcclxuICB9LFxyXG4gIGNvbXB1dGVkOiB7XHJcbiAgICBzdGVwTmFtZSgpIHtcclxuICAgICAgcmV0dXJuIHN0ZXBOYW1lc1t0aGlzLnN0ZXBdIHx8IHN0ZXBOYW1lc1swXTtcclxuICAgIH1cclxuICB9LFxyXG4gIG1ldGhvZHM6IHtcclxuICAgIHRvU3RlcChpbmRleCkge1xyXG4gICAgICBsZXQgeyBjaGVja2VyLCBzdGVwTmFtZSB9ID0gdGhpcztcclxuICAgICAgbGV0IHsgcGFzc2VkLCBtZXNzYWdlIH0gPSBjaGVja2VyKHN0ZXBOYW1lKTtcclxuICAgICAgcmV0dXJuIHBhc3NlZFxyXG4gICAgICAgID8gdGhpcy5zdGVwID0gaW5kZXhcclxuICAgICAgICA6IHN3ZWV0RXJyb3IobWVzc2FnZSk7XHJcbiAgICB9LFxyXG4gICAgY2hlY2tlcihzdGVwTmFtZSkge1xyXG4gICAgICBsZXQgdm0gPSB0aGlzO1xyXG4gICAgICBpZihzdGVwQ2hlY2tlck1hcC5oYXMoc3RlcE5hbWUpKSB7XHJcbiAgICAgICAgbGV0IHN0ZXBDaGVja2VyID0gc3RlcENoZWNrZXJNYXAuZ2V0KHN0ZXBOYW1lKTtcclxuICAgICAgICByZXR1cm4gdHlwZW9mIHN0ZXBDaGVja2VyID09PSBcImZ1bmN0aW9uXCJcclxuICAgICAgICAgID8gc3RlcENoZWNrZXIodm0pXHJcbiAgICAgICAgICA6IHt9XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHt9O1xyXG4gICAgfSxcclxuICAgIHNlbGVjdFVzZXJzKCkge1xyXG4gICAgICBsZXQgc2VsZiA9IHRoaXM7XHJcbiAgICAgIHNlbGVjdFVzZXJNb2R1bGUub3BlbigoZGF0YSkgPT4ge1xyXG4gICAgICAgIGNvbnN0IHt1c2Vyc30gPSBkYXRhO1xyXG4gICAgICAgIGZvcihjb25zdCB1c2VyIG9mIHVzZXJzKSB7XHJcbiAgICAgICAgICBjb25zdCB7dWlkLCB1c2VybmFtZSwgYXZhdGFyfSA9IHVzZXI7XHJcbiAgICAgICAgICBpZihzZWxmLnNlbmRJbnZpdGUudXNlcklkLmluY2x1ZGVzKHVpZCkpIGNvbnRpbnVlO1xyXG4gICAgICAgICAgc2VsZi5zZW5kSW52aXRlLnVzZXJzLnB1c2goe1xyXG4gICAgICAgICAgICB1c2VybmFtZSxcclxuICAgICAgICAgICAgYXZhdGFyVXJsOiBOS0MubWV0aG9kcy50b29scy5nZXRVcmwoJ3VzZXJBdmF0YXInLCBhdmF0YXIpLFxyXG4gICAgICAgICAgICB1aWRcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgc2VsZi5zZW5kSW52aXRlLnVzZXJJZC5wdXNoKHVpZCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9LCB7dXNlckNvdW50OiA5OX0pXHJcbiAgICB9LFxyXG4gICAgZGVsZXRlRm91bmRlcihpbmRleCkge1xyXG4gICAgICB0aGlzLnNlbmRJbnZpdGUudXNlcnMuc3BsaWNlKGluZGV4LCAxKTtcclxuICAgICAgdGhpcy5zZW5kSW52aXRlLnVzZXJJZC5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgfSxcclxuICAgIGNvbW1pdERhdGEoKSB7XHJcbiAgICAgIGxldCB7IGVudGVySW5mbywgc2VuZEludml0ZSB9ID0gdGhpcztcclxuICAgICAgbGV0IHNlbGYgPSB0aGlzO1xyXG4gICAgICBzZWxmLmJ1dHRvbk5hbWUgPSBcIuaPkOS6pOS4rS4uLlwiO1xyXG4gICAgICBzZWxmLnN1Ym1pdHRpbmcgPSB0cnVlO1xyXG4gICAgICByZXR1cm4gbmtjQVBJKGAvdS8ke05LQy5jb25maWdzLnVpZH0vZm9ydW1gLCBcIlBPU1RcIiwge2luZm86IGVudGVySW5mbywgaW52aXRlczogc2VuZEludml0ZS51c2VySWR9KVxyXG4gICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKFwi5o+Q5Lqk5oiQ5YqfXCIpO1xyXG4gICAgICAgICAgc2VsZi5idXR0b25OYW1lID0gXCLmj5DkuqRcIjtcclxuICAgICAgICAgIHNlbGYuc3VibWl0dGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgc2VsZi5zdGVwID0gMjtcclxuICAgICAgICB9KVxyXG4gICAgICAgIC5jYXRjaCgoZGF0YSkgPT4ge1xyXG4gICAgICAgICAgc2VsZi5zdGVwID0gMTtcclxuICAgICAgICAgIHN3ZWV0RXJyb3IoZGF0YSk7XHJcbiAgICAgICAgfSlcclxuICAgICAgICAuZmluYWxseSgoKSA9PiB7XHJcbiAgICAgICAgICBzZWxmLmJ1dHRvbk5hbWUgPSBcIuaPkOS6pFwiO1xyXG4gICAgICAgICAgc2VsZi5zdWJtaXR0aW5nID0gZmFsc2U7XHJcbiAgICAgICAgfSlcclxuICAgIH1cclxuICB9XHJcbn0pXHJcblxyXG5cclxuLy8g6YCJ5oup55So5oi357uE5Lu2XHJcbmNvbnN0IHNlbGVjdFVzZXJNb2R1bGUgPSBuZXcgTktDLm1vZHVsZXMuU2VsZWN0VXNlcigpO1xyXG5cclxuIl19
