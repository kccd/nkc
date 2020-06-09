(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

window.disableNote = function (id, disable) {
  nkcAPI("/nkc/note", "POST", {
    type: disable ? "disable" : "cancelDisable",
    noteContentId: id
  }).then(function () {
    window.location.reload();
  })["catch"](sweetError);
};

window.editNote = function (id, content) {
  if (!window.commonModal) {
    window.commonModal = new NKC.modules.CommonModal();
  }

  window.commonModal.open(function (data) {
    nkcAPI("/nkc/note", "POST", {
      type: "modify",
      noteContentId: id,
      content: data[0].value
    }).then(function () {
      window.commonModal.close();
      window.location.reload();
    })["catch"](sweetError);
  }, {
    title: "编辑笔记",
    data: [{
      dom: "textarea",
      value: NKC.methods.strToObj(content).content
    }]
  });
};

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9fYnJvd3Nlci1wYWNrQDYuMS4wQGJyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInBhZ2VzL25rYy9ub3RlL25vdGUubWpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQSxNQUFNLENBQUMsV0FBUCxHQUFxQixVQUFDLEVBQUQsRUFBSyxPQUFMLEVBQWlCO0FBQ3BDLEVBQUEsTUFBTSxjQUFjLE1BQWQsRUFBc0I7QUFDMUIsSUFBQSxJQUFJLEVBQUUsT0FBTyxHQUFFLFNBQUYsR0FBYSxlQURBO0FBRTFCLElBQUEsYUFBYSxFQUFFO0FBRlcsR0FBdEIsQ0FBTixDQUlHLElBSkgsQ0FJUSxZQUFNO0FBQ1YsSUFBQSxNQUFNLENBQUMsUUFBUCxDQUFnQixNQUFoQjtBQUNELEdBTkgsV0FPUyxVQVBUO0FBUUQsQ0FURDs7QUFVQSxNQUFNLENBQUMsUUFBUCxHQUFrQixVQUFDLEVBQUQsRUFBSyxPQUFMLEVBQWlCO0FBQ2pDLE1BQUcsQ0FBQyxNQUFNLENBQUMsV0FBWCxFQUF3QjtBQUN0QixJQUFBLE1BQU0sQ0FBQyxXQUFQLEdBQXFCLElBQUksR0FBRyxDQUFDLE9BQUosQ0FBWSxXQUFoQixFQUFyQjtBQUNEOztBQUNELEVBQUEsTUFBTSxDQUFDLFdBQVAsQ0FBbUIsSUFBbkIsQ0FBd0IsVUFBQSxJQUFJLEVBQUk7QUFDOUIsSUFBQSxNQUFNLENBQUMsV0FBRCxFQUFjLE1BQWQsRUFBc0I7QUFDMUIsTUFBQSxJQUFJLEVBQUUsUUFEb0I7QUFFMUIsTUFBQSxhQUFhLEVBQUUsRUFGVztBQUcxQixNQUFBLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBRCxDQUFKLENBQVE7QUFIUyxLQUF0QixDQUFOLENBS0csSUFMSCxDQUtRLFlBQU07QUFDVixNQUFBLE1BQU0sQ0FBQyxXQUFQLENBQW1CLEtBQW5CO0FBQ0EsTUFBQSxNQUFNLENBQUMsUUFBUCxDQUFnQixNQUFoQjtBQUNELEtBUkgsV0FTUyxVQVRUO0FBVUQsR0FYRCxFQVdHO0FBQ0QsSUFBQSxLQUFLLEVBQUUsTUFETjtBQUVELElBQUEsSUFBSSxFQUFFLENBQ0o7QUFDRSxNQUFBLEdBQUcsRUFBRSxVQURQO0FBRUUsTUFBQSxLQUFLLEVBQUUsR0FBRyxDQUFDLE9BQUosQ0FBWSxRQUFaLENBQXFCLE9BQXJCLEVBQThCO0FBRnZDLEtBREk7QUFGTCxHQVhIO0FBb0JELENBeEJEIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwid2luZG93LmRpc2FibGVOb3RlID0gKGlkLCBkaXNhYmxlKSA9PiB7XG4gIG5rY0FQSShgL25rYy9ub3RlYCwgXCJQT1NUXCIsIHtcbiAgICB0eXBlOiBkaXNhYmxlPyBcImRpc2FibGVcIjogXCJjYW5jZWxEaXNhYmxlXCIsXG4gICAgbm90ZUNvbnRlbnRJZDogaWRcbiAgfSlcbiAgICAudGhlbigoKSA9PiB7XG4gICAgICB3aW5kb3cubG9jYXRpb24ucmVsb2FkKCk7XG4gICAgfSlcbiAgICAuY2F0Y2goc3dlZXRFcnJvcilcbn07XG53aW5kb3cuZWRpdE5vdGUgPSAoaWQsIGNvbnRlbnQpID0+IHtcbiAgaWYoIXdpbmRvdy5jb21tb25Nb2RhbCkge1xuICAgIHdpbmRvdy5jb21tb25Nb2RhbCA9IG5ldyBOS0MubW9kdWxlcy5Db21tb25Nb2RhbCgpO1xuICB9XG4gIHdpbmRvdy5jb21tb25Nb2RhbC5vcGVuKGRhdGEgPT4ge1xuICAgIG5rY0FQSShcIi9ua2Mvbm90ZVwiLCBcIlBPU1RcIiwge1xuICAgICAgdHlwZTogXCJtb2RpZnlcIixcbiAgICAgIG5vdGVDb250ZW50SWQ6IGlkLFxuICAgICAgY29udGVudDogZGF0YVswXS52YWx1ZVxuICAgIH0pXG4gICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgIHdpbmRvdy5jb21tb25Nb2RhbC5jbG9zZSgpO1xuICAgICAgICB3aW5kb3cubG9jYXRpb24ucmVsb2FkKCk7XG4gICAgICB9KVxuICAgICAgLmNhdGNoKHN3ZWV0RXJyb3IpXG4gIH0sIHtcbiAgICB0aXRsZTogXCLnvJbovpHnrJTorrBcIixcbiAgICBkYXRhOiBbXG4gICAgICB7XG4gICAgICAgIGRvbTogXCJ0ZXh0YXJlYVwiLFxuICAgICAgICB2YWx1ZTogTktDLm1ldGhvZHMuc3RyVG9PYmooY29udGVudCkuY29udGVudFxuICAgICAgfVxuICAgIF1cbiAgfSk7XG59OyJdfQ==
