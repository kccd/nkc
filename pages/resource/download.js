(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

// 支付积分并下载
window.payForDownloadResource = function (rid) {
  var a = document.createElement("a");
  a.href = "/r/".concat(rid, "?c=download");
  var downloadAttr = document.createAttribute("download");
  a.setAttributeNode(downloadAttr);
  a.click();
  $(".resource-scores").remove();
  $(".error-code").remove();
  $(".resource-downloaded-tip").show();
  $(".download-button").text("重新下载");
}; // 预览PDF


window.previewPDFResource = function (rid) {
  var a = document.createElement("a");
  a.href = "/r/".concat(rid, "?c=preview_pdf");
  a.setAttribute("target", "_blank");
  a.click();
};

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9fYnJvd3Nlci1wYWNrQDYuMS4wQGJyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInBhZ2VzL3Jlc291cmNlL2Rvd25sb2FkLm1qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUE7QUFDQSxNQUFNLENBQUMsc0JBQVAsR0FBZ0MsVUFBUyxHQUFULEVBQWM7QUFDNUMsTUFBSSxDQUFDLEdBQUcsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsR0FBdkIsQ0FBUjtBQUNBLEVBQUEsQ0FBQyxDQUFDLElBQUYsZ0JBQWUsR0FBZjtBQUNBLE1BQUksWUFBWSxHQUFHLFFBQVEsQ0FBQyxlQUFULENBQXlCLFVBQXpCLENBQW5CO0FBQ0EsRUFBQSxDQUFDLENBQUMsZ0JBQUYsQ0FBbUIsWUFBbkI7QUFDQSxFQUFBLENBQUMsQ0FBQyxLQUFGO0FBQ0EsRUFBQSxDQUFDLENBQUMsa0JBQUQsQ0FBRCxDQUFzQixNQUF0QjtBQUNBLEVBQUEsQ0FBQyxDQUFDLGFBQUQsQ0FBRCxDQUFpQixNQUFqQjtBQUNBLEVBQUEsQ0FBQyxDQUFDLDBCQUFELENBQUQsQ0FBOEIsSUFBOUI7QUFDQSxFQUFBLENBQUMsQ0FBQyxrQkFBRCxDQUFELENBQXNCLElBQXRCLENBQTJCLE1BQTNCO0FBQ0QsQ0FWRCxDLENBWUE7OztBQUNBLE1BQU0sQ0FBQyxrQkFBUCxHQUE0QixVQUFTLEdBQVQsRUFBYztBQUN4QyxNQUFJLENBQUMsR0FBRyxRQUFRLENBQUMsYUFBVCxDQUF1QixHQUF2QixDQUFSO0FBQ0EsRUFBQSxDQUFDLENBQUMsSUFBRixnQkFBZSxHQUFmO0FBQ0EsRUFBQSxDQUFDLENBQUMsWUFBRixDQUFlLFFBQWYsRUFBeUIsUUFBekI7QUFDQSxFQUFBLENBQUMsQ0FBQyxLQUFGO0FBQ0QsQ0FMRCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIi8vIOaUr+S7mOenr+WIhuW5tuS4i+i9vVxyXG53aW5kb3cucGF5Rm9yRG93bmxvYWRSZXNvdXJjZSA9IGZ1bmN0aW9uKHJpZCkge1xyXG4gIGxldCBhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImFcIik7XHJcbiAgYS5ocmVmID0gYC9yLyR7cmlkfT9jPWRvd25sb2FkYDtcclxuICBsZXQgZG93bmxvYWRBdHRyID0gZG9jdW1lbnQuY3JlYXRlQXR0cmlidXRlKFwiZG93bmxvYWRcIik7XHJcbiAgYS5zZXRBdHRyaWJ1dGVOb2RlKGRvd25sb2FkQXR0cik7XHJcbiAgYS5jbGljaygpO1xyXG4gICQoXCIucmVzb3VyY2Utc2NvcmVzXCIpLnJlbW92ZSgpO1xyXG4gICQoXCIuZXJyb3ItY29kZVwiKS5yZW1vdmUoKTtcclxuICAkKFwiLnJlc291cmNlLWRvd25sb2FkZWQtdGlwXCIpLnNob3coKTtcclxuICAkKFwiLmRvd25sb2FkLWJ1dHRvblwiKS50ZXh0KFwi6YeN5paw5LiL6L29XCIpO1xyXG59XHJcblxyXG4vLyDpooTop4hQREZcclxud2luZG93LnByZXZpZXdQREZSZXNvdXJjZSA9IGZ1bmN0aW9uKHJpZCkge1xyXG4gIGxldCBhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImFcIik7XHJcbiAgYS5ocmVmID0gYC9yLyR7cmlkfT9jPXByZXZpZXdfcGRmYDtcclxuICBhLnNldEF0dHJpYnV0ZShcInRhcmdldFwiLCBcIl9ibGFua1wiKTtcclxuICBhLmNsaWNrKCk7XHJcbn0iXX0=
