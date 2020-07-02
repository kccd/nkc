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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwYWdlcy9mb3J1bXMvZm9ydW1zLm1qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUEsTUFBTSxDQUFDLGNBQVAsR0FBd0IsVUFBQyxHQUFELEVBQU0sR0FBTixFQUFjO0FBQ3BDLE1BQUcsQ0FBQyxNQUFNLENBQUMsY0FBWCxFQUEyQjtBQUN6QixJQUFBLE1BQU0sQ0FBQyxjQUFQLEdBQXdCLElBQUksR0FBRyxDQUFDLE9BQUosQ0FBWSxjQUFoQixFQUF4QjtBQUNEOztBQUNELEVBQUEsTUFBTSxDQUFDLGNBQVAsQ0FBc0IscUJBQXRCLENBQTRDLEdBQTVDLEVBQWlELEdBQWpELEVBQ0csSUFESCxDQUNRLFlBQU07QUFDVixRQUFHLEdBQUgsRUFBUTtBQUNOO0FBQ0EsTUFBQSxVQUFVLENBQUMsR0FBRCxDQUFWO0FBQ0QsS0FIRCxNQUdPO0FBQ0w7QUFDQSxNQUFBLFlBQVksQ0FBQyxHQUFELENBQVo7QUFDRDtBQUNGLEdBVEgsV0FVUyxVQVZUO0FBV0QsQ0FmRDs7QUFpQkEsU0FBUyxVQUFULENBQW9CLEdBQXBCLEVBQXlCO0FBQ3ZCLE1BQU0sTUFBTSxHQUFHLENBQUMsZ0NBQXlCLEdBQXpCLFFBQWhCO0FBQ0EsTUFBTSxNQUFNLEdBQUcsQ0FBQyxnQ0FBeUIsR0FBekIsUUFBaEI7QUFDQSxFQUFBLE1BQU0sQ0FBQyxRQUFQLENBQWdCLFFBQWhCLEVBQTBCLElBQTFCLENBQStCLFNBQS9CLG1DQUFvRSxHQUFwRSxTQUE2RSxJQUE3RSxDQUFrRixJQUFsRjtBQUNBLEVBQUEsTUFBTSxDQUFDLElBQVAsQ0FBWSxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQVAsQ0FBVSxDQUFWLEVBQWEsSUFBYixNQUF1QixDQUF4QixDQUFOLEdBQW1DLENBQS9DO0FBQ0EsRUFBQSxNQUFNLENBQUMsUUFBUCxDQUFnQixNQUFoQjtBQUNBLEVBQUEsVUFBVSxDQUFDLFlBQU07QUFDZixJQUFBLE1BQU0sQ0FBQyxRQUFQLENBQWdCLE1BQWhCO0FBQ0EsSUFBQSxVQUFVLENBQUMsWUFBTTtBQUNmLE1BQUEsTUFBTSxDQUFDLFdBQVAsQ0FBbUIsTUFBbkIsRUFBMkIsV0FBM0IsQ0FBdUMsTUFBdkM7QUFDRCxLQUZTLEVBRVAsSUFGTyxDQUFWO0FBR0QsR0FMUyxFQUtQLEdBTE8sQ0FBVjtBQU1EOztBQUNELFNBQVMsWUFBVCxDQUFzQixHQUF0QixFQUEyQjtBQUN6QixNQUFNLE1BQU0sR0FBRyxDQUFDLGdDQUF5QixHQUF6QixRQUFoQjtBQUNBLE1BQU0sTUFBTSxHQUFHLENBQUMsZ0NBQXlCLEdBQXpCLFFBQWhCO0FBQ0EsRUFBQSxNQUFNLENBQUMsV0FBUCxDQUFtQixRQUFuQixFQUE2QixJQUE3QixDQUFrQyxTQUFsQyxrQ0FBc0UsR0FBdEUsU0FBK0UsSUFBL0UsQ0FBb0YsSUFBcEY7QUFDQSxNQUFNLEdBQUcsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQVAsQ0FBVSxDQUFWLEVBQWEsSUFBYixNQUF1QixDQUF4QixDQUFsQjtBQUNBLEVBQUEsTUFBTSxDQUFDLElBQVAsQ0FBWSxHQUFHLEdBQUUsR0FBRyxHQUFHLENBQVIsR0FBVyxHQUExQjtBQUNEIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwid2luZG93LnN1YnNjcmliZUZvcnVtID0gKHN1YiwgZmlkKSA9PiB7XHJcbiAgaWYoIXdpbmRvdy5TdWJzY3JpYmVUeXBlcykge1xyXG4gICAgd2luZG93LlN1YnNjcmliZVR5cGVzID0gbmV3IE5LQy5tb2R1bGVzLlN1YnNjcmliZVR5cGVzKCk7XHJcbiAgfVxyXG4gIHdpbmRvdy5TdWJzY3JpYmVUeXBlcy5zdWJzY3JpYmVGb3J1bVByb21pc2UoZmlkLCBzdWIpXHJcbiAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgIGlmKHN1Yikge1xyXG4gICAgICAgIC8vIOWFs+azqOaIkOWKn1xyXG4gICAgICAgIHN1YnNjcmliZWQoZmlkKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICAvLyDlj5blhbPmiJDlip9cclxuICAgICAgICB1blN1YnNjcmliZWQoZmlkKTtcclxuICAgICAgfVxyXG4gICAgfSlcclxuICAgIC5jYXRjaChzd2VldEVycm9yKTtcclxufTtcclxuXHJcbmZ1bmN0aW9uIHN1YnNjcmliZWQoZmlkKSB7XHJcbiAgY29uc3QgYnV0dG9uID0gJChgZGl2W2RhdGEtYnV0dG9uLWZpZD0nJHtmaWR9J11gKTtcclxuICBjb25zdCBudW1iZXIgPSAkKGBkaXZbZGF0YS1udW1iZXItZmlkPScke2ZpZH0nXWApO1xyXG4gIGJ1dHRvbi5hZGRDbGFzcyhcImNhbmNlbFwiKS5hdHRyKFwib25jbGlja1wiLCBgc3Vic2NyaWJlRm9ydW0oZmFsc2UsICcke2ZpZH0nKWApLnRleHQoXCLlj5blhbNcIik7XHJcbiAgbnVtYmVyLnRleHQoTnVtYmVyKG51bWJlci5lcSgwKS50ZXh0KCkgfHwgMCkgKyAxKTtcclxuICBudW1iZXIuYWRkQ2xhc3MoXCJzaG93XCIpO1xyXG4gIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgbnVtYmVyLmFkZENsYXNzKFwibW92ZVwiKTtcclxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICBudW1iZXIucmVtb3ZlQ2xhc3MoXCJzaG93XCIpLnJlbW92ZUNsYXNzKFwibW92ZVwiKTtcclxuICAgIH0sIDIwMDApO1xyXG4gIH0sIDUwMClcclxufVxyXG5mdW5jdGlvbiB1blN1YnNjcmliZWQoZmlkKSB7XHJcbiAgY29uc3QgYnV0dG9uID0gJChgZGl2W2RhdGEtYnV0dG9uLWZpZD0nJHtmaWR9J11gKTtcclxuICBjb25zdCBudW1iZXIgPSAkKGBkaXZbZGF0YS1udW1iZXItZmlkPScke2ZpZH0nXWApO1xyXG4gIGJ1dHRvbi5yZW1vdmVDbGFzcyhcImNhbmNlbFwiKS5hdHRyKFwib25jbGlja1wiLCBgc3Vic2NyaWJlRm9ydW0odHJ1ZSwgJyR7ZmlkfScpYCkudGV4dChcIuWFs+azqFwiKTtcclxuICBjb25zdCBudW0gPSBOdW1iZXIobnVtYmVyLmVxKDApLnRleHQoKSB8fCAwKTtcclxuICBudW1iZXIudGV4dChudW0/IG51bSAtIDE6IG51bSk7XHJcbn1cclxuXHJcbiJdfQ==
