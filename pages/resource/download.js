(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

var opened = false; // 支付积分并下载

window.payForDownloadResource = function (rid) {
  var a = document.createElement("a");

  if (opened) {
    a.href = "/r/".concat(rid, "?t=attachment&random=").concat(Math.random());
  } else {
    a.href = "/r/".concat(rid, "?c=download&random=").concat(Math.random());
    a.setAttributeNode(document.createAttribute("download"));
    opened = true;
  } // console.log(`访问: ${a.href}`);


  a.click();
  $(".resource-scores").remove();
  $(".error-code").remove();
  $(".resource-downloaded-tip").show();
  $(".download-button").text("重新下载");
}; // 预览PDF


window.previewPDFResource = function (rid) {
  var a = document.createElement("a");

  if (!opened) {
    a.href = "/r/".concat(rid, "?c=preview_pdf&random=").concat(Math.random());
    a.setAttribute("target", "_blank");
    a.click();
    opened = true;
  } else {
    a.href = NKC.methods.tools.getUrl('pdf', rid);
    a.setAttribute("target", "_blank");
    a.click();
  } // console.log(`访问: ${a.href}`);

};

window.closePage = function () {
  if (NKC.configs.platform === 'reactNative') {
    NKC.methods.appClosePage();
  } else {
    window.close();
  }
};

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9fYnJvd3Nlci1wYWNrQDYuMS4wQGJyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInBhZ2VzL3Jlc291cmNlL2Rvd25sb2FkLm1qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUEsSUFBSSxNQUFNLEdBQUcsS0FBYixDLENBQ0E7O0FBQ0EsTUFBTSxDQUFDLHNCQUFQLEdBQWdDLFVBQVMsR0FBVCxFQUFjO0FBQzVDLE1BQUksQ0FBQyxHQUFHLFFBQVEsQ0FBQyxhQUFULENBQXVCLEdBQXZCLENBQVI7O0FBQ0EsTUFBRyxNQUFILEVBQVc7QUFDVCxJQUFBLENBQUMsQ0FBQyxJQUFGLGdCQUFlLEdBQWYsa0NBQTBDLElBQUksQ0FBQyxNQUFMLEVBQTFDO0FBQ0QsR0FGRCxNQUVNO0FBQ0osSUFBQSxDQUFDLENBQUMsSUFBRixnQkFBZSxHQUFmLGdDQUF3QyxJQUFJLENBQUMsTUFBTCxFQUF4QztBQUNBLElBQUEsQ0FBQyxDQUFDLGdCQUFGLENBQW1CLFFBQVEsQ0FBQyxlQUFULENBQXlCLFVBQXpCLENBQW5CO0FBQ0EsSUFBQSxNQUFNLEdBQUcsSUFBVDtBQUNELEdBUjJDLENBUzVDOzs7QUFDQSxFQUFBLENBQUMsQ0FBQyxLQUFGO0FBQ0EsRUFBQSxDQUFDLENBQUMsa0JBQUQsQ0FBRCxDQUFzQixNQUF0QjtBQUNBLEVBQUEsQ0FBQyxDQUFDLGFBQUQsQ0FBRCxDQUFpQixNQUFqQjtBQUNBLEVBQUEsQ0FBQyxDQUFDLDBCQUFELENBQUQsQ0FBOEIsSUFBOUI7QUFDQSxFQUFBLENBQUMsQ0FBQyxrQkFBRCxDQUFELENBQXNCLElBQXRCLENBQTJCLE1BQTNCO0FBQ0QsQ0FmRCxDLENBaUJBOzs7QUFDQSxNQUFNLENBQUMsa0JBQVAsR0FBNEIsVUFBUyxHQUFULEVBQWM7QUFDeEMsTUFBSSxDQUFDLEdBQUcsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsR0FBdkIsQ0FBUjs7QUFDQSxNQUFHLENBQUMsTUFBSixFQUFZO0FBQ1YsSUFBQSxDQUFDLENBQUMsSUFBRixnQkFBZSxHQUFmLG1DQUEyQyxJQUFJLENBQUMsTUFBTCxFQUEzQztBQUNBLElBQUEsQ0FBQyxDQUFDLFlBQUYsQ0FBZSxRQUFmLEVBQXlCLFFBQXpCO0FBQ0EsSUFBQSxDQUFDLENBQUMsS0FBRjtBQUNBLElBQUEsTUFBTSxHQUFHLElBQVQ7QUFDRCxHQUxELE1BS087QUFDTCxJQUFBLENBQUMsQ0FBQyxJQUFGLEdBQVMsR0FBRyxDQUFDLE9BQUosQ0FBWSxLQUFaLENBQWtCLE1BQWxCLENBQXlCLEtBQXpCLEVBQWdDLEdBQWhDLENBQVQ7QUFDQSxJQUFBLENBQUMsQ0FBQyxZQUFGLENBQWUsUUFBZixFQUF5QixRQUF6QjtBQUNBLElBQUEsQ0FBQyxDQUFDLEtBQUY7QUFDRCxHQVh1QyxDQVl4Qzs7QUFDRCxDQWJEOztBQWNBLE1BQU0sQ0FBQyxTQUFQLEdBQW1CLFlBQVc7QUFDNUIsTUFBRyxHQUFHLENBQUMsT0FBSixDQUFZLFFBQVosS0FBeUIsYUFBNUIsRUFBMkM7QUFDekMsSUFBQSxHQUFHLENBQUMsT0FBSixDQUFZLFlBQVo7QUFDRCxHQUZELE1BRU87QUFDTCxJQUFBLE1BQU0sQ0FBQyxLQUFQO0FBQ0Q7QUFDRixDQU5EIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwibGV0IG9wZW5lZCA9IGZhbHNlO1xyXG4vLyDmlK/ku5jnp6/liIblubbkuIvovb1cclxud2luZG93LnBheUZvckRvd25sb2FkUmVzb3VyY2UgPSBmdW5jdGlvbihyaWQpIHtcclxuICBsZXQgYSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJhXCIpO1xyXG4gIGlmKG9wZW5lZCkge1xyXG4gICAgYS5ocmVmID0gYC9yLyR7cmlkfT90PWF0dGFjaG1lbnQmcmFuZG9tPSR7TWF0aC5yYW5kb20oKX1gO1xyXG4gIH1lbHNlIHtcclxuICAgIGEuaHJlZiA9IGAvci8ke3JpZH0/Yz1kb3dubG9hZCZyYW5kb209JHtNYXRoLnJhbmRvbSgpfWA7XHJcbiAgICBhLnNldEF0dHJpYnV0ZU5vZGUoZG9jdW1lbnQuY3JlYXRlQXR0cmlidXRlKFwiZG93bmxvYWRcIikpO1xyXG4gICAgb3BlbmVkID0gdHJ1ZTtcclxuICB9XHJcbiAgLy8gY29uc29sZS5sb2coYOiuv+mXrjogJHthLmhyZWZ9YCk7XHJcbiAgYS5jbGljaygpO1xyXG4gICQoXCIucmVzb3VyY2Utc2NvcmVzXCIpLnJlbW92ZSgpO1xyXG4gICQoXCIuZXJyb3ItY29kZVwiKS5yZW1vdmUoKTtcclxuICAkKFwiLnJlc291cmNlLWRvd25sb2FkZWQtdGlwXCIpLnNob3coKTtcclxuICAkKFwiLmRvd25sb2FkLWJ1dHRvblwiKS50ZXh0KFwi6YeN5paw5LiL6L29XCIpO1xyXG59XHJcblxyXG4vLyDpooTop4hQREZcclxud2luZG93LnByZXZpZXdQREZSZXNvdXJjZSA9IGZ1bmN0aW9uKHJpZCkge1xyXG4gIGxldCBhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImFcIik7XHJcbiAgaWYoIW9wZW5lZCkge1xyXG4gICAgYS5ocmVmID0gYC9yLyR7cmlkfT9jPXByZXZpZXdfcGRmJnJhbmRvbT0ke01hdGgucmFuZG9tKCl9YDtcclxuICAgIGEuc2V0QXR0cmlidXRlKFwidGFyZ2V0XCIsIFwiX2JsYW5rXCIpO1xyXG4gICAgYS5jbGljaygpO1xyXG4gICAgb3BlbmVkID0gdHJ1ZTtcclxuICB9IGVsc2Uge1xyXG4gICAgYS5ocmVmID0gTktDLm1ldGhvZHMudG9vbHMuZ2V0VXJsKCdwZGYnLCByaWQpO1xyXG4gICAgYS5zZXRBdHRyaWJ1dGUoXCJ0YXJnZXRcIiwgXCJfYmxhbmtcIik7XHJcbiAgICBhLmNsaWNrKCk7XHJcbiAgfVxyXG4gIC8vIGNvbnNvbGUubG9nKGDorr/pl646ICR7YS5ocmVmfWApO1xyXG59XHJcbndpbmRvdy5jbG9zZVBhZ2UgPSBmdW5jdGlvbigpIHtcclxuICBpZihOS0MuY29uZmlncy5wbGF0Zm9ybSA9PT0gJ3JlYWN0TmF0aXZlJykge1xyXG4gICAgTktDLm1ldGhvZHMuYXBwQ2xvc2VQYWdlKCk7XHJcbiAgfSBlbHNlIHtcclxuICAgIHdpbmRvdy5jbG9zZSgpO1xyXG4gIH1cclxufVxyXG4iXX0=
