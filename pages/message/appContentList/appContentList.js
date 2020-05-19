(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

var data = NKC.methods.getDataById('data');
console.log(data.messages);
var app = new Vue({
  el: '#container',
  data: {
    inputContainerHeight: 5,
    messages: data.messages,
    content: ''
  },
  methods: {
    timeFormat: NKC.methods.timeFormat,
    getUrl: NKC.methods.tools.getUrl,
    visitImages: function visitImages(url) {
      var urls = [];
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this.messages[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var m = _step.value;

          if (m.contentType === 'img') {
            urls.push({
              name: m.content.filename,
              url: m.content.fileUrl
            });
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator["return"] != null) {
            _iterator["return"]();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      urls.reverse();
      var index = urls.map(function (u) {
        return u.url;
      }).indexOf(url);
      urls.map(function (u) {
        return u.url = location.origin + u.url;
      });
      NKC.methods.rn.emit('viewImage', {
        index: index,
        urls: urls
      });
    },
    openUserHome: function openUserHome(uid) {
      NKC.methods.rn.emit('openNewPage', {
        href: location.origin + this.getUrl('userHome', uid)
      });
    }
  },
  computed: {
    inputContainerStyle: function inputContainerStyle() {
      return "height: ".concat(this.inputContainerHeight, "rem;");
    },
    listContainerStyle: function listContainerStyle() {
      return "padding-bottom: ".concat(this.inputContainerHeight, "rem;");
    }
  }
});

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9fYnJvd3Nlci1wYWNrQDYuMS4wQGJyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInBhZ2VzL21lc3NhZ2UvYXBwQ29udGVudExpc3QvYXBwQ29udGVudExpc3QubWpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQSxJQUFNLElBQUksR0FBRyxHQUFHLENBQUMsT0FBSixDQUFZLFdBQVosQ0FBd0IsTUFBeEIsQ0FBYjtBQUNBLE9BQU8sQ0FBQyxHQUFSLENBQVksSUFBSSxDQUFDLFFBQWpCO0FBQ0EsSUFBTSxHQUFHLEdBQUcsSUFBSSxHQUFKLENBQVE7QUFDbEIsRUFBQSxFQUFFLEVBQUUsWUFEYztBQUVsQixFQUFBLElBQUksRUFBRTtBQUNKLElBQUEsb0JBQW9CLEVBQUUsQ0FEbEI7QUFFSixJQUFBLFFBQVEsRUFBRSxJQUFJLENBQUMsUUFGWDtBQUdKLElBQUEsT0FBTyxFQUFFO0FBSEwsR0FGWTtBQU9sQixFQUFBLE9BQU8sRUFBRTtBQUNQLElBQUEsVUFBVSxFQUFFLEdBQUcsQ0FBQyxPQUFKLENBQVksVUFEakI7QUFFUCxJQUFBLE1BQU0sRUFBRSxHQUFHLENBQUMsT0FBSixDQUFZLEtBQVosQ0FBa0IsTUFGbkI7QUFHUCxJQUFBLFdBSE8sdUJBR0ssR0FITCxFQUdVO0FBQ2YsVUFBSSxJQUFJLEdBQUcsRUFBWDtBQURlO0FBQUE7QUFBQTs7QUFBQTtBQUVmLDZCQUFlLEtBQUssUUFBcEIsOEhBQThCO0FBQUEsY0FBcEIsQ0FBb0I7O0FBQzVCLGNBQUcsQ0FBQyxDQUFDLFdBQUYsS0FBa0IsS0FBckIsRUFBNEI7QUFDMUIsWUFBQSxJQUFJLENBQUMsSUFBTCxDQUFVO0FBQ1IsY0FBQSxJQUFJLEVBQUUsQ0FBQyxDQUFDLE9BQUYsQ0FBVSxRQURSO0FBRVIsY0FBQSxHQUFHLEVBQUUsQ0FBQyxDQUFDLE9BQUYsQ0FBVTtBQUZQLGFBQVY7QUFJRDtBQUNGO0FBVGM7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFVZixNQUFBLElBQUksQ0FBQyxPQUFMO0FBQ0EsVUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLEdBQUwsQ0FBUyxVQUFBLENBQUM7QUFBQSxlQUFJLENBQUMsQ0FBQyxHQUFOO0FBQUEsT0FBVixFQUFxQixPQUFyQixDQUE2QixHQUE3QixDQUFkO0FBQ0EsTUFBQSxJQUFJLENBQUMsR0FBTCxDQUFTLFVBQUEsQ0FBQztBQUFBLGVBQUksQ0FBQyxDQUFDLEdBQUYsR0FBUSxRQUFRLENBQUMsTUFBVCxHQUFrQixDQUFDLENBQUMsR0FBaEM7QUFBQSxPQUFWO0FBQ0EsTUFBQSxHQUFHLENBQUMsT0FBSixDQUFZLEVBQVosQ0FBZSxJQUFmLENBQW9CLFdBQXBCLEVBQWlDO0FBQy9CLFFBQUEsS0FBSyxFQUFMLEtBRCtCO0FBRS9CLFFBQUEsSUFBSSxFQUFKO0FBRitCLE9BQWpDO0FBSUQsS0FwQk07QUFxQlAsSUFBQSxZQXJCTyx3QkFxQk0sR0FyQk4sRUFxQlc7QUFDaEIsTUFBQSxHQUFHLENBQUMsT0FBSixDQUFZLEVBQVosQ0FBZSxJQUFmLENBQW9CLGFBQXBCLEVBQW1DO0FBQ2pDLFFBQUEsSUFBSSxFQUFFLFFBQVEsQ0FBQyxNQUFULEdBQWtCLEtBQUssTUFBTCxDQUFZLFVBQVosRUFBd0IsR0FBeEI7QUFEUyxPQUFuQztBQUdEO0FBekJNLEdBUFM7QUFrQ2xCLEVBQUEsUUFBUSxFQUFFO0FBQ1IsSUFBQSxtQkFEUSxpQ0FDYztBQUNwQiwrQkFBa0IsS0FBSyxvQkFBdkI7QUFDRCxLQUhPO0FBSVIsSUFBQSxrQkFKUSxnQ0FJYTtBQUNuQix1Q0FBMEIsS0FBSyxvQkFBL0I7QUFDRDtBQU5PO0FBbENRLENBQVIsQ0FBWiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsImNvbnN0IGRhdGEgPSBOS0MubWV0aG9kcy5nZXREYXRhQnlJZCgnZGF0YScpO1xyXG5jb25zb2xlLmxvZyhkYXRhLm1lc3NhZ2VzKTtcclxuY29uc3QgYXBwID0gbmV3IFZ1ZSh7XHJcbiAgZWw6ICcjY29udGFpbmVyJyxcclxuICBkYXRhOiB7XHJcbiAgICBpbnB1dENvbnRhaW5lckhlaWdodDogNSxcclxuICAgIG1lc3NhZ2VzOiBkYXRhLm1lc3NhZ2VzLFxyXG4gICAgY29udGVudDogJydcclxuICB9LFxyXG4gIG1ldGhvZHM6IHtcclxuICAgIHRpbWVGb3JtYXQ6IE5LQy5tZXRob2RzLnRpbWVGb3JtYXQsXHJcbiAgICBnZXRVcmw6IE5LQy5tZXRob2RzLnRvb2xzLmdldFVybCxcclxuICAgIHZpc2l0SW1hZ2VzKHVybCkge1xyXG4gICAgICBsZXQgdXJscyA9IFtdO1xyXG4gICAgICBmb3IoY29uc3QgbSBvZiB0aGlzLm1lc3NhZ2VzKSB7XHJcbiAgICAgICAgaWYobS5jb250ZW50VHlwZSA9PT0gJ2ltZycpIHtcclxuICAgICAgICAgIHVybHMucHVzaCh7XHJcbiAgICAgICAgICAgIG5hbWU6IG0uY29udGVudC5maWxlbmFtZSxcclxuICAgICAgICAgICAgdXJsOiBtLmNvbnRlbnQuZmlsZVVybFxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIHVybHMucmV2ZXJzZSgpO1xyXG4gICAgICBjb25zdCBpbmRleCA9IHVybHMubWFwKHUgPT4gdS51cmwpLmluZGV4T2YodXJsKTtcclxuICAgICAgdXJscy5tYXAodSA9PiB1LnVybCA9IGxvY2F0aW9uLm9yaWdpbiArIHUudXJsKTtcclxuICAgICAgTktDLm1ldGhvZHMucm4uZW1pdCgndmlld0ltYWdlJywge1xyXG4gICAgICAgIGluZGV4LFxyXG4gICAgICAgIHVybHNcclxuICAgICAgfSlcclxuICAgIH0sXHJcbiAgICBvcGVuVXNlckhvbWUodWlkKSB7XHJcbiAgICAgIE5LQy5tZXRob2RzLnJuLmVtaXQoJ29wZW5OZXdQYWdlJywge1xyXG4gICAgICAgIGhyZWY6IGxvY2F0aW9uLm9yaWdpbiArIHRoaXMuZ2V0VXJsKCd1c2VySG9tZScsIHVpZClcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfSxcclxuICBjb21wdXRlZDoge1xyXG4gICAgaW5wdXRDb250YWluZXJTdHlsZSgpIHtcclxuICAgICAgcmV0dXJuIGBoZWlnaHQ6ICR7dGhpcy5pbnB1dENvbnRhaW5lckhlaWdodH1yZW07YFxyXG4gICAgfSxcclxuICAgIGxpc3RDb250YWluZXJTdHlsZSgpIHtcclxuICAgICAgcmV0dXJuIGBwYWRkaW5nLWJvdHRvbTogJHt0aGlzLmlucHV0Q29udGFpbmVySGVpZ2h0fXJlbTtgXHJcbiAgICB9XHJcbiAgfVxyXG59KVxyXG4iXX0=
