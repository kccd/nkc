(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

var threadSettings = NKC.methods.getDataById("threadSettings");

if (!threadSettings.isDisplay) {
  NKC.methods.initPlyrMask = function () {};
} else {
  NKC.methods.initPlyrMask = function (player) {
    var container = player.elements.container;
    var maskDom = $("#plyrMask .plyr-mask").clone(false);
    var maskPlayButton = maskDom.find(".player-tip-button .play");
    var maskDownloadButton = maskDom.find(".player-tip-button .download");
    maskPlayButton.on("click", function () {
      maskDom.remove();
      player.play();
    });
    maskDownloadButton.on("click", function () {
      return NKC.methods.visitUrl(player.download, "_blank");
    });
    $(container).append(maskDom);
  };
}

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9fYnJvd3Nlci1wYWNrQDYuMS4wQGJyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInBhZ2VzL3B1YmxpY01vZHVsZXMvcGx5ci9tYXNrLm1qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUEsSUFBTSxjQUFjLEdBQUcsR0FBRyxDQUFDLE9BQUosQ0FBWSxXQUFaLENBQXdCLGdCQUF4QixDQUF2Qjs7QUFDQSxJQUFHLENBQUMsY0FBYyxDQUFDLFNBQW5CLEVBQThCO0FBQzVCLEVBQUEsR0FBRyxDQUFDLE9BQUosQ0FBWSxZQUFaLEdBQTJCLFlBQU0sQ0FBRSxDQUFuQztBQUNELENBRkQsTUFFTztBQUNMLEVBQUEsR0FBRyxDQUFDLE9BQUosQ0FBWSxZQUFaLEdBQTJCLFVBQVMsTUFBVCxFQUFpQjtBQUMxQyxRQUFNLFNBQVMsR0FBRyxNQUFNLENBQUMsUUFBUCxDQUFnQixTQUFsQztBQUNBLFFBQUksT0FBTyxHQUFHLENBQUMsQ0FBQyxzQkFBRCxDQUFELENBQTBCLEtBQTFCLENBQWdDLEtBQWhDLENBQWQ7QUFDQSxRQUFJLGNBQWMsR0FBRyxPQUFPLENBQUMsSUFBUixDQUFhLDBCQUFiLENBQXJCO0FBQ0EsUUFBSSxrQkFBa0IsR0FBRyxPQUFPLENBQUMsSUFBUixDQUFhLDhCQUFiLENBQXpCO0FBQ0EsSUFBQSxjQUFjLENBQUMsRUFBZixDQUFrQixPQUFsQixFQUEyQixZQUFNO0FBQy9CLE1BQUEsT0FBTyxDQUFDLE1BQVI7QUFDQSxNQUFBLE1BQU0sQ0FBQyxJQUFQO0FBQ0QsS0FIRDtBQUlBLElBQUEsa0JBQWtCLENBQUMsRUFBbkIsQ0FBc0IsT0FBdEIsRUFBK0I7QUFBQSxhQUFNLEdBQUcsQ0FBQyxPQUFKLENBQVksUUFBWixDQUFxQixNQUFNLENBQUMsUUFBNUIsRUFBc0MsUUFBdEMsQ0FBTjtBQUFBLEtBQS9CO0FBQ0EsSUFBQSxDQUFDLENBQUMsU0FBRCxDQUFELENBQWEsTUFBYixDQUFvQixPQUFwQjtBQUNELEdBWEQ7QUFZRCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsImNvbnN0IHRocmVhZFNldHRpbmdzID0gTktDLm1ldGhvZHMuZ2V0RGF0YUJ5SWQoXCJ0aHJlYWRTZXR0aW5nc1wiKTtcclxuaWYoIXRocmVhZFNldHRpbmdzLmlzRGlzcGxheSkge1xyXG4gIE5LQy5tZXRob2RzLmluaXRQbHlyTWFzayA9ICgpID0+IHt9O1xyXG59IGVsc2Uge1xyXG4gIE5LQy5tZXRob2RzLmluaXRQbHlyTWFzayA9IGZ1bmN0aW9uKHBsYXllcikge1xyXG4gICAgY29uc3QgY29udGFpbmVyID0gcGxheWVyLmVsZW1lbnRzLmNvbnRhaW5lcjtcclxuICAgIGxldCBtYXNrRG9tID0gJChcIiNwbHlyTWFzayAucGx5ci1tYXNrXCIpLmNsb25lKGZhbHNlKTtcclxuICAgIGxldCBtYXNrUGxheUJ1dHRvbiA9IG1hc2tEb20uZmluZChcIi5wbGF5ZXItdGlwLWJ1dHRvbiAucGxheVwiKTtcclxuICAgIGxldCBtYXNrRG93bmxvYWRCdXR0b24gPSBtYXNrRG9tLmZpbmQoXCIucGxheWVyLXRpcC1idXR0b24gLmRvd25sb2FkXCIpO1xyXG4gICAgbWFza1BsYXlCdXR0b24ub24oXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICAgIG1hc2tEb20ucmVtb3ZlKCk7XHJcbiAgICAgIHBsYXllci5wbGF5KCk7XHJcbiAgICB9KTtcclxuICAgIG1hc2tEb3dubG9hZEJ1dHRvbi5vbihcImNsaWNrXCIsICgpID0+IE5LQy5tZXRob2RzLnZpc2l0VXJsKHBsYXllci5kb3dubG9hZCwgXCJfYmxhbmtcIikpO1xyXG4gICAgJChjb250YWluZXIpLmFwcGVuZChtYXNrRG9tKTtcclxuICB9XHJcbn1cclxuIl19
