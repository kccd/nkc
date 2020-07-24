(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

window.comfirmReceipt = function (orderId) {
  sweetQuestion("确认收货后，货款将打入卖家账户，请再次确认。").then(function () {
    nkcAPI('/shop/order/' + orderId + '/receipt', "PUT", {}).then(function (data) {
      sweetSuccess("执行成功");
      window.location.reload();
    })["catch"](sweetErro);
  })["catch"](function (err) {
    return null;
  });
};

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9fYnJvd3Nlci1wYWNrQDYuMS4wQGJyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInBhZ2VzL3Nob3Avb3JkZXIvb3JkZXIubWpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQSxNQUFNLENBQUMsY0FBUCxHQUF3QixVQUFTLE9BQVQsRUFBa0I7QUFDeEMsRUFBQSxhQUFhLENBQUMsd0JBQUQsQ0FBYixDQUNHLElBREgsQ0FDUSxZQUFNO0FBQ1YsSUFBQSxNQUFNLENBQUMsaUJBQWUsT0FBZixHQUF1QixVQUF4QixFQUFvQyxLQUFwQyxFQUEyQyxFQUEzQyxDQUFOLENBQ0csSUFESCxDQUNRLFVBQVMsSUFBVCxFQUFlO0FBQ25CLE1BQUEsWUFBWSxDQUFDLE1BQUQsQ0FBWjtBQUNBLE1BQUEsTUFBTSxDQUFDLFFBQVAsQ0FBZ0IsTUFBaEI7QUFDRCxLQUpILFdBS1MsU0FMVDtBQU1ELEdBUkgsV0FTUyxVQUFBLEdBQUc7QUFBQSxXQUFJLElBQUo7QUFBQSxHQVRaO0FBVUQsQ0FYRCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIndpbmRvdy5jb21maXJtUmVjZWlwdCA9IGZ1bmN0aW9uKG9yZGVySWQpIHtcclxuICBzd2VldFF1ZXN0aW9uKFwi56Gu6K6k5pS26LSn5ZCO77yM6LSn5qy+5bCG5omT5YWl5Y2W5a626LSm5oi377yM6K+35YaN5qyh56Gu6K6k44CCXCIpXHJcbiAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgIG5rY0FQSSgnL3Nob3Avb3JkZXIvJytvcmRlcklkKycvcmVjZWlwdCcsIFwiUFVUXCIsIHt9KVxyXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgICAgICAgIHN3ZWV0U3VjY2VzcyhcIuaJp+ihjOaIkOWKn1wiKTtcclxuICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5yZWxvYWQoKTtcclxuICAgICAgICB9KVxyXG4gICAgICAgIC5jYXRjaChzd2VldEVycm8pXHJcbiAgICB9KVxyXG4gICAgLmNhdGNoKGVyciA9PiBudWxsKVxyXG59XHJcbiJdfQ==
