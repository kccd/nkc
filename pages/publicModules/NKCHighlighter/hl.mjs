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

NKC.modules.NKCHL = class {
  constructor(options) {
    const self = this;
    const {el, type, id, notes = [], excludedElementClass = []} = options;
    self.type = type;
    self.id = id;

    self.rootElement = document.getElementById(el);

    body.addEventListener("click", () => {
      self.removeBtn();
    });
    const hl = new NKCHighlighter({
      rootElementId: el,
      excludedElementClass: [
        "article-img-body",
        "article-attachment",
        "article-audio",
        "article-video-body"
      ].concat(excludedElementClass)
    });
    self.hl = hl;
    hl
      .on(hl.eventNames.select, data => {
      const {position, range} = data;
      self.sleep(200)
        .then(() => {
          const btn = self.createBtn(position);
          btn.onclick = () => {
            let nodes = hl.getNodes(range);
            const content = hl.getNodesContent(nodes);
            self.newNote({
              id: "",
              content,
              targetId: self.id,
              type: "post",
              notes: [],
              nodes,
            })
              .then(note => {
                hl.createSource(note._id, note.nodes);
              })
              .catch(sweetError)
          }
        })
        .catch(sweetError)
      })
      .on(hl.eventNames.create, source => {
        hl.addClass(source, "post-node-mark");
      })
      .on(hl.eventNames.click, function(source) {
        self.showNotePanel(source.id);
      })
      .on(hl.eventNames.hover, function(source) {
        hl.addClass(source, "post-node-hover");
      })
      .on(hl.eventNames.hoverOut, function(source) {
        hl.removeClass(source, "post-node-hover");
      });
    hl.restoreSources(notes);
  }
  createBtn(position) {
    this.removeBtn();
    const btn = document.createElement("span");
    btn.classList.add("nkc-hl-btn");
    btn.innerText = "添加笔记";
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
    const self = this;
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
      console.log(data);
    }, {
      id
    });
  }
};
const data = NKC.methods.getDataById("threadForumsId");
const nkchl = [];

data.notes.map(n => {
  const {pid, notes} = n;
  notes.map(note => note.id = note._id);
  nkchl.push(new NKC.modules.NKCHL({
    el: `post-content-${pid}`,
    type: "post",
    id: pid,
    notes: notes
  }));
});
