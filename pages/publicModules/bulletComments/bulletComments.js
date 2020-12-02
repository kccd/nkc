(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var BulletComments = /*#__PURE__*/function () {
  function BulletComments() {
    _classCallCheck(this, BulletComments);

    this.id = "nkcBullet".concat(Date.now()).concat(Math.round(Math.random() * 1000));
    this.comments = [];
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
      return $("<a href=\"".concat(contentUrl, "\" class=\"bullet\" id=\"").concat(this.id + '_' + id, "\"><img class=\"bullet-avatar\" src=\"").concat(avatarUrl, "\"  alt=\"").concat(username, "\"/><div class=\"bullet-content\">").concat(content, "</div></a>"));
    }
  }, {
    key: "getBulletByComment",
    value: function getBulletByComment(comment) {
      var avatar = comment.avatar,
          username = comment.username,
          content = comment.content,
          url = comment.url;
      var bullet = {
        status: 'unDisplay',
        avatar: avatar,
        username: username,
        content: content,
        url: url,
        id: this.comments.length
      };
      this.comments.push(bullet);
      return bullet;
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
      var bullet = this.getBulletByComment(comment);
      var bulletDom = this.getBulletDomByBullet(bullet);
      var track = this.getTrack();
      track.bullets.push(bulletDom);
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
      }, 1000);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwYWdlcy9wdWJsaWNNb2R1bGVzL2J1bGxldENvbW1lbnRzL2J1bGxldENvbW1lbnRzLm1qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7O0lDQU0sYztBQUNKLDRCQUFjO0FBQUE7O0FBQ1osU0FBSyxFQUFMLHNCQUFzQixJQUFJLENBQUMsR0FBTCxFQUF0QixTQUFtQyxJQUFJLENBQUMsS0FBTCxDQUFXLElBQUksQ0FBQyxNQUFMLEtBQWdCLElBQTNCLENBQW5DO0FBQ0EsU0FBSyxRQUFMLEdBQWdCLEVBQWhCO0FBQ0EsU0FBSyxPQUFMLEdBQWUsRUFBZjtBQUNBLFNBQUssTUFBTCxHQUFjLEVBQWQ7O0FBQ0EsU0FBSSxJQUFJLENBQUMsR0FBRyxDQUFaLEVBQWUsQ0FBQyxHQUFHLENBQW5CLEVBQXNCLENBQUMsRUFBdkIsRUFBMkI7QUFDekIsV0FBSyxNQUFMLENBQVksSUFBWixDQUFpQjtBQUNmLFFBQUEsS0FBSyxFQUFFLENBRFE7QUFFZixRQUFBLEtBQUssRUFBRSxJQUFJLElBQUksQ0FBQyxLQUFMLENBQVcsSUFBSSxDQUFDLE1BQUwsS0FBZ0IsRUFBM0IsQ0FGSTtBQUdmLFFBQUEsSUFBSSxFQUFFLElBSFM7QUFJZixRQUFBLE9BQU8sRUFBRTtBQUpNLE9BQWpCO0FBTUQ7O0FBQ0QsU0FBSyxVQUFMO0FBQ0Q7Ozs7eUNBQ29CLE0sRUFBUTtBQUFBLFVBQ3BCLFNBRG9CLEdBQzRCLE1BRDVCLENBQ3BCLFNBRG9CO0FBQUEsVUFDVCxRQURTLEdBQzRCLE1BRDVCLENBQ1QsUUFEUztBQUFBLFVBQ0MsT0FERCxHQUM0QixNQUQ1QixDQUNDLE9BREQ7QUFBQSxVQUNVLFVBRFYsR0FDNEIsTUFENUIsQ0FDVSxVQURWO0FBQUEsVUFDc0IsRUFEdEIsR0FDNEIsTUFENUIsQ0FDc0IsRUFEdEI7QUFFM0IsYUFBTyxDQUFDLHFCQUFhLFVBQWIsc0NBQStDLEtBQUssRUFBTCxHQUFVLEdBQVYsR0FBZSxFQUE5RCxtREFBcUcsU0FBckcsdUJBQXlILFFBQXpILCtDQUFtSyxPQUFuSyxnQkFBUjtBQUNEOzs7dUNBQ2tCLE8sRUFBUztBQUFBLFVBQ25CLE1BRG1CLEdBQ2UsT0FEZixDQUNuQixNQURtQjtBQUFBLFVBQ1gsUUFEVyxHQUNlLE9BRGYsQ0FDWCxRQURXO0FBQUEsVUFDRCxPQURDLEdBQ2UsT0FEZixDQUNELE9BREM7QUFBQSxVQUNRLEdBRFIsR0FDZSxPQURmLENBQ1EsR0FEUjtBQUUxQixVQUFNLE1BQU0sR0FBRztBQUNiLFFBQUEsTUFBTSxFQUFFLFdBREs7QUFFYixRQUFBLE1BQU0sRUFBTixNQUZhO0FBR2IsUUFBQSxRQUFRLEVBQVIsUUFIYTtBQUliLFFBQUEsT0FBTyxFQUFQLE9BSmE7QUFLYixRQUFBLEdBQUcsRUFBSCxHQUxhO0FBTWIsUUFBQSxFQUFFLEVBQUUsS0FBSyxRQUFMLENBQWM7QUFOTCxPQUFmO0FBUUEsV0FBSyxRQUFMLENBQWMsSUFBZCxDQUFtQixNQUFuQjtBQUNBLGFBQU8sTUFBUDtBQUNEOzs7K0JBQ1U7QUFDVCxVQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBTCxDQUFXLElBQUksQ0FBQyxNQUFMLE1BQWlCLEtBQUssTUFBTCxDQUFZLE1BQVosR0FBcUIsQ0FBdEMsQ0FBWCxDQUFkO0FBQ0EsYUFBTyxLQUFLLE1BQUwsQ0FBWSxLQUFaLENBQVA7QUFDRDs7O3dCQUNHLE8sRUFBUztBQUNYLFVBQU0sTUFBTSxHQUFHLEtBQUssa0JBQUwsQ0FBd0IsT0FBeEIsQ0FBZjtBQUNBLFVBQU0sU0FBUyxHQUFHLEtBQUssb0JBQUwsQ0FBMEIsTUFBMUIsQ0FBbEI7QUFDQSxVQUFNLEtBQUssR0FBRyxLQUFLLFFBQUwsRUFBZDtBQUNBLE1BQUEsS0FBSyxDQUFDLE9BQU4sQ0FBYyxJQUFkLENBQW1CLFNBQW5CO0FBQ0Q7OztpQ0FDWTtBQUNYLFVBQU0sSUFBSSxHQUFHLElBQWI7QUFEVyxVQUVKLE1BRkksR0FFTSxJQUZOLENBRUosTUFGSTtBQUdYLE1BQUEsVUFBVSxDQUFDLFlBQU07QUFDZixhQUFJLElBQUksQ0FBQyxHQUFHLENBQVosRUFBZSxDQUFDLEdBQUcsTUFBTSxDQUFDLE1BQTFCLEVBQWtDLENBQUMsRUFBbkMsRUFBdUM7QUFDckMsY0FBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLENBQUQsQ0FBcEI7QUFEcUMsY0FFOUIsT0FGOEIsR0FFbkIsS0FGbUIsQ0FFOUIsT0FGOEI7QUFHckMsY0FBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLEtBQVIsRUFBZjtBQUNBLGNBQUcsQ0FBQyxNQUFKLEVBQVk7QUFDWixVQUFBLENBQUMsQ0FBQyxJQUFELENBQUQsQ0FBUSxNQUFSLENBQWUsTUFBZjtBQUNBLGNBQU0sV0FBVyxHQUFHLE1BQU0sQ0FBQyxLQUFQLEVBQXBCO0FBQ0EsVUFBQSxNQUFNLENBQUMsR0FBUCxDQUFXO0FBQ1Q7QUFDQSxZQUFBLElBQUksRUFBRSxPQUZHO0FBR1QsWUFBQSxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUosR0FBUSxDQUFSLEdBQVk7QUFIUixXQUFYO0FBS0EsVUFBQSxNQUFNLENBQUMsR0FBUCxDQUFXLE1BQVgsRUFBbUIsQ0FBQyxDQUFELEdBQUssV0FBeEI7QUFDRDs7QUFDRCxRQUFBLElBQUksQ0FBQyxVQUFMO0FBQ0QsT0FoQlMsRUFnQlAsSUFoQk8sQ0FBVjtBQWlCRDs7OzRCQUNPLENBRVA7Ozs0QkFDTyxDQUVQOzs7NEJBQ08sQ0FFUDs7Ozs7O0FBR0gsR0FBRyxDQUFDLE9BQUosQ0FBWSxjQUFaLEdBQTZCLGNBQTdCIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiY2xhc3MgQnVsbGV0Q29tbWVudHMge1xyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgdGhpcy5pZCA9IGBua2NCdWxsZXQke0RhdGUubm93KCl9JHtNYXRoLnJvdW5kKE1hdGgucmFuZG9tKCkgKiAxMDAwKX1gO1xyXG4gICAgdGhpcy5jb21tZW50cyA9IFtdO1xyXG4gICAgdGhpcy5idWxsZXRzID0gW107XHJcbiAgICB0aGlzLnRyYWNrcyA9IFtdO1xyXG4gICAgZm9yKGxldCBpID0gMDsgaSA8IDU7IGkrKykge1xyXG4gICAgICB0aGlzLnRyYWNrcy5wdXNoKHtcclxuICAgICAgICBpbmRleDogaSxcclxuICAgICAgICBzcGVlZDogNSArIE1hdGgucm91bmQoTWF0aC5yYW5kb20oKSAqIDEwKSxcclxuICAgICAgICBpZGxlOiB0cnVlLFxyXG4gICAgICAgIGJ1bGxldHM6IFtdXHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgdGhpcy50cmFuc2l0aW9uKCk7XHJcbiAgfVxyXG4gIGdldEJ1bGxldERvbUJ5QnVsbGV0KGJ1bGxldCkge1xyXG4gICAgY29uc3Qge2F2YXRhclVybCwgdXNlcm5hbWUsIGNvbnRlbnQsIGNvbnRlbnRVcmwsIGlkfSA9IGJ1bGxldDtcclxuICAgIHJldHVybiAkKGA8YSBocmVmPVwiJHtjb250ZW50VXJsfVwiIGNsYXNzPVwiYnVsbGV0XCIgaWQ9XCIke3RoaXMuaWQgKyAnXycgK2lkfVwiPjxpbWcgY2xhc3M9XCJidWxsZXQtYXZhdGFyXCIgc3JjPVwiJHthdmF0YXJVcmx9XCIgIGFsdD1cIiR7dXNlcm5hbWV9XCIvPjxkaXYgY2xhc3M9XCJidWxsZXQtY29udGVudFwiPiR7Y29udGVudH08L2Rpdj48L2E+YCk7XHJcbiAgfVxyXG4gIGdldEJ1bGxldEJ5Q29tbWVudChjb21tZW50KSB7XHJcbiAgICBjb25zdCB7YXZhdGFyLCB1c2VybmFtZSwgY29udGVudCwgdXJsfSA9IGNvbW1lbnQ7XHJcbiAgICBjb25zdCBidWxsZXQgPSB7XHJcbiAgICAgIHN0YXR1czogJ3VuRGlzcGxheScsXHJcbiAgICAgIGF2YXRhcixcclxuICAgICAgdXNlcm5hbWUsXHJcbiAgICAgIGNvbnRlbnQsXHJcbiAgICAgIHVybCxcclxuICAgICAgaWQ6IHRoaXMuY29tbWVudHMubGVuZ3RoXHJcbiAgICB9O1xyXG4gICAgdGhpcy5jb21tZW50cy5wdXNoKGJ1bGxldCk7XHJcbiAgICByZXR1cm4gYnVsbGV0O1xyXG4gIH1cclxuICBnZXRUcmFjaygpIHtcclxuICAgIGNvbnN0IGluZGV4ID0gTWF0aC5yb3VuZChNYXRoLnJhbmRvbSgpICogKHRoaXMudHJhY2tzLmxlbmd0aCAtIDEpKTtcclxuICAgIHJldHVybiB0aGlzLnRyYWNrc1tpbmRleF07XHJcbiAgfVxyXG4gIGFkZChjb21tZW50KSB7XHJcbiAgICBjb25zdCBidWxsZXQgPSB0aGlzLmdldEJ1bGxldEJ5Q29tbWVudChjb21tZW50KTtcclxuICAgIGNvbnN0IGJ1bGxldERvbSA9IHRoaXMuZ2V0QnVsbGV0RG9tQnlCdWxsZXQoYnVsbGV0KTtcclxuICAgIGNvbnN0IHRyYWNrID0gdGhpcy5nZXRUcmFjaygpO1xyXG4gICAgdHJhY2suYnVsbGV0cy5wdXNoKGJ1bGxldERvbSk7XHJcbiAgfVxyXG4gIHRyYW5zaXRpb24oKSB7XHJcbiAgICBjb25zdCBzZWxmID0gdGhpcztcclxuICAgIGNvbnN0IHt0cmFja3N9ID0gdGhpcztcclxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICBmb3IobGV0IGkgPSAwOyBpIDwgdHJhY2tzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgY29uc3QgdHJhY2sgPSB0cmFja3NbaV07XHJcbiAgICAgICAgY29uc3Qge2J1bGxldHN9ID0gdHJhY2s7XHJcbiAgICAgICAgY29uc3QgYnVsbGV0ID0gYnVsbGV0cy5zaGlmdCgpO1xyXG4gICAgICAgIGlmKCFidWxsZXQpIGNvbnRpbnVlO1xyXG4gICAgICAgICQoYm9keSkuYXBwZW5kKGJ1bGxldCk7XHJcbiAgICAgICAgY29uc3QgYnVsbGV0V2lkdGggPSBidWxsZXQud2lkdGgoKTtcclxuICAgICAgICBidWxsZXQuY3NzKHtcclxuICAgICAgICAgIC8vIGxlZnQ6IC0xICogYnVsbGV0V2lkdGgsXHJcbiAgICAgICAgICBsZWZ0OiAnMzByZW0nLFxyXG4gICAgICAgICAgdG9wOiBpICogMyArIDUgKyAncmVtJ1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGJ1bGxldC5jc3MoJ2xlZnQnLCAtMSAqIGJ1bGxldFdpZHRoKTtcclxuICAgICAgfVxyXG4gICAgICBzZWxmLnRyYW5zaXRpb24oKTtcclxuICAgIH0sIDEwMDApO1xyXG4gIH1cclxuICBzdGFydCgpIHtcclxuXHJcbiAgfVxyXG4gIHBhdXNlKCkge1xyXG5cclxuICB9XHJcbiAgY2xlYXIoKSB7XHJcblxyXG4gIH1cclxufVxyXG5cclxuTktDLm1vZHVsZXMuQnVsbGV0Q29tbWVudHMgPSBCdWxsZXRDb21tZW50cztcclxuIl19
