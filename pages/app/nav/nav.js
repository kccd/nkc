(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

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

function closeWin() {
  api.closeWin();
}

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9fYnJvd3Nlci1wYWNrQDYuMS4wQGJyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInBhZ2VzL2FwcC9uYXYvbmF2Lm1qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUEsQ0FBQyxDQUFDLFlBQU07QUFDTixFQUFBLE1BQU0sQ0FBQyxLQUFQLEdBQ0csSUFESCxDQUNRLFlBQU07QUFDVixRQUFNLFlBQVksR0FBRyxDQUFDLENBQUMsYUFBRCxDQUF0QjtBQUNBLFFBQU0sVUFBVSxHQUFHLENBQUMsQ0FBQyxXQUFELENBQXBCO0FBQ0EsSUFBQSxZQUFZLENBQUMsRUFBYixDQUFnQixPQUFoQixFQUF5QixZQUFNO0FBQzdCLE1BQUEsTUFBTSxDQUFDLFNBQUQsRUFBWSxLQUFaLENBQU4sQ0FDRyxJQURILENBQ1EsWUFBTTtBQUNWLFFBQUEsU0FBUyxDQUFDLFFBQUQsQ0FBVDtBQUNELE9BSEgsV0FJUyxVQUFBLElBQUksRUFBSTtBQUNiLFFBQUEsZ0JBQWdCLENBQUMsSUFBRCxDQUFoQjtBQUNELE9BTkg7QUFPRCxLQVJEO0FBU0EsSUFBQSxVQUFVLENBQUMsRUFBWCxDQUFjLE9BQWQsRUFBdUIsUUFBdkI7QUFDQSxJQUFBLFFBQVEsQ0FBQyxXQUFELEVBQWMsUUFBZCxDQUFSO0FBQ0EsSUFBQSxRQUFRLENBQUMsYUFBRCxFQUFnQixVQUFDLElBQUQsRUFBVTtBQUFBLFVBQ3pCLElBRHlCLEdBQ2pCLElBRGlCLENBQ3pCLElBRHlCO0FBRWhDLFVBQUcsQ0FBQyxJQUFKLEVBQVU7QUFDVixNQUFBLENBQUMsQ0FBQyxXQUFELENBQUQsQ0FBZSxJQUFmLENBQW9CLElBQUksQ0FBQyxRQUF6QjtBQUNBLE1BQUEsQ0FBQyxDQUFDLGtCQUFELENBQUQsQ0FBc0IsSUFBdEIsQ0FBMkIsSUFBSSxDQUFDLFdBQUwsSUFBb0IsU0FBL0M7QUFDQSxNQUFBLENBQUMsQ0FBQyxhQUFELENBQUQsQ0FBaUIsSUFBakIsQ0FBc0IsS0FBdEIsb0JBQXdDLElBQUksQ0FBQyxNQUE3QztBQUNBLE1BQUEsQ0FBQyxDQUFDLGFBQUQsQ0FBRCxDQUFpQixHQUFqQixDQUFxQixrQkFBckIsd0JBQXdELElBQUksQ0FBQyxNQUE3RDtBQUNELEtBUE8sQ0FBUjtBQVFELEdBdkJIO0FBd0JELENBekJBLENBQUQ7O0FBNEJBLFNBQVMsUUFBVCxHQUFvQjtBQUNsQixFQUFBLEdBQUcsQ0FBQyxRQUFKO0FBQ0QiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCIkKCgpID0+IHtcclxuICB3aW5kb3cucmVhZHkoKVxyXG4gICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICBjb25zdCBsb2dvdXRCdXR0b24gPSAkKFwiLm5hdi1sb2dvdXRcIik7XHJcbiAgICAgIGNvbnN0IGJhY2tCdXR0b24gPSAkKFwiLm5hdi1iYWNrXCIpO1xyXG4gICAgICBsb2dvdXRCdXR0b24ub24oXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICAgICAgbmtjQVBJKFwiL2xvZ291dFwiLCBcIkdFVFwiKVxyXG4gICAgICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICBlbWl0RXZlbnQoXCJsb2dvdXRcIik7XHJcbiAgICAgICAgICB9KVxyXG4gICAgICAgICAgLmNhdGNoKGRhdGEgPT4ge1xyXG4gICAgICAgICAgICBzY3JlZW5Ub3BXYXJuaW5nKGRhdGEpO1xyXG4gICAgICAgICAgfSlcclxuICAgICAgfSk7XHJcbiAgICAgIGJhY2tCdXR0b24ub24oXCJjbGlja1wiLCBjbG9zZVdpbik7XHJcbiAgICAgIG5ld0V2ZW50KFwic3dpcGVsZWZ0XCIsIGNsb3NlV2luKTtcclxuICAgICAgbmV3RXZlbnQoXCJ1c2VyQ2hhbmdlZFwiLCAoZGF0YSkgPT4ge1xyXG4gICAgICAgIGNvbnN0IHt1c2VyfSA9IGRhdGE7XHJcbiAgICAgICAgaWYoIXVzZXIpIHJldHVybjtcclxuICAgICAgICAkKFwiI3VzZXJuYW1lXCIpLnRleHQodXNlci51c2VybmFtZSk7XHJcbiAgICAgICAgJChcIiN1c2VyRGVzY3JpcHRpb25cIikudGV4dCh1c2VyLmRlc2NyaXB0aW9uIHx8IFwi5pyq5aGr5YaZ5Liq5Lq6566A5LuLXCIpO1xyXG4gICAgICAgICQoXCIjdXNlckF2YXRhclwiKS5hdHRyKFwic3JjXCIsIGAvYXZhdGFyLyR7dXNlci5hdmF0YXJ9YCk7XHJcbiAgICAgICAgJChcIiN1c2VyQmFubmVyXCIpLmNzcyhcImJhY2tncm91bmQtaW1hZ2VcIiwgYHVybCgvYmFubmVyLyR7dXNlci5iYW5uZXJ9KWApO1xyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG59KTtcclxuXHJcblxyXG5mdW5jdGlvbiBjbG9zZVdpbigpIHtcclxuICBhcGkuY2xvc2VXaW4oKTtcclxufVxyXG4iXX0=
