(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

if (NKC.configs.platform === 'apiCloud') {
  $(function () {
    window.ready().then(function () {
      var logoutButton = $(".nav-logout");
      var backButton = $(".nav-back");
      logoutButton.on("click", function () {
        nkcAPI("/logout", "GET").then(function () {
          emitEvent("logout");
        })["catch"](function (data) {
          screenTopWarning(data);
        });
      });
      backButton.on("click", closeWin);
      newEvent("swipeleft", closeWin);
      newEvent("userChanged", function (data) {
        var user = data.user;
        if (!user) return;
        $("#username").text(user.username);
        $("#userDescription").text(user.description || "未填写个人简介");
        $("#userAvatar").attr("src", "/avatar/".concat(user.avatar));
        $("#userBanner").css("background-image", "url(/banner/".concat(user.banner, ")"));
      });
    });
  });
} else if (NKC.configs.platform === 'reactNative') {
  window.closeWin = closeWin;
}

function closeWin() {
  if (NKC.configs.platform === 'apiCloud') {
    api.closeWin();
  } else if (NKC.configs.platform === 'reactNative') {
    NKC.methods.rn.emit('closeWebView');
  }
}

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9fYnJvd3Nlci1wYWNrQDYuMS4wQGJyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInBhZ2VzL2FwcC9uYXYvbmF2Lm1qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUEsSUFBRyxHQUFHLENBQUMsT0FBSixDQUFZLFFBQVosS0FBeUIsVUFBNUIsRUFBd0M7QUFDdEMsRUFBQSxDQUFDLENBQUMsWUFBTTtBQUNOLElBQUEsTUFBTSxDQUFDLEtBQVAsR0FDRyxJQURILENBQ1EsWUFBTTtBQUNWLFVBQU0sWUFBWSxHQUFHLENBQUMsQ0FBQyxhQUFELENBQXRCO0FBQ0EsVUFBTSxVQUFVLEdBQUcsQ0FBQyxDQUFDLFdBQUQsQ0FBcEI7QUFDQSxNQUFBLFlBQVksQ0FBQyxFQUFiLENBQWdCLE9BQWhCLEVBQXlCLFlBQU07QUFDN0IsUUFBQSxNQUFNLENBQUMsU0FBRCxFQUFZLEtBQVosQ0FBTixDQUNHLElBREgsQ0FDUSxZQUFNO0FBQ1YsVUFBQSxTQUFTLENBQUMsUUFBRCxDQUFUO0FBQ0QsU0FISCxXQUlTLFVBQUEsSUFBSSxFQUFJO0FBQ2IsVUFBQSxnQkFBZ0IsQ0FBQyxJQUFELENBQWhCO0FBQ0QsU0FOSDtBQU9ELE9BUkQ7QUFTQSxNQUFBLFVBQVUsQ0FBQyxFQUFYLENBQWMsT0FBZCxFQUF1QixRQUF2QjtBQUNBLE1BQUEsUUFBUSxDQUFDLFdBQUQsRUFBYyxRQUFkLENBQVI7QUFDQSxNQUFBLFFBQVEsQ0FBQyxhQUFELEVBQWdCLFVBQUMsSUFBRCxFQUFVO0FBQUEsWUFDekIsSUFEeUIsR0FDakIsSUFEaUIsQ0FDekIsSUFEeUI7QUFFaEMsWUFBRyxDQUFDLElBQUosRUFBVTtBQUNWLFFBQUEsQ0FBQyxDQUFDLFdBQUQsQ0FBRCxDQUFlLElBQWYsQ0FBb0IsSUFBSSxDQUFDLFFBQXpCO0FBQ0EsUUFBQSxDQUFDLENBQUMsa0JBQUQsQ0FBRCxDQUFzQixJQUF0QixDQUEyQixJQUFJLENBQUMsV0FBTCxJQUFvQixTQUEvQztBQUNBLFFBQUEsQ0FBQyxDQUFDLGFBQUQsQ0FBRCxDQUFpQixJQUFqQixDQUFzQixLQUF0QixvQkFBd0MsSUFBSSxDQUFDLE1BQTdDO0FBQ0EsUUFBQSxDQUFDLENBQUMsYUFBRCxDQUFELENBQWlCLEdBQWpCLENBQXFCLGtCQUFyQix3QkFBd0QsSUFBSSxDQUFDLE1BQTdEO0FBQ0QsT0FQTyxDQUFSO0FBUUQsS0F2Qkg7QUF3QkQsR0F6QkEsQ0FBRDtBQTBCRCxDQTNCRCxNQTJCTyxJQUFHLEdBQUcsQ0FBQyxPQUFKLENBQVksUUFBWixLQUF5QixhQUE1QixFQUEwQztBQUMvQyxFQUFBLE1BQU0sQ0FBQyxRQUFQLEdBQWtCLFFBQWxCO0FBQ0Q7O0FBR0QsU0FBUyxRQUFULEdBQW9CO0FBQ2xCLE1BQUcsR0FBRyxDQUFDLE9BQUosQ0FBWSxRQUFaLEtBQXlCLFVBQTVCLEVBQXdDO0FBQ3RDLElBQUEsR0FBRyxDQUFDLFFBQUo7QUFDRCxHQUZELE1BRU8sSUFBRyxHQUFHLENBQUMsT0FBSixDQUFZLFFBQVosS0FBeUIsYUFBNUIsRUFBMkM7QUFDaEQsSUFBQSxHQUFHLENBQUMsT0FBSixDQUFZLEVBQVosQ0FBZSxJQUFmLENBQW9CLGNBQXBCO0FBQ0Q7QUFFRiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsImlmKE5LQy5jb25maWdzLnBsYXRmb3JtID09PSAnYXBpQ2xvdWQnKSB7XG4gICQoKCkgPT4ge1xuICAgIHdpbmRvdy5yZWFkeSgpXG4gICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgIGNvbnN0IGxvZ291dEJ1dHRvbiA9ICQoXCIubmF2LWxvZ291dFwiKTtcbiAgICAgICAgY29uc3QgYmFja0J1dHRvbiA9ICQoXCIubmF2LWJhY2tcIik7XG4gICAgICAgIGxvZ291dEJ1dHRvbi5vbihcImNsaWNrXCIsICgpID0+IHtcbiAgICAgICAgICBua2NBUEkoXCIvbG9nb3V0XCIsIFwiR0VUXCIpXG4gICAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgIGVtaXRFdmVudChcImxvZ291dFwiKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuY2F0Y2goZGF0YSA9PiB7XG4gICAgICAgICAgICAgIHNjcmVlblRvcFdhcm5pbmcoZGF0YSk7XG4gICAgICAgICAgICB9KVxuICAgICAgICB9KTtcbiAgICAgICAgYmFja0J1dHRvbi5vbihcImNsaWNrXCIsIGNsb3NlV2luKTtcbiAgICAgICAgbmV3RXZlbnQoXCJzd2lwZWxlZnRcIiwgY2xvc2VXaW4pO1xuICAgICAgICBuZXdFdmVudChcInVzZXJDaGFuZ2VkXCIsIChkYXRhKSA9PiB7XG4gICAgICAgICAgY29uc3Qge3VzZXJ9ID0gZGF0YTtcbiAgICAgICAgICBpZighdXNlcikgcmV0dXJuO1xuICAgICAgICAgICQoXCIjdXNlcm5hbWVcIikudGV4dCh1c2VyLnVzZXJuYW1lKTtcbiAgICAgICAgICAkKFwiI3VzZXJEZXNjcmlwdGlvblwiKS50ZXh0KHVzZXIuZGVzY3JpcHRpb24gfHwgXCLmnKrloavlhpnkuKrkurrnroDku4tcIik7XG4gICAgICAgICAgJChcIiN1c2VyQXZhdGFyXCIpLmF0dHIoXCJzcmNcIiwgYC9hdmF0YXIvJHt1c2VyLmF2YXRhcn1gKTtcbiAgICAgICAgICAkKFwiI3VzZXJCYW5uZXJcIikuY3NzKFwiYmFja2dyb3VuZC1pbWFnZVwiLCBgdXJsKC9iYW5uZXIvJHt1c2VyLmJhbm5lcn0pYCk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gIH0pO1xufSBlbHNlIGlmKE5LQy5jb25maWdzLnBsYXRmb3JtID09PSAncmVhY3ROYXRpdmUnKXtcbiAgd2luZG93LmNsb3NlV2luID0gY2xvc2VXaW47XG59XG5cblxuZnVuY3Rpb24gY2xvc2VXaW4oKSB7XG4gIGlmKE5LQy5jb25maWdzLnBsYXRmb3JtID09PSAnYXBpQ2xvdWQnKSB7XG4gICAgYXBpLmNsb3NlV2luKCk7XG4gIH0gZWxzZSBpZihOS0MuY29uZmlncy5wbGF0Zm9ybSA9PT0gJ3JlYWN0TmF0aXZlJykge1xuICAgIE5LQy5tZXRob2RzLnJuLmVtaXQoJ2Nsb3NlV2ViVmlldycpO1xuICB9XG5cbn1cbiJdfQ==
