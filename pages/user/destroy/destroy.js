(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

var data = NKC.methods.getDataById("data");
var app = new Vue({
  el: "#app",
  data: {
    verifyEmail: data.verifyEmail,
    verifyMobile: data.verifyMobile,
    verifyPassword: data.verifyPassword,
    nationCodes: window.nationCodes,
    nationCode: "86",
    mobile: "",
    email: "",
    mobileCode: "",
    emailCode: "",
    password: "",
    passed: !data.verifyEmail && !data.verifyMobile && !data.verifyPassword
  },
  methods: {
    verify: function verify() {
      var self = this;
      var nationCode = this.nationCode,
          mobile = this.mobile,
          email = this.email,
          emailCode = this.emailCode,
          mobileCode = this.mobileCode,
          password = this.password;
      nkcAPI("/u/".concat(NKC.configs.uid, "/destroy"), "POST", {
        type: "verify",
        form: {
          nationCode: nationCode,
          mobile: mobile,
          email: email,
          emailCode: emailCode,
          mobileCode: mobileCode,
          password: password
        }
      }).then(function () {
        self.passed = true;
      })["catch"](sweetError);
    },
    submit: function submit() {
      nkcAPI("/u/".concat(NKC.configs.uid, "/destroy"), "POST", {
        type: "destroy"
      }).then(function () {// 注销完成
      })["catch"](sweetError);
    }
  }
});

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9fYnJvd3Nlci1wYWNrQDYuMS4wQGJyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInBhZ2VzL3VzZXIvZGVzdHJveS9kZXN0cm95Lm1qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUEsSUFBTSxJQUFJLEdBQUcsR0FBRyxDQUFDLE9BQUosQ0FBWSxXQUFaLENBQXdCLE1BQXhCLENBQWI7QUFDQSxJQUFNLEdBQUcsR0FBRyxJQUFJLEdBQUosQ0FBUTtBQUNsQixFQUFBLEVBQUUsRUFBRSxNQURjO0FBRWxCLEVBQUEsSUFBSSxFQUFFO0FBQ0osSUFBQSxXQUFXLEVBQUUsSUFBSSxDQUFDLFdBRGQ7QUFFSixJQUFBLFlBQVksRUFBRSxJQUFJLENBQUMsWUFGZjtBQUdKLElBQUEsY0FBYyxFQUFFLElBQUksQ0FBQyxjQUhqQjtBQUtKLElBQUEsV0FBVyxFQUFFLE1BQU0sQ0FBQyxXQUxoQjtBQU1KLElBQUEsVUFBVSxFQUFFLElBTlI7QUFPSixJQUFBLE1BQU0sRUFBRSxFQVBKO0FBUUosSUFBQSxLQUFLLEVBQUUsRUFSSDtBQVNKLElBQUEsVUFBVSxFQUFFLEVBVFI7QUFVSixJQUFBLFNBQVMsRUFBRSxFQVZQO0FBV0osSUFBQSxRQUFRLEVBQUUsRUFYTjtBQWFKLElBQUEsTUFBTSxFQUFHLENBQUMsSUFBSSxDQUFDLFdBQU4sSUFBcUIsQ0FBQyxJQUFJLENBQUMsWUFBM0IsSUFBMkMsQ0FBQyxJQUFJLENBQUM7QUFidEQsR0FGWTtBQWlCbEIsRUFBQSxPQUFPLEVBQUU7QUFDUCxJQUFBLE1BRE8sb0JBQ0U7QUFDUCxVQUFNLElBQUksR0FBRyxJQUFiO0FBRE8sVUFFQSxVQUZBLEdBRThELElBRjlELENBRUEsVUFGQTtBQUFBLFVBRVksTUFGWixHQUU4RCxJQUY5RCxDQUVZLE1BRlo7QUFBQSxVQUVvQixLQUZwQixHQUU4RCxJQUY5RCxDQUVvQixLQUZwQjtBQUFBLFVBRTJCLFNBRjNCLEdBRThELElBRjlELENBRTJCLFNBRjNCO0FBQUEsVUFFc0MsVUFGdEMsR0FFOEQsSUFGOUQsQ0FFc0MsVUFGdEM7QUFBQSxVQUVrRCxRQUZsRCxHQUU4RCxJQUY5RCxDQUVrRCxRQUZsRDtBQUdQLE1BQUEsTUFBTSxjQUFPLEdBQUcsQ0FBQyxPQUFKLENBQVksR0FBbkIsZUFBa0MsTUFBbEMsRUFBMEM7QUFDOUMsUUFBQSxJQUFJLEVBQUUsUUFEd0M7QUFFOUMsUUFBQSxJQUFJLEVBQUU7QUFDSixVQUFBLFVBQVUsRUFBVixVQURJO0FBRUosVUFBQSxNQUFNLEVBQU4sTUFGSTtBQUdKLFVBQUEsS0FBSyxFQUFMLEtBSEk7QUFJSixVQUFBLFNBQVMsRUFBVCxTQUpJO0FBS0osVUFBQSxVQUFVLEVBQVYsVUFMSTtBQU1KLFVBQUEsUUFBUSxFQUFSO0FBTkk7QUFGd0MsT0FBMUMsQ0FBTixDQVdHLElBWEgsQ0FXUSxZQUFNO0FBQ1YsUUFBQSxJQUFJLENBQUMsTUFBTCxHQUFjLElBQWQ7QUFDRCxPQWJILFdBY1MsVUFkVDtBQWVELEtBbkJNO0FBb0JQLElBQUEsTUFwQk8sb0JBb0JFO0FBQ1AsTUFBQSxNQUFNLGNBQU8sR0FBRyxDQUFDLE9BQUosQ0FBWSxHQUFuQixlQUFrQyxNQUFsQyxFQUEwQztBQUM5QyxRQUFBLElBQUksRUFBRTtBQUR3QyxPQUExQyxDQUFOLENBR0csSUFISCxDQUdRLFlBQU0sQ0FDVjtBQUNELE9BTEgsV0FNUyxVQU5UO0FBT0Q7QUE1Qk07QUFqQlMsQ0FBUixDQUFaIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiY29uc3QgZGF0YSA9IE5LQy5tZXRob2RzLmdldERhdGFCeUlkKFwiZGF0YVwiKTtcclxuY29uc3QgYXBwID0gbmV3IFZ1ZSh7XHJcbiAgZWw6IFwiI2FwcFwiLFxyXG4gIGRhdGE6IHtcclxuICAgIHZlcmlmeUVtYWlsOiBkYXRhLnZlcmlmeUVtYWlsLFxyXG4gICAgdmVyaWZ5TW9iaWxlOiBkYXRhLnZlcmlmeU1vYmlsZSxcclxuICAgIHZlcmlmeVBhc3N3b3JkOiBkYXRhLnZlcmlmeVBhc3N3b3JkLFxyXG5cclxuICAgIG5hdGlvbkNvZGVzOiB3aW5kb3cubmF0aW9uQ29kZXMsXHJcbiAgICBuYXRpb25Db2RlOiBcIjg2XCIsXHJcbiAgICBtb2JpbGU6IFwiXCIsXHJcbiAgICBlbWFpbDogXCJcIixcclxuICAgIG1vYmlsZUNvZGU6IFwiXCIsXHJcbiAgICBlbWFpbENvZGU6IFwiXCIsXHJcbiAgICBwYXNzd29yZDogXCJcIixcclxuXHJcbiAgICBwYXNzZWQ6ICghZGF0YS52ZXJpZnlFbWFpbCAmJiAhZGF0YS52ZXJpZnlNb2JpbGUgJiYgIWRhdGEudmVyaWZ5UGFzc3dvcmQpXHJcbiAgfSxcclxuICBtZXRob2RzOiB7XHJcbiAgICB2ZXJpZnkoKSB7XHJcbiAgICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xyXG4gICAgICBjb25zdCB7bmF0aW9uQ29kZSwgbW9iaWxlLCBlbWFpbCwgZW1haWxDb2RlLCBtb2JpbGVDb2RlLCBwYXNzd29yZH0gPSB0aGlzO1xyXG4gICAgICBua2NBUEkoYC91LyR7TktDLmNvbmZpZ3MudWlkfS9kZXN0cm95YCwgXCJQT1NUXCIsIHtcclxuICAgICAgICB0eXBlOiBcInZlcmlmeVwiLFxyXG4gICAgICAgIGZvcm06IHtcclxuICAgICAgICAgIG5hdGlvbkNvZGUsXHJcbiAgICAgICAgICBtb2JpbGUsXHJcbiAgICAgICAgICBlbWFpbCxcclxuICAgICAgICAgIGVtYWlsQ29kZSxcclxuICAgICAgICAgIG1vYmlsZUNvZGUsXHJcbiAgICAgICAgICBwYXNzd29yZFxyXG4gICAgICAgIH1cclxuICAgICAgfSlcclxuICAgICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICBzZWxmLnBhc3NlZCA9IHRydWU7XHJcbiAgICAgICAgfSlcclxuICAgICAgICAuY2F0Y2goc3dlZXRFcnJvcilcclxuICAgIH0sXHJcbiAgICBzdWJtaXQoKSB7XHJcbiAgICAgIG5rY0FQSShgL3UvJHtOS0MuY29uZmlncy51aWR9L2Rlc3Ryb3lgLCBcIlBPU1RcIiwge1xyXG4gICAgICAgIHR5cGU6IFwiZGVzdHJveVwiXHJcbiAgICAgIH0pXHJcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgLy8g5rOo6ZSA5a6M5oiQXHJcbiAgICAgICAgfSlcclxuICAgICAgICAuY2F0Y2goc3dlZXRFcnJvcik7XHJcbiAgICB9XHJcbiAgfVxyXG59KTsiXX0=
