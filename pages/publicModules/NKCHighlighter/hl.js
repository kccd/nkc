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
        notes = _options$notes === void 0 ? [] : _options$notes,
        _options$excludedElem = options.excludedElementClass,
        excludedElementClass = _options$excludedElem === void 0 ? [] : _options$excludedElem;
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
      excludedElementTagName: ["video", "audio", "source", "code", "pre", "table"],
      excludedElementClass: ["article-img-body", // 图片
      "article-attachment", // 附件
      "article-audio", // 音频
      "MathJax_CHTML", // 公式
      "article-video-body", // 视频
      "article-quote", // 引用
      "nkcHiddenBox" // 学术分隐藏
      ].concat(excludedElementClass)
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9fYnJvd3Nlci1wYWNrQDYuMS4wQGJyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInBhZ2VzL3B1YmxpY01vZHVsZXMvTktDSGlnaGxpZ2h0ZXIvaGwubWpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7QUNBQTs7Ozs7Ozs7Ozs7OztBQWNBLEdBQUcsQ0FBQyxPQUFKLENBQVksS0FBWjtBQUFBO0FBQUE7QUFDRSxrQkFBWSxPQUFaLEVBQXFCO0FBQUE7O0FBQ25CLFFBQU0sSUFBSSxHQUFHLElBQWI7QUFEbUIsUUFFWixJQUZZLEdBRTZDLE9BRjdDLENBRVosSUFGWTtBQUFBLFFBRU4sUUFGTSxHQUU2QyxPQUY3QyxDQUVOLFFBRk07QUFBQSx5QkFFNkMsT0FGN0MsQ0FFSSxLQUZKO0FBQUEsUUFFSSxLQUZKLCtCQUVZLEVBRlo7QUFBQSxnQ0FFNkMsT0FGN0MsQ0FFZ0Isb0JBRmhCO0FBQUEsUUFFZ0Isb0JBRmhCLHNDQUV1QyxFQUZ2QztBQUduQixJQUFBLElBQUksQ0FBQyxJQUFMLEdBQVksSUFBWjtBQUNBLElBQUEsSUFBSSxDQUFDLEVBQUwsR0FBVSxRQUFWO0FBRUEsUUFBTSxFQUFFLGFBQU0sSUFBTixzQkFBc0IsUUFBdEIsQ0FBUjtBQUNBLElBQUEsSUFBSSxDQUFDLFdBQUwsR0FBbUIsUUFBUSxDQUFDLGNBQVQsQ0FBd0IsRUFBeEIsQ0FBbkI7QUFDQSxJQUFBLE1BQU0sQ0FBQyxnQkFBUCxDQUF3QixTQUF4QixFQUFtQyxZQUFNO0FBQ3ZDLE1BQUEsVUFBVSxDQUFDLFlBQU07QUFDZixRQUFBLElBQUksQ0FBQyxTQUFMO0FBQ0QsT0FGUyxFQUVQLEVBRk8sQ0FBVjtBQUdELEtBSkQsRUFJRyxJQUpIO0FBS0EsUUFBTSxFQUFFLEdBQUcsSUFBSSxjQUFKLENBQW1CO0FBQzVCLE1BQUEsYUFBYSxFQUFFLEVBRGE7QUFFNUIsTUFBQSxzQkFBc0IsRUFBRSxDQUN0QixPQURzQixFQUV0QixPQUZzQixF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QVA7QUFDRDtBQW5JSDtBQUFBO0FBQUEsZ0NBb0ljO0FBQ1YsTUFBQSxDQUFDLENBQUMsYUFBRCxDQUFELENBQWlCLE1BQWpCO0FBQ0Q7QUF0SUg7QUFBQTtBQUFBLDBCQXVJUSxDQXZJUixFQXVJVztBQUNQLGFBQU8sSUFBSSxPQUFKLENBQVksVUFBQyxPQUFELEVBQWE7QUFDOUIsUUFBQSxVQUFVLENBQUMsWUFBTTtBQUNmLFVBQUEsT0FBTztBQUNSLFNBRlMsRUFFUCxDQUZPLENBQVY7QUFHRCxPQUpNLENBQVA7QUFLRDtBQTdJSDtBQUFBO0FBQUEsb0NBOElrQjtBQUNkLFVBQUcsQ0FBQyxNQUFNLENBQUMsU0FBWCxFQUFzQjtBQUNwQixRQUFBLE1BQU0sQ0FBQyxTQUFQLEdBQW1CLElBQUksR0FBRyxDQUFDLE9BQUosQ0FBWSxTQUFoQixFQUFuQjtBQUNEO0FBQ0Y7QUFsSkg7QUFBQTtBQUFBLDRCQW1KVSxJQW5KVixFQW1KZ0I7QUFDWixXQUFLLGFBQUw7QUFDQSxhQUFPLElBQUksT0FBSixDQUFZLFVBQUMsT0FBRCxFQUFVLE1BQVYsRUFBcUI7QUFDdEMsUUFBQSxNQUFNLENBQUMsU0FBUCxDQUFpQixJQUFqQixDQUFzQixVQUFBLElBQUksRUFBSTtBQUM1QixVQUFBLE9BQU8sQ0FBQyxJQUFELENBQVA7QUFDRCxTQUZELEVBRUc7QUFDRCxVQUFBLElBQUksRUFBSjtBQURDLFNBRkg7QUFLRCxPQU5NLENBQVA7QUFPRDtBQTVKSDtBQUFBO0FBQUEsa0NBNkpnQixFQTdKaEIsRUE2Sm9CO0FBQ2hCLFdBQUssYUFBTDtBQUNBLE1BQUEsTUFBTSxDQUFDLFNBQVAsQ0FBaUIsSUFBakIsQ0FBc0IsVUFBQSxJQUFJLEVBQUksQ0FDN0IsQ0FERCxFQUNHO0FBQ0QsUUFBQSxFQUFFLEVBQUY7QUFEQyxPQURIO0FBSUQ7QUFuS0g7O0FBQUE7QUFBQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIi8qXHJcbiog57uf6K6h5a2X5pWw5pe26ZyA6KaB5o6S6Zmk5Lul5LiLZG9t57uT5p6E77yM5Li76KaB5piv5aqS5L2T5paH5Lu2ZG9t44CCXHJcbiAg5q2k57G7ZG9t5Zyo5riy5p+T55qE5pe25YCZ5Y+v6IO95Lya5Li65YW25re75Yqg6L6F5Yqp5paH5a2X77yM5aaC5p6c5LiN5o6S6Zmk77yM5b2T6L6F5Yqp5paH5a2X5Y+R55Sf5Y+Y5Yqo77yM6L+Z5bCG5Lya5b2x5ZON5b2T5YmN5bey5Yib5bu655qE5omA5pyJ5om55rOo44CCXHJcbiAgZGl2LmFydGljbGUtaW1nLWJvZHkg5Zu+54mHXHJcbiAgZGl2LmFydGljbGUtYXR0YWNobWVudCDpmYTku7ZcclxuICBkaXYuYXJ0aWNsZS1hdWRpbyDpn7PpopFcclxuICBkaXYuYXJ0aWNsZS12aWRlby1ib2R5IOinhumikVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAg5Luj56CBXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICDlhazlvI9cclxuKlxyXG4qXHJcbipcclxuKiAqL1xyXG5cclxuTktDLm1vZHVsZXMuTktDSEwgPSBjbGFzcyB7XHJcbiAgY29uc3RydWN0b3Iob3B0aW9ucykge1xyXG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XHJcbiAgICBjb25zdCB7dHlwZSwgdGFyZ2V0SWQsIG5vdGVzID0gW10sIGV4Y2x1ZGVkRWxlbWVudENsYXNzID0gW119ID0gb3B0aW9ucztcclxuICAgIHNlbGYudHlwZSA9IHR5cGU7XHJcbiAgICBzZWxmLmlkID0gdGFyZ2V0SWQ7XHJcblxyXG4gICAgY29uc3QgZWwgPSBgJHt0eXBlfS1jb250ZW50LSR7dGFyZ2V0SWR9YDtcclxuICAgIHNlbGYucm9vdEVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChlbCk7XHJcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgKCkgPT4ge1xyXG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICBzZWxmLnJlbW92ZUJ0bigpO1xyXG4gICAgICB9LCA1MClcclxuICAgIH0sIHRydWUpO1xyXG4gICAgY29uc3QgaGwgPSBuZXcgTktDSGlnaGxpZ2h0ZXIoe1xyXG4gICAgICByb290RWxlbWVudElkOiBlbCxcclxuICAgICAgZXhjbHVkZWRFbGVtZW50VGFnTmFtZTogW1xyXG4gICAgICAgIFwidmlkZW9cIixcclxuICAgICAgICBcImF1ZGlvXCIsXHJcbiAgICAgICAgXCJzb3VyY2VcIixcclxuICAgICAgICBcImNvZGVcIixcclxuICAgICAgICBcInByZVwiLFxyXG4gICAgICAgIFwidGFibGVcIlxyXG4gICAgICBdLFxyXG4gICAgICBleGNsdWRlZEVsZW1lbnRDbGFzczogW1xyXG4gICAgICAgIFwiYXJ0aWNsZS1pbWctYm9keVwiLCAvLyDlm77niYdcclxuICAgICAgICBcImFydGljbGUtYXR0YWNobWVudFwiLCAvLyDpmYTku7ZcclxuICAgICAgICBcImFydGljbGUtYXVkaW9cIiwgLy8g6Z+z6aKRXHJcbiAgICAgICAgXCJNYXRoSmF4X0NIVE1MXCIsIC8vIOWFrOW8j1xyXG4gICAgICAgIFwiYXJ0aWNsZS12aWRlby1ib2R5XCIsIC8vIOinhumikVxyXG4gICAgICAgIFwiYXJ0aWNsZS1xdW90ZVwiLCAvLyDlvJXnlKhcclxuICAgICAgICBcIm5rY0hpZGRlbkJveFwiLCAvLyDlrabmnK/liIbpmpDol49cclxuICAgICAgXS5jb25jYXQoZXhjbHVkZWRFbGVtZW50Q2xhc3MpXHJcbiAgICB9KTtcclxuICAgIHNlbGYuaGwgPSBobDtcclxuICAgIGhsXHJcbiAgICAgIC5vbihobC5ldmVudE5hbWVzLnNlbGVjdCwgZGF0YSA9PiB7XHJcbiAgICAgICAgaWYoIU5LQy5tZXRob2RzLmdldExvZ2luU3RhdHVzKCkpIHtcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gaWYod2luZG93Lm5vdGVQYW5lbCAmJiB3aW5kb3cubm90ZVBhbmVsLmlzT3BlbigpKSByZXR1cm47XHJcbiAgICAgICAgbGV0IHtyYW5nZX0gPSBkYXRhO1xyXG4gICAgICAgIHNlbGYuc2xlZXAoMjAwKVxyXG4gICAgICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBvZmZzZXQgPSBzZWxmLmhsLmdldFN0YXJ0Tm9kZU9mZnNldChyYW5nZSk7XHJcbiAgICAgICAgICAgIGlmKCFvZmZzZXQpIHJldHVybjtcclxuICAgICAgICAgICAgY29uc3QgYnRuID0gc2VsZi5jcmVhdGVCdG4yKG9mZnNldCk7XHJcbiAgICAgICAgICAgIC8vIGNvbnN0IGJ0biA9IHNlbGYuY3JlYXRlQnRuKHBvc2l0aW9uKTtcclxuICAgICAgICAgICAgYnRuLm9uY2xpY2sgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgLy8g6YeN5paw6I635Y+WcmFuZ2VcclxuICAgICAgICAgICAgICAvLyDpgb/lhY1kb23lj5jljJblr7zoh7RyYW5nZeWvueixoeacquabtOaWsOeahOmXrumimFxyXG4gICAgICAgICAgICAgIC8vIHJhbmdlID0gaGwuZ2V0UmFuZ2UoKTtcclxuICAgICAgICAgICAgICBsZXQgbm9kZSA9IGhsLmdldE5vZGVzKHJhbmdlKTtcclxuICAgICAgICAgICAgICBjb25zdCBjb250ZW50ID0gaGwuZ2V0Tm9kZXNDb250ZW50KG5vZGUpO1xyXG4gICAgICAgICAgICAgIGlmKCQod2luZG93KS53aWR0aCgpIDwgNzY4KSB7XHJcbiAgICAgICAgICAgICAgICBOS0MubWV0aG9kcy52aXNpdFVybChgL25vdGU/Y29udGVudD0ke2NvbnRlbnR9JnRhcmdldElkPSR7c2VsZi5pZH0mdHlwZT1wb3N0Jm9mZnNldD0ke25vZGUub2Zmc2V0fSZsZW5ndGg9JHtub2RlLmxlbmd0aH1gLCB0cnVlKTtcclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgc2VsZi5uZXdOb3RlKHtcclxuICAgICAgICAgICAgICAgICAgaWQ6IFwiXCIsXHJcbiAgICAgICAgICAgICAgICAgIGNvbnRlbnQsXHJcbiAgICAgICAgICAgICAgICAgIHRhcmdldElkOiBzZWxmLmlkLFxyXG4gICAgICAgICAgICAgICAgICB0eXBlOiBcInBvc3RcIixcclxuICAgICAgICAgICAgICAgICAgbm90ZXM6IFtdLFxyXG4gICAgICAgICAgICAgICAgICBub2RlLFxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgLnRoZW4obm90ZSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaGwuY3JlYXRlU291cmNlKG5vdGUuX2lkLCBub3RlLm5vZGUpO1xyXG4gICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAuY2F0Y2goc3dlZXRFcnJvcilcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0pXHJcbiAgICAgICAgICAuY2F0Y2goc3dlZXRFcnJvcilcclxuICAgICAgfSlcclxuICAgICAgLm9uKGhsLmV2ZW50TmFtZXMuY3JlYXRlLCBzb3VyY2UgPT4ge1xyXG4gICAgICAgIC8vIGhsLmFkZENsYXNzKHNvdXJjZSwgXCJwb3N0LW5vZGUtbWFya1wiKTtcclxuICAgICAgfSlcclxuICAgICAgLm9uKGhsLmV2ZW50TmFtZXMuY2xpY2ssIGZ1bmN0aW9uKHNvdXJjZSkge1xyXG4gICAgICAgIGlmKE5LQy5tZXRob2RzLmdldExvZ2luU3RhdHVzKCkpIHtcclxuICAgICAgICAgIGlmKCQod2luZG93KS53aWR0aCgpID49IDc2OCkge1xyXG4gICAgICAgICAgICAvLyBpZih3aW5kb3cubm90ZVBhbmVsICYmIHdpbmRvdy5ub3RlUGFuZWwuaXNPcGVuKCkpIHJldHVybjtcclxuICAgICAgICAgICAgc2VsZi5zaG93Tm90ZVBhbmVsKHNvdXJjZS5pZCk7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBOS0MubWV0aG9kcy52aXNpdFVybChgL25vdGUvJHtzb3VyY2UuaWR9YCwgdHJ1ZSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIE5LQy5tZXRob2RzLnRvTG9naW4oXCJsb2dpblwiKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pXHJcbiAgICAgIC5vbihobC5ldmVudE5hbWVzLmhvdmVyLCBmdW5jdGlvbihzb3VyY2UpIHtcclxuICAgICAgICBobC5hZGRDbGFzcyhzb3VyY2UsIFwicG9zdC1ub2RlLWhvdmVyXCIpO1xyXG4gICAgICB9KVxyXG4gICAgICAub24oaGwuZXZlbnROYW1lcy5ob3Zlck91dCwgZnVuY3Rpb24oc291cmNlKSB7XHJcbiAgICAgICAgaGwucmVtb3ZlQ2xhc3Moc291cmNlLCBcInBvc3Qtbm9kZS1ob3ZlclwiKTtcclxuICAgICAgfSk7XHJcbiAgICBobC5yZXN0b3JlU291cmNlcyhub3Rlcyk7XHJcbiAgfVxyXG4gIGNyZWF0ZUJ0bjIob2Zmc2V0KSB7XHJcbiAgICB0aGlzLnJlbW92ZUJ0bigpO1xyXG4gICAgY29uc3Qge3RvcCwgbGVmdH0gPSBvZmZzZXQ7XHJcbiAgICBjb25zdCBzcGFuID0gJChcIjxzcGFuPjxzcGFuPua3u+WKoOeslOiusDwvc3Bhbj48L3NwYW4+XCIpO1xyXG4gICAgc3Bhbi5hZGRDbGFzcyhcIm5rYy1obC1idG5cIik7XHJcbiAgICBpZigkKHdpbmRvdykud2lkdGgoKSA+PSA3NjgpIHtcclxuICAgICAgc3Bhbi5jc3Moe1xyXG4gICAgICAgIHRvcDogdG9wIC0gMi42ICogMTIgKyBcInB4XCIsXHJcbiAgICAgICAgbGVmdDogbGVmdCAtIDEuOCAqIDEyICsgXCJweFwiXHJcbiAgICAgIH0pO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgc3Bhbi5jc3Moe1xyXG4gICAgICAgIHRvcDogdG9wIC0gJChkb2N1bWVudCkuc2Nyb2xsVG9wKCkgLSAzKyBcInB4XCJcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICAkKGJvZHkpLmFwcGVuZChzcGFuKTtcclxuICAgIHJldHVybiBzcGFuWzBdO1xyXG4gIH1cclxuICBjcmVhdGVCdG4ocG9zaXRpb24pIHtcclxuICAgIHRoaXMucmVtb3ZlQnRuKCk7XHJcbiAgICBjb25zdCBidG4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3BhblwiKTtcclxuICAgIGJ0bi5jbGFzc0xpc3QuYWRkKFwibmtjLWhsLWJ0blwiKTtcclxuICAgIGJ0bi5pbm5lclRleHQgPSBcIuiusOeslOiusFwiO1xyXG4gICAgY29uc3Qgcm9vdEpRID0gJCh0aGlzLnJvb3RFbGVtZW50KTtcclxuICAgIGNvbnN0IHt0b3AsIGxlZnR9ID0gcm9vdEpRLm9mZnNldCgpO1xyXG4gICAgY29uc3Qgc2Nyb2xsVG9wID0gJCh3aW5kb3cpLnNjcm9sbFRvcCgpO1xyXG4gICAgY29uc3Qgd2lkdGggPSByb290SlEud2lkdGgoKTtcclxuICAgIGxldCBidG5Ub3AgPSBwb3NpdGlvbi55IC0gdG9wICsgc2Nyb2xsVG9wO1xyXG4gICAgbGV0IGJ0bkxlZnQgPSBwb3NpdGlvbi54IC0gbGVmdDtcclxuICAgIGlmKGJ0bkxlZnQgKyA1KjEyID4gbGVmdCArIHdpZHRoKSBidG5MZWZ0ID0gbGVmdCArIHdpZHRoIC0gNSoxMjtcclxuICAgIGJ0bi5zdHlsZS50b3AgPSBidG5Ub3AgKyBcInB4XCI7XHJcbiAgICBidG4uc3R5bGUubGVmdCA9IGJ0bkxlZnQgKyBcInB4XCI7XHJcbiAgICB0aGlzLnJvb3RFbGVtZW50LmFwcGVuZENoaWxkKGJ0bik7XHJcbiAgICByZXR1cm4gYnRuO1xyXG4gIH1cclxuICByZW1vdmVCdG4oKSB7XHJcbiAgICAkKFwiLm5rYy1obC1idG5cIikucmVtb3ZlKCk7XHJcbiAgfVxyXG4gIHNsZWVwKHQpIHtcclxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xyXG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICByZXNvbHZlKCk7XHJcbiAgICAgIH0sIHQpXHJcbiAgICB9KTtcclxuICB9XHJcbiAgaW5pdE5vdGVQYW5lbCgpIHtcclxuICAgIGlmKCF3aW5kb3cubm90ZVBhbmVsKSB7XHJcbiAgICAgIHdpbmRvdy5ub3RlUGFuZWwgPSBuZXcgTktDLm1vZHVsZXMuTm90ZVBhbmVsKCk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIG5ld05vdGUobm90ZSkge1xyXG4gICAgdGhpcy5pbml0Tm90ZVBhbmVsKCk7XHJcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICB3aW5kb3cubm90ZVBhbmVsLm9wZW4oZGF0YSA9PiB7XHJcbiAgICAgICAgcmVzb2x2ZShkYXRhKTtcclxuICAgICAgfSwge1xyXG4gICAgICAgIG5vdGVcclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICB9XHJcbiAgc2hvd05vdGVQYW5lbChpZCkge1xyXG4gICAgdGhpcy5pbml0Tm90ZVBhbmVsKCk7XHJcbiAgICB3aW5kb3cubm90ZVBhbmVsLm9wZW4oZGF0YSA9PiB7XHJcbiAgICB9LCB7XHJcbiAgICAgIGlkXHJcbiAgICB9KTtcclxuICB9XHJcbn07XHJcblxyXG4iXX0=
