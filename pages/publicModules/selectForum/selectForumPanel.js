(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

NKC.modules.SelectForumPanel = /*#__PURE__*/function () {
  function _class() {
    _classCallCheck(this, _class);

    this.domId = "forum_".concat(Date.now());
    this.app = null;
    this.layerIndex = null;
    this.layer = null;
  }

  _createClass(_class, [{
    key: "open",
    value: function open() {
      var self = this;

      if (self.layer) {
        return layer.setTop(self.layer);
      }

      self.layerIndex = layer.open({
        type: 1,
        shade: 0,
        offset: '100px',
        maxWidth: '100%',
        maxmin: true,
        zIndex: layer.zIndex,
        resize: false,
        success: function success(layero) {
          self.layer = layero;
          layer.setTop(layero);
          self.app = new Vue({
            el: "#" + self.domId,
            data: {
              name: '这是一个可以重要也可以不重要的方法，重要的是，它的权利真的很大，尤其是在模块化加载layer时，你会发现你必须要用到它。它不仅可以配置一些诸如路径、加载的模块，甚至还可以决定整个弹层的默认参数。而说它不重要，是因为多数情况下，你会发现，你似乎不是那么十分需要它。但你真的需要认识一下这位伙计。'
            }
          });
        },
        end: function end() {
          if (self.app) self.app.$destroy();
          delete self.layer;
        },
        title: '选择专业',
        content: "<div id=\"".concat(self.domId, "\" class=\"nkc-layer-md\">").concat($('#layerSelectForum').html(), "</div>")
      });
    }
  }, {
    key: "close",
    value: function close() {
      layer.close(this.layerIndex);
    }
  }]);

  return _class;
}();

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwYWdlcy9wdWJsaWNNb2R1bGVzL3NlbGVjdEZvcnVtL3NlbGVjdEZvcnVtUGFuZWwubWpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7QUNBQSxHQUFHLENBQUMsT0FBSixDQUFZLGdCQUFaO0FBQ0Usb0JBQWM7QUFBQTs7QUFDWixTQUFLLEtBQUwsbUJBQXNCLElBQUksQ0FBQyxHQUFMLEVBQXRCO0FBQ0EsU0FBSyxHQUFMLEdBQVcsSUFBWDtBQUNBLFNBQUssVUFBTCxHQUFrQixJQUFsQjtBQUNBLFNBQUssS0FBTCxHQUFhLElBQWI7QUFDRDs7QUFOSDtBQUFBO0FBQUEsMkJBT1M7QUFDTCxVQUFNLElBQUksR0FBRyxJQUFiOztBQUNBLFVBQUcsSUFBSSxDQUFDLEtBQVIsRUFBZTtBQUNiLGVBQU8sS0FBSyxDQUFDLE1BQU4sQ0FBYSxJQUFJLENBQUMsS0FBbEIsQ0FBUDtBQUNEOztBQUNELE1BQUEsSUFBSSxDQUFDLFVBQUwsR0FBa0IsS0FBSyxDQUFDLElBQU4sQ0FBVztBQUMzQixRQUFBLElBQUksRUFBRSxDQURxQjtBQUUzQixRQUFBLEtBQUssRUFBRSxDQUZvQjtBQUczQixRQUFBLE1BQU0sRUFBRSxPQUhtQjtBQUkzQixRQUFBLFFBQVEsRUFBRSxNQUppQjtBQUszQixRQUFBLE1BQU0sRUFBRSxJQUxtQjtBQU0zQixRQUFBLE1BQU0sRUFBRSxLQUFLLENBQUMsTUFOYTtBQU8zQixRQUFBLE1BQU0sRUFBRSxLQVBtQjtBQVEzQixRQUFBLE9BQU8sRUFBRSxpQkFBUyxNQUFULEVBQWlCO0FBQ3hCLFVBQUEsSUFBSSxDQUFDLEtBQUwsR0FBYSxNQUFiO0FBQ0EsVUFBQSxLQUFLLENBQUMsTUFBTixDQUFhLE1BQWI7QUFDQSxVQUFBLElBQUksQ0FBQyxHQUFMLEdBQVcsSUFBSSxHQUFKLENBQVE7QUFDakIsWUFBQSxFQUFFLEVBQUUsTUFBTSxJQUFJLENBQUMsS0FERTtBQUVqQixZQUFBLElBQUksRUFBRTtBQUNKLGNBQUEsSUFBSSxFQUFFO0FBREY7QUFGVyxXQUFSLENBQVg7QUFNRCxTQWpCMEI7QUFrQjNCLFFBQUEsR0FBRyxFQUFFLGVBQVc7QUFDZCxjQUFHLElBQUksQ0FBQyxHQUFSLEVBQWEsSUFBSSxDQUFDLEdBQUwsQ0FBUyxRQUFUO0FBQ2IsaUJBQU8sSUFBSSxDQUFDLEtBQVo7QUFDRCxTQXJCMEI7QUFzQjNCLFFBQUEsS0FBSyxFQUFFLE1BdEJvQjtBQXVCM0IsUUFBQSxPQUFPLHNCQUFjLElBQUksQ0FBQyxLQUFuQix1Q0FBa0QsQ0FBQyxDQUFDLG1CQUFELENBQUQsQ0FBdUIsSUFBdkIsRUFBbEQ7QUF2Qm9CLE9BQVgsQ0FBbEI7QUF5QkQ7QUFyQ0g7QUFBQTtBQUFBLDRCQXNDVTtBQUNOLE1BQUEsS0FBSyxDQUFDLEtBQU4sQ0FBWSxLQUFLLFVBQWpCO0FBQ0Q7QUF4Q0g7O0FBQUE7QUFBQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIk5LQy5tb2R1bGVzLlNlbGVjdEZvcnVtUGFuZWwgPSBjbGFzcyB7XHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICB0aGlzLmRvbUlkID0gYGZvcnVtXyR7RGF0ZS5ub3coKX1gO1xyXG4gICAgdGhpcy5hcHAgPSBudWxsO1xyXG4gICAgdGhpcy5sYXllckluZGV4ID0gbnVsbDtcclxuICAgIHRoaXMubGF5ZXIgPSBudWxsO1xyXG4gIH1cclxuICBvcGVuKCkge1xyXG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XHJcbiAgICBpZihzZWxmLmxheWVyKSB7XHJcbiAgICAgIHJldHVybiBsYXllci5zZXRUb3Aoc2VsZi5sYXllcik7XHJcbiAgICB9XHJcbiAgICBzZWxmLmxheWVySW5kZXggPSBsYXllci5vcGVuKHtcclxuICAgICAgdHlwZTogMSxcclxuICAgICAgc2hhZGU6IDAsXHJcbiAgICAgIG9mZnNldDogJzEwMHB4JyxcclxuICAgICAgbWF4V2lkdGg6ICcxMDAlJyxcclxuICAgICAgbWF4bWluOiB0cnVlLFxyXG4gICAgICB6SW5kZXg6IGxheWVyLnpJbmRleCxcclxuICAgICAgcmVzaXplOiBmYWxzZSxcclxuICAgICAgc3VjY2VzczogZnVuY3Rpb24obGF5ZXJvKSB7XHJcbiAgICAgICAgc2VsZi5sYXllciA9IGxheWVybztcclxuICAgICAgICBsYXllci5zZXRUb3AobGF5ZXJvKTtcclxuICAgICAgICBzZWxmLmFwcCA9IG5ldyBWdWUoe1xyXG4gICAgICAgICAgZWw6IGAjYCArIHNlbGYuZG9tSWQsXHJcbiAgICAgICAgICBkYXRhOiB7XHJcbiAgICAgICAgICAgIG5hbWU6ICfov5nmmK/kuIDkuKrlj6/ku6Xph43opoHkuZ/lj6/ku6XkuI3ph43opoHnmoTmlrnms5XvvIzph43opoHnmoTmmK/vvIzlroPnmoTmnYPliKnnnJ/nmoTlvojlpKfvvIzlsKTlhbbmmK/lnKjmqKHlnZfljJbliqDovb1sYXllcuaXtu+8jOS9oOS8muWPkeeOsOS9oOW/hemhu+imgeeUqOWIsOWug+OAguWug+S4jeS7heWPr+S7pemFjee9ruS4gOS6m+ivuOWmgui3r+W+hOOAgeWKoOi9veeahOaooeWdl++8jOeUmuiHs+i/mOWPr+S7peWGs+WumuaVtOS4quW8ueWxgueahOm7mOiupOWPguaVsOOAguiAjOivtOWug+S4jemHjeimge+8jOaYr+WboOS4uuWkmuaVsOaDheWGteS4i++8jOS9oOS8muWPkeeOsO+8jOS9oOS8vOS5juS4jeaYr+mCo+S5iOWNgeWIhumcgOimgeWug+OAguS9huS9oOecn+eahOmcgOimgeiupOivhuS4gOS4i+i/meS9jeS8meiuoeOAgicsXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH0sXHJcbiAgICAgIGVuZDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgaWYoc2VsZi5hcHApIHNlbGYuYXBwLiRkZXN0cm95KCk7XHJcbiAgICAgICAgZGVsZXRlIHNlbGYubGF5ZXI7XHJcbiAgICAgIH0sXHJcbiAgICAgIHRpdGxlOiAn6YCJ5oup5LiT5LiaJyxcclxuICAgICAgY29udGVudDogYDxkaXYgaWQ9XCIke3NlbGYuZG9tSWR9XCIgY2xhc3M9XCJua2MtbGF5ZXItbWRcIj4keyQoJyNsYXllclNlbGVjdEZvcnVtJykuaHRtbCgpfTwvZGl2PmBcclxuICAgIH0pO1xyXG4gIH1cclxuICBjbG9zZSgpIHtcclxuICAgIGxheWVyLmNsb3NlKHRoaXMubGF5ZXJJbmRleCk7XHJcbiAgfVxyXG59XHJcbiJdfQ==
