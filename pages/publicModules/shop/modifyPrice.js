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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwYWdlcy9wdWJsaWNNb2R1bGVzL3Nob3AvbW9kaWZ5UHJpY2UubWpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7OztBQ0FBLEdBQUcsQ0FBQyxPQUFKLENBQVksZUFBWjtBQUNFLG9CQUFjO0FBQUE7O0FBQ1osUUFBTSxJQUFJLEdBQUcsSUFBYjtBQUNBLElBQUEsSUFBSSxDQUFDLEdBQUwsR0FBVyxDQUFDLENBQUMsb0JBQUQsQ0FBWjtBQUNBLElBQUEsSUFBSSxDQUFDLEdBQUwsQ0FBUyxLQUFULENBQWU7QUFDYixNQUFBLElBQUksRUFBRSxLQURPO0FBRWIsTUFBQSxRQUFRLEVBQUU7QUFGRyxLQUFmO0FBS0EsSUFBQSxJQUFJLENBQUMsR0FBTCxHQUFXLElBQUksR0FBSixDQUFRO0FBQ2pCLE1BQUEsRUFBRSxFQUFFLHVCQURhO0FBRWpCLE1BQUEsSUFBSSxFQUFFO0FBQ0osUUFBQSxLQUFLLEVBQUUsQ0FESDtBQUVKLFFBQUEsSUFBSSxFQUFFLFVBRkY7QUFFYztBQUNsQixRQUFBLE1BQU0sRUFBRSxFQUhKO0FBSUosUUFBQSxPQUFPLEVBQUU7QUFKTCxPQUZXO0FBUWpCLE1BQUEsT0FSaUIscUJBUVA7QUFDUixhQUFLLFNBQUw7QUFDRCxPQVZnQjtBQVdqQixNQUFBLEtBQUssRUFBRTtBQUNMLFFBQUEsTUFESyxvQkFDSTtBQUNQLGVBQUssU0FBTDtBQUNELFNBSEk7QUFJTCxRQUFBLElBSkssa0JBSUU7QUFDTCxlQUFLLFNBQUw7QUFDRDtBQU5JLE9BWFU7QUFtQmpCLE1BQUEsUUFBUSxFQUFFO0FBQ1IsUUFBQSxXQURRLHlCQUNNO0FBQUEsY0FDUCxLQURPLEdBQ2dCLElBRGhCLENBQ1AsS0FETztBQUFBLGNBQ0EsTUFEQSxHQUNnQixJQURoQixDQUNBLE1BREE7QUFBQSxjQUNRLElBRFIsR0FDZ0IsSUFEaEIsQ0FDUSxJQURSO0FBRVosVUFBQSxNQUFNLEdBQUcsTUFBTSxJQUFJLENBQW5COztBQUNBLGNBQUcsSUFBSSxLQUFLLE9BQVosRUFBcUI7QUFDbkIsbUJBQU8sTUFBTSxDQUFDLE9BQVAsQ0FBZSxDQUFmLENBQVA7QUFDRCxXQUZELE1BRU8sSUFBRyxJQUFJLEtBQUssVUFBWixFQUF3QjtBQUM3QixtQkFBTyxDQUFDLE1BQU0sR0FBRyxLQUFULEdBQWlCLEdBQWxCLEVBQXVCLE9BQXZCLENBQStCLENBQS9CLENBQVA7QUFDRCxXQUZNLE1BRUE7QUFDTCxtQkFBTyxDQUFDLEtBQUssR0FBRyxNQUFULEVBQWlCLE9BQWpCLENBQXlCLENBQXpCLENBQVA7QUFDRDtBQUNGO0FBWE8sT0FuQk87QUFnQ2pCLE1BQUEsT0FBTyxFQUFFO0FBQ1AsUUFBQSxTQURPLHVCQUNLO0FBQ1YsZUFBSyxPQUFMLEdBQWUsRUFBZjtBQURVLGNBRUwsS0FGSyxHQUVrQixJQUZsQixDQUVMLEtBRks7QUFBQSxjQUVFLE1BRkYsR0FFa0IsSUFGbEIsQ0FFRSxNQUZGO0FBQUEsY0FFVSxJQUZWLEdBRWtCLElBRmxCLENBRVUsSUFGVjs7QUFHVixjQUFHLElBQUksS0FBSyxVQUFaLEVBQXdCO0FBQ3RCLGdCQUFHLE1BQU0sSUFBSSxDQUFWLElBQWUsTUFBTSxJQUFJLEdBQTVCLEVBQWdDLENBQUUsQ0FBbEMsTUFDSTtBQUNGLG1CQUFLLE9BQUwsR0FBZSxjQUFmO0FBQ0Q7QUFDRixXQUxELE1BS08sSUFBRyxJQUFJLEtBQUssUUFBWixFQUFzQjtBQUMzQixnQkFBRyxNQUFNLElBQUksSUFBVixJQUFrQixNQUFNLEdBQUcsS0FBOUIsRUFBcUMsQ0FBRSxDQUF2QyxNQUNLO0FBQ0gsbUJBQUssT0FBTCxHQUFlLGVBQWY7QUFDRDtBQUNGLFdBTE0sTUFLQTtBQUNMLGdCQUFHLE1BQU0sSUFBSSxJQUFiLEVBQW1CLENBQUUsQ0FBckIsTUFDSztBQUNILG1CQUFLLE9BQUwsR0FBZSxnQkFBZjtBQUNEO0FBQ0Y7QUFDRixTQXBCTTtBQXFCUCxRQUFBLElBckJPLGdCQXFCRixRQXJCRSxFQXFCUSxLQXJCUixFQXFCZTtBQUNwQixVQUFBLElBQUksQ0FBQyxRQUFMLEdBQWdCLFFBQWhCO0FBQ0EsVUFBQSxJQUFJLENBQUMsR0FBTCxDQUFTLEtBQVQsR0FBaUIsS0FBakI7QUFDQSxVQUFBLElBQUksQ0FBQyxHQUFMLENBQVMsS0FBVCxDQUFlLE1BQWY7QUFDRCxTQXpCTTtBQTBCUCxRQUFBLEtBMUJPLG1CQTBCQztBQUNOLFVBQUEsSUFBSSxDQUFDLEdBQUwsQ0FBUyxLQUFULENBQWUsTUFBZjtBQUNELFNBNUJNO0FBNkJQLFFBQUEsTUE3Qk8sb0JBNkJFO0FBQ1AsVUFBQSxJQUFJLENBQUMsUUFBTCxDQUFjLFVBQVUsQ0FBQyxLQUFLLFdBQU4sQ0FBeEI7QUFDQSxlQUFLLEtBQUw7QUFDRDtBQWhDTTtBQWhDUSxLQUFSLENBQVg7QUFtRUEsSUFBQSxJQUFJLENBQUMsSUFBTCxHQUFZLElBQUksQ0FBQyxHQUFMLENBQVMsSUFBckI7QUFDQSxJQUFBLElBQUksQ0FBQyxLQUFMLEdBQWEsSUFBSSxDQUFDLEdBQUwsQ0FBUyxLQUF0QjtBQUNEOztBQTlFSDtBQUFBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiTktDLm1vZHVsZXMuU2hvcE1vZGlmeVByaWNlID0gY2xhc3Mge1xyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XHJcbiAgICBzZWxmLmRvbSA9ICQoXCIjbW9kdWxlTW9kaWZ5UHJpY2VcIik7XHJcbiAgICBzZWxmLmRvbS5tb2RhbCh7XHJcbiAgICAgIHNob3c6IGZhbHNlLFxyXG4gICAgICBiYWNrZHJvcDogXCJzdGF0aWNcIlxyXG4gICAgfSk7XHJcbiAgICBcclxuICAgIHNlbGYuYXBwID0gbmV3IFZ1ZSh7XHJcbiAgICAgIGVsOiBcIiNtb2R1bGVNb2RpZnlQcmljZUFwcFwiLFxyXG4gICAgICBkYXRhOiB7XHJcbiAgICAgICAgcHJpY2U6IDAsXHJcbiAgICAgICAgdHlwZTogXCJkaXNjb3VudFwiLCAvLyBkaXNjb3VudDog5oqY5omj77yMcmVkdWNlOiDlh4/ku7csIGlucHV0OiDnm7TmjqXovpPlhaVcclxuICAgICAgICBudW1iZXI6IFwiXCIsXHJcbiAgICAgICAgd2FybmluZzogXCJcIlxyXG4gICAgICB9LFxyXG4gICAgICBtb3VudGVkKCkge1xyXG4gICAgICAgIHRoaXMuY2hlY2tEYXRhKCk7XHJcbiAgICAgIH0sXHJcbiAgICAgIHdhdGNoOiB7XHJcbiAgICAgICAgbnVtYmVyKCkge1xyXG4gICAgICAgICAgdGhpcy5jaGVja0RhdGEoKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHR5cGUoKSB7XHJcbiAgICAgICAgICB0aGlzLmNoZWNrRGF0YSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAgY29tcHV0ZWQ6IHtcclxuICAgICAgICByZXN1bHRQcmljZSgpIHtcclxuICAgICAgICAgIGxldCB7cHJpY2UsIG51bWJlciwgdHlwZX0gPSB0aGlzO1xyXG4gICAgICAgICAgbnVtYmVyID0gbnVtYmVyIHx8IDA7XHJcbiAgICAgICAgICBpZih0eXBlID09PSBcImlucHV0XCIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG51bWJlci50b0ZpeGVkKDIpO1xyXG4gICAgICAgICAgfSBlbHNlIGlmKHR5cGUgPT09IFwiZGlzY291bnRcIikge1xyXG4gICAgICAgICAgICByZXR1cm4gKG51bWJlciAqIHByaWNlIC8gMTAwKS50b0ZpeGVkKDIpO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIChwcmljZSAtIG51bWJlcikudG9GaXhlZCgyKTtcclxuICAgICAgICAgIH0gXHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICBtZXRob2RzOiB7XHJcbiAgICAgICAgY2hlY2tEYXRhKCkge1xyXG4gICAgICAgICAgdGhpcy53YXJuaW5nID0gXCJcIjtcclxuICAgICAgICAgIGxldCB7cHJpY2UsIG51bWJlciwgdHlwZX0gPSB0aGlzO1xyXG4gICAgICAgICAgaWYodHlwZSA9PT0gXCJkaXNjb3VudFwiKSB7XHJcbiAgICAgICAgICAgIGlmKG51bWJlciA+PSAxICYmIG51bWJlciA8PSAxMDApe31cclxuICAgICAgICAgICAgZWxzZXtcclxuICAgICAgICAgICAgICB0aGlzLndhcm5pbmcgPSBcIuaKmOaJo+aVsOWAvOS4jeWcqOinhOWumueahOiMg+WbtOWGhVwiO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9IGVsc2UgaWYodHlwZSA9PT0gXCJyZWR1Y2VcIikge1xyXG4gICAgICAgICAgICBpZihudW1iZXIgPj0gMC4wMSAmJiBudW1iZXIgPCBwcmljZSkge31cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgdGhpcy53YXJuaW5nID0gXCLlh4/ljrvnmoTmlbDlgLzkuI3lnKjop4TlrprnmoTojIPlm7TlhoVcIjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgaWYobnVtYmVyID49IDAuMDEpIHt9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgIHRoaXMud2FybmluZyA9IFwi5pS55Lu35ZCO55qE5pWw5YC85LiN6IO95bCP5LqOMC4wMVwiO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBvcGVuKGNhbGxiYWNrLCBwcmljZSkge1xyXG4gICAgICAgICAgc2VsZi5jYWxsYmFjayA9IGNhbGxiYWNrO1xyXG4gICAgICAgICAgc2VsZi5hcHAucHJpY2UgPSBwcmljZTtcclxuICAgICAgICAgIHNlbGYuZG9tLm1vZGFsKFwic2hvd1wiKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGNsb3NlKCkge1xyXG4gICAgICAgICAgc2VsZi5kb20ubW9kYWwoXCJoaWRlXCIpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc3VibWl0KCkge1xyXG4gICAgICAgICAgc2VsZi5jYWxsYmFjayhwYXJzZUZsb2F0KHRoaXMucmVzdWx0UHJpY2UpKTtcclxuICAgICAgICAgIHRoaXMuY2xvc2UoKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgc2VsZi5vcGVuID0gc2VsZi5hcHAub3BlbjtcclxuICAgIHNlbGYuY2xvc2UgPSBzZWxmLmFwcC5jbG9zZTtcclxuICB9XHJcblxyXG59Il19
