(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

window.comfirmReceipt = function (orderId) {
  sweetQuestion("确认收货后，货款将打入卖家账户，请再次确认。").then(function () {
    nkcAPI('/shop/order/' + orderId + '/receipt', "PATCH", {}).then(function (data) {
      sweetSuccess("执行成功");
      window.location.reload();
    })["catch"](sweetErro);
  })["catch"](function (err) {
    return null;
  });
};

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9fYnJvd3Nlci1wYWNrQDYuMS4wQGJyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInBhZ2VzL3Nob3Avb3JkZXIvb3JkZXIubWpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQSxNQUFNLENBQUMsY0FBUCxHQUF3QixVQUFTLE9BQVQsRUFBa0I7QUFDeEMsRUFBQSxhQUFhLENBQUMsd0JBQUQsQ0FBYixDQUNHLElBREgsQ0FDUSxZQUFNO0FBQ1YsSUFBQSxNQUFNLENBQUMsaUJBQWUsT0FBZixHQUF1QixVQUF4QixFQUFvQyxPQUFwQyxFQUE2QyxFQUE3QyxDQUFOLENBQ0csSUFESCxDQUNRLFVBQVMsSUFBVCxFQUFlO0FBQ25CLE1BQUEsWUFBWSxDQUFDLE1BQUQsQ0FBWjtBQUNBLE1BQUEsTUFBTSxDQUFDLFFBQVAsQ0FBZ0IsTUFBaEI7QUFDRCxLQUpILFdBS1MsU0FMVDtBQU1ELEdBUkgsV0FTUyxVQUFBLEdBQUc7QUFBQSxXQUFJLElBQUo7QUFBQSxHQVRaO0FBVUQsQ0FYRCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIndpbmRvdy5jb21maXJtUmVjZWlwdCA9IGZ1bmN0aW9uKG9yZGVySWQpIHtcbiAgc3dlZXRRdWVzdGlvbihcIuehruiupOaUtui0p+WQju+8jOi0p+asvuWwhuaJk+WFpeWNluWutui0puaIt++8jOivt+WGjeasoeehruiupOOAglwiKVxuICAgIC50aGVuKCgpID0+IHtcbiAgICAgIG5rY0FQSSgnL3Nob3Avb3JkZXIvJytvcmRlcklkKycvcmVjZWlwdCcsIFwiUEFUQ0hcIiwge30pXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICBzd2VldFN1Y2Nlc3MoXCLmiafooYzmiJDlip9cIik7XG4gICAgICAgICAgd2luZG93LmxvY2F0aW9uLnJlbG9hZCgpO1xuICAgICAgICB9KVxuICAgICAgICAuY2F0Y2goc3dlZXRFcnJvKVxuICAgIH0pXG4gICAgLmNhdGNoKGVyciA9PiBudWxsKVxufSJdfQ==
