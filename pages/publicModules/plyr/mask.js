(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

var threadSettings = NKC.methods.getDataById("threadSettings");

if (!threadSettings.isDisplay) {
  NKC.methods.initPlyrMask = function () {};
} else {
  NKC.methods.initPlyrMask = function (player) {
    var container = player.elements.container;
    $(container).find(".plyr__control.plyr__control--overlaid").remove();
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9fYnJvd3Nlci1wYWNrQDYuMS4wQGJyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInBhZ2VzL3B1YmxpY01vZHVsZXMvcGx5ci9tYXNrLm1qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUEsSUFBTSxjQUFjLEdBQUcsR0FBRyxDQUFDLE9BQUosQ0FBWSxXQUFaLENBQXdCLGdCQUF4QixDQUF2Qjs7QUFDQSxJQUFHLENBQUMsY0FBYyxDQUFDLFNBQW5CLEVBQThCO0FBQzVCLEVBQUEsR0FBRyxDQUFDLE9BQUosQ0FBWSxZQUFaLEdBQTJCLFlBQU0sQ0FBRSxDQUFuQztBQUNELENBRkQsTUFFTztBQUNMLEVBQUEsR0FBRyxDQUFDLE9BQUosQ0FBWSxZQUFaLEdBQTJCLFVBQVMsTUFBVCxFQUFpQjtBQUMxQyxRQUFNLFNBQVMsR0FBRyxNQUFNLENBQUMsUUFBUCxDQUFnQixTQUFsQztBQUNBLElBQUEsQ0FBQyxDQUFDLFNBQUQsQ0FBRCxDQUFhLElBQWIsQ0FBa0Isd0NBQWxCLEVBQTRELE1BQTVEO0FBQ0EsUUFBSSxPQUFPLEdBQUcsQ0FBQyxDQUFDLHNCQUFELENBQUQsQ0FBMEIsS0FBMUIsQ0FBZ0MsS0FBaEMsQ0FBZDtBQUNBLFFBQUksY0FBYyxHQUFHLE9BQU8sQ0FBQyxJQUFSLENBQWEsMEJBQWIsQ0FBckI7QUFDQSxRQUFJLGtCQUFrQixHQUFHLE9BQU8sQ0FBQyxJQUFSLENBQWEsOEJBQWIsQ0FBekI7QUFDQSxJQUFBLGNBQWMsQ0FBQyxFQUFmLENBQWtCLE9BQWxCLEVBQTJCLFlBQU07QUFDL0IsTUFBQSxPQUFPLENBQUMsTUFBUjtBQUNBLE1BQUEsTUFBTSxDQUFDLElBQVA7QUFDRCxLQUhEO0FBSUEsSUFBQSxrQkFBa0IsQ0FBQyxFQUFuQixDQUFzQixPQUF0QixFQUErQjtBQUFBLGFBQU0sR0FBRyxDQUFDLE9BQUosQ0FBWSxRQUFaLENBQXFCLE1BQU0sQ0FBQyxRQUE1QixFQUFzQyxRQUF0QyxDQUFOO0FBQUEsS0FBL0I7QUFDQSxJQUFBLENBQUMsQ0FBQyxTQUFELENBQUQsQ0FBYSxNQUFiLENBQW9CLE9BQXBCO0FBQ0QsR0FaRDtBQWFEIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiY29uc3QgdGhyZWFkU2V0dGluZ3MgPSBOS0MubWV0aG9kcy5nZXREYXRhQnlJZChcInRocmVhZFNldHRpbmdzXCIpO1xyXG5pZighdGhyZWFkU2V0dGluZ3MuaXNEaXNwbGF5KSB7XHJcbiAgTktDLm1ldGhvZHMuaW5pdFBseXJNYXNrID0gKCkgPT4ge307XHJcbn0gZWxzZSB7XHJcbiAgTktDLm1ldGhvZHMuaW5pdFBseXJNYXNrID0gZnVuY3Rpb24ocGxheWVyKSB7XHJcbiAgICBjb25zdCBjb250YWluZXIgPSBwbGF5ZXIuZWxlbWVudHMuY29udGFpbmVyO1xyXG4gICAgJChjb250YWluZXIpLmZpbmQoXCIucGx5cl9fY29udHJvbC5wbHlyX19jb250cm9sLS1vdmVybGFpZFwiKS5yZW1vdmUoKTtcclxuICAgIGxldCBtYXNrRG9tID0gJChcIiNwbHlyTWFzayAucGx5ci1tYXNrXCIpLmNsb25lKGZhbHNlKTtcclxuICAgIGxldCBtYXNrUGxheUJ1dHRvbiA9IG1hc2tEb20uZmluZChcIi5wbGF5ZXItdGlwLWJ1dHRvbiAucGxheVwiKTtcclxuICAgIGxldCBtYXNrRG93bmxvYWRCdXR0b24gPSBtYXNrRG9tLmZpbmQoXCIucGxheWVyLXRpcC1idXR0b24gLmRvd25sb2FkXCIpO1xyXG4gICAgbWFza1BsYXlCdXR0b24ub24oXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICAgIG1hc2tEb20ucmVtb3ZlKCk7XHJcbiAgICAgIHBsYXllci5wbGF5KCk7XHJcbiAgICB9KTtcclxuICAgIG1hc2tEb3dubG9hZEJ1dHRvbi5vbihcImNsaWNrXCIsICgpID0+IE5LQy5tZXRob2RzLnZpc2l0VXJsKHBsYXllci5kb3dubG9hZCwgXCJfYmxhbmtcIikpO1xyXG4gICAgJChjb250YWluZXIpLmFwcGVuZChtYXNrRG9tKTtcclxuICB9XHJcbn1cclxuIl19
