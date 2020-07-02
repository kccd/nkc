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
      }
      /*clownTagName: [
        "code",
        "svg",
        "pre",
        "video",
        "audio",
        "source",
        "table",
        "style",
        "script"
      ]*/

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwYWdlcy9wdWJsaWNNb2R1bGVzL05LQ0hpZ2hsaWdodGVyL2hsLm1qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7O0FDQUE7Ozs7Ozs7Ozs7Ozs7QUFjQSxHQUFHLENBQUMsT0FBSixDQUFZLEtBQVo7QUFDRSxrQkFBWSxPQUFaLEVBQXFCO0FBQUE7O0FBQ25CLFFBQU0sSUFBSSxHQUFHLElBQWI7QUFEbUIsUUFFWixJQUZZLEdBRWtCLE9BRmxCLENBRVosSUFGWTtBQUFBLFFBRU4sUUFGTSxHQUVrQixPQUZsQixDQUVOLFFBRk07QUFBQSx5QkFFa0IsT0FGbEIsQ0FFSSxLQUZKO0FBQUEsUUFFSSxLQUZKLCtCQUVZLEVBRlo7QUFHbkIsSUFBQSxJQUFJLENBQUMsSUFBTCxHQUFZLElBQVo7QUFDQSxJQUFBLElBQUksQ0FBQyxFQUFMLEdBQVUsUUFBVjtBQUVBLFFBQU0sRUFBRSxhQUFNLElBQU4sc0JBQXNCLFFBQXRCLENBQVI7QUFDQSxJQUFBLElBQUksQ0FBQyxXQUFMLEdBQW1CLFFBQVEsQ0FBQyxjQUFULENBQXdCLEVBQXhCLENBQW5CO0FBQ0EsSUFBQSxNQUFNLENBQUMsZ0JBQVAsQ0FBd0IsU0FBeEIsRUFBbUMsWUFBTTtBQUN2QyxNQUFBLFVBQVUsQ0FBQyxZQUFNO0FBQ2YsUUFBQSxJQUFJLENBQUMsU0FBTDtBQUNELE9BRlMsRUFFUCxFQUZPLENBQVY7QUFHRCxLQUpELEVBSUcsSUFKSDtBQUtBLFFBQU0sRUFBRSxHQUFHLElBQUksY0FBSixDQUFtQjtBQUM1QixNQUFBLGFBQWEsRUFBRSxFQURhO0FBRTVCLE1BQUEsVUFBVSxFQUFFLENBQ1YsZUFEVSxFQUNPO0FBQ2pCLGVBRlUsQ0FGZ0I7QUFNNUIsTUFBQSxTQUFTLEVBQUU7QUFDVCxvQkFBWTtBQURIO0FBR1g7Ozs7Ozs7Ozs7OztBQVQ0QixLQUFuQixDQUFYO0FBcUJBLElBQUEsSUFBSSxD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O0FBQ2QsVUFBRyxDQUFDLE1BQU0sQ0FBQyxTQUFYLEVBQXNCO0FBQ3BCLFFBQUEsTUFBTSxDQUFDLFNBQVAsR0FBbUIsSUFBSSxHQUFHLENBQUMsT0FBSixDQUFZLFNBQWhCLEVBQW5CO0FBQ0Q7QUFDRjtBQW5KSDtBQUFBO0FBQUEsNEJBb0pVLElBcEpWLEVBb0pnQjtBQUNaLFdBQUssYUFBTDtBQUNBLGFBQU8sSUFBSSxPQUFKLENBQVksVUFBQyxPQUFELEVBQVUsTUFBVixFQUFxQjtBQUN0QyxRQUFBLE1BQU0sQ0FBQyxTQUFQLENBQWlCLElBQWpCLENBQXNCLFVBQUEsSUFBSSxFQUFJO0FBQzVCLFVBQUEsT0FBTyxDQUFDLElBQUQsQ0FBUDtBQUNELFNBRkQsRUFFRztBQUNELFVBQUEsSUFBSSxFQUFKO0FBREMsU0FGSDtBQUtELE9BTk0sQ0FBUDtBQU9EO0FBN0pIO0FBQUE7QUFBQSxrQ0E4SmdCLEVBOUpoQixFQThKb0I7QUFDaEIsV0FBSyxhQUFMO0FBQ0EsTUFBQSxNQUFNLENBQUMsU0FBUCxDQUFpQixJQUFqQixDQUFzQixVQUFBLElBQUksRUFBSSxDQUM3QixDQURELEVBQ0c7QUFDRCxRQUFBLEVBQUUsRUFBRjtBQURDLE9BREg7QUFJRDtBQXBLSDs7QUFBQTtBQUFBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiLypcclxuKiDnu5/orqHlrZfmlbDml7bpnIDopoHmjpLpmaTku6XkuItkb23nu5PmnoTvvIzkuLvopoHmmK/lqpLkvZPmlofku7Zkb23jgIJcclxuICDmraTnsbtkb23lnKjmuLLmn5PnmoTml7blgJnlj6/og73kvJrkuLrlhbbmt7vliqDovoXliqnmloflrZfvvIzlpoLmnpzkuI3mjpLpmaTvvIzlvZPovoXliqnmloflrZflj5HnlJ/lj5jliqjvvIzov5nlsIbkvJrlvbHlk43lvZPliY3lt7LliJvlu7rnmoTmiYDmnInmibnms6jjgIJcclxuICBkaXYuYXJ0aWNsZS1pbWctYm9keSDlm77niYdcclxuICBkaXYuYXJ0aWNsZS1hdHRhY2htZW50IOmZhOS7tlxyXG4gIGRpdi5hcnRpY2xlLWF1ZGlvIOmfs+mikVxyXG4gIGRpdi5hcnRpY2xlLXZpZGVvLWJvZHkg6KeG6aKRXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICDku6PnoIFcclxuICAgICAgICAgICAgICAgICAgICAgICAgIOWFrOW8j1xyXG4qXHJcbipcclxuKlxyXG4qICovXHJcblxyXG5OS0MubW9kdWxlcy5OS0NITCA9IGNsYXNzIHtcclxuICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XHJcbiAgICBjb25zdCBzZWxmID0gdGhpcztcclxuICAgIGNvbnN0IHt0eXBlLCB0YXJnZXRJZCwgbm90ZXMgPSBbXX0gPSBvcHRpb25zO1xyXG4gICAgc2VsZi50eXBlID0gdHlwZTtcclxuICAgIHNlbGYuaWQgPSB0YXJnZXRJZDtcclxuXHJcbiAgICBjb25zdCBlbCA9IGAke3R5cGV9LWNvbnRlbnQtJHt0YXJnZXRJZH1gO1xyXG4gICAgc2VsZi5yb290RWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGVsKTtcclxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwibW91c2V1cFwiLCAoKSA9PiB7XHJcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgIHNlbGYucmVtb3ZlQnRuKCk7XHJcbiAgICAgIH0sIDUwKVxyXG4gICAgfSwgdHJ1ZSk7XHJcbiAgICBjb25zdCBobCA9IG5ldyBOS0NIaWdobGlnaHRlcih7XHJcbiAgICAgIHJvb3RFbGVtZW50SWQ6IGVsLFxyXG4gICAgICBjbG93bkNsYXNzOiBbXHJcbiAgICAgICAgXCJNYXRoSmF4X0NIVE1MXCIsIC8vIOWFrOW8j1xyXG4gICAgICAgIFwiTWF0aEpheFwiXHJcbiAgICAgIF0sXHJcbiAgICAgIGNsb3duQXR0cjoge1xyXG4gICAgICAgIFwiZGF0YS10YWdcIjogXCJua2Nzb3VyY2VcIlxyXG4gICAgICB9LFxyXG4gICAgICAvKmNsb3duVGFnTmFtZTogW1xyXG4gICAgICAgIFwiY29kZVwiLFxyXG4gICAgICAgIFwic3ZnXCIsXHJcbiAgICAgICAgXCJwcmVcIixcclxuICAgICAgICBcInZpZGVvXCIsXHJcbiAgICAgICAgXCJhdWRpb1wiLFxyXG4gICAgICAgIFwic291cmNlXCIsXHJcbiAgICAgICAgXCJ0YWJsZVwiLFxyXG4gICAgICAgIFwic3R5bGVcIixcclxuICAgICAgICBcInNjcmlwdFwiXHJcbiAgICAgIF0qL1xyXG4gICAgfSk7XHJcbiAgICBzZWxmLmhsID0gaGw7XHJcbiAgICBobFxyXG4gICAgICAub24oaGwuZXZlbnROYW1lcy5zZWxlY3QsIGRhdGEgPT4ge1xyXG4gICAgICAgIGlmKCFOS0MubWV0aG9kcy5nZXRMb2dpblN0YXR1cygpKSB7XHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIGlmKHdpbmRvdy5ub3RlUGFuZWwgJiYgd2luZG93Lm5vdGVQYW5lbC5pc09wZW4oKSkgcmV0dXJuO1xyXG4gICAgICAgIGxldCB7cmFuZ2V9ID0gZGF0YTtcclxuICAgICAgICBzZWxmLnNsZWVwKDIwMClcclxuICAgICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgY29uc3Qgb2Zmc2V0ID0gc2VsZi5obC5nZXRTdGFydE5vZGVPZmZzZXQocmFuZ2UpO1xyXG4gICAgICAgICAgICBpZighb2Zmc2V0KSByZXR1cm47XHJcbiAgICAgICAgICAgIGNvbnN0IGJ0biA9IHNlbGYuY3JlYXRlQnRuMihvZmZzZXQpO1xyXG4gICAgICAgICAgICAvLyBjb25zdCBidG4gPSBzZWxmLmNyZWF0ZUJ0bihwb3NpdGlvbik7XHJcbiAgICAgICAgICAgIGJ0bi5vbmNsaWNrID0gKCkgPT4ge1xyXG4gICAgICAgICAgICAgIC8vIOmHjeaWsOiOt+WPlnJhbmdlXHJcbiAgICAgICAgICAgICAgLy8g6YG/5YWNZG9t5Y+Y5YyW5a+86Ie0cmFuZ2Xlr7nosaHmnKrmm7TmlrDnmoTpl67pophcclxuICAgICAgICAgICAgICAvLyByYW5nZSA9IGhsLmdldFJhbmdlKCk7XHJcbiAgICAgICAgICAgICAgbGV0IG5vZGUgPSBobC5nZXROb2RlcyhyYW5nZSk7XHJcbiAgICAgICAgICAgICAgY29uc3QgY29udGVudCA9IGhsLmdldE5vZGVzQ29udGVudChub2RlKTtcclxuICAgICAgICAgICAgICBpZigkKHdpbmRvdykud2lkdGgoKSA8IDc2OCkge1xyXG4gICAgICAgICAgICAgICAgTktDLm1ldGhvZHMudmlzaXRVcmwoYC9ub3RlP2NvbnRlbnQ9JHtjb250ZW50fSZ0YXJnZXRJZD0ke3NlbGYuaWR9JnR5cGU9cG9zdCZvZmZzZXQ9JHtub2RlLm9mZnNldH0mbGVuZ3RoPSR7bm9kZS5sZW5ndGh9YCwgdHJ1ZSk7XHJcbiAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHNlbGYubmV3Tm90ZSh7XHJcbiAgICAgICAgICAgICAgICAgIGlkOiBcIlwiLFxyXG4gICAgICAgICAgICAgICAgICBjb250ZW50LFxyXG4gICAgICAgICAgICAgICAgICB0YXJnZXRJZDogc2VsZi5pZCxcclxuICAgICAgICAgICAgICAgICAgdHlwZTogXCJwb3N0XCIsXHJcbiAgICAgICAgICAgICAgICAgIG5vdGVzOiBbXSxcclxuICAgICAgICAgICAgICAgICAgbm9kZSxcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgIC50aGVuKG5vdGUgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGhsLmNyZWF0ZVNvdXJjZShub3RlLl9pZCwgbm90ZS5ub2RlKTtcclxuICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgLmNhdGNoKHN3ZWV0RXJyb3IpXHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9KVxyXG4gICAgICAgICAgLmNhdGNoKHN3ZWV0RXJyb3IpXHJcbiAgICAgIH0pXHJcbiAgICAgIC5vbihobC5ldmVudE5hbWVzLmNyZWF0ZSwgc291cmNlID0+IHtcclxuICAgICAgICAvLyBobC5hZGRDbGFzcyhzb3VyY2UsIFwicG9zdC1ub2RlLW1hcmtcIik7XHJcbiAgICAgIH0pXHJcbiAgICAgIC5vbihobC5ldmVudE5hbWVzLmNsaWNrLCBmdW5jdGlvbihzb3VyY2UpIHtcclxuICAgICAgICBpZihOS0MubWV0aG9kcy5nZXRMb2dpblN0YXR1cygpKSB7XHJcbiAgICAgICAgICBpZigkKHdpbmRvdykud2lkdGgoKSA+PSA3NjgpIHtcclxuICAgICAgICAgICAgLy8gaWYod2luZG93Lm5vdGVQYW5lbCAmJiB3aW5kb3cubm90ZVBhbmVsLmlzT3BlbigpKSByZXR1cm47XHJcbiAgICAgICAgICAgIHNlbGYuc2hvd05vdGVQYW5lbChzb3VyY2UuaWQpO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgTktDLm1ldGhvZHMudmlzaXRVcmwoYC9ub3RlLyR7c291cmNlLmlkfWAsIHRydWUpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBOS0MubWV0aG9kcy50b0xvZ2luKFwibG9naW5cIik7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KVxyXG4gICAgICAub24oaGwuZXZlbnROYW1lcy5ob3ZlciwgZnVuY3Rpb24oc291cmNlKSB7XHJcbiAgICAgICAgaGwuYWRkQ2xhc3Moc291cmNlLCBcInBvc3Qtbm9kZS1ob3ZlclwiKTtcclxuICAgICAgfSlcclxuICAgICAgLm9uKGhsLmV2ZW50TmFtZXMuaG92ZXJPdXQsIGZ1bmN0aW9uKHNvdXJjZSkge1xyXG4gICAgICAgIGhsLnJlbW92ZUNsYXNzKHNvdXJjZSwgXCJwb3N0LW5vZGUtaG92ZXJcIik7XHJcbiAgICAgIH0pO1xyXG4gICAgaGwucmVzdG9yZVNvdXJjZXMobm90ZXMpO1xyXG4gIH1cclxuICBjcmVhdGVCdG4yKG9mZnNldCkge1xyXG4gICAgdGhpcy5yZW1vdmVCdG4oKTtcclxuICAgIGNvbnN0IHt0b3AsIGxlZnR9ID0gb2Zmc2V0O1xyXG4gICAgY29uc3Qgc3BhbiA9ICQoXCI8c3Bhbj48c3Bhbj7mt7vliqDnrJTorrA8L3NwYW4+PC9zcGFuPlwiKTtcclxuICAgIHNwYW4uYWRkQ2xhc3MoXCJua2MtaGwtYnRuXCIpO1xyXG4gICAgaWYoJCh3aW5kb3cpLndpZHRoKCkgPj0gNzY4KSB7XHJcbiAgICAgIHNwYW4uY3NzKHtcclxuICAgICAgICB0b3A6IHRvcCAtIDIuNiAqIDEyICsgXCJweFwiLFxyXG4gICAgICAgIGxlZnQ6IGxlZnQgLSAxLjggKiAxMiArIFwicHhcIlxyXG4gICAgICB9KTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHNwYW4uY3NzKHtcclxuICAgICAgICB0b3A6IHRvcCAtICQoZG9jdW1lbnQpLnNjcm9sbFRvcCgpIC0gMysgXCJweFwiXHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgJChib2R5KS5hcHBlbmQoc3Bhbik7XHJcbiAgICByZXR1cm4gc3BhblswXTtcclxuICB9XHJcbiAgY3JlYXRlQnRuKHBvc2l0aW9uKSB7XHJcbiAgICB0aGlzLnJlbW92ZUJ0bigpO1xyXG4gICAgY29uc3QgYnRuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNwYW5cIik7XHJcbiAgICBidG4uY2xhc3NMaXN0LmFkZChcIm5rYy1obC1idG5cIik7XHJcbiAgICBidG4uaW5uZXJUZXh0ID0gXCLorrDnrJTorrBcIjtcclxuICAgIGNvbnN0IHJvb3RKUSA9ICQodGhpcy5yb290RWxlbWVudCk7XHJcbiAgICBjb25zdCB7dG9wLCBsZWZ0fSA9IHJvb3RKUS5vZmZzZXQoKTtcclxuICAgIGNvbnN0IHNjcm9sbFRvcCA9ICQod2luZG93KS5zY3JvbGxUb3AoKTtcclxuICAgIGNvbnN0IHdpZHRoID0gcm9vdEpRLndpZHRoKCk7XHJcbiAgICBsZXQgYnRuVG9wID0gcG9zaXRpb24ueSAtIHRvcCArIHNjcm9sbFRvcDtcclxuICAgIGxldCBidG5MZWZ0ID0gcG9zaXRpb24ueCAtIGxlZnQ7XHJcbiAgICBpZihidG5MZWZ0ICsgNSoxMiA+IGxlZnQgKyB3aWR0aCkgYnRuTGVmdCA9IGxlZnQgKyB3aWR0aCAtIDUqMTI7XHJcbiAgICBidG4uc3R5bGUudG9wID0gYnRuVG9wICsgXCJweFwiO1xyXG4gICAgYnRuLnN0eWxlLmxlZnQgPSBidG5MZWZ0ICsgXCJweFwiO1xyXG4gICAgdGhpcy5yb290RWxlbWVudC5hcHBlbmRDaGlsZChidG4pO1xyXG4gICAgcmV0dXJuIGJ0bjtcclxuICB9XHJcbiAgcmVtb3ZlQnRuKCkge1xyXG4gICAgJChcIi5ua2MtaGwtYnRuXCIpLnJlbW92ZSgpO1xyXG4gIH1cclxuICBzbGVlcCh0KSB7XHJcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcclxuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgcmVzb2x2ZSgpO1xyXG4gICAgICB9LCB0KVxyXG4gICAgfSk7XHJcbiAgfVxyXG4gIGluaXROb3RlUGFuZWwoKSB7XHJcbiAgICBpZighd2luZG93Lm5vdGVQYW5lbCkge1xyXG4gICAgICB3aW5kb3cubm90ZVBhbmVsID0gbmV3IE5LQy5tb2R1bGVzLk5vdGVQYW5lbCgpO1xyXG4gICAgfVxyXG4gIH1cclxuICBuZXdOb3RlKG5vdGUpIHtcclxuICAgIHRoaXMuaW5pdE5vdGVQYW5lbCgpO1xyXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgd2luZG93Lm5vdGVQYW5lbC5vcGVuKGRhdGEgPT4ge1xyXG4gICAgICAgIHJlc29sdmUoZGF0YSk7XHJcbiAgICAgIH0sIHtcclxuICAgICAgICBub3RlXHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgfVxyXG4gIHNob3dOb3RlUGFuZWwoaWQpIHtcclxuICAgIHRoaXMuaW5pdE5vdGVQYW5lbCgpO1xyXG4gICAgd2luZG93Lm5vdGVQYW5lbC5vcGVuKGRhdGEgPT4ge1xyXG4gICAgfSwge1xyXG4gICAgICBpZFxyXG4gICAgfSk7XHJcbiAgfVxyXG59O1xyXG5cclxuIl19
