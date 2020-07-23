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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwYWdlcy9leHBlcmltZW50YWwvc2V0dGluZ3Mvc3RpY2tlci9zdGlja2VyLm1qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUEsSUFBTSxJQUFJLEdBQUcsR0FBRyxDQUFDLE9BQUosQ0FBWSxXQUFaLENBQXdCLE1BQXhCLENBQWI7QUFDQSxJQUFNLEdBQUcsR0FBRyxJQUFJLEdBQUosQ0FBUTtBQUNsQixFQUFBLEVBQUUsRUFBRSxNQURjO0FBRWxCLEVBQUEsSUFBSSxFQUFFO0FBQ0osSUFBQSxlQUFlLEVBQUUsSUFBSSxDQUFDO0FBRGxCLEdBRlk7QUFLbEIsRUFBQSxPQUFPLEVBQUU7QUFDUCxJQUFBLE1BRE8sb0JBQ0U7QUFBQSxVQUNBLGVBREEsR0FDbUIsSUFEbkIsQ0FDQSxlQURBO0FBRVAsTUFBQSxNQUFNLENBQUMscUJBQUQsRUFBd0IsT0FBeEIsRUFBaUM7QUFDckMsUUFBQSxlQUFlLEVBQWY7QUFEcUMsT0FBakMsQ0FBTixDQUdDLElBSEQsQ0FHTSxZQUFNO0FBQ1YsUUFBQSxZQUFZLENBQUMsTUFBRCxDQUFaO0FBQ0QsT0FMRCxXQU1PLFVBTlA7QUFPRDtBQVZNO0FBTFMsQ0FBUixDQUFaIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiY29uc3QgZGF0YSA9IE5LQy5tZXRob2RzLmdldERhdGFCeUlkKFwiZGF0YVwiKTtcclxuY29uc3QgYXBwID0gbmV3IFZ1ZSh7XHJcbiAgZWw6IFwiI2FwcFwiLFxyXG4gIGRhdGE6IHtcclxuICAgIHN0aWNrZXJTZXR0aW5nczogZGF0YS5zdGlja2VyU2V0dGluZ3NcclxuICB9LFxyXG4gIG1ldGhvZHM6IHtcclxuICAgIHN1Ym1pdCgpIHtcclxuICAgICAgY29uc3Qge3N0aWNrZXJTZXR0aW5nc30gPSB0aGlzO1xyXG4gICAgICBua2NBUEkoXCIvZS9zZXR0aW5ncy9zdGlja2VyXCIsIFwiUEFUQ0hcIiwge1xyXG4gICAgICAgIHN0aWNrZXJTZXR0aW5nc1xyXG4gICAgICB9KVxyXG4gICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgc3dlZXRTdWNjZXNzKFwi5L+d5a2Y5oiQ5YqfXCIpO1xyXG4gICAgICB9KVxyXG4gICAgICAuY2F0Y2goc3dlZXRFcnJvcik7XHJcbiAgICB9XHJcbiAgfVxyXG59KTsiXX0=
