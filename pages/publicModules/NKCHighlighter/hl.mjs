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

NKC.modules.NKCHL = class {
  constructor(options) {
    const self = this;
    const {type, targetId, notes = []} = options;
    self.type = type;
    self.id = targetId;

    const el = `${type}-content-${targetId}`;
    self.rootElement = document.getElementById(el);
    window.addEventListener("mouseup", () => {
      setTimeout(() => {
        self.removeBtn();
      }, 50)
    }, true);
    const hl = new NKCHighlighter({
      rootElementId: el,
      clownClass: [
        "MathJax_CHTML", // 公式
        "MathJax"
      ],
      clownAttr: {
        "data-tag": "nkcsource"
      },
      clownTagName: [
        "code",
        "svg",
        "pre",
        "video",
        "audio",
        "source",
        "table",
        "style",
        "script"
      ]
    });
    self.hl = hl;
    hl
      .on(hl.eventNames.select, data => {
        if(!NKC.methods.getLoginStatus()) {
          return;
        }
        // if(window.notePanel && window.notePanel.isOpen()) return;
        let {range} = data;
        self.sleep(200)
          .then(() => {
            const offset = self.hl.getStartNodeOffset(range);
            if(!offset) return;
            const btn = self.createBtn2(offset);
            // const btn = self.createBtn(position);
            btn.onclick = () => {
              // 重新获取range
              // 避免dom变化导致range对象未更新的问题
              // range = hl.getRange();
              let node = hl.getNodes(range);
              const content = hl.getNodesContent(node);
              if($(window).width() < 768) {
                NKC.methods.visitUrl(`/note?content=${content}&targetId=${self.id}&type=post&offset=${node.offset}&length=${node.length}`, true);
              } else {
                self.newNote({
                  id: "",
                  content,
                  targetId: self.id,
                  type: "post",
                  notes: [],
                  node,
                })
                  .then(note => {
                    hl.createSource(note._id, note.node);
                  })
                  .catch(sweetError)
              }
            }
          })
          .catch(sweetError)
      })
      .on(hl.eventNames.create, source => {
        // hl.addClass(source, "post-node-mark");
      })
      .on(hl.eventNames.click, function(source) {
        if(NKC.methods.getLoginStatus()) {
          if($(window).width() >= 768) {
            // if(window.notePanel && window.notePanel.isOpen()) return;
            self.showNotePanel(source.id);
          } else {
            NKC.methods.visitUrl(`/note/${source.id}`, true);
          }
        } else {
          NKC.methods.toLogin("login");
        }
      })
      .on(hl.eventNames.hover, function(source) {
        hl.addClass(source, "post-node-hover");
      })
      .on(hl.eventNames.hoverOut, function(source) {
        hl.removeClass(source, "post-node-hover");
      });
    hl.restoreSources(notes);
  }
  createBtn2(offset) {
    this.removeBtn();
    const {top, left} = offset;
    const span = $("<span><span>添加笔记</span></span>");
    span.addClass("nkc-hl-btn");
    if($(window).width() >= 768) {
      span.css({
        top: top - 2.6 * 12 + "px",
        left: left - 1.8 * 12 + "px"
      });
    } else {
      span.css({
        top: top - $(document).scrollTop() - 3+ "px"
      });
    }
    $(body).append(span);
    return span[0];
  }
  createBtn(position) {
    this.removeBtn();
    const btn = document.createElement("span");
    btn.classList.add("nkc-hl-btn");
    btn.innerText = "记笔记";
    const rootJQ = $(this.rootElement);
    const {top, left} = rootJQ.offset();
    const scrollTop = $(window).scrollTop();
    const width = rootJQ.width();
    let btnTop = position.y - top + scrollTop;
    let btnLeft = position.x - left;
    if(btnLeft + 5*12 > left + width) btnLeft = left + width - 5*12;
    btn.style.top = btnTop + "px";
    btn.style.left = btnLeft + "px";
    this.rootElement.appendChild(btn);
    return btn;
  }
  removeBtn() {
    $(".nkc-hl-btn").remove();
  }
  sleep(t) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, t)
    });
  }
  initNotePanel() {
    if(!window.notePanel) {
      window.notePanel = new NKC.modules.NotePanel();
    }
  }
  newNote(note) {
    this.initNotePanel();
    return new Promise((resolve, reject) => {
      window.notePanel.open(data => {
        resolve(data);
      }, {
        note
      });
    });
  }
  showNotePanel(id) {
    this.initNotePanel();
    window.notePanel.open(data => {
    }, {
      id
    });
  }
};

