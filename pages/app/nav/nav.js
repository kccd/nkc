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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9fYnJvd3Nlci1wYWNrQDYuMS4wQGJyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInBhZ2VzL2FwcC9uYXYvbmF2Lm1qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQW1DQSxNQUFNLENBQUMsUUFBUCxHQUFrQixZQUFXO0FBQzNCLE1BQUcsR0FBRyxDQUFDLE9BQUosQ0FBWSxRQUFaLEtBQXlCLFVBQTVCLEVBQXdDO0FBQ3RDLElBQUEsR0FBRyxDQUFDLFFBQUo7QUFDRCxHQUZELE1BRU8sSUFBRyxHQUFHLENBQUMsT0FBSixDQUFZLFFBQVosS0FBeUIsYUFBNUIsRUFBMkM7QUFDaEQsSUFBQSxHQUFHLENBQUMsT0FBSixDQUFZLEVBQVosQ0FBZSxJQUFmLENBQW9CLGNBQXBCO0FBQ0Q7QUFDRixDQU5EOztBQU9BLE1BQU0sQ0FBQyxNQUFQLEdBQWdCLFlBQVc7QUFDekIsRUFBQSxNQUFNLENBQUMsU0FBRCxFQUFZLEtBQVosQ0FBTixDQUNHLElBREgsQ0FDUSxZQUFNO0FBQ1YsUUFBRyxHQUFHLENBQUMsT0FBSixDQUFZLFFBQVosS0FBeUIsVUFBNUIsRUFBd0M7QUFDdEMsTUFBQSxTQUFTLENBQUMsUUFBRCxDQUFUO0FBQ0QsS0FGRCxNQUVPLElBQUcsR0FBRyxDQUFDLE9BQUosQ0FBWSxRQUFaLEtBQXlCLGFBQTVCLEVBQTJDO0FBQ2hELE1BQUEsR0FBRyxDQUFDLE9BQUosQ0FBWSxFQUFaLENBQWUsSUFBZixDQUFvQixRQUFwQjtBQUNEO0FBQ0YsR0FQSCxXQVFTLFVBQUEsSUFBSSxFQUFJO0FBQ2IsSUFBQSxnQkFBZ0IsQ0FBQyxJQUFELENBQWhCO0FBQ0QsR0FWSDtBQVdELENBWkQiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCIvKmlmKE5LQy5jb25maWdzLnBsYXRmb3JtID09PSAnYXBpQ2xvdWQnKSB7XHJcbiAgJCgoKSA9PiB7XHJcbiAgICB3aW5kb3cucmVhZHkoKVxyXG4gICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgY29uc3QgbG9nb3V0QnV0dG9uID0gJChcIi5uYXYtbG9nb3V0XCIpO1xyXG4gICAgICAgIGNvbnN0IGJhY2tCdXR0b24gPSAkKFwiLm5hdi1iYWNrXCIpO1xyXG4gICAgICAgIGxvZ291dEJ1dHRvbi5vbihcImNsaWNrXCIsICgpID0+IHtcclxuICAgICAgICAgIG5rY0FQSShcIi9sb2dvdXRcIiwgXCJHRVRcIilcclxuICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgIGVtaXRFdmVudChcImxvZ291dFwiKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLmNhdGNoKGRhdGEgPT4ge1xyXG4gICAgICAgICAgICAgIHNjcmVlblRvcFdhcm5pbmcoZGF0YSk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgYmFja0J1dHRvbi5vbihcImNsaWNrXCIsIGNsb3NlV2luKTtcclxuICAgICAgICBuZXdFdmVudChcInN3aXBlbGVmdFwiLCBjbG9zZVdpbik7XHJcbiAgICAgICAgbmV3RXZlbnQoXCJ1c2VyQ2hhbmdlZFwiLCAoZGF0YSkgPT4ge1xyXG4gICAgICAgICAgY29uc3Qge3VzZXJ9ID0gZGF0YTtcclxuICAgICAgICAgIGlmKCF1c2VyKSByZXR1cm47XHJcbiAgICAgICAgICAkKFwiI3VzZXJuYW1lXCIpLnRleHQodXNlci51c2VybmFtZSk7XHJcbiAgICAgICAgICAkKFwiI3VzZXJEZXNjcmlwdGlvblwiKS50ZXh0KHVzZXIuZGVzY3JpcHRpb24gfHwgXCLmnKrloavlhpnkuKrkurrnroDku4tcIik7XHJcbiAgICAgICAgICAkKFwiI3VzZXJBdmF0YXJcIikuYXR0cihcInNyY1wiLCBgL2F2YXRhci8ke3VzZXIuYXZhdGFyfWApO1xyXG4gICAgICAgICAgJChcIiN1c2VyQmFubmVyXCIpLmNzcyhcImJhY2tncm91bmQtaW1hZ2VcIiwgYHVybCgvYmFubmVyLyR7dXNlci5iYW5uZXJ9KWApO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9KTtcclxuICB9KTtcclxufSBlbHNlIGlmKE5LQy5jb25maWdzLnBsYXRmb3JtID09PSAncmVhY3ROYXRpdmUnKXtcclxuICB3aW5kb3cuY2xvc2VXaW4gPSBjbG9zZVdpbjtcclxuICB3aW5kb3cubG9nb3V0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICBOS0MubWV0aG9kcy5ybi5lbWl0KFwibG9nb3V0XCIpO1xyXG4gIH1cclxufSovXHJcblxyXG5cclxud2luZG93LmNsb3NlV2luID0gZnVuY3Rpb24oKSB7XHJcbiAgaWYoTktDLmNvbmZpZ3MucGxhdGZvcm0gPT09ICdhcGlDbG91ZCcpIHtcclxuICAgIGFwaS5jbG9zZVdpbigpO1xyXG4gIH0gZWxzZSBpZihOS0MuY29uZmlncy5wbGF0Zm9ybSA9PT0gJ3JlYWN0TmF0aXZlJykge1xyXG4gICAgTktDLm1ldGhvZHMucm4uZW1pdCgnY2xvc2VXZWJWaWV3Jyk7XHJcbiAgfVxyXG59O1xyXG53aW5kb3cubG9nb3V0ID0gZnVuY3Rpb24oKSB7XHJcbiAgbmtjQVBJKFwiL2xvZ291dFwiLCBcIkdFVFwiKVxyXG4gICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICBpZihOS0MuY29uZmlncy5wbGF0Zm9ybSA9PT0gJ2FwaUNsb3VkJykge1xyXG4gICAgICAgIGVtaXRFdmVudChcImxvZ291dFwiKTtcclxuICAgICAgfSBlbHNlIGlmKE5LQy5jb25maWdzLnBsYXRmb3JtID09PSAncmVhY3ROYXRpdmUnKSB7XHJcbiAgICAgICAgTktDLm1ldGhvZHMucm4uZW1pdCgnbG9nb3V0Jyk7XHJcbiAgICAgIH1cclxuICAgIH0pXHJcbiAgICAuY2F0Y2goZGF0YSA9PiB7XHJcbiAgICAgIHNjcmVlblRvcFdhcm5pbmcoZGF0YSk7XHJcbiAgICB9KVxyXG59O1xyXG4iXX0=
