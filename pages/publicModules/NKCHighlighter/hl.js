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
NKC.modules.NKCHL = /*#__PURE__*/function () {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9fYnJvd3Nlci1wYWNrQDYuMS4wQGJyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInBhZ2VzL3B1YmxpY01vZHVsZXMvTktDSGlnaGxpZ2h0ZXIvaGwubWpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7QUNBQTs7Ozs7Ozs7Ozs7OztBQWNBLEdBQUcsQ0FBQyxPQUFKLENBQVksS0FBWjtBQUNFLGtCQUFZLE9BQVosRUFBcUI7QUFBQTs7QUFDbkIsUUFBTSxJQUFJLEdBQUcsSUFBYjtBQURtQixRQUVaLElBRlksR0FFNkMsT0FGN0MsQ0FFWixJQUZZO0FBQUEsUUFFTixRQUZNLEdBRTZDLE9BRjdDLENBRU4sUUFGTTtBQUFBLHlCQUU2QyxPQUY3QyxDQUVJLEtBRko7QUFBQSxRQUVJLEtBRkosK0JBRVksRUFGWjtBQUFBLGdDQUU2QyxPQUY3QyxDQUVnQixvQkFGaEI7QUFBQSxRQUVnQixvQkFGaEIsc0NBRXVDLEVBRnZDO0FBR25CLElBQUEsSUFBSSxDQUFDLElBQUwsR0FBWSxJQUFaO0FBQ0EsSUFBQSxJQUFJLENBQUMsRUFBTCxHQUFVLFFBQVY7QUFFQSxRQUFNLEVBQUUsYUFBTSxJQUFOLHNCQUFzQixRQUF0QixDQUFSO0FBQ0EsSUFBQSxJQUFJLENBQUMsV0FBTCxHQUFtQixRQUFRLENBQUMsY0FBVCxDQUF3QixFQUF4QixDQUFuQjtBQUNBLElBQUEsTUFBTSxDQUFDLGdCQUFQLENBQXdCLFNBQXhCLEVBQW1DLFlBQU07QUFDdkMsTUFBQSxVQUFVLENBQUMsWUFBTTtBQUNmLFFBQUEsSUFBSSxDQUFDLFNBQUw7QUFDRCxPQUZTLEVBRVAsRUFGTyxDQUFWO0FBR0QsS0FKRCxFQUlHLElBSkg7QUFLQSxRQUFNLEVBQUUsR0FBRyxJQUFJLGNBQUosQ0FBbUI7QUFDNUIsTUFBQSxhQUFhLEVBQUUsRUFEYTtBQUU1QixNQUFBLHNCQUFzQixFQUFFLENBQ3RCLE9BRHNCLEVBRXRCLE9BRnNCLEVBR3RCLFFBSHNC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bklIO0FBQUE7QUFBQSxnQ0FvSWM7QUFDVixNQUFBLENBQUMsQ0FBQyxhQUFELENBQUQsQ0FBaUIsTUFBakI7QUFDRDtBQXRJSDtBQUFBO0FBQUEsMEJBdUlRLENBdklSLEVBdUlXO0FBQ1AsYUFBTyxJQUFJLE9BQUosQ0FBWSxVQUFDLE9BQUQsRUFBYTtBQUM5QixRQUFBLFVBQVUsQ0FBQyxZQUFNO0FBQ2YsVUFBQSxPQUFPO0FBQ1IsU0FGUyxFQUVQLENBRk8sQ0FBVjtBQUdELE9BSk0sQ0FBUDtBQUtEO0FBN0lIO0FBQUE7QUFBQSxvQ0E4SWtCO0FBQ2QsVUFBRyxDQUFDLE1BQU0sQ0FBQyxTQUFYLEVBQXNCO0FBQ3BCLFFBQUEsTUFBTSxDQUFDLFNBQVAsR0FBbUIsSUFBSSxHQUFHLENBQUMsT0FBSixDQUFZLFNBQWhCLEVBQW5CO0FBQ0Q7QUFDRjtBQWxKSDtBQUFBO0FBQUEsNEJBbUpVLElBbkpWLEVBbUpnQjtBQUNaLFdBQUssYUFBTDtBQUNBLGFBQU8sSUFBSSxPQUFKLENBQVksVUFBQyxPQUFELEVBQVUsTUFBVixFQUFxQjtBQUN0QyxRQUFBLE1BQU0sQ0FBQyxTQUFQLENBQWlCLElBQWpCLENBQXNCLFVBQUEsSUFBSSxFQUFJO0FBQzVCLFVBQUEsT0FBTyxDQUFDLElBQUQsQ0FBUDtBQUNELFNBRkQsRUFFRztBQUNELFVBQUEsSUFBSSxFQUFKO0FBREMsU0FGSDtBQUtELE9BTk0sQ0FBUDtBQU9EO0FBNUpIO0FBQUE7QUFBQSxrQ0E2SmdCLEVBN0poQixFQTZKb0I7QUFDaEIsV0FBSyxhQUFMO0FBQ0EsTUFBQSxNQUFNLENBQUMsU0FBUCxDQUFpQixJQUFqQixDQUFzQixVQUFBLElBQUksRUFBSSxDQUM3QixDQURELEVBQ0c7QUFDRCxRQUFBLEVBQUUsRUFBRjtBQURDLE9BREg7QUFJRDtBQW5LSDs7QUFBQTtBQUFBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiLypcclxuKiDnu5/orqHlrZfmlbDml7bpnIDopoHmjpLpmaTku6XkuItkb23nu5PmnoTvvIzkuLvopoHmmK/lqpLkvZPmlofku7Zkb23jgIJcclxuICDmraTnsbtkb23lnKjmuLLmn5PnmoTml7blgJnlj6/og73kvJrkuLrlhbbmt7vliqDovoXliqnmloflrZfvvIzlpoLmnpzkuI3mjpLpmaTvvIzlvZPovoXliqnmloflrZflj5HnlJ/lj5jliqjvvIzov5nlsIbkvJrlvbHlk43lvZPliY3lt7LliJvlu7rnmoTmiYDmnInmibnms6jjgIJcclxuICBkaXYuYXJ0aWNsZS1pbWctYm9keSDlm77niYdcclxuICBkaXYuYXJ0aWNsZS1hdHRhY2htZW50IOmZhOS7tlxyXG4gIGRpdi5hcnRpY2xlLWF1ZGlvIOmfs+mikVxyXG4gIGRpdi5hcnRpY2xlLXZpZGVvLWJvZHkg6KeG6aKRXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICDku6PnoIFcclxuICAgICAgICAgICAgICAgICAgICAgICAgIOWFrOW8j1xyXG4qXHJcbipcclxuKlxyXG4qICovXHJcblxyXG5OS0MubW9kdWxlcy5OS0NITCA9IGNsYXNzIHtcclxuICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XHJcbiAgICBjb25zdCBzZWxmID0gdGhpcztcclxuICAgIGNvbnN0IHt0eXBlLCB0YXJnZXRJZCwgbm90ZXMgPSBbXSwgZXhjbHVkZWRFbGVtZW50Q2xhc3MgPSBbXX0gPSBvcHRpb25zO1xyXG4gICAgc2VsZi50eXBlID0gdHlwZTtcclxuICAgIHNlbGYuaWQgPSB0YXJnZXRJZDtcclxuXHJcbiAgICBjb25zdCBlbCA9IGAke3R5cGV9LWNvbnRlbnQtJHt0YXJnZXRJZH1gO1xyXG4gICAgc2VsZi5yb290RWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGVsKTtcclxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwibW91c2V1cFwiLCAoKSA9PiB7XHJcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgIHNlbGYucmVtb3ZlQnRuKCk7XHJcbiAgICAgIH0sIDUwKVxyXG4gICAgfSwgdHJ1ZSk7XHJcbiAgICBjb25zdCBobCA9IG5ldyBOS0NIaWdobGlnaHRlcih7XHJcbiAgICAgIHJvb3RFbGVtZW50SWQ6IGVsLFxyXG4gICAgICBleGNsdWRlZEVsZW1lbnRUYWdOYW1lOiBbXHJcbiAgICAgICAgXCJ2aWRlb1wiLFxyXG4gICAgICAgIFwiYXVkaW9cIixcclxuICAgICAgICBcInNvdXJjZVwiLFxyXG4gICAgICAgIFwiY29kZVwiLFxyXG4gICAgICAgIFwicHJlXCIsXHJcbiAgICAgICAgXCJ0YWJsZVwiXHJcbiAgICAgIF0sXHJcbiAgICAgIGV4Y2x1ZGVkRWxlbWVudENsYXNzOiBbXHJcbiAgICAgICAgXCJhcnRpY2xlLWltZy1ib2R5XCIsIC8vIOWbvueJh1xyXG4gICAgICAgIFwiYXJ0aWNsZS1hdHRhY2htZW50XCIsIC8vIOmZhOS7tlxyXG4gICAgICAgIFwiYXJ0aWNsZS1hdWRpb1wiLCAvLyDpn7PpopFcclxuICAgICAgICBcIk1hdGhKYXhfQ0hUTUxcIiwgLy8g5YWs5byPXHJcbiAgICAgICAgXCJhcnRpY2xlLXZpZGVvLWJvZHlcIiwgLy8g6KeG6aKRXHJcbiAgICAgICAgXCJhcnRpY2xlLXF1b3RlXCIsIC8vIOW8leeUqFxyXG4gICAgICAgIFwibmtjSGlkZGVuQm94XCIsIC8vIOWtpuacr+WIhumakOiXj1xyXG4gICAgICBdLmNvbmNhdChleGNsdWRlZEVsZW1lbnRDbGFzcylcclxuICAgIH0pO1xyXG4gICAgc2VsZi5obCA9IGhsO1xyXG4gICAgaGxcclxuICAgICAgLm9uKGhsLmV2ZW50TmFtZXMuc2VsZWN0LCBkYXRhID0+IHtcclxuICAgICAgICBpZighTktDLm1ldGhvZHMuZ2V0TG9naW5TdGF0dXMoKSkge1xyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBpZih3aW5kb3cubm90ZVBhbmVsICYmIHdpbmRvdy5ub3RlUGFuZWwuaXNPcGVuKCkpIHJldHVybjtcclxuICAgICAgICBsZXQge3JhbmdlfSA9IGRhdGE7XHJcbiAgICAgICAgc2VsZi5zbGVlcCgyMDApXHJcbiAgICAgICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IG9mZnNldCA9IHNlbGYuaGwuZ2V0U3RhcnROb2RlT2Zmc2V0KHJhbmdlKTtcclxuICAgICAgICAgICAgaWYoIW9mZnNldCkgcmV0dXJuO1xyXG4gICAgICAgICAgICBjb25zdCBidG4gPSBzZWxmLmNyZWF0ZUJ0bjIob2Zmc2V0KTtcclxuICAgICAgICAgICAgLy8gY29uc3QgYnRuID0gc2VsZi5jcmVhdGVCdG4ocG9zaXRpb24pO1xyXG4gICAgICAgICAgICBidG4ub25jbGljayA9ICgpID0+IHtcclxuICAgICAgICAgICAgICAvLyDph43mlrDojrflj5ZyYW5nZVxyXG4gICAgICAgICAgICAgIC8vIOmBv+WFjWRvbeWPmOWMluWvvOiHtHJhbmdl5a+56LGh5pyq5pu05paw55qE6Zeu6aKYXHJcbiAgICAgICAgICAgICAgLy8gcmFuZ2UgPSBobC5nZXRSYW5nZSgpO1xyXG4gICAgICAgICAgICAgIGxldCBub2RlID0gaGwuZ2V0Tm9kZXMocmFuZ2UpO1xyXG4gICAgICAgICAgICAgIGNvbnN0IGNvbnRlbnQgPSBobC5nZXROb2Rlc0NvbnRlbnQobm9kZSk7XHJcbiAgICAgICAgICAgICAgaWYoJCh3aW5kb3cpLndpZHRoKCkgPCA3NjgpIHtcclxuICAgICAgICAgICAgICAgIE5LQy5tZXRob2RzLnZpc2l0VXJsKGAvbm90ZT9jb250ZW50PSR7Y29udGVudH0mdGFyZ2V0SWQ9JHtzZWxmLmlkfSZ0eXBlPXBvc3Qmb2Zmc2V0PSR7bm9kZS5vZmZzZXR9Jmxlbmd0aD0ke25vZGUubGVuZ3RofWAsIHRydWUpO1xyXG4gICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLm5ld05vdGUoe1xyXG4gICAgICAgICAgICAgICAgICBpZDogXCJcIixcclxuICAgICAgICAgICAgICAgICAgY29udGVudCxcclxuICAgICAgICAgICAgICAgICAgdGFyZ2V0SWQ6IHNlbGYuaWQsXHJcbiAgICAgICAgICAgICAgICAgIHR5cGU6IFwicG9zdFwiLFxyXG4gICAgICAgICAgICAgICAgICBub3RlczogW10sXHJcbiAgICAgICAgICAgICAgICAgIG5vZGUsXHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAudGhlbihub3RlID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBobC5jcmVhdGVTb3VyY2Uobm90ZS5faWQsIG5vdGUubm9kZSk7XHJcbiAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgIC5jYXRjaChzd2VldEVycm9yKVxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSlcclxuICAgICAgICAgIC5jYXRjaChzd2VldEVycm9yKVxyXG4gICAgICB9KVxyXG4gICAgICAub24oaGwuZXZlbnROYW1lcy5jcmVhdGUsIHNvdXJjZSA9PiB7XHJcbiAgICAgICAgLy8gaGwuYWRkQ2xhc3Moc291cmNlLCBcInBvc3Qtbm9kZS1tYXJrXCIpO1xyXG4gICAgICB9KVxyXG4gICAgICAub24oaGwuZXZlbnROYW1lcy5jbGljaywgZnVuY3Rpb24oc291cmNlKSB7XHJcbiAgICAgICAgaWYoTktDLm1ldGhvZHMuZ2V0TG9naW5TdGF0dXMoKSkge1xyXG4gICAgICAgICAgaWYoJCh3aW5kb3cpLndpZHRoKCkgPj0gNzY4KSB7XHJcbiAgICAgICAgICAgIC8vIGlmKHdpbmRvdy5ub3RlUGFuZWwgJiYgd2luZG93Lm5vdGVQYW5lbC5pc09wZW4oKSkgcmV0dXJuO1xyXG4gICAgICAgICAgICBzZWxmLnNob3dOb3RlUGFuZWwoc291cmNlLmlkKTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIE5LQy5tZXRob2RzLnZpc2l0VXJsKGAvbm90ZS8ke3NvdXJjZS5pZH1gLCB0cnVlKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgTktDLm1ldGhvZHMudG9Mb2dpbihcImxvZ2luXCIpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSlcclxuICAgICAgLm9uKGhsLmV2ZW50TmFtZXMuaG92ZXIsIGZ1bmN0aW9uKHNvdXJjZSkge1xyXG4gICAgICAgIGhsLmFkZENsYXNzKHNvdXJjZSwgXCJwb3N0LW5vZGUtaG92ZXJcIik7XHJcbiAgICAgIH0pXHJcbiAgICAgIC5vbihobC5ldmVudE5hbWVzLmhvdmVyT3V0LCBmdW5jdGlvbihzb3VyY2UpIHtcclxuICAgICAgICBobC5yZW1vdmVDbGFzcyhzb3VyY2UsIFwicG9zdC1ub2RlLWhvdmVyXCIpO1xyXG4gICAgICB9KTtcclxuICAgIGhsLnJlc3RvcmVTb3VyY2VzKG5vdGVzKTtcclxuICB9XHJcbiAgY3JlYXRlQnRuMihvZmZzZXQpIHtcclxuICAgIHRoaXMucmVtb3ZlQnRuKCk7XHJcbiAgICBjb25zdCB7dG9wLCBsZWZ0fSA9IG9mZnNldDtcclxuICAgIGNvbnN0IHNwYW4gPSAkKFwiPHNwYW4+PHNwYW4+5re75Yqg56yU6K6wPC9zcGFuPjwvc3Bhbj5cIik7XHJcbiAgICBzcGFuLmFkZENsYXNzKFwibmtjLWhsLWJ0blwiKTtcclxuICAgIGlmKCQod2luZG93KS53aWR0aCgpID49IDc2OCkge1xyXG4gICAgICBzcGFuLmNzcyh7XHJcbiAgICAgICAgdG9wOiB0b3AgLSAyLjYgKiAxMiArIFwicHhcIixcclxuICAgICAgICBsZWZ0OiBsZWZ0IC0gMS44ICogMTIgKyBcInB4XCJcclxuICAgICAgfSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBzcGFuLmNzcyh7XHJcbiAgICAgICAgdG9wOiB0b3AgLSAkKGRvY3VtZW50KS5zY3JvbGxUb3AoKSAtIDMrIFwicHhcIlxyXG4gICAgICB9KTtcclxuICAgIH1cclxuICAgICQoYm9keSkuYXBwZW5kKHNwYW4pO1xyXG4gICAgcmV0dXJuIHNwYW5bMF07XHJcbiAgfVxyXG4gIGNyZWF0ZUJ0bihwb3NpdGlvbikge1xyXG4gICAgdGhpcy5yZW1vdmVCdG4oKTtcclxuICAgIGNvbnN0IGJ0biA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIpO1xyXG4gICAgYnRuLmNsYXNzTGlzdC5hZGQoXCJua2MtaGwtYnRuXCIpO1xyXG4gICAgYnRuLmlubmVyVGV4dCA9IFwi6K6w56yU6K6wXCI7XHJcbiAgICBjb25zdCByb290SlEgPSAkKHRoaXMucm9vdEVsZW1lbnQpO1xyXG4gICAgY29uc3Qge3RvcCwgbGVmdH0gPSByb290SlEub2Zmc2V0KCk7XHJcbiAgICBjb25zdCBzY3JvbGxUb3AgPSAkKHdpbmRvdykuc2Nyb2xsVG9wKCk7XHJcbiAgICBjb25zdCB3aWR0aCA9IHJvb3RKUS53aWR0aCgpO1xyXG4gICAgbGV0IGJ0blRvcCA9IHBvc2l0aW9uLnkgLSB0b3AgKyBzY3JvbGxUb3A7XHJcbiAgICBsZXQgYnRuTGVmdCA9IHBvc2l0aW9uLnggLSBsZWZ0O1xyXG4gICAgaWYoYnRuTGVmdCArIDUqMTIgPiBsZWZ0ICsgd2lkdGgpIGJ0bkxlZnQgPSBsZWZ0ICsgd2lkdGggLSA1KjEyO1xyXG4gICAgYnRuLnN0eWxlLnRvcCA9IGJ0blRvcCArIFwicHhcIjtcclxuICAgIGJ0bi5zdHlsZS5sZWZ0ID0gYnRuTGVmdCArIFwicHhcIjtcclxuICAgIHRoaXMucm9vdEVsZW1lbnQuYXBwZW5kQ2hpbGQoYnRuKTtcclxuICAgIHJldHVybiBidG47XHJcbiAgfVxyXG4gIHJlbW92ZUJ0bigpIHtcclxuICAgICQoXCIubmtjLWhsLWJ0blwiKS5yZW1vdmUoKTtcclxuICB9XHJcbiAgc2xlZXAodCkge1xyXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XHJcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgIHJlc29sdmUoKTtcclxuICAgICAgfSwgdClcclxuICAgIH0pO1xyXG4gIH1cclxuICBpbml0Tm90ZVBhbmVsKCkge1xyXG4gICAgaWYoIXdpbmRvdy5ub3RlUGFuZWwpIHtcclxuICAgICAgd2luZG93Lm5vdGVQYW5lbCA9IG5ldyBOS0MubW9kdWxlcy5Ob3RlUGFuZWwoKTtcclxuICAgIH1cclxuICB9XHJcbiAgbmV3Tm90ZShub3RlKSB7XHJcbiAgICB0aGlzLmluaXROb3RlUGFuZWwoKTtcclxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgIHdpbmRvdy5ub3RlUGFuZWwub3BlbihkYXRhID0+IHtcclxuICAgICAgICByZXNvbHZlKGRhdGEpO1xyXG4gICAgICB9LCB7XHJcbiAgICAgICAgbm90ZVxyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIH1cclxuICBzaG93Tm90ZVBhbmVsKGlkKSB7XHJcbiAgICB0aGlzLmluaXROb3RlUGFuZWwoKTtcclxuICAgIHdpbmRvdy5ub3RlUGFuZWwub3BlbihkYXRhID0+IHtcclxuICAgIH0sIHtcclxuICAgICAgaWRcclxuICAgIH0pO1xyXG4gIH1cclxufTtcclxuXHJcbiJdfQ==
