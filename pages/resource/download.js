(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

// 支付积分并下载
window.payForDownloadResource = function (rid) {
  var a = document.createElement("a");
  a.href = "/r/".concat(rid, "?c=download");
  var downloadAttr = document.createAttribute("download");
  a.setAttributeNode(downloadAttr);
  a.click();
}; // 预览PDF


window.previewPDFResource = function (rid) {
  var a = document.createElement("a");
  a.href = "/r/".concat(rid, "?c=preview_pdf");
  a.setAttribute("target", "_blank");
  a.click();
  window.close();
};

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwYWdlcy9yZXNvdXJjZS9kb3dubG9hZC5tanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBO0FBQ0EsTUFBTSxDQUFDLHNCQUFQLEdBQWdDLFVBQVMsR0FBVCxFQUFjO0FBQzVDLE1BQUksQ0FBQyxHQUFHLFFBQVEsQ0FBQyxhQUFULENBQXVCLEdBQXZCLENBQVI7QUFDQSxFQUFBLENBQUMsQ0FBQyxJQUFGLGdCQUFlLEdBQWY7QUFDQSxNQUFJLFlBQVksR0FBRyxRQUFRLENBQUMsZUFBVCxDQUF5QixVQUF6QixDQUFuQjtBQUNBLEVBQUEsQ0FBQyxDQUFDLGdCQUFGLENBQW1CLFlBQW5CO0FBQ0EsRUFBQSxDQUFDLENBQUMsS0FBRjtBQUNELENBTkQsQyxDQVFBOzs7QUFDQSxNQUFNLENBQUMsa0JBQVAsR0FBNEIsVUFBUyxHQUFULEVBQWM7QUFDeEMsTUFBSSxDQUFDLEdBQUcsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsR0FBdkIsQ0FBUjtBQUNBLEVBQUEsQ0FBQyxDQUFDLElBQUYsZ0JBQWUsR0FBZjtBQUNBLEVBQUEsQ0FBQyxDQUFDLFlBQUYsQ0FBZSxRQUFmLEVBQXlCLFFBQXpCO0FBQ0EsRUFBQSxDQUFDLENBQUMsS0FBRjtBQUNBLEVBQUEsTUFBTSxDQUFDLEtBQVA7QUFDRCxDQU5EIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiLy8g5pSv5LuY56ev5YiG5bm25LiL6L29XHJcbndpbmRvdy5wYXlGb3JEb3dubG9hZFJlc291cmNlID0gZnVuY3Rpb24ocmlkKSB7XHJcbiAgbGV0IGEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYVwiKTtcclxuICBhLmhyZWYgPSBgL3IvJHtyaWR9P2M9ZG93bmxvYWRgO1xyXG4gIGxldCBkb3dubG9hZEF0dHIgPSBkb2N1bWVudC5jcmVhdGVBdHRyaWJ1dGUoXCJkb3dubG9hZFwiKTtcclxuICBhLnNldEF0dHJpYnV0ZU5vZGUoZG93bmxvYWRBdHRyKTtcclxuICBhLmNsaWNrKCk7XHJcbn1cclxuXHJcbi8vIOmihOiniFBERlxyXG53aW5kb3cucHJldmlld1BERlJlc291cmNlID0gZnVuY3Rpb24ocmlkKSB7XHJcbiAgbGV0IGEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYVwiKTtcclxuICBhLmhyZWYgPSBgL3IvJHtyaWR9P2M9cHJldmlld19wZGZgO1xyXG4gIGEuc2V0QXR0cmlidXRlKFwidGFyZ2V0XCIsIFwiX2JsYW5rXCIpO1xyXG4gIGEuY2xpY2soKTtcclxuICB3aW5kb3cuY2xvc2UoKTtcclxufVxyXG4iXX0=
