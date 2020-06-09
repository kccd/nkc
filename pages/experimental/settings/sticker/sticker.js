(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

var data = NKC.methods.getDataById("data");
var app = new Vue({
  el: "#app",
  data: {
    stickerSettings: data.stickerSettings
  },
  methods: {
    submit: function submit() {
      var stickerSettings = this.stickerSettings;
      nkcAPI("/e/settings/sticker", "PATCH", {
        stickerSettings: stickerSettings
      }).then(function () {
        sweetSuccess("保存成功");
      })["catch"](sweetError);
    }
  }
});

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9fYnJvd3Nlci1wYWNrQDYuMS4wQGJyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInBhZ2VzL2V4cGVyaW1lbnRhbC9zZXR0aW5ncy9zdGlja2VyL3N0aWNrZXIubWpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQSxJQUFNLElBQUksR0FBRyxHQUFHLENBQUMsT0FBSixDQUFZLFdBQVosQ0FBd0IsTUFBeEIsQ0FBYjtBQUNBLElBQU0sR0FBRyxHQUFHLElBQUksR0FBSixDQUFRO0FBQ2xCLEVBQUEsRUFBRSxFQUFFLE1BRGM7QUFFbEIsRUFBQSxJQUFJLEVBQUU7QUFDSixJQUFBLGVBQWUsRUFBRSxJQUFJLENBQUM7QUFEbEIsR0FGWTtBQUtsQixFQUFBLE9BQU8sRUFBRTtBQUNQLElBQUEsTUFETyxvQkFDRTtBQUFBLFVBQ0EsZUFEQSxHQUNtQixJQURuQixDQUNBLGVBREE7QUFFUCxNQUFBLE1BQU0sQ0FBQyxxQkFBRCxFQUF3QixPQUF4QixFQUFpQztBQUNyQyxRQUFBLGVBQWUsRUFBZjtBQURxQyxPQUFqQyxDQUFOLENBR0MsSUFIRCxDQUdNLFlBQU07QUFDVixRQUFBLFlBQVksQ0FBQyxNQUFELENBQVo7QUFDRCxPQUxELFdBTU8sVUFOUDtBQU9EO0FBVk07QUFMUyxDQUFSLENBQVoiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJjb25zdCBkYXRhID0gTktDLm1ldGhvZHMuZ2V0RGF0YUJ5SWQoXCJkYXRhXCIpO1xuY29uc3QgYXBwID0gbmV3IFZ1ZSh7XG4gIGVsOiBcIiNhcHBcIixcbiAgZGF0YToge1xuICAgIHN0aWNrZXJTZXR0aW5nczogZGF0YS5zdGlja2VyU2V0dGluZ3NcbiAgfSxcbiAgbWV0aG9kczoge1xuICAgIHN1Ym1pdCgpIHtcbiAgICAgIGNvbnN0IHtzdGlja2VyU2V0dGluZ3N9ID0gdGhpcztcbiAgICAgIG5rY0FQSShcIi9lL3NldHRpbmdzL3N0aWNrZXJcIiwgXCJQQVRDSFwiLCB7XG4gICAgICAgIHN0aWNrZXJTZXR0aW5nc1xuICAgICAgfSlcbiAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgc3dlZXRTdWNjZXNzKFwi5L+d5a2Y5oiQ5YqfXCIpO1xuICAgICAgfSlcbiAgICAgIC5jYXRjaChzd2VldEVycm9yKTtcbiAgICB9XG4gIH1cbn0pOyJdfQ==
