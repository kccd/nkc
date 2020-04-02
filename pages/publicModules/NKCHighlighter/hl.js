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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9fYnJvd3Nlci1wYWNrQDYuMS4wQGJyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInBhZ2VzL3B1YmxpY01vZHVsZXMvTktDSGlnaGxpZ2h0ZXIvaGwubWpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7QUNBQTs7Ozs7Ozs7Ozs7OztBQWNBLEdBQUcsQ0FBQyxPQUFKLENBQVksS0FBWjtBQUFBO0FBQUE7QUFDRSxrQkFBWSxPQUFaLEVBQXFCO0FBQUE7O0FBQ25CLFFBQU0sSUFBSSxHQUFHLElBQWI7QUFEbUIsUUFFWixJQUZZLEdBRTZDLE9BRjdDLENBRVosSUFGWTtBQUFBLFFBRU4sUUFGTSxHQUU2QyxPQUY3QyxDQUVOLFFBRk07QUFBQSx5QkFFNkMsT0FGN0MsQ0FFSSxLQUZKO0FBQUEsUUFFSSxLQUZKLCtCQUVZLEVBRlo7QUFBQSxnQ0FFNkMsT0FGN0MsQ0FFZ0Isb0JBRmhCO0FBQUEsUUFFZ0Isb0JBRmhCLHNDQUV1QyxFQUZ2QztBQUduQixJQUFBLElBQUksQ0FBQyxJQUFMLEdBQVksSUFBWjtBQUNBLElBQUEsSUFBSSxDQUFDLEVBQUwsR0FBVSxRQUFWO0FBRUEsUUFBTSxFQUFFLGFBQU0sSUFBTixzQkFBc0IsUUFBdEIsQ0FBUjtBQUNBLElBQUEsSUFBSSxDQUFDLFdBQUwsR0FBbUIsUUFBUSxDQUFDLGNBQVQsQ0FBd0IsRUFBeEIsQ0FBbkI7QUFDQSxJQUFBLE1BQU0sQ0FBQyxnQkFBUCxDQUF3QixTQUF4QixFQUFtQyxZQUFNO0FBQ3ZDLE1BQUEsVUFBVSxDQUFDLFlBQU07QUFDZixRQUFBLElBQUksQ0FBQyxTQUFMO0FBQ0QsT0FGUyxFQUVQLEVBRk8sQ0FBVjtBQUdELEtBSkQsRUFJRyxJQUpIO0FBS0EsUUFBTSxFQUFFLEdBQUcsSUFBSSxjQUFKLENBQW1CO0FBQzVCLE1BQUEsYUFBYSxFQUFFLEVBRGE7QUFFNUIsTUFBQSxVQUFVLEVBQUUsQ0FDVixlQURVLENBQ087QUFEUCxPQUZnQjtB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QUFQLENBQWlCLElBQWpCLENBQXNCLFVBQUEsSUFBSSxFQUFJLENBQzdCLENBREQsRUFDRztBQUNELFFBQUEsRUFBRSxFQUFGO0FBREMsT0FESDtBQUlEO0FBbkxIOztBQUFBO0FBQUEiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCIvKlxyXG4qIOe7n+iuoeWtl+aVsOaXtumcgOimgeaOkumZpOS7peS4i2Rvbee7k+aehO+8jOS4u+imgeaYr+WqkuS9k+aWh+S7tmRvbeOAglxyXG4gIOatpOexu2RvbeWcqOa4suafk+eahOaXtuWAmeWPr+iDveS8muS4uuWFtua3u+WKoOi+heWKqeaWh+Wtl++8jOWmguaenOS4jeaOkumZpO+8jOW9k+i+heWKqeaWh+Wtl+WPkeeUn+WPmOWKqO+8jOi/meWwhuS8muW9seWTjeW9k+WJjeW3suWIm+W7uueahOaJgOacieaJueazqOOAglxyXG4gIGRpdi5hcnRpY2xlLWltZy1ib2R5IOWbvueJh1xyXG4gIGRpdi5hcnRpY2xlLWF0dGFjaG1lbnQg6ZmE5Lu2XHJcbiAgZGl2LmFydGljbGUtYXVkaW8g6Z+z6aKRXHJcbiAgZGl2LmFydGljbGUtdmlkZW8tYm9keSDop4bpopFcclxuICAgICAgICAgICAgICAgICAgICAgICAgIOS7o+eggVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAg5YWs5byPXHJcbipcclxuKlxyXG4qXHJcbiogKi9cclxuXHJcbk5LQy5tb2R1bGVzLk5LQ0hMID0gY2xhc3Mge1xyXG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcclxuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xyXG4gICAgY29uc3Qge3R5cGUsIHRhcmdldElkLCBub3RlcyA9IFtdLCBleGNsdWRlZEVsZW1lbnRDbGFzcyA9IFtdfSA9IG9wdGlvbnM7XHJcbiAgICBzZWxmLnR5cGUgPSB0eXBlO1xyXG4gICAgc2VsZi5pZCA9IHRhcmdldElkO1xyXG5cclxuICAgIGNvbnN0IGVsID0gYCR7dHlwZX0tY29udGVudC0ke3RhcmdldElkfWA7XHJcbiAgICBzZWxmLnJvb3RFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoZWwpO1xyXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZXVwXCIsICgpID0+IHtcclxuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgc2VsZi5yZW1vdmVCdG4oKTtcclxuICAgICAgfSwgNTApXHJcbiAgICB9LCB0cnVlKTtcclxuICAgIGNvbnN0IGhsID0gbmV3IE5LQ0hpZ2hsaWdodGVyKHtcclxuICAgICAgcm9vdEVsZW1lbnRJZDogZWwsXHJcbiAgICAgIGNsb3duQ2xhc3M6IFtcclxuICAgICAgICBcIk1hdGhKYXhfQ0hUTUxcIiwgLy8g5YWs5byPXHJcbiAgICAgIF0sXHJcbiAgICAgIGNsb3duQXR0cjoge1xyXG4gICAgICAgIFwiZGF0YS10YWdcIjogXCJua2Nzb3VyY2VcIlxyXG4gICAgICB9LFxyXG4gICAgICBjbG93blRhZ05hbWU6IFtcclxuICAgICAgICBcImNvZGVcIixcclxuICAgICAgICBcInByZVwiLFxyXG4gICAgICAgIFwidmlkZW9cIixcclxuICAgICAgICBcImF1ZGlvXCIsXHJcbiAgICAgICAgXCJzb3VyY2VcIixcclxuICAgICAgICBcInRhYmxlXCJcclxuICAgICAgXSxcclxuICAgICAgLy8g5penIOW3suW6n+W8g1xyXG4gICAgICBleGNsdWRlZEVsZW1lbnRUYWdOYW1lOiBbXHJcbiAgICAgICAgXCJ2aWRlb1wiLFxyXG4gICAgICAgIFwiYXVkaW9cIixcclxuICAgICAgICBcInNvdXJjZVwiLFxyXG4gICAgICAgIFwiY29kZVwiLFxyXG4gICAgICAgIFwicHJlXCIsXHJcbiAgICAgICAgXCJ0YWJsZVwiXHJcbiAgICAgIF0sXHJcbiAgICAgIC8vIOaXpyDlt7Llup/lvINcclxuICAgICAgZXhjbHVkZWRFbGVtZW50Q2xhc3M6IFtcclxuICAgICAgICBcImFydGljbGUtaW1nLWJvZHlcIiwgLy8g5Zu+54mHXHJcbiAgICAgICAgXCJhcnRpY2xlLWF0dGFjaG1lbnRcIiwgLy8g6ZmE5Lu2XHJcbiAgICAgICAgXCJhcnRpY2xlLWF1ZGlvXCIsIC8vIOmfs+mikVxyXG4gICAgICAgIFwiTWF0aEpheF9DSFRNTFwiLCAvLyDlhazlvI9cclxuICAgICAgICBcImFydGljbGUtdmlkZW8tYm9keVwiLCAvLyDop4bpopFcclxuICAgICAgICBcImFydGljbGUtcXVvdGVcIiwgLy8g5byV55SoXHJcbiAgICAgICAgXCJua2NIaWRkZW5Cb3hcIiwgLy8g5a2m5pyv5YiG6ZqQ6JePXHJcbiAgICAgIF0uY29uY2F0KGV4Y2x1ZGVkRWxlbWVudENsYXNzKVxyXG4gICAgfSk7XHJcbiAgICBzZWxmLmhsID0gaGw7XHJcbiAgICBobFxyXG4gICAgICAub24oaGwuZXZlbnROYW1lcy5zZWxlY3QsIGRhdGEgPT4ge1xyXG4gICAgICAgIGlmKCFOS0MubWV0aG9kcy5nZXRMb2dpblN0YXR1cygpKSB7XHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIGlmKHdpbmRvdy5ub3RlUGFuZWwgJiYgd2luZG93Lm5vdGVQYW5lbC5pc09wZW4oKSkgcmV0dXJuO1xyXG4gICAgICAgIGxldCB7cmFuZ2V9ID0gZGF0YTtcclxuICAgICAgICBzZWxmLnNsZWVwKDIwMClcclxuICAgICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgY29uc3Qgb2Zmc2V0ID0gc2VsZi5obC5nZXRTdGFydE5vZGVPZmZzZXQocmFuZ2UpO1xyXG4gICAgICAgICAgICBpZighb2Zmc2V0KSByZXR1cm47XHJcbiAgICAgICAgICAgIGNvbnN0IGJ0biA9IHNlbGYuY3JlYXRlQnRuMihvZmZzZXQpO1xyXG4gICAgICAgICAgICAvLyBjb25zdCBidG4gPSBzZWxmLmNyZWF0ZUJ0bihwb3NpdGlvbik7XHJcbiAgICAgICAgICAgIGJ0bi5vbmNsaWNrID0gKCkgPT4ge1xyXG4gICAgICAgICAgICAgIC8vIOmHjeaWsOiOt+WPlnJhbmdlXHJcbiAgICAgICAgICAgICAgLy8g6YG/5YWNZG9t5Y+Y5YyW5a+86Ie0cmFuZ2Xlr7nosaHmnKrmm7TmlrDnmoTpl67pophcclxuICAgICAgICAgICAgICAvLyByYW5nZSA9IGhsLmdldFJhbmdlKCk7XHJcbiAgICAgICAgICAgICAgbGV0IG5vZGUgPSBobC5nZXROb2RlcyhyYW5nZSk7XHJcbiAgICAgICAgICAgICAgY29uc3QgY29udGVudCA9IGhsLmdldE5vZGVzQ29udGVudChub2RlKTtcclxuICAgICAgICAgICAgICBpZigkKHdpbmRvdykud2lkdGgoKSA8IDc2OCkge1xyXG4gICAgICAgICAgICAgICAgTktDLm1ldGhvZHMudmlzaXRVcmwoYC9ub3RlP2NvbnRlbnQ9JHtjb250ZW50fSZ0YXJnZXRJZD0ke3NlbGYuaWR9JnR5cGU9cG9zdCZvZmZzZXQ9JHtub2RlLm9mZnNldH0mbGVuZ3RoPSR7bm9kZS5sZW5ndGh9YCwgdHJ1ZSk7XHJcbiAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHNlbGYubmV3Tm90ZSh7XHJcbiAgICAgICAgICAgICAgICAgIGlkOiBcIlwiLFxyXG4gICAgICAgICAgICAgICAgICBjb250ZW50LFxyXG4gICAgICAgICAgICAgICAgICB0YXJnZXRJZDogc2VsZi5pZCxcclxuICAgICAgICAgICAgICAgICAgdHlwZTogXCJwb3N0XCIsXHJcbiAgICAgICAgICAgICAgICAgIG5vdGVzOiBbXSxcclxuICAgICAgICAgICAgICAgICAgbm9kZSxcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgIC50aGVuKG5vdGUgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGhsLmNyZWF0ZVNvdXJjZShub3RlLl9pZCwgbm90ZS5ub2RlKTtcclxuICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgLmNhdGNoKHN3ZWV0RXJyb3IpXHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9KVxyXG4gICAgICAgICAgLmNhdGNoKHN3ZWV0RXJyb3IpXHJcbiAgICAgIH0pXHJcbiAgICAgIC5vbihobC5ldmVudE5hbWVzLmNyZWF0ZSwgc291cmNlID0+IHtcclxuICAgICAgICAvLyBobC5hZGRDbGFzcyhzb3VyY2UsIFwicG9zdC1ub2RlLW1hcmtcIik7XHJcbiAgICAgIH0pXHJcbiAgICAgIC5vbihobC5ldmVudE5hbWVzLmNsaWNrLCBmdW5jdGlvbihzb3VyY2UpIHtcclxuICAgICAgICBpZihOS0MubWV0aG9kcy5nZXRMb2dpblN0YXR1cygpKSB7XHJcbiAgICAgICAgICBpZigkKHdpbmRvdykud2lkdGgoKSA+PSA3NjgpIHtcclxuICAgICAgICAgICAgLy8gaWYod2luZG93Lm5vdGVQYW5lbCAmJiB3aW5kb3cubm90ZVBhbmVsLmlzT3BlbigpKSByZXR1cm47XHJcbiAgICAgICAgICAgIHNlbGYuc2hvd05vdGVQYW5lbChzb3VyY2UuaWQpO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgTktDLm1ldGhvZHMudmlzaXRVcmwoYC9ub3RlLyR7c291cmNlLmlkfWAsIHRydWUpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBOS0MubWV0aG9kcy50b0xvZ2luKFwibG9naW5cIik7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KVxyXG4gICAgICAub24oaGwuZXZlbnROYW1lcy5ob3ZlciwgZnVuY3Rpb24oc291cmNlKSB7XHJcbiAgICAgICAgaGwuYWRkQ2xhc3Moc291cmNlLCBcInBvc3Qtbm9kZS1ob3ZlclwiKTtcclxuICAgICAgfSlcclxuICAgICAgLm9uKGhsLmV2ZW50TmFtZXMuaG92ZXJPdXQsIGZ1bmN0aW9uKHNvdXJjZSkge1xyXG4gICAgICAgIGhsLnJlbW92ZUNsYXNzKHNvdXJjZSwgXCJwb3N0LW5vZGUtaG92ZXJcIik7XHJcbiAgICAgIH0pO1xyXG4gICAgaGwucmVzdG9yZVNvdXJjZXMobm90ZXMpO1xyXG4gIH1cclxuICBjcmVhdGVCdG4yKG9mZnNldCkge1xyXG4gICAgdGhpcy5yZW1vdmVCdG4oKTtcclxuICAgIGNvbnN0IHt0b3AsIGxlZnR9ID0gb2Zmc2V0O1xyXG4gICAgY29uc3Qgc3BhbiA9ICQoXCI8c3Bhbj48c3Bhbj7mt7vliqDnrJTorrA8L3NwYW4+PC9zcGFuPlwiKTtcclxuICAgIHNwYW4uYWRkQ2xhc3MoXCJua2MtaGwtYnRuXCIpO1xyXG4gICAgaWYoJCh3aW5kb3cpLndpZHRoKCkgPj0gNzY4KSB7XHJcbiAgICAgIHNwYW4uY3NzKHtcclxuICAgICAgICB0b3A6IHRvcCAtIDIuNiAqIDEyICsgXCJweFwiLFxyXG4gICAgICAgIGxlZnQ6IGxlZnQgLSAxLjggKiAxMiArIFwicHhcIlxyXG4gICAgICB9KTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHNwYW4uY3NzKHtcclxuICAgICAgICB0b3A6IHRvcCAtICQoZG9jdW1lbnQpLnNjcm9sbFRvcCgpIC0gMysgXCJweFwiXHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgJChib2R5KS5hcHBlbmQoc3Bhbik7XHJcbiAgICByZXR1cm4gc3BhblswXTtcclxuICB9XHJcbiAgY3JlYXRlQnRuKHBvc2l0aW9uKSB7XHJcbiAgICB0aGlzLnJlbW92ZUJ0bigpO1xyXG4gICAgY29uc3QgYnRuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNwYW5cIik7XHJcbiAgICBidG4uY2xhc3NMaXN0LmFkZChcIm5rYy1obC1idG5cIik7XHJcbiAgICBidG4uaW5uZXJUZXh0ID0gXCLorrDnrJTorrBcIjtcclxuICAgIGNvbnN0IHJvb3RKUSA9ICQodGhpcy5yb290RWxlbWVudCk7XHJcbiAgICBjb25zdCB7dG9wLCBsZWZ0fSA9IHJvb3RKUS5vZmZzZXQoKTtcclxuICAgIGNvbnN0IHNjcm9sbFRvcCA9ICQod2luZG93KS5zY3JvbGxUb3AoKTtcclxuICAgIGNvbnN0IHdpZHRoID0gcm9vdEpRLndpZHRoKCk7XHJcbiAgICBsZXQgYnRuVG9wID0gcG9zaXRpb24ueSAtIHRvcCArIHNjcm9sbFRvcDtcclxuICAgIGxldCBidG5MZWZ0ID0gcG9zaXRpb24ueCAtIGxlZnQ7XHJcbiAgICBpZihidG5MZWZ0ICsgNSoxMiA+IGxlZnQgKyB3aWR0aCkgYnRuTGVmdCA9IGxlZnQgKyB3aWR0aCAtIDUqMTI7XHJcbiAgICBidG4uc3R5bGUudG9wID0gYnRuVG9wICsgXCJweFwiO1xyXG4gICAgYnRuLnN0eWxlLmxlZnQgPSBidG5MZWZ0ICsgXCJweFwiO1xyXG4gICAgdGhpcy5yb290RWxlbWVudC5hcHBlbmRDaGlsZChidG4pO1xyXG4gICAgcmV0dXJuIGJ0bjtcclxuICB9XHJcbiAgcmVtb3ZlQnRuKCkge1xyXG4gICAgJChcIi5ua2MtaGwtYnRuXCIpLnJlbW92ZSgpO1xyXG4gIH1cclxuICBzbGVlcCh0KSB7XHJcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcclxuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgcmVzb2x2ZSgpO1xyXG4gICAgICB9LCB0KVxyXG4gICAgfSk7XHJcbiAgfVxyXG4gIGluaXROb3RlUGFuZWwoKSB7XHJcbiAgICBpZighd2luZG93Lm5vdGVQYW5lbCkge1xyXG4gICAgICB3aW5kb3cubm90ZVBhbmVsID0gbmV3IE5LQy5tb2R1bGVzLk5vdGVQYW5lbCgpO1xyXG4gICAgfVxyXG4gIH1cclxuICBuZXdOb3RlKG5vdGUpIHtcclxuICAgIHRoaXMuaW5pdE5vdGVQYW5lbCgpO1xyXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgd2luZG93Lm5vdGVQYW5lbC5vcGVuKGRhdGEgPT4ge1xyXG4gICAgICAgIHJlc29sdmUoZGF0YSk7XHJcbiAgICAgIH0sIHtcclxuICAgICAgICBub3RlXHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgfVxyXG4gIHNob3dOb3RlUGFuZWwoaWQpIHtcclxuICAgIHRoaXMuaW5pdE5vdGVQYW5lbCgpO1xyXG4gICAgd2luZG93Lm5vdGVQYW5lbC5vcGVuKGRhdGEgPT4ge1xyXG4gICAgfSwge1xyXG4gICAgICBpZFxyXG4gICAgfSk7XHJcbiAgfVxyXG59O1xyXG5cclxuIl19
