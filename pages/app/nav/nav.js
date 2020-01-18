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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9fYnJvd3Nlci1wYWNrQDYuMS4wQGJyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInBhZ2VzL2FwcC9uYXYvbmF2Lm1qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUEsQ0FBQyxDQUFDLFlBQU07QUFDTixFQUFBLE1BQU0sQ0FBQyxLQUFQLEdBQ0csSUFESCxDQUNRLFlBQU07QUFDVixRQUFNLFlBQVksR0FBRyxDQUFDLENBQUMsYUFBRCxDQUF0QjtBQUNBLFFBQU0sVUFBVSxHQUFHLENBQUMsQ0FBQyxXQUFELENBQXBCO0FBQ0EsSUFBQSxZQUFZLENBQUMsRUFBYixDQUFnQixPQUFoQixFQUF5QixZQUFNO0FBQzdCLE1BQUEsTUFBTSxDQUFDLFNBQUQsRUFBWSxLQUFaLENBQU4sQ0FDRyxJQURILENBQ1EsWUFBTTtBQUNWLFFBQUEsU0FBUyxDQUFDLFFBQUQsQ0FBVDtBQUNELE9BSEgsV0FJUyxVQUFBLElBQUksRUFBSTtBQUNiLFFBQUEsZ0JBQWdCLENBQUMsSUFBRCxDQUFoQjtBQUNELE9BTkg7QUFPRCxLQVJEO0FBU0EsSUFBQSxVQUFVLENBQUMsRUFBWCxDQUFjLE9BQWQsRUFBdUIsUUFBdkI7QUFDQSxJQUFBLFFBQVEsQ0FBQyxXQUFELEVBQWMsUUFBZCxDQUFSO0FBQ0EsSUFBQSxRQUFRLENBQUMsYUFBRCxFQUFnQixVQUFDLElBQUQsRUFBVTtBQUFBLFVBQ3pCLElBRHlCLEdBQ2pCLElBRGlCLENBQ3pCLElBRHlCO0FBRWhDLFVBQUcsQ0FBQyxJQUFKLEVBQVU7QUFDVixNQUFBLENBQUMsQ0FBQyxXQUFELENBQUQsQ0FBZSxJQUFmLENBQW9CLElBQUksQ0FBQyxRQUF6QjtBQUNBLE1BQUEsQ0FBQyxDQUFDLGtCQUFELENBQUQsQ0FBc0IsSUFBdEIsQ0FBMkIsSUFBSSxDQUFDLFdBQUwsSUFBb0IsU0FBL0M7QUFDQSxNQUFBLENBQUMsQ0FBQyxhQUFELENBQUQsQ0FBaUIsSUFBakIsQ0FBc0IsS0FBdEIsb0JBQXdDLElBQUksQ0FBQyxNQUE3QztBQUNBLE1BQUEsQ0FBQyxDQUFDLGFBQUQsQ0FBRCxDQUFpQixHQUFqQixDQUFxQixrQkFBckIsd0JBQXdELElBQUksQ0FBQyxNQUE3RDtBQUNELEtBUE8sQ0FBUjtBQVFELEdBdkJIO0FBd0JELENBekJBLENBQUQ7O0FBNEJBLFNBQVMsUUFBVCxHQUFvQjtBQUNsQixFQUFBLEdBQUcsQ0FBQyxRQUFKO0FBQ0QiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCIkKCgpID0+IHtcbiAgd2luZG93LnJlYWR5KClcbiAgICAudGhlbigoKSA9PiB7XG4gICAgICBjb25zdCBsb2dvdXRCdXR0b24gPSAkKFwiLm5hdi1sb2dvdXRcIik7XG4gICAgICBjb25zdCBiYWNrQnV0dG9uID0gJChcIi5uYXYtYmFja1wiKTtcbiAgICAgIGxvZ291dEJ1dHRvbi5vbihcImNsaWNrXCIsICgpID0+IHtcbiAgICAgICAgbmtjQVBJKFwiL2xvZ291dFwiLCBcIkdFVFwiKVxuICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIGVtaXRFdmVudChcImxvZ291dFwiKTtcbiAgICAgICAgICB9KVxuICAgICAgICAgIC5jYXRjaChkYXRhID0+IHtcbiAgICAgICAgICAgIHNjcmVlblRvcFdhcm5pbmcoZGF0YSk7XG4gICAgICAgICAgfSlcbiAgICAgIH0pO1xuICAgICAgYmFja0J1dHRvbi5vbihcImNsaWNrXCIsIGNsb3NlV2luKTtcbiAgICAgIG5ld0V2ZW50KFwic3dpcGVsZWZ0XCIsIGNsb3NlV2luKTtcbiAgICAgIG5ld0V2ZW50KFwidXNlckNoYW5nZWRcIiwgKGRhdGEpID0+IHtcbiAgICAgICAgY29uc3Qge3VzZXJ9ID0gZGF0YTtcbiAgICAgICAgaWYoIXVzZXIpIHJldHVybjtcbiAgICAgICAgJChcIiN1c2VybmFtZVwiKS50ZXh0KHVzZXIudXNlcm5hbWUpO1xuICAgICAgICAkKFwiI3VzZXJEZXNjcmlwdGlvblwiKS50ZXh0KHVzZXIuZGVzY3JpcHRpb24gfHwgXCLmnKrloavlhpnkuKrkurrnroDku4tcIik7XG4gICAgICAgICQoXCIjdXNlckF2YXRhclwiKS5hdHRyKFwic3JjXCIsIGAvYXZhdGFyLyR7dXNlci5hdmF0YXJ9YCk7XG4gICAgICAgICQoXCIjdXNlckJhbm5lclwiKS5jc3MoXCJiYWNrZ3JvdW5kLWltYWdlXCIsIGB1cmwoL2Jhbm5lci8ke3VzZXIuYmFubmVyfSlgKTtcbiAgICAgIH0pO1xuICAgIH0pO1xufSk7XG5cblxuZnVuY3Rpb24gY2xvc2VXaW4oKSB7XG4gIGFwaS5jbG9zZVdpbigpO1xufVxuIl19
