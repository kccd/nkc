(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Bullet = function Bullet(_ref) {
  var pid = _ref.pid,
      avatarUrl = _ref.avatarUrl,
      username = _ref.username,
      content = _ref.content,
      contentUrl = _ref.contentUrl;

  _classCallCheck(this, Bullet);

  this.info = {
    pid: pid,
    avatarUrl: avatarUrl,
    username: username,
    content: content,
    contentUrl: contentUrl
  };
  this.id = "nkcBullet_".concat(this.info.pid);
};

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
    key: "getBulletByComment",
    value: function getBulletByComment(comment) {
      var avatarUrl = comment.avatarUrl,
          username = comment.username,
          content = comment.content,
          contentUrl = comment.contentUrl;
      var bullet = {
        status: 'unDisplay',
        avatarUrl: avatarUrl,
        username: username,
        content: content,
        contentUrl: contentUrl,
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwYWdlcy9wdWJsaWNNb2R1bGVzL2J1bGxldENvbW1lbnRzL2J1bGxldENvbW1lbnRzLm1qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7O0lDQU0sTSxHQUNKLHNCQUE2RDtBQUFBLE1BQWhELEdBQWdELFFBQWhELEdBQWdEO0FBQUEsTUFBM0MsU0FBMkMsUUFBM0MsU0FBMkM7QUFBQSxNQUFoQyxRQUFnQyxRQUFoQyxRQUFnQztBQUFBLE1BQXRCLE9BQXNCLFFBQXRCLE9BQXNCO0FBQUEsTUFBYixVQUFhLFFBQWIsVUFBYTs7QUFBQTs7QUFDM0QsT0FBSyxJQUFMLEdBQVk7QUFDVixJQUFBLEdBQUcsRUFBSCxHQURVO0FBRVYsSUFBQSxTQUFTLEVBQVQsU0FGVTtBQUdWLElBQUEsUUFBUSxFQUFSLFFBSFU7QUFJVixJQUFBLE9BQU8sRUFBUCxPQUpVO0FBS1YsSUFBQSxVQUFVLEVBQVY7QUFMVSxHQUFaO0FBT0EsT0FBSyxFQUFMLHVCQUF1QixLQUFLLElBQUwsQ0FBVSxHQUFqQztBQUNELEM7O0lBR0csYztBQUNKLDRCQUFjO0FBQUE7O0FBQ1osU0FBSyxFQUFMLHNCQUFzQixJQUFJLENBQUMsR0FBTCxFQUF0QixTQUFtQyxJQUFJLENBQUMsS0FBTCxDQUFXLElBQUksQ0FBQyxNQUFMLEtBQWdCLElBQTNCLENBQW5DO0FBQ0EsU0FBSyxRQUFMLEdBQWdCLEVBQWhCO0FBQ0EsU0FBSyxPQUFMLEdBQWUsRUFBZjtBQUNBLFNBQUssTUFBTCxHQUFjLEVBQWQ7O0FBQ0EsU0FBSSxJQUFJLENBQUMsR0FBRyxDQUFaLEVBQWUsQ0FBQyxHQUFHLENBQW5CLEVBQXNCLENBQUMsRUFBdkIsRUFBMkI7QUFDekIsV0FBSyxNQUFMLENBQVksSUFBWixDQUFpQjtBQUNmLFFBQUEsS0FBSyxFQUFFLENBRFE7QUFFZixRQUFBLEtBQUssRUFBRSxJQUFJLElBQUksQ0FBQyxLQUFM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R3JDLGNBQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxLQUFSLEVBQWY7QUFDQSxjQUFHLENBQUMsTUFBSixFQUFZO0FBQ1osVUFBQSxDQUFDLENBQUMsSUFBRCxDQUFELENBQVEsTUFBUixDQUFlLE1BQWY7QUFDQSxjQUFNLFdBQVcsR0FBRyxNQUFNLENBQUMsS0FBUCxFQUFwQjtBQUNBLFVBQUEsTUFBTSxDQUFDLEdBQVAsQ0FBVztBQUNUO0FBQ0EsWUFBQSxJQUFJLEVBQUUsT0FGRztBQUdULFlBQUEsR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFKLEdBQVEsQ0FBUixHQUFZO0FBSFIsV0FBWDtBQUtBLFVBQUEsTUFBTSxDQUFDLEdBQVAsQ0FBVyxNQUFYLEVBQW1CLENBQUMsQ0FBRCxHQUFLLFdBQXhCO0FBQ0Q7O0FBQ0QsUUFBQSxJQUFJLENBQUMsVUFBTDtBQUNELE9BaEJTLEVBZ0JQLEdBaEJPLENBQVY7QUFpQkQ7Ozs0QkFDTyxDQUVQOzs7NEJBQ08sQ0FFUDs7OzRCQUNPLENBRVA7Ozs7OztBQUdILEdBQUcsQ0FBQyxPQUFKLENBQVksY0FBWixHQUE2QixjQUE3QiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsImNsYXNzIEJ1bGxldCB7XHJcbiAgY29uc3RydWN0b3Ioe3BpZCwgYXZhdGFyVXJsLCB1c2VybmFtZSwgY29udGVudCwgY29udGVudFVybH0pIHtcclxuICAgIHRoaXMuaW5mbyA9IHtcclxuICAgICAgcGlkLFxyXG4gICAgICBhdmF0YXJVcmwsXHJcbiAgICAgIHVzZXJuYW1lLFxyXG4gICAgICBjb250ZW50LFxyXG4gICAgICBjb250ZW50VXJsXHJcbiAgICB9O1xyXG4gICAgdGhpcy5pZCA9IGBua2NCdWxsZXRfJHt0aGlzLmluZm8ucGlkfWA7XHJcbiAgfVxyXG59XHJcblxyXG5jbGFzcyBCdWxsZXRDb21tZW50cyB7XHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICB0aGlzLmlkID0gYG5rY0J1bGxldCR7RGF0ZS5ub3coKX0ke01hdGgucm91bmQoTWF0aC5yYW5kb20oKSAqIDEwMDApfWA7XHJcbiAgICB0aGlzLmNvbW1lbnRzID0gW107XHJcbiAgICB0aGlzLmJ1bGxldHMgPSBbXTtcclxuICAgIHRoaXMudHJhY2tzID0gW107XHJcbiAgICBmb3IobGV0IGkgPSAwOyBpIDwgNTsgaSsrKSB7XHJcbiAgICAgIHRoaXMudHJhY2tzLnB1c2goe1xyXG4gICAgICAgIGluZGV4OiBpLFxyXG4gICAgICAgIHNwZWVkOiA1ICsgTWF0aC5yb3VuZChNYXRoLnJhbmRvbSgpICogMTApLFxyXG4gICAgICAgIGlkbGU6IHRydWUsXHJcbiAgICAgICAgYnVsbGV0czogW11cclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICB0aGlzLnRyYW5zaXRpb24oKTtcclxuICB9XHJcbiAgZ2V0QnVsbGV0RG9tQnlCdWxsZXQoYnVsbGV0KSB7XHJcbiAgICBjb25zdCB7YXZhdGFyVXJsLCB1c2VybmFtZSwgY29udGVudCwgY29udGVudFVybCwgaWR9ID0gYnVsbGV0O1xyXG4gICAgY29uc3QgZG9tID0gJChgPGEgaHJlZj1cIiR7Y29udGVudFVybH1cIiBjbGFzcz1cImJ1bGxldFwiIGlkPVwiJHt0aGlzLmlkICsgJ18nICtpZH1cIj48aW1nIGNsYXNzPVwiYnVsbGV0LWF2YXRhclwiIHNyYz1cIiR7YXZhdGFyVXJsfVwiICBhbHQ9XCIke3VzZXJuYW1lfVwiLz48ZGl2IGNsYXNzPVwiYnVsbGV0LWNvbnRlbnRcIj4ke2NvbnRlbnR9PC9kaXY+PC9hPmApO1xyXG4gICAgZG9tLm9uKCdtb3VzZW92ZXInLCAoZSkgPT4ge1xyXG4gICAgICBjb25zdCB7bGVmdH0gPSBkb20ub2Zmc2V0KCk7XHJcbiAgICAgIGRvbS5hdHRyKCdzdHlsZScsIGBsZWZ0OiAke2xlZnR9cHghaW1wb3J0YW50O2ApO1xyXG4gICAgfSk7XHJcbiAgICBkb20ub24oYG1vdXNlbGVhdmVgLCAoKSA9PiB7XHJcbiAgICAgIGRvbS5hdHRyKCdzdHlsZScsIGBsZWZ0OiAkey0xICogZG9tLndpZHRoKCl9cHghaW1wb3J0YW50O2ApO1xyXG4gICAgfSk7XHJcbiAgICByZXR1cm4gZG9tO1xyXG4gIH1cclxuICBnZXRCdWxsZXRCeUNvbW1lbnQoY29tbWVudCkge1xyXG4gICAgY29uc3Qge2F2YXRhclVybCwgdXNlcm5hbWUsIGNvbnRlbnQsIGNvbnRlbnRVcmx9ID0gY29tbWVudDtcclxuICAgIGNvbnN0IGJ1bGxldCA9IHtcclxuICAgICAgc3RhdHVzOiAndW5EaXNwbGF5JyxcclxuICAgICAgYXZhdGFyVXJsLFxyXG4gICAgICB1c2VybmFtZSxcclxuICAgICAgY29udGVudCxcclxuICAgICAgY29udGVudFVybCxcclxuICAgICAgaWQ6IHRoaXMuY29tbWVudHMubGVuZ3RoXHJcbiAgICB9O1xyXG4gICAgdGhpcy5jb21tZW50cy5wdXNoKGJ1bGxldCk7XHJcbiAgICByZXR1cm4gYnVsbGV0O1xyXG4gIH1cclxuICBnZXRUcmFjaygpIHtcclxuICAgIGNvbnN0IGluZGV4ID0gTWF0aC5yb3VuZChNYXRoLnJhbmRvbSgpICogKHRoaXMudHJhY2tzLmxlbmd0aCAtIDEpKTtcclxuICAgIHJldHVybiB0aGlzLnRyYWNrc1tpbmRleF07XHJcbiAgfVxyXG4gIGFkZChjb21tZW50KSB7XHJcbiAgICBjb25zdCBidWxsZXQgPSB0aGlzLmdldEJ1bGxldEJ5Q29tbWVudChjb21tZW50KTtcclxuICAgIGNvbnN0IGJ1bGxldERvbSA9IHRoaXMuZ2V0QnVsbGV0RG9tQnlCdWxsZXQoYnVsbGV0KTtcclxuICAgIGNvbnN0IHRyYWNrID0gdGhpcy5nZXRUcmFjaygpO1xyXG4gICAgdHJhY2suYnVsbGV0cy5wdXNoKGJ1bGxldERvbSk7XHJcbiAgfVxyXG4gIHRyYW5zaXRpb24oKSB7XHJcbiAgICBjb25zdCBzZWxmID0gdGhpcztcclxuICAgIGNvbnN0IHt0cmFja3N9ID0gdGhpcztcclxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICBmb3IobGV0IGkgPSAwOyBpIDwgdHJhY2tzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgY29uc3QgdHJhY2sgPSB0cmFja3NbaV07XHJcbiAgICAgICAgY29uc3Qge2J1bGxldHN9ID0gdHJhY2s7XHJcbiAgICAgICAgY29uc3QgYnVsbGV0ID0gYnVsbGV0cy5zaGlmdCgpO1xyXG4gICAgICAgIGlmKCFidWxsZXQpIGNvbnRpbnVlO1xyXG4gICAgICAgICQoYm9keSkuYXBwZW5kKGJ1bGxldCk7XHJcbiAgICAgICAgY29uc3QgYnVsbGV0V2lkdGggPSBidWxsZXQud2lkdGgoKTtcclxuICAgICAgICBidWxsZXQuY3NzKHtcclxuICAgICAgICAgIC8vIGxlZnQ6IC0xICogYnVsbGV0V2lkdGgsXHJcbiAgICAgICAgICBsZWZ0OiAnMzByZW0nLFxyXG4gICAgICAgICAgdG9wOiBpICogMyArIDUgKyAncmVtJ1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGJ1bGxldC5jc3MoJ2xlZnQnLCAtMSAqIGJ1bGxldFdpZHRoKTtcclxuICAgICAgfVxyXG4gICAgICBzZWxmLnRyYW5zaXRpb24oKTtcclxuICAgIH0sIDUwMCk7XHJcbiAgfVxyXG4gIHN0YXJ0KCkge1xyXG5cclxuICB9XHJcbiAgcGF1c2UoKSB7XHJcblxyXG4gIH1cclxuICBjbGVhcigpIHtcclxuXHJcbiAgfVxyXG59XHJcblxyXG5OS0MubW9kdWxlcy5CdWxsZXRDb21tZW50cyA9IEJ1bGxldENvbW1lbnRzO1xyXG4iXX0=
