NKC.modules.NotePanel = class {
  constructor() {
    const self = this;
    self.app = new Vue({
      el: "#moduleNotePanel",
      data: {
        uid: NKC.configs.uid,
        disableNoteContent: false,
        show: false,
        edit: false,
        submitting: false,
        // 新添加的笔记内容
        content: "",
        // 显示笔记
        note: "",
          /* note的数据结构
          {
            _id: Number,
            type,
            targetId,
            notes: [
              {
                toc: Date,
                uid: String,
                user: {
                  username: String,
                  avatar: String,
                  uid: String
                },
                content: String
              }
            ],
          }
          */
      },
      updated() {
        this.resetDom();
      },
      methods: {
        fromNow: NKC.methods.fromNow,
        getUrl: NKC.methods.tools.getUrl,
        visitUrl: NKC.methods.visitUrl,
        setTextareaSize(size) {
          const textarea = this.$el.getElementsByClassName("create-textarea")[0];
          textarea.style.height = size;
        },
        resetTextarea() {
          this.content = "";
          this.setTextareaSize("2.5rem");
        },
        autoResize(e) {
          const textArea = e.target;
          const num = 2.5 * 12;
          textArea.style.height = '2.5rem';
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
              const {type, targetId, node, _id} = note;
              self.app.submitting = true;
              return nkcAPI("/note", "POST", {
                _id,
                type,
                targetId,
                content,
                node
              });
            })
            .then(data => {
              self.app.content = "";
              self.app.resetTextarea();
              self.app.resetDom();
              self.callback(data.note);
              self.app.extendNoteContent(data.note);
              self.app.note = data.note;
              self.app.submitting = false;
              setTimeout(() => {
                self.app.scrollToBottom();
              }, 200)
            })
            .catch(err => {
              sweetError(err);
              self.app.submitting = false;
            });
        },
        modifyNoteContent(n) {
          if(n.edit) {
            n.edit = false;
          } else {
            n.edit = true;
            if(!n._content) n._content = n.content;
          }
        },
        extendNoteContent(note) {
          note.notes.map(n => {
            n.edit = false;
            n._content = "";
          });
        },
        saveNote(n) {
          // 保存编辑
          const {note, uid} = this;
          let url, method, data = {};
          if(n.uid === uid) {
            url = `/note/${note._id}/c/${n._id}`;
            method = "PUT";
            data.content = n._content;
          } else {
            url = `/nkc/note`;
            method = "POST";
            data.type = "modify";
            data.noteId = note._id;
            data.noteContentId = n._id;
            data.content = n._content;
          }
          nkcAPI(url, method, data)
            .then((data) => {
              n.content = n._content;
              n.html = data.noteContentHTML;
              self.app.modifyNoteContent(n);
              Vue.set(note.notes, note.notes.indexOf(n), n);
            })
            .catch(sweetError);
        },
        open(callback, options) {
          new Promise((resolve, reject) => {
            self.app.resetDom();
            self.callback = callback;
            const {id, note} = options;
            if(note) {
              self.app.note = note;
              resolve();
            } else {
              nkcAPI(`/note/${id}`, "GET")
                .then(data => {
                  self.app.extendNoteContent(data.note);
                  self.app.note = data.note;
                  resolve();
                })
                .catch(reject)
            }
          })
            .then(() => {
              this.show = true;
              NKC.methods.initUnfixedPanel();
            })
            .catch(sweetError);
        },
        close() {
          this.show = false;
        },
        resetDom() {
          const dom = this.$el;
          dom.style.height = "auto";
        },
        scrollToBottom() {
          const dom = this.$el.getElementsByClassName("note-panel-notes")[0];
          dom.scrollTop = dom.scrollHeight + 10000;
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
    self.open = self.app.open;
    self.close = self.app.close;
    self.isOpen = () => {
      return !!this.app.show;
    }
  }
};
