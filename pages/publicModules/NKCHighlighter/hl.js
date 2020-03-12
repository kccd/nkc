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
    var el = options.el,
        type = options.type,
        id = options.id,
        _options$notes = options.notes,
        notes = _options$notes === void 0 ? [] : _options$notes,
        _options$excludedElem = options.excludedElementClass,
        excludedElementClass = _options$excludedElem === void 0 ? [] : _options$excludedElem;
    self.type = type;
    self.id = id;
    self.rootElement = document.getElementById(el);
    body.addEventListener("click", function () {
      self.removeBtn();
    });
    var hl = new NKCHighlighter({
      rootElementId: el,
      excludedElementClass: ["article-img-body", "article-attachment", "article-audio", "article-video-body"].concat(excludedElementClass)
    });
    self.hl = hl;
    hl.on(hl.eventNames.select, function (data) {
      var position = data.position,
          range = data.range;
      self.sleep(200).then(function () {
        var btn = self.createBtn(position);

        btn.onclick = function () {
          var nodes = hl.getNodes(range);
          var content = hl.getNodesContent(nodes);
          self.newNote({
            id: "",
            content: content,
            targetId: self.id,
            type: "post",
            notes: [],
            nodes: nodes
          }).then(function (note) {
            hl.createSource(note._id, note.nodes);
          })["catch"](sweetError);
        };
      })["catch"](sweetError);
    }).on(hl.eventNames.create, function (source) {
      hl.addClass(source, "post-node-mark");
    }).on(hl.eventNames.click, function (source) {
      self.showNotePanel(source.id);
    }).on(hl.eventNames.hover, function (source) {
      hl.addClass(source, "post-node-hover");
    }).on(hl.eventNames.hoverOut, function (source) {
      hl.removeClass(source, "post-node-hover");
    });
    hl.restoreSources(notes);
  }

  _createClass(_class, [{
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
      var self = this;
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
      window.notePanel.open(function (data) {
        console.log(data);
      }, {
        id: id
      });
    }
  }]);

  return _class;
}();

var data = NKC.methods.getDataById("threadForumsId");
var nkchl = [];
data.notes.map(function (n) {
  var pid = n.pid,
      notes = n.notes;
  notes.map(function (note) {
    return note.id = note._id;
  });
  nkchl.push(new NKC.modules.NKCHL({
    el: "post-content-".concat(pid),
    type: "post",
    id: pid,
    notes: notes
  }));
});

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9fYnJvd3Nlci1wYWNrQDYuMS4wQGJyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInBhZ2VzL3B1YmxpY01vZHVsZXMvTktDSGlnaGxpZ2h0ZXIvaGwubWpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7QUNBQTs7Ozs7Ozs7Ozs7QUFZQSxHQUFHLENBQUMsT0FBSixDQUFZLEtBQVo7QUFBQTtBQUFBO0FBQ0Usa0JBQVksT0FBWixFQUFxQjtBQUFBOztBQUNuQixRQUFNLElBQUksR0FBRyxJQUFiO0FBRG1CLFFBRVosRUFGWSxHQUUyQyxPQUYzQyxDQUVaLEVBRlk7QUFBQSxRQUVSLElBRlEsR0FFMkMsT0FGM0MsQ0FFUixJQUZRO0FBQUEsUUFFRixFQUZFLEdBRTJDLE9BRjNDLENBRUYsRUFGRTtBQUFBLHlCQUUyQyxPQUYzQyxDQUVFLEtBRkY7QUFBQSxRQUVFLEtBRkYsK0JBRVUsRUFGVjtBQUFBLGdDQUUyQyxPQUYzQyxDQUVjLG9CQUZkO0FBQUEsUUFFYyxvQkFGZCxzQ0FFcUMsRUFGckM7QUFHbkIsSUFBQSxJQUFJLENBQUMsSUFBTCxHQUFZLElBQVo7QUFDQSxJQUFBLElBQUksQ0FBQyxFQUFMLEdBQVUsRUFBVjtBQUVBLElBQUEsSUFBSSxDQUFDLFdBQUwsR0FBbUIsUUFBUSxDQUFDLGNBQVQsQ0FBd0IsRUFBeEIsQ0FBbkI7QUFFQSxJQUFBLElBQUksQ0FBQyxnQkFBTCxDQUFzQixPQUF0QixFQUErQixZQUFNO0FBQ25DLE1BQUEsSUFBSSxDQUFDLFNBQUw7QUFDRCxLQUZEO0FBR0EsUUFBTSxFQUFFLEdBQUcsSUFBSSxjQUFKLENBQW1CO0FBQzVCLE1BQUEsYUFBYSxFQUFFLEVBRGE7QUFFNUIsTUFBQSxvQkFBb0IsRUFBRSxDQUNwQixrQkFEb0IsRUFFcEIsb0JBRm9CLEVBR3BCLGVBSG9CLEVBSXBCLG9CQUpvQixFQUtwQixNQUxvQixDQUtiLG9CQUxhO0FBRk0sS0FBbkIsQ0FBWDtBQVNBLElB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QUEsT0FBTyxDQUFDLElBQUQsQ0FBUDtBQUNELFNBRkQsRUFFRztBQUNELFVBQUEsSUFBSSxFQUFKO0FBREMsU0FGSDtBQUtELE9BTk0sQ0FBUDtBQU9EO0FBdkdIO0FBQUE7QUFBQSxrQ0F3R2dCLEVBeEdoQixFQXdHb0I7QUFDaEIsV0FBSyxhQUFMO0FBQ0EsTUFBQSxNQUFNLENBQUMsU0FBUCxDQUFpQixJQUFqQixDQUFzQixVQUFBLElBQUksRUFBSTtBQUM1QixRQUFBLE9BQU8sQ0FBQyxHQUFSLENBQVksSUFBWjtBQUNELE9BRkQsRUFFRztBQUNELFFBQUEsRUFBRSxFQUFGO0FBREMsT0FGSDtBQUtEO0FBL0dIOztBQUFBO0FBQUE7O0FBaUhBLElBQU0sSUFBSSxHQUFHLEdBQUcsQ0FBQyxPQUFKLENBQVksV0FBWixDQUF3QixnQkFBeEIsQ0FBYjtBQUNBLElBQU0sS0FBSyxHQUFHLEVBQWQ7QUFFQSxJQUFJLENBQUMsS0FBTCxDQUFXLEdBQVgsQ0FBZSxVQUFBLENBQUMsRUFBSTtBQUFBLE1BQ1gsR0FEVyxHQUNHLENBREgsQ0FDWCxHQURXO0FBQUEsTUFDTixLQURNLEdBQ0csQ0FESCxDQUNOLEtBRE07QUFFbEIsRUFBQSxLQUFLLENBQUMsR0FBTixDQUFVLFVBQUEsSUFBSTtBQUFBLFdBQUksSUFBSSxDQUFDLEVBQUwsR0FBVSxJQUFJLENBQUMsR0FBbkI7QUFBQSxHQUFkO0FBQ0EsRUFBQSxLQUFLLENBQUMsSUFBTixDQUFXLElBQUksR0FBRyxDQUFDLE9BQUosQ0FBWSxLQUFoQixDQUFzQjtBQUMvQixJQUFBLEVBQUUseUJBQWtCLEdBQWxCLENBRDZCO0FBRS9CLElBQUEsSUFBSSxFQUFFLE1BRnlCO0FBRy9CLElBQUEsRUFBRSxFQUFFLEdBSDJCO0FBSS9CLElBQUEsS0FBSyxFQUFFO0FBSndCLEdBQXRCLENBQVg7QUFNRCxDQVREIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiLypcclxuKiDnu5/orqHlrZfmlbDml7bpnIDopoHmjpLpmaTku6XkuItkb23nu5PmnoTvvIzkuLvopoHmmK/lqpLkvZPmlofku7Zkb23jgIJcclxuICDmraTnsbtkb23lnKjmuLLmn5PnmoTml7blgJnlj6/og73kvJrkuLrlhbbmt7vliqDovoXliqnmloflrZfvvIzlpoLmnpzkuI3mjpLpmaTvvIzlvZPovoXliqnmloflrZflj5HnlJ/lj5jliqjvvIzov5nlsIbkvJrlvbHlk43lvZPliY3lt7LliJvlu7rnmoTmiYDmnInmibnms6jjgIJcclxuICBkaXYuYXJ0aWNsZS1pbWctYm9keSDlm77niYdcclxuICBkaXYuYXJ0aWNsZS1hdHRhY2htZW50IOmZhOS7tlxyXG4gIGRpdi5hcnRpY2xlLWF1ZGlvIOmfs+mikVxyXG4gIGRpdi5hcnRpY2xlLXZpZGVvLWJvZHkg6KeG6aKRXHJcbipcclxuKlxyXG4qXHJcbiogKi9cclxuXHJcbk5LQy5tb2R1bGVzLk5LQ0hMID0gY2xhc3Mge1xyXG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcclxuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xyXG4gICAgY29uc3Qge2VsLCB0eXBlLCBpZCwgbm90ZXMgPSBbXSwgZXhjbHVkZWRFbGVtZW50Q2xhc3MgPSBbXX0gPSBvcHRpb25zO1xyXG4gICAgc2VsZi50eXBlID0gdHlwZTtcclxuICAgIHNlbGYuaWQgPSBpZDtcclxuXHJcbiAgICBzZWxmLnJvb3RFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoZWwpO1xyXG5cclxuICAgIGJvZHkuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcclxuICAgICAgc2VsZi5yZW1vdmVCdG4oKTtcclxuICAgIH0pO1xyXG4gICAgY29uc3QgaGwgPSBuZXcgTktDSGlnaGxpZ2h0ZXIoe1xyXG4gICAgICByb290RWxlbWVudElkOiBlbCxcclxuICAgICAgZXhjbHVkZWRFbGVtZW50Q2xhc3M6IFtcclxuICAgICAgICBcImFydGljbGUtaW1nLWJvZHlcIixcclxuICAgICAgICBcImFydGljbGUtYXR0YWNobWVudFwiLFxyXG4gICAgICAgIFwiYXJ0aWNsZS1hdWRpb1wiLFxyXG4gICAgICAgIFwiYXJ0aWNsZS12aWRlby1ib2R5XCJcclxuICAgICAgXS5jb25jYXQoZXhjbHVkZWRFbGVtZW50Q2xhc3MpXHJcbiAgICB9KTtcclxuICAgIHNlbGYuaGwgPSBobDtcclxuICAgIGhsXHJcbiAgICAgIC5vbihobC5ldmVudE5hbWVzLnNlbGVjdCwgZGF0YSA9PiB7XHJcbiAgICAgIGNvbnN0IHtwb3NpdGlvbiwgcmFuZ2V9ID0gZGF0YTtcclxuICAgICAgc2VsZi5zbGVlcCgyMDApXHJcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgY29uc3QgYnRuID0gc2VsZi5jcmVhdGVCdG4ocG9zaXRpb24pO1xyXG4gICAgICAgICAgYnRuLm9uY2xpY2sgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgIGxldCBub2RlcyA9IGhsLmdldE5vZGVzKHJhbmdlKTtcclxuICAgICAgICAgICAgY29uc3QgY29udGVudCA9IGhsLmdldE5vZGVzQ29udGVudChub2Rlcyk7XHJcbiAgICAgICAgICAgIHNlbGYubmV3Tm90ZSh7XHJcbiAgICAgICAgICAgICAgaWQ6IFwiXCIsXHJcbiAgICAgICAgICAgICAgY29udGVudCxcclxuICAgICAgICAgICAgICB0YXJnZXRJZDogc2VsZi5pZCxcclxuICAgICAgICAgICAgICB0eXBlOiBcInBvc3RcIixcclxuICAgICAgICAgICAgICBub3RlczogW10sXHJcbiAgICAgICAgICAgICAgbm9kZXMsXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgLnRoZW4obm90ZSA9PiB7XHJcbiAgICAgICAgICAgICAgICBobC5jcmVhdGVTb3VyY2Uobm90ZS5faWQsIG5vdGUubm9kZXMpO1xyXG4gICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgLmNhdGNoKHN3ZWV0RXJyb3IpXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSlcclxuICAgICAgICAuY2F0Y2goc3dlZXRFcnJvcilcclxuICAgICAgfSlcclxuICAgICAgLm9uKGhsLmV2ZW50TmFtZXMuY3JlYXRlLCBzb3VyY2UgPT4ge1xyXG4gICAgICAgIGhsLmFkZENsYXNzKHNvdXJjZSwgXCJwb3N0LW5vZGUtbWFya1wiKTtcclxuICAgICAgfSlcclxuICAgICAgLm9uKGhsLmV2ZW50TmFtZXMuY2xpY2ssIGZ1bmN0aW9uKHNvdXJjZSkge1xyXG4gICAgICAgIHNlbGYuc2hvd05vdGVQYW5lbChzb3VyY2UuaWQpO1xyXG4gICAgICB9KVxyXG4gICAgICAub24oaGwuZXZlbnROYW1lcy5ob3ZlciwgZnVuY3Rpb24oc291cmNlKSB7XHJcbiAgICAgICAgaGwuYWRkQ2xhc3Moc291cmNlLCBcInBvc3Qtbm9kZS1ob3ZlclwiKTtcclxuICAgICAgfSlcclxuICAgICAgLm9uKGhsLmV2ZW50TmFtZXMuaG92ZXJPdXQsIGZ1bmN0aW9uKHNvdXJjZSkge1xyXG4gICAgICAgIGhsLnJlbW92ZUNsYXNzKHNvdXJjZSwgXCJwb3N0LW5vZGUtaG92ZXJcIik7XHJcbiAgICAgIH0pO1xyXG4gICAgaGwucmVzdG9yZVNvdXJjZXMobm90ZXMpO1xyXG4gIH1cclxuICBjcmVhdGVCdG4ocG9zaXRpb24pIHtcclxuICAgIHRoaXMucmVtb3ZlQnRuKCk7XHJcbiAgICBjb25zdCBidG4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3BhblwiKTtcclxuICAgIGJ0bi5jbGFzc0xpc3QuYWRkKFwibmtjLWhsLWJ0blwiKTtcclxuICAgIGJ0bi5pbm5lclRleHQgPSBcIua3u+WKoOeslOiusFwiO1xyXG4gICAgY29uc3Qgcm9vdEpRID0gJCh0aGlzLnJvb3RFbGVtZW50KTtcclxuICAgIGNvbnN0IHt0b3AsIGxlZnR9ID0gcm9vdEpRLm9mZnNldCgpO1xyXG4gICAgY29uc3Qgc2Nyb2xsVG9wID0gJCh3aW5kb3cpLnNjcm9sbFRvcCgpO1xyXG4gICAgY29uc3Qgd2lkdGggPSByb290SlEud2lkdGgoKTtcclxuICAgIGxldCBidG5Ub3AgPSBwb3NpdGlvbi55IC0gdG9wICsgc2Nyb2xsVG9wO1xyXG4gICAgbGV0IGJ0bkxlZnQgPSBwb3NpdGlvbi54IC0gbGVmdDtcclxuICAgIGlmKGJ0bkxlZnQgKyA1KjEyID4gbGVmdCArIHdpZHRoKSBidG5MZWZ0ID0gbGVmdCArIHdpZHRoIC0gNSoxMjtcclxuICAgIGJ0bi5zdHlsZS50b3AgPSBidG5Ub3AgKyBcInB4XCI7XHJcbiAgICBidG4uc3R5bGUubGVmdCA9IGJ0bkxlZnQgKyBcInB4XCI7XHJcbiAgICB0aGlzLnJvb3RFbGVtZW50LmFwcGVuZENoaWxkKGJ0bik7XHJcbiAgICByZXR1cm4gYnRuO1xyXG4gIH1cclxuICByZW1vdmVCdG4oKSB7XHJcbiAgICAkKFwiLm5rYy1obC1idG5cIikucmVtb3ZlKCk7XHJcbiAgfVxyXG4gIHNsZWVwKHQpIHtcclxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xyXG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICByZXNvbHZlKCk7XHJcbiAgICAgIH0sIHQpXHJcbiAgICB9KTtcclxuICB9XHJcbiAgaW5pdE5vdGVQYW5lbCgpIHtcclxuICAgIGlmKCF3aW5kb3cubm90ZVBhbmVsKSB7XHJcbiAgICAgIHdpbmRvdy5ub3RlUGFuZWwgPSBuZXcgTktDLm1vZHVsZXMuTm90ZVBhbmVsKCk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIG5ld05vdGUobm90ZSkge1xyXG4gICAgdGhpcy5pbml0Tm90ZVBhbmVsKCk7XHJcbiAgICBjb25zdCBzZWxmID0gdGhpcztcclxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgIHdpbmRvdy5ub3RlUGFuZWwub3BlbihkYXRhID0+IHtcclxuICAgICAgICByZXNvbHZlKGRhdGEpO1xyXG4gICAgICB9LCB7XHJcbiAgICAgICAgbm90ZVxyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIH1cclxuICBzaG93Tm90ZVBhbmVsKGlkKSB7XHJcbiAgICB0aGlzLmluaXROb3RlUGFuZWwoKTtcclxuICAgIHdpbmRvdy5ub3RlUGFuZWwub3BlbihkYXRhID0+IHtcclxuICAgICAgY29uc29sZS5sb2coZGF0YSk7XHJcbiAgICB9LCB7XHJcbiAgICAgIGlkXHJcbiAgICB9KTtcclxuICB9XHJcbn07XHJcbmNvbnN0IGRhdGEgPSBOS0MubWV0aG9kcy5nZXREYXRhQnlJZChcInRocmVhZEZvcnVtc0lkXCIpO1xyXG5jb25zdCBua2NobCA9IFtdO1xyXG5cclxuZGF0YS5ub3Rlcy5tYXAobiA9PiB7XHJcbiAgY29uc3Qge3BpZCwgbm90ZXN9ID0gbjtcclxuICBub3Rlcy5tYXAobm90ZSA9PiBub3RlLmlkID0gbm90ZS5faWQpO1xyXG4gIG5rY2hsLnB1c2gobmV3IE5LQy5tb2R1bGVzLk5LQ0hMKHtcclxuICAgIGVsOiBgcG9zdC1jb250ZW50LSR7cGlkfWAsXHJcbiAgICB0eXBlOiBcInBvc3RcIixcclxuICAgIGlkOiBwaWQsXHJcbiAgICBub3Rlczogbm90ZXNcclxuICB9KSk7XHJcbn0pO1xyXG4iXX0=
