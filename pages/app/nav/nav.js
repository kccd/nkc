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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9fYnJvd3Nlci1wYWNrQDYuMS4wQGJyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInBhZ2VzL2FwcC9uYXYvbmF2Lm1qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUEsSUFBRyxHQUFHLENBQUMsT0FBSixDQUFZLFFBQVosS0FBeUIsVUFBNUIsRUFBd0M7QUFDdEMsRUFBQSxDQUFDLENBQUMsWUFBTTtBQUNOLElBQUEsTUFBTSxDQUFDLEtBQVAsR0FDRyxJQURILENBQ1EsWUFBTTtBQUNWLFVBQU0sWUFBWSxHQUFHLENBQUMsQ0FBQyxhQUFELENBQXRCO0FBQ0EsVUFBTSxVQUFVLEdBQUcsQ0FBQyxDQUFDLFdBQUQsQ0FBcEI7QUFDQSxNQUFBLFlBQVksQ0FBQyxFQUFiLENBQWdCLE9BQWhCLEVBQXlCLFlBQU07QUFDN0IsUUFBQSxNQUFNLENBQUMsU0FBRCxFQUFZLEtBQVosQ0FBTixDQUNHLElBREgsQ0FDUSxZQUFNO0FBQ1YsVUFBQSxTQUFTLENBQUMsUUFBRCxDQUFUO0FBQ0QsU0FISCxXQUlTLFVBQUEsSUFBSSxFQUFJO0FBQ2IsVUFBQSxnQkFBZ0IsQ0FBQyxJQUFELENBQWhCO0FBQ0QsU0FOSDtBQU9ELE9BUkQ7QUFTQSxNQUFBLFVBQVUsQ0FBQyxFQUFYLENBQWMsT0FBZCxFQUF1QixRQUF2QjtBQUNBLE1BQUEsUUFBUSxDQUFDLFdBQUQsRUFBYyxRQUFkLENBQVI7QUFDQSxNQUFBLFFBQVEsQ0FBQyxhQUFELEVBQWdCLFVBQUMsSUFBRCxFQUFVO0FBQUEsWUFDekIsSUFEeUIsR0FDakIsSUFEaUIsQ0FDekIsSUFEeUI7QUFFaEMsWUFBRyxDQUFDLElBQUosRUFBVTtBQUNWLFFBQUEsQ0FBQyxDQUFDLFdBQUQsQ0FBRCxDQUFlLElBQWYsQ0FBb0IsSUFBSSxDQUFDLFFBQXpCO0FBQ0EsUUFBQSxDQUFDLENBQUMsa0JBQUQsQ0FBRCxDQUFzQixJQUF0QixDQUEyQixJQUFJLENBQUMsV0FBTCxJQUFvQixTQUEvQztBQUNBLFFBQUEsQ0FBQyxDQUFDLGFBQUQsQ0FBRCxDQUFpQixJQUFqQixDQUFzQixLQUF0QixvQkFBd0MsSUFBSSxDQUFDLE1BQTdDO0FBQ0EsUUFBQSxDQUFDLENBQUMsYUFBRCxDQUFELENBQWlCLEdBQWpCLENBQXFCLGtCQUFyQix3QkFBd0QsSUFBSSxDQUFDLE1BQTdEO0FBQ0QsT0FQTyxDQUFSO0FBUUQsS0F2Qkg7QUF3QkQsR0F6QkEsQ0FBRDtBQTBCRCxDQTNCRCxNQTJCTyxJQUFHLEdBQUcsQ0FBQyxPQUFKLENBQVksUUFBWixLQUF5QixhQUE1QixFQUEwQztBQUMvQyxFQUFBLE1BQU0sQ0FBQyxRQUFQLEdBQWtCLFFBQWxCO0FBQ0Q7O0FBR0QsU0FBUyxRQUFULEdBQW9CO0FBQ2xCLE1BQUcsR0FBRyxDQUFDLE9BQUosQ0FBWSxRQUFaLEtBQXlCLFVBQTVCLEVBQXdDO0FBQ3RDLElBQUEsR0FBRyxDQUFDLFFBQUo7QUFDRCxHQUZELE1BRU8sSUFBRyxHQUFHLENBQUMsT0FBSixDQUFZLFFBQVosS0FBeUIsYUFBNUIsRUFBMkM7QUFDaEQsSUFBQSxHQUFHLENBQUMsT0FBSixDQUFZLEVBQVosQ0FBZSxJQUFmLENBQW9CLGNBQXBCO0FBQ0Q7QUFFRiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsImlmKE5LQy5jb25maWdzLnBsYXRmb3JtID09PSAnYXBpQ2xvdWQnKSB7XHJcbiAgJCgoKSA9PiB7XHJcbiAgICB3aW5kb3cucmVhZHkoKVxyXG4gICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgY29uc3QgbG9nb3V0QnV0dG9uID0gJChcIi5uYXYtbG9nb3V0XCIpO1xyXG4gICAgICAgIGNvbnN0IGJhY2tCdXR0b24gPSAkKFwiLm5hdi1iYWNrXCIpO1xyXG4gICAgICAgIGxvZ291dEJ1dHRvbi5vbihcImNsaWNrXCIsICgpID0+IHtcclxuICAgICAgICAgIG5rY0FQSShcIi9sb2dvdXRcIiwgXCJHRVRcIilcclxuICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgIGVtaXRFdmVudChcImxvZ291dFwiKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLmNhdGNoKGRhdGEgPT4ge1xyXG4gICAgICAgICAgICAgIHNjcmVlblRvcFdhcm5pbmcoZGF0YSk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgYmFja0J1dHRvbi5vbihcImNsaWNrXCIsIGNsb3NlV2luKTtcclxuICAgICAgICBuZXdFdmVudChcInN3aXBlbGVmdFwiLCBjbG9zZVdpbik7XHJcbiAgICAgICAgbmV3RXZlbnQoXCJ1c2VyQ2hhbmdlZFwiLCAoZGF0YSkgPT4ge1xyXG4gICAgICAgICAgY29uc3Qge3VzZXJ9ID0gZGF0YTtcclxuICAgICAgICAgIGlmKCF1c2VyKSByZXR1cm47XHJcbiAgICAgICAgICAkKFwiI3VzZXJuYW1lXCIpLnRleHQodXNlci51c2VybmFtZSk7XHJcbiAgICAgICAgICAkKFwiI3VzZXJEZXNjcmlwdGlvblwiKS50ZXh0KHVzZXIuZGVzY3JpcHRpb24gfHwgXCLmnKrloavlhpnkuKrkurrnroDku4tcIik7XHJcbiAgICAgICAgICAkKFwiI3VzZXJBdmF0YXJcIikuYXR0cihcInNyY1wiLCBgL2F2YXRhci8ke3VzZXIuYXZhdGFyfWApO1xyXG4gICAgICAgICAgJChcIiN1c2VyQmFubmVyXCIpLmNzcyhcImJhY2tncm91bmQtaW1hZ2VcIiwgYHVybCgvYmFubmVyLyR7dXNlci5iYW5uZXJ9KWApO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9KTtcclxuICB9KTtcclxufSBlbHNlIGlmKE5LQy5jb25maWdzLnBsYXRmb3JtID09PSAncmVhY3ROYXRpdmUnKXtcclxuICB3aW5kb3cuY2xvc2VXaW4gPSBjbG9zZVdpbjtcclxufVxyXG5cclxuXHJcbmZ1bmN0aW9uIGNsb3NlV2luKCkge1xyXG4gIGlmKE5LQy5jb25maWdzLnBsYXRmb3JtID09PSAnYXBpQ2xvdWQnKSB7XHJcbiAgICBhcGkuY2xvc2VXaW4oKTtcclxuICB9IGVsc2UgaWYoTktDLmNvbmZpZ3MucGxhdGZvcm0gPT09ICdyZWFjdE5hdGl2ZScpIHtcclxuICAgIE5LQy5tZXRob2RzLnJuLmVtaXQoJ2Nsb3NlV2ViVmlldycpO1xyXG4gIH1cclxuXHJcbn1cclxuIl19
