(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

window.payForDownloadResource = function (rid) {
  var a = document.createElement("a");
  a.href = "/r/".concat(rid, "?t=download");
  var downloadAttr = document.createAttribute("download");
  a.setAttributeNode(downloadAttr);
  a.click();
  window.close();
};

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9fYnJvd3Nlci1wYWNrQDYuMS4wQGJyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInBhZ2VzL3Jlc291cmNlL2Rvd25sb2FkLm1qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUEsTUFBTSxDQUFDLHNCQUFQLEdBQWdDLFVBQVMsR0FBVCxFQUFjO0FBQzVDLE1BQUksQ0FBQyxHQUFHLFFBQVEsQ0FBQyxhQUFULENBQXVCLEdBQXZCLENBQVI7QUFDQSxFQUFBLENBQUMsQ0FBQyxJQUFGLGdCQUFlLEdBQWY7QUFDQSxNQUFJLFlBQVksR0FBRyxRQUFRLENBQUMsZUFBVCxDQUF5QixVQUF6QixDQUFuQjtBQUNBLEVBQUEsQ0FBQyxDQUFDLGdCQUFGLENBQW1CLFlBQW5CO0FBQ0EsRUFBQSxDQUFDLENBQUMsS0FBRjtBQUNBLEVBQUEsTUFBTSxDQUFDLEtBQVA7QUFDRCxDQVBEIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwid2luZG93LnBheUZvckRvd25sb2FkUmVzb3VyY2UgPSBmdW5jdGlvbihyaWQpIHtcclxuICBsZXQgYSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJhXCIpO1xyXG4gIGEuaHJlZiA9IGAvci8ke3JpZH0/dD1kb3dubG9hZGA7XHJcbiAgbGV0IGRvd25sb2FkQXR0ciA9IGRvY3VtZW50LmNyZWF0ZUF0dHJpYnV0ZShcImRvd25sb2FkXCIpO1xyXG4gIGEuc2V0QXR0cmlidXRlTm9kZShkb3dubG9hZEF0dHIpO1xyXG4gIGEuY2xpY2soKTtcclxuICB3aW5kb3cuY2xvc2UoKTtcclxufSJdfQ==
