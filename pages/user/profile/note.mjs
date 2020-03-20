const data = NKC.methods.getDataById("subUsersId");
const noteApp = new Vue({
  el: "#note",
  data: {
    threads: data.threads,
    timeout: null
  },
  methods: {
    getUrl: NKC.methods.tools.getUrl,
    fromNow: NKC.methods.fromNow,
    modifyNote(nc) {
      nc.edit = !nc.edit;
      if(nc.edit) {
        setTimeout(() => {
          noteApp.textareaAutoResize(nc);
        }, 50)
      }
    },
    saveNewNote(note) {
      const {_id, newContent, targetId, type} = note;
      Promise.resolve()
        .then(() => {
          if(!newContent) throw "请输入笔记内容";
          return nkcAPI("/note", "POST", {
            _id,
            type,
            targetId,
            content: newContent
          });
        })
        .then(data => {
          note.notes.push(data.noteContent);
          note.newContent = "";
          noteApp.addNote(note);
          noteApp.textareaAutoResize(note, "note");
        })
        .catch(sweetError);
    },
    addNote(note) {
      note.edit = !note.edit;
    },
    deleteNote(note, nc) {
      sweetQuestion("确定要执行删除操作？")
        .then(() => {
          const {noteId, _id} = nc;
          return nkcAPI(`/note/${noteId}/c/${_id}`, "DELETE");
        })
        .then(() => {
          const index = note.notes.indexOf(nc);
          if(index !== -1) note.notes.splice(index, 1);
        })
        .catch(sweetError);
    },
    saveContent(nc) {
      const {content, noteId, _id} = nc;
      nkcAPI(`/note/${noteId}/c/${_id}`, "PATCH", {
        content
      })
        .then(data => {
          nc.html = data.noteContentHTML;
          noteApp.resetTextarea(nc);
        })
        .catch(sweetError);
    },
    getTextarea(nc, t = "") {
      return this.$refs[t+nc._id][0];
    },
    resetTextarea(nc, t) {
      nc.edit = false;
      this.textareaAutoResize(nc, t);
    },
    textareaAutoResize(nc, t) {
      const textArea = this.getTextarea(nc, t);
      const num = 4 * 12;
      if(num < textArea.scrollHeight) {
        textArea.style.height = textArea.scrollHeight + 'px';
      } else {
        textArea.style.height = '4rem';
      }
      /*clearTimeout(this.timeout);
      this.timeout = setTimeout(() => {
        const textArea = this.getTextarea(nc, t);
        const num = 4 * 12;
        if(num < textArea.scrollHeight) {
          textArea.style.height = textArea.scrollHeight + 'px';
        } else {
          textArea.style.height = '4rem';
        }
      }, 100);*/
    }
  }
});