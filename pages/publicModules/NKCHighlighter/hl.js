(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/*
* 统计字数时需要排除以下dom结构，主要是媒体文件dom。
  此类dom在渲染的时候可能会为其添加辅助文字，如果不排除，当辅助文字发生变动，这将会影响当前已创建的所有批注。
  div.article-img-body 图片
  div.article-attachment 附件
  div.article-audio 音频
  div.article-video-body 视频
                         代码
                         公式
*
*
*
* */
NKC.modules.NKCHL =
/*#__PURE__*/
function () {
  function _class(options) {
    _classCallCheck(this, _class);

    var self = this;
    var type = options.type,
        targetId = options.targetId,
        _options$notes = options.notes,
        notes = _options$notes === void 0 ? [] : _options$notes;
    self.type = type;
    self.id = targetId;
    var el = "".concat(type, "-content-").concat(targetId);
    self.rootElement = document.getElementById(el);
    window.addEventListener("mouseup", function () {
      setTimeout(function () {
        self.removeBtn();
      }, 50);
    }, true);
    var hl = new NKCHighlighter({
      rootElementId: el,
      clownClass: ["MathJax_CHTML", // 公式
      "MathJax"],
      clownAttr: {
        "data-tag": "nkcsource"
      },
      clownTagName: ["code", "svg", "pre", "video", "audio", "source", "table", "style", "script"]
    });
    self.hl = hl;
    hl.on(hl.eventNames.select, function (data) {
      if (!NKC.methods.getLoginStatus()) {
        return;
      } // if(window.notePanel && window.notePanel.isOpen()) return;


      var range = data.range;
      self.sleep(200).then(function () {
        var offset = self.hl.getStartNodeOffset(range);
        if (!offset) return;
        var btn = self.createBtn2(offset); // const btn = self.createBtn(position);

        btn.onclick = function () {
          // 重新获取range
          // 避免dom变化导致range对象未更新的问题
          // range = hl.getRange();
          var node = hl.getNodes(range);
          var content = hl.getNodesContent(node);

          if ($(window).width() < 768) {
            NKC.methods.visitUrl("/note?content=".concat(content, "&targetId=").concat(self.id, "&type=post&offset=").concat(node.offset, "&length=").concat(node.length), true);
          } else {
            self.newNote({
              id: "",
              content: content,
              targetId: self.id,
              type: "post",
              notes: [],
              node: node
            }).then(function (note) {
              hl.createSource(note._id, note.node);
            })["catch"](sweetError);
          }
        };
      })["catch"](sweetError);
    }).on(hl.eventNames.create, function (source) {// hl.addClass(source, "post-node-mark");
    }).on(hl.eventNames.click, function (source) {
      if (NKC.methods.getLoginStatus()) {
        if ($(window).width() >= 768) {
          // if(window.notePanel && window.notePanel.isOpen()) return;
          self.showNotePanel(source.id);
        } else {
          NKC.methods.visitUrl("/note/".concat(source.id), true);
        }
      } else {
        NKC.methods.toLogin("login");
      }
    }).on(hl.eventNames.hover, function (source) {
      hl.addClass(source, "post-node-hover");
    }).on(hl.eventNames.hoverOut, function (source) {
      hl.removeClass(source, "post-node-hover");
    });
    hl.restoreSources(notes);
  }

  _createClass(_class, [{
    key: "createBtn2",
    value: function createBtn2(offset) {
      this.removeBtn();
      var top = offset.top,
          left = offset.left;
      var span = $("<span><span>添加笔记</span></span>");
      span.addClass("nkc-hl-btn");

      if ($(window).width() >= 768) {
        span.css({
          top: top - 2.6 * 12 + "px",
          left: left - 1.8 * 12 + "px"
        });
      } else {
        span.css({
          top: top - $(document).scrollTop() - 3 + "px"
        });
      }

      $(body).append(span);
      return span[0];
    }
  }, {
    key: "createBtn",
    value: function createBtn(position) {
      this.removeBtn();
      var btn = document.createElement("span");
      btn.classList.add("nkc-hl-btn");
      btn.innerText = "记笔记";
      var rootJQ = $(this.rootElement);

      var _rootJQ$offset = rootJQ.offset(),
          top = _rootJQ$offset.top,
          left = _rootJQ$offset.left;

      var scrollTop = $(window).scrollTop();
      var width = rootJQ.width();
      var btnTop = position.y - top + scrollTop;
      var btnLeft = position.x - left;
      if (btnLeft + 5 * 12 > left + width) btnLeft = left + width - 5 * 12;
      btn.style.top = btnTop + "px";
      btn.style.left = btnLeft + "px";
      this.rootElement.appendChild(btn);
      return btn;
    }
  }, {
    key: "removeBtn",
    value: function removeBtn() {
      $(".nkc-hl-btn").remove();
    }
  }, {
    key: "sleep",
    value: function sleep(t) {
      return new Promise(function (resolve) {
        setTimeout(function () {
          resolve();
        }, t);
      });
    }
  }, {
    key: "initNotePanel",
    value: function initNotePanel() {
      if (!window.notePanel) {
        window.notePanel = new NKC.modules.NotePanel();
      }
    }
  }, {
    key: "newNote",
    value: function newNote(note) {
      this.initNotePanel();
      return new Promise(function (resolve, reject) {
        window.notePanel.open(function (data) {
          resolve(data);
        }, {
          note: note
        });
      });
    }
  }, {
    key: "showNotePanel",
    value: function showNotePanel(id) {
      this.initNotePanel();
      window.notePanel.open(function (data) {}, {
        id: id
      });
    }
  }]);

  return _class;
}();

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9fYnJvd3Nlci1wYWNrQDYuMS4wQGJyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInBhZ2VzL3B1YmxpY01vZHVsZXMvTktDSGlnaGxpZ2h0ZXIvaGwubWpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7QUNBQTs7Ozs7Ozs7Ozs7OztBQWNBLEdBQUcsQ0FBQyxPQUFKLENBQVksS0FBWjtBQUFBO0FBQUE7QUFDRSxrQkFBWSxPQUFaLEVBQXFCO0FBQUE7O0FBQ25CLFFBQU0sSUFBSSxHQUFHLElBQWI7QUFEbUIsUUFFWixJQUZZLEdBRWtCLE9BRmxCLENBRVosSUFGWTtBQUFBLFFBRU4sUUFGTSxHQUVrQixPQUZsQixDQUVOLFFBRk07QUFBQSx5QkFFa0IsT0FGbEIsQ0FFSSxLQUZKO0FBQUEsUUFFSSxLQUZKLCtCQUVZLEVBRlo7QUFHbkIsSUFBQSxJQUFJLENBQUMsSUFBTCxHQUFZLElBQVo7QUFDQSxJQUFBLElBQUksQ0FBQyxFQUFMLEdBQVUsUUFBVjtBQUVBLFFBQU0sRUFBRSxhQUFNLElBQU4sc0JBQXNCLFFBQXRCLENBQVI7QUFDQSxJQUFBLElBQUksQ0FBQyxXQUFMLEdBQW1CLFFBQVEsQ0FBQyxjQUFULENBQXdCLEVBQXhCLENBQW5CO0FBQ0EsSUFBQSxNQUFNLENBQUMsZ0JBQVAsQ0FBd0IsU0FBeEIsRUFBbUMsWUFBTTtBQUN2QyxNQUFBLFVBQVUsQ0FBQyxZQUFNO0FBQ2YsUUFBQSxJQUFJLENBQUMsU0FBTDtBQUNELE9BRlMsRUFFUCxFQUZPLENBQVY7QUFHRCxLQUpELEVBSUcsSUFKSDtBQUtBLFFBQU0sRUFBRSxHQUFHLElBQUksY0FBSixDQUFtQjtBQUM1QixNQUFBLGFBQWEsRUFBRSxFQURhO0FBRTVCLE1BQUEsVUFBVSxFQUFFLENBQ1YsZUFEVSxFQUNPO0FBQ2pCLGVBRlUsQ0FGZ0I7QUFNNUIsTUFBQSxTQUFTLEVBQUU7QUFDVCxvQkFBWTtBQURILE9BTmlCO0FBUzVCLE1BQUEsWUFB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LENBQVksVUFBQyxPQUFELEVBQWE7QUFDOUIsUUFBQSxVQUFVLENBQUMsWUFBTTtBQUNmLFVBQUEsT0FBTztBQUNSLFNBRlMsRUFFUCxDQUZPLENBQVY7QUFHRCxPQUpNLENBQVA7QUFLRDtBQTlJSDtBQUFBO0FBQUEsb0NBK0lrQjtBQUNkLFVBQUcsQ0FBQyxNQUFNLENBQUMsU0FBWCxFQUFzQjtBQUNwQixRQUFBLE1BQU0sQ0FBQyxTQUFQLEdBQW1CLElBQUksR0FBRyxDQUFDLE9BQUosQ0FBWSxTQUFoQixFQUFuQjtBQUNEO0FBQ0Y7QUFuSkg7QUFBQTtBQUFBLDRCQW9KVSxJQXBKVixFQW9KZ0I7QUFDWixXQUFLLGFBQUw7QUFDQSxhQUFPLElBQUksT0FBSixDQUFZLFVBQUMsT0FBRCxFQUFVLE1BQVYsRUFBcUI7QUFDdEMsUUFBQSxNQUFNLENBQUMsU0FBUCxDQUFpQixJQUFqQixDQUFzQixVQUFBLElBQUksRUFBSTtBQUM1QixVQUFBLE9BQU8sQ0FBQyxJQUFELENBQVA7QUFDRCxTQUZELEVBRUc7QUFDRCxVQUFBLElBQUksRUFBSjtBQURDLFNBRkg7QUFLRCxPQU5NLENBQVA7QUFPRDtBQTdKSDtBQUFBO0FBQUEsa0NBOEpnQixFQTlKaEIsRUE4Sm9CO0FBQ2hCLFdBQUssYUFBTDtBQUNBLE1BQUEsTUFBTSxDQUFDLFNBQVAsQ0FBaUIsSUFBakIsQ0FBc0IsVUFBQSxJQUFJLEVBQUksQ0FDN0IsQ0FERCxFQUNHO0FBQ0QsUUFBQSxFQUFFLEVBQUY7QUFEQyxPQURIO0FBSUQ7QUFwS0g7O0FBQUE7QUFBQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIi8qXG4qIOe7n+iuoeWtl+aVsOaXtumcgOimgeaOkumZpOS7peS4i2Rvbee7k+aehO+8jOS4u+imgeaYr+WqkuS9k+aWh+S7tmRvbeOAglxuICDmraTnsbtkb23lnKjmuLLmn5PnmoTml7blgJnlj6/og73kvJrkuLrlhbbmt7vliqDovoXliqnmloflrZfvvIzlpoLmnpzkuI3mjpLpmaTvvIzlvZPovoXliqnmloflrZflj5HnlJ/lj5jliqjvvIzov5nlsIbkvJrlvbHlk43lvZPliY3lt7LliJvlu7rnmoTmiYDmnInmibnms6jjgIJcbiAgZGl2LmFydGljbGUtaW1nLWJvZHkg5Zu+54mHXG4gIGRpdi5hcnRpY2xlLWF0dGFjaG1lbnQg6ZmE5Lu2XG4gIGRpdi5hcnRpY2xlLWF1ZGlvIOmfs+mikVxuICBkaXYuYXJ0aWNsZS12aWRlby1ib2R5IOinhumikVxuICAgICAgICAgICAgICAgICAgICAgICAgIOS7o+eggVxuICAgICAgICAgICAgICAgICAgICAgICAgIOWFrOW8j1xuKlxuKlxuKlxuKiAqL1xuXG5OS0MubW9kdWxlcy5OS0NITCA9IGNsYXNzIHtcbiAgY29uc3RydWN0b3Iob3B0aW9ucykge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuICAgIGNvbnN0IHt0eXBlLCB0YXJnZXRJZCwgbm90ZXMgPSBbXX0gPSBvcHRpb25zO1xuICAgIHNlbGYudHlwZSA9IHR5cGU7XG4gICAgc2VsZi5pZCA9IHRhcmdldElkO1xuXG4gICAgY29uc3QgZWwgPSBgJHt0eXBlfS1jb250ZW50LSR7dGFyZ2V0SWR9YDtcbiAgICBzZWxmLnJvb3RFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoZWwpO1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwibW91c2V1cFwiLCAoKSA9PiB7XG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgc2VsZi5yZW1vdmVCdG4oKTtcbiAgICAgIH0sIDUwKVxuICAgIH0sIHRydWUpO1xuICAgIGNvbnN0IGhsID0gbmV3IE5LQ0hpZ2hsaWdodGVyKHtcbiAgICAgIHJvb3RFbGVtZW50SWQ6IGVsLFxuICAgICAgY2xvd25DbGFzczogW1xuICAgICAgICBcIk1hdGhKYXhfQ0hUTUxcIiwgLy8g5YWs5byPXG4gICAgICAgIFwiTWF0aEpheFwiXG4gICAgICBdLFxuICAgICAgY2xvd25BdHRyOiB7XG4gICAgICAgIFwiZGF0YS10YWdcIjogXCJua2Nzb3VyY2VcIlxuICAgICAgfSxcbiAgICAgIGNsb3duVGFnTmFtZTogW1xuICAgICAgICBcImNvZGVcIixcbiAgICAgICAgXCJzdmdcIixcbiAgICAgICAgXCJwcmVcIixcbiAgICAgICAgXCJ2aWRlb1wiLFxuICAgICAgICBcImF1ZGlvXCIsXG4gICAgICAgIFwic291cmNlXCIsXG4gICAgICAgIFwidGFibGVcIixcbiAgICAgICAgXCJzdHlsZVwiLFxuICAgICAgICBcInNjcmlwdFwiXG4gICAgICBdXG4gICAgfSk7XG4gICAgc2VsZi5obCA9IGhsO1xuICAgIGhsXG4gICAgICAub24oaGwuZXZlbnROYW1lcy5zZWxlY3QsIGRhdGEgPT4ge1xuICAgICAgICBpZighTktDLm1ldGhvZHMuZ2V0TG9naW5TdGF0dXMoKSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICAvLyBpZih3aW5kb3cubm90ZVBhbmVsICYmIHdpbmRvdy5ub3RlUGFuZWwuaXNPcGVuKCkpIHJldHVybjtcbiAgICAgICAgbGV0IHtyYW5nZX0gPSBkYXRhO1xuICAgICAgICBzZWxmLnNsZWVwKDIwMClcbiAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBvZmZzZXQgPSBzZWxmLmhsLmdldFN0YXJ0Tm9kZU9mZnNldChyYW5nZSk7XG4gICAgICAgICAgICBpZighb2Zmc2V0KSByZXR1cm47XG4gICAgICAgICAgICBjb25zdCBidG4gPSBzZWxmLmNyZWF0ZUJ0bjIob2Zmc2V0KTtcbiAgICAgICAgICAgIC8vIGNvbnN0IGJ0biA9IHNlbGYuY3JlYXRlQnRuKHBvc2l0aW9uKTtcbiAgICAgICAgICAgIGJ0bi5vbmNsaWNrID0gKCkgPT4ge1xuICAgICAgICAgICAgICAvLyDph43mlrDojrflj5ZyYW5nZVxuICAgICAgICAgICAgICAvLyDpgb/lhY1kb23lj5jljJblr7zoh7RyYW5nZeWvueixoeacquabtOaWsOeahOmXrumimFxuICAgICAgICAgICAgICAvLyByYW5nZSA9IGhsLmdldFJhbmdlKCk7XG4gICAgICAgICAgICAgIGxldCBub2RlID0gaGwuZ2V0Tm9kZXMocmFuZ2UpO1xuICAgICAgICAgICAgICBjb25zdCBjb250ZW50ID0gaGwuZ2V0Tm9kZXNDb250ZW50KG5vZGUpO1xuICAgICAgICAgICAgICBpZigkKHdpbmRvdykud2lkdGgoKSA8IDc2OCkge1xuICAgICAgICAgICAgICAgIE5LQy5tZXRob2RzLnZpc2l0VXJsKGAvbm90ZT9jb250ZW50PSR7Y29udGVudH0mdGFyZ2V0SWQ9JHtzZWxmLmlkfSZ0eXBlPXBvc3Qmb2Zmc2V0PSR7bm9kZS5vZmZzZXR9Jmxlbmd0aD0ke25vZGUubGVuZ3RofWAsIHRydWUpO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHNlbGYubmV3Tm90ZSh7XG4gICAgICAgICAgICAgICAgICBpZDogXCJcIixcbiAgICAgICAgICAgICAgICAgIGNvbnRlbnQsXG4gICAgICAgICAgICAgICAgICB0YXJnZXRJZDogc2VsZi5pZCxcbiAgICAgICAgICAgICAgICAgIHR5cGU6IFwicG9zdFwiLFxuICAgICAgICAgICAgICAgICAgbm90ZXM6IFtdLFxuICAgICAgICAgICAgICAgICAgbm9kZSxcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgLnRoZW4obm90ZSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGhsLmNyZWF0ZVNvdXJjZShub3RlLl9pZCwgbm90ZS5ub2RlKTtcbiAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAuY2F0Y2goc3dlZXRFcnJvcilcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pXG4gICAgICAgICAgLmNhdGNoKHN3ZWV0RXJyb3IpXG4gICAgICB9KVxuICAgICAgLm9uKGhsLmV2ZW50TmFtZXMuY3JlYXRlLCBzb3VyY2UgPT4ge1xuICAgICAgICAvLyBobC5hZGRDbGFzcyhzb3VyY2UsIFwicG9zdC1ub2RlLW1hcmtcIik7XG4gICAgICB9KVxuICAgICAgLm9uKGhsLmV2ZW50TmFtZXMuY2xpY2ssIGZ1bmN0aW9uKHNvdXJjZSkge1xuICAgICAgICBpZihOS0MubWV0aG9kcy5nZXRMb2dpblN0YXR1cygpKSB7XG4gICAgICAgICAgaWYoJCh3aW5kb3cpLndpZHRoKCkgPj0gNzY4KSB7XG4gICAgICAgICAgICAvLyBpZih3aW5kb3cubm90ZVBhbmVsICYmIHdpbmRvdy5ub3RlUGFuZWwuaXNPcGVuKCkpIHJldHVybjtcbiAgICAgICAgICAgIHNlbGYuc2hvd05vdGVQYW5lbChzb3VyY2UuaWQpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBOS0MubWV0aG9kcy52aXNpdFVybChgL25vdGUvJHtzb3VyY2UuaWR9YCwgdHJ1ZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIE5LQy5tZXRob2RzLnRvTG9naW4oXCJsb2dpblwiKTtcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICAgIC5vbihobC5ldmVudE5hbWVzLmhvdmVyLCBmdW5jdGlvbihzb3VyY2UpIHtcbiAgICAgICAgaGwuYWRkQ2xhc3Moc291cmNlLCBcInBvc3Qtbm9kZS1ob3ZlclwiKTtcbiAgICAgIH0pXG4gICAgICAub24oaGwuZXZlbnROYW1lcy5ob3Zlck91dCwgZnVuY3Rpb24oc291cmNlKSB7XG4gICAgICAgIGhsLnJlbW92ZUNsYXNzKHNvdXJjZSwgXCJwb3N0LW5vZGUtaG92ZXJcIik7XG4gICAgICB9KTtcbiAgICBobC5yZXN0b3JlU291cmNlcyhub3Rlcyk7XG4gIH1cbiAgY3JlYXRlQnRuMihvZmZzZXQpIHtcbiAgICB0aGlzLnJlbW92ZUJ0bigpO1xuICAgIGNvbnN0IHt0b3AsIGxlZnR9ID0gb2Zmc2V0O1xuICAgIGNvbnN0IHNwYW4gPSAkKFwiPHNwYW4+PHNwYW4+5re75Yqg56yU6K6wPC9zcGFuPjwvc3Bhbj5cIik7XG4gICAgc3Bhbi5hZGRDbGFzcyhcIm5rYy1obC1idG5cIik7XG4gICAgaWYoJCh3aW5kb3cpLndpZHRoKCkgPj0gNzY4KSB7XG4gICAgICBzcGFuLmNzcyh7XG4gICAgICAgIHRvcDogdG9wIC0gMi42ICogMTIgKyBcInB4XCIsXG4gICAgICAgIGxlZnQ6IGxlZnQgLSAxLjggKiAxMiArIFwicHhcIlxuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHNwYW4uY3NzKHtcbiAgICAgICAgdG9wOiB0b3AgLSAkKGRvY3VtZW50KS5zY3JvbGxUb3AoKSAtIDMrIFwicHhcIlxuICAgICAgfSk7XG4gICAgfVxuICAgICQoYm9keSkuYXBwZW5kKHNwYW4pO1xuICAgIHJldHVybiBzcGFuWzBdO1xuICB9XG4gIGNyZWF0ZUJ0bihwb3NpdGlvbikge1xuICAgIHRoaXMucmVtb3ZlQnRuKCk7XG4gICAgY29uc3QgYnRuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNwYW5cIik7XG4gICAgYnRuLmNsYXNzTGlzdC5hZGQoXCJua2MtaGwtYnRuXCIpO1xuICAgIGJ0bi5pbm5lclRleHQgPSBcIuiusOeslOiusFwiO1xuICAgIGNvbnN0IHJvb3RKUSA9ICQodGhpcy5yb290RWxlbWVudCk7XG4gICAgY29uc3Qge3RvcCwgbGVmdH0gPSByb290SlEub2Zmc2V0KCk7XG4gICAgY29uc3Qgc2Nyb2xsVG9wID0gJCh3aW5kb3cpLnNjcm9sbFRvcCgpO1xuICAgIGNvbnN0IHdpZHRoID0gcm9vdEpRLndpZHRoKCk7XG4gICAgbGV0IGJ0blRvcCA9IHBvc2l0aW9uLnkgLSB0b3AgKyBzY3JvbGxUb3A7XG4gICAgbGV0IGJ0bkxlZnQgPSBwb3NpdGlvbi54IC0gbGVmdDtcbiAgICBpZihidG5MZWZ0ICsgNSoxMiA+IGxlZnQgKyB3aWR0aCkgYnRuTGVmdCA9IGxlZnQgKyB3aWR0aCAtIDUqMTI7XG4gICAgYnRuLnN0eWxlLnRvcCA9IGJ0blRvcCArIFwicHhcIjtcbiAgICBidG4uc3R5bGUubGVmdCA9IGJ0bkxlZnQgKyBcInB4XCI7XG4gICAgdGhpcy5yb290RWxlbWVudC5hcHBlbmRDaGlsZChidG4pO1xuICAgIHJldHVybiBidG47XG4gIH1cbiAgcmVtb3ZlQnRuKCkge1xuICAgICQoXCIubmtjLWhsLWJ0blwiKS5yZW1vdmUoKTtcbiAgfVxuICBzbGVlcCh0KSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgfSwgdClcbiAgICB9KTtcbiAgfVxuICBpbml0Tm90ZVBhbmVsKCkge1xuICAgIGlmKCF3aW5kb3cubm90ZVBhbmVsKSB7XG4gICAgICB3aW5kb3cubm90ZVBhbmVsID0gbmV3IE5LQy5tb2R1bGVzLk5vdGVQYW5lbCgpO1xuICAgIH1cbiAgfVxuICBuZXdOb3RlKG5vdGUpIHtcbiAgICB0aGlzLmluaXROb3RlUGFuZWwoKTtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgd2luZG93Lm5vdGVQYW5lbC5vcGVuKGRhdGEgPT4ge1xuICAgICAgICByZXNvbHZlKGRhdGEpO1xuICAgICAgfSwge1xuICAgICAgICBub3RlXG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuICBzaG93Tm90ZVBhbmVsKGlkKSB7XG4gICAgdGhpcy5pbml0Tm90ZVBhbmVsKCk7XG4gICAgd2luZG93Lm5vdGVQYW5lbC5vcGVuKGRhdGEgPT4ge1xuICAgIH0sIHtcbiAgICAgIGlkXG4gICAgfSk7XG4gIH1cbn07XG5cbiJdfQ==
