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
      "article-quote" // 引用
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
          range = hl.getRange();
          var node = hl.getNodes(range);
          var content = hl.getNodesContent(node);
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
      var top = offset.top,
          left = offset.left;
      var span = $("<span><span>添加笔记</span></span>");
      span.addClass("nkc-hl-btn").css({
        top: top - 2.6 * 12 + "px",
        left: left - 1.8 * 12 + "px"
      });
      $(body).append(span);
      return span[0];
    }
  }, {
    key: "createBtn",
    value: function createBtn(position) {
      this.removeBtn();
      var btn = document.createElement("span");
      btn.classList.add("nkc-hl-btn");
      btn.innerText = "添加笔记";
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9fYnJvd3Nlci1wYWNrQDYuMS4wQGJyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInBhZ2VzL3B1YmxpY01vZHVsZXMvTktDSGlnaGxpZ2h0ZXIvaGwubWpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7QUNBQTs7Ozs7Ozs7Ozs7OztBQWNBLEdBQUcsQ0FBQyxPQUFKLENBQVksS0FBWjtBQUFBO0FBQUE7QUFDRSxrQkFBWSxPQUFaLEVBQXFCO0FBQUE7O0FBQ25CLFFBQU0sSUFBSSxHQUFHLElBQWI7QUFEbUIsUUFFWixJQUZZLEdBRTZDLE9BRjdDLENBRVosSUFGWTtBQUFBLFFBRU4sUUFGTSxHQUU2QyxPQUY3QyxDQUVOLFFBRk07QUFBQSx5QkFFNkMsT0FGN0MsQ0FFSSxLQUZKO0FBQUEsUUFFSSxLQUZKLCtCQUVZLEVBRlo7QUFBQSxnQ0FFNkMsT0FGN0MsQ0FFZ0Isb0JBRmhCO0FBQUEsUUFFZ0Isb0JBRmhCLHNDQUV1QyxFQUZ2QztBQUduQixJQUFBLElBQUksQ0FBQyxJQUFMLEdBQVksSUFBWjtBQUNBLElBQUEsSUFBSSxDQUFDLEVBQUwsR0FBVSxRQUFWO0FBRUEsUUFBTSxFQUFFLGFBQU0sSUFBTixzQkFBc0IsUUFBdEIsQ0FBUjtBQUNBLElBQUEsSUFBSSxDQUFDLFdBQUwsR0FBbUIsUUFBUSxDQUFDLGNBQVQsQ0FBd0IsRUFBeEIsQ0FBbkI7QUFDQSxJQUFBLE1BQU0sQ0FBQyxnQkFBUCxDQUF3QixTQUF4QixFQUFtQyxZQUFNO0FBQ3ZDLE1BQUEsVUFBVSxDQUFDLFlBQU07QUFDZixRQUFBLElBQUksQ0FBQyxTQUFMO0FBQ0QsT0FGUyxFQUVQLEVBRk8sQ0FBVjtBQUdELEtBSkQsRUFJRyxJQUpIO0FBS0EsUUFBTSxFQUFFLEdBQUcsSUFBSSxjQUFKLENBQW1CO0FBQzVCLE1BQUEsYUFBYSxFQUFFLEVBRGE7QUFFNUIsTUFBQSxzQkFBc0IsRUFBRSxDQUN0QixPQURzQixFQUV0QixPQUZzQixF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YUFBTDtBQUNBLGFBQU8sSUFBSSxPQUFKLENBQVksVUFBQyxPQUFELEVBQVUsTUFBVixFQUFxQjtBQUN0QyxRQUFBLE1BQU0sQ0FBQyxTQUFQLENBQWlCLElBQWpCLENBQXNCLFVBQUEsSUFBSSxFQUFJO0FBQzVCLFVBQUEsT0FBTyxDQUFDLElBQUQsQ0FBUDtBQUNELFNBRkQsRUFFRztBQUNELFVBQUEsSUFBSSxFQUFKO0FBREMsU0FGSDtBQUtELE9BTk0sQ0FBUDtBQU9EO0FBL0lIO0FBQUE7QUFBQSxrQ0FnSmdCLEVBaEpoQixFQWdKb0I7QUFDaEIsV0FBSyxhQUFMO0FBQ0EsTUFBQSxNQUFNLENBQUMsU0FBUCxDQUFpQixJQUFqQixDQUFzQixVQUFBLElBQUksRUFBSSxDQUM3QixDQURELEVBQ0c7QUFDRCxRQUFBLEVBQUUsRUFBRjtBQURDLE9BREg7QUFJRDtBQXRKSDs7QUFBQTtBQUFBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiLypcclxuKiDnu5/orqHlrZfmlbDml7bpnIDopoHmjpLpmaTku6XkuItkb23nu5PmnoTvvIzkuLvopoHmmK/lqpLkvZPmlofku7Zkb23jgIJcclxuICDmraTnsbtkb23lnKjmuLLmn5PnmoTml7blgJnlj6/og73kvJrkuLrlhbbmt7vliqDovoXliqnmloflrZfvvIzlpoLmnpzkuI3mjpLpmaTvvIzlvZPovoXliqnmloflrZflj5HnlJ/lj5jliqjvvIzov5nlsIbkvJrlvbHlk43lvZPliY3lt7LliJvlu7rnmoTmiYDmnInmibnms6jjgIJcclxuICBkaXYuYXJ0aWNsZS1pbWctYm9keSDlm77niYdcclxuICBkaXYuYXJ0aWNsZS1hdHRhY2htZW50IOmZhOS7tlxyXG4gIGRpdi5hcnRpY2xlLWF1ZGlvIOmfs+mikVxyXG4gIGRpdi5hcnRpY2xlLXZpZGVvLWJvZHkg6KeG6aKRXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICDku6PnoIFcclxuICAgICAgICAgICAgICAgICAgICAgICAgIOWFrOW8j1xyXG4qXHJcbipcclxuKlxyXG4qICovXHJcblxyXG5OS0MubW9kdWxlcy5OS0NITCA9IGNsYXNzIHtcclxuICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XHJcbiAgICBjb25zdCBzZWxmID0gdGhpcztcclxuICAgIGNvbnN0IHt0eXBlLCB0YXJnZXRJZCwgbm90ZXMgPSBbXSwgZXhjbHVkZWRFbGVtZW50Q2xhc3MgPSBbXX0gPSBvcHRpb25zO1xyXG4gICAgc2VsZi50eXBlID0gdHlwZTtcclxuICAgIHNlbGYuaWQgPSB0YXJnZXRJZDtcclxuXHJcbiAgICBjb25zdCBlbCA9IGAke3R5cGV9LWNvbnRlbnQtJHt0YXJnZXRJZH1gO1xyXG4gICAgc2VsZi5yb290RWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGVsKTtcclxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwibW91c2V1cFwiLCAoKSA9PiB7XHJcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgIHNlbGYucmVtb3ZlQnRuKCk7XHJcbiAgICAgIH0sIDUwKVxyXG4gICAgfSwgdHJ1ZSk7XHJcbiAgICBjb25zdCBobCA9IG5ldyBOS0NIaWdobGlnaHRlcih7XHJcbiAgICAgIHJvb3RFbGVtZW50SWQ6IGVsLFxyXG4gICAgICBleGNsdWRlZEVsZW1lbnRUYWdOYW1lOiBbXHJcbiAgICAgICAgXCJ2aWRlb1wiLFxyXG4gICAgICAgIFwiYXVkaW9cIixcclxuICAgICAgICBcInNvdXJjZVwiLFxyXG4gICAgICAgIFwiY29kZVwiLFxyXG4gICAgICAgIFwicHJlXCIsXHJcbiAgICAgICAgXCJ0YWJsZVwiXHJcbiAgICAgIF0sXHJcbiAgICAgIGV4Y2x1ZGVkRWxlbWVudENsYXNzOiBbXHJcbiAgICAgICAgXCJhcnRpY2xlLWltZy1ib2R5XCIsIC8vIOWbvueJh1xyXG4gICAgICAgIFwiYXJ0aWNsZS1hdHRhY2htZW50XCIsIC8vIOmZhOS7tlxyXG4gICAgICAgIFwiYXJ0aWNsZS1hdWRpb1wiLCAvLyDpn7PpopFcclxuICAgICAgICBcIk1hdGhKYXhfQ0hUTUxcIiwgLy8g5YWs5byPXHJcbiAgICAgICAgXCJhcnRpY2xlLXZpZGVvLWJvZHlcIiwgLy8g6KeG6aKRXHJcbiAgICAgICAgXCJhcnRpY2xlLXF1b3RlXCIsIC8vIOW8leeUqFxyXG4gICAgICBdLmNvbmNhdChleGNsdWRlZEVsZW1lbnRDbGFzcylcclxuICAgIH0pO1xyXG4gICAgc2VsZi5obCA9IGhsO1xyXG4gICAgaGxcclxuICAgICAgLm9uKGhsLmV2ZW50TmFtZXMuc2VsZWN0LCBkYXRhID0+IHtcclxuICAgICAgICBpZighTktDLm1ldGhvZHMuZ2V0TG9naW5TdGF0dXMoKSkge1xyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBpZih3aW5kb3cubm90ZVBhbmVsICYmIHdpbmRvdy5ub3RlUGFuZWwuaXNPcGVuKCkpIHJldHVybjtcclxuICAgICAgICBsZXQge3JhbmdlfSA9IGRhdGE7XHJcbiAgICAgICAgc2VsZi5zbGVlcCgyMDApXHJcbiAgICAgICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IG9mZnNldCA9IHNlbGYuaGwuZ2V0U3RhcnROb2RlT2Zmc2V0KHJhbmdlKTtcclxuICAgICAgICAgICAgaWYoIW9mZnNldCkgcmV0dXJuO1xyXG4gICAgICAgICAgICBjb25zdCBidG4gPSBzZWxmLmNyZWF0ZUJ0bjIob2Zmc2V0KTtcclxuICAgICAgICAgICAgLy8gY29uc3QgYnRuID0gc2VsZi5jcmVhdGVCdG4ocG9zaXRpb24pO1xyXG4gICAgICAgICAgICBidG4ub25jbGljayA9ICgpID0+IHtcclxuICAgICAgICAgICAgICAvLyDph43mlrDojrflj5ZyYW5nZVxyXG4gICAgICAgICAgICAgIC8vIOmBv+WFjWRvbeWPmOWMluWvvOiHtHJhbmdl5a+56LGh5pyq5pu05paw55qE6Zeu6aKYXHJcbiAgICAgICAgICAgICAgcmFuZ2UgPSBobC5nZXRSYW5nZSgpO1xyXG4gICAgICAgICAgICAgIGxldCBub2RlID0gaGwuZ2V0Tm9kZXMocmFuZ2UpO1xyXG4gICAgICAgICAgICAgIGNvbnN0IGNvbnRlbnQgPSBobC5nZXROb2Rlc0NvbnRlbnQobm9kZSk7XHJcbiAgICAgICAgICAgICAgc2VsZi5uZXdOb3RlKHtcclxuICAgICAgICAgICAgICAgIGlkOiBcIlwiLFxyXG4gICAgICAgICAgICAgICAgY29udGVudCxcclxuICAgICAgICAgICAgICAgIHRhcmdldElkOiBzZWxmLmlkLFxyXG4gICAgICAgICAgICAgICAgdHlwZTogXCJwb3N0XCIsXHJcbiAgICAgICAgICAgICAgICBub3RlczogW10sXHJcbiAgICAgICAgICAgICAgICBub2RlLFxyXG4gICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAudGhlbihub3RlID0+IHtcclxuICAgICAgICAgICAgICAgICAgaGwuY3JlYXRlU291cmNlKG5vdGUuX2lkLCBub3RlLm5vZGUpO1xyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC5jYXRjaChzd2VldEVycm9yKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9KVxyXG4gICAgICAgICAgLmNhdGNoKHN3ZWV0RXJyb3IpXHJcbiAgICAgIH0pXHJcbiAgICAgIC5vbihobC5ldmVudE5hbWVzLmNyZWF0ZSwgc291cmNlID0+IHtcclxuICAgICAgICAvLyBobC5hZGRDbGFzcyhzb3VyY2UsIFwicG9zdC1ub2RlLW1hcmtcIik7XHJcbiAgICAgIH0pXHJcbiAgICAgIC5vbihobC5ldmVudE5hbWVzLmNsaWNrLCBmdW5jdGlvbihzb3VyY2UpIHtcclxuICAgICAgICBpZihOS0MubWV0aG9kcy5nZXRMb2dpblN0YXR1cygpKSB7XHJcbiAgICAgICAgICBpZigkKHdpbmRvdykud2lkdGgoKSA+PSA3NjgpIHtcclxuICAgICAgICAgICAgLy8gaWYod2luZG93Lm5vdGVQYW5lbCAmJiB3aW5kb3cubm90ZVBhbmVsLmlzT3BlbigpKSByZXR1cm47XHJcbiAgICAgICAgICAgIHNlbGYuc2hvd05vdGVQYW5lbChzb3VyY2UuaWQpO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgTktDLm1ldGhvZHMudmlzaXRVcmwoYC9ub3RlLyR7c291cmNlLmlkfWAsIHRydWUpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBOS0MubWV0aG9kcy50b0xvZ2luKFwibG9naW5cIik7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KVxyXG4gICAgICAub24oaGwuZXZlbnROYW1lcy5ob3ZlciwgZnVuY3Rpb24oc291cmNlKSB7XHJcbiAgICAgICAgaGwuYWRkQ2xhc3Moc291cmNlLCBcInBvc3Qtbm9kZS1ob3ZlclwiKTtcclxuICAgICAgfSlcclxuICAgICAgLm9uKGhsLmV2ZW50TmFtZXMuaG92ZXJPdXQsIGZ1bmN0aW9uKHNvdXJjZSkge1xyXG4gICAgICAgIGhsLnJlbW92ZUNsYXNzKHNvdXJjZSwgXCJwb3N0LW5vZGUtaG92ZXJcIik7XHJcbiAgICAgIH0pO1xyXG4gICAgaGwucmVzdG9yZVNvdXJjZXMobm90ZXMpO1xyXG4gIH1cclxuICBjcmVhdGVCdG4yKG9mZnNldCkge1xyXG4gICAgY29uc3Qge3RvcCwgbGVmdH0gPSBvZmZzZXQ7XHJcbiAgICBjb25zdCBzcGFuID0gJChcIjxzcGFuPjxzcGFuPua3u+WKoOeslOiusDwvc3Bhbj48L3NwYW4+XCIpO1xyXG4gICAgc3Bhbi5hZGRDbGFzcyhcIm5rYy1obC1idG5cIikuY3NzKHtcclxuICAgICAgdG9wOiB0b3AgLSAyLjYgKiAxMiArIFwicHhcIixcclxuICAgICAgbGVmdDogbGVmdCAtIDEuOCAqIDEyICsgXCJweFwiXHJcbiAgICB9KTtcclxuICAgICQoYm9keSkuYXBwZW5kKHNwYW4pO1xyXG4gICAgcmV0dXJuIHNwYW5bMF07XHJcbiAgfVxyXG4gIGNyZWF0ZUJ0bihwb3NpdGlvbikge1xyXG4gICAgdGhpcy5yZW1vdmVCdG4oKTtcclxuICAgIGNvbnN0IGJ0biA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIpO1xyXG4gICAgYnRuLmNsYXNzTGlzdC5hZGQoXCJua2MtaGwtYnRuXCIpO1xyXG4gICAgYnRuLmlubmVyVGV4dCA9IFwi5re75Yqg56yU6K6wXCI7XHJcbiAgICBjb25zdCByb290SlEgPSAkKHRoaXMucm9vdEVsZW1lbnQpO1xyXG4gICAgY29uc3Qge3RvcCwgbGVmdH0gPSByb290SlEub2Zmc2V0KCk7XHJcbiAgICBjb25zdCBzY3JvbGxUb3AgPSAkKHdpbmRvdykuc2Nyb2xsVG9wKCk7XHJcbiAgICBjb25zdCB3aWR0aCA9IHJvb3RKUS53aWR0aCgpO1xyXG4gICAgbGV0IGJ0blRvcCA9IHBvc2l0aW9uLnkgLSB0b3AgKyBzY3JvbGxUb3A7XHJcbiAgICBsZXQgYnRuTGVmdCA9IHBvc2l0aW9uLnggLSBsZWZ0O1xyXG4gICAgaWYoYnRuTGVmdCArIDUqMTIgPiBsZWZ0ICsgd2lkdGgpIGJ0bkxlZnQgPSBsZWZ0ICsgd2lkdGggLSA1KjEyO1xyXG4gICAgYnRuLnN0eWxlLnRvcCA9IGJ0blRvcCArIFwicHhcIjtcclxuICAgIGJ0bi5zdHlsZS5sZWZ0ID0gYnRuTGVmdCArIFwicHhcIjtcclxuICAgIHRoaXMucm9vdEVsZW1lbnQuYXBwZW5kQ2hpbGQoYnRuKTtcclxuICAgIHJldHVybiBidG47XHJcbiAgfVxyXG4gIHJlbW92ZUJ0bigpIHtcclxuICAgICQoXCIubmtjLWhsLWJ0blwiKS5yZW1vdmUoKTtcclxuICB9XHJcbiAgc2xlZXAodCkge1xyXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XHJcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgIHJlc29sdmUoKTtcclxuICAgICAgfSwgdClcclxuICAgIH0pO1xyXG4gIH1cclxuICBpbml0Tm90ZVBhbmVsKCkge1xyXG4gICAgaWYoIXdpbmRvdy5ub3RlUGFuZWwpIHtcclxuICAgICAgd2luZG93Lm5vdGVQYW5lbCA9IG5ldyBOS0MubW9kdWxlcy5Ob3RlUGFuZWwoKTtcclxuICAgIH1cclxuICB9XHJcbiAgbmV3Tm90ZShub3RlKSB7XHJcbiAgICB0aGlzLmluaXROb3RlUGFuZWwoKTtcclxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgIHdpbmRvdy5ub3RlUGFuZWwub3BlbihkYXRhID0+IHtcclxuICAgICAgICByZXNvbHZlKGRhdGEpO1xyXG4gICAgICB9LCB7XHJcbiAgICAgICAgbm90ZVxyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIH1cclxuICBzaG93Tm90ZVBhbmVsKGlkKSB7XHJcbiAgICB0aGlzLmluaXROb3RlUGFuZWwoKTtcclxuICAgIHdpbmRvdy5ub3RlUGFuZWwub3BlbihkYXRhID0+IHtcclxuICAgIH0sIHtcclxuICAgICAgaWRcclxuICAgIH0pO1xyXG4gIH1cclxufTtcclxuXHJcbiJdfQ==
