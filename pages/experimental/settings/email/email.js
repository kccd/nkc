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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9fYnJvd3Nlci1wYWNrQDYuMS4wQGJyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInBhZ2VzL2V4cGVyaW1lbnRhbC9zZXR0aW5ncy9lbWFpbC9lbWFpbC5tanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBLElBQU0sSUFBSSxHQUFHLEdBQUcsQ0FBQyxPQUFKLENBQVksV0FBWixDQUF3QixNQUF4QixDQUFiO0FBQ0EsSUFBTSxHQUFHLEdBQUcsSUFBSSxHQUFKLENBQVE7QUFDbEIsRUFBQSxFQUFFLEVBQUUsTUFEYztBQUVsQixFQUFBLElBQUksRUFBRTtBQUNKLElBQUEsYUFBYSxFQUFFLElBQUksQ0FBQyxhQURoQjtBQUVKLElBQUEsSUFBSSxFQUFFO0FBQ0osTUFBQSxJQUFJLEVBQUUsV0FERjtBQUVKLE1BQUEsT0FBTyxFQUFFLEVBRkw7QUFHSixNQUFBLEtBQUssRUFBRTtBQUhIO0FBRkYsR0FGWTtBQVVsQixFQUFBLE9BQU8sRUFBRTtBQUNQLElBQUEsSUFBSSxFQUFFLGNBQVMsQ0FBVCxFQUFZO0FBQ2hCLGNBQVEsQ0FBUjtBQUNFLGFBQUssV0FBTDtBQUFrQixpQkFBTyxNQUFQOztBQUNsQixhQUFLLFNBQUw7QUFBZ0IsaUJBQU8sTUFBUDs7QUFDaEIsYUFBSyxhQUFMO0FBQW9CLGlCQUFPLE1BQVA7O0FBQ3BCLGFBQUssU0FBTDtBQUFnQixpQkFBTyxNQUFQOztBQUNoQixhQUFLLGFBQUw7QUFBb0IsaUJBQU8sTUFBUDtBQUx0QjtBQU9ELEtBVE07QUFVUCxJQUFBLGFBQWEsRUFBRSx5QkFBVztBQUN4QixNQUFBLGFBQWEsQ0FBQyxhQUFELENBQWIsQ0FDRyxJQURILENBQ1EsWUFBVztBQUNmLGVBQU8sTUFBTSxDQUFDLHdCQUFELEVBQTJCLE1BQTNCLEVBQW1DLEdBQUcsQ0FBQyxJQUF2QyxDQUFiO0FBQ0QsT0FISCxFQUlHLElBSkgsQ0FJUSxZQUFXO0FBQ2YsUUFBQSxjQUFjLENBQUMsVUFBRCxDQUFkO0FBQ0QsT0FOSCxXQU9TLFVBQVMsSUFBVCxFQUFlO0FBQ3BCLFFBQUEsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLEtBQUwsSUFBYyxJQUFmLENBQWhCO0FBQ0QsT0FUSDtBQVdELEtBdEJNO0FBdUJQLElBQUEsSUFBSSxFQUFFLGdCQUFXO0FBQ2YsTUFBQSxNQUFNLENBQUMsbUJBQUQsRUFBc0IsT0FBdEIsRUFBK0I7QUFBQyxRQUFBLGFBQWEsRUFBRSxLQUFLO0FBQXJCLE9BQS9CLENBQU4sQ0FDRyxJQURILENBQ1EsWUFBVztBQUNmLFFBQUEsY0FBYyxDQUFDLE1BQUQsQ0FBZDtBQUNELE9BSEgsV0FJUyxVQUFTLElBQVQsRUFBZTtBQUNwQixRQUFBLGdCQUFnQixDQUFDLElBQUksQ0FBQyxLQUFMLElBQWMsSUFBZixDQUFoQjtBQUNELE9BTkg7QUFPRDtBQS9CTTtBQVZTLENBQVIsQ0FBWiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsImNvbnN0IGRhdGEgPSBOS0MubWV0aG9kcy5nZXREYXRhQnlJZChcImRhdGFcIik7XHJcbmNvbnN0IGFwcCA9IG5ldyBWdWUoe1xyXG4gIGVsOiAnI2FwcCcsXHJcbiAgZGF0YToge1xyXG4gICAgZW1haWxTZXR0aW5nczogZGF0YS5lbWFpbFNldHRpbmdzLFxyXG4gICAgdGVzdDoge1xyXG4gICAgICBuYW1lOiAnYmluZEVtYWlsJyxcclxuICAgICAgY29udGVudDogXCJcIixcclxuICAgICAgZW1haWw6ICcnXHJcbiAgICB9XHJcbiAgfSxcclxuICBtZXRob2RzOiB7XHJcbiAgICB0cmFuOiBmdW5jdGlvbih3KSB7XHJcbiAgICAgIHN3aXRjaCAodykge1xyXG4gICAgICAgIGNhc2UgJ2JpbmRFbWFpbCc6IHJldHVybiAn57uR5a6a6YKu566xJztcclxuICAgICAgICBjYXNlICdnZXRiYWNrJzogcmV0dXJuICfmib7lm57lr4bnoIEnO1xyXG4gICAgICAgIGNhc2UgJ2NoYW5nZUVtYWlsJzogcmV0dXJuICfmm7TmjaLpgq7nrrEnO1xyXG4gICAgICAgIGNhc2UgXCJkZXN0cm95XCI6IHJldHVybiBcIui0puWPt+azqOmUgFwiO1xyXG4gICAgICAgIGNhc2UgXCJ1bmJpbmRFbWFpbFwiOiByZXR1cm4gXCLop6Pnu5Hpgq7nrrFcIlxyXG4gICAgICB9XHJcbiAgICB9LFxyXG4gICAgdGVzdFNlbmRFbWFpbDogZnVuY3Rpb24oKSB7XHJcbiAgICAgIHN3ZWV0UXVlc3Rpb24oXCLnoa7lrpropoHlj5HpgIHpgq7ku7bpqozor4HnoIHvvJ9cIilcclxuICAgICAgICAudGhlbihmdW5jdGlvbigpIHtcclxuICAgICAgICAgIHJldHVybiBua2NBUEkoJy9lL3NldHRpbmdzL2VtYWlsL3Rlc3QnLCAnUE9TVCcsIGFwcC50ZXN0KTtcclxuICAgICAgICB9KVxyXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgc2NyZWVuVG9wQWxlcnQoJ+a1i+ivlemCruS7tuWPkemAgeaIkOWKnycpO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLmNhdGNoKGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgICAgICAgIHNjcmVlblRvcFdhcm5pbmcoZGF0YS5lcnJvciB8fCBkYXRhKTtcclxuICAgICAgICB9KVxyXG5cclxuICAgIH0sXHJcbiAgICBzYXZlOiBmdW5jdGlvbigpIHtcclxuICAgICAgbmtjQVBJKCcvZS9zZXR0aW5ncy9lbWFpbCcsICdQQVRDSCcsIHtlbWFpbFNldHRpbmdzOiB0aGlzLmVtYWlsU2V0dGluZ3N9KVxyXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgc2NyZWVuVG9wQWxlcnQoJ+S/neWtmOaIkOWKnycpO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLmNhdGNoKGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgICAgICAgIHNjcmVlblRvcFdhcm5pbmcoZGF0YS5lcnJvciB8fCBkYXRhKTtcclxuICAgICAgICB9KVxyXG4gICAgfVxyXG4gIH1cclxufSk7Il19
