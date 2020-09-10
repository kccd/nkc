(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

var data = NKC.methods.getDataById("data");
var app = new Vue({
  el: "#app",
  data: {
    verifyEmail: data.verifyEmail,
    verifyMobile: data.verifyMobile,
    verifyPassword: data.verifyPassword,
    mobileCode: "",
    emailCode: "",
    password: "",
    passed: !data.verifyEmail && !data.verifyMobile && !data.verifyPassword,
    mobileTime: 0,
    emailTime: 0
  },
  computed: {
    disableVerifyButton: function disableVerifyButton() {
      var verifyEmail = this.verifyEmail,
          verifyMobile = this.verifyMobile,
          verifyPassword = this.verifyPassword,
          mobileCode = this.mobileCode,
          emailCode = this.emailCode,
          password = this.password;
      return verifyPassword && !password || verifyEmail && !emailCode || verifyMobile && !mobileCode;
    }
  },
  methods: {
    reduceTime: function reduceTime(type) {
      var self = this;
      setTimeout(function () {
        self[type]--;

        if (self[type] > 0) {
          self.reduceTime(type);
        }
      }, 1000);
    },
    sendEmailCode: function sendEmailCode() {
      if (this.emailTime > 0) return;
      var self = this;
      NKC.methods.sendEmailCode("destroy").then(function () {
        sweetSuccess("验证码已发送");
        self.emailTime = 120;
        self.reduceTime("emailTime");
      })["catch"](sweetError);
    },
    sendMobileCode: function sendMobileCode() {
      if (this.mobileTime > 0) return;
      var self = this;
      NKC.methods.sendMobileCode("destroy").then(function () {
        sweetSuccess("验证码已发送");
        self.mobileTime = 120;
        self.reduceTime("mobileTime");
      })["catch"](sweetError);
    },
    verify: function verify() {
      var self = this;
      var emailCode = this.emailCode,
          mobileCode = this.mobileCode,
          password = this.password;
      nkcAPI("/u/".concat(NKC.configs.uid, "/destroy"), "POST", {
        type: "verify",
        form: {
          emailCode: emailCode,
          mobileCode: mobileCode,
          password: password
        }
      }).then(function () {
        self.passed = true;
      })["catch"](sweetError);
    },
    submit: function submit() {
      var emailCode = this.emailCode,
          mobileCode = this.mobileCode,
          password = this.password;
      sweetQuestion("确定即会注销，注销后短期内不能使用原有用户名重新注册，你将不能再对该账号、积分、发表的内容进行处置，你想好了吗？").then(function () {
        return nkcAPI("/u/".concat(NKC.configs.uid, "/destroy"), "POST", {
          type: "destroy",
          form: {
            emailCode: emailCode,
            mobileCode: mobileCode,
            password: password
          }
        });
      }).then(function () {
        // 注销完成
        if (NKC.configs.isApp) {
          emitEvent("logout");
        } else {
          window.location.href = "/";
        }
      })["catch"](sweetError);
    }
  }
});

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwYWdlcy91c2VyL2Rlc3Ryb3kvZGVzdHJveS5tanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBLElBQU0sSUFBSSxHQUFHLEdBQUcsQ0FBQyxPQUFKLENBQVksV0FBWixDQUF3QixNQUF4QixDQUFiO0FBQ0EsSUFBTSxHQUFHLEdBQUcsSUFBSSxHQUFKLENBQVE7QUFDbEIsRUFBQSxFQUFFLEVBQUUsTUFEYztBQUVsQixFQUFBLElBQUksRUFBRTtBQUNKLElBQUEsV0FBVyxFQUFFLElBQUksQ0FBQyxXQURkO0FBRUosSUFBQSxZQUFZLEVBQUUsSUFBSSxDQUFDLFlBRmY7QUFHSixJQUFBLGNBQWMsRUFBRSxJQUFJLENBQUMsY0FIakI7QUFLSixJQUFBLFVBQVUsRUFBRSxFQUxSO0FBTUosSUFBQSxTQUFTLEVBQUUsRUFOUDtBQU9KLElBQUEsUUFBUSxFQUFFLEVBUE47QUFTSixJQUFBLE1BQU0sRUFBRyxDQUFDLElBQUksQ0FBQyxXQUFOLElBQXFCLENBQUMsSUFBSSxDQUFDLFlBQTNCLElBQTJDLENBQUMsSUFBSSxDQUFDLGNBVHREO0FBV0osSUFBQSxVQUFVLEVBQUUsQ0FYUjtBQVlKLElBQUEsU0FBUyxFQUFHO0FBWlIsR0FGWTtBQWdCbEIsRUFBQSxRQUFRLEVBQUU7QUFDUixJQUFBLG1CQURRLGlDQUNjO0FBQUEsVUFFbEIsV0FGa0IsR0FJaEIsSUFKZ0IsQ0FFbEIsV0FGa0I7QUFBQSxVQUVMLFlBRkssR0FJaEIsSUFKZ0IsQ0FFTCxZQUZLO0FBQUEsVUFFUyxjQUZULEdBSWhCLElBSmdCLENBRVMsY0FGVDtBQUFBLFVBR2xCLFVBSGtCLEdBSWhCLElBSmdCLENBR2xCLFVBSGtCO0FBQUEsVUFHTixTQUhNLEdBSWhCLElBSmdCLENBR04sU0FITTtBQUFBLFVBR0ssUUFITCxHQUloQixJQUpnQixDQUdLLFFBSEw7QUFLcEIsYUFBUSxjQUFjLElBQUksQ0FB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LEdBQUcsQ0FBQyxPQUFKLENBQVksS0FBZixFQUFzQjtBQUNwQixVQUFBLFNBQVMsQ0FBQyxRQUFELENBQVQ7QUFDRCxTQUZELE1BRU87QUFDTCxVQUFBLE1BQU0sQ0FBQyxRQUFQLENBQWdCLElBQWhCLEdBQXVCLEdBQXZCO0FBQ0Q7QUFDRixPQWxCSCxXQW1CUyxVQW5CVDtBQW9CRDtBQXhFTTtBQXpCUyxDQUFSLENBQVoiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJjb25zdCBkYXRhID0gTktDLm1ldGhvZHMuZ2V0RGF0YUJ5SWQoXCJkYXRhXCIpO1xyXG5jb25zdCBhcHAgPSBuZXcgVnVlKHtcclxuICBlbDogXCIjYXBwXCIsXHJcbiAgZGF0YToge1xyXG4gICAgdmVyaWZ5RW1haWw6IGRhdGEudmVyaWZ5RW1haWwsXHJcbiAgICB2ZXJpZnlNb2JpbGU6IGRhdGEudmVyaWZ5TW9iaWxlLFxyXG4gICAgdmVyaWZ5UGFzc3dvcmQ6IGRhdGEudmVyaWZ5UGFzc3dvcmQsXHJcblxyXG4gICAgbW9iaWxlQ29kZTogXCJcIixcclxuICAgIGVtYWlsQ29kZTogXCJcIixcclxuICAgIHBhc3N3b3JkOiBcIlwiLFxyXG5cclxuICAgIHBhc3NlZDogKCFkYXRhLnZlcmlmeUVtYWlsICYmICFkYXRhLnZlcmlmeU1vYmlsZSAmJiAhZGF0YS52ZXJpZnlQYXNzd29yZCksXHJcblxyXG4gICAgbW9iaWxlVGltZTogMCxcclxuICAgIGVtYWlsVGltZTogIDBcclxuICB9LFxyXG4gIGNvbXB1dGVkOiB7XHJcbiAgICBkaXNhYmxlVmVyaWZ5QnV0dG9uKCkge1xyXG4gICAgICBjb25zdCB7XHJcbiAgICAgICAgdmVyaWZ5RW1haWwsIHZlcmlmeU1vYmlsZSwgdmVyaWZ5UGFzc3dvcmQsXHJcbiAgICAgICAgbW9iaWxlQ29kZSwgZW1haWxDb2RlLCBwYXNzd29yZFxyXG4gICAgICB9ID0gdGhpcztcclxuICAgICAgcmV0dXJuICh2ZXJpZnlQYXNzd29yZCAmJiAhcGFzc3dvcmQpIHx8ICh2ZXJpZnlFbWFpbCAmJiAhZW1haWxDb2RlKSB8fCAodmVyaWZ5TW9iaWxlICYmICFtb2JpbGVDb2RlKTtcclxuICAgIH1cclxuICB9LFxyXG4gIG1ldGhvZHM6IHtcclxuICAgIHJlZHVjZVRpbWUodHlwZSkge1xyXG4gICAgICBjb25zdCBzZWxmID0gdGhpcztcclxuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgc2VsZlt0eXBlXSAtLTtcclxuICAgICAgICBpZihzZWxmW3R5cGVdID4gMCkge1xyXG4gICAgICAgICAgc2VsZi5yZWR1Y2VUaW1lKHR5cGUpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSwgMTAwMClcclxuICAgIH0sXHJcbiAgICBzZW5kRW1haWxDb2RlKCkge1xyXG4gICAgICBpZih0aGlzLmVtYWlsVGltZSA+IDApIHJldHVybjtcclxuICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XHJcbiAgICAgIE5LQy5tZXRob2RzLnNlbmRFbWFpbENvZGUoXCJkZXN0cm95XCIpXHJcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgc3dlZXRTdWNjZXNzKFwi6aqM6K+B56CB5bey5Y+R6YCBXCIpO1xyXG4gICAgICAgICAgc2VsZi5lbWFpbFRpbWUgPSAxMjA7XHJcbiAgICAgICAgICBzZWxmLnJlZHVjZVRpbWUoXCJlbWFpbFRpbWVcIik7XHJcbiAgICAgICAgfSlcclxuICAgICAgICAuY2F0Y2goc3dlZXRFcnJvcik7XHJcbiAgICB9LFxyXG4gICAgc2VuZE1vYmlsZUNvZGUoKSB7XHJcbiAgICAgIGlmKHRoaXMubW9iaWxlVGltZSA+IDApIHJldHVybjtcclxuICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XHJcbiAgICAgIE5LQy5tZXRob2RzLnNlbmRNb2JpbGVDb2RlKFwiZGVzdHJveVwiKVxyXG4gICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgIHN3ZWV0U3VjY2VzcyhcIumqjOivgeeggeW3suWPkemAgVwiKTtcclxuICAgICAgICAgIHNlbGYubW9iaWxlVGltZSA9IDEyMDtcclxuICAgICAgICAgIHNlbGYucmVkdWNlVGltZShcIm1vYmlsZVRpbWVcIik7XHJcbiAgICAgICAgfSlcclxuICAgICAgICAuY2F0Y2goc3dlZXRFcnJvcik7XHJcbiAgICB9LFxyXG4gICAgdmVyaWZ5KCkge1xyXG4gICAgICBjb25zdCBzZWxmID0gdGhpcztcclxuICAgICAgY29uc3Qge1xyXG4gICAgICAgIGVtYWlsQ29kZSwgbW9iaWxlQ29kZSwgcGFzc3dvcmRcclxuICAgICAgfSA9IHRoaXM7XHJcbiAgICAgIG5rY0FQSShgL3UvJHtOS0MuY29uZmlncy51aWR9L2Rlc3Ryb3lgLCBcIlBPU1RcIiwge1xyXG4gICAgICAgIHR5cGU6IFwidmVyaWZ5XCIsXHJcbiAgICAgICAgZm9ybToge1xyXG4gICAgICAgICAgZW1haWxDb2RlLFxyXG4gICAgICAgICAgbW9iaWxlQ29kZSxcclxuICAgICAgICAgIHBhc3N3b3JkXHJcbiAgICAgICAgfVxyXG4gICAgICB9KVxyXG4gICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgIHNlbGYucGFzc2VkID0gdHJ1ZTtcclxuICAgICAgICB9KVxyXG4gICAgICAgIC5jYXRjaChzd2VldEVycm9yKVxyXG4gICAgfSxcclxuICAgIHN1Ym1pdCgpIHtcclxuICAgICAgY29uc3Qge2VtYWlsQ29kZSwgbW9iaWxlQ29kZSwgcGFzc3dvcmR9ID0gdGhpcztcclxuICAgICAgc3dlZXRRdWVzdGlvbihcIuehruWumuWNs+S8muazqOmUgO+8jOazqOmUgOWQjuefreacn+WGheS4jeiDveS9v+eUqOWOn+acieeUqOaIt+WQjemHjeaWsOazqOWGjO+8jOS9oOWwhuS4jeiDveWGjeWvueivpei0puWPt+OAgeenr+WIhuOAgeWPkeihqOeahOWGheWuuei/m+ihjOWkhOe9ru+8jOS9oOaDs+WlveS6huWQl++8n1wiKVxyXG4gICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgIHJldHVybiBua2NBUEkoYC91LyR7TktDLmNvbmZpZ3MudWlkfS9kZXN0cm95YCwgXCJQT1NUXCIsIHtcclxuICAgICAgICAgICAgdHlwZTogXCJkZXN0cm95XCIsXHJcbiAgICAgICAgICAgIGZvcm06IHtcclxuICAgICAgICAgICAgICBlbWFpbENvZGUsXHJcbiAgICAgICAgICAgICAgbW9iaWxlQ29kZSxcclxuICAgICAgICAgICAgICBwYXNzd29yZFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9KVxyXG4gICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgIC8vIOazqOmUgOWujOaIkFxyXG4gICAgICAgICAgaWYoTktDLmNvbmZpZ3MuaXNBcHApIHtcclxuICAgICAgICAgICAgZW1pdEV2ZW50KFwibG9nb3V0XCIpO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSBcIi9cIjtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KVxyXG4gICAgICAgIC5jYXRjaChzd2VldEVycm9yKTtcclxuICAgIH1cclxuICB9XHJcbn0pOyJdfQ==
