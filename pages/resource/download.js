(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

var opened = false; // 支付积分并下载

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
  if (!opened) {
    var a = document.createElement("a");
    a.href = "/r/".concat(rid, "?c=preview_pdf");
    a.setAttribute("target", "_blank");
    a.click();
    opened = true;
  } else {
    var _a = document.createElement("a");

    _a.href = NKC.methods.tools.getUrl('pdf', rid);

    _a.setAttribute("target", "_blank");

    _a.click();
  }
};

window.closePage = function () {
  if (NKC.configs.platform === 'reactNative') {
    NKC.methods.appClosePage();
  } else {
    window.close();
  }
};

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwYWdlcy9yZXNvdXJjZS9kb3dubG9hZC5tanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBLElBQUksTUFBTSxHQUFHLEtBQWIsQyxDQUNBOztBQUNBLE1BQU0sQ0FBQyxzQkFBUCxHQUFnQyxVQUFTLEdBQVQsRUFBYztBQUM1QyxNQUFJLENBQUMsR0FBRyxRQUFRLENBQUMsYUFBVCxDQUF1QixHQUF2QixDQUFSO0FBQ0EsRUFBQSxDQUFDLENBQUMsSUFBRixnQkFBZSxHQUFmO0FBQ0EsTUFBSSxZQUFZLEdBQUcsUUFBUSxDQUFDLGVBQVQsQ0FBeUIsVUFBekIsQ0FBbkI7QUFDQSxFQUFBLENBQUMsQ0FBQyxnQkFBRixDQUFtQixZQUFuQjtBQUNBLEVBQUEsQ0FBQyxDQUFDLEtBQUY7QUFDQSxFQUFBLENBQUMsQ0FBQyxrQkFBRCxDQUFELENBQXNCLE1BQXRCO0FBQ0EsRUFBQSxDQUFDLENBQUMsYUFBRCxDQUFELENBQWlCLE1BQWpCO0FBQ0EsRUFBQSxDQUFDLENBQUMsMEJBQUQsQ0FBRCxDQUE4QixJQUE5QjtBQUNBLEVBQUEsQ0FBQyxDQUFDLGtCQUFELENBQUQsQ0FBc0IsSUFBdEIsQ0FBMkIsTUFBM0I7QUFDRCxDQVZELEMsQ0FZQTs7O0FBQ0EsTUFBTSxDQUFDLGtCQUFQLEdBQTRCLFVBQVMsR0FBVCxFQUFjO0FBQ3hDLE1BQUcsQ0FBQyxNQUFKLEVBQVk7QUFDVixRQUFJLENBQUMsR0FBRyxRQUFRLENBQUMsYUFBVCxDQUF1QixHQUF2QixDQUFSO0FBQ0EsSUFBQSxDQUFDLENBQUMsSUFBRixnQkFBZSxHQUFmO0FBQ0EsSUFBQSxDQUFDLENBQUMsWUFBRixDQUFlLFFBQWYsRUFBeUIsUUFBekI7QUFDQSxJQUFBLENBQUMsQ0FBQyxLQUFGO0FBQ0EsSUFBQSxNQUFNLEdBQUcsSUFBVDtBQUNELEdBTkQsTUFNTztBQUNMLFFBQUksRUFBQyxHQUFHLFFBQVEsQ0FBQyxhQUFULENBQXVCLEdBQXZCLENBQVI7O0FBQ0EsSUFBQSxFQUFDLENBQUMsSUFBRixHQUFTLEdBQUcsQ0FBQyxPQUFKLENBQVksS0FBWixDQUFrQixNQUFsQixDQUF5QixLQUF6QixFQUFnQyxHQUFoQyxDQUFUOztBQUNBLElBQUEsRUFBQyxDQUFDLFlBQUYsQ0FBZSxRQUFmLEVBQXlCLFFBQXpCOztBQUNBLElBQUEsRUFBQyxDQUFDLEtBQUY7QUFDRDtBQUNGLENBYkQ7O0FBY0EsTUFBTSxDQUFDLFNBQVAsR0FBbUIsWUFBVztBQUM1QixNQUFHLEdBQUcsQ0FBQyxPQUFKLENBQVksUUFBWixLQUF5QixhQUE1QixFQUEyQztBQUN6QyxJQUFBLEdBQUcsQ0FBQyxPQUFKLENBQVksWUFBWjtBQUNELEdBRkQsTUFFTztBQUNMLElBQUEsTUFBTSxDQUFDLEtBQVA7QUFDRDtBQUNGLENBTkQiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJsZXQgb3BlbmVkID0gZmFsc2U7XHJcbi8vIOaUr+S7mOenr+WIhuW5tuS4i+i9vVxyXG53aW5kb3cucGF5Rm9yRG93bmxvYWRSZXNvdXJjZSA9IGZ1bmN0aW9uKHJpZCkge1xyXG4gIGxldCBhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImFcIik7XHJcbiAgYS5ocmVmID0gYC9yLyR7cmlkfT9jPWRvd25sb2FkYDtcclxuICBsZXQgZG93bmxvYWRBdHRyID0gZG9jdW1lbnQuY3JlYXRlQXR0cmlidXRlKFwiZG93bmxvYWRcIik7XHJcbiAgYS5zZXRBdHRyaWJ1dGVOb2RlKGRvd25sb2FkQXR0cik7XHJcbiAgYS5jbGljaygpO1xyXG4gICQoXCIucmVzb3VyY2Utc2NvcmVzXCIpLnJlbW92ZSgpO1xyXG4gICQoXCIuZXJyb3ItY29kZVwiKS5yZW1vdmUoKTtcclxuICAkKFwiLnJlc291cmNlLWRvd25sb2FkZWQtdGlwXCIpLnNob3coKTtcclxuICAkKFwiLmRvd25sb2FkLWJ1dHRvblwiKS50ZXh0KFwi6YeN5paw5LiL6L29XCIpO1xyXG59XHJcblxyXG4vLyDpooTop4hQREZcclxud2luZG93LnByZXZpZXdQREZSZXNvdXJjZSA9IGZ1bmN0aW9uKHJpZCkge1xyXG4gIGlmKCFvcGVuZWQpIHtcclxuICAgIGxldCBhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImFcIik7XHJcbiAgICBhLmhyZWYgPSBgL3IvJHtyaWR9P2M9cHJldmlld19wZGZgO1xyXG4gICAgYS5zZXRBdHRyaWJ1dGUoXCJ0YXJnZXRcIiwgXCJfYmxhbmtcIik7XHJcbiAgICBhLmNsaWNrKCk7XHJcbiAgICBvcGVuZWQgPSB0cnVlO1xyXG4gIH0gZWxzZSB7XHJcbiAgICBsZXQgYSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJhXCIpO1xyXG4gICAgYS5ocmVmID0gTktDLm1ldGhvZHMudG9vbHMuZ2V0VXJsKCdwZGYnLCByaWQpO1xyXG4gICAgYS5zZXRBdHRyaWJ1dGUoXCJ0YXJnZXRcIiwgXCJfYmxhbmtcIik7XHJcbiAgICBhLmNsaWNrKCk7XHJcbiAgfVxyXG59XHJcbndpbmRvdy5jbG9zZVBhZ2UgPSBmdW5jdGlvbigpIHtcclxuICBpZihOS0MuY29uZmlncy5wbGF0Zm9ybSA9PT0gJ3JlYWN0TmF0aXZlJykge1xyXG4gICAgTktDLm1ldGhvZHMuYXBwQ2xvc2VQYWdlKCk7XHJcbiAgfSBlbHNlIHtcclxuICAgIHdpbmRvdy5jbG9zZSgpO1xyXG4gIH1cclxufVxyXG4iXX0=
