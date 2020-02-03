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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwYWdlcy9hcHAvbmF2L25hdi5tanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBLENBQUMsQ0FBQyxZQUFNO0FBQ04sRUFBQSxNQUFNLENBQUMsS0FBUCxHQUNHLElBREgsQ0FDUSxZQUFNO0FBQ1YsUUFBTSxZQUFZLEdBQUcsQ0FBQyxDQUFDLGFBQUQsQ0FBdEI7QUFDQSxRQUFNLFVBQVUsR0FBRyxDQUFDLENBQUMsV0FBRCxDQUFwQjtBQUNBLElBQUEsWUFBWSxDQUFDLEVBQWIsQ0FBZ0IsT0FBaEIsRUFBeUIsWUFBTTtBQUM3QixNQUFBLE1BQU0sQ0FBQyxTQUFELEVBQVksS0FBWixDQUFOLENBQ0csSUFESCxDQUNRLFlBQU07QUFDVixRQUFBLFNBQVMsQ0FBQyxRQUFELENBQVQ7QUFDRCxPQUhILFdBSVMsVUFBQSxJQUFJLEVBQUk7QUFDYixRQUFBLGdCQUFnQixDQUFDLElBQUQsQ0FBaEI7QUFDRCxPQU5IO0FBT0QsS0FSRDtBQVNBLElBQUEsVUFBVSxDQUFDLEVBQVgsQ0FBYyxPQUFkLEVBQXVCLFFBQXZCO0FBQ0EsSUFBQSxRQUFRLENBQUMsV0FBRCxFQUFjLFFBQWQsQ0FBUjtBQUNBLElBQUEsUUFBUSxDQUFDLGFBQUQsRUFBZ0IsVUFBQyxJQUFELEVBQVU7QUFBQSxVQUN6QixJQUR5QixHQUNqQixJQURpQixDQUN6QixJQUR5QjtBQUVoQyxVQUFHLENBQUMsSUFBSixFQUFVO0FBQ1YsTUFBQSxDQUFDLENBQUMsV0FBRCxDQUFELENBQWUsSUFBZixDQUFvQixJQUFJLENBQUMsUUFBekI7QUFDQSxNQUFBLENBQUMsQ0FBQyxrQkFBRCxDQUFELENBQXNCLElBQXRCLENBQTJCLElBQUksQ0FBQyxXQUFMLElBQW9CLFNBQS9DO0FBQ0EsTUFBQSxDQUFDLENBQUMsYUFBRCxDQUFELENBQWlCLElBQWpCLENBQXNCLEtBQXRCLG9CQUF3QyxJQUFJLENBQUMsTUFBN0M7QUFDQSxNQUFBLENBQUMsQ0FBQyxhQUFELENBQUQsQ0FBaUIsR0FBakIsQ0FBcUIsa0JBQXJCLHdCQUF3RCxJQUFJLENBQUMsTUFBN0Q7QUFDRCxLQVBPLENBQVI7QUFRRCxHQXZCSDtBQXdCRCxDQXpCQSxDQUFEOztBQTRCQSxTQUFTLFFBQVQsR0FBb0I7QUFDbEIsRUFBQSxHQUFHLENBQUMsUUFBSjtBQUNEIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiJCgoKSA9PiB7XHJcbiAgd2luZG93LnJlYWR5KClcclxuICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgY29uc3QgbG9nb3V0QnV0dG9uID0gJChcIi5uYXYtbG9nb3V0XCIpO1xyXG4gICAgICBjb25zdCBiYWNrQnV0dG9uID0gJChcIi5uYXYtYmFja1wiKTtcclxuICAgICAgbG9nb3V0QnV0dG9uLm9uKFwiY2xpY2tcIiwgKCkgPT4ge1xyXG4gICAgICAgIG5rY0FQSShcIi9sb2dvdXRcIiwgXCJHRVRcIilcclxuICAgICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgZW1pdEV2ZW50KFwibG9nb3V0XCIpO1xyXG4gICAgICAgICAgfSlcclxuICAgICAgICAgIC5jYXRjaChkYXRhID0+IHtcclxuICAgICAgICAgICAgc2NyZWVuVG9wV2FybmluZyhkYXRhKTtcclxuICAgICAgICAgIH0pXHJcbiAgICAgIH0pO1xyXG4gICAgICBiYWNrQnV0dG9uLm9uKFwiY2xpY2tcIiwgY2xvc2VXaW4pO1xyXG4gICAgICBuZXdFdmVudChcInN3aXBlbGVmdFwiLCBjbG9zZVdpbik7XHJcbiAgICAgIG5ld0V2ZW50KFwidXNlckNoYW5nZWRcIiwgKGRhdGEpID0+IHtcclxuICAgICAgICBjb25zdCB7dXNlcn0gPSBkYXRhO1xyXG4gICAgICAgIGlmKCF1c2VyKSByZXR1cm47XHJcbiAgICAgICAgJChcIiN1c2VybmFtZVwiKS50ZXh0KHVzZXIudXNlcm5hbWUpO1xyXG4gICAgICAgICQoXCIjdXNlckRlc2NyaXB0aW9uXCIpLnRleHQodXNlci5kZXNjcmlwdGlvbiB8fCBcIuacquWhq+WGmeS4quS6uueugOS7i1wiKTtcclxuICAgICAgICAkKFwiI3VzZXJBdmF0YXJcIikuYXR0cihcInNyY1wiLCBgL2F2YXRhci8ke3VzZXIuYXZhdGFyfWApO1xyXG4gICAgICAgICQoXCIjdXNlckJhbm5lclwiKS5jc3MoXCJiYWNrZ3JvdW5kLWltYWdlXCIsIGB1cmwoL2Jhbm5lci8ke3VzZXIuYmFubmVyfSlgKTtcclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxufSk7XHJcblxyXG5cclxuZnVuY3Rpb24gY2xvc2VXaW4oKSB7XHJcbiAgYXBpLmNsb3NlV2luKCk7XHJcbn1cclxuIl19
