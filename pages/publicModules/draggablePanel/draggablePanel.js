(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

NKC.modules.DraggablePanel = /*#__PURE__*/function () {
  function _class(domId) {
    _classCallCheck(this, _class);

    var self = this;
    self.dom = $(domId);
    var handle = ".draggable-panel-title";
    self.dom.draggable({
      scroll: false,
      handle: handle,
      drag: function drag(event, ui) {
        if (ui.position.top < 0) ui.position.top = 0;
        var height = $(window).height();
        if (ui.position.top > height - 30) ui.position.top = height - 30;
        var width = self.dom.width();
        if (ui.position.left < 100 - width) ui.position.left = 100 - width;
        var winWidth = $(window).width();
        if (ui.position.left > winWidth - 100) ui.position.left = winWidth - 100;
      }
    });
    self.resetPosition();
    self.dom.on("click", function () {
      self.active();
    });
  }

  _createClass(_class, [{
    key: "resetPosition",
    value: function resetPosition() {
      var dom = this.dom;
      var width = $(window).width();
      var height = $(window).height();

      if (width < 700) {
        // 小屏幕
        dom.css({
          "top": 0,
          "left": 0
        });
      } else {
        // 宽屏
        dom.css("left", (width - dom.width()) * 0.5);
        dom.css('top', (height - dom.height()) * 0.5);
      }
    }
  }, {
    key: "active",
    value: function active() {
      var panels = $('.draggable-panel');
      var maxIndex;

      for (var i = 0; i < panels.length; i++) {
        var d = panels.eq(i);

        var _index = d.attr('data-z-index');

        if (!_index === undefined) continue;
        _index = Number(_index);
        if (maxIndex === undefined || maxIndex < _index) maxIndex = _index;
      }

      maxIndex = (maxIndex || 10000) + 1;
      this.dom.css({
        'z-index': maxIndex
      });
      this.dom.attr('data-z-index', maxIndex);
    }
  }, {
    key: "setSize",
    value: function setSize(type) {
      var dom = this.dom;
      var width = $(window).width();

      if (width < 700) {
        if (type === 'show') {
          dom.css({
            width: '80%',
            left: '20%'
          });
        } else {
          dom.css({
            width: 'auto'
          });
        }
      }
    }
  }, {
    key: "showPanel",
    value: function showPanel() {
      this.resetPosition();
      this.setSize('show');
      this.active();
      this.dom.css('display', 'block');
    }
  }, {
    key: "hidePanel",
    value: function hidePanel() {
      this.dom.css('display', 'none');
      this.setSize('hide');
    }
  }]);

  return _class;
}();

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwYWdlcy9wdWJsaWNNb2R1bGVzL2RyYWdnYWJsZVBhbmVsL2RyYWdnYWJsZVBhbmVsLm1qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7O0FDQUEsR0FBRyxDQUFDLE9BQUosQ0FBWSxjQUFaO0FBQ0Usa0JBQVksS0FBWixFQUFtQjtBQUFBOztBQUNqQixRQUFNLElBQUksR0FBRyxJQUFiO0FBQ0EsSUFBQSxJQUFJLENBQUMsR0FBTCxHQUFXLENBQUMsQ0FBQyxLQUFELENBQVo7QUFDQSxRQUFNLE1BQU0sMkJBQVo7QUFDQSxJQUFBLElBQUksQ0FBQyxHQUFMLENBQVMsU0FBVCxDQUFtQjtBQUNqQixNQUFBLE1BQU0sRUFBRSxLQURTO0FBRWpCLE1BQUEsTUFBTSxFQUFOLE1BRmlCO0FBR2pCLE1BQUEsSUFBSSxFQUFFLGNBQVMsS0FBVCxFQUFnQixFQUFoQixFQUFvQjtBQUN4QixZQUFHLEVBQUUsQ0FBQyxRQUFILENBQVksR0FBWixHQUFrQixDQUFyQixFQUF3QixFQUFFLENBQUMsUUFBSCxDQUFZLEdBQVosR0FBa0IsQ0FBbEI7QUFDeEIsWUFBSSxNQUFNLEdBQUcsQ0FBQyxDQUFDLE1BQUQsQ0FBRCxDQUFVLE1BQVYsRUFBYjtBQUNBLFlBQUcsRUFBRSxDQUFDLFFBQUgsQ0FBWSxHQUFaLEdBQWtCLE1BQU0sR0FBRyxFQUE5QixFQUFrQyxFQUFFLENBQUMsUUFBSCxDQUFZLEdBQVosR0FBa0IsTUFBTSxHQUFHLEVBQTNCO0FBQ2xDLFlBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxHQUFMLENBQVMsS0FBVCxFQUFaO0FBQ0EsWUFBRyxFQUFFLENBQUMsUUFBSCxDQUFZLElBQVosR0FBbUIsTUFBTSxLQUE1QixFQUFtQyxFQUFFLENBQUMsUUFBSCxDQUFZLElBQVosR0FBbUIsTUFBTSxLQUF6QjtBQUNuQyxZQUFJLFFBQVEsR0FBRyxDQUFDLENBQUMsTUFBRCxD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QUF4QjtBQUNEO0FBNUVIO0FBQUE7QUFBQSxnQ0E2RWM7QUFDVixXQUFLLEdBQUwsQ0FBUyxHQUFULENBQWEsU0FBYixFQUF3QixNQUF4QjtBQUNBLFdBQUssT0FBTCxDQUFhLE1BQWI7QUFDRDtBQWhGSDs7QUFBQTtBQUFBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiTktDLm1vZHVsZXMuRHJhZ2dhYmxlUGFuZWwgPSBjbGFzcyB7XHJcbiAgY29uc3RydWN0b3IoZG9tSWQpIHtcclxuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xyXG4gICAgc2VsZi5kb20gPSAkKGRvbUlkKTtcclxuICAgIGNvbnN0IGhhbmRsZSA9IGAuZHJhZ2dhYmxlLXBhbmVsLXRpdGxlYDtcclxuICAgIHNlbGYuZG9tLmRyYWdnYWJsZSh7XHJcbiAgICAgIHNjcm9sbDogZmFsc2UsXHJcbiAgICAgIGhhbmRsZSxcclxuICAgICAgZHJhZzogZnVuY3Rpb24oZXZlbnQsIHVpKSB7XHJcbiAgICAgICAgaWYodWkucG9zaXRpb24udG9wIDwgMCkgdWkucG9zaXRpb24udG9wID0gMDtcclxuICAgICAgICB2YXIgaGVpZ2h0ID0gJCh3aW5kb3cpLmhlaWdodCgpO1xyXG4gICAgICAgIGlmKHVpLnBvc2l0aW9uLnRvcCA+IGhlaWdodCAtIDMwKSB1aS5wb3NpdGlvbi50b3AgPSBoZWlnaHQgLSAzMDtcclxuICAgICAgICB2YXIgd2lkdGggPSBzZWxmLmRvbS53aWR0aCgpO1xyXG4gICAgICAgIGlmKHVpLnBvc2l0aW9uLmxlZnQgPCAxMDAgLSB3aWR0aCkgdWkucG9zaXRpb24ubGVmdCA9IDEwMCAtIHdpZHRoO1xyXG4gICAgICAgIHZhciB3aW5XaWR0aCA9ICQod2luZG93KS53aWR0aCgpO1xyXG4gICAgICAgIGlmKHVpLnBvc2l0aW9uLmxlZnQgPiB3aW5XaWR0aCAtIDEwMCkgdWkucG9zaXRpb24ubGVmdCA9IHdpbldpZHRoIC0gMTAwO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICAgIHNlbGYucmVzZXRQb3NpdGlvbigpO1xyXG4gICAgc2VsZi5kb20ub24oXCJjbGlja1wiLCBmdW5jdGlvbigpIHtcclxuICAgICAgc2VsZi5hY3RpdmUoKTtcclxuICAgIH0pO1xyXG4gIH1cclxuICByZXNldFBvc2l0aW9uKCkge1xyXG4gICAgY29uc3QgZG9tID0gdGhpcy5kb207XHJcbiAgICBjb25zdCB3aWR0aCA9ICQod2luZG93KS53aWR0aCgpO1xyXG4gICAgY29uc3QgaGVpZ2h0ID0gJCh3aW5kb3cpLmhlaWdodCgpO1xyXG4gICAgaWYod2lkdGggPCA3MDApIHtcclxuICAgICAgLy8g5bCP5bGP5bmVXHJcbiAgICAgIGRvbS5jc3Moe1xyXG4gICAgICAgIFwidG9wXCI6IDAsXHJcbiAgICAgICAgXCJsZWZ0XCI6IDAsXHJcbiAgICAgIH0pO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgLy8g5a695bGPXHJcbiAgICAgIGRvbS5jc3MoXCJsZWZ0XCIsICh3aWR0aCAtIGRvbS53aWR0aCgpKSowLjUpO1xyXG4gICAgICBkb20uY3NzKCd0b3AnLCAoaGVpZ2h0IC0gZG9tLmhlaWdodCgpKSAqIDAuNSk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIGFjdGl2ZSgpIHtcclxuICAgIGNvbnN0IHBhbmVscyA9ICQoJy5kcmFnZ2FibGUtcGFuZWwnKTtcclxuICAgIGxldCBtYXhJbmRleDtcclxuICAgIGZvcihsZXQgaSA9IDA7IGkgPCBwYW5lbHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgY29uc3QgZCA9IHBhbmVscy5lcShpKTtcclxuICAgICAgbGV0IF9pbmRleCA9IGQuYXR0cignZGF0YS16LWluZGV4Jyk7XHJcbiAgICAgIGlmKCFfaW5kZXggPT09IHVuZGVmaW5lZCkgY29udGludWU7XHJcbiAgICAgIF9pbmRleCA9IE51bWJlcihfaW5kZXgpO1xyXG4gICAgICBpZihtYXhJbmRleCA9PT0gdW5kZWZpbmVkIHx8IG1heEluZGV4IDwgX2luZGV4KSBtYXhJbmRleCA9IF9pbmRleDtcclxuICAgIH1cclxuICAgIG1heEluZGV4ID0gKG1heEluZGV4IHx8IDEwMDAwKSArIDE7XHJcbiAgICB0aGlzLmRvbS5jc3Moe1xyXG4gICAgICAnei1pbmRleCc6IG1heEluZGV4XHJcbiAgICB9KTtcclxuICAgIHRoaXMuZG9tLmF0dHIoJ2RhdGEtei1pbmRleCcsIG1heEluZGV4KTtcclxuICB9XHJcbiAgc2V0U2l6ZSh0eXBlKSB7XHJcbiAgICBjb25zdCBkb20gPSB0aGlzLmRvbTtcclxuICAgIGNvbnN0IHdpZHRoID0gJCh3aW5kb3cpLndpZHRoKCk7XHJcbiAgICBpZih3aWR0aCA8IDcwMCkge1xyXG4gICAgICBpZih0eXBlID09PSAnc2hvdycpIHtcclxuICAgICAgICBkb20uY3NzKHtcclxuICAgICAgICAgIHdpZHRoOiAnODAlJyxcclxuICAgICAgICAgIGxlZnQ6ICcyMCUnLFxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGRvbS5jc3Moe1xyXG4gICAgICAgICAgd2lkdGg6ICdhdXRvJyxcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuICBzaG93UGFuZWwoKSB7XHJcbiAgICB0aGlzLnJlc2V0UG9zaXRpb24oKTtcclxuICAgIHRoaXMuc2V0U2l6ZSgnc2hvdycpO1xyXG4gICAgdGhpcy5hY3RpdmUoKTtcclxuICAgIHRoaXMuZG9tLmNzcygnZGlzcGxheScsICdibG9jaycpO1xyXG4gIH1cclxuICBoaWRlUGFuZWwoKSB7XHJcbiAgICB0aGlzLmRvbS5jc3MoJ2Rpc3BsYXknLCAnbm9uZScpO1xyXG4gICAgdGhpcy5zZXRTaXplKCdoaWRlJyk7XHJcbiAgfVxyXG59XHJcbiJdfQ==
