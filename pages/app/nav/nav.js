(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

window.closeWin = function () {
  if (NKC.configs.platform === 'apiCloud') {
    api.closeWin();
  } else if (NKC.configs.platform === 'reactNative') {
    NKC.methods.rn.emit('closeWebView', {
      drawer: true
    });
  }
};

window.logout = function () {
  nkcAPI("/logout", "GET").then(function () {
    if (NKC.configs.platform === 'apiCloud') {
      emitEvent("logout");
    } else if (NKC.configs.platform === 'reactNative') {
      NKC.methods.rn.emit('logout');
    }
  })["catch"](function (data) {
    screenTopWarning(data);
  });
};

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwYWdlcy9hcHAvbmF2L25hdi5tanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBLE1BQU0sQ0FBQyxRQUFQLEdBQWtCLFlBQVc7QUFDM0IsTUFBRyxHQUFHLENBQUMsT0FBSixDQUFZLFFBQVosS0FBeUIsVUFBNUIsRUFBd0M7QUFDdEMsSUFBQSxHQUFHLENBQUMsUUFBSjtBQUNELEdBRkQsTUFFTyxJQUFHLEdBQUcsQ0FBQyxPQUFKLENBQVksUUFBWixLQUF5QixhQUE1QixFQUEyQztBQUNoRCxJQUFBLEdBQUcsQ0FBQyxPQUFKLENBQVksRUFBWixDQUFlLElBQWYsQ0FBb0IsY0FBcEIsRUFBb0M7QUFBQyxNQUFBLE1BQU0sRUFBRTtBQUFULEtBQXBDO0FBQ0Q7QUFDRixDQU5EOztBQU9BLE1BQU0sQ0FBQyxNQUFQLEdBQWdCLFlBQVc7QUFDekIsRUFBQSxNQUFNLENBQUMsU0FBRCxFQUFZLEtBQVosQ0FBTixDQUNHLElBREgsQ0FDUSxZQUFNO0FBQ1YsUUFBRyxHQUFHLENBQUMsT0FBSixDQUFZLFFBQVosS0FBeUIsVUFBNUIsRUFBd0M7QUFDdEMsTUFBQSxTQUFTLENBQUMsUUFBRCxDQUFUO0FBQ0QsS0FGRCxNQUVPLElBQUcsR0FBRyxDQUFDLE9BQUosQ0FBWSxRQUFaLEtBQXlCLGFBQTVCLEVBQTJDO0FBQ2hELE1BQUEsR0FBRyxDQUFDLE9BQUosQ0FBWSxFQUFaLENBQWUsSUFBZixDQUFvQixRQUFwQjtBQUNEO0FBQ0YsR0FQSCxXQVFTLFVBQUEsSUFBSSxFQUFJO0FBQ2IsSUFBQSxnQkFBZ0IsQ0FBQyxJQUFELENBQWhCO0FBQ0QsR0FWSDtBQVdELENBWkQiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJ3aW5kb3cuY2xvc2VXaW4gPSBmdW5jdGlvbigpIHtcclxuICBpZihOS0MuY29uZmlncy5wbGF0Zm9ybSA9PT0gJ2FwaUNsb3VkJykge1xyXG4gICAgYXBpLmNsb3NlV2luKCk7XHJcbiAgfSBlbHNlIGlmKE5LQy5jb25maWdzLnBsYXRmb3JtID09PSAncmVhY3ROYXRpdmUnKSB7XHJcbiAgICBOS0MubWV0aG9kcy5ybi5lbWl0KCdjbG9zZVdlYlZpZXcnLCB7ZHJhd2VyOiB0cnVlfSk7XHJcbiAgfVxyXG59O1xyXG53aW5kb3cubG9nb3V0ID0gZnVuY3Rpb24oKSB7XHJcbiAgbmtjQVBJKFwiL2xvZ291dFwiLCBcIkdFVFwiKVxyXG4gICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICBpZihOS0MuY29uZmlncy5wbGF0Zm9ybSA9PT0gJ2FwaUNsb3VkJykge1xyXG4gICAgICAgIGVtaXRFdmVudChcImxvZ291dFwiKTtcclxuICAgICAgfSBlbHNlIGlmKE5LQy5jb25maWdzLnBsYXRmb3JtID09PSAncmVhY3ROYXRpdmUnKSB7XHJcbiAgICAgICAgTktDLm1ldGhvZHMucm4uZW1pdCgnbG9nb3V0Jyk7XHJcbiAgICAgIH1cclxuICAgIH0pXHJcbiAgICAuY2F0Y2goZGF0YSA9PiB7XHJcbiAgICAgIHNjcmVlblRvcFdhcm5pbmcoZGF0YSk7XHJcbiAgICB9KVxyXG59O1xyXG4iXX0=
