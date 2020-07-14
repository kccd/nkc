(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

var data = NKC.methods.getDataById("data");
var app = new Vue({
  el: '#app',
  data: {
    emailSettings: data.emailSettings,
    test: {
      name: 'bindEmail',
      content: "",
      email: ''
    }
  },
  methods: {
    tran: function tran(w) {
      switch (w) {
        case 'bindEmail':
          return '绑定邮箱';

        case 'getback':
          return '找回密码';

        case 'changeEmail':
          return '更换邮箱';

        case "destroy":
          return "账号注销";

        case "unbindEmail":
          return "解绑邮箱";
      }
    },
    testSendEmail: function testSendEmail() {
      sweetQuestion("确定要发送邮件验证码？").then(function () {
        return nkcAPI('/e/settings/email/test', 'POST', app.test);
      }).then(function () {
        screenTopAlert('测试邮件发送成功');
      })["catch"](function (data) {
        screenTopWarning(data.error || data);
      });
    },
    save: function save() {
      nkcAPI('/e/settings/email', 'PATCH', {
        emailSettings: this.emailSettings
      }).then(function () {
        screenTopAlert('保存成功');
      })["catch"](function (data) {
        screenTopWarning(data.error || data);
      });
    }
  }
});

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwYWdlcy9leHBlcmltZW50YWwvc2V0dGluZ3MvZW1haWwvZW1haWwubWpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQSxJQUFNLElBQUksR0FBRyxHQUFHLENBQUMsT0FBSixDQUFZLFdBQVosQ0FBd0IsTUFBeEIsQ0FBYjtBQUNBLElBQU0sR0FBRyxHQUFHLElBQUksR0FBSixDQUFRO0FBQ2xCLEVBQUEsRUFBRSxFQUFFLE1BRGM7QUFFbEIsRUFBQSxJQUFJLEVBQUU7QUFDSixJQUFBLGFBQWEsRUFBRSxJQUFJLENBQUMsYUFEaEI7QUFFSixJQUFBLElBQUksRUFBRTtBQUNKLE1BQUEsSUFBSSxFQUFFLFdBREY7QUFFSixNQUFBLE9BQU8sRUFBRSxFQUZMO0FBR0osTUFBQSxLQUFLLEVBQUU7QUFISDtBQUZGLEdBRlk7QUFVbEIsRUFBQSxPQUFPLEVBQUU7QUFDUCxJQUFBLElBQUksRUFBRSxjQUFTLENBQVQsRUFBWTtBQUNoQixjQUFRLENBQVI7QUFDRSxhQUFLLFdBQUw7QUFBa0IsaUJBQU8sTUFBUDs7QUFDbEIsYUFBSyxTQUFMO0FBQWdCLGlCQUFPLE1BQVA7O0FBQ2hCLGFBQUssYUFBTDtBQUFvQixpQkFBTyxNQUFQOztBQUNwQixhQUFLLFNBQUw7QUFBZ0IsaUJBQU8sTUFBUDs7QUFDaEIsYUFBSyxhQUFMO0FBQW9CLGlCQUFPLE1BQVA7QUFMdEI7QUFPRCxLQVRNO0FBVVAsSUFBQSxhQUFhLEVBQUUseUJBQVc7QUFDeEIsTUFBQSxhQUFhLENBQUMsYUFBRCxDQUFiLENBQ0csSUFESCxDQUNRLFlBQVc7QUFDZixlQUFPLE1BQU0sQ0FBQyx3QkFBRCxFQUEyQixNQUEzQixFQUFtQyxHQUFHLENBQUMsSUFBdkMsQ0FBYjtBQUNELE9BSEgsRUFJRyxJQUpILENBSVEsWUFBVztBQUNmLFFBQUEsY0FBYyxDQUFDLFVBQUQsQ0FBZDtBQUNELE9BTkgsV0FPUyxVQUFTLElBQVQsRUFBZTtBQUNwQixRQUFBLGdCQUFnQixDQUFDLElBQUksQ0FBQyxLQUFMLElBQWMsSUFBZixDQUFoQjtBQUNELE9BVEg7QUFXRCxLQXRCTTtBQXVCUCxJQUFBLElBQUksRUFBRSxnQkFBVztBQUNmLE1BQUEsTUFBTSxDQUFDLG1CQUFELEVBQXNCLE9BQXRCLEVBQStCO0FBQUMsUUFBQSxhQUFhLEVBQUUsS0FBSztBQUFyQixPQUEvQixDQUFOLENBQ0csSUFESCxDQUNRLFlBQVc7QUFDZixRQUFBLGNBQWMsQ0FBQyxNQUFELENBQWQ7QUFDRCxPQUhILFdBSVMsVUFBUyxJQUFULEVBQWU7QUFDcEIsUUFBQSxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsS0FBTCxJQUFjLElBQWYsQ0FBaEI7QUFDRCxPQU5IO0FBT0Q7QUEvQk07QUFWUyxDQUFSLENBQVoiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJjb25zdCBkYXRhID0gTktDLm1ldGhvZHMuZ2V0RGF0YUJ5SWQoXCJkYXRhXCIpO1xyXG5jb25zdCBhcHAgPSBuZXcgVnVlKHtcclxuICBlbDogJyNhcHAnLFxyXG4gIGRhdGE6IHtcclxuICAgIGVtYWlsU2V0dGluZ3M6IGRhdGEuZW1haWxTZXR0aW5ncyxcclxuICAgIHRlc3Q6IHtcclxuICAgICAgbmFtZTogJ2JpbmRFbWFpbCcsXHJcbiAgICAgIGNvbnRlbnQ6IFwiXCIsXHJcbiAgICAgIGVtYWlsOiAnJ1xyXG4gICAgfVxyXG4gIH0sXHJcbiAgbWV0aG9kczoge1xyXG4gICAgdHJhbjogZnVuY3Rpb24odykge1xyXG4gICAgICBzd2l0Y2ggKHcpIHtcclxuICAgICAgICBjYXNlICdiaW5kRW1haWwnOiByZXR1cm4gJ+e7keWumumCrueusSc7XHJcbiAgICAgICAgY2FzZSAnZ2V0YmFjayc6IHJldHVybiAn5om+5Zue5a+G56CBJztcclxuICAgICAgICBjYXNlICdjaGFuZ2VFbWFpbCc6IHJldHVybiAn5pu05o2i6YKu566xJztcclxuICAgICAgICBjYXNlIFwiZGVzdHJveVwiOiByZXR1cm4gXCLotKblj7fms6jplIBcIjtcclxuICAgICAgICBjYXNlIFwidW5iaW5kRW1haWxcIjogcmV0dXJuIFwi6Kej57uR6YKu566xXCJcclxuICAgICAgfVxyXG4gICAgfSxcclxuICAgIHRlc3RTZW5kRW1haWw6IGZ1bmN0aW9uKCkge1xyXG4gICAgICBzd2VldFF1ZXN0aW9uKFwi56Gu5a6a6KaB5Y+R6YCB6YKu5Lu26aqM6K+B56CB77yfXCIpXHJcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICByZXR1cm4gbmtjQVBJKCcvZS9zZXR0aW5ncy9lbWFpbC90ZXN0JywgJ1BPU1QnLCBhcHAudGVzdCk7XHJcbiAgICAgICAgfSlcclxuICAgICAgICAudGhlbihmdW5jdGlvbigpIHtcclxuICAgICAgICAgIHNjcmVlblRvcEFsZXJ0KCfmtYvor5Xpgq7ku7blj5HpgIHmiJDlip8nKTtcclxuICAgICAgICB9KVxyXG4gICAgICAgIC5jYXRjaChmdW5jdGlvbihkYXRhKSB7XHJcbiAgICAgICAgICBzY3JlZW5Ub3BXYXJuaW5nKGRhdGEuZXJyb3IgfHwgZGF0YSk7XHJcbiAgICAgICAgfSlcclxuXHJcbiAgICB9LFxyXG4gICAgc2F2ZTogZnVuY3Rpb24oKSB7XHJcbiAgICAgIG5rY0FQSSgnL2Uvc2V0dGluZ3MvZW1haWwnLCAnUEFUQ0gnLCB7ZW1haWxTZXR0aW5nczogdGhpcy5lbWFpbFNldHRpbmdzfSlcclxuICAgICAgICAudGhlbihmdW5jdGlvbigpIHtcclxuICAgICAgICAgIHNjcmVlblRvcEFsZXJ0KCfkv53lrZjmiJDlip8nKTtcclxuICAgICAgICB9KVxyXG4gICAgICAgIC5jYXRjaChmdW5jdGlvbihkYXRhKSB7XHJcbiAgICAgICAgICBzY3JlZW5Ub3BXYXJuaW5nKGRhdGEuZXJyb3IgfHwgZGF0YSk7XHJcbiAgICAgICAgfSlcclxuICAgIH1cclxuICB9XHJcbn0pOyJdfQ==
