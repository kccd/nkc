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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwYWdlcy9yZXNvdXJjZS9kb3dubG9hZC5tanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBLElBQUksTUFBTSxHQUFHLEtBQWIsQyxDQUNBOztBQUNBLE1BQU0sQ0FBQyxzQkFBUCxHQUFnQyxVQUFTLEdBQVQsRUFBYztBQUM1QyxNQUFJLENBQUMsR0FBRyxRQUFRLENBQUMsYUFBVCxDQUF1QixHQUF2QixDQUFSOztBQUNBLE1BQUcsTUFBSCxFQUFXO0FBQ1QsSUFBQSxDQUFDLENBQUMsSUFBRixnQkFBZSxHQUFmLGtDQUEwQyxJQUFJLENBQUMsTUFBTCxFQUExQztBQUNELEdBRkQsTUFFTTtBQUNKLElBQUEsQ0FBQyxDQUFDLElBQUYsZ0JBQWUsR0FBZixnQ0FBd0MsSUFBSSxDQUFDLE1BQUwsRUFBeEM7QUFDQSxJQUFBLENBQUMsQ0FBQyxnQkFBRixDQUFtQixRQUFRLENBQUMsZUFBVCxDQUF5QixVQUF6QixDQUFuQjtBQUNBLElBQUEsTUFBTSxHQUFHLElBQVQ7QUFDRCxHQVIyQyxDQVM1Qzs7O0FBQ0EsRUFBQSxDQUFDLENBQUMsS0FBRjtBQUNBLEVBQUEsQ0FBQyxDQUFDLGtCQUFELENBQUQsQ0FBc0IsTUFBdEI7QUFDQSxFQUFBLENBQUMsQ0FBQyxhQUFELENBQUQsQ0FBaUIsTUFBakI7QUFDQSxFQUFBLENBQUMsQ0FBQywwQkFBRCxDQUFELENBQThCLElBQTlCO0FBQ0EsRUFBQSxDQUFDLENBQUMsa0JBQUQsQ0FBRCxDQUFzQixJQUF0QixDQUEyQixNQUEzQjtBQUNELENBZkQsQyxDQWlCQTs7O0FBQ0EsTUFBTSxDQUFDLGtCQUFQLEdBQTRCLFVBQVMsR0FBVCxFQUFjO0FBQ3hDLE1BQUksQ0FBQyxHQUFHLFFBQVEsQ0FBQyxhQUFULENBQXVCLEdBQXZCLENBQVI7O0FBQ0EsTUFBRyxDQUFDLE1BQUosRUFBWTtBQUNWLElBQUEsQ0FBQyxDQUFDLElBQUYsZ0JBQWUsR0FBZixtQ0FBMkMsSUFBSSxDQUFDLE1BQUwsRUFBM0M7QUFDQSxJQUFBLENBQUMsQ0FBQyxZQUFGLENBQWUsUUFBZixFQUF5QixRQUF6QjtBQUNBLElBQUEsQ0FBQyxDQUFDLEtBQUY7QUFDQSxJQUFBLE1BQU0sR0FBRyxJQUFUO0FBQ0QsR0FMRCxNQUtPO0FBQ0wsSUFBQSxDQUFDLENBQUMsSUFBRixHQUFTLEdBQUcsQ0FBQyxPQUFKLENBQVksS0FBWixDQUFrQixNQUFsQixDQUF5QixLQUF6QixFQUFnQyxHQUFoQyxDQUFUO0FBQ0EsSUFBQSxDQUFDLENBQUMsWUFBRixDQUFlLFFBQWYsRUFBeUIsUUFBekI7QUFDQSxJQUFBLENBQUMsQ0FBQyxLQUFGO0FBQ0QsR0FYdUMsQ0FZeEM7O0FBQ0QsQ0FiRDs7QUFjQSxNQUFNLENBQUMsU0FBUCxHQUFtQixZQUFXO0FBQzVCLE1BQUcsR0FBRyxDQUFDLE9BQUosQ0FBWSxRQUFaLEtBQXlCLGFBQTVCLEVBQTJDO0FBQ3pDLElBQUEsR0FBRyxDQUFDLE9BQUosQ0FBWSxZQUFaO0FBQ0QsR0FGRCxNQUVPO0FBQ0wsSUFBQSxNQUFNLENBQUMsS0FBUDtBQUNEO0FBQ0YsQ0FORCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsImxldCBvcGVuZWQgPSBmYWxzZTtcclxuLy8g5pSv5LuY56ev5YiG5bm25LiL6L29XHJcbndpbmRvdy5wYXlGb3JEb3dubG9hZFJlc291cmNlID0gZnVuY3Rpb24ocmlkKSB7XHJcbiAgbGV0IGEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYVwiKTtcclxuICBpZihvcGVuZWQpIHtcclxuICAgIGEuaHJlZiA9IGAvci8ke3JpZH0/dD1hdHRhY2htZW50JnJhbmRvbT0ke01hdGgucmFuZG9tKCl9YDtcclxuICB9ZWxzZSB7XHJcbiAgICBhLmhyZWYgPSBgL3IvJHtyaWR9P2M9ZG93bmxvYWQmcmFuZG9tPSR7TWF0aC5yYW5kb20oKX1gO1xyXG4gICAgYS5zZXRBdHRyaWJ1dGVOb2RlKGRvY3VtZW50LmNyZWF0ZUF0dHJpYnV0ZShcImRvd25sb2FkXCIpKTtcclxuICAgIG9wZW5lZCA9IHRydWU7XHJcbiAgfVxyXG4gIC8vIGNvbnNvbGUubG9nKGDorr/pl646ICR7YS5ocmVmfWApO1xyXG4gIGEuY2xpY2soKTtcclxuICAkKFwiLnJlc291cmNlLXNjb3Jlc1wiKS5yZW1vdmUoKTtcclxuICAkKFwiLmVycm9yLWNvZGVcIikucmVtb3ZlKCk7XHJcbiAgJChcIi5yZXNvdXJjZS1kb3dubG9hZGVkLXRpcFwiKS5zaG93KCk7XHJcbiAgJChcIi5kb3dubG9hZC1idXR0b25cIikudGV4dChcIumHjeaWsOS4i+i9vVwiKTtcclxufVxyXG5cclxuLy8g6aKE6KeIUERGXHJcbndpbmRvdy5wcmV2aWV3UERGUmVzb3VyY2UgPSBmdW5jdGlvbihyaWQpIHtcclxuICBsZXQgYSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJhXCIpO1xyXG4gIGlmKCFvcGVuZWQpIHtcclxuICAgIGEuaHJlZiA9IGAvci8ke3JpZH0/Yz1wcmV2aWV3X3BkZiZyYW5kb209JHtNYXRoLnJhbmRvbSgpfWA7XHJcbiAgICBhLnNldEF0dHJpYnV0ZShcInRhcmdldFwiLCBcIl9ibGFua1wiKTtcclxuICAgIGEuY2xpY2soKTtcclxuICAgIG9wZW5lZCA9IHRydWU7XHJcbiAgfSBlbHNlIHtcclxuICAgIGEuaHJlZiA9IE5LQy5tZXRob2RzLnRvb2xzLmdldFVybCgncGRmJywgcmlkKTtcclxuICAgIGEuc2V0QXR0cmlidXRlKFwidGFyZ2V0XCIsIFwiX2JsYW5rXCIpO1xyXG4gICAgYS5jbGljaygpO1xyXG4gIH1cclxuICAvLyBjb25zb2xlLmxvZyhg6K6/6ZeuOiAke2EuaHJlZn1gKTtcclxufVxyXG53aW5kb3cuY2xvc2VQYWdlID0gZnVuY3Rpb24oKSB7XHJcbiAgaWYoTktDLmNvbmZpZ3MucGxhdGZvcm0gPT09ICdyZWFjdE5hdGl2ZScpIHtcclxuICAgIE5LQy5tZXRob2RzLmFwcENsb3NlUGFnZSgpO1xyXG4gIH0gZWxzZSB7XHJcbiAgICB3aW5kb3cuY2xvc2UoKTtcclxuICB9XHJcbn1cclxuIl19
