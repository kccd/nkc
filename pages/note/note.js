const data = NKC.methods.getDataById("data");
data.note.notes.map(note => {
  note.edit = false;
  note.options = false;
});
const app = new Vue({
  el: "#note",
  data: {
    uid: NKC.configs.uid,
    note: data.note,
    submitting: false,
    content: ""
  },
  mounted() {
    document.body.addEventListener("click", (e) => {
      if(e.target.classList.contains("note-options-icon")) return;
      app.note.notes.map(note => note.options = false);
    });
  },
  methods: {
    visitUrl: NKC.methods.visitUrl,
    getUrl: NKC.methods.tools.getUrl,
    fromNow: NKC.methods.fromNow,
    openOptions(nc) {
      app.note.notes.map(note => note.options = false);
      nc.options = !nc.options;
    },
    resetTextarea(nc) {
      let textArea;
      if(!nc) {
        textArea = this.$refs.newNote;
      } else {
        textArea = this.$refs[nc._id][0];
      }
      if(!textArea) return;
      const rem = 5;
      const num = rem * 12;
      textArea.style.height = rem + 'rem';
      if(num < textArea.scrollHeight) {
        textArea.style.height = textArea.scrollHeight + 'px';
      }
    },
    saveNewNote() {
      // 创建新的
      const {content, note} = this;
      Promise.resolve()
        .then(() => {
          if(!content) throw "请输入笔记内容";
          const {type, targetId, _id, node} = note;
          app.submitting = true;
          return nkcAPI("/note", "POST", {
            _id,
            type,
            targetId,
            node,
            content
          });
        })
        .then(data => {
          app.content = "";
          /*if(!app.note._id) {
            window.location.href = `/note/${data.note._id}`;
          }*/
          data.note.notes.map(note => {
            note.options = false;
            note.edit = false;
          });
          app.note = data.note;
          app.submitting = false;
          setTimeout(() => {
            app.resetTextarea();
          }, 50)
        })
        .catch(err => {
          app.submitting = false;
          sweetError(err);
        });
    },
    saveNote(n) {
      // 保存编辑
      const {note, uid} = this;
      let url, method, data = {};
      if(n.uid === uid) {
        url = `/note/${note._id}/c/${n._id}`;
        method = "PUT";
        data.content = n.content;
      } else {
        url = `/nkc/note`;
        method = "POST";
        data.type = "modify";
        data.noteId = note._id;
        data.noteContentId = n._id;
        data.content = n.content;
      }
      nkcAPI(url, method, data)
        .then((data) => {
          n.html = data.noteContentHTML;
          app.modifyNoteContent(n);
          Vue.set(note.notes, note.notes.indexOf(n), n);
        })
        .catch(sweetError);
    },
    modifyNoteContent(nc) {
      nc.edit = !nc.edit;
      if(nc.edit) {
        setTimeout(() => {
          app.resetTextarea(nc);
        }, 50);
      }
    },
    deleteNoteContent(n, type) {
      const {note} = this;
      let url, method, data = {};
      if(type === "delete") {
        url = `/note/${note._id}/c/${n._id}`;
        method = "DELETE";
      } else {
        method = "POST";
        url = `/nkc/note`;
        if(n.disabled) {
          data.type = "cancelDisable";
        } else {
          data.type = "disable";
        }
        data.noteId = note._id;
        data.noteContentId = n._id;
      }
      sweetQuestion("确定要执行此操作？")
        .then(() => {
          return nkcAPI(url, method, data);
        })
        .then(function() {
          if(type === "delete") {
            n.deleted = true;
          } else {
            n.disabled = !n.disabled;
          }
          sweetSuccess("操作成功");
        })
        .catch(sweetError)
    }
  }
});

window.app = app;
