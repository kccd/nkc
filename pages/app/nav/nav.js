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
    NKC.methods.rn.emit('closeWebView');
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9fYnJvd3Nlci1wYWNrQDYuMS4wQGJyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInBhZ2VzL2FwcC9uYXYvbmF2Lm1qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQXFDQSxNQUFNLENBQUMsUUFBUCxHQUFrQixZQUFXO0FBQzNCLE1BQUcsR0FBRyxDQUFDLE9BQUosQ0FBWSxRQUFaLEtBQXlCLFVBQTVCLEVBQXdDO0FBQ3RDLElBQUEsR0FBRyxDQUFDLFFBQUo7QUFDRCxHQUZELE1BRU8sSUFBRyxHQUFHLENBQUMsT0FBSixDQUFZLFFBQVosS0FBeUIsYUFBNUIsRUFBMkM7QUFDaEQsSUFBQSxHQUFHLENBQUMsT0FBSixDQUFZLEVBQVosQ0FBZSxJQUFmLENBQW9CLGNBQXBCO0FBQ0Q7QUFDRixDQU5EOztBQU9BLE1BQU0sQ0FBQyxNQUFQLEdBQWdCLFlBQVc7QUFDekIsRUFBQSxNQUFNLENBQUMsU0FBRCxFQUFZLEtBQVosQ0FBTixDQUNHLElBREgsQ0FDUSxZQUFNO0FBQ1YsUUFBRyxHQUFHLENBQUMsT0FBSixDQUFZLFFBQVosS0FBeUIsVUFBNUIsRUFBd0M7QUFDdEMsTUFBQSxTQUFTLENBQUMsUUFBRCxDQUFUO0FBQ0QsS0FGRCxNQUVPLElBQUcsR0FBRyxDQUFDLE9BQUosQ0FBWSxRQUFaLEtBQXlCLGFBQTVCLEVBQTJDO0FBQ2hELE1BQUEsR0FBRyxDQUFDLE9BQUosQ0FBWSxFQUFaLENBQWUsSUFBZixDQUFvQixRQUFwQjtBQUNEO0FBQ0YsR0FQSCxXQVFTLFVBQUEsSUFBSSxFQUFJO0FBQ2IsSUFBQSxnQkFBZ0IsQ0FBQyxJQUFELENBQWhCO0FBQ0QsR0FWSDtBQVdELENBWkQiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCIvKmlmKE5LQy5jb25maWdzLnBsYXRmb3JtID09PSAnYXBpQ2xvdWQnKSB7XG4gICQoKCkgPT4ge1xuICAgIHdpbmRvdy5yZWFkeSgpXG4gICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgIGNvbnN0IGxvZ291dEJ1dHRvbiA9ICQoXCIubmF2LWxvZ291dFwiKTtcbiAgICAgICAgY29uc3QgYmFja0J1dHRvbiA9ICQoXCIubmF2LWJhY2tcIik7XG4gICAgICAgIGxvZ291dEJ1dHRvbi5vbihcImNsaWNrXCIsICgpID0+IHtcbiAgICAgICAgICBua2NBUEkoXCIvbG9nb3V0XCIsIFwiR0VUXCIpXG4gICAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgIGVtaXRFdmVudChcImxvZ291dFwiKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuY2F0Y2goZGF0YSA9PiB7XG4gICAgICAgICAgICAgIHNjcmVlblRvcFdhcm5pbmcoZGF0YSk7XG4gICAgICAgICAgICB9KVxuICAgICAgICB9KTtcbiAgICAgICAgYmFja0J1dHRvbi5vbihcImNsaWNrXCIsIGNsb3NlV2luKTtcbiAgICAgICAgbmV3RXZlbnQoXCJzd2lwZWxlZnRcIiwgY2xvc2VXaW4pO1xuICAgICAgICBuZXdFdmVudChcInVzZXJDaGFuZ2VkXCIsIChkYXRhKSA9PiB7XG4gICAgICAgICAgY29uc3Qge3VzZXJ9ID0gZGF0YTtcbiAgICAgICAgICBpZighdXNlcikgcmV0dXJuO1xuICAgICAgICAgICQoXCIjdXNlcm5hbWVcIikudGV4dCh1c2VyLnVzZXJuYW1lKTtcbiAgICAgICAgICAkKFwiI3VzZXJEZXNjcmlwdGlvblwiKS50ZXh0KHVzZXIuZGVzY3JpcHRpb24gfHwgXCLmnKrloavlhpnkuKrkurrnroDku4tcIik7XG4gICAgICAgICAgJChcIiN1c2VyQXZhdGFyXCIpLmF0dHIoXCJzcmNcIiwgYC9hdmF0YXIvJHt1c2VyLmF2YXRhcn1gKTtcbiAgICAgICAgICAkKFwiI3VzZXJCYW5uZXJcIikuY3NzKFwiYmFja2dyb3VuZC1pbWFnZVwiLCBgdXJsKC9iYW5uZXIvJHt1c2VyLmJhbm5lcn0pYCk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gIH0pO1xufSBlbHNlIGlmKE5LQy5jb25maWdzLnBsYXRmb3JtID09PSAncmVhY3ROYXRpdmUnKXtcbiAgd2luZG93LmNsb3NlV2luID0gY2xvc2VXaW47XG4gIHdpbmRvdy5sb2dvdXQgPSBmdW5jdGlvbigpIHtcbiAgICBOS0MubWV0aG9kcy5ybi5lbWl0KFwibG9nb3V0XCIpO1xuICB9XG59Ki9cblxuXG5cblxud2luZG93LmNsb3NlV2luID0gZnVuY3Rpb24oKSB7XG4gIGlmKE5LQy5jb25maWdzLnBsYXRmb3JtID09PSAnYXBpQ2xvdWQnKSB7XG4gICAgYXBpLmNsb3NlV2luKCk7XG4gIH0gZWxzZSBpZihOS0MuY29uZmlncy5wbGF0Zm9ybSA9PT0gJ3JlYWN0TmF0aXZlJykge1xuICAgIE5LQy5tZXRob2RzLnJuLmVtaXQoJ2Nsb3NlV2ViVmlldycpO1xuICB9XG59O1xud2luZG93LmxvZ291dCA9IGZ1bmN0aW9uKCkge1xuICBua2NBUEkoXCIvbG9nb3V0XCIsIFwiR0VUXCIpXG4gICAgLnRoZW4oKCkgPT4ge1xuICAgICAgaWYoTktDLmNvbmZpZ3MucGxhdGZvcm0gPT09ICdhcGlDbG91ZCcpIHtcbiAgICAgICAgZW1pdEV2ZW50KFwibG9nb3V0XCIpO1xuICAgICAgfSBlbHNlIGlmKE5LQy5jb25maWdzLnBsYXRmb3JtID09PSAncmVhY3ROYXRpdmUnKSB7XG4gICAgICAgIE5LQy5tZXRob2RzLnJuLmVtaXQoJ2xvZ291dCcpO1xuICAgICAgfVxuICAgIH0pXG4gICAgLmNhdGNoKGRhdGEgPT4ge1xuICAgICAgc2NyZWVuVG9wV2FybmluZyhkYXRhKTtcbiAgICB9KVxufTtcbiJdfQ==
