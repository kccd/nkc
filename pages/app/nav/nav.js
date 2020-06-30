(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

window.closeWin = function () {
  if (NKC.configs.platform === 'apiCloud') {
    api.closeWin();
  } else if (NKC.configs.platform === 'reactNative') {
    NKC.methods.rn.emit('closeWebView', {
      drawer: true
    });
  }
};

window.logout = function () {
  nkcAPI("/logout", "GET").then(function () {
    if (NKC.configs.platform === 'apiCloud') {
      emitEvent("logout");
    } else if (NKC.configs.platform === 'reactNative') {
      NKC.methods.rn.emit('logout');
    }
  })["catch"](function (data) {
    screenTopWarning(data);
  });
};

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9fYnJvd3Nlci1wYWNrQDYuMS4wQGJyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInBhZ2VzL2FwcC9uYXYvbmF2Lm1qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUEsTUFBTSxDQUFDLFFBQVAsR0FBa0IsWUFBVztBQUMzQixNQUFHLEdBQUcsQ0FBQyxPQUFKLENBQVksUUFBWixLQUF5QixVQUE1QixFQUF3QztBQUN0QyxJQUFBLEdBQUcsQ0FBQyxRQUFKO0FBQ0QsR0FGRCxNQUVPLElBQUcsR0FBRyxDQUFDLE9BQUosQ0FBWSxRQUFaLEtBQXlCLGFBQTVCLEVBQTJDO0FBQ2hELElBQUEsR0FBRyxDQUFDLE9BQUosQ0FBWSxFQUFaLENBQWUsSUFBZixDQUFvQixjQUFwQixFQUFvQztBQUFDLE1BQUEsTUFBTSxFQUFFO0FBQVQsS0FBcEM7QUFDRDtBQUNGLENBTkQ7O0FBT0EsTUFBTSxDQUFDLE1BQVAsR0FBZ0IsWUFBVztBQUN6QixFQUFBLE1BQU0sQ0FBQyxTQUFELEVBQVksS0FBWixDQUFOLENBQ0csSUFESCxDQUNRLFlBQU07QUFDVixRQUFHLEdBQUcsQ0FBQyxPQUFKLENBQVksUUFBWixLQUF5QixVQUE1QixFQUF3QztBQUN0QyxNQUFBLFNBQVMsQ0FBQyxRQUFELENBQVQ7QUFDRCxLQUZELE1BRU8sSUFBRyxHQUFHLENBQUMsT0FBSixDQUFZLFFBQVosS0FBeUIsYUFBNUIsRUFBMkM7QUFDaEQsTUFBQSxHQUFHLENBQUMsT0FBSixDQUFZLEVBQVosQ0FBZSxJQUFmLENBQW9CLFFBQXBCO0FBQ0Q7QUFDRixHQVBILFdBUVMsVUFBQSxJQUFJLEVBQUk7QUFDYixJQUFBLGdCQUFnQixDQUFDLElBQUQsQ0FBaEI7QUFDRCxHQVZIO0FBV0QsQ0FaRCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIndpbmRvdy5jbG9zZVdpbiA9IGZ1bmN0aW9uKCkge1xyXG4gIGlmKE5LQy5jb25maWdzLnBsYXRmb3JtID09PSAnYXBpQ2xvdWQnKSB7XHJcbiAgICBhcGkuY2xvc2VXaW4oKTtcclxuICB9IGVsc2UgaWYoTktDLmNvbmZpZ3MucGxhdGZvcm0gPT09ICdyZWFjdE5hdGl2ZScpIHtcclxuICAgIE5LQy5tZXRob2RzLnJuLmVtaXQoJ2Nsb3NlV2ViVmlldycsIHtkcmF3ZXI6IHRydWV9KTtcclxuICB9XHJcbn07XHJcbndpbmRvdy5sb2dvdXQgPSBmdW5jdGlvbigpIHtcclxuICBua2NBUEkoXCIvbG9nb3V0XCIsIFwiR0VUXCIpXHJcbiAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgIGlmKE5LQy5jb25maWdzLnBsYXRmb3JtID09PSAnYXBpQ2xvdWQnKSB7XHJcbiAgICAgICAgZW1pdEV2ZW50KFwibG9nb3V0XCIpO1xyXG4gICAgICB9IGVsc2UgaWYoTktDLmNvbmZpZ3MucGxhdGZvcm0gPT09ICdyZWFjdE5hdGl2ZScpIHtcclxuICAgICAgICBOS0MubWV0aG9kcy5ybi5lbWl0KCdsb2dvdXQnKTtcclxuICAgICAgfVxyXG4gICAgfSlcclxuICAgIC5jYXRjaChkYXRhID0+IHtcclxuICAgICAgc2NyZWVuVG9wV2FybmluZyhkYXRhKTtcclxuICAgIH0pXHJcbn07XHJcbiJdfQ==
