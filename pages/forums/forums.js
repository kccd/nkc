(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

window.subscribeForum = function (sub, fid) {
  if (!window.SubscribeTypes) {
    window.SubscribeTypes = new NKC.modules.SubscribeTypes();
  }

  window.SubscribeTypes.subscribeForumPromise(fid, sub).then(function () {
    if (sub) {
      // 关注成功
      subscribed(fid);
    } else {
      // 取关成功
      unSubscribed(fid);
    }
  })["catch"](sweetError);
};

function subscribed(fid) {
  var button = $("div[data-button-fid='".concat(fid, "']"));
  var number = $("div[data-number-fid='".concat(fid, "']"));
  button.addClass("cancel").attr("onclick", "subscribeForum(false, '".concat(fid, "')")).text("取关");
  number.text(Number(number.eq(0).text() || 0) + 1);
  number.addClass("show");
  setTimeout(function () {
    number.addClass("move");
    setTimeout(function () {
      number.removeClass("show").removeClass("move");
    }, 2000);
  }, 500);
}

function unSubscribed(fid) {
  var button = $("div[data-button-fid='".concat(fid, "']"));
  var number = $("div[data-number-fid='".concat(fid, "']"));
  button.removeClass("cancel").attr("onclick", "subscribeForum(true, '".concat(fid, "')")).text("关注");
  var num = Number(number.eq(0).text() || 0);
  number.text(num ? num - 1 : num);
}

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9fYnJvd3Nlci1wYWNrQDYuMS4wQGJyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInBhZ2VzL2ZvcnVtcy9mb3J1bXMubWpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQSxNQUFNLENBQUMsY0FBUCxHQUF3QixVQUFDLEdBQUQsRUFBTSxHQUFOLEVBQWM7QUFDcEMsTUFBRyxDQUFDLE1BQU0sQ0FBQyxjQUFYLEVBQTJCO0FBQ3pCLElBQUEsTUFBTSxDQUFDLGNBQVAsR0FBd0IsSUFBSSxHQUFHLENBQUMsT0FBSixDQUFZLGNBQWhCLEVBQXhCO0FBQ0Q7O0FBQ0QsRUFBQSxNQUFNLENBQUMsY0FBUCxDQUFzQixxQkFBdEIsQ0FBNEMsR0FBNUMsRUFBaUQsR0FBakQsRUFDRyxJQURILENBQ1EsWUFBTTtBQUNWLFFBQUcsR0FBSCxFQUFRO0FBQ047QUFDQSxNQUFBLFVBQVUsQ0FBQyxHQUFELENBQVY7QUFDRCxLQUhELE1BR087QUFDTDtBQUNBLE1BQUEsWUFBWSxDQUFDLEdBQUQsQ0FBWjtBQUNEO0FBQ0YsR0FUSCxXQVVTLFVBVlQ7QUFXRCxDQWZEOztBQWlCQSxTQUFTLFVBQVQsQ0FBb0IsR0FBcEIsRUFBeUI7QUFDdkIsTUFBTSxNQUFNLEdBQUcsQ0FBQyxnQ0FBeUIsR0FBekIsUUFBaEI7QUFDQSxNQUFNLE1BQU0sR0FBRyxDQUFDLGdDQUF5QixHQUF6QixRQUFoQjtBQUNBLEVBQUEsTUFBTSxDQUFDLFFBQVAsQ0FBZ0IsUUFBaEIsRUFBMEIsSUFBMUIsQ0FBK0IsU0FBL0IsbUNBQW9FLEdBQXBFLFNBQTZFLElBQTdFLENBQWtGLElBQWxGO0FBQ0EsRUFBQSxNQUFNLENBQUMsSUFBUCxDQUFZLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBUCxDQUFVLENBQVYsRUFBYSxJQUFiLE1BQXVCLENBQXhCLENBQU4sR0FBbUMsQ0FBL0M7QUFDQSxFQUFBLE1BQU0sQ0FBQyxRQUFQLENBQWdCLE1BQWhCO0FBQ0EsRUFBQSxVQUFVLENBQUMsWUFBTTtBQUNmLElBQUEsTUFBTSxDQUFDLFFBQVAsQ0FBZ0IsTUFBaEI7QUFDQSxJQUFBLFVBQVUsQ0FBQyxZQUFNO0FBQ2YsTUFBQSxNQUFNLENBQUMsV0FBUCxDQUFtQixNQUFuQixFQUEyQixXQUEzQixDQUF1QyxNQUF2QztBQUNELEtBRlMsRUFFUCxJQUZPLENBQVY7QUFHRCxHQUxTLEVBS1AsR0FMTyxDQUFWO0FBTUQ7O0FBQ0QsU0FBUyxZQUFULENBQXNCLEdBQXRCLEVBQTJCO0FBQ3pCLE1BQU0sTUFBTSxHQUFHLENBQUMsZ0NBQXlCLEdBQXpCLFFBQWhCO0FBQ0EsTUFBTSxNQUFNLEdBQUcsQ0FBQyxnQ0FBeUIsR0FBekIsUUFBaEI7QUFDQSxFQUFBLE1BQU0sQ0FBQyxXQUFQLENBQW1CLFFBQW5CLEVBQTZCLElBQTdCLENBQWtDLFNBQWxDLGtDQUFzRSxHQUF0RSxTQUErRSxJQUEvRSxDQUFvRixJQUFwRjtBQUNBLE1BQU0sR0FBRyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBUCxDQUFVLENBQVYsRUFBYSxJQUFiLE1BQXVCLENBQXhCLENBQWxCO0FBQ0EsRUFBQSxNQUFNLENBQUMsSUFBUCxDQUFZLEdBQUcsR0FBRSxHQUFHLEdBQUcsQ0FBUixHQUFXLEdBQTFCO0FBQ0QiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJ3aW5kb3cuc3Vic2NyaWJlRm9ydW0gPSAoc3ViLCBmaWQpID0+IHtcbiAgaWYoIXdpbmRvdy5TdWJzY3JpYmVUeXBlcykge1xuICAgIHdpbmRvdy5TdWJzY3JpYmVUeXBlcyA9IG5ldyBOS0MubW9kdWxlcy5TdWJzY3JpYmVUeXBlcygpO1xuICB9XG4gIHdpbmRvdy5TdWJzY3JpYmVUeXBlcy5zdWJzY3JpYmVGb3J1bVByb21pc2UoZmlkLCBzdWIpXG4gICAgLnRoZW4oKCkgPT4ge1xuICAgICAgaWYoc3ViKSB7XG4gICAgICAgIC8vIOWFs+azqOaIkOWKn1xuICAgICAgICBzdWJzY3JpYmVkKGZpZCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyDlj5blhbPmiJDlip9cbiAgICAgICAgdW5TdWJzY3JpYmVkKGZpZCk7XG4gICAgICB9XG4gICAgfSlcbiAgICAuY2F0Y2goc3dlZXRFcnJvcik7XG59O1xuXG5mdW5jdGlvbiBzdWJzY3JpYmVkKGZpZCkge1xuICBjb25zdCBidXR0b24gPSAkKGBkaXZbZGF0YS1idXR0b24tZmlkPScke2ZpZH0nXWApO1xuICBjb25zdCBudW1iZXIgPSAkKGBkaXZbZGF0YS1udW1iZXItZmlkPScke2ZpZH0nXWApO1xuICBidXR0b24uYWRkQ2xhc3MoXCJjYW5jZWxcIikuYXR0cihcIm9uY2xpY2tcIiwgYHN1YnNjcmliZUZvcnVtKGZhbHNlLCAnJHtmaWR9JylgKS50ZXh0KFwi5Y+W5YWzXCIpO1xuICBudW1iZXIudGV4dChOdW1iZXIobnVtYmVyLmVxKDApLnRleHQoKSB8fCAwKSArIDEpO1xuICBudW1iZXIuYWRkQ2xhc3MoXCJzaG93XCIpO1xuICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICBudW1iZXIuYWRkQ2xhc3MoXCJtb3ZlXCIpO1xuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgbnVtYmVyLnJlbW92ZUNsYXNzKFwic2hvd1wiKS5yZW1vdmVDbGFzcyhcIm1vdmVcIik7XG4gICAgfSwgMjAwMCk7XG4gIH0sIDUwMClcbn1cbmZ1bmN0aW9uIHVuU3Vic2NyaWJlZChmaWQpIHtcbiAgY29uc3QgYnV0dG9uID0gJChgZGl2W2RhdGEtYnV0dG9uLWZpZD0nJHtmaWR9J11gKTtcbiAgY29uc3QgbnVtYmVyID0gJChgZGl2W2RhdGEtbnVtYmVyLWZpZD0nJHtmaWR9J11gKTtcbiAgYnV0dG9uLnJlbW92ZUNsYXNzKFwiY2FuY2VsXCIpLmF0dHIoXCJvbmNsaWNrXCIsIGBzdWJzY3JpYmVGb3J1bSh0cnVlLCAnJHtmaWR9JylgKS50ZXh0KFwi5YWz5rOoXCIpO1xuICBjb25zdCBudW0gPSBOdW1iZXIobnVtYmVyLmVxKDApLnRleHQoKSB8fCAwKTtcbiAgbnVtYmVyLnRleHQobnVtPyBudW0gLSAxOiBudW0pO1xufVxuXG4iXX0=
