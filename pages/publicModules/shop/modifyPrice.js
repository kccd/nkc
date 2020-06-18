(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

NKC.modules.ShopModifyPrice = /*#__PURE__*/function () {
  function _class() {
    _classCallCheck(this, _class);

    var self = this;
    self.dom = $("#moduleModifyPrice");
    self.dom.modal({
      show: false,
      backdrop: "static"
    });
    self.app = new Vue({
      el: "#moduleModifyPriceApp",
      data: {
        price: 0,
        type: "discount",
        // discount: 折扣，reduce: 减价, input: 直接输入
        number: "",
        warning: ""
      },
      mounted: function mounted() {
        this.checkData();
      },
      watch: {
        number: function number() {
          this.checkData();
        },
        type: function type() {
          this.checkData();
        }
      },
      computed: {
        resultPrice: function resultPrice() {
          var price = this.price,
              number = this.number,
              type = this.type;
          number = number || 0;

          if (type === "input") {
            return number.toFixed(2);
          } else if (type === "discount") {
            return (number * price / 100).toFixed(2);
          } else {
            return (price - number).toFixed(2);
          }
        }
      },
      methods: {
        checkData: function checkData() {
          this.warning = "";
          var price = this.price,
              number = this.number,
              type = this.type;

          if (type === "discount") {
            if (number >= 1 && number <= 100) {} else {
              this.warning = "折扣数值不在规定的范围内";
            }
          } else if (type === "reduce") {
            if (number >= 0.01 && number < price) {} else {
              this.warning = "减去的数值不在规定的范围内";
            }
          } else {
            if (number >= 0.01) {} else {
              this.warning = "改价后的数值不能小于0.01";
            }
          }
        },
        open: function open(callback, price) {
          self.callback = callback;
          self.app.price = price;
          self.dom.modal("show");
        },
        close: function close() {
          self.dom.modal("hide");
        },
        submit: function submit() {
          self.callback(parseFloat(this.resultPrice));
          this.close();
        }
      }
    });
    self.open = self.app.open;
    self.close = self.app.close;
  }

  return _class;
}();

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9fYnJvd3Nlci1wYWNrQDYuMS4wQGJyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInBhZ2VzL3B1YmxpY01vZHVsZXMvc2hvcC9tb2RpZnlQcmljZS5tanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7O0FDQUEsR0FBRyxDQUFDLE9BQUosQ0FBWSxlQUFaO0FBQ0Usb0JBQWM7QUFBQTs7QUFDWixRQUFNLElBQUksR0FBRyxJQUFiO0FBQ0EsSUFBQSxJQUFJLENBQUMsR0FBTCxHQUFXLENBQUMsQ0FBQyxvQkFBRCxDQUFaO0FBQ0EsSUFBQSxJQUFJLENBQUMsR0FBTCxDQUFTLEtBQVQsQ0FBZTtBQUNiLE1BQUEsSUFBSSxFQUFFLEtBRE87QUFFYixNQUFBLFFBQVEsRUFBRTtBQUZHLEtBQWY7QUFLQSxJQUFBLElBQUksQ0FBQyxHQUFMLEdBQVcsSUFBSSxHQUFKLENBQVE7QUFDakIsTUFBQSxFQUFFLEVBQUUsdUJBRGE7QUFFakIsTUFBQSxJQUFJLEVBQUU7QUFDSixRQUFBLEtBQUssRUFBRSxDQURIO0FBRUosUUFBQSxJQUFJLEVBQUUsVUFGRjtBQUVjO0FBQ2xCLFFBQUEsTUFBTSxFQUFFLEVBSEo7QUFJSixRQUFBLE9BQU8sRUFBRTtBQUpMLE9BRlc7QUFRakIsTUFBQSxPQVJpQixxQkFRUDtBQUNSLGFBQUssU0FBTDtBQUNELE9BVmdCO0FBV2pCLE1BQUEsS0FBSyxFQUFFO0FBQ0wsUUFBQSxNQURLLG9CQUNJO0FBQ1AsZUFBSyxTQUFMO0FBQ0QsU0FISTtBQUlMLFFBQUEsSUFKSyxrQkFJRTtBQUNMLGVBQUssU0FBTDtBQUNEO0FBTkksT0FYVTtBQW1CakIsTUFBQSxRQUFRLEVBQUU7QUFDUixRQUFBLFdBRFEseUJBQ007QUFBQSxjQUNQLEtBRE8sR0FDZ0IsSUFEaEIsQ0FDUCxLQURPO0FBQUEsY0FDQSxNQURBLEdBQ2dCLElBRGhCLENBQ0EsTUFEQTtBQUFBLGNBQ1EsSUFEUixHQUNnQixJQURoQixDQUNRLElBRFI7QUFFWixVQUFBLE1BQU0sR0FBRyxNQUFNLElBQUksQ0FBbkI7O0FBQ0EsY0FBRyxJQUFJLEtBQUssT0FBWixFQUFxQjtBQUNuQixtQkFBTyxNQUFNLENBQUMsT0FBUCxDQUFlLENBQWYsQ0FBUDtBQUNELFdBRkQsTUFFTyxJQUFHLElBQUksS0FBSyxVQUFaLEVBQXdCO0FBQzdCLG1CQUFPLENBQUMsTUFBTSxHQUFHLEtBQVQsR0FBaUIsR0FBbEIsRUFBdUIsT0FBdkIsQ0FBK0IsQ0FBL0IsQ0FBUDtBQUNELFdBRk0sTUFFQTtBQUNMLG1CQUFPLENBQUMsS0FBSyxHQUFHLE1BQVQsRUFBaUIsT0FBakIsQ0FBeUIsQ0FBekIsQ0FBUDtBQUNEO0FBQ0Y7QUFYTyxPQW5CTztBQWdDakIsTUFBQSxPQUFPLEVBQUU7QUFDUCxRQUFBLFNBRE8sdUJBQ0s7QUFDVixlQUFLLE9BQUwsR0FBZSxFQUFmO0FBRFUsY0FFTCxLQUZLLEdBRWtCLElBRmxCLENBRUwsS0FGSztBQUFBLGNBRUUsTUFGRixHQUVrQixJQUZsQixDQUVFLE1BRkY7QUFBQSxjQUVVLElBRlYsR0FFa0IsSUFGbEIsQ0FFVSxJQUZWOztBQUdWLGNBQUcsSUFBSSxLQUFLLFVBQVosRUFBd0I7QUFDdEIsZ0JBQUcsTUFBTSxJQUFJLENBQVYsSUFBZSxNQUFNLElBQUksR0FBNUIsRUFBZ0MsQ0FBRSxDQUFsQyxNQUNJO0FBQ0YsbUJBQUssT0FBTCxHQUFlLGNBQWY7QUFDRDtBQUNGLFdBTEQsTUFLTyxJQUFHLElBQUksS0FBSyxRQUFaLEVBQXNCO0FBQzNCLGdCQUFHLE1BQU0sSUFBSSxJQUFWLElBQWtCLE1BQU0sR0FBRyxLQUE5QixFQUFxQyxDQUFFLENBQXZDLE1BQ0s7QUFDSCxtQkFBSyxPQUFMLEdBQWUsZUFBZjtBQUNEO0FBQ0YsV0FMTSxNQUtBO0FBQ0wsZ0JBQUcsTUFBTSxJQUFJLElBQWIsRUFBbUIsQ0FBRSxDQUFyQixNQUNLO0FBQ0gsbUJBQUssT0FBTCxHQUFlLGdCQUFmO0FBQ0Q7QUFDRjtBQUNGLFNBcEJNO0FBcUJQLFFBQUEsSUFyQk8sZ0JBcUJGLFFBckJFLEVBcUJRLEtBckJSLEVBcUJlO0FBQ3BCLFVBQUEsSUFBSSxDQUFDLFFBQUwsR0FBZ0IsUUFBaEI7QUFDQSxVQUFBLElBQUksQ0FBQyxHQUFMLENBQVMsS0FBVCxHQUFpQixLQUFqQjtBQUNBLFVBQUEsSUFBSSxDQUFDLEdBQUwsQ0FBUyxLQUFULENBQWUsTUFBZjtBQUNELFNBekJNO0FBMEJQLFFBQUEsS0ExQk8sbUJBMEJDO0FBQ04sVUFBQSxJQUFJLENBQUMsR0FBTCxDQUFTLEtBQVQsQ0FBZSxNQUFmO0FBQ0QsU0E1Qk07QUE2QlAsUUFBQSxNQTdCTyxvQkE2QkU7QUFDUCxVQUFBLElBQUksQ0FBQyxRQUFMLENBQWMsVUFBVSxDQUFDLEtBQUssV0FBTixDQUF4QjtBQUNBLGVBQUssS0FBTDtBQUNEO0FBaENNO0FBaENRLEtBQVIsQ0FBWDtBQW1FQSxJQUFBLElBQUksQ0FBQyxJQUFMLEdBQVksSUFBSSxDQUFDLEdBQUwsQ0FBUyxJQUFyQjtBQUNBLElBQUEsSUFBSSxDQUFDLEtBQUwsR0FBYSxJQUFJLENBQUMsR0FBTCxDQUFTLEtBQXRCO0FBQ0Q7O0FBOUVIO0FBQUEiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJOS0MubW9kdWxlcy5TaG9wTW9kaWZ5UHJpY2UgPSBjbGFzcyB7XHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICBjb25zdCBzZWxmID0gdGhpcztcclxuICAgIHNlbGYuZG9tID0gJChcIiNtb2R1bGVNb2RpZnlQcmljZVwiKTtcclxuICAgIHNlbGYuZG9tLm1vZGFsKHtcclxuICAgICAgc2hvdzogZmFsc2UsXHJcbiAgICAgIGJhY2tkcm9wOiBcInN0YXRpY1wiXHJcbiAgICB9KTtcclxuICAgIFxyXG4gICAgc2VsZi5hcHAgPSBuZXcgVnVlKHtcclxuICAgICAgZWw6IFwiI21vZHVsZU1vZGlmeVByaWNlQXBwXCIsXHJcbiAgICAgIGRhdGE6IHtcclxuICAgICAgICBwcmljZTogMCxcclxuICAgICAgICB0eXBlOiBcImRpc2NvdW50XCIsIC8vIGRpc2NvdW50OiDmipjmiaPvvIxyZWR1Y2U6IOWHj+S7tywgaW5wdXQ6IOebtOaOpei+k+WFpVxyXG4gICAgICAgIG51bWJlcjogXCJcIixcclxuICAgICAgICB3YXJuaW5nOiBcIlwiXHJcbiAgICAgIH0sXHJcbiAgICAgIG1vdW50ZWQoKSB7XHJcbiAgICAgICAgdGhpcy5jaGVja0RhdGEoKTtcclxuICAgICAgfSxcclxuICAgICAgd2F0Y2g6IHtcclxuICAgICAgICBudW1iZXIoKSB7XHJcbiAgICAgICAgICB0aGlzLmNoZWNrRGF0YSgpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgdHlwZSgpIHtcclxuICAgICAgICAgIHRoaXMuY2hlY2tEYXRhKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICBjb21wdXRlZDoge1xyXG4gICAgICAgIHJlc3VsdFByaWNlKCkge1xyXG4gICAgICAgICAgbGV0IHtwcmljZSwgbnVtYmVyLCB0eXBlfSA9IHRoaXM7XHJcbiAgICAgICAgICBudW1iZXIgPSBudW1iZXIgfHwgMDtcclxuICAgICAgICAgIGlmKHR5cGUgPT09IFwiaW5wdXRcIikge1xyXG4gICAgICAgICAgICByZXR1cm4gbnVtYmVyLnRvRml4ZWQoMik7XHJcbiAgICAgICAgICB9IGVsc2UgaWYodHlwZSA9PT0gXCJkaXNjb3VudFwiKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAobnVtYmVyICogcHJpY2UgLyAxMDApLnRvRml4ZWQoMik7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gKHByaWNlIC0gbnVtYmVyKS50b0ZpeGVkKDIpO1xyXG4gICAgICAgICAgfSBcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIG1ldGhvZHM6IHtcclxuICAgICAgICBjaGVja0RhdGEoKSB7XHJcbiAgICAgICAgICB0aGlzLndhcm5pbmcgPSBcIlwiO1xyXG4gICAgICAgICAgbGV0IHtwcmljZSwgbnVtYmVyLCB0eXBlfSA9IHRoaXM7XHJcbiAgICAgICAgICBpZih0eXBlID09PSBcImRpc2NvdW50XCIpIHtcclxuICAgICAgICAgICAgaWYobnVtYmVyID49IDEgJiYgbnVtYmVyIDw9IDEwMCl7fVxyXG4gICAgICAgICAgICBlbHNle1xyXG4gICAgICAgICAgICAgIHRoaXMud2FybmluZyA9IFwi5oqY5omj5pWw5YC85LiN5Zyo6KeE5a6a55qE6IyD5Zu05YaFXCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0gZWxzZSBpZih0eXBlID09PSBcInJlZHVjZVwiKSB7XHJcbiAgICAgICAgICAgIGlmKG51bWJlciA+PSAwLjAxICYmIG51bWJlciA8IHByaWNlKSB7fVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICB0aGlzLndhcm5pbmcgPSBcIuWHj+WOu+eahOaVsOWAvOS4jeWcqOinhOWumueahOiMg+WbtOWGhVwiO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBpZihudW1iZXIgPj0gMC4wMSkge31cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgdGhpcy53YXJuaW5nID0gXCLmlLnku7flkI7nmoTmlbDlgLzkuI3og73lsI/kuo4wLjAxXCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIG9wZW4oY2FsbGJhY2ssIHByaWNlKSB7XHJcbiAgICAgICAgICBzZWxmLmNhbGxiYWNrID0gY2FsbGJhY2s7XHJcbiAgICAgICAgICBzZWxmLmFwcC5wcmljZSA9IHByaWNlO1xyXG4gICAgICAgICAgc2VsZi5kb20ubW9kYWwoXCJzaG93XCIpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgY2xvc2UoKSB7XHJcbiAgICAgICAgICBzZWxmLmRvbS5tb2RhbChcImhpZGVcIik7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBzdWJtaXQoKSB7XHJcbiAgICAgICAgICBzZWxmLmNhbGxiYWNrKHBhcnNlRmxvYXQodGhpcy5yZXN1bHRQcmljZSkpO1xyXG4gICAgICAgICAgdGhpcy5jbG9zZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICBzZWxmLm9wZW4gPSBzZWxmLmFwcC5vcGVuO1xyXG4gICAgc2VsZi5jbG9zZSA9IHNlbGYuYXBwLmNsb3NlO1xyXG4gIH1cclxuXHJcbn0iXX0=
