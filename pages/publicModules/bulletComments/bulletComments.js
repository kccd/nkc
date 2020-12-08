(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Bullet = function Bullet(_ref) {
  var postId = _ref.postId,
      avatarUrl = _ref.avatarUrl,
      username = _ref.username,
      content = _ref.content,
      contentUrl = _ref.contentUrl;

  _classCallCheck(this, Bullet);

  this.id = "nkcBullet_".concat(postId);
  this.dom = $("<a href=\"".concat(contentUrl, "\" class=\"bullet\" id=\"").concat(this.id, "\"><img class=\"bullet-avatar\" src=\"").concat(avatarUrl, "\" alt=\"").concat(username, "\"/><div class=\"bullet-content\">").concat(content, "</div></a>"));
  this.left = '100%';
  this.top = '0';
};

var BulletComments = /*#__PURE__*/function () {
  function BulletComments() {
    _classCallCheck(this, BulletComments);

    this.id = "nkcBullet".concat(Date.now()).concat(Math.round(Math.random() * 1000));
    this.bullets = [];
    this.tracks = [];

    for (var i = 0; i < 5; i++) {
      this.tracks.push({
        index: i,
        speed: 5 + Math.round(Math.random() * 10),
        idle: true,
        bullets: []
      });
    }

    this.transition();
  }

  _createClass(BulletComments, [{
    key: "getBulletDomByBullet",
    value: function getBulletDomByBullet(bullet) {
      var avatarUrl = bullet.avatarUrl,
          username = bullet.username,
          content = bullet.content,
          contentUrl = bullet.contentUrl,
          id = bullet.id;
      var dom = $("<a href=\"".concat(contentUrl, "\" class=\"bullet\" id=\"").concat(this.id + '_' + id, "\"><img class=\"bullet-avatar\" src=\"").concat(avatarUrl, "\"  alt=\"").concat(username, "\"/><div class=\"bullet-content\">").concat(content, "</div></a>"));
      dom.on('mouseover', function (e) {
        var _dom$offset = dom.offset(),
            left = _dom$offset.left;

        dom.attr('style', "left: ".concat(left, "px!important;"));
      });
      dom.on("mouseleave", function () {
        dom.attr('style', "left: ".concat(-1 * dom.width(), "px!important;"));
      });
      return dom;
    }
  }, {
    key: "getTrack",
    value: function getTrack() {
      var index = Math.round(Math.random() * (this.tracks.length - 1));
      return this.tracks[index];
    }
  }, {
    key: "add",
    value: function add(comment) {
      var bullet = new Bullet(comment);
      this.bullets.push(bullet);
    }
  }, {
    key: "transition",
    value: function transition() {
      var self = this;
      var tracks = this.tracks;
      setTimeout(function () {
        for (var i = 0; i < tracks.length; i++) {
          var track = tracks[i];
          var bullets = track.bullets;
          var bullet = bullets.shift();
          if (!bullet) continue;
          $(body).append(bullet);
          var bulletWidth = bullet.width();
          bullet.css({
            // left: -1 * bulletWidth,
            left: '30rem',
            top: i * 3 + 5 + 'rem'
          });
          bullet.css('left', -1 * bulletWidth);
        }

        self.transition();
      }, 500);
    }
  }, {
    key: "start",
    value: function start() {}
  }, {
    key: "pause",
    value: function pause() {}
  }, {
    key: "clear",
    value: function clear() {}
  }]);

  return BulletComments;
}();

NKC.modules.BulletComments = BulletComments;

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwYWdlcy9wdWJsaWNNb2R1bGVzL2J1bGxldENvbW1lbnRzL2J1bGxldENvbW1lbnRzLm1qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7O0lDQU0sTSxHQUNKLHNCQUFnRTtBQUFBLE1BQW5ELE1BQW1ELFFBQW5ELE1BQW1EO0FBQUEsTUFBM0MsU0FBMkMsUUFBM0MsU0FBMkM7QUFBQSxNQUFoQyxRQUFnQyxRQUFoQyxRQUFnQztBQUFBLE1BQXRCLE9BQXNCLFFBQXRCLE9BQXNCO0FBQUEsTUFBYixVQUFhLFFBQWIsVUFBYTs7QUFBQTs7QUFDOUQsT0FBSyxFQUFMLHVCQUF1QixNQUF2QjtBQUNBLE9BQUssR0FBTCxHQUFXLENBQUMscUJBQWEsVUFBYixzQ0FBK0MsS0FBSyxFQUFwRCxtREFBMkYsU0FBM0Ysc0JBQThHLFFBQTlHLCtDQUF3SixPQUF4SixnQkFBWjtBQUNBLE9BQUssSUFBTCxHQUFZLE1BQVo7QUFDQSxPQUFLLEdBQUwsR0FBVyxHQUFYO0FBQ0QsQzs7SUFHRyxjO0FBQ0osNEJBQWM7QUFBQTs7QUFDWixTQUFLLEVBQUwsc0JBQXNCLElBQUksQ0FBQyxHQUFMLEVBQXRCLFNBQW1DLElBQUksQ0FBQyxLQUFMLENBQVcsSUFBSSxDQUFDLE1BQUwsS0FBZ0IsSUFBM0IsQ0FBbkM7QUFDQSxTQUFLLE9BQUwsR0FBZSxFQUFmO0FBQ0EsU0FBSyxNQUFMLEdBQWMsRUFBZDs7QUFDQSxTQUFJLElBQUksQ0FBQyxHQUFHLENBQVosRUFBZSxDQUFDLEdBQUcsQ0FBbkIsRUFBc0IsQ0FBQyxFQUF2QixFQUEyQjtBQUN6QixXQUFLLE1BQUwsQ0FBWSxJQUFaLENBQWlCO0FBQ2YsUUFBQSxLQUFLLEVBQUUsQ0FEUTtBQUVmLFFBQUEsS0FBSyxFQUFFLElBQUksSUFBSSxDQUFDLEtBQUwsQ0FBVyxJQUFJLENBQUMsTUFBTCxLQUFnQixFQUEzQixDQUZJO0FBR2YsUUFBQSxJQUFJLEVBQUUsSUFIUztBQUlmLFFBQUEsT0FBTyxFQUFFO0FBSk0sT0FBakI7QUFNRDs7QUFDRCxTQUFLLFVBQUw7QUFDRDs7Ozt5Q0FDb0IsTSxFQUFRO0FBQUEsVUFDcEIsU0FEb0IsR0FDNEIsTUFENUIsQ0FDcEIsU0FEb0I7QUFBQSxVQUNULFFBRFMsR0FDNEIsTUFENUIsQ0FDVCxRQURTO0FBQUEsVUFDQyxPQURELEdBQzRCLE1BRDVCLENBQ0MsT0FERDtBQUFBLFVBQ1UsVUFEVixHQUM0QixNQUQ1QixDQUNVLFVBRFY7QUFBQSxVQUNzQixFQUR0QixHQUM0QixNQUQ1QixDQUNzQixFQUR0QjtBQUUzQixVQUFNLEdBQUcsR0FBRyxDQUFDLHFCQUFhLFVBQWIsc0NBQStDLEtBQUssRUFBTCxHQUFVLEdBQVYsR0FBZSxFQUE5RCxtREFBcUcsU0FBckcsdUJBQXlILFFBQXpILCtDQUFtSyxPQUFuSyxnQkFBYjtBQUNBLE1BQUEsR0FBRyxDQUFDLEVBQUosQ0FBTyxXQUFQLEVBQW9CLFVBQUMsQ0FBRCxFQUFPO0FBQUEsMEJBQ1YsR0FBRyxDQUFDLE1BQUosRUFEVTtBQUFBLFlBQ2xCLElBRGtCLGVBQ2xCLElBRGtCOztBQUV6QixRQUFBLEdBQUcsQ0FBQyxJQUFKLENBQVMsT0FBVCxrQkFBMkIsSUFBM0I7QUFDRCxPQUhEO0FBSUEsTUFBQSxHQUFHLENBQUMsRUFBSixlQUFxQixZQUFNO0FBQ3pCLFFBQUEsR0FBRyxDQUFDLElBQUosQ0FBUyxPQUFULGtCQUEyQixDQUFDLENBQUQsR0FBSyxHQUFHLENBQUMsS0FBSixFQUFoQztBQUNELE9BRkQ7QUFHQSxhQUFPLEdBQVA7QUFDRDs7OytCQUNVO0FBQ1QsVUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUwsQ0FBVyxJQUFJLENBQUMsTUFBTCxNQUFpQixLQUFLLE1BQUwsQ0FBWSxNQUFaLEdBQXFCLENBQXRDLENBQVgsQ0FBZDtBQUNBLGFBQU8sS0FBSyxNQUFMLENBQVksS0FBWixDQUFQO0FBQ0Q7Ozt3QkFDRyxPLEVBQVM7QUFDWCxVQUFNLE1BQU0sR0FBRyxJQUFJLE1BQUosQ0FBVyxPQUFYLENBQWY7QUFDQSxXQUFLLE9BQUwsQ0FBYSxJQUFiLENBQWtCLE1BQWxCO0FBQ0Q7OztpQ0FDWTtBQUNYLFVBQU0sSUFBSSxHQUFHLElBQWI7QUFEVyxVQUVKLE1BRkksR0FFTSxJQUZOLENBRUosTUFGSTtBQUdYLE1BQUEsVUFBVSxDQUFDLFlBQU07QUFDZixhQUFJLElBQUksQ0FBQyxHQUFHLENBQVosRUFBZSxDQUFDLEdBQUcsTUFBTSxDQUFDLE1BQTFCLEVBQWtDLENBQUMsRUFBbkMsRUFBdUM7QUFDckMsY0FBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLENBQUQsQ0FBcEI7QUFEcUMsY0FFOUIsT0FGOEIsR0FFbkIsS0FGbUIsQ0FFOUIsT0FGOEI7QUFHckMsY0FBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLEtBQVIsRUFBZjtBQUNBLGNBQUcsQ0FBQyxNQUFKLEVBQVk7QUFDWixVQUFBLENBQUMsQ0FBQyxJQUFELENBQUQsQ0FBUSxNQUFSLENBQWUsTUFBZjtBQUNBLGNBQU0sV0FBVyxHQUFHLE1BQU0sQ0FBQyxLQUFQLEVBQXBCO0FBQ0EsVUFBQSxNQUFNLENBQUMsR0FBUCxDQUFXO0FBQ1Q7QUFDQSxZQUFBLElBQUksRUFBRSxPQUZHO0FBR1QsWUFBQSxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUosR0FBUSxDQUFSLEdBQVk7QUFIUixXQUFYO0FBS0EsVUFBQSxNQUFNLENBQUMsR0FBUCxDQUFXLE1BQVgsRUFBbUIsQ0FBQyxDQUFELEdBQUssV0FBeEI7QUFDRDs7QUFDRCxRQUFBLElBQUksQ0FBQyxVQUFMO0FBQ0QsT0FoQlMsRUFnQlAsR0FoQk8sQ0FBVjtBQWlCRDs7OzRCQUNPLENBRVA7Ozs0QkFDTyxDQUVQOzs7NEJBQ08sQ0FFUDs7Ozs7O0FBR0gsR0FBRyxDQUFDLE9BQUosQ0FBWSxjQUFaLEdBQTZCLGNBQTdCIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiY2xhc3MgQnVsbGV0IHtcclxuICBjb25zdHJ1Y3Rvcih7cG9zdElkLCBhdmF0YXJVcmwsIHVzZXJuYW1lLCBjb250ZW50LCBjb250ZW50VXJsfSkge1xyXG4gICAgdGhpcy5pZCA9IGBua2NCdWxsZXRfJHtwb3N0SWR9YDtcclxuICAgIHRoaXMuZG9tID0gJChgPGEgaHJlZj1cIiR7Y29udGVudFVybH1cIiBjbGFzcz1cImJ1bGxldFwiIGlkPVwiJHt0aGlzLmlkfVwiPjxpbWcgY2xhc3M9XCJidWxsZXQtYXZhdGFyXCIgc3JjPVwiJHthdmF0YXJVcmx9XCIgYWx0PVwiJHt1c2VybmFtZX1cIi8+PGRpdiBjbGFzcz1cImJ1bGxldC1jb250ZW50XCI+JHtjb250ZW50fTwvZGl2PjwvYT5gKTtcclxuICAgIHRoaXMubGVmdCA9ICcxMDAlJztcclxuICAgIHRoaXMudG9wID0gJzAnO1xyXG4gIH1cclxufVxyXG5cclxuY2xhc3MgQnVsbGV0Q29tbWVudHMge1xyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgdGhpcy5pZCA9IGBua2NCdWxsZXQke0RhdGUubm93KCl9JHtNYXRoLnJvdW5kKE1hdGgucmFuZG9tKCkgKiAxMDAwKX1gO1xyXG4gICAgdGhpcy5idWxsZXRzID0gW107XHJcbiAgICB0aGlzLnRyYWNrcyA9IFtdO1xyXG4gICAgZm9yKGxldCBpID0gMDsgaSA8IDU7IGkrKykge1xyXG4gICAgICB0aGlzLnRyYWNrcy5wdXNoKHtcclxuICAgICAgICBpbmRleDogaSxcclxuICAgICAgICBzcGVlZDogNSArIE1hdGgucm91bmQoTWF0aC5yYW5kb20oKSAqIDEwKSxcclxuICAgICAgICBpZGxlOiB0cnVlLFxyXG4gICAgICAgIGJ1bGxldHM6IFtdXHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgdGhpcy50cmFuc2l0aW9uKCk7XHJcbiAgfVxyXG4gIGdldEJ1bGxldERvbUJ5QnVsbGV0KGJ1bGxldCkge1xyXG4gICAgY29uc3Qge2F2YXRhclVybCwgdXNlcm5hbWUsIGNvbnRlbnQsIGNvbnRlbnRVcmwsIGlkfSA9IGJ1bGxldDtcclxuICAgIGNvbnN0IGRvbSA9ICQoYDxhIGhyZWY9XCIke2NvbnRlbnRVcmx9XCIgY2xhc3M9XCJidWxsZXRcIiBpZD1cIiR7dGhpcy5pZCArICdfJyAraWR9XCI+PGltZyBjbGFzcz1cImJ1bGxldC1hdmF0YXJcIiBzcmM9XCIke2F2YXRhclVybH1cIiAgYWx0PVwiJHt1c2VybmFtZX1cIi8+PGRpdiBjbGFzcz1cImJ1bGxldC1jb250ZW50XCI+JHtjb250ZW50fTwvZGl2PjwvYT5gKTtcclxuICAgIGRvbS5vbignbW91c2VvdmVyJywgKGUpID0+IHtcclxuICAgICAgY29uc3Qge2xlZnR9ID0gZG9tLm9mZnNldCgpO1xyXG4gICAgICBkb20uYXR0cignc3R5bGUnLCBgbGVmdDogJHtsZWZ0fXB4IWltcG9ydGFudDtgKTtcclxuICAgIH0pO1xyXG4gICAgZG9tLm9uKGBtb3VzZWxlYXZlYCwgKCkgPT4ge1xyXG4gICAgICBkb20uYXR0cignc3R5bGUnLCBgbGVmdDogJHstMSAqIGRvbS53aWR0aCgpfXB4IWltcG9ydGFudDtgKTtcclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIGRvbTtcclxuICB9XHJcbiAgZ2V0VHJhY2soKSB7XHJcbiAgICBjb25zdCBpbmRleCA9IE1hdGgucm91bmQoTWF0aC5yYW5kb20oKSAqICh0aGlzLnRyYWNrcy5sZW5ndGggLSAxKSk7XHJcbiAgICByZXR1cm4gdGhpcy50cmFja3NbaW5kZXhdO1xyXG4gIH1cclxuICBhZGQoY29tbWVudCkge1xyXG4gICAgY29uc3QgYnVsbGV0ID0gbmV3IEJ1bGxldChjb21tZW50KTtcclxuICAgIHRoaXMuYnVsbGV0cy5wdXNoKGJ1bGxldCk7XHJcbiAgfVxyXG4gIHRyYW5zaXRpb24oKSB7XHJcbiAgICBjb25zdCBzZWxmID0gdGhpcztcclxuICAgIGNvbnN0IHt0cmFja3N9ID0gdGhpcztcclxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICBmb3IobGV0IGkgPSAwOyBpIDwgdHJhY2tzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgY29uc3QgdHJhY2sgPSB0cmFja3NbaV07XHJcbiAgICAgICAgY29uc3Qge2J1bGxldHN9ID0gdHJhY2s7XHJcbiAgICAgICAgY29uc3QgYnVsbGV0ID0gYnVsbGV0cy5zaGlmdCgpO1xyXG4gICAgICAgIGlmKCFidWxsZXQpIGNvbnRpbnVlO1xyXG4gICAgICAgICQoYm9keSkuYXBwZW5kKGJ1bGxldCk7XHJcbiAgICAgICAgY29uc3QgYnVsbGV0V2lkdGggPSBidWxsZXQud2lkdGgoKTtcclxuICAgICAgICBidWxsZXQuY3NzKHtcclxuICAgICAgICAgIC8vIGxlZnQ6IC0xICogYnVsbGV0V2lkdGgsXHJcbiAgICAgICAgICBsZWZ0OiAnMzByZW0nLFxyXG4gICAgICAgICAgdG9wOiBpICogMyArIDUgKyAncmVtJ1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGJ1bGxldC5jc3MoJ2xlZnQnLCAtMSAqIGJ1bGxldFdpZHRoKTtcclxuICAgICAgfVxyXG4gICAgICBzZWxmLnRyYW5zaXRpb24oKTtcclxuICAgIH0sIDUwMCk7XHJcbiAgfVxyXG4gIHN0YXJ0KCkge1xyXG5cclxuICB9XHJcbiAgcGF1c2UoKSB7XHJcblxyXG4gIH1cclxuICBjbGVhcigpIHtcclxuXHJcbiAgfVxyXG59XHJcblxyXG5OS0MubW9kdWxlcy5CdWxsZXRDb21tZW50cyA9IEJ1bGxldENvbW1lbnRzO1xyXG4iXX0=
