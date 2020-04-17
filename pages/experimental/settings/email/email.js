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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9fYnJvd3Nlci1wYWNrQDYuMS4wQGJyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInBhZ2VzL2V4cGVyaW1lbnRhbC9zZXR0aW5ncy9lbWFpbC9lbWFpbC5tanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBLElBQU0sSUFBSSxHQUFHLEdBQUcsQ0FBQyxPQUFKLENBQVksV0FBWixDQUF3QixNQUF4QixDQUFiO0FBQ0EsSUFBTSxHQUFHLEdBQUcsSUFBSSxHQUFKLENBQVE7QUFDbEIsRUFBQSxFQUFFLEVBQUUsTUFEYztBQUVsQixFQUFBLElBQUksRUFBRTtBQUNKLElBQUEsYUFBYSxFQUFFLElBQUksQ0FBQyxhQURoQjtBQUVKLElBQUEsSUFBSSxFQUFFO0FBQ0osTUFBQSxJQUFJLEVBQUUsV0FERjtBQUVKLE1BQUEsT0FBTyxFQUFFLEVBRkw7QUFHSixNQUFBLEtBQUssRUFBRTtBQUhIO0FBRkYsR0FGWTtBQVVsQixFQUFBLE9BQU8sRUFBRTtBQUNQLElBQUEsSUFBSSxFQUFFLGNBQVMsQ0FBVCxFQUFZO0FBQ2hCLGNBQVEsQ0FBUjtBQUNFLGFBQUssV0FBTDtBQUFrQixpQkFBTyxNQUFQOztBQUNsQixhQUFLLFNBQUw7QUFBZ0IsaUJBQU8sTUFBUDs7QUFDaEIsYUFBSyxhQUFMO0FBQW9CLGlCQUFPLE1BQVA7O0FBQ3BCLGFBQUssU0FBTDtBQUFnQixpQkFBTyxNQUFQOztBQUNoQixhQUFLLGFBQUw7QUFBb0IsaUJBQU8sTUFBUDtBQUx0QjtBQU9ELEtBVE07QUFVUCxJQUFBLGFBQWEsRUFBRSx5QkFBVztBQUN4QixNQUFBLGFBQWEsQ0FBQyxhQUFELENBQWIsQ0FDRyxJQURILENBQ1EsWUFBVztBQUNmLGVBQU8sTUFBTSxDQUFDLHdCQUFELEVBQTJCLE1BQTNCLEVBQW1DLEdBQUcsQ0FBQyxJQUF2QyxDQUFiO0FBQ0QsT0FISCxFQUlHLElBSkgsQ0FJUSxZQUFXO0FBQ2YsUUFBQSxjQUFjLENBQUMsVUFBRCxDQUFkO0FBQ0QsT0FOSCxXQU9TLFVBQVMsSUFBVCxFQUFlO0FBQ3BCLFFBQUEsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLEtBQUwsSUFBYyxJQUFmLENBQWhCO0FBQ0QsT0FUSDtBQVdELEtBdEJNO0FBdUJQLElBQUEsSUFBSSxFQUFFLGdCQUFXO0FBQ2YsTUFBQSxNQUFNLENBQUMsbUJBQUQsRUFBc0IsT0FBdEIsRUFBK0I7QUFBQyxRQUFBLGFBQWEsRUFBRSxLQUFLO0FBQXJCLE9BQS9CLENBQU4sQ0FDRyxJQURILENBQ1EsWUFBVztBQUNmLFFBQUEsY0FBYyxDQUFDLE1BQUQsQ0FBZDtBQUNELE9BSEgsV0FJUyxVQUFTLElBQVQsRUFBZTtBQUNwQixRQUFBLGdCQUFnQixDQUFDLElBQUksQ0FBQyxLQUFMLElBQWMsSUFBZixDQUFoQjtBQUNELE9BTkg7QUFPRDtBQS9CTTtBQVZTLENBQVIsQ0FBWiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsImNvbnN0IGRhdGEgPSBOS0MubWV0aG9kcy5nZXREYXRhQnlJZChcImRhdGFcIik7XG5jb25zdCBhcHAgPSBuZXcgVnVlKHtcbiAgZWw6ICcjYXBwJyxcbiAgZGF0YToge1xuICAgIGVtYWlsU2V0dGluZ3M6IGRhdGEuZW1haWxTZXR0aW5ncyxcbiAgICB0ZXN0OiB7XG4gICAgICBuYW1lOiAnYmluZEVtYWlsJyxcbiAgICAgIGNvbnRlbnQ6IFwiXCIsXG4gICAgICBlbWFpbDogJydcbiAgICB9XG4gIH0sXG4gIG1ldGhvZHM6IHtcbiAgICB0cmFuOiBmdW5jdGlvbih3KSB7XG4gICAgICBzd2l0Y2ggKHcpIHtcbiAgICAgICAgY2FzZSAnYmluZEVtYWlsJzogcmV0dXJuICfnu5Hlrprpgq7nrrEnO1xuICAgICAgICBjYXNlICdnZXRiYWNrJzogcmV0dXJuICfmib7lm57lr4bnoIEnO1xuICAgICAgICBjYXNlICdjaGFuZ2VFbWFpbCc6IHJldHVybiAn5pu05o2i6YKu566xJztcbiAgICAgICAgY2FzZSBcImRlc3Ryb3lcIjogcmV0dXJuIFwi6LSm5Y+35rOo6ZSAXCI7XG4gICAgICAgIGNhc2UgXCJ1bmJpbmRFbWFpbFwiOiByZXR1cm4gXCLop6Pnu5Hpgq7nrrFcIlxuICAgICAgfVxuICAgIH0sXG4gICAgdGVzdFNlbmRFbWFpbDogZnVuY3Rpb24oKSB7XG4gICAgICBzd2VldFF1ZXN0aW9uKFwi56Gu5a6a6KaB5Y+R6YCB6YKu5Lu26aqM6K+B56CB77yfXCIpXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiBua2NBUEkoJy9lL3NldHRpbmdzL2VtYWlsL3Rlc3QnLCAnUE9TVCcsIGFwcC50ZXN0KTtcbiAgICAgICAgfSlcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgICAgc2NyZWVuVG9wQWxlcnQoJ+a1i+ivlemCruS7tuWPkemAgeaIkOWKnycpO1xuICAgICAgICB9KVxuICAgICAgICAuY2F0Y2goZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgIHNjcmVlblRvcFdhcm5pbmcoZGF0YS5lcnJvciB8fCBkYXRhKTtcbiAgICAgICAgfSlcblxuICAgIH0sXG4gICAgc2F2ZTogZnVuY3Rpb24oKSB7XG4gICAgICBua2NBUEkoJy9lL3NldHRpbmdzL2VtYWlsJywgJ1BBVENIJywge2VtYWlsU2V0dGluZ3M6IHRoaXMuZW1haWxTZXR0aW5nc30pXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHNjcmVlblRvcEFsZXJ0KCfkv53lrZjmiJDlip8nKTtcbiAgICAgICAgfSlcbiAgICAgICAgLmNhdGNoKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICBzY3JlZW5Ub3BXYXJuaW5nKGRhdGEuZXJyb3IgfHwgZGF0YSk7XG4gICAgICAgIH0pXG4gICAgfVxuICB9XG59KTsiXX0=
