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
      clownClass: ["MathJax_CHTML" // 公式
      ],
      clownAttr: {
        "data-tag": "nkcsource"
      },
      clownTagName: ["code", "pre", "video", "audio", "source", "table"],
      // 旧 已废弃
      excludedElementTagName: ["video", "audio", "source", "code", "pre", "table"],
      // 旧 已废弃
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9fYnJvd3Nlci1wYWNrQDYuMS4wQGJyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInBhZ2VzL3B1YmxpY01vZHVsZXMvTktDSGlnaGxpZ2h0ZXIvaGwubWpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7QUNBQTs7Ozs7Ozs7Ozs7OztBQWNBLEdBQUcsQ0FBQyxPQUFKLENBQVksS0FBWjtBQUFBO0FBQUE7QUFDRSxrQkFBWSxPQUFaLEVBQXFCO0FBQUE7O0FBQ25CLFFBQU0sSUFBSSxHQUFHLElBQWI7QUFEbUIsUUFFWixJQUZZLEdBRTZDLE9BRjdDLENBRVosSUFGWTtBQUFBLFFBRU4sUUFGTSxHQUU2QyxPQUY3QyxDQUVOLFFBRk07QUFBQSx5QkFFNkMsT0FGN0MsQ0FFSSxLQUZKO0FBQUEsUUFFSSxLQUZKLCtCQUVZLEVBRlo7QUFBQSxnQ0FFNkMsT0FGN0MsQ0FFZ0Isb0JBRmhCO0FBQUEsUUFFZ0Isb0JBRmhCLHNDQUV1QyxFQUZ2QztBQUduQixJQUFBLElBQUksQ0FBQyxJQUFMLEdBQVksSUFBWjtBQUNBLElBQUEsSUFBSSxDQUFDLEVBQUwsR0FBVSxRQUFWO0FBRUEsUUFBTSxFQUFFLGFBQU0sSUFBTixzQkFBc0IsUUFBdEIsQ0FBUjtBQUNBLElBQUEsSUFBSSxDQUFDLFdBQUwsR0FBbUIsUUFBUSxDQUFDLGNBQVQsQ0FBd0IsRUFBeEIsQ0FBbkI7QUFDQSxJQUFBLE1BQU0sQ0FBQyxnQkFBUCxDQUF3QixTQUF4QixFQUFtQyxZQUFNO0FBQ3ZDLE1BQUEsVUFBVSxDQUFDLFlBQU07QUFDZixRQUFBLElBQUksQ0FBQyxTQUFMO0FBQ0QsT0FGUyxFQUVQLEVBRk8sQ0FBVjtBQUdELEtBSkQsRUFJRyxJQUpIO0FBS0EsUUFBTSxFQUFFLEdBQUcsSUFBSSxjQUFKLENBQW1CO0FBQzVCLE1BQUEsYUFBYSxFQUFFLEVBRGE7QUFFNUIsTUFBQSxVQUFVLEVBQUUsQ0FDVixlQURVLENBQ087QUFEUCxPQUZnQjtB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QUFQLENBQWlCLElBQWpCLENBQXNCLFVBQUEsSUFBSSxFQUFJLENBQzdCLENBREQsRUFDRztBQUNELFFBQUEsRUFBRSxFQUFGO0FBREMsT0FESDtBQUlEO0FBbkxIOztBQUFBO0FBQUEiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCIvKlxuKiDnu5/orqHlrZfmlbDml7bpnIDopoHmjpLpmaTku6XkuItkb23nu5PmnoTvvIzkuLvopoHmmK/lqpLkvZPmlofku7Zkb23jgIJcbiAg5q2k57G7ZG9t5Zyo5riy5p+T55qE5pe25YCZ5Y+v6IO95Lya5Li65YW25re75Yqg6L6F5Yqp5paH5a2X77yM5aaC5p6c5LiN5o6S6Zmk77yM5b2T6L6F5Yqp5paH5a2X5Y+R55Sf5Y+Y5Yqo77yM6L+Z5bCG5Lya5b2x5ZON5b2T5YmN5bey5Yib5bu655qE5omA5pyJ5om55rOo44CCXG4gIGRpdi5hcnRpY2xlLWltZy1ib2R5IOWbvueJh1xuICBkaXYuYXJ0aWNsZS1hdHRhY2htZW50IOmZhOS7tlxuICBkaXYuYXJ0aWNsZS1hdWRpbyDpn7PpopFcbiAgZGl2LmFydGljbGUtdmlkZW8tYm9keSDop4bpopFcbiAgICAgICAgICAgICAgICAgICAgICAgICDku6PnoIFcbiAgICAgICAgICAgICAgICAgICAgICAgICDlhazlvI9cbipcbipcbipcbiogKi9cblxuTktDLm1vZHVsZXMuTktDSEwgPSBjbGFzcyB7XG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcbiAgICBjb25zdCB7dHlwZSwgdGFyZ2V0SWQsIG5vdGVzID0gW10sIGV4Y2x1ZGVkRWxlbWVudENsYXNzID0gW119ID0gb3B0aW9ucztcbiAgICBzZWxmLnR5cGUgPSB0eXBlO1xuICAgIHNlbGYuaWQgPSB0YXJnZXRJZDtcblxuICAgIGNvbnN0IGVsID0gYCR7dHlwZX0tY29udGVudC0ke3RhcmdldElkfWA7XG4gICAgc2VsZi5yb290RWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGVsKTtcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgKCkgPT4ge1xuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHNlbGYucmVtb3ZlQnRuKCk7XG4gICAgICB9LCA1MClcbiAgICB9LCB0cnVlKTtcbiAgICBjb25zdCBobCA9IG5ldyBOS0NIaWdobGlnaHRlcih7XG4gICAgICByb290RWxlbWVudElkOiBlbCxcbiAgICAgIGNsb3duQ2xhc3M6IFtcbiAgICAgICAgXCJNYXRoSmF4X0NIVE1MXCIsIC8vIOWFrOW8j1xuICAgICAgXSxcbiAgICAgIGNsb3duQXR0cjoge1xuICAgICAgICBcImRhdGEtdGFnXCI6IFwibmtjc291cmNlXCJcbiAgICAgIH0sXG4gICAgICBjbG93blRhZ05hbWU6IFtcbiAgICAgICAgXCJjb2RlXCIsXG4gICAgICAgIFwicHJlXCIsXG4gICAgICAgIFwidmlkZW9cIixcbiAgICAgICAgXCJhdWRpb1wiLFxuICAgICAgICBcInNvdXJjZVwiLFxuICAgICAgICBcInRhYmxlXCJcbiAgICAgIF0sXG4gICAgICAvLyDml6cg5bey5bqf5byDXG4gICAgICBleGNsdWRlZEVsZW1lbnRUYWdOYW1lOiBbXG4gICAgICAgIFwidmlkZW9cIixcbiAgICAgICAgXCJhdWRpb1wiLFxuICAgICAgICBcInNvdXJjZVwiLFxuICAgICAgICBcImNvZGVcIixcbiAgICAgICAgXCJwcmVcIixcbiAgICAgICAgXCJ0YWJsZVwiXG4gICAgICBdLFxuICAgICAgLy8g5penIOW3suW6n+W8g1xuICAgICAgZXhjbHVkZWRFbGVtZW50Q2xhc3M6IFtcbiAgICAgICAgXCJhcnRpY2xlLWltZy1ib2R5XCIsIC8vIOWbvueJh1xuICAgICAgICBcImFydGljbGUtYXR0YWNobWVudFwiLCAvLyDpmYTku7ZcbiAgICAgICAgXCJhcnRpY2xlLWF1ZGlvXCIsIC8vIOmfs+mikVxuICAgICAgICBcIk1hdGhKYXhfQ0hUTUxcIiwgLy8g5YWs5byPXG4gICAgICAgIFwiYXJ0aWNsZS12aWRlby1ib2R5XCIsIC8vIOinhumikVxuICAgICAgICBcImFydGljbGUtcXVvdGVcIiwgLy8g5byV55SoXG4gICAgICAgIFwibmtjSGlkZGVuQm94XCIsIC8vIOWtpuacr+WIhumakOiXj1xuICAgICAgXS5jb25jYXQoZXhjbHVkZWRFbGVtZW50Q2xhc3MpXG4gICAgfSk7XG4gICAgc2VsZi5obCA9IGhsO1xuICAgIGhsXG4gICAgICAub24oaGwuZXZlbnROYW1lcy5zZWxlY3QsIGRhdGEgPT4ge1xuICAgICAgICBpZighTktDLm1ldGhvZHMuZ2V0TG9naW5TdGF0dXMoKSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICAvLyBpZih3aW5kb3cubm90ZVBhbmVsICYmIHdpbmRvdy5ub3RlUGFuZWwuaXNPcGVuKCkpIHJldHVybjtcbiAgICAgICAgbGV0IHtyYW5nZX0gPSBkYXRhO1xuICAgICAgICBzZWxmLnNsZWVwKDIwMClcbiAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBvZmZzZXQgPSBzZWxmLmhsLmdldFN0YXJ0Tm9kZU9mZnNldChyYW5nZSk7XG4gICAgICAgICAgICBpZighb2Zmc2V0KSByZXR1cm47XG4gICAgICAgICAgICBjb25zdCBidG4gPSBzZWxmLmNyZWF0ZUJ0bjIob2Zmc2V0KTtcbiAgICAgICAgICAgIC8vIGNvbnN0IGJ0biA9IHNlbGYuY3JlYXRlQnRuKHBvc2l0aW9uKTtcbiAgICAgICAgICAgIGJ0bi5vbmNsaWNrID0gKCkgPT4ge1xuICAgICAgICAgICAgICAvLyDph43mlrDojrflj5ZyYW5nZVxuICAgICAgICAgICAgICAvLyDpgb/lhY1kb23lj5jljJblr7zoh7RyYW5nZeWvueixoeacquabtOaWsOeahOmXrumimFxuICAgICAgICAgICAgICAvLyByYW5nZSA9IGhsLmdldFJhbmdlKCk7XG4gICAgICAgICAgICAgIGxldCBub2RlID0gaGwuZ2V0Tm9kZXMocmFuZ2UpO1xuICAgICAgICAgICAgICBjb25zdCBjb250ZW50ID0gaGwuZ2V0Tm9kZXNDb250ZW50KG5vZGUpO1xuICAgICAgICAgICAgICBpZigkKHdpbmRvdykud2lkdGgoKSA8IDc2OCkge1xuICAgICAgICAgICAgICAgIE5LQy5tZXRob2RzLnZpc2l0VXJsKGAvbm90ZT9jb250ZW50PSR7Y29udGVudH0mdGFyZ2V0SWQ9JHtzZWxmLmlkfSZ0eXBlPXBvc3Qmb2Zmc2V0PSR7bm9kZS5vZmZzZXR9Jmxlbmd0aD0ke25vZGUubGVuZ3RofWAsIHRydWUpO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHNlbGYubmV3Tm90ZSh7XG4gICAgICAgICAgICAgICAgICBpZDogXCJcIixcbiAgICAgICAgICAgICAgICAgIGNvbnRlbnQsXG4gICAgICAgICAgICAgICAgICB0YXJnZXRJZDogc2VsZi5pZCxcbiAgICAgICAgICAgICAgICAgIHR5cGU6IFwicG9zdFwiLFxuICAgICAgICAgICAgICAgICAgbm90ZXM6IFtdLFxuICAgICAgICAgICAgICAgICAgbm9kZSxcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgLnRoZW4obm90ZSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGhsLmNyZWF0ZVNvdXJjZShub3RlLl9pZCwgbm90ZS5ub2RlKTtcbiAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAuY2F0Y2goc3dlZXRFcnJvcilcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pXG4gICAgICAgICAgLmNhdGNoKHN3ZWV0RXJyb3IpXG4gICAgICB9KVxuICAgICAgLm9uKGhsLmV2ZW50TmFtZXMuY3JlYXRlLCBzb3VyY2UgPT4ge1xuICAgICAgICAvLyBobC5hZGRDbGFzcyhzb3VyY2UsIFwicG9zdC1ub2RlLW1hcmtcIik7XG4gICAgICB9KVxuICAgICAgLm9uKGhsLmV2ZW50TmFtZXMuY2xpY2ssIGZ1bmN0aW9uKHNvdXJjZSkge1xuICAgICAgICBpZihOS0MubWV0aG9kcy5nZXRMb2dpblN0YXR1cygpKSB7XG4gICAgICAgICAgaWYoJCh3aW5kb3cpLndpZHRoKCkgPj0gNzY4KSB7XG4gICAgICAgICAgICAvLyBpZih3aW5kb3cubm90ZVBhbmVsICYmIHdpbmRvdy5ub3RlUGFuZWwuaXNPcGVuKCkpIHJldHVybjtcbiAgICAgICAgICAgIHNlbGYuc2hvd05vdGVQYW5lbChzb3VyY2UuaWQpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBOS0MubWV0aG9kcy52aXNpdFVybChgL25vdGUvJHtzb3VyY2UuaWR9YCwgdHJ1ZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIE5LQy5tZXRob2RzLnRvTG9naW4oXCJsb2dpblwiKTtcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICAgIC5vbihobC5ldmVudE5hbWVzLmhvdmVyLCBmdW5jdGlvbihzb3VyY2UpIHtcbiAgICAgICAgaGwuYWRkQ2xhc3Moc291cmNlLCBcInBvc3Qtbm9kZS1ob3ZlclwiKTtcbiAgICAgIH0pXG4gICAgICAub24oaGwuZXZlbnROYW1lcy5ob3Zlck91dCwgZnVuY3Rpb24oc291cmNlKSB7XG4gICAgICAgIGhsLnJlbW92ZUNsYXNzKHNvdXJjZSwgXCJwb3N0LW5vZGUtaG92ZXJcIik7XG4gICAgICB9KTtcbiAgICBobC5yZXN0b3JlU291cmNlcyhub3Rlcyk7XG4gIH1cbiAgY3JlYXRlQnRuMihvZmZzZXQpIHtcbiAgICB0aGlzLnJlbW92ZUJ0bigpO1xuICAgIGNvbnN0IHt0b3AsIGxlZnR9ID0gb2Zmc2V0O1xuICAgIGNvbnN0IHNwYW4gPSAkKFwiPHNwYW4+PHNwYW4+5re75Yqg56yU6K6wPC9zcGFuPjwvc3Bhbj5cIik7XG4gICAgc3Bhbi5hZGRDbGFzcyhcIm5rYy1obC1idG5cIik7XG4gICAgaWYoJCh3aW5kb3cpLndpZHRoKCkgPj0gNzY4KSB7XG4gICAgICBzcGFuLmNzcyh7XG4gICAgICAgIHRvcDogdG9wIC0gMi42ICogMTIgKyBcInB4XCIsXG4gICAgICAgIGxlZnQ6IGxlZnQgLSAxLjggKiAxMiArIFwicHhcIlxuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHNwYW4uY3NzKHtcbiAgICAgICAgdG9wOiB0b3AgLSAkKGRvY3VtZW50KS5zY3JvbGxUb3AoKSAtIDMrIFwicHhcIlxuICAgICAgfSk7XG4gICAgfVxuICAgICQoYm9keSkuYXBwZW5kKHNwYW4pO1xuICAgIHJldHVybiBzcGFuWzBdO1xuICB9XG4gIGNyZWF0ZUJ0bihwb3NpdGlvbikge1xuICAgIHRoaXMucmVtb3ZlQnRuKCk7XG4gICAgY29uc3QgYnRuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNwYW5cIik7XG4gICAgYnRuLmNsYXNzTGlzdC5hZGQoXCJua2MtaGwtYnRuXCIpO1xuICAgIGJ0bi5pbm5lclRleHQgPSBcIuiusOeslOiusFwiO1xuICAgIGNvbnN0IHJvb3RKUSA9ICQodGhpcy5yb290RWxlbWVudCk7XG4gICAgY29uc3Qge3RvcCwgbGVmdH0gPSByb290SlEub2Zmc2V0KCk7XG4gICAgY29uc3Qgc2Nyb2xsVG9wID0gJCh3aW5kb3cpLnNjcm9sbFRvcCgpO1xuICAgIGNvbnN0IHdpZHRoID0gcm9vdEpRLndpZHRoKCk7XG4gICAgbGV0IGJ0blRvcCA9IHBvc2l0aW9uLnkgLSB0b3AgKyBzY3JvbGxUb3A7XG4gICAgbGV0IGJ0bkxlZnQgPSBwb3NpdGlvbi54IC0gbGVmdDtcbiAgICBpZihidG5MZWZ0ICsgNSoxMiA+IGxlZnQgKyB3aWR0aCkgYnRuTGVmdCA9IGxlZnQgKyB3aWR0aCAtIDUqMTI7XG4gICAgYnRuLnN0eWxlLnRvcCA9IGJ0blRvcCArIFwicHhcIjtcbiAgICBidG4uc3R5bGUubGVmdCA9IGJ0bkxlZnQgKyBcInB4XCI7XG4gICAgdGhpcy5yb290RWxlbWVudC5hcHBlbmRDaGlsZChidG4pO1xuICAgIHJldHVybiBidG47XG4gIH1cbiAgcmVtb3ZlQnRuKCkge1xuICAgICQoXCIubmtjLWhsLWJ0blwiKS5yZW1vdmUoKTtcbiAgfVxuICBzbGVlcCh0KSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgfSwgdClcbiAgICB9KTtcbiAgfVxuICBpbml0Tm90ZVBhbmVsKCkge1xuICAgIGlmKCF3aW5kb3cubm90ZVBhbmVsKSB7XG4gICAgICB3aW5kb3cubm90ZVBhbmVsID0gbmV3IE5LQy5tb2R1bGVzLk5vdGVQYW5lbCgpO1xuICAgIH1cbiAgfVxuICBuZXdOb3RlKG5vdGUpIHtcbiAgICB0aGlzLmluaXROb3RlUGFuZWwoKTtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgd2luZG93Lm5vdGVQYW5lbC5vcGVuKGRhdGEgPT4ge1xuICAgICAgICByZXNvbHZlKGRhdGEpO1xuICAgICAgfSwge1xuICAgICAgICBub3RlXG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuICBzaG93Tm90ZVBhbmVsKGlkKSB7XG4gICAgdGhpcy5pbml0Tm90ZVBhbmVsKCk7XG4gICAgd2luZG93Lm5vdGVQYW5lbC5vcGVuKGRhdGEgPT4ge1xuICAgIH0sIHtcbiAgICAgIGlkXG4gICAgfSk7XG4gIH1cbn07XG5cbiJdfQ==
