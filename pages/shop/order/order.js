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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwYWdlcy9zaG9wL29yZGVyL29yZGVyLm1qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUEsTUFBTSxDQUFDLGNBQVAsR0FBd0IsVUFBUyxPQUFULEVBQWtCO0FBQ3hDLEVBQUEsYUFBYSxDQUFDLHdCQUFELENBQWIsQ0FDRyxJQURILENBQ1EsWUFBTTtBQUNWLElBQUEsTUFBTSxDQUFDLGlCQUFlLE9BQWYsR0FBdUIsVUFBeEIsRUFBb0MsT0FBcEMsRUFBNkMsRUFBN0MsQ0FBTixDQUNHLElBREgsQ0FDUSxVQUFTLElBQVQsRUFBZTtBQUNuQixNQUFBLFlBQVksQ0FBQyxNQUFELENBQVo7QUFDQSxNQUFBLE1BQU0sQ0FBQyxRQUFQLENBQWdCLE1BQWhCO0FBQ0QsS0FKSCxXQUtTLFNBTFQ7QUFNRCxHQVJILFdBU1MsVUFBQSxHQUFHO0FBQUEsV0FBSSxJQUFKO0FBQUEsR0FUWjtBQVVELENBWEQiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJ3aW5kb3cuY29tZmlybVJlY2VpcHQgPSBmdW5jdGlvbihvcmRlcklkKSB7XHJcbiAgc3dlZXRRdWVzdGlvbihcIuehruiupOaUtui0p+WQju+8jOi0p+asvuWwhuaJk+WFpeWNluWutui0puaIt++8jOivt+WGjeasoeehruiupOOAglwiKVxyXG4gICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICBua2NBUEkoJy9zaG9wL29yZGVyLycrb3JkZXJJZCsnL3JlY2VpcHQnLCBcIlBBVENIXCIsIHt9KVxyXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgICAgICAgIHN3ZWV0U3VjY2VzcyhcIuaJp+ihjOaIkOWKn1wiKTtcclxuICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5yZWxvYWQoKTtcclxuICAgICAgICB9KVxyXG4gICAgICAgIC5jYXRjaChzd2VldEVycm8pXHJcbiAgICB9KVxyXG4gICAgLmNhdGNoKGVyciA9PiBudWxsKVxyXG59Il19
