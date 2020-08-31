(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

NKC.modules.downloadResource = /*#__PURE__*/function () {
  function _class() {
    _classCallCheck(this, _class);

    var self = this;
    self.dom = $("#moduleDownloadResource");
    self.app = new Vue({
      el: "#moduleDownloadResourceApp",
      data: {
        uid: NKC.configs.uid,
        paging: {},
        perpage: 7,
        loading: false,
        drafts: []
      },
      methods: {
        fromNow: NKC.methods.fromNow,
        initDom: function initDom() {
          var height = "43.5rem";
          self.dom.css({
            height: height
          });
          self.dom.draggable({
            scroll: false,
            handle: ".module-sd-title",
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
          var width = $(window).width();

          if (width < 700) {
            // 小屏幕
            self.dom.css({
              "width": width * 0.8,
              "top": 0,
              "right": 0
            });
          } else {
            // 宽屏
            self.dom.css("left", (width - self.dom.width()) * 0.5 - 20);
          }

          self.dom.show();
        },
        open: function open(callback) {
          self.callback = callback;
          this.initDom(); // this.getDrafts();
        },
        close: function close() {
          self.dom.hide();
        }
      }
    });
    self.open = self.app.open;
    self.close = self.app.close;
  }

  return _class;
}();

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwYWdlcy9wdWJsaWNNb2R1bGVzL2Rvd25sb2FkUmVzb3VyY2UvZG93bmxvYWRSZXNvdXJjZS5tanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7O0FDQUEsR0FBRyxDQUFDLE9BQUosQ0FBWSxnQkFBWjtBQUNFLG9CQUFjO0FBQUE7O0FBQ1osUUFBTSxJQUFJLEdBQUcsSUFBYjtBQUNBLElBQUEsSUFBSSxDQUFDLEdBQUwsR0FBVyxDQUFDLENBQUMseUJBQUQsQ0FBWjtBQUNBLElBQUEsSUFBSSxDQUFDLEdBQUwsR0FBVyxJQUFJLEdBQUosQ0FBUTtBQUNqQixNQUFBLEVBQUUsRUFBRSw0QkFEYTtBQUVqQixNQUFBLElBQUksRUFBRTtBQUNKLFFBQUEsR0FBRyxFQUFFLEdBQUcsQ0FBQyxPQUFKLENBQVksR0FEYjtBQUVKLFFBQUEsTUFBTSxFQUFFLEVBRko7QUFHSixRQUFBLE9BQU8sRUFBRSxDQUhMO0FBSUosUUFBQSxPQUFPLEVBQUUsS0FKTDtBQUtKLFFBQUEsTUFBTSxFQUFFO0FBTEosT0FGVztBQVNqQixNQUFBLE9BQU8sRUFBRTtBQUNQLFFBQUEsT0FBTyxFQUFFLEdBQUcsQ0FBQyxPQUFKLENBQVksT0FEZDtBQUVQLFFBQUEsT0FGTyxxQkFFRztBQUNSLGNBQU0sTUFBTSxHQUFHLFNBQWY7QUFDQSxVQUFBLElBQUksQ0FBQyxHQUFMLENBQVMsR0FBVCxDQUFhO0FBQ1gsWUFBQSxNQUFNLEVBQU47QUFEVyxXQUFiO0FBR0EsVUFBQSxJQUFJLENBQUMsR0FBTCxDQUFTLFNBQVQsQ0FBbUI7QUFDakIsWUFBQSxNQUFNLEVBQUUsS0FEUztBQUVqQixZQUFBLE1BQU0sRUFBRSxrQkFGUztBQUdqQixZQUFBLElBQUksRUFBRSxjQUFTLEtBQVQsRUFBZ0IsRUFBaEIsRUFBb0I7QUFDeEIsa0JBQUcsRUFBRSxDQUFDLFFBQUgsQ0FBWSxHQUFaLEdBQWtCLENBQXJCLEVBQXdCLEVBQUUsQ0FBQyxRQUFILENBQVksR0FBWixHQUFrQixDQUFsQjtBQUN4QixrQkFBTSxNQUFNLEdBQUcsQ0FBQyxDQUFDLE1BQUQsQ0FBRCxDQUFVLE1BQVYsRUFBZjtBQUNBLGtCQUFHLEVBQUUsQ0FBQyxRQUFILENBQVksR0FBWixHQUFrQixNQUFNLEdBQUcsRUFBOUIsRUFBa0MsRUFBRSxDQUFDLFFBQUgsQ0FBWSxHQUFaLEdBQWtCLE1BQU0sR0FBRyxFQUEzQjtBQUNsQyxrQkFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLEdBQUwsQ0FBUyxLQUFULEVBQWQ7QUFDQSxrQkFBRyxFQUFFLENBQUMsUUFBSCxDQUFZLElBQVosR0FBbUIsTUFBTSxLQUE1QixFQUFtQyxFQUFFLENBQUMsUUFBSCxDQUFZLElBQVosR0FBbUIsTUFBTSxLQUF6QjtBQUNuQyxrQkFBTSxRQUFRLEdBQUcsQ0FBQyxDQUFDLE1BQUQsQ0FBRCxDQUFVLEtBQVYsRUFBakI7QUFDQSxrQkFBRyxFQUFFLENBQUMsUUFBSCxDQUFZLElBQVosR0FBbUIsUUFBUSxHQUFHLEdBQWpDLEVBQXNDLEVBQUUsQ0FBQyxRQUFILENBQVksSUFBWixHQUFtQixRQUFRLEdBQUcsR0FBOUI7QUFDdkM7QUFYZ0IsV0FBbkI7QUFhQSxjQUFNLEtBQUssR0FBRyxDQUFDLENBQUMsTUFBRCxDQUFELENBQVUsS0FBVixFQUFkOztBQUNBLGNBQUcsS0FBSyxHQUFHLEdBQVgsRUFBZ0I7QUFDZDtBQUNBLFlBQUEsSUFBSSxDQUFDLEdBQUwsQ0FBUyxHQUFULENBQWE7QUFDWCx1QkFBUyxLQUFLLEdBQUcsR0FETjtBQUVYLHFCQUFPLENBRkk7QUFHWCx1QkFBUztBQUhFLGFBQWI7QUFLRCxXQVBELE1BT087QUFDTDtBQUNBLFlBQUEsSUFBSSxDQUFDLEdBQUwsQ0FBUyxHQUFULENBQWEsTUFBYixFQUFxQixDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsR0FBTCxDQUFTLEtBQVQsRUFBVCxJQUEyQixHQUEzQixHQUFpQyxFQUF0RDtBQUNEOztBQUNELFVBQUEsSUFBSSxDQUFDLEdBQUwsQ0FBUyxJQUFUO0FBQ0QsU0FqQ007QUFrQ1AsUUFBQSxJQWxDTyxnQkFrQ0YsUUFsQ0UsRUFrQ1E7QUFDYixVQUFBLElBQUksQ0FBQyxRQUFMLEdBQWdCLFFBQWhCO0FBQ0EsZUFBSyxPQUFMLEdBRmEsQ0FHYjtBQUNELFNBdENNO0FBdUNQLFFBQUEsS0F2Q08sbUJBdUNDO0FBQ04sVUFBQSxJQUFJLENBQUMsR0FBTCxDQUFTLElBQVQ7QUFDRDtBQXpDTTtBQVRRLEtBQVIsQ0FBWDtBQXFEQSxJQUFBLElBQUksQ0FBQyxJQUFMLEdBQVksSUFBSSxDQUFDLEdBQUwsQ0FBUyxJQUFyQjtBQUNBLElBQUEsSUFBSSxDQUFDLEtBQUwsR0FBYSxJQUFJLENBQUMsR0FBTCxDQUFTLEtBQXRCO0FBQ0Q7O0FBM0RIO0FBQUEiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJOS0MubW9kdWxlcy5kb3dubG9hZFJlc291cmNlID0gY2xhc3Mge1xyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XHJcbiAgICBzZWxmLmRvbSA9ICQoXCIjbW9kdWxlRG93bmxvYWRSZXNvdXJjZVwiKTtcclxuICAgIHNlbGYuYXBwID0gbmV3IFZ1ZSh7XHJcbiAgICAgIGVsOiBcIiNtb2R1bGVEb3dubG9hZFJlc291cmNlQXBwXCIsXHJcbiAgICAgIGRhdGE6IHtcclxuICAgICAgICB1aWQ6IE5LQy5jb25maWdzLnVpZCxcclxuICAgICAgICBwYWdpbmc6IHt9LFxyXG4gICAgICAgIHBlcnBhZ2U6IDcsXHJcbiAgICAgICAgbG9hZGluZzogZmFsc2UsXHJcbiAgICAgICAgZHJhZnRzOiBbXVxyXG4gICAgICB9LFxyXG4gICAgICBtZXRob2RzOiB7XHJcbiAgICAgICAgZnJvbU5vdzogTktDLm1ldGhvZHMuZnJvbU5vdyxcclxuICAgICAgICBpbml0RG9tKCkge1xyXG4gICAgICAgICAgY29uc3QgaGVpZ2h0ID0gXCI0My41cmVtXCI7XHJcbiAgICAgICAgICBzZWxmLmRvbS5jc3Moe1xyXG4gICAgICAgICAgICBoZWlnaHRcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgc2VsZi5kb20uZHJhZ2dhYmxlKHtcclxuICAgICAgICAgICAgc2Nyb2xsOiBmYWxzZSxcclxuICAgICAgICAgICAgaGFuZGxlOiBcIi5tb2R1bGUtc2QtdGl0bGVcIixcclxuICAgICAgICAgICAgZHJhZzogZnVuY3Rpb24oZXZlbnQsIHVpKSB7XHJcbiAgICAgICAgICAgICAgaWYodWkucG9zaXRpb24udG9wIDwgMCkgdWkucG9zaXRpb24udG9wID0gMDtcclxuICAgICAgICAgICAgICBjb25zdCBoZWlnaHQgPSAkKHdpbmRvdykuaGVpZ2h0KCk7XHJcbiAgICAgICAgICAgICAgaWYodWkucG9zaXRpb24udG9wID4gaGVpZ2h0IC0gMzApIHVpLnBvc2l0aW9uLnRvcCA9IGhlaWdodCAtIDMwO1xyXG4gICAgICAgICAgICAgIGNvbnN0IHdpZHRoID0gc2VsZi5kb20ud2lkdGgoKTtcclxuICAgICAgICAgICAgICBpZih1aS5wb3NpdGlvbi5sZWZ0IDwgMTAwIC0gd2lkdGgpIHVpLnBvc2l0aW9uLmxlZnQgPSAxMDAgLSB3aWR0aDtcclxuICAgICAgICAgICAgICBjb25zdCB3aW5XaWR0aCA9ICQod2luZG93KS53aWR0aCgpO1xyXG4gICAgICAgICAgICAgIGlmKHVpLnBvc2l0aW9uLmxlZnQgPiB3aW5XaWR0aCAtIDEwMCkgdWkucG9zaXRpb24ubGVmdCA9IHdpbldpZHRoIC0gMTAwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICAgIGNvbnN0IHdpZHRoID0gJCh3aW5kb3cpLndpZHRoKCk7XHJcbiAgICAgICAgICBpZih3aWR0aCA8IDcwMCkge1xyXG4gICAgICAgICAgICAvLyDlsI/lsY/luZVcclxuICAgICAgICAgICAgc2VsZi5kb20uY3NzKHtcclxuICAgICAgICAgICAgICBcIndpZHRoXCI6IHdpZHRoICogMC44LFxyXG4gICAgICAgICAgICAgIFwidG9wXCI6IDAsXHJcbiAgICAgICAgICAgICAgXCJyaWdodFwiOiAwXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgLy8g5a695bGPXHJcbiAgICAgICAgICAgIHNlbGYuZG9tLmNzcyhcImxlZnRcIiwgKHdpZHRoIC0gc2VsZi5kb20ud2lkdGgoKSkqMC41IC0gMjApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgc2VsZi5kb20uc2hvdygpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgb3BlbihjYWxsYmFjaykge1xyXG4gICAgICAgICAgc2VsZi5jYWxsYmFjayA9IGNhbGxiYWNrO1xyXG4gICAgICAgICAgdGhpcy5pbml0RG9tKCk7XHJcbiAgICAgICAgICAvLyB0aGlzLmdldERyYWZ0cygpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgY2xvc2UoKSB7XHJcbiAgICAgICAgICBzZWxmLmRvbS5oaWRlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICAgIHNlbGYub3BlbiA9IHNlbGYuYXBwLm9wZW47XHJcbiAgICBzZWxmLmNsb3NlID0gc2VsZi5hcHAuY2xvc2U7XHJcbiAgfVxyXG59OyJdfQ==
