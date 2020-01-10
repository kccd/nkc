(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

// window.ready()
//   .then(() => {
//     var host = "http://192.168.11.114";
//     // 用户信息
//     var user = getFromLocal('user');
//     if (user && user.grade) {
//       user.gradeImgSrc = '../../images/grade/v' + user.grade._id + 'l.png?t=' + Date.now();
//     }
//     if (isApp()) {
//       host = getFromLocal("host");
//       setPaddingTop(document.getElementById("app"));
//       setBarStyle("dark");
//     }
//   })
//   .catch(data => {
//     bottomAlert(data.error || data);
//     throw data;
//   });
var data = NKC.methods.getDataById("data");
var user = data.user;
var host = data.host;
var app = new Vue({
  el: "#app",
  data: {
    data: data,
    user: user,
    host: host
  },
  mounted: function mounted() {
    console.log(this.data);
  },
  computed: {},
  methods: {}
});
$(function () {
  $(".statistics li").on('click', function (e) {
    $(this).find('span').eq(1).toggle();
  });
  $('.menu').find('div').on('click', function (e) {
    var that = this;
    var index = $(this).index();
    $(this).addClass('active').siblings().removeClass('active');
    $('.menu-item').eq(index).show().siblings('.menu-item').hide();
  });
});

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9fYnJvd3Nlci1wYWNrQDYuMS4wQGJyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInBhZ2VzL3VzZXIvcHJvZmlsZS9tZS5tanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0NBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBR0E7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUNBLElBQUksSUFBSSxHQUFHLEdBQUcsQ0FBQyxPQUFKLENBQVksV0FBWixDQUF3QixNQUF4QixDQUFYO0FBQ0EsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQWhCO0FBQ0EsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQWhCO0FBQ0EsSUFBSSxHQUFHLEdBQUcsSUFBSSxHQUFKLENBQVE7QUFDaEIsRUFBQSxFQUFFLEVBQUUsTUFEWTtBQUVoQixFQUFBLElBQUksRUFBRTtBQUNKLElBQUEsSUFBSSxFQUFKLElBREk7QUFFSixJQUFBLElBQUksRUFBSixJQUZJO0FBR0osSUFBQSxJQUFJLEVBQUo7QUFISSxHQUZVO0FBT2hCLEVBQUEsT0FQZ0IscUJBT047QUFDUixJQUFBLE9BQU8sQ0FBQyxHQUFSLENBQVksS0FBSyxJQUFqQjtBQUNELEdBVGU7QUFVaEIsRUFBQSxRQUFRLEVBQUUsRUFWTTtBQWFoQixFQUFBLE9BQU8sRUFBRTtBQWJPLENBQVIsQ0FBVjtBQWlCQSxDQUFDLENBQUMsWUFBWTtBQUNaLEVBQUEsQ0FBQyxDQUFDLGdCQUFELENBQUQsQ0FBb0IsRUFBcEIsQ0FBdUIsT0FBdkIsRUFBZ0MsVUFBVSxDQUFWLEVBQWE7QUFDM0MsSUFBQSxDQUFDLENBQUMsSUFBRCxDQUFELENBQVEsSUFBUixDQUFhLE1BQWIsRUFBcUIsRUFBckIsQ0FBd0IsQ0FBeEIsRUFBMkIsTUFBM0I7QUFDRCxHQUZEO0FBR0EsRUFBQSxDQUFDLENBQUMsT0FBRCxDQUFELENBQVcsSUFBWCxDQUFnQixLQUFoQixFQUF1QixFQUF2QixDQUEwQixPQUExQixFQUFtQyxVQUFVLENBQVYsRUFBYTtBQUM5QyxRQUFJLElBQUksR0FBRyxJQUFYO0FBQ0EsUUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDLElBQUQsQ0FBRCxDQUFRLEtBQVIsRUFBWjtBQUNBLElBQUEsQ0FBQyxDQUFDLElBQUQsQ0FBRCxDQUFRLFFBQVIsQ0FBaUIsUUFBakIsRUFBMkIsUUFBM0IsR0FBc0MsV0FBdEMsQ0FBa0QsUUFBbEQ7QUFDQSxJQUFBLENBQUMsQ0FBQyxZQUFELENBQUQsQ0FBZ0IsRUFBaEIsQ0FBbUIsS0FBbkIsRUFBMEIsSUFBMUIsR0FBaUMsUUFBakMsQ0FBMEMsWUFBMUMsRUFBd0QsSUFBeEQ7QUFDRCxHQUxEO0FBTUQsQ0FWQSxDQUFEIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiXHJcbi8vIHdpbmRvdy5yZWFkeSgpXHJcbi8vICAgLnRoZW4oKCkgPT4ge1xyXG5cclxuLy8gICAgIHZhciBob3N0ID0gXCJodHRwOi8vMTkyLjE2OC4xMS4xMTRcIjtcclxuLy8gICAgIC8vIOeUqOaIt+S/oeaBr1xyXG4vLyAgICAgdmFyIHVzZXIgPSBnZXRGcm9tTG9jYWwoJ3VzZXInKTtcclxuLy8gICAgIGlmICh1c2VyICYmIHVzZXIuZ3JhZGUpIHtcclxuLy8gICAgICAgdXNlci5ncmFkZUltZ1NyYyA9ICcuLi8uLi9pbWFnZXMvZ3JhZGUvdicgKyB1c2VyLmdyYWRlLl9pZCArICdsLnBuZz90PScgKyBEYXRlLm5vdygpO1xyXG4vLyAgICAgfVxyXG4vLyAgICAgaWYgKGlzQXBwKCkpIHtcclxuLy8gICAgICAgaG9zdCA9IGdldEZyb21Mb2NhbChcImhvc3RcIik7XHJcbi8vICAgICAgIHNldFBhZGRpbmdUb3AoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhcHBcIikpO1xyXG4vLyAgICAgICBzZXRCYXJTdHlsZShcImRhcmtcIik7XHJcbi8vICAgICB9XHJcblxyXG5cclxuLy8gICB9KVxyXG4vLyAgIC5jYXRjaChkYXRhID0+IHtcclxuXHJcbi8vICAgICBib3R0b21BbGVydChkYXRhLmVycm9yIHx8IGRhdGEpO1xyXG4vLyAgICAgdGhyb3cgZGF0YTtcclxuLy8gICB9KTtcclxudmFyIGRhdGEgPSBOS0MubWV0aG9kcy5nZXREYXRhQnlJZChcImRhdGFcIik7XHJcbnZhciB1c2VyID0gZGF0YS51c2VyO1xyXG52YXIgaG9zdCA9IGRhdGEuaG9zdDtcclxudmFyIGFwcCA9IG5ldyBWdWUoe1xyXG4gIGVsOiBcIiNhcHBcIixcclxuICBkYXRhOiB7XHJcbiAgICBkYXRhLFxyXG4gICAgdXNlcixcclxuICAgIGhvc3RcclxuICB9LFxyXG4gIG1vdW50ZWQoKSB7XHJcbiAgICBjb25zb2xlLmxvZyh0aGlzLmRhdGEpXHJcbiAgfSxcclxuICBjb21wdXRlZDoge1xyXG5cclxuICB9LFxyXG4gIG1ldGhvZHM6IHtcclxuICB9XHJcbn0pXHJcblxyXG4kKGZ1bmN0aW9uICgpIHtcclxuICAkKFwiLnN0YXRpc3RpY3MgbGlcIikub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcclxuICAgICQodGhpcykuZmluZCgnc3BhbicpLmVxKDEpLnRvZ2dsZSgpO1xyXG4gIH0pO1xyXG4gICQoJy5tZW51JykuZmluZCgnZGl2Jykub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcclxuICAgIHZhciB0aGF0ID0gdGhpcztcclxuICAgIHZhciBpbmRleCA9ICQodGhpcykuaW5kZXgoKTtcclxuICAgICQodGhpcykuYWRkQ2xhc3MoJ2FjdGl2ZScpLnNpYmxpbmdzKCkucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xyXG4gICAgJCgnLm1lbnUtaXRlbScpLmVxKGluZGV4KS5zaG93KCkuc2libGluZ3MoJy5tZW51LWl0ZW0nKS5oaWRlKCk7XHJcbiAgfSlcclxufSkiXX0=
