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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9fYnJvd3Nlci1wYWNrQDYuMS4wQGJyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInBhZ2VzL3B1YmxpY01vZHVsZXMvTktDSGlnaGxpZ2h0ZXIvaGwubWpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7QUNBQTs7Ozs7Ozs7Ozs7OztBQWNBLEdBQUcsQ0FBQyxPQUFKLENBQVksS0FBWjtBQUFBO0FBQUE7QUFDRSxrQkFBWSxPQUFaLEVBQXFCO0FBQUE7O0FBQ25CLFFBQU0sSUFBSSxHQUFHLElBQWI7QUFEbUIsUUFFWixJQUZZLEdBRWtCLE9BRmxCLENBRVosSUFGWTtBQUFBLFFBRU4sUUFGTSxHQUVrQixPQUZsQixDQUVOLFFBRk07QUFBQSx5QkFFa0IsT0FGbEIsQ0FFSSxLQUZKO0FBQUEsUUFFSSxLQUZKLCtCQUVZLEVBRlo7QUFHbkIsSUFBQSxJQUFJLENBQUMsSUFBTCxHQUFZLElBQVo7QUFDQSxJQUFBLElBQUksQ0FBQyxFQUFMLEdBQVUsUUFBVjtBQUVBLFFBQU0sRUFBRSxhQUFNLElBQU4sc0JBQXNCLFFBQXRCLENBQVI7QUFDQSxJQUFBLElBQUksQ0FBQyxXQUFMLEdBQW1CLFFBQVEsQ0FBQyxjQUFULENBQXdCLEVBQXhCLENBQW5CO0FBQ0EsSUFBQSxNQUFNLENBQUMsZ0JBQVAsQ0FBd0IsU0FBeEIsRUFBbUMsWUFBTTtBQUN2QyxNQUFBLFVBQVUsQ0FBQyxZQUFNO0FBQ2YsUUFBQSxJQUFJLENBQUMsU0FBTDtBQUNELE9BRlMsRUFFUCxFQUZPLENBQVY7QUFHRCxLQUpELEVBSUcsSUFKSDtBQUtBLFFBQU0sRUFBRSxHQUFHLElBQUksY0FBSixDQUFtQjtBQUM1QixNQUFBLGFBQWEsRUFBRSxFQURhO0FBRTVCLE1BQUEsVUFBVSxFQUFFLENBQ1YsZUFEVSxFQUNPO0FBQ2pCLGVBRlUsQ0FGZ0I7QUFNNUIsTUFBQSxTQUFTLEVBQUU7QUFDVCxvQkFBWTtBQURILE9BTmlCO0FBUzVCLE1BQUEsWUFB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LENBQVksVUFBQyxPQUFELEVBQWE7QUFDOUIsUUFBQSxVQUFVLENBQUMsWUFBTTtBQUNmLFVBQUEsT0FBTztBQUNSLFNBRlMsRUFFUCxDQUZPLENBQVY7QUFHRCxPQUpNLENBQVA7QUFLRDtBQTlJSDtBQUFBO0FBQUEsb0NBK0lrQjtBQUNkLFVBQUcsQ0FBQyxNQUFNLENBQUMsU0FBWCxFQUFzQjtBQUNwQixRQUFBLE1BQU0sQ0FBQyxTQUFQLEdBQW1CLElBQUksR0FBRyxDQUFDLE9BQUosQ0FBWSxTQUFoQixFQUFuQjtBQUNEO0FBQ0Y7QUFuSkg7QUFBQTtBQUFBLDRCQW9KVSxJQXBKVixFQW9KZ0I7QUFDWixXQUFLLGFBQUw7QUFDQSxhQUFPLElBQUksT0FBSixDQUFZLFVBQUMsT0FBRCxFQUFVLE1BQVYsRUFBcUI7QUFDdEMsUUFBQSxNQUFNLENBQUMsU0FBUCxDQUFpQixJQUFqQixDQUFzQixVQUFBLElBQUksRUFBSTtBQUM1QixVQUFBLE9BQU8sQ0FBQyxJQUFELENBQVA7QUFDRCxTQUZELEVBRUc7QUFDRCxVQUFBLElBQUksRUFBSjtBQURDLFNBRkg7QUFLRCxPQU5NLENBQVA7QUFPRDtBQTdKSDtBQUFBO0FBQUEsa0NBOEpnQixFQTlKaEIsRUE4Sm9CO0FBQ2hCLFdBQUssYUFBTDtBQUNBLE1BQUEsTUFBTSxDQUFDLFNBQVAsQ0FBaUIsSUFBakIsQ0FBc0IsVUFBQSxJQUFJLEVBQUksQ0FDN0IsQ0FERCxFQUNHO0FBQ0QsUUFBQSxFQUFFLEVBQUY7QUFEQyxPQURIO0FBSUQ7QUFwS0g7O0FBQUE7QUFBQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIi8qXHJcbiog57uf6K6h5a2X5pWw5pe26ZyA6KaB5o6S6Zmk5Lul5LiLZG9t57uT5p6E77yM5Li76KaB5piv5aqS5L2T5paH5Lu2ZG9t44CCXHJcbiAg5q2k57G7ZG9t5Zyo5riy5p+T55qE5pe25YCZ5Y+v6IO95Lya5Li65YW25re75Yqg6L6F5Yqp5paH5a2X77yM5aaC5p6c5LiN5o6S6Zmk77yM5b2T6L6F5Yqp5paH5a2X5Y+R55Sf5Y+Y5Yqo77yM6L+Z5bCG5Lya5b2x5ZON5b2T5YmN5bey5Yib5bu655qE5omA5pyJ5om55rOo44CCXHJcbiAgZGl2LmFydGljbGUtaW1nLWJvZHkg5Zu+54mHXHJcbiAgZGl2LmFydGljbGUtYXR0YWNobWVudCDpmYTku7ZcclxuICBkaXYuYXJ0aWNsZS1hdWRpbyDpn7PpopFcclxuICBkaXYuYXJ0aWNsZS12aWRlby1ib2R5IOinhumikVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAg5Luj56CBXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICDlhazlvI9cclxuKlxyXG4qXHJcbipcclxuKiAqL1xyXG5cclxuTktDLm1vZHVsZXMuTktDSEwgPSBjbGFzcyB7XHJcbiAgY29uc3RydWN0b3Iob3B0aW9ucykge1xyXG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XHJcbiAgICBjb25zdCB7dHlwZSwgdGFyZ2V0SWQsIG5vdGVzID0gW119ID0gb3B0aW9ucztcclxuICAgIHNlbGYudHlwZSA9IHR5cGU7XHJcbiAgICBzZWxmLmlkID0gdGFyZ2V0SWQ7XHJcblxyXG4gICAgY29uc3QgZWwgPSBgJHt0eXBlfS1jb250ZW50LSR7dGFyZ2V0SWR9YDtcclxuICAgIHNlbGYucm9vdEVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChlbCk7XHJcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgKCkgPT4ge1xyXG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICBzZWxmLnJlbW92ZUJ0bigpO1xyXG4gICAgICB9LCA1MClcclxuICAgIH0sIHRydWUpO1xyXG4gICAgY29uc3QgaGwgPSBuZXcgTktDSGlnaGxpZ2h0ZXIoe1xyXG4gICAgICByb290RWxlbWVudElkOiBlbCxcclxuICAgICAgY2xvd25DbGFzczogW1xyXG4gICAgICAgIFwiTWF0aEpheF9DSFRNTFwiLCAvLyDlhazlvI9cclxuICAgICAgICBcIk1hdGhKYXhcIlxyXG4gICAgICBdLFxyXG4gICAgICBjbG93bkF0dHI6IHtcclxuICAgICAgICBcImRhdGEtdGFnXCI6IFwibmtjc291cmNlXCJcclxuICAgICAgfSxcclxuICAgICAgY2xvd25UYWdOYW1lOiBbXHJcbiAgICAgICAgXCJjb2RlXCIsXHJcbiAgICAgICAgXCJzdmdcIixcclxuICAgICAgICBcInByZVwiLFxyXG4gICAgICAgIFwidmlkZW9cIixcclxuICAgICAgICBcImF1ZGlvXCIsXHJcbiAgICAgICAgXCJzb3VyY2VcIixcclxuICAgICAgICBcInRhYmxlXCIsXHJcbiAgICAgICAgXCJzdHlsZVwiLFxyXG4gICAgICAgIFwic2NyaXB0XCJcclxuICAgICAgXVxyXG4gICAgfSk7XHJcbiAgICBzZWxmLmhsID0gaGw7XHJcbiAgICBobFxyXG4gICAgICAub24oaGwuZXZlbnROYW1lcy5zZWxlY3QsIGRhdGEgPT4ge1xyXG4gICAgICAgIGlmKCFOS0MubWV0aG9kcy5nZXRMb2dpblN0YXR1cygpKSB7XHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIGlmKHdpbmRvdy5ub3RlUGFuZWwgJiYgd2luZG93Lm5vdGVQYW5lbC5pc09wZW4oKSkgcmV0dXJuO1xyXG4gICAgICAgIGxldCB7cmFuZ2V9ID0gZGF0YTtcclxuICAgICAgICBzZWxmLnNsZWVwKDIwMClcclxuICAgICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgY29uc3Qgb2Zmc2V0ID0gc2VsZi5obC5nZXRTdGFydE5vZGVPZmZzZXQocmFuZ2UpO1xyXG4gICAgICAgICAgICBpZighb2Zmc2V0KSByZXR1cm47XHJcbiAgICAgICAgICAgIGNvbnN0IGJ0biA9IHNlbGYuY3JlYXRlQnRuMihvZmZzZXQpO1xyXG4gICAgICAgICAgICAvLyBjb25zdCBidG4gPSBzZWxmLmNyZWF0ZUJ0bihwb3NpdGlvbik7XHJcbiAgICAgICAgICAgIGJ0bi5vbmNsaWNrID0gKCkgPT4ge1xyXG4gICAgICAgICAgICAgIC8vIOmHjeaWsOiOt+WPlnJhbmdlXHJcbiAgICAgICAgICAgICAgLy8g6YG/5YWNZG9t5Y+Y5YyW5a+86Ie0cmFuZ2Xlr7nosaHmnKrmm7TmlrDnmoTpl67pophcclxuICAgICAgICAgICAgICAvLyByYW5nZSA9IGhsLmdldFJhbmdlKCk7XHJcbiAgICAgICAgICAgICAgbGV0IG5vZGUgPSBobC5nZXROb2RlcyhyYW5nZSk7XHJcbiAgICAgICAgICAgICAgY29uc3QgY29udGVudCA9IGhsLmdldE5vZGVzQ29udGVudChub2RlKTtcclxuICAgICAgICAgICAgICBpZigkKHdpbmRvdykud2lkdGgoKSA8IDc2OCkge1xyXG4gICAgICAgICAgICAgICAgTktDLm1ldGhvZHMudmlzaXRVcmwoYC9ub3RlP2NvbnRlbnQ9JHtjb250ZW50fSZ0YXJnZXRJZD0ke3NlbGYuaWR9JnR5cGU9cG9zdCZvZmZzZXQ9JHtub2RlLm9mZnNldH0mbGVuZ3RoPSR7bm9kZS5sZW5ndGh9YCwgdHJ1ZSk7XHJcbiAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHNlbGYubmV3Tm90ZSh7XHJcbiAgICAgICAgICAgICAgICAgIGlkOiBcIlwiLFxyXG4gICAgICAgICAgICAgICAgICBjb250ZW50LFxyXG4gICAgICAgICAgICAgICAgICB0YXJnZXRJZDogc2VsZi5pZCxcclxuICAgICAgICAgICAgICAgICAgdHlwZTogXCJwb3N0XCIsXHJcbiAgICAgICAgICAgICAgICAgIG5vdGVzOiBbXSxcclxuICAgICAgICAgICAgICAgICAgbm9kZSxcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgIC50aGVuKG5vdGUgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGhsLmNyZWF0ZVNvdXJjZShub3RlLl9pZCwgbm90ZS5ub2RlKTtcclxuICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgLmNhdGNoKHN3ZWV0RXJyb3IpXHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9KVxyXG4gICAgICAgICAgLmNhdGNoKHN3ZWV0RXJyb3IpXHJcbiAgICAgIH0pXHJcbiAgICAgIC5vbihobC5ldmVudE5hbWVzLmNyZWF0ZSwgc291cmNlID0+IHtcclxuICAgICAgICAvLyBobC5hZGRDbGFzcyhzb3VyY2UsIFwicG9zdC1ub2RlLW1hcmtcIik7XHJcbiAgICAgIH0pXHJcbiAgICAgIC5vbihobC5ldmVudE5hbWVzLmNsaWNrLCBmdW5jdGlvbihzb3VyY2UpIHtcclxuICAgICAgICBpZihOS0MubWV0aG9kcy5nZXRMb2dpblN0YXR1cygpKSB7XHJcbiAgICAgICAgICBpZigkKHdpbmRvdykud2lkdGgoKSA+PSA3NjgpIHtcclxuICAgICAgICAgICAgLy8gaWYod2luZG93Lm5vdGVQYW5lbCAmJiB3aW5kb3cubm90ZVBhbmVsLmlzT3BlbigpKSByZXR1cm47XHJcbiAgICAgICAgICAgIHNlbGYuc2hvd05vdGVQYW5lbChzb3VyY2UuaWQpO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgTktDLm1ldGhvZHMudmlzaXRVcmwoYC9ub3RlLyR7c291cmNlLmlkfWAsIHRydWUpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBOS0MubWV0aG9kcy50b0xvZ2luKFwibG9naW5cIik7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KVxyXG4gICAgICAub24oaGwuZXZlbnROYW1lcy5ob3ZlciwgZnVuY3Rpb24oc291cmNlKSB7XHJcbiAgICAgICAgaGwuYWRkQ2xhc3Moc291cmNlLCBcInBvc3Qtbm9kZS1ob3ZlclwiKTtcclxuICAgICAgfSlcclxuICAgICAgLm9uKGhsLmV2ZW50TmFtZXMuaG92ZXJPdXQsIGZ1bmN0aW9uKHNvdXJjZSkge1xyXG4gICAgICAgIGhsLnJlbW92ZUNsYXNzKHNvdXJjZSwgXCJwb3N0LW5vZGUtaG92ZXJcIik7XHJcbiAgICAgIH0pO1xyXG4gICAgaGwucmVzdG9yZVNvdXJjZXMobm90ZXMpO1xyXG4gIH1cclxuICBjcmVhdGVCdG4yKG9mZnNldCkge1xyXG4gICAgdGhpcy5yZW1vdmVCdG4oKTtcclxuICAgIGNvbnN0IHt0b3AsIGxlZnR9ID0gb2Zmc2V0O1xyXG4gICAgY29uc3Qgc3BhbiA9ICQoXCI8c3Bhbj48c3Bhbj7mt7vliqDnrJTorrA8L3NwYW4+PC9zcGFuPlwiKTtcclxuICAgIHNwYW4uYWRkQ2xhc3MoXCJua2MtaGwtYnRuXCIpO1xyXG4gICAgaWYoJCh3aW5kb3cpLndpZHRoKCkgPj0gNzY4KSB7XHJcbiAgICAgIHNwYW4uY3NzKHtcclxuICAgICAgICB0b3A6IHRvcCAtIDIuNiAqIDEyICsgXCJweFwiLFxyXG4gICAgICAgIGxlZnQ6IGxlZnQgLSAxLjggKiAxMiArIFwicHhcIlxyXG4gICAgICB9KTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHNwYW4uY3NzKHtcclxuICAgICAgICB0b3A6IHRvcCAtICQoZG9jdW1lbnQpLnNjcm9sbFRvcCgpIC0gMysgXCJweFwiXHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgJChib2R5KS5hcHBlbmQoc3Bhbik7XHJcbiAgICByZXR1cm4gc3BhblswXTtcclxuICB9XHJcbiAgY3JlYXRlQnRuKHBvc2l0aW9uKSB7XHJcbiAgICB0aGlzLnJlbW92ZUJ0bigpO1xyXG4gICAgY29uc3QgYnRuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNwYW5cIik7XHJcbiAgICBidG4uY2xhc3NMaXN0LmFkZChcIm5rYy1obC1idG5cIik7XHJcbiAgICBidG4uaW5uZXJUZXh0ID0gXCLorrDnrJTorrBcIjtcclxuICAgIGNvbnN0IHJvb3RKUSA9ICQodGhpcy5yb290RWxlbWVudCk7XHJcbiAgICBjb25zdCB7dG9wLCBsZWZ0fSA9IHJvb3RKUS5vZmZzZXQoKTtcclxuICAgIGNvbnN0IHNjcm9sbFRvcCA9ICQod2luZG93KS5zY3JvbGxUb3AoKTtcclxuICAgIGNvbnN0IHdpZHRoID0gcm9vdEpRLndpZHRoKCk7XHJcbiAgICBsZXQgYnRuVG9wID0gcG9zaXRpb24ueSAtIHRvcCArIHNjcm9sbFRvcDtcclxuICAgIGxldCBidG5MZWZ0ID0gcG9zaXRpb24ueCAtIGxlZnQ7XHJcbiAgICBpZihidG5MZWZ0ICsgNSoxMiA+IGxlZnQgKyB3aWR0aCkgYnRuTGVmdCA9IGxlZnQgKyB3aWR0aCAtIDUqMTI7XHJcbiAgICBidG4uc3R5bGUudG9wID0gYnRuVG9wICsgXCJweFwiO1xyXG4gICAgYnRuLnN0eWxlLmxlZnQgPSBidG5MZWZ0ICsgXCJweFwiO1xyXG4gICAgdGhpcy5yb290RWxlbWVudC5hcHBlbmRDaGlsZChidG4pO1xyXG4gICAgcmV0dXJuIGJ0bjtcclxuICB9XHJcbiAgcmVtb3ZlQnRuKCkge1xyXG4gICAgJChcIi5ua2MtaGwtYnRuXCIpLnJlbW92ZSgpO1xyXG4gIH1cclxuICBzbGVlcCh0KSB7XHJcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcclxuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgcmVzb2x2ZSgpO1xyXG4gICAgICB9LCB0KVxyXG4gICAgfSk7XHJcbiAgfVxyXG4gIGluaXROb3RlUGFuZWwoKSB7XHJcbiAgICBpZighd2luZG93Lm5vdGVQYW5lbCkge1xyXG4gICAgICB3aW5kb3cubm90ZVBhbmVsID0gbmV3IE5LQy5tb2R1bGVzLk5vdGVQYW5lbCgpO1xyXG4gICAgfVxyXG4gIH1cclxuICBuZXdOb3RlKG5vdGUpIHtcclxuICAgIHRoaXMuaW5pdE5vdGVQYW5lbCgpO1xyXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgd2luZG93Lm5vdGVQYW5lbC5vcGVuKGRhdGEgPT4ge1xyXG4gICAgICAgIHJlc29sdmUoZGF0YSk7XHJcbiAgICAgIH0sIHtcclxuICAgICAgICBub3RlXHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgfVxyXG4gIHNob3dOb3RlUGFuZWwoaWQpIHtcclxuICAgIHRoaXMuaW5pdE5vdGVQYW5lbCgpO1xyXG4gICAgd2luZG93Lm5vdGVQYW5lbC5vcGVuKGRhdGEgPT4ge1xyXG4gICAgfSwge1xyXG4gICAgICBpZFxyXG4gICAgfSk7XHJcbiAgfVxyXG59O1xyXG5cclxuIl19
