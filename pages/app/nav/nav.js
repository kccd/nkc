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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9fYnJvd3Nlci1wYWNrQDYuMS4wQGJyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInBhZ2VzL2FwcC9uYXYvbmF2Lm1qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQW1DQSxNQUFNLENBQUMsUUFBUCxHQUFrQixZQUFXO0FBQzNCLE1BQUcsR0FBRyxDQUFDLE9BQUosQ0FBWSxRQUFaLEtBQXlCLFVBQTVCLEVBQXdDO0FBQ3RDLElBQUEsR0FBRyxDQUFDLFFBQUo7QUFDRCxHQUZELE1BRU8sSUFBRyxHQUFHLENBQUMsT0FBSixDQUFZLFFBQVosS0FBeUIsYUFBNUIsRUFBMkM7QUFDaEQsSUFBQSxHQUFHLENBQUMsT0FBSixDQUFZLEVBQVosQ0FBZSxJQUFmLENBQW9CLGNBQXBCLEVBQW9DO0FBQUMsTUFBQSxNQUFNLEVBQUU7QUFBVCxLQUFwQztBQUNEO0FBQ0YsQ0FORDs7QUFPQSxNQUFNLENBQUMsTUFBUCxHQUFnQixZQUFXO0FBQ3pCLEVBQUEsTUFBTSxDQUFDLFNBQUQsRUFBWSxLQUFaLENBQU4sQ0FDRyxJQURILENBQ1EsWUFBTTtBQUNWLFFBQUcsR0FBRyxDQUFDLE9BQUosQ0FBWSxRQUFaLEtBQXlCLFVBQTVCLEVBQXdDO0FBQ3RDLE1BQUEsU0FBUyxDQUFDLFFBQUQsQ0FBVDtBQUNELEtBRkQsTUFFTyxJQUFHLEdBQUcsQ0FBQyxPQUFKLENBQVksUUFBWixLQUF5QixhQUE1QixFQUEyQztBQUNoRCxNQUFBLEdBQUcsQ0FBQyxPQUFKLENBQVksRUFBWixDQUFlLElBQWYsQ0FBb0IsUUFBcEI7QUFDRDtBQUNGLEdBUEgsV0FRUyxVQUFBLElBQUksRUFBSTtBQUNiLElBQUEsZ0JBQWdCLENBQUMsSUFBRCxDQUFoQjtBQUNELEdBVkg7QUFXRCxDQVpEIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiLyppZihOS0MuY29uZmlncy5wbGF0Zm9ybSA9PT0gJ2FwaUNsb3VkJykge1xyXG4gICQoKCkgPT4ge1xyXG4gICAgd2luZG93LnJlYWR5KClcclxuICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IGxvZ291dEJ1dHRvbiA9ICQoXCIubmF2LWxvZ291dFwiKTtcclxuICAgICAgICBjb25zdCBiYWNrQnV0dG9uID0gJChcIi5uYXYtYmFja1wiKTtcclxuICAgICAgICBsb2dvdXRCdXR0b24ub24oXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICAgICAgICBua2NBUEkoXCIvbG9nb3V0XCIsIFwiR0VUXCIpXHJcbiAgICAgICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgICBlbWl0RXZlbnQoXCJsb2dvdXRcIik7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5jYXRjaChkYXRhID0+IHtcclxuICAgICAgICAgICAgICBzY3JlZW5Ub3BXYXJuaW5nKGRhdGEpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGJhY2tCdXR0b24ub24oXCJjbGlja1wiLCBjbG9zZVdpbik7XHJcbiAgICAgICAgbmV3RXZlbnQoXCJzd2lwZWxlZnRcIiwgY2xvc2VXaW4pO1xyXG4gICAgICAgIG5ld0V2ZW50KFwidXNlckNoYW5nZWRcIiwgKGRhdGEpID0+IHtcclxuICAgICAgICAgIGNvbnN0IHt1c2VyfSA9IGRhdGE7XHJcbiAgICAgICAgICBpZighdXNlcikgcmV0dXJuO1xyXG4gICAgICAgICAgJChcIiN1c2VybmFtZVwiKS50ZXh0KHVzZXIudXNlcm5hbWUpO1xyXG4gICAgICAgICAgJChcIiN1c2VyRGVzY3JpcHRpb25cIikudGV4dCh1c2VyLmRlc2NyaXB0aW9uIHx8IFwi5pyq5aGr5YaZ5Liq5Lq6566A5LuLXCIpO1xyXG4gICAgICAgICAgJChcIiN1c2VyQXZhdGFyXCIpLmF0dHIoXCJzcmNcIiwgYC9hdmF0YXIvJHt1c2VyLmF2YXRhcn1gKTtcclxuICAgICAgICAgICQoXCIjdXNlckJhbm5lclwiKS5jc3MoXCJiYWNrZ3JvdW5kLWltYWdlXCIsIGB1cmwoL2Jhbm5lci8ke3VzZXIuYmFubmVyfSlgKTtcclxuICAgICAgICB9KTtcclxuICAgICAgfSk7XHJcbiAgfSk7XHJcbn0gZWxzZSBpZihOS0MuY29uZmlncy5wbGF0Zm9ybSA9PT0gJ3JlYWN0TmF0aXZlJyl7XHJcbiAgd2luZG93LmNsb3NlV2luID0gY2xvc2VXaW47XHJcbiAgd2luZG93LmxvZ291dCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgTktDLm1ldGhvZHMucm4uZW1pdChcImxvZ291dFwiKTtcclxuICB9XHJcbn0qL1xyXG5cclxuXHJcbndpbmRvdy5jbG9zZVdpbiA9IGZ1bmN0aW9uKCkge1xyXG4gIGlmKE5LQy5jb25maWdzLnBsYXRmb3JtID09PSAnYXBpQ2xvdWQnKSB7XHJcbiAgICBhcGkuY2xvc2VXaW4oKTtcclxuICB9IGVsc2UgaWYoTktDLmNvbmZpZ3MucGxhdGZvcm0gPT09ICdyZWFjdE5hdGl2ZScpIHtcclxuICAgIE5LQy5tZXRob2RzLnJuLmVtaXQoJ2Nsb3NlV2ViVmlldycsIHtkcmF3ZXI6IHRydWV9KTtcclxuICB9XHJcbn07XHJcbndpbmRvdy5sb2dvdXQgPSBmdW5jdGlvbigpIHtcclxuICBua2NBUEkoXCIvbG9nb3V0XCIsIFwiR0VUXCIpXHJcbiAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgIGlmKE5LQy5jb25maWdzLnBsYXRmb3JtID09PSAnYXBpQ2xvdWQnKSB7XHJcbiAgICAgICAgZW1pdEV2ZW50KFwibG9nb3V0XCIpO1xyXG4gICAgICB9IGVsc2UgaWYoTktDLmNvbmZpZ3MucGxhdGZvcm0gPT09ICdyZWFjdE5hdGl2ZScpIHtcclxuICAgICAgICBOS0MubWV0aG9kcy5ybi5lbWl0KCdsb2dvdXQnKTtcclxuICAgICAgfVxyXG4gICAgfSlcclxuICAgIC5jYXRjaChkYXRhID0+IHtcclxuICAgICAgc2NyZWVuVG9wV2FybmluZyhkYXRhKTtcclxuICAgIH0pXHJcbn07XHJcbiJdfQ==
