(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

NKC.modules.ShopModifyPrice =
/*#__PURE__*/
function () {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9fYnJvd3Nlci1wYWNrQDYuMS4wQGJyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInBhZ2VzL3B1YmxpY01vZHVsZXMvc2hvcC9tb2RpZnlQcmljZS5tanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7O0FDQUEsR0FBRyxDQUFDLE9BQUosQ0FBWSxlQUFaO0FBQUE7QUFBQTtBQUNFLG9CQUFjO0FBQUE7O0FBQ1osUUFBTSxJQUFJLEdBQUcsSUFBYjtBQUNBLElBQUEsSUFBSSxDQUFDLEdBQUwsR0FBVyxDQUFDLENBQUMsb0JBQUQsQ0FBWjtBQUNBLElBQUEsSUFBSSxDQUFDLEdBQUwsQ0FBUyxLQUFULENBQWU7QUFDYixNQUFBLElBQUksRUFBRSxLQURPO0FBRWIsTUFBQSxRQUFRLEVBQUU7QUFGRyxLQUFmO0FBS0EsSUFBQSxJQUFJLENBQUMsR0FBTCxHQUFXLElBQUksR0FBSixDQUFRO0FBQ2pCLE1BQUEsRUFBRSxFQUFFLHVCQURhO0FBRWpCLE1BQUEsSUFBSSxFQUFFO0FBQ0osUUFBQSxLQUFLLEVBQUUsQ0FESDtBQUVKLFFBQUEsSUFBSSxFQUFFLFVBRkY7QUFFYztBQUNsQixRQUFBLE1BQU0sRUFBRSxFQUhKO0FBSUosUUFBQSxPQUFPLEVBQUU7QUFKTCxPQUZXO0FBUWpCLE1BQUEsT0FSaUIscUJBUVA7QUFDUixhQUFLLFNBQUw7QUFDRCxPQVZnQjtBQVdqQixNQUFBLEtBQUssRUFBRTtBQUNMLFFBQUEsTUFESyxvQkFDSTtBQUNQLGVBQUssU0FBTDtBQUNELFNBSEk7QUFJTCxRQUFBLElBSkssa0JBSUU7QUFDTCxlQUFLLFNBQUw7QUFDRDtBQU5JLE9BWFU7QUFtQmpCLE1BQUEsUUFBUSxFQUFFO0FBQ1IsUUFBQSxXQURRLHlCQUNNO0FBQUEsY0FDUCxLQURPLEdBQ2dCLElBRGhCLENBQ1AsS0FETztBQUFBLGNBQ0EsTUFEQSxHQUNnQixJQURoQixDQUNBLE1BREE7QUFBQSxjQUNRLElBRFIsR0FDZ0IsSUFEaEIsQ0FDUSxJQURSO0FBRVosVUFBQSxNQUFNLEdBQUcsTUFBTSxJQUFJLENBQW5COztBQUNBLGNBQUcsSUFBSSxLQUFLLE9BQVosRUFBcUI7QUFDbkIsbUJBQU8sTUFBTSxDQUFDLE9BQVAsQ0FBZSxDQUFmLENBQVA7QUFDRCxXQUZELE1BRU8sSUFBRyxJQUFJLEtBQUssVUFBWixFQUF3QjtBQUM3QixtQkFBTyxDQUFDLE1BQU0sR0FBRyxLQUFULEdBQWlCLEdBQWxCLEVBQXVCLE9BQXZCLENBQStCLENBQS9CLENBQVA7QUFDRCxXQUZNLE1BRUE7QUFDTCxtQkFBTyxDQUFDLEtBQUssR0FBRyxNQUFULEVBQWlCLE9BQWpCLENBQXlCLENBQXpCLENBQVA7QUFDRDtBQUNGO0FBWE8sT0FuQk87QUFnQ2pCLE1BQUEsT0FBTyxFQUFFO0FBQ1AsUUFBQSxTQURPLHVCQUNLO0FBQ1YsZUFBSyxPQUFMLEdBQWUsRUFBZjtBQURVLGNBRUwsS0FGSyxHQUVrQixJQUZsQixDQUVMLEtBRks7QUFBQSxjQUVFLE1BRkYsR0FFa0IsSUFGbEIsQ0FFRSxNQUZGO0FBQUEsY0FFVSxJQUZWLEdBRWtCLElBRmxCLENBRVUsSUFGVjs7QUFHVixjQUFHLElBQUksS0FBSyxVQUFaLEVBQXdCO0FBQ3RCLGdCQUFHLE1BQU0sSUFBSSxDQUFWLElBQWUsTUFBTSxJQUFJLEdBQTVCLEVBQWdDLENBQUUsQ0FBbEMsTUFDSTtBQUNGLG1CQUFLLE9BQUwsR0FBZSxjQUFmO0FBQ0Q7QUFDRixXQUxELE1BS08sSUFBRyxJQUFJLEtBQUssUUFBWixFQUFzQjtBQUMzQixnQkFBRyxNQUFNLElBQUksSUFBVixJQUFrQixNQUFNLEdBQUcsS0FBOUIsRUFBcUMsQ0FBRSxDQUF2QyxNQUNLO0FBQ0gsbUJBQUssT0FBTCxHQUFlLGVBQWY7QUFDRDtBQUNGLFdBTE0sTUFLQTtBQUNMLGdCQUFHLE1BQU0sSUFBSSxJQUFiLEVBQW1CLENBQUUsQ0FBckIsTUFDSztBQUNILG1CQUFLLE9BQUwsR0FBZSxnQkFBZjtBQUNEO0FBQ0Y7QUFDRixTQXBCTTtBQXFCUCxRQUFBLElBckJPLGdCQXFCRixRQXJCRSxFQXFCUSxLQXJCUixFQXFCZTtBQUNwQixVQUFBLElBQUksQ0FBQyxRQUFMLEdBQWdCLFFBQWhCO0FBQ0EsVUFBQSxJQUFJLENBQUMsR0FBTCxDQUFTLEtBQVQsR0FBaUIsS0FBakI7QUFDQSxVQUFBLElBQUksQ0FBQyxHQUFMLENBQVMsS0FBVCxDQUFlLE1BQWY7QUFDRCxTQXpCTTtBQTBCUCxRQUFBLEtBMUJPLG1CQTBCQztBQUNOLFVBQUEsSUFBSSxDQUFDLEdBQUwsQ0FBUyxLQUFULENBQWUsTUFBZjtBQUNELFNBNUJNO0FBNkJQLFFBQUEsTUE3Qk8sb0JBNkJFO0FBQ1AsVUFBQSxJQUFJLENBQUMsUUFBTCxDQUFjLFVBQVUsQ0FBQyxLQUFLLFdBQU4sQ0FBeEI7QUFDQSxlQUFLLEtBQUw7QUFDRDtBQWhDTTtBQWhDUSxLQUFSLENBQVg7QUFtRUEsSUFBQSxJQUFJLENBQUMsSUFBTCxHQUFZLElBQUksQ0FBQyxHQUFMLENBQVMsSUFBckI7QUFDQSxJQUFBLElBQUksQ0FBQyxLQUFMLEdBQWEsSUFBSSxDQUFDLEdBQUwsQ0FBUyxLQUF0QjtBQUNEOztBQTlFSDtBQUFBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiTktDLm1vZHVsZXMuU2hvcE1vZGlmeVByaWNlID0gY2xhc3Mge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcbiAgICBzZWxmLmRvbSA9ICQoXCIjbW9kdWxlTW9kaWZ5UHJpY2VcIik7XG4gICAgc2VsZi5kb20ubW9kYWwoe1xuICAgICAgc2hvdzogZmFsc2UsXG4gICAgICBiYWNrZHJvcDogXCJzdGF0aWNcIlxuICAgIH0pO1xuICAgIFxuICAgIHNlbGYuYXBwID0gbmV3IFZ1ZSh7XG4gICAgICBlbDogXCIjbW9kdWxlTW9kaWZ5UHJpY2VBcHBcIixcbiAgICAgIGRhdGE6IHtcbiAgICAgICAgcHJpY2U6IDAsXG4gICAgICAgIHR5cGU6IFwiZGlzY291bnRcIiwgLy8gZGlzY291bnQ6IOaKmOaJo++8jHJlZHVjZTog5YeP5Lu3LCBpbnB1dDog55u05o6l6L6T5YWlXG4gICAgICAgIG51bWJlcjogXCJcIixcbiAgICAgICAgd2FybmluZzogXCJcIlxuICAgICAgfSxcbiAgICAgIG1vdW50ZWQoKSB7XG4gICAgICAgIHRoaXMuY2hlY2tEYXRhKCk7XG4gICAgICB9LFxuICAgICAgd2F0Y2g6IHtcbiAgICAgICAgbnVtYmVyKCkge1xuICAgICAgICAgIHRoaXMuY2hlY2tEYXRhKCk7XG4gICAgICAgIH0sXG4gICAgICAgIHR5cGUoKSB7XG4gICAgICAgICAgdGhpcy5jaGVja0RhdGEoKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIGNvbXB1dGVkOiB7XG4gICAgICAgIHJlc3VsdFByaWNlKCkge1xuICAgICAgICAgIGxldCB7cHJpY2UsIG51bWJlciwgdHlwZX0gPSB0aGlzO1xuICAgICAgICAgIG51bWJlciA9IG51bWJlciB8fCAwO1xuICAgICAgICAgIGlmKHR5cGUgPT09IFwiaW5wdXRcIikge1xuICAgICAgICAgICAgcmV0dXJuIG51bWJlci50b0ZpeGVkKDIpO1xuICAgICAgICAgIH0gZWxzZSBpZih0eXBlID09PSBcImRpc2NvdW50XCIpIHtcbiAgICAgICAgICAgIHJldHVybiAobnVtYmVyICogcHJpY2UgLyAxMDApLnRvRml4ZWQoMik7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiAocHJpY2UgLSBudW1iZXIpLnRvRml4ZWQoMik7XG4gICAgICAgICAgfSBcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIG1ldGhvZHM6IHtcbiAgICAgICAgY2hlY2tEYXRhKCkge1xuICAgICAgICAgIHRoaXMud2FybmluZyA9IFwiXCI7XG4gICAgICAgICAgbGV0IHtwcmljZSwgbnVtYmVyLCB0eXBlfSA9IHRoaXM7XG4gICAgICAgICAgaWYodHlwZSA9PT0gXCJkaXNjb3VudFwiKSB7XG4gICAgICAgICAgICBpZihudW1iZXIgPj0gMSAmJiBudW1iZXIgPD0gMTAwKXt9XG4gICAgICAgICAgICBlbHNle1xuICAgICAgICAgICAgICB0aGlzLndhcm5pbmcgPSBcIuaKmOaJo+aVsOWAvOS4jeWcqOinhOWumueahOiMg+WbtOWGhVwiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSBpZih0eXBlID09PSBcInJlZHVjZVwiKSB7XG4gICAgICAgICAgICBpZihudW1iZXIgPj0gMC4wMSAmJiBudW1iZXIgPCBwcmljZSkge31cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICB0aGlzLndhcm5pbmcgPSBcIuWHj+WOu+eahOaVsOWAvOS4jeWcqOinhOWumueahOiMg+WbtOWGhVwiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZihudW1iZXIgPj0gMC4wMSkge31cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICB0aGlzLndhcm5pbmcgPSBcIuaUueS7t+WQjueahOaVsOWAvOS4jeiDveWwj+S6jjAuMDFcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIG9wZW4oY2FsbGJhY2ssIHByaWNlKSB7XG4gICAgICAgICAgc2VsZi5jYWxsYmFjayA9IGNhbGxiYWNrO1xuICAgICAgICAgIHNlbGYuYXBwLnByaWNlID0gcHJpY2U7XG4gICAgICAgICAgc2VsZi5kb20ubW9kYWwoXCJzaG93XCIpO1xuICAgICAgICB9LFxuICAgICAgICBjbG9zZSgpIHtcbiAgICAgICAgICBzZWxmLmRvbS5tb2RhbChcImhpZGVcIik7XG4gICAgICAgIH0sXG4gICAgICAgIHN1Ym1pdCgpIHtcbiAgICAgICAgICBzZWxmLmNhbGxiYWNrKHBhcnNlRmxvYXQodGhpcy5yZXN1bHRQcmljZSkpO1xuICAgICAgICAgIHRoaXMuY2xvc2UoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICAgIHNlbGYub3BlbiA9IHNlbGYuYXBwLm9wZW47XG4gICAgc2VsZi5jbG9zZSA9IHNlbGYuYXBwLmNsb3NlO1xuICB9XG5cbn0iXX0=
