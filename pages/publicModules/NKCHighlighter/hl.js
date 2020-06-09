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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9fYnJvd3Nlci1wYWNrQDYuMS4wQGJyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInBhZ2VzL3B1YmxpY01vZHVsZXMvTktDSGlnaGxpZ2h0ZXIvaGwubWpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7QUNBQTs7Ozs7Ozs7Ozs7OztBQWNBLEdBQUcsQ0FBQyxPQUFKLENBQVksS0FBWjtBQUNFLGtCQUFZLE9BQVosRUFBcUI7QUFBQTs7QUFDbkIsUUFBTSxJQUFJLEdBQUcsSUFBYjtBQURtQixRQUVaLElBRlksR0FFa0IsT0FGbEIsQ0FFWixJQUZZO0FBQUEsUUFFTixRQUZNLEdBRWtCLE9BRmxCLENBRU4sUUFGTTtBQUFBLHlCQUVrQixPQUZsQixDQUVJLEtBRko7QUFBQSxRQUVJLEtBRkosK0JBRVksRUFGWjtBQUduQixJQUFBLElBQUksQ0FBQyxJQUFMLEdBQVksSUFBWjtBQUNBLElBQUEsSUFBSSxDQUFDLEVBQUwsR0FBVSxRQUFWO0FBRUEsUUFBTSxFQUFFLGFBQU0sSUFBTixzQkFBc0IsUUFBdEIsQ0FBUjtBQUNBLElBQUEsSUFBSSxDQUFDLFdBQUwsR0FBbUIsUUFBUSxDQUFDLGNBQVQsQ0FBd0IsRUFBeEIsQ0FBbkI7QUFDQSxJQUFBLE1BQU0sQ0FBQyxnQkFBUCxDQUF3QixTQUF4QixFQUFtQyxZQUFNO0FBQ3ZDLE1BQUEsVUFBVSxDQUFDLFlBQU07QUFDZixRQUFBLElBQUksQ0FBQyxTQUFMO0FBQ0QsT0FGUyxFQUVQLEVBRk8sQ0FBVjtBQUdELEtBSkQsRUFJRyxJQUpIO0FBS0EsUUFBTSxFQUFFLEdBQUcsSUFBSSxjQUFKLENBQW1CO0FBQzVCLE1BQUEsYUFBYSxFQUFFLEVBRGE7QUFFNUIsTUFBQSxVQUFVLEVBQUUsQ0FDVixlQURVLEVBQ087QUFDakIsZUFGVSxDQUZnQjtBQU01QixNQUFBLFNBQVMsRUFBRTtBQUNULG9CQUFZO0FBREg7QUFHWDs7Ozs7Ozs7Ozs7O0FBVDRCLEtBQW5CLENB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SUg7QUFBQTtBQUFBLG9DQStJa0I7QUFDZCxVQUFHLENBQUMsTUFBTSxDQUFDLFNBQVgsRUFBc0I7QUFDcEIsUUFBQSxNQUFNLENBQUMsU0FBUCxHQUFtQixJQUFJLEdBQUcsQ0FBQyxPQUFKLENBQVksU0FBaEIsRUFBbkI7QUFDRDtBQUNGO0FBbkpIO0FBQUE7QUFBQSw0QkFvSlUsSUFwSlYsRUFvSmdCO0FBQ1osV0FBSyxhQUFMO0FBQ0EsYUFBTyxJQUFJLE9BQUosQ0FBWSxVQUFDLE9BQUQsRUFBVSxNQUFWLEVBQXFCO0FBQ3RDLFFBQUEsTUFBTSxDQUFDLFNBQVAsQ0FBaUIsSUFBakIsQ0FBc0IsVUFBQSxJQUFJLEVBQUk7QUFDNUIsVUFBQSxPQUFPLENBQUMsSUFBRCxDQUFQO0FBQ0QsU0FGRCxFQUVHO0FBQ0QsVUFBQSxJQUFJLEVBQUo7QUFEQyxTQUZIO0FBS0QsT0FOTSxDQUFQO0FBT0Q7QUE3Skg7QUFBQTtBQUFBLGtDQThKZ0IsRUE5SmhCLEVBOEpvQjtBQUNoQixXQUFLLGFBQUw7QUFDQSxNQUFBLE1BQU0sQ0FBQyxTQUFQLENBQWlCLElBQWpCLENBQXNCLFVBQUEsSUFBSSxFQUFJLENBQzdCLENBREQsRUFDRztBQUNELFFBQUEsRUFBRSxFQUFGO0FBREMsT0FESDtBQUlEO0FBcEtIOztBQUFBO0FBQUEiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCIvKlxyXG4qIOe7n+iuoeWtl+aVsOaXtumcgOimgeaOkumZpOS7peS4i2Rvbee7k+aehO+8jOS4u+imgeaYr+WqkuS9k+aWh+S7tmRvbeOAglxyXG4gIOatpOexu2RvbeWcqOa4suafk+eahOaXtuWAmeWPr+iDveS8muS4uuWFtua3u+WKoOi+heWKqeaWh+Wtl++8jOWmguaenOS4jeaOkumZpO+8jOW9k+i+heWKqeaWh+Wtl+WPkeeUn+WPmOWKqO+8jOi/meWwhuS8muW9seWTjeW9k+WJjeW3suWIm+W7uueahOaJgOacieaJueazqOOAglxyXG4gIGRpdi5hcnRpY2xlLWltZy1ib2R5IOWbvueJh1xyXG4gIGRpdi5hcnRpY2xlLWF0dGFjaG1lbnQg6ZmE5Lu2XHJcbiAgZGl2LmFydGljbGUtYXVkaW8g6Z+z6aKRXHJcbiAgZGl2LmFydGljbGUtdmlkZW8tYm9keSDop4bpopFcclxuICAgICAgICAgICAgICAgICAgICAgICAgIOS7o+eggVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAg5YWs5byPXHJcbipcclxuKlxyXG4qXHJcbiogKi9cclxuXHJcbk5LQy5tb2R1bGVzLk5LQ0hMID0gY2xhc3Mge1xyXG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcclxuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xyXG4gICAgY29uc3Qge3R5cGUsIHRhcmdldElkLCBub3RlcyA9IFtdfSA9IG9wdGlvbnM7XHJcbiAgICBzZWxmLnR5cGUgPSB0eXBlO1xyXG4gICAgc2VsZi5pZCA9IHRhcmdldElkO1xyXG5cclxuICAgIGNvbnN0IGVsID0gYCR7dHlwZX0tY29udGVudC0ke3RhcmdldElkfWA7XHJcbiAgICBzZWxmLnJvb3RFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoZWwpO1xyXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZXVwXCIsICgpID0+IHtcclxuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgc2VsZi5yZW1vdmVCdG4oKTtcclxuICAgICAgfSwgNTApXHJcbiAgICB9LCB0cnVlKTtcclxuICAgIGNvbnN0IGhsID0gbmV3IE5LQ0hpZ2hsaWdodGVyKHtcclxuICAgICAgcm9vdEVsZW1lbnRJZDogZWwsXHJcbiAgICAgIGNsb3duQ2xhc3M6IFtcclxuICAgICAgICBcIk1hdGhKYXhfQ0hUTUxcIiwgLy8g5YWs5byPXHJcbiAgICAgICAgXCJNYXRoSmF4XCJcclxuICAgICAgXSxcclxuICAgICAgY2xvd25BdHRyOiB7XHJcbiAgICAgICAgXCJkYXRhLXRhZ1wiOiBcIm5rY3NvdXJjZVwiXHJcbiAgICAgIH0sXHJcbiAgICAgIC8qY2xvd25UYWdOYW1lOiBbXHJcbiAgICAgICAgXCJjb2RlXCIsXHJcbiAgICAgICAgXCJzdmdcIixcclxuICAgICAgICBcInByZVwiLFxyXG4gICAgICAgIFwidmlkZW9cIixcclxuICAgICAgICBcImF1ZGlvXCIsXHJcbiAgICAgICAgXCJzb3VyY2VcIixcclxuICAgICAgICBcInRhYmxlXCIsXHJcbiAgICAgICAgXCJzdHlsZVwiLFxyXG4gICAgICAgIFwic2NyaXB0XCJcclxuICAgICAgXSovXHJcbiAgICB9KTtcclxuICAgIHNlbGYuaGwgPSBobDtcclxuICAgIGhsXHJcbiAgICAgIC5vbihobC5ldmVudE5hbWVzLnNlbGVjdCwgZGF0YSA9PiB7XHJcbiAgICAgICAgaWYoIU5LQy5tZXRob2RzLmdldExvZ2luU3RhdHVzKCkpIHtcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gaWYod2luZG93Lm5vdGVQYW5lbCAmJiB3aW5kb3cubm90ZVBhbmVsLmlzT3BlbigpKSByZXR1cm47XHJcbiAgICAgICAgbGV0IHtyYW5nZX0gPSBkYXRhO1xyXG4gICAgICAgIHNlbGYuc2xlZXAoMjAwKVxyXG4gICAgICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBvZmZzZXQgPSBzZWxmLmhsLmdldFN0YXJ0Tm9kZU9mZnNldChyYW5nZSk7XHJcbiAgICAgICAgICAgIGlmKCFvZmZzZXQpIHJldHVybjtcclxuICAgICAgICAgICAgY29uc3QgYnRuID0gc2VsZi5jcmVhdGVCdG4yKG9mZnNldCk7XHJcbiAgICAgICAgICAgIC8vIGNvbnN0IGJ0biA9IHNlbGYuY3JlYXRlQnRuKHBvc2l0aW9uKTtcclxuICAgICAgICAgICAgYnRuLm9uY2xpY2sgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgLy8g6YeN5paw6I635Y+WcmFuZ2VcclxuICAgICAgICAgICAgICAvLyDpgb/lhY1kb23lj5jljJblr7zoh7RyYW5nZeWvueixoeacquabtOaWsOeahOmXrumimFxyXG4gICAgICAgICAgICAgIC8vIHJhbmdlID0gaGwuZ2V0UmFuZ2UoKTtcclxuICAgICAgICAgICAgICBsZXQgbm9kZSA9IGhsLmdldE5vZGVzKHJhbmdlKTtcclxuICAgICAgICAgICAgICBjb25zdCBjb250ZW50ID0gaGwuZ2V0Tm9kZXNDb250ZW50KG5vZGUpO1xyXG4gICAgICAgICAgICAgIGlmKCQod2luZG93KS53aWR0aCgpIDwgNzY4KSB7XHJcbiAgICAgICAgICAgICAgICBOS0MubWV0aG9kcy52aXNpdFVybChgL25vdGU/Y29udGVudD0ke2NvbnRlbnR9JnRhcmdldElkPSR7c2VsZi5pZH0mdHlwZT1wb3N0Jm9mZnNldD0ke25vZGUub2Zmc2V0fSZsZW5ndGg9JHtub2RlLmxlbmd0aH1gLCB0cnVlKTtcclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgc2VsZi5uZXdOb3RlKHtcclxuICAgICAgICAgICAgICAgICAgaWQ6IFwiXCIsXHJcbiAgICAgICAgICAgICAgICAgIGNvbnRlbnQsXHJcbiAgICAgICAgICAgICAgICAgIHRhcmdldElkOiBzZWxmLmlkLFxyXG4gICAgICAgICAgICAgICAgICB0eXBlOiBcInBvc3RcIixcclxuICAgICAgICAgICAgICAgICAgbm90ZXM6IFtdLFxyXG4gICAgICAgICAgICAgICAgICBub2RlLFxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgLnRoZW4obm90ZSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaGwuY3JlYXRlU291cmNlKG5vdGUuX2lkLCBub3RlLm5vZGUpO1xyXG4gICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAuY2F0Y2goc3dlZXRFcnJvcilcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0pXHJcbiAgICAgICAgICAuY2F0Y2goc3dlZXRFcnJvcilcclxuICAgICAgfSlcclxuICAgICAgLm9uKGhsLmV2ZW50TmFtZXMuY3JlYXRlLCBzb3VyY2UgPT4ge1xyXG4gICAgICAgIC8vIGhsLmFkZENsYXNzKHNvdXJjZSwgXCJwb3N0LW5vZGUtbWFya1wiKTtcclxuICAgICAgfSlcclxuICAgICAgLm9uKGhsLmV2ZW50TmFtZXMuY2xpY2ssIGZ1bmN0aW9uKHNvdXJjZSkge1xyXG4gICAgICAgIGlmKE5LQy5tZXRob2RzLmdldExvZ2luU3RhdHVzKCkpIHtcclxuICAgICAgICAgIGlmKCQod2luZG93KS53aWR0aCgpID49IDc2OCkge1xyXG4gICAgICAgICAgICAvLyBpZih3aW5kb3cubm90ZVBhbmVsICYmIHdpbmRvdy5ub3RlUGFuZWwuaXNPcGVuKCkpIHJldHVybjtcclxuICAgICAgICAgICAgc2VsZi5zaG93Tm90ZVBhbmVsKHNvdXJjZS5pZCk7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBOS0MubWV0aG9kcy52aXNpdFVybChgL25vdGUvJHtzb3VyY2UuaWR9YCwgdHJ1ZSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIE5LQy5tZXRob2RzLnRvTG9naW4oXCJsb2dpblwiKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pXHJcbiAgICAgIC5vbihobC5ldmVudE5hbWVzLmhvdmVyLCBmdW5jdGlvbihzb3VyY2UpIHtcclxuICAgICAgICBobC5hZGRDbGFzcyhzb3VyY2UsIFwicG9zdC1ub2RlLWhvdmVyXCIpO1xyXG4gICAgICB9KVxyXG4gICAgICAub24oaGwuZXZlbnROYW1lcy5ob3Zlck91dCwgZnVuY3Rpb24oc291cmNlKSB7XHJcbiAgICAgICAgaGwucmVtb3ZlQ2xhc3Moc291cmNlLCBcInBvc3Qtbm9kZS1ob3ZlclwiKTtcclxuICAgICAgfSk7XHJcbiAgICBobC5yZXN0b3JlU291cmNlcyhub3Rlcyk7XHJcbiAgfVxyXG4gIGNyZWF0ZUJ0bjIob2Zmc2V0KSB7XHJcbiAgICB0aGlzLnJlbW92ZUJ0bigpO1xyXG4gICAgY29uc3Qge3RvcCwgbGVmdH0gPSBvZmZzZXQ7XHJcbiAgICBjb25zdCBzcGFuID0gJChcIjxzcGFuPjxzcGFuPua3u+WKoOeslOiusDwvc3Bhbj48L3NwYW4+XCIpO1xyXG4gICAgc3Bhbi5hZGRDbGFzcyhcIm5rYy1obC1idG5cIik7XHJcbiAgICBpZigkKHdpbmRvdykud2lkdGgoKSA+PSA3NjgpIHtcclxuICAgICAgc3Bhbi5jc3Moe1xyXG4gICAgICAgIHRvcDogdG9wIC0gMi42ICogMTIgKyBcInB4XCIsXHJcbiAgICAgICAgbGVmdDogbGVmdCAtIDEuOCAqIDEyICsgXCJweFwiXHJcbiAgICAgIH0pO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgc3Bhbi5jc3Moe1xyXG4gICAgICAgIHRvcDogdG9wIC0gJChkb2N1bWVudCkuc2Nyb2xsVG9wKCkgLSAzKyBcInB4XCJcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICAkKGJvZHkpLmFwcGVuZChzcGFuKTtcclxuICAgIHJldHVybiBzcGFuWzBdO1xyXG4gIH1cclxuICBjcmVhdGVCdG4ocG9zaXRpb24pIHtcclxuICAgIHRoaXMucmVtb3ZlQnRuKCk7XHJcbiAgICBjb25zdCBidG4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3BhblwiKTtcclxuICAgIGJ0bi5jbGFzc0xpc3QuYWRkKFwibmtjLWhsLWJ0blwiKTtcclxuICAgIGJ0bi5pbm5lclRleHQgPSBcIuiusOeslOiusFwiO1xyXG4gICAgY29uc3Qgcm9vdEpRID0gJCh0aGlzLnJvb3RFbGVtZW50KTtcclxuICAgIGNvbnN0IHt0b3AsIGxlZnR9ID0gcm9vdEpRLm9mZnNldCgpO1xyXG4gICAgY29uc3Qgc2Nyb2xsVG9wID0gJCh3aW5kb3cpLnNjcm9sbFRvcCgpO1xyXG4gICAgY29uc3Qgd2lkdGggPSByb290SlEud2lkdGgoKTtcclxuICAgIGxldCBidG5Ub3AgPSBwb3NpdGlvbi55IC0gdG9wICsgc2Nyb2xsVG9wO1xyXG4gICAgbGV0IGJ0bkxlZnQgPSBwb3NpdGlvbi54IC0gbGVmdDtcclxuICAgIGlmKGJ0bkxlZnQgKyA1KjEyID4gbGVmdCArIHdpZHRoKSBidG5MZWZ0ID0gbGVmdCArIHdpZHRoIC0gNSoxMjtcclxuICAgIGJ0bi5zdHlsZS50b3AgPSBidG5Ub3AgKyBcInB4XCI7XHJcbiAgICBidG4uc3R5bGUubGVmdCA9IGJ0bkxlZnQgKyBcInB4XCI7XHJcbiAgICB0aGlzLnJvb3RFbGVtZW50LmFwcGVuZENoaWxkKGJ0bik7XHJcbiAgICByZXR1cm4gYnRuO1xyXG4gIH1cclxuICByZW1vdmVCdG4oKSB7XHJcbiAgICAkKFwiLm5rYy1obC1idG5cIikucmVtb3ZlKCk7XHJcbiAgfVxyXG4gIHNsZWVwKHQpIHtcclxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xyXG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICByZXNvbHZlKCk7XHJcbiAgICAgIH0sIHQpXHJcbiAgICB9KTtcclxuICB9XHJcbiAgaW5pdE5vdGVQYW5lbCgpIHtcclxuICAgIGlmKCF3aW5kb3cubm90ZVBhbmVsKSB7XHJcbiAgICAgIHdpbmRvdy5ub3RlUGFuZWwgPSBuZXcgTktDLm1vZHVsZXMuTm90ZVBhbmVsKCk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIG5ld05vdGUobm90ZSkge1xyXG4gICAgdGhpcy5pbml0Tm90ZVBhbmVsKCk7XHJcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICB3aW5kb3cubm90ZVBhbmVsLm9wZW4oZGF0YSA9PiB7XHJcbiAgICAgICAgcmVzb2x2ZShkYXRhKTtcclxuICAgICAgfSwge1xyXG4gICAgICAgIG5vdGVcclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICB9XHJcbiAgc2hvd05vdGVQYW5lbChpZCkge1xyXG4gICAgdGhpcy5pbml0Tm90ZVBhbmVsKCk7XHJcbiAgICB3aW5kb3cubm90ZVBhbmVsLm9wZW4oZGF0YSA9PiB7XHJcbiAgICB9LCB7XHJcbiAgICAgIGlkXHJcbiAgICB9KTtcclxuICB9XHJcbn07XHJcblxyXG4iXX0=
