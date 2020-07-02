(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

NKC.modules.HidePost = /*#__PURE__*/function () {
  function _class() {
    _classCallCheck(this, _class);

    var self = this;
    self.dom = $("#moduleHidePost");
    self.dom.modal({
      show: false
    });
    self.app = new Vue({
      el: "#moduleHidePostApp",
      data: {
        pid: "",
        hide: ""
      },
      methods: {
        open: function open(callback, options) {
          self.callback = callback;
          var pid = options.pid,
              hide = options.hide;
          this.pid = pid;
          this.hide = hide;
          self.dom.modal("show");
        },
        close: function close() {
          self.dom.modal("hide");
        },
        submit: function submit() {
          nkcAPI("/p/".concat(this.pid, "/hide"), "PATCH", {
            hide: this.hide
          }).then(function () {
            self.callback();
            self.app.close();
          })["catch"](sweetError);
        }
      }
    });
    self.open = self.app.open;
    self.close = self.app.close;
  }

  return _class;
}();

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9fYnJvd3Nlci1wYWNrQDYuMS4wQGJyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInBhZ2VzL3B1YmxpY01vZHVsZXMvaGlkZVBvc3QvaGlkZVBvc3QubWpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7OztBQ0FBLEdBQUcsQ0FBQyxPQUFKLENBQVksUUFBWjtBQUNFLG9CQUFjO0FBQUE7O0FBQ1osUUFBTSxJQUFJLEdBQUcsSUFBYjtBQUNBLElBQUEsSUFBSSxDQUFDLEdBQUwsR0FBVyxDQUFDLENBQUMsaUJBQUQsQ0FBWjtBQUNBLElBQUEsSUFBSSxDQUFDLEdBQUwsQ0FBUyxLQUFULENBQWU7QUFDYixNQUFBLElBQUksRUFBRTtBQURPLEtBQWY7QUFHQSxJQUFBLElBQUksQ0FBQyxHQUFMLEdBQVcsSUFBSSxHQUFKLENBQVE7QUFDakIsTUFBQSxFQUFFLEVBQUUsb0JBRGE7QUFFakIsTUFBQSxJQUFJLEVBQUU7QUFDSixRQUFBLEdBQUcsRUFBRSxFQUREO0FBRUosUUFBQSxJQUFJLEVBQUU7QUFGRixPQUZXO0FBTWpCLE1BQUEsT0FBTyxFQUFFO0FBQ1AsUUFBQSxJQURPLGdCQUNGLFFBREUsRUFDUSxPQURSLEVBQ2lCO0FBQ3RCLFVBQUEsSUFBSSxDQUFDLFFBQUwsR0FBZ0IsUUFBaEI7QUFEc0IsY0FFZixHQUZlLEdBRUYsT0FGRSxDQUVmLEdBRmU7QUFBQSxjQUVWLElBRlUsR0FFRixPQUZFLENBRVYsSUFGVTtBQUd0QixlQUFLLEdBQUwsR0FBVyxHQUFYO0FBQ0EsZUFBSyxJQUFMLEdBQVksSUFBWjtBQUNBLFVBQUEsSUFBSSxDQUFDLEdBQUwsQ0FBUyxLQUFULENBQWUsTUFBZjtBQUNELFNBUE07QUFRUCxRQUFBLEtBUk8sbUJBUUM7QUFDTixVQUFBLElBQUksQ0FBQyxHQUFMLENBQVMsS0FBVCxDQUFlLE1BQWY7QUFDRCxTQVZNO0FBV1AsUUFBQSxNQVhPLG9CQVdFO0FBQ1AsVUFBQSxNQUFNLGNBQU8sS0FBSyxHQUFaLFlBQXdCLE9BQXhCLEVBQWlDO0FBQ3JDLFlBQUEsSUFBSSxFQUFFLEtBQUs7QUFEMEIsV0FBakMsQ0FBTixDQUdHLElBSEgsQ0FHUSxZQUFNO0FBQ1YsWUFBQSxJQUFJLENBQUMsUUFBTDtBQUNBLFlBQUEsSUFBSSxDQUFDLEdBQUwsQ0FBUyxLQUFUO0FBQ0QsV0FOSCxXQU9TLFVBUFQ7QUFRRDtBQXBCTTtBQU5RLEtBQVIsQ0FBWDtBQTZCQSxJQUFBLElBQUksQ0FBQyxJQUFMLEdBQVksSUFBSSxDQUFDLEdBQUwsQ0FBUyxJQUFyQjtBQUNBLElBQUEsSUFBSSxDQUFDLEtBQUwsR0FBYSxJQUFJLENBQUMsR0FBTCxDQUFTLEtBQXRCO0FBQ0Q7O0FBdENIO0FBQUEiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJOS0MubW9kdWxlcy5IaWRlUG9zdCA9IGNsYXNzIHtcclxuICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xyXG4gICAgc2VsZi5kb20gPSAkKFwiI21vZHVsZUhpZGVQb3N0XCIpOyBcclxuICAgIHNlbGYuZG9tLm1vZGFsKHtcclxuICAgICAgc2hvdzogZmFsc2VcclxuICAgIH0pO1xyXG4gICAgc2VsZi5hcHAgPSBuZXcgVnVlKHtcclxuICAgICAgZWw6IFwiI21vZHVsZUhpZGVQb3N0QXBwXCIsXHJcbiAgICAgIGRhdGE6IHtcclxuICAgICAgICBwaWQ6IFwiXCIsXHJcbiAgICAgICAgaGlkZTogXCJcIiAgICAgICAgXHJcbiAgICAgIH0sXHJcbiAgICAgIG1ldGhvZHM6IHtcclxuICAgICAgICBvcGVuKGNhbGxiYWNrLCBvcHRpb25zKSB7XHJcbiAgICAgICAgICBzZWxmLmNhbGxiYWNrID0gY2FsbGJhY2s7XHJcbiAgICAgICAgICBjb25zdCB7cGlkLCBoaWRlfSA9IG9wdGlvbnM7XHJcbiAgICAgICAgICB0aGlzLnBpZCA9IHBpZDtcclxuICAgICAgICAgIHRoaXMuaGlkZSA9IGhpZGU7XHJcbiAgICAgICAgICBzZWxmLmRvbS5tb2RhbChcInNob3dcIik7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBjbG9zZSgpIHtcclxuICAgICAgICAgIHNlbGYuZG9tLm1vZGFsKFwiaGlkZVwiKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHN1Ym1pdCgpIHtcclxuICAgICAgICAgIG5rY0FQSShgL3AvJHt0aGlzLnBpZH0vaGlkZWAsIFwiUEFUQ0hcIiwge1xyXG4gICAgICAgICAgICBoaWRlOiB0aGlzLmhpZGVcclxuICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgICBzZWxmLmNhbGxiYWNrKCk7XHJcbiAgICAgICAgICAgICAgc2VsZi5hcHAuY2xvc2UoKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLmNhdGNoKHN3ZWV0RXJyb3IpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICBzZWxmLm9wZW4gPSBzZWxmLmFwcC5vcGVuO1xyXG4gICAgc2VsZi5jbG9zZSA9IHNlbGYuYXBwLmNsb3NlO1xyXG4gIH1cclxufSJdfQ==
