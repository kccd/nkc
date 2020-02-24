import Highlighter from 'web-highlighter';

window.noteApp = new Vue({
  el: "#modulePostNotes",
  data: {
    notes: [],
    hl: ""
  },
  mounted() {
    this.initHighLighter();
  },
  computed: {
    notesObj() {
      const obj = {};
      this.notes.map(n => {
        obj[n.id] = n;
      });
      return obj;
    },
    notesOrder() {
      const {notes} = this;

    }
  },
  methods: {
    initHighLighter() {
      this.hl = new Highlighter({
        exceptSelectors: ["code", "pre"]
      });
      this.hl.on(Highlighter.event.CREATE, this.onCreate);
      this.hl.on(Highlighter.event.CLICK, this.onClick);
      this.hl.on(Highlighter.event.HOVER, this.onHover);
      this.hl.on(Highlighter.event.HOVER_OUT, this.onHoverOut);
      this.hl.run();
    },
    resetPanel() {
      const notes_ = this.notes;
      this.notes.map(n => n.active = false);
    },
    onCreate(data) {
      console.log("创建：");
      console.log(data);
      const self = this;
      const id = data.sources[0].id;
      let dom = this.hl.getDoms(id)[0];
      dom = $(dom);
      const btn = $(`<i data-post-node-id='${id}'>添加批注</i>`);
      dom.append(btn);
      btn.on("click", function() {
        
      });
      /* this.resetPanel();
      data.sources.map(node => {
        const {id} = node;
        self.notes.push({
          id,
          active: true,
          node,
          comment: ""
        });
      });
      console.log(self.notes); */
    },
    removeNode(n) {
      const {id} = n;
      const {hl, notes} = this;
      const index = notes.indexOf(n);
      hl.remove(id);
      notes.splice(index, 1);
    },
    editNode(n) {
      this.resetPanel();
      n.active = true;
    },
    onClick({id}) {
      console.log("点击：");
      console.log(id);
      const {notesObj, notes} = this;
      this.resetPanel();
      notesObj[id].active = true;
    },
    onHover({id}) {
      this.hl.addClass('highlight-wrap-hover', id);  
    },
    onHoverOut({id}) {
      this.hl.removeClass('highlight-wrap-hover', id);
    }
  }
})

// 2. 从后端获取高亮信息，还原至网页
// getRemoteData().then(s => highlighter.fromStore(s.startMeta, s.endMeta, s.id, s.text));
