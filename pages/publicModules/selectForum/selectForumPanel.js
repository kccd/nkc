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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9fYnJvd3Nlci1wYWNrQDYuMS4wQGJyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInBhZ2VzL3B1YmxpY01vZHVsZXMvc2VsZWN0Rm9ydW0vc2VsZWN0Rm9ydW1QYW5lbC5tanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztBQ0FBLEdBQUcsQ0FBQyxPQUFKLENBQVksZ0JBQVo7QUFDRSxvQkFBYztBQUFBOztBQUNaLFNBQUssS0FBTCxtQkFBc0IsSUFBSSxDQUFDLEdBQUwsRUFBdEI7QUFDQSxTQUFLLEdBQUwsR0FBVyxJQUFYO0FBQ0EsU0FBSyxVQUFMLEdBQWtCLElBQWxCO0FBQ0EsU0FBSyxLQUFMLEdBQWEsSUFBYjtBQUNEOztBQU5IO0FBQUE7QUFBQSwyQkFPUztBQUNMLFVBQU0sSUFBSSxHQUFHLElBQWI7O0FBQ0EsVUFBRyxJQUFJLENBQUMsS0FBUixFQUFlO0FBQ2IsZUFBTyxLQUFLLENBQUMsTUFBTixDQUFhLElBQUksQ0FBQyxLQUFsQixDQUFQO0FBQ0Q7O0FBQ0QsTUFBQSxJQUFJLENBQUMsVUFBTCxHQUFrQixLQUFLLENBQUMsSUFBTixDQUFXO0FBQzNCLFFBQUEsSUFBSSxFQUFFLENBRHFCO0FBRTNCLFFBQUEsS0FBSyxFQUFFLENBRm9CO0FBRzNCLFFBQUEsTUFBTSxFQUFFLE9BSG1CO0FBSTNCLFFBQUEsUUFBUSxFQUFFLE1BSmlCO0FBSzNCLFFBQUEsTUFBTSxFQUFFLElBTG1CO0FBTTNCLFFBQUEsTUFBTSxFQUFFLEtBQUssQ0FBQyxNQU5hO0FBTzNCLFFBQUEsTUFBTSxFQUFFLEtBUG1CO0FBUTNCLFFBQUEsT0FBTyxFQUFFLGlCQUFTLE1BQVQsRUFBaUI7QUFDeEIsVUFBQSxJQUFJLENBQUMsS0FBTCxHQUFhLE1BQWI7QUFDQSxVQUFBLEtBQUssQ0FBQyxNQUFOLENBQWEsTUFBYjtBQUNBLFVBQUEsSUFBSSxDQUFDLEdBQUwsR0FBVyxJQUFJLEdBQUosQ0FBUTtBQUNqQixZQUFBLEVBQUUsRUFBRSxNQUFNLElBQUksQ0FBQyxLQURFO0FBRWpCLFlBQUEsSUFBSSxFQUFFO0FBQ0osY0FBQSxJQUFJLEVBQUU7QUFERjtBQUZXLFdBQVIsQ0FBWDtBQU1ELFNBakIwQjtBQWtCM0IsUUFBQSxHQUFHLEVBQUUsZUFBVztBQUNkLGNBQUcsSUFBSSxDQUFDLEdBQVIsRUFBYSxJQUFJLENBQUMsR0FBTCxDQUFTLFFBQVQ7QUFDYixpQkFBTyxJQUFJLENBQUMsS0FBWjtBQUNELFNBckIwQjtBQXNCM0IsUUFBQSxLQUFLLEVBQUUsTUF0Qm9CO0FBdUIzQixRQUFBLE9BQU8sc0JBQWMsSUFBSSxDQUFDLEtBQW5CLHVDQUFrRCxDQUFDLENBQUMsbUJBQUQsQ0FBRCxDQUF1QixJQUF2QixFQUFsRDtBQXZCb0IsT0FBWCxDQUFsQjtBQXlCRDtBQXJDSDtBQUFBO0FBQUEsNEJBc0NVO0FBQ04sTUFBQSxLQUFLLENBQUMsS0FBTixDQUFZLEtBQUssVUFBakI7QUFDRDtBQXhDSDs7QUFBQTtBQUFBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiTktDLm1vZHVsZXMuU2VsZWN0Rm9ydW1QYW5lbCA9IGNsYXNzIHtcclxuICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIHRoaXMuZG9tSWQgPSBgZm9ydW1fJHtEYXRlLm5vdygpfWA7XHJcbiAgICB0aGlzLmFwcCA9IG51bGw7XHJcbiAgICB0aGlzLmxheWVySW5kZXggPSBudWxsO1xyXG4gICAgdGhpcy5sYXllciA9IG51bGw7XHJcbiAgfVxyXG4gIG9wZW4oKSB7XHJcbiAgICBjb25zdCBzZWxmID0gdGhpcztcclxuICAgIGlmKHNlbGYubGF5ZXIpIHtcclxuICAgICAgcmV0dXJuIGxheWVyLnNldFRvcChzZWxmLmxheWVyKTtcclxuICAgIH1cclxuICAgIHNlbGYubGF5ZXJJbmRleCA9IGxheWVyLm9wZW4oe1xyXG4gICAgICB0eXBlOiAxLFxyXG4gICAgICBzaGFkZTogMCxcclxuICAgICAgb2Zmc2V0OiAnMTAwcHgnLFxyXG4gICAgICBtYXhXaWR0aDogJzEwMCUnLFxyXG4gICAgICBtYXhtaW46IHRydWUsXHJcbiAgICAgIHpJbmRleDogbGF5ZXIuekluZGV4LFxyXG4gICAgICByZXNpemU6IGZhbHNlLFxyXG4gICAgICBzdWNjZXNzOiBmdW5jdGlvbihsYXllcm8pIHtcclxuICAgICAgICBzZWxmLmxheWVyID0gbGF5ZXJvO1xyXG4gICAgICAgIGxheWVyLnNldFRvcChsYXllcm8pO1xyXG4gICAgICAgIHNlbGYuYXBwID0gbmV3IFZ1ZSh7XHJcbiAgICAgICAgICBlbDogYCNgICsgc2VsZi5kb21JZCxcclxuICAgICAgICAgIGRhdGE6IHtcclxuICAgICAgICAgICAgbmFtZTogJ+i/meaYr+S4gOS4quWPr+S7pemHjeimgeS5n+WPr+S7peS4jemHjeimgeeahOaWueazle+8jOmHjeimgeeahOaYr++8jOWug+eahOadg+WIqeecn+eahOW+iOWkp++8jOWwpOWFtuaYr+WcqOaooeWdl+WMluWKoOi9vWxheWVy5pe277yM5L2g5Lya5Y+R546w5L2g5b+F6aG76KaB55So5Yiw5a6D44CC5a6D5LiN5LuF5Y+v5Lul6YWN572u5LiA5Lqb6K+45aaC6Lev5b6E44CB5Yqg6L2955qE5qih5Z2X77yM55Sa6Iez6L+Y5Y+v5Lul5Yaz5a6a5pW05Liq5by55bGC55qE6buY6K6k5Y+C5pWw44CC6ICM6K+05a6D5LiN6YeN6KaB77yM5piv5Zug5Li65aSa5pWw5oOF5Ya15LiL77yM5L2g5Lya5Y+R546w77yM5L2g5Ly85LmO5LiN5piv6YKj5LmI5Y2B5YiG6ZyA6KaB5a6D44CC5L2G5L2g55yf55qE6ZyA6KaB6K6k6K+G5LiA5LiL6L+Z5L2N5LyZ6K6h44CCJyxcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgfSxcclxuICAgICAgZW5kOiBmdW5jdGlvbigpIHtcclxuICAgICAgICBpZihzZWxmLmFwcCkgc2VsZi5hcHAuJGRlc3Ryb3koKTtcclxuICAgICAgICBkZWxldGUgc2VsZi5sYXllcjtcclxuICAgICAgfSxcclxuICAgICAgdGl0bGU6ICfpgInmi6nkuJPkuJonLFxyXG4gICAgICBjb250ZW50OiBgPGRpdiBpZD1cIiR7c2VsZi5kb21JZH1cIiBjbGFzcz1cIm5rYy1sYXllci1tZFwiPiR7JCgnI2xheWVyU2VsZWN0Rm9ydW0nKS5odG1sKCl9PC9kaXY+YFxyXG4gICAgfSk7XHJcbiAgfVxyXG4gIGNsb3NlKCkge1xyXG4gICAgbGF5ZXIuY2xvc2UodGhpcy5sYXllckluZGV4KTtcclxuICB9XHJcbn1cclxuIl19
