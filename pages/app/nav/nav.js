(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

/*if(NKC.configs.platform === 'apiCloud') {
  $(() => {
    window.ready()
      .then(() => {
        const logoutButton = $(".nav-logout");
        const backButton = $(".nav-back");
        logoutButton.on("click", () => {
          nkcAPI("/logout", "GET")
            .then(() => {
              emitEvent("logout");
            })
            .catch(data => {
              screenTopWarning(data);
            })
        });
        backButton.on("click", closeWin);
        newEvent("swipeleft", closeWin);
        newEvent("userChanged", (data) => {
          const {user} = data;
          if(!user) return;
          $("#username").text(user.username);
          $("#userDescription").text(user.description || "未填写个人简介");
          $("#userAvatar").attr("src", `/avatar/${user.avatar}`);
          $("#userBanner").css("background-image", `url(/banner/${user.banner})`);
        });
      });
  });
} else if(NKC.configs.platform === 'reactNative'){
  window.closeWin = closeWin;
  window.logout = function() {
    NKC.methods.rn.emit("logout");
  }
}*/
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwYWdlcy9hcHAvbmF2L25hdi5tanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFtQ0EsTUFBTSxDQUFDLFFBQVAsR0FBa0IsWUFBVztBQUMzQixNQUFHLEdBQUcsQ0FBQyxPQUFKLENBQVksUUFBWixLQUF5QixVQUE1QixFQUF3QztBQUN0QyxJQUFBLEdBQUcsQ0FBQyxRQUFKO0FBQ0QsR0FGRCxNQUVPLElBQUcsR0FBRyxDQUFDLE9BQUosQ0FBWSxRQUFaLEtBQXlCLGFBQTVCLEVBQTJDO0FBQ2hELElBQUEsR0FBRyxDQUFDLE9BQUosQ0FBWSxFQUFaLENBQWUsSUFBZixDQUFvQixjQUFwQixFQUFvQztBQUFDLE1BQUEsTUFBTSxFQUFFO0FBQVQsS0FBcEM7QUFDRDtBQUNGLENBTkQ7O0FBT0EsTUFBTSxDQUFDLE1BQVAsR0FBZ0IsWUFBVztBQUN6QixFQUFBLE1BQU0sQ0FBQyxTQUFELEVBQVksS0FBWixDQUFOLENBQ0csSUFESCxDQUNRLFlBQU07QUFDVixRQUFHLEdBQUcsQ0FBQyxPQUFKLENBQVksUUFBWixLQUF5QixVQUE1QixFQUF3QztBQUN0QyxNQUFBLFNBQVMsQ0FBQyxRQUFELENBQVQ7QUFDRCxLQUZELE1BRU8sSUFBRyxHQUFHLENBQUMsT0FBSixDQUFZLFFBQVosS0FBeUIsYUFBNUIsRUFBMkM7QUFDaEQsTUFBQSxHQUFHLENBQUMsT0FBSixDQUFZLEVBQVosQ0FBZSxJQUFmLENBQW9CLFFBQXBCO0FBQ0Q7QUFDRixHQVBILFdBUVMsVUFBQSxJQUFJLEVBQUk7QUFDYixJQUFBLGdCQUFnQixDQUFDLElBQUQsQ0FBaEI7QUFDRCxHQVZIO0FBV0QsQ0FaRCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIi8qaWYoTktDLmNvbmZpZ3MucGxhdGZvcm0gPT09ICdhcGlDbG91ZCcpIHtcclxuICAkKCgpID0+IHtcclxuICAgIHdpbmRvdy5yZWFkeSgpXHJcbiAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICBjb25zdCBsb2dvdXRCdXR0b24gPSAkKFwiLm5hdi1sb2dvdXRcIik7XHJcbiAgICAgICAgY29uc3QgYmFja0J1dHRvbiA9ICQoXCIubmF2LWJhY2tcIik7XHJcbiAgICAgICAgbG9nb3V0QnV0dG9uLm9uKFwiY2xpY2tcIiwgKCkgPT4ge1xyXG4gICAgICAgICAgbmtjQVBJKFwiL2xvZ291dFwiLCBcIkdFVFwiKVxyXG4gICAgICAgICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgICAgZW1pdEV2ZW50KFwibG9nb3V0XCIpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuY2F0Y2goZGF0YSA9PiB7XHJcbiAgICAgICAgICAgICAgc2NyZWVuVG9wV2FybmluZyhkYXRhKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9KTtcclxuICAgICAgICBiYWNrQnV0dG9uLm9uKFwiY2xpY2tcIiwgY2xvc2VXaW4pO1xyXG4gICAgICAgIG5ld0V2ZW50KFwic3dpcGVsZWZ0XCIsIGNsb3NlV2luKTtcclxuICAgICAgICBuZXdFdmVudChcInVzZXJDaGFuZ2VkXCIsIChkYXRhKSA9PiB7XHJcbiAgICAgICAgICBjb25zdCB7dXNlcn0gPSBkYXRhO1xyXG4gICAgICAgICAgaWYoIXVzZXIpIHJldHVybjtcclxuICAgICAgICAgICQoXCIjdXNlcm5hbWVcIikudGV4dCh1c2VyLnVzZXJuYW1lKTtcclxuICAgICAgICAgICQoXCIjdXNlckRlc2NyaXB0aW9uXCIpLnRleHQodXNlci5kZXNjcmlwdGlvbiB8fCBcIuacquWhq+WGmeS4quS6uueugOS7i1wiKTtcclxuICAgICAgICAgICQoXCIjdXNlckF2YXRhclwiKS5hdHRyKFwic3JjXCIsIGAvYXZhdGFyLyR7dXNlci5hdmF0YXJ9YCk7XHJcbiAgICAgICAgICAkKFwiI3VzZXJCYW5uZXJcIikuY3NzKFwiYmFja2dyb3VuZC1pbWFnZVwiLCBgdXJsKC9iYW5uZXIvJHt1c2VyLmJhbm5lcn0pYCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH0pO1xyXG4gIH0pO1xyXG59IGVsc2UgaWYoTktDLmNvbmZpZ3MucGxhdGZvcm0gPT09ICdyZWFjdE5hdGl2ZScpe1xyXG4gIHdpbmRvdy5jbG9zZVdpbiA9IGNsb3NlV2luO1xyXG4gIHdpbmRvdy5sb2dvdXQgPSBmdW5jdGlvbigpIHtcclxuICAgIE5LQy5tZXRob2RzLnJuLmVtaXQoXCJsb2dvdXRcIik7XHJcbiAgfVxyXG59Ki9cclxuXHJcblxyXG53aW5kb3cuY2xvc2VXaW4gPSBmdW5jdGlvbigpIHtcclxuICBpZihOS0MuY29uZmlncy5wbGF0Zm9ybSA9PT0gJ2FwaUNsb3VkJykge1xyXG4gICAgYXBpLmNsb3NlV2luKCk7XHJcbiAgfSBlbHNlIGlmKE5LQy5jb25maWdzLnBsYXRmb3JtID09PSAncmVhY3ROYXRpdmUnKSB7XHJcbiAgICBOS0MubWV0aG9kcy5ybi5lbWl0KCdjbG9zZVdlYlZpZXcnLCB7ZHJhd2VyOiB0cnVlfSk7XHJcbiAgfVxyXG59O1xyXG53aW5kb3cubG9nb3V0ID0gZnVuY3Rpb24oKSB7XHJcbiAgbmtjQVBJKFwiL2xvZ291dFwiLCBcIkdFVFwiKVxyXG4gICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICBpZihOS0MuY29uZmlncy5wbGF0Zm9ybSA9PT0gJ2FwaUNsb3VkJykge1xyXG4gICAgICAgIGVtaXRFdmVudChcImxvZ291dFwiKTtcclxuICAgICAgfSBlbHNlIGlmKE5LQy5jb25maWdzLnBsYXRmb3JtID09PSAncmVhY3ROYXRpdmUnKSB7XHJcbiAgICAgICAgTktDLm1ldGhvZHMucm4uZW1pdCgnbG9nb3V0Jyk7XHJcbiAgICAgIH1cclxuICAgIH0pXHJcbiAgICAuY2F0Y2goZGF0YSA9PiB7XHJcbiAgICAgIHNjcmVlblRvcFdhcm5pbmcoZGF0YSk7XHJcbiAgICB9KVxyXG59O1xyXG4iXX0=
